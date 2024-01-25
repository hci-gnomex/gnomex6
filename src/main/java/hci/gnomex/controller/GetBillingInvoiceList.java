package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.BillingItemFilter;
import hci.gnomex.model.BillingPeriod;
import hci.gnomex.model.Invoice;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.DictionaryHelper;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.TreeMap;

public class GetBillingInvoiceList extends GNomExCommand implements Serializable {

  private static Logger LOG = Logger.getLogger(GetBillingInvoiceList.class);

  private BillingItemFilter billingItemFilter;

  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    billingItemFilter = new BillingItemFilter(this.getSecAdvisor());
    HashMap errors = this.loadDetailObject(request, billingItemFilter);
    this.addInvalidFields(errors);

    if (!this.billingItemFilter.hasCriteria()) {
      this.addInvalidField("criteria", "Please select a billing period, group, or billing account; or enter a request number");
    }

    if (!this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_BILLING)) {
      this.addInvalidField("permission", "Insufficient permission to manage billing items");
    }
  }

  public Command execute() throws RollBackCommandException {

    try {



    Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());

    DictionaryHelper dh = DictionaryHelper.getInstance(sess);

    HashMap statusNodeMap = new HashMap();

    if (billingItemFilter.getIdBillingPeriod() != null) {
      BillingPeriod bp = dh.getBillingPeriod(billingItemFilter.getIdBillingPeriod());
      if (bp == null) {
        throw new RollBackCommandException("Unable to find billing period " + billingItemFilter.getIdBillingPeriod());
      }
      billingItemFilter.setBillingPeriod(bp);
    }

    TreeMap<Integer, Invoice> invoiceMap = new TreeMap<Integer, Invoice>();

    StringBuffer buf = billingItemFilter.getBillingInvoiceQuery();
    LOG.info("Query: " + buf.toString());
    List invoices = sess.createQuery(buf.toString()).list();
    for(Iterator i = invoices.iterator(); i.hasNext();) {
      Invoice invoice = (Invoice)i.next();
      invoiceMap.put(invoice.getIdInvoice(), invoice);
    }

    buf = billingItemFilter.getDiskUsageInvoiceQuery();
    LOG.info("Query: " + buf.toString());
    invoices = sess.createQuery(buf.toString()).list();
    for(Iterator i = invoices.iterator(); i.hasNext();) {
      Invoice invoice = (Invoice)i.next();
      invoiceMap.put(invoice.getIdInvoice(), invoice);
    }

    Document doc = new Document(new Element("BillingInvoiceList"));
    for(Integer key: invoiceMap.keySet()) {
      Invoice invoice = invoiceMap.get(key);
      Element invoiceNode = invoice.toXMLDocument(null, this.DATE_OUTPUT_SQL).getRootElement();
      doc.getRootElement().addContent(invoiceNode);
    }

    XMLOutputter out = new org.jdom.output.XMLOutputter();
    this.xmlResult = out.outputString(doc);

    setResponsePage(this.SUCCESS_JSP);
    }catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetBillingInvoiceList ", e);

      throw new RollBackCommandException(e.getMessage());
    }

    return this;
  }

}
