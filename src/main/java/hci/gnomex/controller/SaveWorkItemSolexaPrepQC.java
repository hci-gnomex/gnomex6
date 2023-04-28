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
import java.util.*;

public class SaveWorkItemSolexaPrepQC extends GNomExCommand implements Serializable {



  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(SaveWorkItemSolexaPrepQC.class);

  private String                       workItemXMLString;
  private Document                     workItemDoc;
  private WorkItemSolexaPrepQCParser   parser;

  private String                       appURL;

  private String                       serverName;

  private Map                          confirmedRequestMap = new HashMap();

  private DictionaryHelper             dictionaryHelper = null;

  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {


    if (request.getParameter("workItemXMLString") != null && !request.getParameter("workItemXMLString").equals("")) {
      workItemXMLString = request.getParameter("workItemXMLString");

      StringReader reader = new StringReader(workItemXMLString);
      try {
        SAXBuilder sax = new SAXBuilder();
        workItemDoc = sax.build(reader);
        parser = new WorkItemSolexaPrepQCParser(workItemDoc);
      } catch (JDOMException je ) {
        LOG.error( "Cannot parse workItemXMLString", je );
        this.addInvalidField( "WorkItemXMLString", "Invalid work item xml");
      }
    }

    try {
      appURL = this.getLaunchAppURL(request);
    } catch (Exception e) {
      LOG.warn("Cannot get launch app URL in SaveWorkItemSolexaPrepQC", e);
    }

    serverName = request.getServerName();

  }

  public Command execute() throws RollBackCommandException {

    if (workItemXMLString != null) {
      try {
        Session sess = HibernateSession.currentSession(this.getUsername());
        DictionaryHelper dh = DictionaryHelper.getInstance(sess);
        Map<Integer, BillingItemAutoComplete> autoCompleteMap = new HashMap<Integer, BillingItemAutoComplete>();
        Map<Integer, Set<Sample>> samplesCompletedMap = new HashMap<Integer, Set<Sample>>();

        if (this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_WORKFLOW)) {
          parser.parse(sess);

          for(Iterator i = parser.getWorkItems().iterator(); i.hasNext();) {
            WorkItem workItem = (WorkItem)i.next();
            Sample sample = (Sample)parser.getSample(workItem.getIdWorkItem());

            // No further processing required for On Hold or In Progress work items
            if (workItem.getStatus() == null || workItem.getStatus().equals(Constants.STATUS_ON_HOLD) || workItem.getStatus().equals(Constants.STATUS_IN_PROGRESS)) {
              continue;
            }

            // If Solexa sample prep is done or bypassed for this sample, create work items for Solexa stock prep
            // for the sample
            Request request = (Request)sess.load(Request.class, workItem.getIdRequest());
            if (sample.getSeqPrepDate() != null ||
                (sample.getSeqPrepBypassed() != null && sample.getSeqPrepBypassed().equalsIgnoreCase("Y"))) {
                // Create a cluster gen work item for every unprocessed seq lane of the sample.
                for(Iterator i1 = request.getSequenceLanes().iterator(); i1.hasNext();) {
                  SequenceLane lane = (SequenceLane)i1.next();

                  if (lane.getIdSample().equals(sample.getIdSample()) && lane.getIdFlowCellChannel() == null) {

                    // Make sure this lane isn't already queued up on the cluster gen workflow
                    List otherWorkItems = (List)sess.createQuery("SELECT wi from WorkItem wi join wi.sequenceLane l where wi.codeStepNext = '" + Step.ILLSEQ_CLUSTER_GEN + "' and l.idSequenceLane = " + lane.getIdSequenceLane()).list();
                    if (otherWorkItems.size() == 0) {
                      WorkItem wi = new WorkItem();
                      wi.setIdRequest(sample.getIdRequest());
                      wi.setIdCoreFacility(sample.getRequest().getIdCoreFacility());

                      String codeStepNext = "99";
                      if(workItem.getCodeStepNext().equals(Step.SEQ_PREP_QC)) {
                        codeStepNext = Step.SEQ_CLUSTER_GEN;
                      } else if (workItem.getCodeStepNext().equals(Step.HISEQ_PREP_QC)) {
                        codeStepNext = Step.HISEQ_CLUSTER_GEN;
                      } else if (workItem.getCodeStepNext().equals(Step.MISEQ_PREP_QC)) {
                        codeStepNext = Step.MISEQ_CLUSTER_GEN;
                      } else if (workItem.getCodeStepNext().equals(Step.NOSEQ_PREP_QC)) {
                        codeStepNext = Step.NOSEQ_CLUSTER_GEN;
                      } else if (workItem.getCodeStepNext().equals(Step.ILLSEQ_PREP_QC)) {
                        codeStepNext = Step.ILLSEQ_CLUSTER_GEN;
                      }

                      wi.setCodeStepNext(codeStepNext);
                      wi.setSequenceLane(lane);
                      wi.setCreateDate(new java.sql.Date(System.currentTimeMillis()));
                      sess.save(wi);
                    }

                  }
                }


            }

            if (autoCompleteMap.containsKey(request.getIdRequest())) {
              BillingItemAutoComplete auto = autoCompleteMap.get(request.getIdRequest());
              // If same request has workitems of different steps then they have to manually complete billing items.
              if (!auto.getCodeStep().equals(workItem.getCodeStepNext())) {
                auto.setSkip();
              }
            } else {
              BillingItemAutoComplete auto = new BillingItemAutoComplete(sess, workItem.getCodeStepNext(), request);
              autoCompleteMap.put(request.getIdRequest(), auto);
            }

            // If Solexa sample prep is done or failed for this sample, delete the work item
            if (sample.getSeqPrepDate() != null ||
              (sample.getSeqPrepFailed() != null && sample.getSeqPrepFailed().equalsIgnoreCase("Y")) ||
              (sample.getSeqPrepBypassed() != null && sample.getSeqPrepBypassed().equalsIgnoreCase("Y"))) {

              // Delete  work item
              sess.delete(workItem);

              if (sample.getSeqPrepBypassed() == null || !sample.getSeqPrepBypassed().equalsIgnoreCase("Y")) {
                // Save sample for later creation of billing items
                Set<Sample> sampleSet = samplesCompletedMap.get(sample.getIdRequest());
                if (sampleSet == null) {
                  sampleSet = new TreeSet<Sample>(new SampleComparator());
                }
                sampleSet.add(sample);
                samplesCompletedMap.put(sample.getIdRequest(), sampleSet);
              }
            }

            // Set the completed date on the request if all lib prep failed.
            request.completeRequestIfFinished(sess);

          }

          processBilling(sess, autoCompleteMap, samplesCompletedMap);

          sess.flush();

          parser.resetIsDirty();

          XMLOutputter out = new XMLOutputter();
          this.xmlResult = out.outputString(workItemDoc);
          
          setResponsePage(this.SUCCESS_JSP);          
        } else {
          this.addInvalidField("Insufficient permissions", "Insufficient permission to manage workflow");
          setResponsePage(this.ERROR_JSP);
        }


      }catch (Exception e){
        this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in SaveWorkItemSolexaPrep ", e);
        throw new RollBackCommandException(e.getMessage());
          
      }
      
    } else {
      this.xmlResult = "<SUCCESS/>";
      setResponsePage(this.SUCCESS_JSP);
    }
    
