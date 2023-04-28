package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.*;
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



public class SaveWorkItemSolexaRun extends GNomExCommand implements Serializable {
  
 
  
  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(SaveWorkItemSolexaRun.class);
  
  private String                       workItemXMLString;
  private Document                     workItemDoc;
  private WorkItemSolexaRunParser      parser;
  
  private DictionaryHelper             dictionaryHelper;
  
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
        parser = new WorkItemSolexaRunParser(workItemDoc);
      } catch (JDOMException je ) {
        this.addInvalidField( "WorkItemXMLString", "Invalid work item xml");
        this.errorDetails = Util.GNLOG(LOG,"Cannot parse workItemXMLString", je);
      }
    }
    
    try {
      appURL = this.getLaunchAppURL(request);      
    } catch (Exception e) {
      LOG.warn("Cannot get launch app URL in SaveWorkItemSolexaRun", e);
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
            FlowCellChannel channel = (FlowCellChannel) parser.getFlowCellChannel(workItem.getIdWorkItem());
            
            // No further processing required for On Hold or In Progress work items
            if (workItem.getStatus() == null || workItem.getStatus().equals(Constants.STATUS_ON_HOLD) || workItem.getStatus().equals(Constants.STATUS_IN_PROGRESS)) {
              continue;
            } 

            // If first cycle failed or last cycle is done or failed, delete the work item
            // and create a new work list item for the data pipeline
            if (channel.getLastCycleDate() != null ||
                (channel.getLastCycleFailed() != null && channel.getLastCycleFailed().equals("Y"))) {

              // Delete work item
              sess.delete(workItem);
              
              
              // Create work item for data pipeline
              if (channel.getLastCycleDate() != null) {
                WorkItem wi = new WorkItem();
                String codeStepNext = "none";
                if(workItem.getCodeStepNext().equals(Step.SEQ_RUN)) {
                  codeStepNext = Step.SEQ_DATA_PIPELINE;
                } 
		else if (workItem.getCodeStepNext().equals(Step.HISEQ_RUN)) {
                  codeStepNext = Step.HISEQ_DATA_PIPELINE;
                } else if (workItem.getCodeStepNext().equals(Step.MISEQ_RUN)) {
                  codeStepNext = Step.MISEQ_DATA_PIPELINE;
                } else if (workItem.getCodeStepNext().equals(Step.NOSEQ_RUN)) {
                  codeStepNext = Step.NOSEQ_DATA_PIPELINE;
                } else if (workItem.getCodeStepNext().equals(Step.ILLSEQ_RUN)) {
                  codeStepNext = Step.ILLSEQ_DATA_PIPELINE;
                }
                wi.setIdCoreFacility(workItem.getIdCoreFacility());
                wi.setCodeStepNext(codeStepNext);                 
                wi.setCreateDate(new  java.sql.Date(System.currentTimeMillis()));
                wi.setFlowCellChannel(channel);
                
                sess.save(wi);
                
              }
            }
            
            // Check to see if all of the sequence lanes for each request have been completed.
            if (channel.getSequenceLanes() != null) {
              for (Iterator i1 = channel.getSequenceLanes().iterator(); i1.hasNext();) {
                SequenceLane lane =(SequenceLane)i1.next();
                
                Request request = (Request)sess.load(Request.class, lane.getIdRequest());

                // Set the completed date on the request
                request.completeRequestIfFinished(sess);
                
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
        this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in SaveWorkItemSolexaRun ", e);
        throw new RollBackCommandException(e.getMessage());
          
      }
      
    } else {
      this.xmlResult = "<SUCCESS/>";
      setResponsePage(this.SUCCESS_JSP);
    }
    
    return this;
  }
  
  

  
 
  

}
