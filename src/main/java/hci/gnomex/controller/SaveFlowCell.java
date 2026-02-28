package hci.gnomex.controller;

import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.dictionary.model.DictionaryEntry;
import hci.dictionary.model.NullDictionaryEntry;
import hci.dictionary.utility.DictionaryManager;
import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.*;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.*;

public class SaveFlowCell extends GNomExCommand implements Serializable {
  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(SaveFlowCell.class);

  private FlowCellChannelParser		channelParser;
  private FlowCell					fc;
  private boolean						isNewFlowCell = false;
  private String            lastCycleDateStr;
  private String            numberSequencingCyclesActualStr;
  private String						runFolder = null;

  public void validate() {}

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session)
  {
    if (request.getParameter("lastCycleDate") != null && !request.getParameter("lastCycleDate").equals("")) {
      lastCycleDateStr = request.getParameter("lastCycleDate");
    }
    if (request.getParameter("numberSequencingCyclesActual") != null && !request.getParameter("numberSequencingCyclesActual").equals("")) {
      numberSequencingCyclesActualStr = request.getParameter("numberSequencingCyclesActual");
    }
    if (request.getParameter("runFolder") != null && !request.getParameter("runFolder").equals("")) {
      runFolder = request.getParameter("runFolder");
    }
    // flow cell as it exists in the request
    fc = new FlowCell();
    HashMap errors = this.loadDetailObject(request, fc);
    this.addInvalidFields(errors);

    if (fc.getIdFlowCell() == null || fc.getIdFlowCell() == 0) {
      isNewFlowCell = true;
    }

    try{
      JsonArray channelsArray = Util.readJSONArray(request, "channelsJSONString");
      if(channelsArray.size() > 0){
        channelParser = new FlowCellChannelParser(channelsArray);
      }
    }
    catch (Exception e) {
      LOG.error("Cannot parse channelsJSONString", e);
      this.addInvalidField("channelsJSONString", "Invalid channelsJSONString");
      this.errorDetails = Util.GNLOG(LOG,"Cannot parse channelsJSONString", e);
    }
  }

  public Command execute() throws RollBackCommandException {
    try {
      Session sess = HibernateSession.currentSession(this.getUsername());
      DictionaryHelper dh = DictionaryHelper.getInstance(sess);

      if (this.getSecurityAdvisor().canUpdate(fc)) {
        channelParser.parse(sess); // updates changes to Channels and Sequence Lanes in database
        FlowCell flowCell;

        if (isNewFlowCell) {
          flowCell = fc;
          sess.save(flowCell);
        } else {
          flowCell = sess.get(FlowCell.class, fc.getIdFlowCell()); // load flow cell from database
          initializeFlowCell(flowCell); // copy flow cell info from request into flow cell loaded from database
        }
        // Save updated sequence lanes
        for(String key : channelParser.getChannelMap().keySet()) {
          FlowCellChannel fcc = channelParser.getChannelMap().get(key);
          Set seqLanes = fcc.getSequenceLanes();

          for(Object temp : seqLanes) {
            SequenceLane sl = (SequenceLane)temp;

            if(sl.getIdNumberSequencingCyclesAllowed() != null
                && flowCell.getIdNumberSequencingCyclesAllowed() != null
                && !sl.getIdNumberSequencingCyclesAllowed().equals(flowCell.getIdNumberSequencingCyclesAllowed())) {

              // Update Sequencing Protocol for Sequence Lanes if they were forced into a Flow Cell with a different protocol
              sl.setIdNumberSequencingCyclesAllowed(flowCell.getIdNumberSequencingCyclesAllowed());
              sl.setIdSeqRunType(flowCell.getIdSeqRunType());
              sl.setIdNumberSequencingCycles(flowCell.getIdNumberSequencingCycles());
              sess.save(sl);
            }
          }
        }

        // Remove channels that belong to this FlowCell but were not sent in the request (meaning the user removed them)
        TreeSet<FlowCellChannel> channelsToDelete = new TreeSet<>(new ChannelComparator());

        for(FlowCellChannel existingChannel : flowCell.getFlowCellChannels()) {
          if (!channelParser.getChannelMap().containsKey(existingChannel.getIdFlowCellChannel().toString())) {
            channelsToDelete.add(existingChannel);

            // Delete Work Items
            List workItems = sess.createQuery(""
                + " SELECT x "
                + "   FROM WorkItem x "
                + "  WHERE idFlowCellChannel = " + existingChannel.getIdFlowCellChannel()
            ).list();

            for (Object obj : workItems) {
              WorkItem x = (WorkItem) obj;

              if (x.getCodeStepNext().equals("HSEQFINFC")
                || x.getCodeStepNext().equals("HSEQPIPE")
                || x.getCodeStepNext().equals("MISEQFINFC")
                || x.getCodeStepNext().equals("MISEQPIPE")
                || x.getCodeStepNext().equals("ILLSEQFINFC")
                || x.getCodeStepNext().equals("ILLSEQPIPE")
                || x.getCodeStepNext().equals("NOSEQFINFC")
                || x.getCodeStepNext().equals("NOSEQPIPE")) {

                for(SequenceLane sl : existingChannel.getSequenceLanes()) {

                  WorkItem wi = new WorkItem();
                  wi.setIdRequest(sl.getIdRequest());
                  wi.setSequenceLane(sl);

                  if (x.getCodeStepNext().equals(Step.ILLSEQ_FINALIZE_FC)
                      || x.getCodeStepNext().equals(Step.ILLSEQ_DATA_PIPELINE)) {

                    wi.setCodeStepNext(Step.ILLSEQ_DATA_PIPELINE);
                  }

                  sess.save(wi);
                }
              }

              sess.delete(x);
            }

            // Dissociate Sequence Lanes from channel and grab the request numbers so that we can update the flowcell notes
            for (SequenceLane lane : existingChannel.getSequenceLanes()) {
              lane.setIdFlowCellChannel(null);
            }
          }
        }

        for (FlowCellChannel channelToDelete : channelsToDelete) {
          flowCell.getFlowCellChannels().remove(channelToDelete);
        }

        //
        // Build the run folder name for the channels.
        // Note this will be null if any of the parts for building
        // are not filled in.  That is a flag to NOT update the
        // folder name.
        //
        // runFolder is provided if SaveFlowCell called from FinalizeFlowCell screen
        // if called from EditFlowCell then it will need to be recreated here.
        if(runFolder == null || runFolder.equals("")) {
          runFolder = flowCell.getRunFolderName(sess, dh);
        }

        java.sql.Date lastCycleDate = null;

        if (lastCycleDateStr != null) {
          lastCycleDate = this.parseDate(lastCycleDateStr);
        }

        Integer numberSequencingCyclesActual = null;

        if (numberSequencingCyclesActualStr != null && numberSequencingCyclesActualStr.length() > 0) {
          numberSequencingCyclesActual = Integer.valueOf(numberSequencingCyclesActualStr);
        }

        //
        // Save channels
        // channelParser contains flow cell channels from the request, flowCell has channels from the database
        for (String idFlowCellChannelString : channelParser.getChannelMap().keySet()) {
          FlowCellChannel fcc = channelParser.getChannelMap().get(idFlowCellChannelString);

          if (runFolder != null) {
            fcc.setFileName(runFolder);
          }

          fcc.setLastCycleDate(lastCycleDate);
          fcc.setNumberSequencingCyclesActual(numberSequencingCyclesActual);

          boolean exists = false;

          for(FlowCellChannel existingChannel : flowCell.getFlowCellChannels()) {
            if (existingChannel.getIdFlowCellChannel().equals(fcc.getIdFlowCellChannel())) {
              exists = true;
              break;
            }
          }

          // New flow cell channel -- add it to the list
          if (!exists) {
            flowCell.getFlowCellChannels().add(fcc);
          }          
        }

        // Rebuild the Flow Cell's notes: request numbers followed by organism names
        //Grab all of the request numbers and oganism ids associated with the flowCell's channels
        Set<String> requestNums = new TreeSet<>();
        Set<Integer> idOrganisms = new TreeSet<>();

        for(FlowCellChannel fc : flowCell.getFlowCellChannels()){
          for(SequenceLane lane : fc.getSequenceLanes()){
            requestNums.add(lane.getSample().getRequest().getNumber());

            if(lane.getSample().getIdOrganism() != null) {
              idOrganisms.add(lane.getSample().getIdOrganism());
            }
          }
        }        
        String notes = "";
        for(Iterator<String> i1 = requestNums.iterator(); i1.hasNext();) {
          String r = i1.next();
          notes += r;
          if(i1.hasNext()) {
            notes += ", ";
          } else {
            notes += " ";
          }
        }

        boolean isFirst = true;
        for(Iterator<Integer> i2 = idOrganisms.iterator(); i2.hasNext();) {
          if(isFirst) {
            notes += "(";
            isFirst = false;
          }
          Integer idOrganism = i2.next();
          String organism = dh.getOrganism(idOrganism);
          notes += organism;
          if(i2.hasNext()) {
            notes += Constants.FILE_SEPARATOR;
          }        	
        }
        if(!isFirst) {
          notes += ")";
        }
        flowCell.setNotes(notes);

        // When a flow cell is finalized the work items attached to the flow cell's channels
        // need to have their codeStepNext updated from finalize to the next step.
        if(!channelParser.getChannelMap().isEmpty()){
          StringBuilder sb = new StringBuilder();
          sb.append("SELECT x from WorkItem x where idFlowCellChannel IN ");
          String slids = channelParser.getChannelMap().keySet().toString();
          slids = slids.replace('[', '(');
          slids = slids.replace(']',')');
          slids = slids.trim();
          sb.append(slids);
          List workItems = sess.createQuery(sb.toString()).list();

          for(Object obj : workItems) {
            WorkItem wi = (WorkItem) obj;
            if (wi.getCodeStepNext().equals(Step.ILLSEQ_FINALIZE_FC)) {
              wi.setCodeStepNext(Step.ILLSEQ_DATA_PIPELINE);
              sess.save(wi);
            }
          }
        }

        if(isNewFlowCell){
          sendNotification(flowCell, sess, Notification.NEW_STATE, Notification.SOURCE_TYPE_USER, Notification.TYPE_FLOWCELL);
          sendNotification(flowCell, sess, Notification.NEW_STATE, Notification.SOURCE_TYPE_ADMIN, Notification.TYPE_FLOWCELL);
        } else{
          sendNotification(flowCell, sess, Notification.EXISTING_STATE, Notification.SOURCE_TYPE_USER, Notification.TYPE_FLOWCELL);
          sendNotification(flowCell, sess, Notification.EXISTING_STATE, Notification.SOURCE_TYPE_ADMIN, Notification.TYPE_FLOWCELL);
        }
        sess.flush();

        this.xmlResult = "<SUCCESS idFlowCell=\"" + flowCell.getIdFlowCell() + "\"/>";
        JsonObject value = Json.createObjectBuilder()
                .add("result", "SUCCESS")
                .add("flowCellNumber", flowCell.getNumber())
                .build();
        this.jsonResult = value.toString();

        setResponsePage(this.SUCCESS_JSP);
      } else {
        this.addInvalidField("Insufficient permissions",
        "Insufficient permission to save flowCell.");
        setResponsePage(this.ERROR_JSP);
      }
    }
    catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in SaveFlowCell ", e);
      throw new RollBackCommandException(e.getMessage());
    }

    return this;
  }

  // flowCell is loaded from database. fc is from the HttpRequest. Here we update flowCell with any new values from fc.
  private void initializeFlowCell(FlowCell flowCell) {
    flowCell.setNumber(fc.getNumber());
    flowCell.setCreateDate(fc.getCreateDate());
    flowCell.setNotes(fc.getNotes());
    flowCell.setBarcode(fc.getBarcode());
    flowCell.setCodeSequencingPlatform(fc.getCodeSequencingPlatform());
    flowCell.setRunNumber(fc.getRunNumber());
    flowCell.setIdInstrument(fc.getIdInstrument());
    flowCell.setSide(fc.getSide());
    flowCell.setIdCoreFacility(fc.getIdCoreFacility());
    flowCell.setIdNumberSequencingCyclesAllowed(fc.getIdNumberSequencingCyclesAllowed());

    for(DictionaryEntry de : DictionaryManager.getDictionaryEntries("hci.gnomex.model.NumberSequencingCyclesAllowed")) {
      if (de instanceof NullDictionaryEntry) {
        continue;
      }

      NumberSequencingCyclesAllowed nsca = (NumberSequencingCyclesAllowed)de;

      if (nsca.getIdNumberSequencingCyclesAllowed().equals(fc.getIdNumberSequencingCyclesAllowed())) {
        flowCell.setIdSeqRunType(nsca.getIdSeqRunType());
        flowCell.setIdNumberSequencingCycles(nsca.getIdNumberSequencingCycles());
        break;
      }
    }
  }

  private class ChannelComparator implements Comparator<FlowCellChannel>, Serializable {
    public int compare(FlowCellChannel o1, FlowCellChannel o2) {
      return o1.getIdFlowCellChannel().compareTo(o2.getIdFlowCellChannel());
    }
  }
}
