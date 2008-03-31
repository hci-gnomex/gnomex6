package hci.gnomex.utility;

import hci.gnomex.constants.Constants;
import hci.gnomex.model.ConcentrationUnit;
import hci.gnomex.model.Request;
import hci.gnomex.model.Sample;
import hci.gnomex.model.SampleCharacteristic;
import hci.gnomex.model.SampleCharacteristicEntry;
import hci.gnomex.model.TreatmentEntry;
import hci.gnomex.security.SecurityAdvisor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.hibernate.Session;
import org.jdom.Attribute;
import org.jdom.Document;
import org.jdom.Element;


public class RequestParser implements Serializable {
  
  private SecurityAdvisor secAdvisor;
  private Document        requestDoc;
  private Request         request;
  private boolean        isNewRequest = false;
  private String          otherCharacteristicLabel;
  private List            sampleIds = new ArrayList();
  private Map             sampleMap = new HashMap();
  private Map             characteristicsToApplyMap = new TreeMap();
  private Map             sampleAnnotationMap = new HashMap();
  private boolean        showTreatments = false;
  private Map             sampleTreatmentMap = new HashMap();
  private Map             sampleAnnotationCodeMap = new TreeMap();
  private List            hybInfos = new ArrayList();
  private List            sequenceLaneInfos = new ArrayList();
  private boolean        saveReuseOfSlides = false;
  
  
  public RequestParser(Document requestDoc, SecurityAdvisor secAdvisor) {
    this.requestDoc = requestDoc;
    this.secAdvisor = secAdvisor;
 
  }
  
  public void parse() throws Exception{
    
    Element requestNode = this.requestDoc.getRootElement();
    request = new Request();
    request.setCreateDate(new java.sql.Date(System.currentTimeMillis()));
    isNewRequest = true;
    this.initializeRequest(requestNode, request);
    
    for(Iterator i = requestNode.getChild("samples").getChildren("Sample").iterator(); i.hasNext();) {
      Element sampleNode = (Element)i.next();
      String idSampleString = sampleNode.getAttributeValue("idSample");
      Sample sample = new Sample();
      this.initializeSample(sampleNode, sample, idSampleString, true);
    }
    
    
    if (requestNode.getChild("hybridizations") != null && 
        !requestNode.getChild("hybridizations").getChildren("Hybridization").isEmpty()) {

      for(Iterator i = requestNode.getChild("hybridizations").getChildren("Hybridization").iterator(); i.hasNext();) {
        Element hybNode = (Element)i.next();
        initializeHyb(hybNode);
      }            
    }
    if (requestNode.getChild("sequenceLanes") != null && 
        !requestNode.getChild("sequenceLanes").getChildren("SequenceLane").isEmpty()) {

      for(Iterator i = requestNode.getChild("sequenceLanes").getChildren("SequenceLane").iterator(); i.hasNext();) {
        Element sequenceLaneNode = (Element)i.next();
        initializeSequenceLane(sequenceLaneNode);
      }            
    }
    
  }
  
