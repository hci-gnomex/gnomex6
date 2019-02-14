package hci.gnomex.utility;

import hci.framework.model.DetailObject;
import hci.gnomex.model.SequenceLane;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;


public class AnalysisLaneParser extends DetailObject implements Serializable {
  
  protected Document    doc;
  private JsonArray     lanesList;
  protected List        idSequenceLaneList = new ArrayList();
  protected List        idSampleList = new ArrayList();
  protected HashMap     idRequestMap = new HashMap();
  
  public AnalysisLaneParser(Document doc) {
    this.doc = doc;
 
  }
  public AnalysisLaneParser(JsonArray lanesList){
    this.lanesList = lanesList;
  }


  
  public void parse(Session sess, boolean isBatchMode, boolean isLinkBySample) throws Exception{
    if(this.doc != null){
      parseXML(sess,isBatchMode,isLinkBySample);
    }else if(this.lanesList != null){
      parseJSON(sess,isBatchMode,isLinkBySample);
    }


  }

  private void parseJSON(Session sess, boolean isBatchMode, boolean isLinkBySample) {
    JsonArray lanesByExperiment =  Json.createArrayBuilder().build();
    JsonArray lanesBySeqLane = Json.createArrayBuilder().build();
    JsonArray lanesBySample =  Json.createArrayBuilder().build();

    if(lanesList.size() > 0){
      String laneType = lanesList.getJsonObject(0).get("xmlNodeName") != null ? lanesList.getJsonObject(0).getString("xmlNodeName") : "";
      if(laneType.equals("")){
        laneType = lanesList.getJsonObject(0).getString("type") != null ? lanesList.getJsonObject(0).getString("type") : "";
        if(laneType.equals("")){
          throw new  RuntimeException("Cannot determine analysis experiment item type");
        }
      }

      if(laneType.equals("SequenceLane") ){
        lanesBySeqLane = lanesList;
      }else if(laneType.equals("Experiment")){
        lanesByExperiment = lanesList;
      }else if(laneType.equals("Sample")){
        lanesBySample = lanesList;
      }
    }

    for(int i = 0; i < lanesBySeqLane.size(); i++) {
      JsonObject node = lanesBySeqLane.getJsonObject(i);

      if (isBatchMode) {
        String seqLaneNumber = node.get("number") != null ? node.getString("number") : "";
        SequenceLane seqLane = (SequenceLane)sess.createQuery("SELECT l from SequenceLane l where number = '" + seqLaneNumber + "'").uniqueResult();
        if (seqLane == null) {
          throw new RuntimeException("Cannot find sequence lane " + seqLaneNumber);
        }
        idSequenceLaneList.add(seqLane.getIdSequenceLane());
        idRequestMap.put(seqLane.getIdSequenceLane(), seqLane.getIdRequest());
      } else {
        String idSequenceLaneString = node.get("idSequenceLane") != null ? node.getString("idSequenceLane") : "";
        Integer idSequenceLane = new Integer(idSequenceLaneString);
        idSequenceLaneList.add(idSequenceLane);

        String idRequestString = node.get("idRequest") != null ? node.getString("idRequest"): "";
        if (idRequestString == null || idRequestString.equals("")) {
          // idRequest wasn't provided on the JSON element, so look up the
          // idSequenceLane to get to the request.
          SequenceLane lane = (SequenceLane)sess.load(SequenceLane.class, Integer.valueOf(idSequenceLane));
          idRequestMap.put(idSequenceLane, lane.getIdRequest());

        } else {
          // The idRequest was provided on the XML element, so just use it to save
          // the extra read
          idRequestMap.put(idSequenceLane, new Integer(idRequestString));

        }

      }


    }

    for(int i = 0; i < lanesByExperiment.size(); i++) {
      JsonObject obj = lanesByExperiment.getJsonObject(i);
      if (isBatchMode) {
        String experimentNumber = obj.get("number") != null ? obj.getString("number"): "";
        if (!isLinkBySample){
          List<Object[]> rows = (List<Object[]>) sess.createQuery("SELECT r.id, l.id from Request r join r.sequenceLanes l where r.number = '" + experimentNumber + "'").list();
          if (rows == null || rows.size() == 0) {
            throw new RuntimeException("Cannot find sequence lanes when searching by ExperimentNumber " + experimentNumber);
          }
          for (Object[] row : rows) {
            Integer idRequest = (Integer) row[0];
            Integer idSequenceLane = (Integer) row[1];
            idSequenceLaneList.add(idSequenceLane);
            idRequestMap.put(idSequenceLane, idRequest);
          }
        }else{
          List<Object[]> rows = (List<Object[]>) sess.createQuery("SELECT r.id, s.id from Request r join r.samples s where r.number = '" + experimentNumber + "'").list();
          if(rows == null || rows.size() == 0){
            throw new RuntimeException("Cannot find sample when searching by ExperimentNumber " + experimentNumber);
          }
          for (Object[] row : rows) {
            Integer idRequest = (Integer) row[0];
            Integer idSample = (Integer) row[1];
            idSampleList.add(idSample);
            idRequestMap.put(idSample, idRequest);
          }

        }

      }
    }

    for(int i = 0; i < lanesBySample.size(); i++) {
      JsonObject obj = lanesBySample.getJsonObject(i);

      if (isBatchMode) {
        String sampleNumber = obj.get("number") != null ? obj.getString("number") : "";
        List<Object[]> rows = (List<Object[]>)sess.createQuery("SELECT r.idRequest, l.idSequenceLane from Request r join r.sequenceLanes l join l.sample s where s.number = '" + sampleNumber + "'").list();
        if (rows == null || rows.size() == 0) {
          throw new RuntimeException("Cannot find sequenceLane when searching by SampleNumber  " + sampleNumber);
        }
        for (Object[] row : rows) {
          Integer idRequest = (Integer)row[0];
          Integer idSequenceLane = (Integer)row[1];
          idSequenceLaneList.add(idSequenceLane);
          idRequestMap.put(idSequenceLane, idRequest);
        }
      }
    }
  }

