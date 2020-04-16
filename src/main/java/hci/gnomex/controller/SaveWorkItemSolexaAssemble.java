package hci.gnomex.controller;

import hci.dictionary.model.DictionaryEntry;
import hci.dictionary.model.NullDictionaryEntry;
import hci.dictionary.utility.DictionaryManager;
import hci.framework.control.Command;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.*;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.DictionaryHelper;
import hci.gnomex.utility.FlowCellChannelComparator;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.PropertyDictionaryHelper;
import hci.gnomex.utility.WorkItemSolexaAssembleParser;
import hci.gnomex.utility.WorkItemSolexaAssembleParser.ChannelContent;

import java.io.File;
import java.io.Serializable;
import java.io.StringReader;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.TreeSet;

import javax.json.Json;
import javax.json.JsonObject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;
import org.jdom.output.XMLOutputter;
import org.apache.log4j.Logger;



public class SaveWorkItemSolexaAssemble extends GNomExCommand implements Serializable {
  
 
  
  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(SaveWorkItemSolexaAssemble.class);
  
  private String                       codeStepNext;
  private String                       flowCellBarcode;
  private String                       flowCellDateStr;
  private String                       flowCellRunNumberStr;
  private String                       flowCellNumCyclesStr;
  private String                       flowCellSide;
  private String                       flowCellIdSeqRunTypeStr;
  private String                       flowCellIdInstrumentStr;
  private String                       lastCycleDateStr;
  private String                       workItemXMLString = null;
  private String					   numberSequencingCyclesAllowedStr;
  private Document                     workItemDoc;
  private String                       dirtyWorkItemXMLString = null;
  private Document                     dirtyWorkItemDoc;
  private WorkItemSolexaAssembleParser parser;

  
  private String                       appURL;
  
  private String                       serverName;
  
  public void validate() {
  }
  
  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
    
    if (request.getParameter("codeStepNext") != null && !request.getParameter("codeStepNext").equals("")) {
      codeStepNext = request.getParameter("codeStepNext");
    } else {
      this.addInvalidField("codeStepNext", "codeStepNext is required");
    }
    
    if (request.getParameter("flowCellBarcode") != null && !request.getParameter("flowCellBarcode").equals("")) {
      flowCellBarcode = request.getParameter("flowCellBarcode");
    }
    
    if (request.getParameter("flowCellDate") != null && !request.getParameter("flowCellDate").equals("")) {
      flowCellDateStr = request.getParameter("flowCellDate");
    }
    
    if (request.getParameter("runNumber") != null && !request.getParameter("runNumber").equals("")) {
      flowCellRunNumberStr = request.getParameter("runNumber");
    }
    
    if (request.getParameter("numberSequencingCyclesActual") != null && !request.getParameter("numberSequencingCyclesActual").equals("")) {
      flowCellNumCyclesStr = request.getParameter("numberSequencingCyclesActual");
    }
    
    if (request.getParameter("side") != null && !request.getParameter("side").equals("")) {
      flowCellSide = request.getParameter("side");
    }
    
    if (request.getParameter("idSeqRunType") != null && !request.getParameter("idSeqRunType").equals("")) {
      flowCellIdSeqRunTypeStr = request.getParameter("idSeqRunType");
    }
    
    if (request.getParameter("idInstrument") != null && !request.getParameter("idInstrument").equals("")) {
      flowCellIdInstrumentStr = request.getParameter("idInstrument");
    }
    
    if(request.getParameter("idNumberSequencingCyclesAllowed") != null && !request.getParameter("idNumberSequencingCyclesAllowed").equals("")) {
    	numberSequencingCyclesAllowedStr = request.getParameter("idNumberSequencingCyclesAllowed");
    }
    
    if (request.getParameter("workItemXMLString") != null && !request.getParameter("workItemXMLString").equals("")) {
      workItemXMLString = request.getParameter("workItemXMLString");

      StringReader reader = new StringReader(workItemXMLString);
      try {
        SAXBuilder sax = new SAXBuilder();
        workItemDoc = sax.build(reader);
      } catch (JDOMException je ) {
        this.addInvalidField( "WorkItemXMLString", "Invalid work item xml");
        this.errorDetails = Util.GNLOG(LOG,"Cannot parse workItemXMLString", je);
      }
    }
    
    
    if (request.getParameter("dirtyWorkItemXMLString") != null && !request.getParameter("dirtyWorkItemXMLString").equals("")) {
      dirtyWorkItemXMLString = "<WorkItemList>" + request.getParameter("dirtyWorkItemXMLString") + "</WorkItemList>";
      StringReader dirtyReader = new StringReader(dirtyWorkItemXMLString);
      try {
        SAXBuilder sax = new SAXBuilder();
        dirtyWorkItemDoc = sax.build(dirtyReader);
      } catch (JDOMException je ) {
          this.addInvalidField( "DirtyWorkItemXMLString", "Invalid work item xml");
        this.errorDetails = Util.GNLOG(LOG,"Cannot parse dirtyWorkItemXMLString", je);
      }

    }
    
