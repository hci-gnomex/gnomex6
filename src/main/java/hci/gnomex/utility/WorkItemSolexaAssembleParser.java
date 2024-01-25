package hci.gnomex.utility;

import hci.gnomex.model.CoreFacility;
import hci.gnomex.model.SequenceLane;
import hci.gnomex.model.SequencingControl;
import hci.gnomex.model.WorkItem;
import hci.gnomex.security.SecurityAdvisor;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.*;


public class WorkItemSolexaAssembleParser implements Serializable {
  
  private Document   docFlowCellChannels;
  private Document   docDirtyWorkItem;
  private TreeMap<String, List<ChannelContent>> channelContentMap = new TreeMap<String, List<ChannelContent>>();
  private TreeMap<String, String>               channelConcentrationMap = new TreeMap<String, String>();
  private TreeMap<String, String>               controlMap = new TreeMap<String, String>();
  private ArrayList<WorkItem>                   dirtyWorkItemList = new ArrayList<WorkItem>();
  private Integer    idCoreFacility = null;     // core facility for chosen work items.
  private String     codeRequestCategory = "";
  
  public WorkItemSolexaAssembleParser(Document docFlowCellChannels, Document docDirtyWorkItem) {
    this.docFlowCellChannels = docFlowCellChannels;
    this.docDirtyWorkItem = docDirtyWorkItem;
 
  }
  
  public void parse(Session sess, SecurityAdvisor secAdvisor) throws Exception{
    
    // Parse the contents for flow cell channels
    if (docFlowCellChannels != null) {
      Element workItemListNode = this.docFlowCellChannels.getRootElement();
      
      for(Iterator<?> i = workItemListNode.getChildren().iterator(); i.hasNext();) {
        Element node = (Element)i.next();
        String flowCellChannelNumber = node.getAttributeValue("flowCellChannelNumber");
        ChannelContent cc = new ChannelContent();
        String sampleConcentration  = node.getAttributeValue("sampleConcentrationpM");
        String isControl  = node.getAttributeValue("isControl");
        String isEditable = node.getAttributeValue("editable");
            
        if (node.getName().equals("WorkItem")) {
          String idSequenceLaneString = node.getAttributeValue("idSequenceLane");
          String idWorkItemString     = node.getAttributeValue("idWorkItem");
          
          SequenceLane lane = (SequenceLane)sess.load(SequenceLane.class, Integer.valueOf(idSequenceLaneString));
          WorkItem workItem = (WorkItem)sess.load(WorkItem.class, Integer.valueOf(idWorkItemString));
          idCoreFacility = workItem.getIdCoreFacility();
          codeRequestCategory = node.getAttributeValue("codeRequestCategory");
          cc.setSequenceLane(lane);
          cc.setWorkItem(workItem);
        } else { // if it is not a <WorkItem> then it must be a <DictionaryEntry> for a SequencingControl
          String idSequencingControlString = node.getAttributeValue("idSequencingControl");
          SequencingControl control = (SequencingControl)sess.load(SequencingControl.class, Integer.valueOf(idSequencingControlString));
          cc.setSequenceControl(control);
        }
        
        //Kludge in case they ever create a flow cell with only a control on it.
        // This will only work so long as the user creating the flow cell is associated with
        // only one core facility.
        if (idCoreFacility == null) {
          Set facilities = secAdvisor.getCoreFacilitiesIManage();
          if (facilities.size() > 0) {
            CoreFacility facility = (CoreFacility)(facilities.iterator().next());
            idCoreFacility = facility.getIdCoreFacility();
          }
        }
        
        List<ChannelContent> channelContents = (List<ChannelContent>)channelContentMap.get(flowCellChannelNumber);
        if (channelContents == null) {
          channelContents = new ArrayList<ChannelContent>();
        }
        channelContents.add(cc);
        channelContentMap.put(flowCellChannelNumber, channelContents);
        
        if (isEditable != null && isEditable.equals("true")) {
          if (sampleConcentration != null && !sampleConcentration.equals("")) {
            channelConcentrationMap.put(flowCellChannelNumber, sampleConcentration);        
          }

          controlMap.put(flowCellChannelNumber, isControl != null && isControl.equals("true") ? "Y" : "N");
          
        }
        
      }
      
    }
    
    // Parse the work items that have a changed status
    // Parse the contents for flow cell channels
    if (docDirtyWorkItem != null) {
      Element dirtyWorkItemListNode = this.docDirtyWorkItem.getRootElement();
      
      for(Iterator<?> i = dirtyWorkItemListNode.getChildren().iterator(); i.hasNext();) {
        Element node = (Element)i.next();
        String idWorkItemString     = node.getAttributeValue("idWorkItem");
        WorkItem workItem = (WorkItem)sess.load(WorkItem.class, Integer.valueOf(idWorkItemString));
        if (node.getAttributeValue("assembleStatus") != null && !node.getAttributeValue("assembleStatus").equals("")) {
          workItem.setStatus(node.getAttributeValue("assembleStatus"));
        } else {
          workItem.setStatus(null);
        }
        dirtyWorkItemList.add(workItem);
      }
      
    }
    
   
  }
  


