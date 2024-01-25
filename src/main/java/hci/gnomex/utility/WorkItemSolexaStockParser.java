package hci.gnomex.utility;

import hci.gnomex.constants.Constants;
import hci.gnomex.model.Sample;
import hci.gnomex.model.WorkItem;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;

import java.io.Serializable;
import java.util.*;


public class WorkItemSolexaStockParser implements Serializable {
  
  private Document   doc;
  private Map        sampleMap = new HashMap();
  private List       workItems = new ArrayList();
  
  
  public WorkItemSolexaStockParser(Document doc) {
    this.doc = doc;
 
  }
  
  public void parse(Session sess) throws Exception{
    
    Element workItemListNode = this.doc.getRootElement();
    
    
    for(Iterator i = workItemListNode.getChildren("WorkItem").iterator(); i.hasNext();) {
      Element workItemNode = (Element)i.next();
      
      String idSampleString   = workItemNode.getAttributeValue("idSample");
      String idWorkItemString = workItemNode.getAttributeValue("idWorkItem");
      
      Sample sample = (Sample)sess.load(Sample.class, Integer.valueOf(idSampleString));
      WorkItem workItem = (WorkItem)sess.load(WorkItem.class, Integer.valueOf(idWorkItemString));
      
      if (workItemNode.getAttributeValue("seqPrepStockStatus") != null && !workItemNode.getAttributeValue("seqPrepStockStatus").equals("")) {
        workItem.setStatus(workItemNode.getAttributeValue("seqPrepStockStatus"));
      } else {
        workItem.setStatus(null);
      }
      
      this.initializeSample(workItemNode, sample);
      
      sampleMap.put(workItem.getIdWorkItem(), sample);
      workItems.add(workItem);
    }
    
   
  }
  

  
  private void initializeSample(Element n, Sample sample) throws Exception {
    if (n.getAttributeValue("seqPrepStockStatus") != null && !n.getAttributeValue("seqPrepStockStatus").equals("")) {
      String status = n.getAttributeValue("seqPrepStockStatus");
      if (status.equals(Constants.STATUS_COMPLETED)) {
        sample.setSeqPrepStockDate(new java.sql.Date(System.currentTimeMillis()));      
        sample.setSeqPrepStockFailed("N");
        sample.setSeqPrepStockBypassed("N");
        
      } else if (status.equals(Constants.STATUS_TERMINATED)) {
        sample.setSeqPrepStockDate(null);
        sample.setSeqPrepStockFailed("Y");
        sample.setSeqPrepStockBypassed("N");
        
      } else if (status.equals(Constants.STATUS_BYPASSED)) {
        sample.setSeqPrepStockDate(null);
        sample.setSeqPrepStockFailed("N");
        sample.setSeqPrepStockBypassed("Y");        
      }
    } else {
      sample.setSeqPrepStockDate(null);
      sample.setSeqPrepStockFailed("N");
      sample.setSeqPrepStockBypassed("N");
    }
  }

  
  public Sample getSample(Integer idWorkItem) {
    return (Sample)sampleMap.get(idWorkItem);
  }
  
  public List getWorkItems() {
    return workItems;
  }
  
  
  public void resetIsDirty() {
    Element workItemListNode = this.doc.getRootElement();
    
    for(Iterator i = workItemListNode.getChildren("WorkItem").iterator(); i.hasNext();) {
      Element workItemNode = (Element)i.next();
      workItemNode.setAttribute("isDirty", "N");
    }
  }


  


}
