package hci.gnomex.controller;

import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.Hybridization;
import hci.gnomex.model.Request;
import hci.gnomex.model.WorkItem;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;
import org.jdom.output.XMLOutputter;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.io.StringReader;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;



public class SaveWorkItemExtraction extends GNomExCommand implements Serializable {
  
 
  
  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(SaveWorkItemExtraction.class);
  
  private String                       workItemXMLString;
  private Document                     workItemDoc;
  private WorkItemExtractionParser     parser;
  
  private DictionaryHelper             dictionaryHelper;
  
  private String                       launchAppURL;
  private String                       appURL;
  
  private String                       serverName;
  
  private Map                          confirmedRequestMap = new HashMap();
  
  
  
  public void validate() {
  }
  
  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
    
    
    if (request.getParameter("workItemXMLString") != null && !request.getParameter("workItemXMLString").equals("")) {
      workItemXMLString = "<WorkItemList>" + request.getParameter("workItemXMLString") + "</WorkItemList>";
      
      StringReader reader = new StringReader(workItemXMLString);
      try {
        SAXBuilder sax = new SAXBuilder();
        workItemDoc = sax.build(reader);
        parser = new WorkItemExtractionParser(workItemDoc);
      } catch (JDOMException je ) {
        this.addInvalidField( "WorkItemXMLString", "Invalid work item xml");
        this.errorDetails = Util.GNLOG(LOG,"Cannot parse workItemXMLString", je);
      }
    }
    
    try {
      launchAppURL = this.getLaunchAppURL(request);      
      appURL = this.getAppURL(request);      
    } catch (Exception e) {
      LOG.warn("Cannot get launch app URL in SaveWorkItemExtraction", e);
    }
    
    serverName = request.getServerName();
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

            // If extraction is done or bypassed or failed, delete the work item
            if (hyb.getExtractionDate() != null ||
                (hyb.getExtractionFailed() != null && hyb.getExtractionFailed().equals("Y")) ||
                (hyb.getExtractionBypassed() != null && hyb.getExtractionBypassed().equals("Y"))) {

              // Delete work item
              sess.delete(workItem);
            }
            
            // Check to see if all of the hybs have completed extraction.  If so, set the
            // complete date on the request.
            Request request = (Request)sess.load(Request.class, workItem.getIdRequest());

            // Set the completed date on the request
            request.completeRequestIfFinished(sess);
            
            
            // Send a confirmation email
            if (request.isConsideredFinished() && !confirmedRequestMap.containsKey(request.getNumber())) {
              if (request.getAppUser() != null && 
                  request.getAppUser().getEmail() != null &&
                  !request.getAppUser().getEmail().equals("")) {
                try {
                  EmailHelper.sendConfirmationEmail(sess, request, this.getSecAdvisor(), launchAppURL, appURL, serverName);                  
                } catch (Exception e) {
                  LOG.error("Unable to send confirmation email notifying submitter that request " + request.getNumber() +
                  " is complete. " + e.toString(), e);
                  
                }
                confirmedRequestMap.put(request.getNumber(), request.getNumber());
              }
              else {
                LOG.error("Unable to send confirmation email notifying submitter that request " + request.getNumber() +
                          " is complete.  Request submitter or request submitter email is blank.");
              }
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
        this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in SaveWorkflowExtraction ", e);
        throw new RollBackCommandException(e.getMessage());
          
      }

      
    } else {
      this.xmlResult = "<SUCCESS/>";
      setResponsePage(this.SUCCESS_JSP);
    }
    
    return this;
  }
  
  

  

  

}