  private void parseXML(Session sess, boolean isBatchMode, boolean isLinkBySample) throws Exception{
    Element root = this.doc.getRootElement();

    for(Iterator i = root.getChildren("SequenceLane").iterator(); i.hasNext();) {
      Element node = (Element)i.next();

      if (isBatchMode) {
        String seqLaneNumber = node.getAttributeValue("number");
        SequenceLane seqLane = (SequenceLane)sess.createQuery("SELECT l from SequenceLane l where number = '" + seqLaneNumber + "'").uniqueResult();
        if (seqLane == null) {
          throw new RuntimeException("Cannot find sequence lane " + seqLaneNumber);
        }
        idSequenceLaneList.add(seqLane.getIdSequenceLane());
        idRequestMap.put(seqLane.getIdSequenceLane(), seqLane.getIdRequest());
      } else {
        String idSequenceLaneString = node.getAttributeValue("idSequenceLane");
        Integer idSequenceLane = new Integer(idSequenceLaneString);
        idSequenceLaneList.add(idSequenceLane);

        String idRequestString = node.getAttributeValue("idRequest");
        if (idRequestString == null || idRequestString.equals("")) {
          // idRequest wasn't provided on the XML element, so look up the
          // idSequenceLane to get to the request.
          SequenceLane lane = (SequenceLane)sess.load(SequenceLane.class, Integer.valueOf(idSequenceLane));
          idRequestMap.put(idSequenceLane, lane.getIdRequest());

        } else {
          // The idRequest was provided on the XML element, so just use it to save
          // the extra read
          idRequestMap.put(idSequenceLane, new Integer(idRequestString));

        }

      }


    }

    for(Iterator i = root.getChildren("Experiment").iterator(); i.hasNext();) {
      Element node = (Element)i.next();

      if (isBatchMode) {
        String experimentNumber = node.getAttributeValue("number");
        if (!isLinkBySample){
          List<Object[]> rows = (List<Object[]>) sess.createQuery("SELECT r.id, l.id from Request r join r.sequenceLanes l where r.number = '" + experimentNumber + "'").list();
          if (rows == null || rows.size() == 0) {
            throw new RuntimeException("Cannot find experiment when joining sequence lanes " + experimentNumber);
          }
          for (Object[] row : rows) {
            Integer idRequest = (Integer) row[0];
            Integer idSequenceLane = (Integer) row[1];
            idSequenceLaneList.add(idSequenceLane);
            idRequestMap.put(idSequenceLane, idRequest);
          }
        }else{
          List<Object[]> rows = (List<Object[]>) sess.createQuery("SELECT r.id, s.id from Request r join r.samples s where r.number = '" + experimentNumber + "'").list();
          if(rows == null || rows.size() == 0){
            throw new RuntimeException("Cannot find experiment when joining sample " + experimentNumber);
          }
          for (Object[] row : rows) {
            Integer idRequest = (Integer) row[0];
            Integer idSample = (Integer) row[1];
            idSampleList.add(idSample);
            idRequestMap.put(idSample, idRequest);
          }

        }

      }
    }

    for(Iterator i = root.getChildren("Sample").iterator(); i.hasNext();) {
      Element node = (Element)i.next();

      if (isBatchMode) {
        String sampleNumber = node.getAttributeValue("number");
        List<Object[]> rows = (List<Object[]>)sess.createQuery("SELECT r.idRequest, l.idSequenceLane from Request r join r.sequenceLanes l join l.sample s where s.number = '" + sampleNumber + "'").list();

        if (rows == null || rows.size() == 0) {
          throw new RuntimeException("Cannot find sample  " + sampleNumber);
        }
        for (Object[] row : rows) {
          Integer idRequest = (Integer)row[0];
          Integer idSequenceLane = (Integer)row[1];
          idSequenceLaneList.add(idSequenceLane);
          idRequestMap.put(idSequenceLane, idRequest);
        }
      }
    }
  }


  
  public List getIdSequenceLanes() {
    return idSequenceLaneList;
  }
  public List getIdSamples() {
    return idSampleList;
  }
  
  public Integer getIdRequest(Integer idSequenceLane) {
    return (Integer)idRequestMap.get(idSequenceLane);
  }
  
}