  public void parse(Session sess) throws Exception{
    
    Element requestNode = this.requestDoc.getRootElement();
    this.initializeRequest(requestNode, sess);
    
    for(Iterator i = requestNode.getChild("samples").getChildren("Sample").iterator(); i.hasNext();) {
      Element sampleNode = (Element)i.next();
      this.initializeSample(sampleNode, sess);      
    }
    
    
    if (requestNode.getChild("hybridizations") != null && 
        !requestNode.getChild("hybridizations").getChildren("Hybridization").isEmpty()) {

      for(Iterator i = requestNode.getChild("hybridizations").getChildren("Hybridization").iterator(); i.hasNext();) {
        Element hybNode = (Element)i.next();
        initializeHyb(hybNode);
      }            
    }
    if (requestNode.getChild("sequenceLanes") != null && 
        !requestNode.getChild("sequenceLanes").getChildren("SequenceLane").isEmpty()) {

      for(Iterator i = requestNode.getChild("sequenceLanes").getChildren("SequenceLane").iterator(); i.hasNext();) {
        Element sequenceLaneNode = (Element)i.next();
        initializeSequenceLane(sequenceLaneNode);
      }            
    }    
    
  }

  
  private void initializeRequest(Element n, Session sess) throws Exception {
      
      Integer idRequest = new Integer(n.getAttributeValue("idRequest"));
      if (idRequest.intValue() == 0) {
        request = new Request();
        request.setCreateDate(new java.sql.Date(System.currentTimeMillis()));
        isNewRequest = true;
      } else {
        request = (Request)sess.load(Request.class, idRequest);
        saveReuseOfSlides = true;
        
        // Only some users have permissions to set the visiblity on the request
        if (this.secAdvisor.canUpdate(request, SecurityAdvisor.PROFILE_OBJECT_VISIBILITY)) {
          request.setCodeVisibility(n.getAttributeValue("codeVisibility"));
        }
      }
      
      initializeRequest(n, request);
  }
  
  
  private void initializeRequest(Element n, Request request) throws Exception {
    
    
    
    otherCharacteristicLabel = this.unEscape(n.getAttributeValue(SampleCharacteristicEntry.OTHER_LABEL));
    
    request.setCodeMicroarrayCategory(n.getAttributeValue("codeMicroarrayCategory"));
    request.setCodeRequestCategory(n.getAttributeValue("codeRequestCategory"));
    
    if (n.getAttributeValue("idAppUser") != null && !n.getAttributeValue("idAppUser").equals("")) {
      request.setIdAppUser(new Integer(n.getAttributeValue("idAppUser")));
    } 
    if (n.getAttributeValue("idLab") != null && !n.getAttributeValue("idLab").equals("")) {
      request.setIdLab(new Integer(n.getAttributeValue("idLab")));
    }
    if (n.getAttributeValue("idProject") != null && !n.getAttributeValue("idProject").equals("")) {
      request.setIdProject(new Integer(n.getAttributeValue("idProject")));      
    }
    
    if (n.getAttributeValue("idSlideProduct") != null && !n.getAttributeValue("idSlideProduct").equals("")) {
      request.setIdSlideProduct(new Integer(n.getAttributeValue("idSlideProduct")));      
    }
    
    if (n.getAttributeValue("idSampleTypeDefault") != null && !n.getAttributeValue("idSampleTypeDefault").equals("")) {
      request.setIdSampleTypeDefault(new Integer(n.getAttributeValue("idSampleTypeDefault")));      
    }
    if (n.getAttributeValue("idOrganismSampleDefault") != null && !n.getAttributeValue("idOrganismSampleDefault").equals("")) {
      request.setIdOrganismSampleDefault(new Integer(n.getAttributeValue("idOrganismSampleDefault")));
    } else {
      request.setIdOrganismSampleDefault(null);
    }
    if (n.getAttributeValue("idSampleSourceDefault") != null && !n.getAttributeValue("idSampleSourceDefault").equals("")) {
      request.setIdSampleSourceDefault(new Integer(n.getAttributeValue("idSampleSourceDefault")));      
    }        
    if (n.getAttributeValue("idSamplePrepMethodDefault") != null && !n.getAttributeValue("idSamplePrepMethodDefault").equals("")) {
      request.setIdSamplePrepMethodDefault(new Integer(n.getAttributeValue("idSamplePrepMethodDefault")));      
    }
    if (n.getAttributeValue("idBillingAccount") != null && !n.getAttributeValue("idBillingAccount").equals("")) {
      request.setIdBillingAccount(new Integer(n.getAttributeValue("idBillingAccount")));      
    }
    if (n.getAttributeValue("codeProtocolType") != null && !n.getAttributeValue("codeProtocolType").equals("")) {
      request.setCodeProtocolType(n.getAttributeValue("codeProtocolType"));
    }
    if (n.getAttributeValue("codeBioanalyzerChipType") != null && !n.getAttributeValue("codeBioanalyzerChipType").equals("")) {
      request.setCodeBioanalyzerChipType(n.getAttributeValue("codeBioanalyzerChipType"));      
    }
    request.setProtocolNumber(n.getAttributeValue("protocolNumber"));      
   

    //  Map all of the characteristics that were checked -- these represent the annotations to apply.
    // (All others should be ignored.)
    for(Iterator i = n.getAttributes().iterator(); i.hasNext();) {
      Attribute a = (Attribute)i.next();
      if (SampleCharacteristic.isValidCode(a.getName())) {
        if (a.getValue().equalsIgnoreCase("Y")) {
          this.characteristicsToApplyMap.put(a.getName(), null);
        }
      }
    }
    
    // Figure out if the user intended to save sample treatments
    if (n.getAttributeValue(TreatmentEntry.TREATMENT) != null && 
        n.getAttributeValue(TreatmentEntry.TREATMENT).equalsIgnoreCase("Y")) {
      showTreatments = true;
    }
    
    // Is reuse slides checked on request (for new submits only, not updates)
    if (n.getAttributeValue("reuseSlides") != null && n.getAttributeValue("reuseSlides").equalsIgnoreCase("Y")) {
      this.saveReuseOfSlides = true;
    }
  }
  
