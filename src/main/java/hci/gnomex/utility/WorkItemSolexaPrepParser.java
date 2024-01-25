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


public class WorkItemSolexaPrepParser implements Serializable {
  
  private Document   doc;
  private Map        sampleMap = new HashMap();
  private List       workItems = new ArrayList();
  
  
  public WorkItemSolexaPrepParser(Document doc) {
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
      
      
      if (workItemNode.getAttributeValue("seqPrepStatus") != null && !workItemNode.getAttributeValue("seqPrepStatus").equals("")) {
        workItem.setStatus(workItemNode.getAttributeValue("seqPrepStatus"));
      } else {
        workItem.setStatus(null);
      }
      
      this.initializeSample(workItemNode, sample);
      
      sampleMap.put(workItem.getIdWorkItem(), sample);
      workItems.add(workItem);
    }
    
   
  }
  

  
  private void initializeSample(Element n, Sample sample) throws Exception {
    if (n.getAttributeValue("seqPrepStatus") != null && !n.getAttributeValue("seqPrepStatus").equals("")) {
      String status = n.getAttributeValue("seqPrepStatus");
      if (status.equals(Constants.STATUS_COMPLETED)) {
        sample.setSeqPrepDate(new java.sql.Date(System.currentTimeMillis()));      
        sample.setSeqPrepFailed("N");
        sample.setSeqPrepBypassed("N");
        
      } else if (status.equals(Constants.STATUS_TERMINATED)) {
        sample.setSeqPrepDate(null);
        sample.setSeqPrepFailed("Y");
        sample.setSeqPrepBypassed("N");
        
      } else if (status.equals(Constants.STATUS_BYPASSED)) {
        sample.setSeqPrepDate(null);
        sample.setSeqPrepFailed("N");
        sample.setSeqPrepBypassed("Y");        
      }
    } else {
      sample.setSeqPrepDate(null);
      sample.setSeqPrepFailed("N");
      sample.setSeqPrepBypassed("N");
    }
    
    
    if (n.getAttributeValue("seqPrepLibConcentration") != null && !n.getAttributeValue("seqPrepLibConcentration").equals("")) {
      sample.setSeqPrepLibConcentration(new BigDecimal(n.getAttributeValue("seqPrepLibConcentration")));
    } else {
      sample.setSeqPrepLibConcentration(null);
    }

    if (n.getAttributeValue("idLibPrepPerformedBy") != null && !n.getAttributeValue("idLibPrepPerformedBy").equals("")) {
      sample.setIdLibPrepPerformedBy(Integer.valueOf(n.getAttributeValue("idLibPrepPerformedBy")));
    } else {
      sample.setIdLibPrepPerformedBy(null);
    }

    if (n.getAttributeValue("seqPrepQualCodeBioanalyzerChipType") != null && !n.getAttributeValue("seqPrepQualCodeBioanalyzerChipType").equals("")) {
      sample.setSeqPrepQualCodeBioanalyzerChipType(n.getAttributeValue("seqPrepQualCodeBioanalyzerChipType"));
    } else {
      sample.setSeqPrepQualCodeBioanalyzerChipType(null);
    }    
    
    if (n.getAttributeValue("seqPrepGelFragmentSizeFrom") != null && !n.getAttributeValue("seqPrepGelFragmentSizeFrom").equals("")) {
      sample.setSeqPrepGelFragmentSizeFrom(Integer.valueOf(n.getAttributeValue("seqPrepGelFragmentSizeFrom")));
    } else {
      sample.setSeqPrepGelFragmentSizeFrom(null);
    }    

    if (n.getAttributeValue("seqPrepGelFragmentSizeTo") != null && !n.getAttributeValue("seqPrepGelFragmentSizeTo").equals("")) {
      sample.setSeqPrepGelFragmentSizeTo(Integer.valueOf(n.getAttributeValue("seqPrepGelFragmentSizeTo")));
    } else {
      sample.setSeqPrepGelFragmentSizeTo(null);
    }    
    if (n.getAttributeValue("idSeqLibProtocol") != null && !n.getAttributeValue("idSeqLibProtocol").equals("")) {
      sample.setIdSeqLibProtocol(Integer.valueOf(n.getAttributeValue("idSeqLibProtocol")));
    } else {
      sample.setIdSeqLibProtocol(null);
    }    
    if (n.getAttributeValue("idOligoBarcode") != null && !n.getAttributeValue("idOligoBarcode").equals("")) {
      sample.setIdOligoBarcode(Integer.valueOf(n.getAttributeValue("idOligoBarcode")));
    } else {
      sample.setIdOligoBarcode(null);
    }
    if (n.getAttributeValue("meanLibSizeActual") != null && !n.getAttributeValue("meanLibSizeActual").equals("")) {
      sample.setMeanLibSizeActual((Integer.valueOf(n.getAttributeValue("meanLibSizeActual"))));
    } else {
      sample.setMeanLibSizeActual(null);
    }
    if (n.getAttributeValue("idOligoBarcodeB") != null && !n.getAttributeValue("idOligoBarcodeB").equals("")) {
      sample.setIdOligoBarcodeB(Integer.valueOf(n.getAttributeValue("idOligoBarcodeB")));
    } else {
      sample.setIdOligoBarcodeB(null);
    }
    if (n.getAttributeValue("barcodeSequence") != null && !n.getAttributeValue("barcodeSequence").equals("")) {
      sample.setBarcodeSequence(n.getAttributeValue("barcodeSequence"));
    } else {
      sample.setBarcodeSequence(null);
    }
    if (n.getAttributeValue("barcodeSequenceB") != null && !n.getAttributeValue("barcodeSequenceB").equals("")) {
      sample.setBarcodeSequenceB(n.getAttributeValue("barcodeSequenceB"));
    } else {
      sample.setBarcodeSequenceB(null);
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
