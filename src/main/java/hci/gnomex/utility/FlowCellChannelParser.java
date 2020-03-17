
package hci.gnomex.utility;

import hci.framework.model.DetailObject;
import hci.gnomex.model.FlowCellChannel;
import hci.gnomex.model.SequenceLane;
import hci.gnomex.model.WorkItem;

import java.io.Serializable;
import java.math.BigDecimal;
import java.sql.Date;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;

import org.hibernate.Session;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;

public class FlowCellChannelParser extends DetailObject implements Serializable {

  private JsonArray flowCellArray;

  private Map<String, FlowCellChannel> channelMap = new HashMap<>();

  public FlowCellChannelParser(JsonArray flowCellArray) {
    this.flowCellArray = flowCellArray;
  }

  public void init() {
    channelMap = new HashMap<>();
  }

  // this method depends on all of the Flow Cell's channel being sent in the doc, if an entire channel was deleted, this will not work! 
  //  It depends on hibernate's cacade=all to delete the channel and all sequence lanes in SaveFlowCell
  // now that we no longer use cascade=all, and in order to allow sequence lanes to move backward in the workflow
  // we need to manage their work items individually and not just delete the sequence lanes when they are removed from a channel
  public void parse(Session sess) throws Exception {
    FlowCellChannel channel;

    for (int i = 0; i < this.flowCellArray.size(); i++) {
      boolean isNewChannel;
      Map<String, SequenceLane> sequenceLaneMap = new HashMap<>();
      JsonObject node = this.flowCellArray.getJsonObject(i);

      String idFlowCellChannelString =  Util.getJsonStringSafeNonNull(node,"idFlowCellChannel");
      // Is this HISEQ or MISEQ?
      String codeStepNext = "";
      // What is the core?
      Integer idCoreFacility = -1;

      List workItems = sess.createQuery(""
          + " SELECT wi "
          + "   FROM WorkItem wi "
          + "  WHERE idFlowCellChannel = " + idFlowCellChannelString
      ).list();

      for (Object wi : workItems) {
        codeStepNext = ((WorkItem) wi).getCodeStepNext();
        idCoreFacility = ((WorkItem) wi).getIdCoreFacility();
      }

      if (idFlowCellChannelString.startsWith("FlowCellChannel") || idFlowCellChannelString.equals("")) {
        isNewChannel = true;
        channel = new FlowCellChannel();
        channel.setSequenceLanes(new TreeSet<>(new LaneComparator()));
      } else {
        isNewChannel = false;
        channel = sess.get(FlowCellChannel.class, Integer.parseInt(idFlowCellChannelString));
      }

      this.initializeFlowCellChannel(node, channel);

      JsonArray seqLaneArray = node.get("sequenceLanes") != null ? node.getJsonArray("sequenceLanes") : Json.createArrayBuilder().build();

      for (int i1 = 0 ; i1 < seqLaneArray.size(); i1++) {
        boolean isNewLane;
        SequenceLane sl;
        JsonObject sequenceLaneNode = seqLaneArray.getJsonObject(i1);

        String idSequenceLaneString = Util.getJsonStringSafeNonNull(sequenceLaneNode, "idSequenceLane");

        if (idSequenceLaneString.startsWith("SequenceLane") || idSequenceLaneString.equals("")) {
          isNewLane = true;
          sl = new SequenceLane();
        } else {
          isNewLane = false;
          sl = sess.get(SequenceLane.class, Integer.parseInt(idSequenceLaneString));
        }

        sl.setIdFlowCellChannel(channel.getIdFlowCellChannel());

        if (isNewLane) {
          sess.save(sl);
          idSequenceLaneString = sl.getIdSequenceLane().toString();
        }
        sequenceLaneMap.put(idSequenceLaneString, sl);
      }

      //
      // Remove lanes which have been deleted by the user
      //
      if (channel.getSequenceLanes() != null && !channel.getSequenceLanes().isEmpty()) {
        TreeSet<SequenceLane> lanesToDelete = new TreeSet<>(new LaneComparator());

        for (SequenceLane existingLane : channel.getSequenceLanes()) {
          if (!sequenceLaneMap.containsKey(existingLane.getIdSequenceLane().toString())) {
            lanesToDelete.add(existingLane); // delete lane if it was stored in this channel but was not sent in the request (meaning the user deleted it from the channel)
          }
        }

        for (SequenceLane laneToDelete : lanesToDelete) {
          channel.getSequenceLanes().remove(laneToDelete);
          laneToDelete.setIdFlowCellChannel(null);
          // create a work item to move the sequence lane back to the assembly stage
          WorkItem wi = new WorkItem();
          wi.setIdRequest(laneToDelete.getIdRequest());
          wi.setSequenceLane(laneToDelete);
          wi.setCreateDate(new Date(System.currentTimeMillis()));

          if(idCoreFacility > 0) {
            wi.setIdCoreFacility(idCoreFacility);
          }

          switch(codeStepNext) {
            case "HSEQFINFC"   :
            case "HSEQPIPE"    : wi.setCodeStepNext("HSEQASSEM");   break;
            case "MISEQFINFC"  :
            case "MISEQPIPE"   : wi.setCodeStepNext("MISEQASSEM");  break;
            case "NOSEQFINFC"  :
            case "NOSEQPIPE"   : wi.setCodeStepNext("NOSEQASSEM");  break;
            case "ILLSEQFINFC" :
            case "ILLSEQPIPE"  : wi.setCodeStepNext("ILLSEQASSEM"); break;
            default :
          }

          sess.save(wi);
        }
      }

      //
      // Save newly added lanes to channel
      //
      for (SequenceLane sl : sequenceLaneMap.values()) {
        boolean exists = false;

        if (!isNewChannel && channel.getSequenceLanes() != null && !channel.getSequenceLanes().isEmpty()) {
          for (SequenceLane existingLane : channel.getSequenceLanes()) {
            if (existingLane.getIdSequenceLane().equals(sl.getIdSequenceLane())) {
              exists = true;
            }
          }
        }
        // New sequence lane -- add it to the list
        if (!exists) {
          if (channel.getSequenceLanes() == null) {
            channel.setSequenceLanes(new TreeSet<>(new LaneComparator()));
          }

          channel.getSequenceLanes().add(sl);
          // delete the work item for the sequence lane
          workItems = sess.createQuery(""
              + " SELECT wi "
              + "   FROM WorkItem wi "
              + "  WHERE idSequenceLane = " + sl.getIdSequenceLane()
          ).list();

          for (Object wi : workItems) {
            sess.delete(((WorkItem) wi));
          }
        }
      }

      sess.flush();

      if (isNewChannel) {
        sess.save(channel);
        idFlowCellChannelString = channel.getIdFlowCellChannel().toString();
      }
      channelMap.put(idFlowCellChannelString, channel);
    }
  }