    return this;
  }

  private void processBilling(Session sess, Map<Integer, BillingItemAutoComplete> autoCompleteMap, Map<Integer, Set<Sample>> samplesCompletedMap) throws Exception {
    PropertyDictionaryHelper propertyHelper = PropertyDictionaryHelper.getInstance(sess);
    DictionaryHelper dictionaryHelper = DictionaryHelper.getInstance(sess);
    // Get the current billing period
    BillingPeriod billingPeriod = dictionaryHelper.getCurrentBillingPeriod();
    if (billingPeriod == null) {
      throw new Exception("Cannot find current billing period to create billing items");
    }

    // process billing items
    for(Integer key : autoCompleteMap.keySet()) {
      BillingItemAutoComplete auto = autoCompleteMap.get(key);
      String prop = propertyHelper.getCoreFacilityRequestCategoryProperty(auto.getRequest().getIdCoreFacility(), auto.getRequest().getCodeRequestCategory(), PropertyDictionary.BILLING_DURING_WORKFLOW);
      if (prop == null || !prop.equals("Y")) {
        // Billing items created at submit.  Just complete items that can be completed.
        if (!auto.getSkip()) {
          Integer completedQty = 0;
          for(Iterator i = auto.getRequest().getSamples().iterator(); i.hasNext(); ) {
            Sample sample = (Sample)i.next();
            if (sample.getSeqPrepDate() != null || 
                (sample.getSeqPrepFailed() != null && sample.getSeqPrepFailed().equalsIgnoreCase("Y")) ||
                (sample.getSeqPrepBypassed() != null && sample.getSeqPrepBypassed().equalsIgnoreCase("Y"))) {
              completedQty++;
            }
          }
    
          auto.completeItems(auto.getRequest().getSamples().size(), completedQty);
        }
      } else {
        // Need to create billing items at this point.
        Set<Sample> sampleSet = samplesCompletedMap.get(auto.getRequest().getIdRequest());
        if (sampleSet != null) {
        	BillingTemplate billingTemplate = BillingTemplateQueryManager.retrieveBillingTemplate(sess, auto.getRequest());
            SaveRequest.createBillingItems(sess, auto.getRequest(), null, billingPeriod, dictionaryHelper, sampleSet, null, null, null, null, auto.getCodeStep(), BillingStatus.COMPLETED, billingTemplate, false, true);
        }
      }
    }
  }

  private void mapRequest(Request request, WorkItem workItem, Map<Integer, Request> requestMap, Map<Integer, List<String>> requestStepMap) {
    if (!requestMap.containsKey(request.getIdRequest())) {
      requestMap.put(request.getIdRequest(), request);
    }
    List<String> steps;
    if (requestStepMap.containsKey(request.getIdRequest())) {
      steps = requestStepMap.get(request.getIdRequest());
    } else {
      steps = new ArrayList<String>();
      requestStepMap.put(request.getIdRequest(), steps);
    }
    Boolean found = false;
    for(String step : steps) {
      if (step.equals(workItem.getCodeStepNext())) {
        found = true;
        break;
      }
    }
    if (!found) {
      steps.add(workItem.getCodeStepNext());
    }
  }
}