  private void initializeSample(Element n, Session sess) throws Exception {
    boolean isNewSample = false;
    Sample sample = null;
    
    String idSampleString = n.getAttributeValue("idSample");
    if (isNewRequest || idSampleString == null || idSampleString.startsWith("Sample")) {
      sample = new Sample();
      isNewSample = true;
    } else {
      sample = (Sample)sess.load(Sample.class, new Integer(idSampleString));
    }
    
    initializeSample(n, sample, idSampleString, isNewSample);
        
  }
  
 
  private void initializeSample(Element n, Sample sample, String idSampleString, boolean isNewSample) throws Exception {
    
    sample.setName(unEscape(n.getAttributeValue("name")));
    
    sample.setDescription(unEscape(n.getAttributeValue("description")));
    
    if (n.getAttributeValue("idSampleSource") != null && !n.getAttributeValue("idSampleSource").equals("")) {
      sample.setIdSampleSource(new Integer(n.getAttributeValue("idSampleSource")));
    } else {
      sample.setIdSampleSource(null);
    }
    if (n.getAttributeValue("idSampleType") != null && !n.getAttributeValue("idSampleType").equals("")) {
      sample.setIdSampleType(new Integer(n.getAttributeValue("idSampleType")));
    } else {
      sample.setIdSampleType(null);
    }
    if (n.getAttributeValue("idSamplePrepMethod") != null && !n.getAttributeValue("idSamplePrepMethod").equals("")) {
      sample.setIdSamplePrepMethod(new Integer(n.getAttributeValue("idSamplePrepMethod")));
    } else {
      sample.setIdSamplePrepMethod(null);
    }
    if (n.getAttributeValue("idOrganism") != null && !n.getAttributeValue("idOrganism").equals("")) {
      sample.setIdOrganism(new Integer(n.getAttributeValue("idOrganism")));
    } else {
      sample.setIdOrganism(null);
    }
    if (n.getAttributeValue("idSampleSource") != null && !n.getAttributeValue("idSampleSource").equals("")) {
      sample.setIdSampleSource(new Integer(n.getAttributeValue("idSampleSource")));
    } else {
      sample.setIdSampleSource(null);
    }
    if (n.getAttributeValue("concentration") != null && !n.getAttributeValue("concentration").equals("")) {
      sample.setConcentration(new BigDecimal(n.getAttributeValue("concentration")));      
    } else {
      sample.setConcentration(null);
    }
    if (n.getAttributeValue("codeConcentrationUnit") != null && !n.getAttributeValue("codeConcentrationUnit").equals("")) {
      sample.setCodeConcentrationUnit(unEscape(n.getAttributeValue("codeConcentrationUnit")));      
    } else {
      sample.setCodeConcentrationUnit(ConcentrationUnit.DEFAULT_SAMPLE_CONCENTRATION_UNIT);
    }
    if (n.getAttributeValue("codeBioanalyzerChipType") != null && !n.getAttributeValue("codeBioanalyzerChipType").equals("")) {
      sample.setCodeBioanalyzerChipType(n.getAttributeValue("codeBioanalyzerChipType"));      
    } else {
      sample.setCodeBioanalyzerChipType(null);
    }

    sampleMap.put(idSampleString, sample);
    sampleIds.add(idSampleString);
    
    //  Hash sample characteristics entries    
    Map annotations = new HashMap();
    for(Iterator i = n.getAttributes().iterator(); i.hasNext();) {
      
      Attribute a = (Attribute)i.next();
      String code = a.getName();
      String value = unEscape(a.getValue());
      
      if (value != null && !value.equals("") && 
          SampleCharacteristic.isValidCode(code) &&
          this.characteristicsToApplyMap.containsKey(code)) {
        annotations.put(code, value);
        sampleAnnotationCodeMap.put(code, null);
      }
    }
    sampleAnnotationMap.put(idSampleString, annotations);

    // Hash sample treatment
    if (showTreatments && 
        n.getAttributeValue(TreatmentEntry.TREATMENT) != null && !n.getAttributeValue(TreatmentEntry.TREATMENT).equals("")) {
      sampleTreatmentMap.put(idSampleString, unEscape(n.getAttributeValue(TreatmentEntry.TREATMENT)));
    }
    
    
    // If the user can manage workflow, initialize the sample quality control fields
    // (for updating).
    if (this.secAdvisor.hasPermission(SecurityAdvisor.CAN_MANAGE_WORKFLOW)) {
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
      
      
      if (n.getAttributeValue("qualAverageFragmentLength") != null && !n.getAttributeValue("qualAverageFragmentLength").equals("")) {
        sample.setQualAverageFragmentLength(new BigDecimal(n.getAttributeValue("qualAverageFragmentLength")));
      } else {
        sample.setQualAverageFragmentLength(null);
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
        sample.setQualRINNumber(new BigDecimal(n.getAttributeValue("qualRINNumber")));
      } else {
        sample.setQualRINNumber(null);
      }   
      
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
     
    }

    
   
  }
  