  protected void initializeFlowCellChannel(JsonObject n, FlowCellChannel channel) {

    if (n.get("number") != null && !n.getString("number").equals("")) {
      channel.setNumber(new Integer(n.getString("number")));
    } else {
      channel.setNumber(null);
    }

    if (n.get("idFlowCell") != null && !n.getString("idFlowCell").equals("")) {
      channel.setIdFlowCell(new Integer(n.getString("idFlowCell")));
    }

    if (n.get("idSequencingControl") != null && !n.getString("idSequencingControl").equals("")) {
      channel.setIdSequencingControl(new Integer(n.getString("idSequencingControl")));
    } else{
      channel.setIdSequencingControl(null);
    }

    if (n.get("startDate") != null && !n.getString("startDate").equals("")){
      channel.setStartDate(this.parseDate(n.getString("startDate")));
    } else {
      channel.setStartDate(null);
    }

    if (n.get("firstCycleDate") != null && !n.getString("firstCycleDate").equals("")){
      channel.setFirstCycleDate(this.parseDate(n.getString("firstCycleDate")));
    } else {
      channel.setFirstCycleDate(null);
    }

    if (n.get("firstCycleFailed") != null && !n.getString("firstCycleFailed").equals("")){
      channel.setFirstCycleFailed(n.getString("firstCycleFailed"));
    }

    if (n.get("lastCycleDate") != null && !n.getString("lastCycleDate").equals("")){
      channel.setLastCycleDate(this.parseDate(n.getString("lastCycleDate")));
    } else {
      channel.setLastCycleDate(null);
    }

    if (n.get("lastCycleFailed") != null && !n.getString("lastCycleFailed").equals("")){
      channel.setLastCycleFailed(n.getString("lastCycleFailed"));
    }

    if (n.get("clustersPerTile") != null && !n.getString("clustersPerTile").equals("")){
      channel.setClustersPerTile(new Integer(n.getString("clustersPerTile")));
    } else {
      channel.setClustersPerTile(null);
    }

    if (n.get("fileName") != null && !n.getString("fileName").equals("")){
      channel.setFileName(n.getString("fileName"));
    }

    if (n.get("numberSequencingCyclesActual") != null && !n.getString("numberSequencingCyclesActual").equals("")){
      channel.setNumberSequencingCyclesActual(new Integer(n.getString("numberSequencingCyclesActual")));
    } else {
      channel.setNumberSequencingCyclesActual(null);
    }

    if (n.get("pipelineDate") != null && !n.getString("pipelineDate").equals("")){
      channel.setPipelineDate(this.parseDate(n.getString("pipelineDate")));
    } else {
      channel.setPipelineDate(null);
    }

    if (n.get("pipelineFailed") != null && !n.getString("pipelineFailed").equals("")){
      channel.setPipelineFailed(n.getString("pipelineFailed"));
    }

    if (n.get("isControl") != null && !n.getString("isControl").equals("")){
      channel.setIsControl(n.getString("isControl"));
    }

    if (n.get("phiXErrorRate") != null && !n.getString("phiXErrorRate").equals("")){
      channel.setPhiXErrorRate(new BigDecimal(n.getString("phiXErrorRate")));
    } else {
      channel.setPhiXErrorRate(null);
    }

    if (n.get("read1ClustersPassedFilterM") != null && !n.getString("read1ClustersPassedFilterM").equals("")){
      channel.setRead1ClustersPassedFilterM(new BigDecimal(n.getString("read1ClustersPassedFilterM")));
    } else {
      channel.setRead1ClustersPassedFilterM(null);
    }

    if (n.get("q30PercentForDisplay") != null && !n.getString("q30PercentForDisplay").equals("")){
      channel.setQ30Percent(new BigDecimal(n.getString("q30PercentForDisplay")).movePointLeft(2));
    } else {
      channel.setQ30Percent(null);
    }

    if (n.get("sampleConcentrationpM") != null && !n.getString("sampleConcentrationpM").equals("")){
      channel.setSampleConcentrationpM(new BigDecimal(n.getString("sampleConcentrationpM")));
    } else {
      channel.setSampleConcentrationpM(null);
    }

    if (n.get("idPipelineProtocol") != null && !n.getString("idPipelineProtocol").equals("")){
      channel.setIdPipelineProtocol(new Integer(n.getString("idPipelineProtocol")));
    } else {
      channel.setIdPipelineProtocol(null);
    }
  }

  public Map<String, FlowCellChannel> getChannelMap() {
    return channelMap;
  }

  public void setChannelMap(Map<String, FlowCellChannel> channelMap) {
    this.channelMap = channelMap;
  }

  private class LaneComparator implements Comparator<SequenceLane>, Serializable {
    public int compare(SequenceLane o1, SequenceLane o2) {
      return o1.getIdSequenceLane().compareTo(o2.getIdSequenceLane());
    }
  }
}
