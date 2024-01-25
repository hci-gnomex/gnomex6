package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.gnomex.model.SlideProduct;
import hci.gnomex.model.SlideProductFilter;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.HashMap;

public class GetSlideProduct extends GNomExCommand implements Serializable {

  private static Logger LOG = Logger.getLogger(GetSlideProduct.class);

  private SlideProductFilter filter;

  public Command execute() throws RollBackCommandException {

    try {
      Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());

      StringBuffer buf = filter.getQuery(this.getSecAdvisor());
      LOG.info("Query for GetSlideProduct: "+buf.toString());
      SlideProduct sp = (SlideProduct) sess.createQuery(buf.toString()).uniqueResult();

      if (sp != null) {
        this.xmlResult = sp.toXMLString(null, DetailObject.DATE_OUTPUT_SQL);
        setResponsePage(this.SUCCESS_JSP);
      } else {
        this.addInvalidField("Slide Product Not Found", "No slide product for the given ID.");
        setResponsePage(this.ERROR_JSP);
      }
    } catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception occured in GetSlideProduct", e);
      throw new RollBackCommandException();
    }

    return this;
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    filter = new SlideProductFilter();
    HashMap errors = this.loadDetailObject(request, filter);
    this.addInvalidFields(errors);

  }

  public void validate() {

  }

}