  private void initializeHyb(Element n) {
    
      HybInfo hybInfo = new HybInfo();
      
      hybInfo.setIdHybridization(n.getAttributeValue("idHybridization"));

      String idSampleChannel1String =  n.getAttributeValue("idSampleChannel1");
      if (idSampleChannel1String != null && !idSampleChannel1String.equals("")) {
        hybInfo.setIdSampleChannel1String(idSampleChannel1String);
        hybInfo.setSampleChannel1((Sample)sampleMap.get(idSampleChannel1String));
      }
      
      String idSampleChannel2String =  n.getAttributeValue("idSampleChannel2");
      if (idSampleChannel2String != null && !idSampleChannel2String.equals("")) {
        hybInfo.setIdSampleChannel2String(idSampleChannel2String);
        hybInfo.setSampleChannel2((Sample)sampleMap.get(idSampleChannel2String));
      }
      
      String codeSlideSource = null;
      if (n.getAttributeValue("codeSlideSource") != null && !n.getAttributeValue("codeSlideSource").equals("")) {
        codeSlideSource = n.getAttributeValue("codeSlideSource");
      }
      hybInfo.setCodeSlideSource(codeSlideSource);

      if (n.getAttributeValue("idSlideDesign") != null && !n.getAttributeValue("idSlideDesign").equals("")) {
        hybInfo.setIdSlideDesign(new Integer(n.getAttributeValue("idSlideDesign")));
      }
      
      hybInfo.setNotes(unEscape(n.getAttributeValue("notes")));
      
      //
      // Workflow fields
      //
      
      // Labeling (channel1)
      if (n.getAttributeValue("labelingYieldChannel1") != null && !n.getAttributeValue("labelingYieldChannel1").equals("")) {
        hybInfo.setLabelingYieldChannel1(new BigDecimal(n.getAttributeValue("labelingYieldChannel1")));
      } 
      if (n.getAttributeValue("idLabelingProtocolChannel1") != null && !n.getAttributeValue("idLabelingProtocolChannel1").equals("")) {
        hybInfo.setIdLabelingProtocolChannel1(new Integer(n.getAttributeValue("idLabelingProtocolChannel1")));
      } 
      
      if (n.getAttributeValue("codeLabelingReactionSizeChannel1") != null && !n.getAttributeValue("codeLabelingReactionSizeChannel1").equals("")) {
        hybInfo.setCodeLabelingReactionSizeChannel1(n.getAttributeValue("codeLabelingReactionSizeChannel1"));
      } 
   
      if (n.getAttributeValue("numberOfReactionsChannel1") != null && !n.getAttributeValue("numberOfReactionsChannel1").equals("")) {
        hybInfo.setNumberOfReactionsChannel1(new Integer(n.getAttributeValue("numberOfReactionsChannel1")));
      }
      if (n.getAttributeValue("labelingStatusChannel1") != null && !n.getAttributeValue("labelingStatusChannel1").equals("")) {
        String status = n.getAttributeValue("labelingStatusChannel1");
        if (status.equals(Constants.STATUS_COMPLETED)) {
          hybInfo.setLabelingCompletedChannel1("Y");          
          hybInfo.setLabelingFailedChannel1("N");      
          hybInfo.setLabelingBypassedChannel1("N");
          
        } else if (status.equals(Constants.STATUS_TERMINATED)) {
          hybInfo.setLabelingCompletedChannel1("N");          
          hybInfo.setLabelingFailedChannel1("Y");      
          hybInfo.setLabelingBypassedChannel1("N");
          
        } else if (status.equals(Constants.STATUS_BYPASSED)) {
          hybInfo.setLabelingCompletedChannel1("N");          
          hybInfo.setLabelingFailedChannel1("N");      
          hybInfo.setLabelingBypassedChannel1("Y");
        }
      } else {
        hybInfo.setLabelingCompletedChannel1("N");          
        hybInfo.setLabelingFailedChannel1("N");      
        hybInfo.setLabelingBypassedChannel1("N");
      }

        
        
      
      // Labeling (channel2)
      if (n.getAttributeValue("labelingYieldChannel2") != null && !n.getAttributeValue("labelingYieldChannel2").equals("")) {
        hybInfo.setLabelingYieldChannel2(new BigDecimal(n.getAttributeValue("labelingYieldChannel2")));
      } 
      if (n.getAttributeValue("idLabelingProtocolChannel2") != null && !n.getAttributeValue("idLabelingProtocolChannel2").equals("")) {
        hybInfo.setIdLabelingProtocolChannel2(new Integer(n.getAttributeValue("idLabelingProtocolChannel2")));
      } 
      
      if (n.getAttributeValue("codeLabelingReactionSizeChannel2") != null && !n.getAttributeValue("codeLabelingReactionSizeChannel2").equals("")) {
        hybInfo.setCodeLabelingReactionSizeChannel2(n.getAttributeValue("codeLabelingReactionSizeChannel2"));
      } 
   
      if (n.getAttributeValue("numberOfReactionsChannel2") != null && !n.getAttributeValue("numberOfReactionsChannel2").equals("")) {
        hybInfo.setNumberOfReactionsChannel2(new Integer(n.getAttributeValue("numberOfReactionsChannel2")));
      }
      if (n.getAttributeValue("labelingStatusChannel2") != null && !n.getAttributeValue("labelingStatusChannel2").equals("")) {
        String status = n.getAttributeValue("labelingStatusChannel2");
        if (status.equals(Constants.STATUS_COMPLETED)) {
          hybInfo.setLabelingCompletedChannel2("Y");          
          hybInfo.setLabelingFailedChannel2("N");      
          hybInfo.setLabelingBypassedChannel2("N");
          
        } else if (status.equals(Constants.STATUS_TERMINATED)) {
          hybInfo.setLabelingCompletedChannel2("N");          
          hybInfo.setLabelingFailedChannel2("Y");      
          hybInfo.setLabelingBypassedChannel2("N");
          
        } else if (status.equals(Constants.STATUS_BYPASSED)) {
          hybInfo.setLabelingCompletedChannel2("N");          
          hybInfo.setLabelingFailedChannel2("N");      
          hybInfo.setLabelingBypassedChannel2("Y");
        }
      } else {
        hybInfo.setLabelingCompletedChannel2("N");          
        hybInfo.setLabelingFailedChannel2("N");      
        hybInfo.setLabelingBypassedChannel2("N");
      }
      
      
      // Hyb
      if (n.getAttributeValue("hybStatus") != null && !n.getAttributeValue("hybStatus").equals("")) {
        String status = n.getAttributeValue("hybStatus");
        if (status.equals(Constants.STATUS_COMPLETED)) {
          hybInfo.setHybCompleted("Y");      
          hybInfo.setHybFailed("N");
          hybInfo.setHybBypassed("N");          
        } else if (status.equals(Constants.STATUS_TERMINATED)) {
          hybInfo.setHybCompleted("N");      
          hybInfo.setHybFailed("Y");
          hybInfo.setHybBypassed("N");                    
        } else if (status.equals(Constants.STATUS_BYPASSED)) {
          hybInfo.setHybCompleted("N");      
          hybInfo.setHybFailed("N");
          hybInfo.setHybBypassed("Y");                    
        }
      } else {
        hybInfo.setHybCompleted("N");      
        hybInfo.setHybFailed("N");
        hybInfo.setHybBypassed("N"); 
      }
 
      if (n.getAttributeValue("slideBarcode") != null && !n.getAttributeValue("slideBarcode").equals("")) {
        hybInfo.setSlideBarcode(n.getAttributeValue("slideBarcode"));
      }
      if (n.getAttributeValue("arrayCoordinateName") != null && !n.getAttributeValue("arrayCoordinateName").equals("")) {
        hybInfo.setArrayCoordinateName(n.getAttributeValue("arrayCoordinateName"));        
      } 

      if (n.getAttributeValue("idHybProtocol") != null && !n.getAttributeValue("idHybProtocol").equals("")) {
        hybInfo.setIdHybProtocol(new Integer(n.getAttributeValue("idHybProtocol")));
      }
      if (n.getAttributeValue("idScanProtocol") != null && !n.getAttributeValue("idScanProtocol").equals("")) {
        hybInfo.setIdScanProtocol(new Integer(n.getAttributeValue("idScanProtocol")));
      }
      if (n.getAttributeValue("idFeatureExtractionProtocol") != null && !n.getAttributeValue("idFeatureExtractionProtocol").equals("")) {
        hybInfo.setIdFeatureExtractionProtocol(new Integer(n.getAttributeValue("idFeatureExtractionProtocol")));
      }

      // Extraction
      if (n.getAttributeValue("extractionStatus") != null && !n.getAttributeValue("extractionStatus").equals("")) {
        String status = n.getAttributeValue("extractionStatus");
        if (status.equals(Constants.STATUS_COMPLETED)) {
          hybInfo.setExtractionCompleted("Y");      
          hybInfo.setExtractionFailed("N");
          hybInfo.setExtractionBypassed("N");          
        } else if (status.equals(Constants.STATUS_TERMINATED)) {
          hybInfo.setExtractionCompleted("N");      
          hybInfo.setExtractionFailed("Y");
          hybInfo.setExtractionBypassed("N");                    
        } else if (status.equals(Constants.STATUS_BYPASSED)) {
          hybInfo.setExtractionCompleted("N");      
          hybInfo.setExtractionFailed("N");
          hybInfo.setExtractionBypassed("Y");                    
        }
      } else {
        hybInfo.setExtractionCompleted("N");      
        hybInfo.setExtractionFailed("N");
        hybInfo.setExtractionBypassed("N"); 
      }
      
      hybInfos.add(hybInfo);
  }
  
