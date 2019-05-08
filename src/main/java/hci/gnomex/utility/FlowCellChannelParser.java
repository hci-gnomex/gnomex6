
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
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;

import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;

public class FlowCellChannelParser extends DetailObject implements Serializable
{

  private JsonArray flowCellArray;
  private Map      channelMap = new HashMap();

  public FlowCellChannelParser(JsonArray flowCellArray) {
    this.flowCellArray = flowCellArray;
  }

  public void init() {
    channelMap = new HashMap();
  }
  // this method depends on all of the Flow Cell's channel being sent in the doc, if an entire channel was deleted, this will not work! 
  //  It depends on hibernate's cacade=all to delete the channel and all sequence lanes in SaveFlowCell
  // now that we no longer use cascade=all, and in order to allow sequence lanes to move backward in the workflow
  // we need to manage their work items individually and not just delete the sequence lanes when they are removed from a channel
  public void parse(Session sess) throws Exception {
    FlowCellChannel channel = new FlowCellChannel();


    for (int i = 0; i <   this.flowCellArray.size(); i++) {
      Boolean isNewChannel = false;
      Map sequenceLaneMap = new HashMap();
      JsonObject node = this.flowCellArray.getJsonObject(i);

      String idFlowCellChannelString =  Util.getJsonStringSafeNonNull(node,"idFlowCellChannel");
      // Is this HISEQ or MISEQ?
      String codeStepNext = "";
      // What is the core?
      Integer idCoreFacility = -1;
      List workItems = sess.createQuery("SELECT wi from WorkItem wi where idFlowCellChannel = " + idFlowCellChannelString).list();
      for (Iterator i1 = workItems.iterator(); i1.hasNext();) {
        WorkItem wi = (WorkItem)i1.next();
        codeStepNext = wi.getCodeStepNext();
        idCoreFacility = wi.getIdCoreFacility();
        break;
      }

      if (idFlowCellChannelString.startsWith("FlowCellChannel")
              || idFlowCellChannelString.equals("")) {

        isNewChannel = true;
        channel = new FlowCellChannel();
        channel.setSequenceLanes(new TreeSet(new LaneComparator()));

      } else {
        isNewChannel = false;
        channel = (FlowCellChannel) sess.get(FlowCellChannel.class,
                Integer.parseInt(idFlowCellChannelString));
      }

      this.initializeFlowCellChannel(sess, node, channel);

      JsonArray seqLaneArray = node.get("sequenceLanes") != null ? node.getJsonArray("sequenceLanes") : Json.createArrayBuilder().build();

      for (int i1 = 0 ; i1 < seqLaneArray.size(); i1++) {
        Boolean isNewLane = false;
        SequenceLane sl = new SequenceLane();
        JsonObject sequenceLaneNode = seqLaneArray.getJsonObject(i1);

        String idSequenceLaneString = Util.getJsonStringSafeNonNull(sequenceLaneNode, "idSequenceLane");

        if (idSequenceLaneString.startsWith("SequenceLane")
                || idSequenceLaneString.equals("")) {

          isNewLane = true;
          sl = new SequenceLane();
        } else {
          isNewLane = false;
          sl = (SequenceLane) sess.get(SequenceLane.class,
                  Integer.parseInt(idSequenceLaneString));
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
      if (channel.getSequenceLanes() != null
              || !channel.getSequenceLanes().isEmpty()) {

        TreeSet lanesToDelete = new TreeSet(new LaneComparator());
        for (Iterator i2 = channel.getSequenceLanes().iterator(); i2.hasNext();) {
          SequenceLane existingLane = (SequenceLane) i2.next();
          if (!sequenceLaneMap.containsKey(existingLane.getIdSequenceLane().toString())) {
            lanesToDelete.add(existingLane); // delete lane if it was stored in this channel but was not sent in the request (meaning the user deleted it from the channel)
          }
        }
        for (Iterator i2 = lanesToDelete.iterator(); i2.hasNext();) {
          SequenceLane laneToDelete = (SequenceLane) i2.next();
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
          if(codeStepNext.equals("HSEQFINFC") || codeStepNext.equals("HSEQPIPE")) {
            wi.setCodeStepNext("HSEQASSEM");
          } else if (codeStepNext.equals("MISEQFINFC") || codeStepNext.equals("MISEQPIPE")) {
            wi.setCodeStepNext("MISEQASSEM");
          } else if(codeStepNext.equals("NOSEQFINFC") || codeStepNext.equals("NOSEQPIPE")) {
            wi.setCodeStepNext("NOSEQASSEM");
          } else if(codeStepNext.equals("ILLSEQFINFC") || codeStepNext.equals("ILLSEQPIPE")) {
            wi.setCodeStepNext("ILLSEQASSEM");
          }
          sess.save(wi);
        }
      }

      //
      // Save newly added lanes to channel
      //
      for (Iterator i2 = sequenceLaneMap.keySet().iterator(); i2.hasNext();) {
        String idLaneString = (String) i2.next();
        SequenceLane sl = (SequenceLane) sequenceLaneMap.get(idLaneString);

        boolean exists = false;
        if (!isNewChannel) {
          if (channel.getSequenceLanes() != null
                  || !channel.getSequenceLanes().isEmpty()) {

            for (Iterator i3 = channel.getSequenceLanes().iterator(); i3.hasNext();) {
              SequenceLane existingLane = (SequenceLane) i3.next();

              if (existingLane.getIdSequenceLane().equals(
                      sl.getIdSequenceLane())) {

                exists = true;
              }
            }
          }
        }
        // New sequence lane -- add it to the list
        if (!exists) {
          channel.getSequenceLanes().add(sl);
          // delete the work item for the sequence lane
          workItems = sess.createQuery("SELECT wi from WorkItem wi where idSequenceLane = " + sl.getIdSequenceLane()).list();
          for (Iterator i1 = workItems.iterator(); i1.hasNext();) {
            WorkItem wi = (WorkItem)i1.next();
            sess.delete(wi);
            break;
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

  protected void initializeFlowCellChannel(Session sess, JsonObject n,
                                           FlowCellChannel channel) throws Exception {

    if (n.get("number") != null
            && !n.getString("number").equals("")) {

      channel.setNumber(new Integer(n.getString("number")));
    } else {
      channel.setNumber(null);
    }
    if (n.get("idFlowCell") != null
            && !n.getString("idFlowCell").equals("")) {

      channel.setIdFlowCell(new Integer(n.getString("idFlowCell")));
    }
    if (n.get("idSequencingControl") != null
            && !n.getString("idSequencingControl").equals("")) {

      channel.setIdSequencingControl(new Integer(
              n.getString("idSequencingControl")));
    } else{
      channel.setIdSequencingControl(null);
    }
    if (n.get("startDate") != null
            && !n.getString("startDate").equals("")){

      channel.setStartDate(this.parseDate(n.getString("startDate")));
    } else {
      channel.setStartDate(null);
    }
    if (n.get("firstCycleDate") != null
            && !n.getString("firstCycleDate").equals("")){

      channel.setFirstCycleDate(this.parseDate(n.getString("firstCycleDate")));
    } else {
      channel.setFirstCycleDate(null);
    }
    if (n.get("firstCycleDate") != null
            && !n.getString("firstCycleDate").equals("")){

      channel.setFirstCycleDate(this.parseDate(n.getString("firstCycleDate")));
    } else {
      channel.setFirstCycleDate(null);
    }
    if (n.get("firstCycleFailed") != null
            && !n.getString("firstCycleFailed").equals("")){

      channel.setFirstCycleFailed(n.getString("firstCycleFailed"));
    }
    if (n.get("lastCycleDate") != null
            && !n.getString("lastCycleDate").equals("")){

      channel.setLastCycleDate(this.parseDate(n.getString("lastCycleDate")));
    } else {
      channel.setLastCycleDate(null);
    }
    if (n.get("lastCycleFailed") != null
            && !n.getString("lastCycleFailed").equals("")){

      channel.setLastCycleFailed(n.getString("lastCycleFailed"));
    }
    if (n.get("clustersPerTile") != null
            && !n.getString("clustersPerTile").equals("")){

      channel.setClustersPerTile(new Integer(
              n.getString("clustersPerTile")));
    } else {
      channel.setClustersPerTile(null);
    }
    if (n.get("fileName") != null
            && !n.getString("fileName").equals("")){

      channel.setFileName(n.getString("fileName"));
    }
    if (n.get("sampleConcentrationpM") != null
            && !n.getString("sampleConcentrationpM").equals("")){

      channel.setSampleConcentrationpM(new BigDecimal(
              n.getString("sampleConcentrationpM")));
    } else {
      channel.setSampleConcentrationpM(null);
    }
    if (n.get("numberSequencingCyclesActual") != null
            && !n.getString("numberSequencingCyclesActual").equals("")){

      channel.setNumberSequencingCyclesActual(new Integer(
              n.getString("numberSequencingCyclesActual")));
    } else {
      channel.setNumberSequencingCyclesActual(null);
    }
    if (n.get("pipelineDate") != null
            && !n.getString("pipelineDate").equals("")){

      channel.setPipelineDate(this.parseDate(n.getString("pipelineDate")));
    } else {
      channel.setPipelineDate(null);
    }
    if (n.get("pipelineFailed") != null
            && !n.getString("pipelineFailed").equals("")){

      channel.setPipelineFailed(n.getString("pipelineFailed"));
    }
    if (n.get("isControl") != null
            && !n.getString("isControl").equals("")){

      channel.setIsControl(n.getString("isControl"));
    }
    if (n.get("phiXErrorRate") != null
            && !n.getString("phiXErrorRate").equals("")){

      channel.setPhiXErrorRate(new BigDecimal(
              n.getString("phiXErrorRate")));
    } else {
      channel.setPhiXErrorRate(null);
    }
    if (n.get("read1ClustersPassedFilterM") != null
            && !n.getString("read1ClustersPassedFilterM").equals("")){

      channel.setRead1ClustersPassedFilterM(new BigDecimal(n.getString("read1ClustersPassedFilterM")));
    } else {
      channel.setRead1ClustersPassedFilterM(null);
    }
    if (n.get("q30PercentForDisplay") != null
            && !n.getString("q30PercentForDisplay").equals("")){

      channel.setQ30Percent(new BigDecimal(n.getString("q30PercentForDisplay")).movePointLeft(2));
    } else {
      channel.setQ30Percent(null);
    }

    if (n.get("sampleConcentrationpM") != null
            && !n.getString("sampleConcentrationpM").equals("")){

      channel.setSampleConcentrationpM(new BigDecimal(n.getString("sampleConcentrationpM")));
    } else {
      channel.setSampleConcentrationpM(null);
    }

    if (n.get("idPipelineProtocol") != null
            && !n.getString("idPipelineProtocol").equals("")){

      channel.setIdPipelineProtocol(new Integer(
              n.getString("idPipelineProtocol")));
    } else {
      channel.setIdPipelineProtocol(null);
    }
  }

  public Map getChannelMap() {
    return channelMap;
  }

  public void setChannelMap(Map channelMap) {
    this.channelMap = channelMap;
  }

  private class LaneComparator implements Comparator, Serializable {
    public int compare(Object o1, Object o2) {
      SequenceLane u1 = (SequenceLane) o1;
      SequenceLane u2 = (SequenceLane) o2;
      return u1.getIdSequenceLane().compareTo(u2.getIdSequenceLane());
    }
  }
}