  public List<WorkItem> getDirtyWorkItemList() {
    return dirtyWorkItemList;
  }

  
  
  
  public void resetIsDirty() {
    if (docFlowCellChannels != null) {
      Element workItemListNode = this.docFlowCellChannels.getRootElement();      
      for(Iterator<?> i = workItemListNode.getChildren("WorkItem").iterator(); i.hasNext();) {
        Element workItemNode = (Element)i.next();
        workItemNode.setAttribute("isDirty", "N");
      }
    }
    if (this.docDirtyWorkItem != null) {
      Element workItemListNode = this.docDirtyWorkItem.getRootElement();      
      for(Iterator<?> i = workItemListNode.getChildren("WorkItem").iterator(); i.hasNext();) {
        Element workItemNode = (Element)i.next();
        workItemNode.setAttribute("isDirty", "N");
      }
    }
    
  }

  
  public Set<String> getChannelNumbers() {
    return channelContentMap.keySet();
  }
  
  public List<ChannelContent> getChannelContents(String flowCellChannelNumber) {
    return channelContentMap.get(flowCellChannelNumber);
  }

  public List<WorkItem> getWorkItems(String flowCellChannelNumber) {
    List<ChannelContent> channelContents =  channelContentMap.get(flowCellChannelNumber);
    List<WorkItem> workItems = new ArrayList<WorkItem>();
    for(Iterator<?> i = channelContents.iterator(); i.hasNext();) {
      ChannelContent cc = (ChannelContent)i.next();
      if (cc.getWorkItem() != null) {
        workItems.add(cc.getWorkItem());
      }
    }
    return workItems;
  }
  
  public BigDecimal getSampleConcentrationpm(String flowCellChannelNumber) {
    String sc = (String)channelConcentrationMap.get(flowCellChannelNumber);
    if (sc != null && !sc.equals("")) {
      return new BigDecimal(sc);
    } else {
      return null;
    }
  }
  
  public String getIsControl(String flowCellChannelNumber) {
    String isControl = this.controlMap.get(flowCellChannelNumber);
    return isControl;
  }
  
  public Integer getIdCoreFacility() {
    return this.idCoreFacility;
  }
  
  public String getCodeRequestCategory() {
    return this.codeRequestCategory;
  }

  public static class ChannelContent implements Serializable{
    private SequenceLane sequenceLane;
    private SequencingControl sequenceControl;
    private WorkItem workItem;
    private String isControl;

    
    public SequenceLane getSequenceLane() {
      return sequenceLane;
    }
    
    public void setSequenceLane(SequenceLane sequenceLane) {
      this.sequenceLane = sequenceLane;
    }
    
    public SequencingControl getSequenceControl() {
      return sequenceControl;
    }
    
    public void setSequenceControl(SequencingControl sequenceControl) {
      this.sequenceControl = sequenceControl;
    }
    
    public WorkItem getWorkItem() {
      return workItem;
    }
    
    public void setWorkItem(WorkItem workItem) {
      this.workItem = workItem;
    }

    public String getIsControl() {
      return isControl;
    }

    public void setIsControl(String isControl) {
      this.isControl = isControl;
    }
  }


}