  private void initializeSequenceLane(Element n) {
    
    SequenceLaneInfo sequenceLaneInfo = new SequenceLaneInfo();
    
    sequenceLaneInfo.setIdSequenceLane(n.getAttributeValue("idSequenceLane"));

    String idSampleString=  n.getAttributeValue("idSample");
    if (idSampleString != null && !idSampleString.equals("")) {
      sequenceLaneInfo.setIdSampleString(idSampleString);
      sequenceLaneInfo.setSample((Sample)sampleMap.get(idSampleString));
    }
    
   
    if (n.getAttributeValue("idNumberSequencingCycles") != null && !n.getAttributeValue("idNumberSequencingCycles").equals("")) {
      sequenceLaneInfo.setIdNumberSequencingCycles(new Integer(n.getAttributeValue("idNumberSequencingCycles")));
    }
    

    if (n.getAttributeValue("idFlowCellType") != null && !n.getAttributeValue("idFlowCellType").equals("")) {
      sequenceLaneInfo.setIdFlowCellType(new Integer(n.getAttributeValue("idFlowCellType")));
    }
    
    sequenceLaneInfo.setNotes(unEscape(n.getAttributeValue("notes")));
    
    
    
    sequenceLaneInfos.add(sequenceLaneInfo);
}

  
  
