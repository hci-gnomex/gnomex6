package hci.gnomex.controller;

import hci.gnomex.utility.HttpServletWrappedRequest;
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



public class SaveWorkItemSolexaStock extends GNomExCommand implements Serializable {
  
 
  
  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(SaveWorkItemSolexaStock.class);
  
  private String                       workItemXMLString;
  private Document                     workItemDoc;
  private WorkItemSolexaStockParser    parser;
  
  private String                       appURL;
  
  private String                       serverName;
  
  private Map                          confirmedRequestMap = new HashMap();
  
  private DictionaryHelper             dictionaryHelper = null;
  
  public void validate() {
  }
  
  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
    
    
    if (request.getParameter("workItemXMLString") != null && !request.getParameter("workItemXMLString").equals("")) {
      workItemXMLString = "<WorkItemList>" + request.getParameter("workItemXMLString") + "</WorkItemList>";
      
      StringReader reader = new StringReader(workItemXMLString);
      try {
        SAXBuilder sax = new SAXBuilder();
        workItemDoc = sax.build(reader);
        parser = new WorkItemSolexaStockParser(workItemDoc);
      } catch (JDOMException je ) {
        this.addInvalidField( "WorkItemXMLString", "Invalid work item xml");
        this.errorDetails = Util.GNLOG(LOG,"Cannot parse workItemXMLString", je);
      }
    }
    
    try {
      appURL = this.getLaunchAppURL(request);      
    } catch (Exception e) {
      LOG.warn("Cannot get launch app URL in SaveWorkItemSolexaStock", e);
    }
    
    serverName = request.getServerName();
    
  }

  public Command execute() throws RollBackCommandException {
    
    if (workItemXMLString != null) {
      try {
        Session sess = HibernateSession.currentSession(this.getUsername());
        
        if (this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_WORKFLOW)) {
          parser.parse(sess);
          
          for(Iterator i = parser.getWorkItems().iterator(); i.hasNext();) {
            WorkItem workItem = (WorkItem)i.next();
            Sample sample = (Sample)parser.getSample(workItem.getIdWorkItem());
            
            // No further processing required for On Hold or In Progress work items
            if (workItem.getStatus() == null || workItem.getStatus().equals(Constants.STATUS_ON_HOLD) || workItem.getStatus().equals(Constants.STATUS_IN_PROGRESS)) {
              continue;
            } 
            
            // If Solexa sample stock prep is done or bypassed for this sample, create work items for each sequence lane of
            // sample for work item (Solexa assemble flow cell).
            if (sample.getSeqPrepStockDate() != null || 
                (sample.getSeqPrepStockBypassed() != null && sample.getSeqPrepStockBypassed().equalsIgnoreCase("Y"))) {

              Request request = (Request)sess.load(Request.class, workItem.getIdRequest());

              for(Iterator i1 = request.getSequenceLanes().iterator(); i1.hasNext();) {
                SequenceLane lane = (SequenceLane)i1.next();
                
                if (lane.getIdSample().equals(sample.getIdSample())) {
                  WorkItem wi = new WorkItem();
                  wi.setIdRequest(sample.getIdRequest());
                  wi.setIdCoreFacility(sample.getRequest().getIdCoreFacility());
                  wi.setCodeStepNext(Step.ILLSEQ_CLUSTER_GEN);
                  wi.setSequenceLane(lane);
                  wi.setCreateDate(new java.sql.Date(System.currentTimeMillis()));
                  sess.save(wi);
                }
              }

            }
            
            
            // If Solexa sample prep is done or failed for this sample, delete the work item
            if (sample.getSeqPrepStockDate() != null || 
              (sample.getSeqPrepStockFailed() != null && sample.getSeqPrepStockFailed().equalsIgnoreCase("Y")) ||
              (sample.getSeqPrepStockBypassed() != null && sample.getSeqPrepStockBypassed().equalsIgnoreCase("Y"))) {
            
              // Delete  work item
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
        this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in SaveWorkItemSolexaPrepStock ", e);
        throw new RollBackCommandException(e.getMessage());
          
      }
      
    } else {
      this.xmlResult = "<SUCCESS/>";
      setResponsePage(this.SUCCESS_JSP);
    }
    
    return this;
  }
  
  

}
