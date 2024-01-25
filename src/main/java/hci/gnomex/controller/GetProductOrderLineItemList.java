package hci.gnomex.controller;

import hci.dictionary.utility.DictionaryManager;
import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.Product;
import hci.gnomex.model.ProductOrder;
import hci.gnomex.model.ProductOrderFilter;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
public class GetProductOrderLineItemList extends GNomExCommand implements Serializable {
  private static Logger LOG = Logger.getLogger(GetProductOrderLineItemList.class);

  private ProductOrderFilter productOrderFilter;

  @Override
  public void loadCommand(HttpServletWrappedRequest request, HttpSession sess) {
    productOrderFilter = new ProductOrderFilter(this.getSecAdvisor());
    HashMap errors = this.loadDetailObject(request, productOrderFilter);
    this.addInvalidFields(errors);

  }

  @Override
  public Command execute() throws RollBackCommandException {

    try {
      if (this.isValid()) {
        Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());

        Document doc = new Document(new Element("LineItems"));

        StringBuffer buf = productOrderFilter.getLineItemQuery();
        LOG.info("Query for GetProductOrderList: " + buf.toString());

        List lineItemRows = sess.createQuery(buf.toString()).list();

        for (Iterator i = lineItemRows.iterator(); i.hasNext();) {
          Object row[] = (Object[]) i.next();

          ProductOrder po = (ProductOrder) row[0];
          Integer qty = (Integer) row[1];
          BigDecimal unitPrice = (BigDecimal) row[2];
          Product product = (Product) row[3];
          Integer idProductLineItem = (Integer) row[4];
          String codeProductOrderStatus = (String) row[5];
          SimpleDateFormat sdf = new SimpleDateFormat("MM-dd-yyyy");
          String submitDate = po.getSubmitDate() != null ? sdf.format(po.getSubmitDate()) : "";

          Element e = new Element("LineItem");
          e.setAttribute("idProductOrder", getNonNullString(po.getIdProductOrder()));
          e.setAttribute("productOrderNumber", po.getProductOrderNumber() != null ? po.getProductOrderNumber() : po.getIdProductOrder().toString());
          e.setAttribute("idProductLineItem", getNonNullString(idProductLineItem));
          e.setAttribute("name", getNonNullString(product.getName()));
          e.setAttribute("qty", getNonNullString(qty));
          e.setAttribute("unitPrice", getNonNullString(unitPrice));
          e.setAttribute("totalPrice", getNonNullString(unitPrice.multiply(new BigDecimal(qty))));
          e.setAttribute("labName", Util.getLabDisplayName(po.getLab(), this.getUserPreferences()));
          e.setAttribute("submitter", Util.getAppUserDisplayName(po.getSubmitter(), this.getUserPreferences()));
          e.setAttribute("status", codeProductOrderStatus != null ? DictionaryManager.getDisplay("hci.gnomex.model.ProductOrderStatus", codeProductOrderStatus) : "");
          e.setAttribute("submitDate", submitDate);

          doc.getRootElement().addContent(e);
        }

        XMLOutputter out = new org.jdom.output.XMLOutputter();
        this.xmlResult = out.outputString(doc);

        setResponsePage(this.SUCCESS_JSP);

      } else {
        setResponsePage(this.ERROR_JSP);
      }

    } catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetProductOrderLineItemList ", e);

      throw new RollBackCommandException(e.getMessage());
    }
    return this;
  }

  @Override
  public void validate() {
    // TODO Auto-generated method stub

  }

}
