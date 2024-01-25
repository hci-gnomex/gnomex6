package hci.gnomex.utility;

import hci.gnomex.constants.Constants;
import hci.gnomex.model.Sample;
import hci.gnomex.model.WorkItem;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.*;


public class WorkItemQualityControlParser implements Serializable {
  
  private Document   doc;
  private Map        sampleMap = new HashMap();
  private List       workItems = new ArrayList();
  
  
  public WorkItemQualityControlParser(Document doc) {
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
      
      if (workItemNode.getAttributeValue("qualStatus") != null && !workItemNode.getAttributeValue("qualStatus").equals("")) {
        workItem.setStatus(workItemNode.getAttributeValue("qualStatus"));
      } else {
        workItem.setStatus(null);
      }

      
      this.initializeSample(workItemNode, sample);
      
      sampleMap.put(workItem.getIdWorkItem(), sample);
      workItems.add(workItem);
    }
    
   
  }
  

  
  private void initializeSample(Element n, Sample sample) throws Exception {
    if (n.getAttributeValue("qualStatus") != null && !n.getAttributeValue("qualStatus").equals("")) {
      String status = n.getAttributeValue("qualStatus");
      if (status.equals(Constants.STATUS_COMPLETED)) {
        sample.setQualDate(new java.sql.Date(System.currentTimeMillis()));      
        sample.setQualFailed("N");
        sample.setQualBypassed("N");
        
      } else if (status.equals(Constants.STATUS_TERMINATED)) {
        sample.setQualDate(null);
        sample.setQualFailed("Y");
        sample.setQualBypassed("N");
        
      } else if (status.equals(Constants.STATUS_BYPASSED)) {
        sample.setQualDate(null);
        sample.setQualFailed("N");
        sample.setQualBypassed("Y");        
      }
    } else {
      sample.setQualDate(null);
      sample.setQualFailed("N");
      sample.setQualBypassed("N");
    }
    
    
    
    if (n.getAttributeValue("qual260nmTo280nmRatio") != null && !n.getAttributeValue("qual260nmTo280nmRatio").equals("")) {
      sample.setQual260nmTo280nmRatio(new BigDecimal(n.getAttributeValue("qual260nmTo280nmRatio")));
    } else {
      sample.setQual260nmTo280nmRatio(null);
    }
    
    if (n.getAttributeValue("qual260nmTo230nmRatio") != null && !n.getAttributeValue("qual260nmTo230nmRatio").equals("")) {
      sample.setQual260nmTo230nmRatio(new BigDecimal(n.getAttributeValue("qual260nmTo230nmRatio")));
    } else {
      sample.setQual260nmTo230nmRatio(null);
    }
    
    
    if (n.getAttributeValue("qualFragmentSizeFrom") != null && !n.getAttributeValue("qualFragmentSizeFrom").equals("")) {
      sample.setQualFragmentSizeFrom(Integer.valueOf(n.getAttributeValue("qualFragmentSizeFrom")));
    } else {
      sample.setQualFragmentSizeFrom(null);
    }
    if (n.getAttributeValue("qualFragmentSizeTo") != null && !n.getAttributeValue("qualFragmentSizeTo").equals("")) {
      sample.setQualFragmentSizeTo(Integer.valueOf(n.getAttributeValue("qualFragmentSizeTo")));
    } else {
      sample.setQualFragmentSizeTo(null);
    }
    
    if (n.getAttributeValue("qualCalcConcentration") != null && !n.getAttributeValue("qualCalcConcentration").equals("")) {
      sample.setQualCalcConcentration(new BigDecimal(n.getAttributeValue("qualCalcConcentration")));
    } else {
      sample.setQualCalcConcentration(null);
    }
    
    if (n.getAttributeValue("qual28sTo18sRibosomalRatio") != null && !n.getAttributeValue("qual28sTo18sRibosomalRatio").equals("")) {
      sample.setQual28sTo18sRibosomalRatio(new BigDecimal(n.getAttributeValue("qual28sTo18sRibosomalRatio")));
    } else {
      sample.setQual28sTo18sRibosomalRatio(null);
    }
    
    if (n.getAttributeValue("qualRINNumber") != null && !n.getAttributeValue("qualRINNumber").equals("")) {
      sample.setQualRINNumber(n.getAttributeValue("qualRINNumber"));
    } else {
      sample.setQualRINNumber(null);
    }    
    
    if (n.getAttributeValue("qualCodeBioanalyzerChipType") != null && !n.getAttributeValue("qualCodeBioanalyzerChipType").equals("")) {
      sample.setCodeBioanalyzerChipType(n.getAttributeValue("qualCodeBioanalyzerChipType"));
    } else {
      sample.setCodeBioanalyzerChipType(null);
    }    
    
    if (n.getAttributeValue("qualCodeApplication") != null && !n.getAttributeValue("qualCodeApplication").equals("")) {
      sample.setQcCodeApplication(n.getAttributeValue("qualCodeApplication"));
    } else {
      sample.setQcCodeApplication(null);
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
