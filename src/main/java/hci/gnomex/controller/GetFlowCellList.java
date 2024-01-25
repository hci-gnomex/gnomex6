package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.gnomex.model.FlowCell;
import hci.gnomex.model.FlowCellFilter;
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
import java.util.HashMap;
import java.util.List;

public class GetFlowCellList extends GNomExCommand implements Serializable {

  private static Logger LOG = Logger.getLogger(GetFlowCellList.class);

  private FlowCellFilter   filter;

  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    filter = new FlowCellFilter();
    HashMap errors = this.loadDetailObject(request, filter);
    this.addInvalidFields(errors);

    if (!filter.hasSufficientCriteria(this.getSecAdvisor())) {
        this.addInvalidField("missingFilter", "Please provide an additional filter to limit the results returned.");
    }
  }

  public Command execute() throws RollBackCommandException {

    if (this.getSecurityAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_WORKFLOW)) {
      try {
        Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());

        StringBuffer buf =  filter.getQuery(this.getSecAdvisor());
        List flowCells = (List)sess.createQuery(buf.toString()).list();

        Document doc = new Document(new Element("FlowCellList"));

        for(Object obj : flowCells) {
          Element fcNode = ((FlowCell) obj).toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();
          doc.getRootElement().addContent(fcNode);
        }

        XMLOutputter out = new org.jdom.output.XMLOutputter();
        this.xmlResult = out.outputString(doc);

        setResponsePage(this.SUCCESS_JSP);
      } catch (Exception e) {
        this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetFlowCellList ", e);

        throw new RollBackCommandException(e.getMessage());
      }

      setResponsePage(this.SUCCESS_JSP);
    } else {
      this.addInvalidField("Insufficient permissions", "Insufficient permission to manage workflow.");
      setResponsePage(this.ERROR_JSP);
    }

    return this;
  }
}
