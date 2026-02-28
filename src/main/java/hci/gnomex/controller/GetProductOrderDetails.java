package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.ProductOrderFilter;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.servlet.http.HttpSession;
import java.sql.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
public class GetProductOrderDetails extends GNomExCommand {
  private static Logger LOG = Logger.getLogger(GetProductOrderDetails.class);

  private ProductOrderFilter productOrderFilter;


  public void loadCommand(HttpServletWrappedRequest request, HttpSession sess) {

    if(request.getParameter("idProductOrder") == null || request.getParameter("idProductOrder").equals("")) {
      this.addInvalidField("Missing idProductOrder", "You must provide an idProductOrder");
    }
    productOrderFilter = new ProductOrderFilter(this.getSecAdvisor());
    HashMap errors = this.loadDetailObject(request, productOrderFilter);
    this.addInvalidFields(errors);

  }

  @Override
  public Command execute() throws RollBackCommandException {
    if(this.isValid()) {

      try {
        Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());

        Document doc = new Document(new Element("ProductOrderDetails"));

        StringBuffer buf = productOrderFilter.getProductOrderDetailsQuery();
        LOG.info("Query for GetProductOrderDetails: " + buf.toString());

        List details = sess.createQuery(buf.toString()).list();

        for(Iterator i = details.iterator(); i.hasNext();) {
          Object row[] = (Object []) i.next();
          String productName = (String) row[0];
          String submitter = Util.formatUserDisplayName((String)row[1], (String)row[2], this.getUserPreferences());
          String submitDate = ((Date) row[3]).toString();
          String quoteReceivedDate = row[4] != null ? ((Date) row[4]).toString() : "";
          String quoteNumber = row[5] != null ? (String)row[5] : "";
          String qty = row[6] != null ? ((Integer)row[6]).toString() : "";

          Element detailNode = new Element("Product");
          detailNode.setAttribute("productName", productName);
          detailNode.setAttribute("submitter", submitter);
          detailNode.setAttribute("submitDate", submitDate);
          detailNode.setAttribute("quoteReceivedDate", quoteReceivedDate);
          detailNode.setAttribute("quoteNumber", quoteNumber);
          detailNode.setAttribute("qty", qty);

          doc.getRootElement().addContent(detailNode);

        }

        XMLOutputter out = new org.jdom.output.XMLOutputter();
        this.xmlResult = out.outputString(doc);

        setResponsePage(this.SUCCESS_JSP);


      } catch(Exception e) {
        this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetProductOrderList ", e);

        throw new RollBackCommandException(e.getMessage());
      }
    }

    else {
      setResponsePage(this.ERROR_JSP);
    }

    return this;
  }

  @Override
  public void validate() {
    // TODO Auto-generated method stub

  }

}
