package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.Lab;
import hci.gnomex.model.Price;
import hci.gnomex.model.PriceCriteria;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.query.Query;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.Iterator;
import java.util.List;


public class GetLibPrepApplicationPriceList extends GNomExCommand implements Serializable {

  private static Logger LOG = Logger.getLogger(GetLibPrepApplicationPriceList.class);

  private Integer idLab;
  private String codeRequestCategory;

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    if (request.getParameter("idLab") != null && !request.getParameter("idLab").equals("")) {
      idLab =  Integer.valueOf(request.getParameter("idLab"));
    } else {
      this.addInvalidField("IdLab", "IdLab required");
    }


    if (request.getParameter("codeRequestCategory") != null && !request.getParameter("codeRequestCategory").equals("")) {
      codeRequestCategory =  request.getParameter("codeRequestCategory");
    } else {
      this.addInvalidField("codeRequestCategory", "codeRequestCategory required");
    }

  }

  public Command execute() throws RollBackCommandException {

    try {

      Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());

      Lab lab = (Lab)sess.load(Lab.class, this.idLab);

      String queryString =
          "select p, crit " +
          " from PriceSheet ps " +
          " join ps.requestCategories rc " +
          " join ps.priceCategories pc " +
          " join pc.priceCategory.prices p " +
          " join p.priceCriterias crit " +
          " where rc.codeRequestCategory = :codeRequestCategory " +
          "   and pc.priceCategory.pluginClassName='hci.gnomex.billing.illuminaLibPrepPlugin'";

//  System.out.println ("[GetLibPrepApplicationPriceList] query: " + queryString + " CRC: " + this.codeRequestCategory);
      Query query = sess.createQuery(queryString);
      query.setParameter("codeRequestCategory", this.codeRequestCategory);

      List rows = query.list();

      Document doc = new Document(new Element("IlluminaLibPrepPriceList"));
      for(Iterator i = rows.iterator(); i.hasNext();) {
        Object[] row = (Object[])i.next();
        Price price = (Price)row[0];
        PriceCriteria criteria = (PriceCriteria)row[1];
        Element node = new Element("Price");

        node.setAttribute("codeApplication", toString(criteria.getFilter1()));
        node.setAttribute("price", toString(price.getEffectiveUnitPrice(lab)));

        doc.getRootElement().addContent(node);
      }

      XMLOutputter out = new org.jdom.output.XMLOutputter();
      this.xmlResult = out.outputString(doc);
//      System.out.println ("[GetLibPrepApplicationPriceList] xmlResult: " + this.xmlResult );


      setResponsePage(this.SUCCESS_JSP);

    } catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetLibPrepApplicationPrice ", e);
      throw new RollBackCommandException(e.getMessage());
    }

    return this;
  }

  public void validate() {
    if (isValid()) {
      setResponsePage(this.SUCCESS_JSP);
    } else {
      setResponsePage(this.ERROR_JSP);
    }
  }

  private String toString(Object theValue) {
    if (theValue != null) {
      return theValue.toString();
    }
    return "";
  }

}