  public Map getCharacteristicsToApplyMap() {
    return characteristicsToApplyMap;
  }
  
  public Map getSampleAnnotationCodeMap() {
    return sampleAnnotationCodeMap;
  }
  
  public Map getSampleAnnotationMap() {
    return sampleAnnotationMap;
  }
  
  public Map getSampleMap() {
    return sampleMap;
  }
  
  public Map getSampleTreatmentMap() {
    return sampleTreatmentMap;
  }
  
  
  public boolean getShowTreatments() {
    return showTreatments;
  }
  
  
  public String getOtherCharacteristicLabel() {
    return otherCharacteristicLabel;
  }

  public Request getRequest() {
    return request;
  }

  public List getHybInfos() {
    return hybInfos;
  }
  public List getSampleIds() {
    return sampleIds;
  }

 
  
  
  public static class HybInfo implements Serializable {
    private String   idHybridization;
    private String   idSampleChannel1String;
    private String   idSampleChannel2String;
    private Sample   sampleChannel1;
    private Sample   sampleChannel2;
    private String   codeSlideSource;
    private Integer  idSlideDesign;
    private String   notes;
    
    
    private BigDecimal labelingYieldChannel1;
    private Integer    idLabelingProtocolChannel1;
    private Integer    numberOfReactionsChannel1;
    private String     codeLabelingReactionSizeChannel1;
    private String     labelingCompletedChannel1 = "N";
    private String     labelingFailedChannel1 = "N";
    private String     labelingBypassedChannel1 = "N";
    
    private BigDecimal labelingYieldChannel2;
    private Integer    idLabelingProtocolChannel2;
    private Integer    numberOfReactionsChannel2;
    private String     codeLabelingReactionSizeChannel2;
    private String     labelingCompletedChannel2 = "N";
    private String     labelingFailedChannel2 = "N";
    private String     labelingBypassedChannel2 = "N";
    
    private String     slideBarcode;
    private String     arrayCoordinateName;
    private Integer    idHybProtocol;
    private Integer    idScanProtocol;
    private Integer    idFeatureExtractionProtocol;
    private String     hybCompleted = "N";
    private String     hybFailed = "N";
    private String     hybBypassed = "N";
    private String     extractionCompleted;
    private String     extractionFailed;
    private String     extractionBypassed;
    
    
    
    
    public String getIdHybridization() {
      return idHybridization;
    }
    
    public void setIdHybridization(String idHybridization) {
      this.idHybridization = idHybridization;
    }
    
    public Integer getIdSlideDesign() {
      return idSlideDesign;
    }
    
    public void setIdSlideDesign(Integer idSlideDesign) {
      this.idSlideDesign = idSlideDesign;
    }
    
    public Sample getSampleChannel1() {
      return sampleChannel1;
    }
    
    public void setSampleChannel1(Sample sampleChannel1) {
      this.sampleChannel1 = sampleChannel1;
    }
    
    public Sample getSampleChannel2() {
      return sampleChannel2;
    }
    
