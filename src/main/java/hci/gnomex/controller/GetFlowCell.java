package hci.gnomex.controller;


import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.gnomex.model.FlowCell;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.servlet.http.HttpSession;
import java.io.Serializable;

public class GetFlowCell extends GNomExCommand implements Serializable {

  private static Logger LOG = Logger.getLogger(GetFlowCell.class);

  // Parameter:
  private Integer idFlowCell;

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
    if (request.getParameter("id") != null && !request.getParameter("id").equals("")) {
      idFlowCell = Integer.valueOf(request.getParameter("id"));
    } else {
      this.addInvalidField("idFlowCell", "idFlowCell is required");
    }
    this.validate();
  }

  public Command execute() throws RollBackCommandException {
    try {
      if (this.getSecurityAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_WORKFLOW)) {

        Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());
        FlowCell fc = null;

        if (idFlowCell == null || idFlowCell.intValue() == 0) {
          fc = new FlowCell();
        } else {
          fc = (FlowCell)sess.get(FlowCell.class, idFlowCell);
        }

        Document doc = new Document(new Element("FlowCell"));

        Element fcNode = fc.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();
        doc.getRootElement().addContent(fcNode);

        XMLOutputter out = new org.jdom.output.XMLOutputter();
        this.xmlResult = out.outputString(doc);

      } else {
        this.addInvalidField("Insufficient permissions", "Insufficient permission to manage workflow.");
        setResponsePage(this.ERROR_JSP);
      }

    }catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetFlowCell ", e);

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
}
