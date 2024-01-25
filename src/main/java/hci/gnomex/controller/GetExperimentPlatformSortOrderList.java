package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.RequestCategory;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.query.Query;
import org.jdom.Document;
import org.jdom.Element;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.List;
public class GetExperimentPlatformSortOrderList extends GNomExCommand implements Serializable {

  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(GetExperimentPlatformSortOrderList.class);

  private Integer idCoreFacility = null;

  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    if (request.getParameter("idCoreFacility") != null && !request.getParameter("idCoreFacility").equals("")) {
      try {
        idCoreFacility = Integer.valueOf(request.getParameter("idCoreFacility"));
      } catch(NumberFormatException ex) {
        LOG.error("Invalid idCoreFacility for GetExperimentPlatformSortOrderList: " + request.getParameter("idCoreFacility"), ex);
        this.addInvalidField("Missing parameters", "idCoreFacility required");
      }
    } else {
      this.addInvalidField("Missing parameters", "idCoreFacility required");
    }


    if (isValid()) {
      setResponsePage(this.SUCCESS_JSP);
    } else {
      setResponsePage(this.ERROR_JSP);
    }

  }

  public Command execute() throws RollBackCommandException {
    try {
      Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());
      String queryString = "select rc from RequestCategory rc where idCoreFacility=:id AND isActive='Y'";
      Query query = sess.createQuery(queryString);
      query.setParameter("id", idCoreFacility);
      List requestCategories = query.list();
      Document doc = new Document(new Element("ExperimentPlatformSortOrderList"));

      for (RequestCategory cat : (List<RequestCategory>)requestCategories) {
        Element node = new Element("RequestCategory");
        node.setAttribute("codeRequestCategory", cat.getCodeRequestCategory());
        node.setAttribute("requestCategory", cat.getRequestCategory());
        node.setAttribute("sortOrder", cat.getSortOrder() == null ? "0" : cat.getSortOrder().toString());
        doc.getRootElement().addContent(node);
      }

      org.jdom.output.XMLOutputter out = new org.jdom.output.XMLOutputter();
      this.xmlResult = out.outputString(doc);

    } catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetExperimentPlatformSortOrderList ", e);
      throw new RollBackCommandException(e.getMessage());
    }

    if (isValid()) {
      setResponsePage(this.SUCCESS_JSP);
    } else {
      setResponsePage(this.ERROR_JSP);
    }

    return this;
  }
}