    try {
      parser = new WorkItemSolexaAssembleParser(workItemDoc, dirtyWorkItemDoc);      
    } catch (Exception e) {
      LOG.error( "Error occurred in WorkItemSolexaAssemberParser", e );
      this.addInvalidField( "ParserError", "Error occurred in WorkItemSolexaAssemberParser");      
    }
    
    try {
      appURL = this.getLaunchAppURL(request);      
    } catch (Exception e) {
      LOG.warn("Cannot get launch app URL in SaveRequest", e);
    }
    
    serverName = request.getServerName();
    
  }

  /**
   *  Creates <FlowCell>s, <FlowCellChannel>s, and updates <WorkItem>s
   *  given a list of <WorkItem>s organized by which <FlowCellChannel> they
   *  should be assigned to.
   */
  public Command execute() throws RollBackCommandException {
    Session sess = null;
    DictionaryHelper dh;
    FlowCell flowCell = null;
    
    if (workItemXMLString != null || this.dirtyWorkItemXMLString != null) {
      try {
        sess = HibernateSession.currentSession(this.getUsername());
        dh = DictionaryHelper.getInstance(sess);
        parser.parse(sess, getSecAdvisor());
        
        if (this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_WORKFLOW)) {
          
          // Create flow cell
          if (this.workItemXMLString != null) {
            
            // Create a flow cell, set flowCellBarcode, idCoreFacility
            flowCell = new FlowCell();
            flowCell.setBarcode(flowCellBarcode);
            flowCell.setIdCoreFacility(parser.getIdCoreFacility());
            sess.save(flowCell);
            sess.flush();
            
            // sess.save assigns an idFlowCell for the new flowcell, set the "number" attribute for display
            flowCell.setNumber("FC" + flowCell.getIdFlowCell());
            String codeRequestCategory = parser.getCodeRequestCategory();
            String sequencingPlatform = "";
            // ILLSEQQC
            if(codeRequestCategory.equals(Step.SEQ_DATA_PIPELINE)) {
              sequencingPlatform = SequencingPlatform.ILLUMINA_GAIIX_SEQUENCING_PLATFORM;
            } else if (codeRequestCategory.equals(RequestCategory.ILLUMINA_HISEQ_REQUEST_CATEGORY)) { // HSEQPIPE, needs to be changed to HSEQFINFC
              sequencingPlatform = SequencingPlatform.ILLUMINA_HISEQ_2000_SEQUENCING_PLATFORM;
            } else if (codeRequestCategory.equals(RequestCategory.ILLUMINA_MISEQ_REQUEST_CATEGORY)) {
              sequencingPlatform = SequencingPlatform.ILLUMINA_MISEQ_SEQUENCING_PLATFORM;
            } else if (codeRequestCategory.equals(RequestCategory.ILLUMINA_ILLSEQ_REQUEST_CATEGORY)) {
              sequencingPlatform = SequencingPlatform.ILLUMINA_ILLSEQ_SEQUENCING_PLATFORM;
            } else if (codeRequestCategory.equals(RequestCategory.ILLUMINA_NOSEQ_REQUEST_CATEGORY)) {
              sequencingPlatform = SequencingPlatform.ILLUMINA_NOSEQ_SEQUENCING_PLATFORM;
            }
            flowCell.setCodeSequencingPlatform(sequencingPlatform);    //HISEQ
            
            java.sql.Date flowCellDate = null;
            if (flowCellDateStr != null) {
              flowCellDate = this.parseDate(flowCellDateStr);
            } else {
              flowCellDate = new java.sql.Date(System.currentTimeMillis());
            }
            flowCell.setCreateDate(flowCellDate);

            if (flowCellRunNumberStr != null && !flowCellRunNumberStr.equals("")) {
              flowCell.setRunNumber(new Integer(flowCellRunNumberStr));
            }
            if (flowCellSide != null){
              flowCell.setSide(flowCellSide);
            }
            if (flowCellIdSeqRunTypeStr != null && !flowCellIdSeqRunTypeStr.equals("")) {
              flowCell.setIdSeqRunType(new Integer(flowCellIdSeqRunTypeStr));
            }
            if (flowCellIdInstrumentStr != null && !flowCellIdInstrumentStr.equals("")) {
              flowCell.setIdInstrument(new Integer(flowCellIdInstrumentStr));
            }

            Integer flowCellNumCycles = null;
            if (flowCellNumCyclesStr != null && !flowCellNumCyclesStr.equals("")) {
              flowCellNumCycles = new Integer(flowCellNumCyclesStr);
            }
            if (numberSequencingCyclesAllowedStr != null && !numberSequencingCyclesAllowedStr.equals("")) {
            	flowCell.setIdNumberSequencingCyclesAllowed(new Integer(numberSequencingCyclesAllowedStr));            
	            for (Iterator i = DictionaryManager.getDictionaryEntries("hci.gnomex.model.NumberSequencingCyclesAllowed").iterator(); i.hasNext();) {
	              DictionaryEntry de = (DictionaryEntry)i.next();
	              if (de instanceof NullDictionaryEntry) {
	                continue;
	              }
	              NumberSequencingCyclesAllowed nsca = (NumberSequencingCyclesAllowed)de;
	              if(nsca.getIdNumberSequencingCyclesAllowed().toString().equals(numberSequencingCyclesAllowedStr)) {
	            	  flowCell.setIdNumberSequencingCycles(nsca.getIdNumberSequencingCycles());
	            	  flowCell.setIdSeqRunType(nsca.getIdSeqRunType());	            	  
	              }
	            }
            }
            
            
            String runFolder = flowCell.getRunFolderName(sess, dh); // one folder for all channels in this flow cell?
            TreeSet<FlowCellChannel> channels = new TreeSet<FlowCellChannel>(new FlowCellChannelComparator());
            int laneNumber = 1;
            HashMap<String,Object> requestNumbers = new HashMap<String,Object>();
            HashMap<Integer,Object> idOrganisms = new HashMap<Integer,Object>();
            int maxCycles = 0;
            Integer idNumberSequencingCycles = null;
            
            // Use the key set of channel numbers from the parser to access the data for one channel
            // at a time. Create the <FlowCellChannel> and update the <SequenceLane>s to have an attribute pointing to this <FlowCellChannel>
            for(Iterator<String> i = parser.getChannelNumbers().iterator(); i.hasNext();) {
              String channelNumber = (String)i.next();
              
              
              FlowCellChannel channel = new FlowCellChannel();
              channel.setNumber(new Integer(laneNumber)); // laneNumber instead of channelNumber?!
              channel.setIdFlowCell(flowCell.getIdFlowCell());
              sess.save(channel);
              sess.flush();

              // run folder should never be null, but just in case.
              if (runFolder != null) {
                channel.setFileName(runFolder);
              }
              channel.setSampleConcentrationpM(parser.getSampleConcentrationpm(channelNumber));
              channel.setIsControl(parser.getIsControl(channelNumber));
              channel.setNumberSequencingCyclesActual(flowCellNumCycles);

              // Apply the core facility's default pipeline protocol, if any
              channel.setIdPipelineProtocol(null);
              for (Iterator iter = DictionaryManager.getDictionaryEntries("hci.gnomex.model.PipelineProtocol").iterator(); iter.hasNext();) {
                Object obj = iter.next();
                if (obj instanceof PipelineProtocol) {
                  PipelineProtocol protocol = (PipelineProtocol) obj;
                  if (protocol.getIdCoreFacility().equals(parser.getIdCoreFacility()) && protocol.getIsDefault().equals("Y")) {
                    channel.setIdPipelineProtocol(protocol.getIdPipelineProtocol());
                  }
                }
              }

              // Use the channel number from the key set to get the contents that will go into this channel
              // The items will either be a sequence lane or a sequence control.
              List<WorkItemSolexaAssembleParser.ChannelContent> channelContents = parser.getChannelContents(channelNumber);
              for (Iterator<ChannelContent> i1 = channelContents.iterator(); i1.hasNext();) {
                WorkItemSolexaAssembleParser.ChannelContent content = (WorkItemSolexaAssembleParser.ChannelContent)i1.next();
                
                // Is this item of channel content a sequence lane?
                if (content.getSequenceLane() != null) {
                  SequenceLane lane = content.getSequenceLane();

                  lane.setIdFlowCellChannel(channel.getIdFlowCellChannel()); // update <SequenceLane> so it knows to which <FlowCellChannel> it belongs
                  if (flowCell.getIdSeqRunType() == null) { // set based on first sequence lane in first channel if it was not passed in in the request
                    flowCell.setIdSeqRunType(lane.getIdSeqRunType());
                  }
                  // if this lane has a higher number of cycles than the current max, update the max
                  Integer seqCycles = new Integer(dh.getNumberSequencingCycles(lane.getIdNumberSequencingCycles()));
                  if (idNumberSequencingCycles == null ||
                      seqCycles.intValue() > maxCycles ) {
                    idNumberSequencingCycles = lane.getIdNumberSequencingCycles(); // set based on highest number of cycles among all <SequenceLane>s in <FlowCell>
                    maxCycles = seqCycles.intValue();
                  }

                  WorkItem workItem = content.getWorkItem();

                  // Keep track of request numbers, organisms on flow cells
                  requestNumbers.put(workItem.getRequest().getNumber(), null);
                  idOrganisms.put(lane.getSample().getIdOrganism(), null);                  
                  
                  // Delete  work item which was a wrapper for this <SequenceLane>
                  sess.delete(workItem);
                } // Or is this item of channel content a sequence control?
                else if (content.getSequenceControl() != null) {
                  channel.setIdSequencingControl(content.getSequenceControl().getIdSequencingControl());              
                }
              }
              
              
              // At this stage a <WorkItem> no longer encapsulates a <SequenceLane>, now it encapsulates a <FlowCellChannel>
              // <SequenceLane>s now have an attribute to their <FlowCellChannel>
              WorkItem wi = new WorkItem();
              wi.setIdCoreFacility(parser.getIdCoreFacility());
              wi.setFlowCellChannel(channel);
              wi.setCodeStepNext(codeStepNext);
              wi.setCreateDate(new java.sql.Date(System.currentTimeMillis()));
              sess.save(wi);

              sess.flush();
              
              
              channels.add(channel);

              
              laneNumber++;
                          
            }
            // Now that all <FlowCellChannel>s have been created, finish creating the <FlowCell>
            flowCell.setIdNumberSequencingCycles(idNumberSequencingCycles);
            flowCell.setFlowCellChannels(channels);
            
            String notes = "";
            for(Iterator i = requestNumbers.keySet().iterator(); i.hasNext();) {
              notes += i.next();
              if (i.hasNext()) {
                notes += ", ";
              } else {
                notes += " ";
              }
            }
            if (idOrganisms.size() > 0) {
              notes += "(";
              for(Iterator i = idOrganisms.keySet().iterator(); i.hasNext();) {
                notes += dh.getOrganism((Integer)i.next());
                if (i.hasNext()) {
                  notes += Constants.FILE_SEPARATOR;
                }
              }           
              notes += ")";
            }
            if (!notes.equals("")) {
              flowCell.setNotes(notes);
            }
            
            sess.save(flowCell);
            
            
            sess.flush();
            
            this.createFlowCellDirectory(flowCell, PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null, PropertyDictionaryHelper.PROPERTY_FLOWCELL_DIRECTORY));
            
            
          }
          
          if (this.dirtyWorkItemXMLString != null) {
            for(Iterator i = this.parser.getDirtyWorkItemList().iterator(); i.hasNext();) {
              WorkItem wi = (WorkItem)i.next();
              sess.save(wi);
            }
            sess.flush();
          }

          parser.resetIsDirty();

          if (flowCell != null) {
            JsonObject value = Json.createObjectBuilder()
                    .add("result", "SUCCESS")
                    .add("flowCellNumber", flowCell.getNumber())
                    .build();
            this.jsonResult = value.toString();
          }
          setResponsePage(this.SUCCESS_JSP);
        } else {
          this.addInvalidField("Insufficient permissions", "Insufficient permission to manage workflow");
          setResponsePage(this.ERROR_JSP);
        }


      }catch (Exception e){
        this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in SaveWorkflowSolexaAssemble ", e);
        throw new RollBackCommandException(e.getMessage());
          
      }
      
    } else {
      this.xmlResult = "<SUCCESS/>";
      setResponsePage(this.SUCCESS_JSP);
    }
    
    return this;
  }
  
  private void createFlowCellDirectory(FlowCell flowCell, String flowCellDir) {

    
    String createYear = this.formatDate(flowCell.getCreateDate(), this.DATE_OUTPUT_ALTIO).substring(0,4);
    String rootDir = flowCellDir + Constants.FILE_SEPARATOR + createYear;
    
    boolean success = false;
    if (!new File(rootDir).exists()) {
      success = (new File(rootDir)).mkdir();
      if (!success) {
        LOG.error("Unable to create directory " + rootDir);
      }      
    }
    
    String directoryName = rootDir +  Constants.FILE_SEPARATOR + flowCell.getNumber();
    
    success = (new File(directoryName)).mkdir();
    if (!success) {
      LOG.error("Unable to create directory " + directoryName);
    }
    
   
  }

  

}
