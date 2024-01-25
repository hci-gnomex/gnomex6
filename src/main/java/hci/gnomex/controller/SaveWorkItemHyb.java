package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.Hybridization;
import hci.gnomex.model.Step;
import hci.gnomex.model.WorkItem;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import hci.gnomex.utility.WorkItemHybParser;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;
import org.jdom.output.XMLOutputter;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.io.StringReader;
import java.util.Iterator;



public class SaveWorkItemHyb extends GNomExCommand implements Serializable {
  
 
  
  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(SaveWorkItemHyb.class);
  
  private String                       workItemXMLString;
  private Document                     workItemDoc;
  private WorkItemHybParser            parser;
  
  
  
  public void validate() {
  }
  
  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
    
    
    if (request.getParameter("workItemXMLString") != null && !request.getParameter("workItemXMLString").equals("")) {
      workItemXMLString = "<WorkItemList>" + request.getParameter("workItemXMLString") + "</WorkItemList>";

      StringReader reader = new StringReader(workItemXMLString);
      try {
        SAXBuilder sax = new SAXBuilder();
        workItemDoc = sax.build(reader);
        parser = new WorkItemHybParser(workItemDoc);
      } catch (JDOMException je ) {
        this.addInvalidField( "WorkItemXMLString", "Invalid work item xml");
        this.errorDetails = Util.GNLOG(LOG,"Cannot parse workItemXMLString", je);
      }
    }
    
    
    

  }

  public Command execute() throws RollBackCommandException {
    
    if (workItemXMLString != null) {
      try {
        Session sess = HibernateSession.currentSession(this.getUsername());
        
        if (this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_WORKFLOW)) {
          parser.parse(sess);
          

          for (Iterator i = parser.getWorkItems().iterator(); i.hasNext();) {
            WorkItem workItem = (WorkItem) i.next();
            Hybridization hyb = (Hybridization) parser.getHyb(workItem.getIdWorkItem());
            
            // No further processing required for On Hold or In Progress work items
            if (workItem.getStatus() == null || workItem.getStatus().equals(Constants.STATUS_ON_HOLD) || workItem.getStatus().equals(Constants.STATUS_IN_PROGRESS)) {
              continue;
            } 

            // If hyb is done (or bypassed), create work items for extraction.
            if (hyb.getHybDate() != null ||
                (hyb.getHybBypassed() != null && hyb.getHybBypassed().equals("Y"))) {

              WorkItem wi = new WorkItem();
              wi.setIdRequest(workItem.getIdRequest());
              wi.setIdCoreFacility(workItem.getIdCoreFacility());
              wi.setCodeStepNext(Step.SCAN_EXTRACTION_STEP);
              wi.setHybridization(hyb);
              wi.setCreateDate(new java.sql.Date(System.currentTimeMillis()));

              sess.save(wi);
            }

            // If hyb is done or failed or bypassed, delete the work item
            if (hyb.getHybDate() != null ||
                (hyb.getHybFailed() != null && hyb.getHybFailed().equalsIgnoreCase("Y")) ||
                (hyb.getHybBypassed() != null && hyb.getHybBypassed().equalsIgnoreCase("Y"))) {

              // Delete hyb work item
              sess.delete(workItem);
            }
          }
          
          sess.flush();
          
          parser.resetIsDirty();

          XMLOutputter out = new org.jdom.output.XMLOutputter();
          this.xmlResult = out.outputString(workItemDoc);
          
          setResponsePage(this.SUCCESS_JSP); 
        } else {
          this.addInvalidField("Insufficient permissions", "Insufficient permission to manage workflow");
          setResponsePage(this.ERROR_JSP);
        }

        
      }catch (Exception e){
        this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in SaveWorkflowHyb ", e);
        throw new RollBackCommandException(e.getMessage());
          
      }
      
    } else {
      this.xmlResult = "<SUCCESS/>";
      setResponsePage(this.SUCCESS_JSP);
    }
    
    return this;
  }
  

  
  
  

}