    public void setSampleChannel2(Sample sampleChannel2) {
      this.sampleChannel2 = sampleChannel2;
    }

    
    public String getNotes() {
      return notes;
    }

    
    public void setNotes(String notes) {
      this.notes = notes;
    }

    
    public String getIdSampleChannel1String() {
      return idSampleChannel1String;
    }

    
    public void setIdSampleChannel1String(String idSampleChannel1String) {
      this.idSampleChannel1String = idSampleChannel1String;
    }

    
    public String getIdSampleChannel2String() {
      return idSampleChannel2String;
    }

    
    public void setIdSampleChannel2String(String idSampleChannel2String) {
      this.idSampleChannel2String = idSampleChannel2String;
    }

    
    public String getCodeSlideSource() {
      return codeSlideSource;
    }

    
    public void setCodeSlideSource(String codeSlideSource) {
      this.codeSlideSource = codeSlideSource;
    }

    
    public String getArrayCoordinateName() {
      return arrayCoordinateName;
    }

    
    public void setArrayCoordinateName(String arrayCoordinateName) {
      this.arrayCoordinateName = arrayCoordinateName;
    }

    
    public String getCodeLabelingReactionSizeChannel1() {
      return codeLabelingReactionSizeChannel1;
    }

    
    public void setCodeLabelingReactionSizeChannel1(
        String codeLabelingReactionSizeChannel1) {
      this.codeLabelingReactionSizeChannel1 = codeLabelingReactionSizeChannel1;
    }

    
    public String getCodeLabelingReactionSizeChannel2() {
      return codeLabelingReactionSizeChannel2;
    }

    
    public void setCodeLabelingReactionSizeChannel2(
        String codeLabelingReactionSizeChannel2) {
      this.codeLabelingReactionSizeChannel2 = codeLabelingReactionSizeChannel2;
    }

    
    public String getExtractionCompleted() {
      return extractionCompleted;
    }

    
    public void setExtractionCompleted(String extractionCompleted) {
      this.extractionCompleted = extractionCompleted;
    }

    
    public String getHybCompleted() {
      return hybCompleted;
    }

    
    public void setHybCompleted(String hybCompleted) {
      this.hybCompleted = hybCompleted;
    }

    
    public String getHybFailed() {
      return hybFailed;
    }

    
    public void setHybFailed(String hybFailed) {
      this.hybFailed = hybFailed;
    }

    
    public Integer getIdHybProtocol() {
      return idHybProtocol;
    }

    
    public void setIdHybProtocol(Integer idHybProtocol) {
      this.idHybProtocol = idHybProtocol;
    }

    
    public BigDecimal getLabelingYieldChannel1() {
      return labelingYieldChannel1;
    }

    
    public void setLabelingYieldChannel1(BigDecimal labelingYieldChannel1) {
      this.labelingYieldChannel1 = labelingYieldChannel1;
    }

    
    public BigDecimal getLabelingYieldChannel2() {
      return labelingYieldChannel2;
    }

    
    public void setLabelingYieldChannel2(BigDecimal labelingYieldChannel2) {
      this.labelingYieldChannel2 = labelingYieldChannel2;
    }

    
    public Integer getIdLabelingProtocolChannel1() {
      return idLabelingProtocolChannel1;
    }

    
    public void setIdLabelingProtocolChannel1(Integer idLabelingProtocolChannel1) {
      this.idLabelingProtocolChannel1 = idLabelingProtocolChannel1;
    }

    
    public Integer getIdLabelingProtocolChannel2() {
      return idLabelingProtocolChannel2;
    }

    
    public void setIdLabelingProtocolChannel2(Integer idLabelingProtocolChannel2) {
      this.idLabelingProtocolChannel2 = idLabelingProtocolChannel2;
    }

    
    public Integer getNumberOfReactionsChannel1() {
      return numberOfReactionsChannel1;
    }

    
    public void setNumberOfReactionsChannel1(Integer numberOfReactionsChannel1) {
      this.numberOfReactionsChannel1 = numberOfReactionsChannel1;
    }

    
    public Integer getNumberOfReactionsChannel2() {
      return numberOfReactionsChannel2;
    }

    
    public void setNumberOfReactionsChannel2(Integer numberOfReactionsChannel2) {
      this.numberOfReactionsChannel2 = numberOfReactionsChannel2;
    }

    
    public String getSlideBarcode() {
      return slideBarcode;
    }

    
    public void setSlideBarcode(String slideBarcode) {
      this.slideBarcode = slideBarcode;
    }

    
    public String getLabelingCompletedChannel1() {
      return labelingCompletedChannel1;
    }

    
    public void setLabelingCompletedChannel1(String labelingCompletedChannel1) {
      this.labelingCompletedChannel1 = labelingCompletedChannel1;
    }

    
    public String getLabelingCompletedChannel2() {
      return labelingCompletedChannel2;
    }

    
    public void setLabelingCompletedChannel2(String labelingCompletedChannel2) {
      this.labelingCompletedChannel2 = labelingCompletedChannel2;
    }

    
    public String getLabelingFailedChannel1() {
      return labelingFailedChannel1;
    }

    
    public void setLabelingFailedChannel1(String labelingFailedChannel1) {
      this.labelingFailedChannel1 = labelingFailedChannel1;
    }

    
    public String getLabelingFailedChannel2() {
      return labelingFailedChannel2;
    }

    
    public void setLabelingFailedChannel2(String labelingFailedChannel2) {
      this.labelingFailedChannel2 = labelingFailedChannel2;
    }

    
    public Integer getIdFeatureExtractionProtocol() {
      return idFeatureExtractionProtocol;
    }

    
    public void setIdFeatureExtractionProtocol(Integer idFeatureExtractionProtocol) {
      this.idFeatureExtractionProtocol = idFeatureExtractionProtocol;
    }

    
    public Integer getIdScanProtocol() {
      return idScanProtocol;
    }

    
    public void setIdScanProtocol(Integer idScanProtocol) {
      this.idScanProtocol = idScanProtocol;
    }

    
    public String getExtractionBypassed() {
      return extractionBypassed;
    }

    
    public void setExtractionBypassed(String extractionBypassed) {
      this.extractionBypassed = extractionBypassed;
    }

    
    public String getExtractionFailed() {
      return extractionFailed;
    }

    
    public void setExtractionFailed(String extractionFailed) {
      this.extractionFailed = extractionFailed;
    }

    
    public String getHybBypassed() {
      return hybBypassed;
    }

    
    public void setHybBypassed(String hybBypassed) {
      this.hybBypassed = hybBypassed;
    }

    
    public String getLabelingBypassedChannel1() {
      return labelingBypassedChannel1;
    }

    
    public void setLabelingBypassedChannel1(String labelingBypassedChannel1) {
      this.labelingBypassedChannel1 = labelingBypassedChannel1;
    }

    
    public String getLabelingBypassedChannel2() {
      return labelingBypassedChannel2;
    }

    
    public void setLabelingBypassedChannel2(String labelingBypassedChannel2) {
      this.labelingBypassedChannel2 = labelingBypassedChannel2;
    }
    
    
  }

  
  public static class SequenceLaneInfo implements Serializable {
    private String   idSequenceLane;
    private String   idSampleString;
    private Sample   sample;
    private Integer  idFlowCellType;
    private Integer  idNumberSequencingCycles;
    private String   notes;
    
    
    public String getNotes() {
      return notes;
    }

    
    public void setNotes(String notes) {
      this.notes = notes;
    }

    
    public Integer getIdFlowCellType() {
      return idFlowCellType;
    }

    
    public void setIdFlowCellType(Integer idFlowCellType) {
      this.idFlowCellType = idFlowCellType;
    }

    
    public Integer getIdNumberSequencingCycles() {
      return idNumberSequencingCycles;
    }

    
    public void setIdNumberSequencingCycles(Integer idNumberSequencingCycles) {
      this.idNumberSequencingCycles = idNumberSequencingCycles;
    }

    
    public String getIdSampleString() {
      return idSampleString;
    }

    
    public void setIdSampleString(String idSampleString) {
      this.idSampleString = idSampleString;
    }

    
    public String getIdSequenceLane() {
      return idSequenceLane;
    }

    
    public void setIdSequenceLane(String idSequenceLane) {
      this.idSequenceLane = idSequenceLane;
    }

    
    public Sample getSample() {
      return sample;
    }

    
    public void setSample(Sample sample) {
      this.sample = sample;
    }
    
    
  }



  
  public boolean isNewRequest() {
    return isNewRequest;
  }

  
  public boolean isSaveReuseOfSlides() {
    return saveReuseOfSlides;
  }

  
  public void setSaveReuseOfSlides(boolean saveReuseOfSlides) {
    this.saveReuseOfSlides = saveReuseOfSlides;
  }


  public static String unEscape(String text) {
    if (text == null) {
      return text;
    }
    text = text.replaceAll("&amp;",    "&");
    text = text.replaceAll("&quot;",   "\"");
    text = text.replaceAll("&apos;",   "'");
    text = text.replaceAll("&gt;",     ">");
    text = text.replaceAll("&lt;",     "<");
    text = text.replaceAll("&#181;",   "�");
    return text;
  }

  
  public List getSequenceLaneInfos() {
    return sequenceLaneInfos;
  }

  
  public void setSequenceLaneInfos(List sequenceLaneInfos) {
    this.sequenceLaneInfos = sequenceLaneInfos;
  }

  

  


}
