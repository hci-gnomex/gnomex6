package hci.gnomex.utility;

import net.sf.json.JSON;

import java.io.Serializable;
import java.math.BigDecimal;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;

import hci.gnomex.model.*;
import org.hibernate.Hibernate;
import org.hibernate.Session;
import org.jdom.Attribute;
import org.jdom.Document;
import org.jdom.Element;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonReader;

import hci.gnomex.constants.Constants;
import hci.gnomex.security.SecurityAdvisor;

public class RequestParser implements Serializable {

  private SecurityAdvisor secAdvisor;
  private boolean isImport = false;

  // We will either be using the JsonObject or Element exclusively, depending on what we are parsing.
  private JsonObject requestObject;
  private Element    requestNode;

  private Request request;
  private boolean isNewRequest = false;
  private boolean reassignBillingAccount = false;
  private String otherCharacteristicLabel;
  private List sampleIds = new ArrayList();
  private Map sampleMap = new HashMap();
  private Map<String, String> propertiesToApplyMap = new TreeMap<>();
  private Map<String, String> seqLibTreatmentMap = new HashMap<>();
  private Map collaboratorUploadMap = new HashMap();
  private Map collaboratorUpdateMap = new HashMap();
  private Map sampleAnnotationMap = new HashMap();
  private Map requestAnnotationMap = new HashMap<String,List<String>>();
  private boolean showTreatments = false;
  private Map sampleTreatmentMap = new HashMap();
  private Map sampleAnnotationCodeMap = new TreeMap();
  private List hybInfos = new ArrayList();
  private List sequenceLaneInfos = new ArrayList();
  private boolean saveReuseOfSlides = false;
  private String amendState = "";
  private List<String> ccNumberList = new ArrayList<String>();
  private Integer originalIdLab = null;
  private Map<String, Plate> plateMap = new HashMap<String, Plate>();
  private Map<String, PlateWell> wellMap = new HashMap<String, PlateWell>();
  private Map<String, SamplePlateWell> sampleToPlateMap = new HashMap<String, SamplePlateWell>();
  private Map<String, ArrayList<String>> sampleAssays = new HashMap<String, ArrayList<String>>();
  private Map<String, String> cherryPickSourceWells = new HashMap<String, String>();
  private Map<String, String> cherryPickSourcePlates = new HashMap<String, String>();
  private Map<String, String> cherryPickDestinationWells = new HashMap<String, String>();
  private Boolean hasPlates = false;
  private Boolean forDownload = false;
  private String seqPrepByCore = null;
  private String previousCodeRequestStatus = null;
  private BillingTemplate billingTemplate;
  private Set<BillingTemplateItem> 	billingTemplateItems;
  private boolean isOpeningNewBillingTemplate;

  private boolean usingJSON = false;

  public RequestParser(JsonReader reader, SecurityAdvisor secAdvisor) {
    this.usingJSON = true;
    this.requestObject = reader.readObject();
    this.secAdvisor = secAdvisor;
    this.forDownload = false;
  }

  public RequestParser(Document requestDoc, SecurityAdvisor secAdvisor) {
    this.usingJSON = false;
    this.requestNode = requestDoc.getRootElement();
    this.secAdvisor = secAdvisor;
    this.forDownload = false;
  }

  public RequestParser(Element requestNode, SecurityAdvisor secAdvisor) {
    this.usingJSON = false;
    this.requestNode = requestNode;
    this.secAdvisor = secAdvisor;
    this.forDownload = false;
  }

  public RequestParser(Document requestDoc, SecurityAdvisor secAdvisor, Boolean forDownload) {
    this.usingJSON = false;
    this.requestNode = requestDoc.getRootElement();
    this.secAdvisor = secAdvisor;
    this.forDownload = forDownload;
  }

  public void init() {
    request = null;
    isNewRequest = false;
    otherCharacteristicLabel = null;
    sampleIds = new ArrayList();
    sampleMap = new HashMap();
    propertiesToApplyMap = new TreeMap<>();
    seqLibTreatmentMap = new HashMap<>();
    collaboratorUploadMap = new HashMap();
    collaboratorUpdateMap = new HashMap();
    sampleAnnotationMap = new HashMap();
    showTreatments = false;
    sampleTreatmentMap = new HashMap();
    sampleAnnotationCodeMap = new TreeMap();
    requestAnnotationMap = new TreeMap<String,List<String>>();
    hybInfos = new ArrayList();
    sequenceLaneInfos = new ArrayList();
    saveReuseOfSlides = false;
    amendState = "";
    ccNumberList = new ArrayList<String>();
    plateMap = new HashMap<String, Plate>();
    wellMap = new HashMap<String, PlateWell>();
    sampleToPlateMap = new HashMap<String, SamplePlateWell>();
    sampleAssays = new HashMap<String, ArrayList<String>>();
    cherryPickSourcePlates = new HashMap<String, String>();
    cherryPickSourceWells = new HashMap<String, String>();
    cherryPickDestinationWells = new HashMap<String, String>();
    isOpeningNewBillingTemplate = false;
  }

  /*
   * Call this parse method from controller classes. In this case,
   * DictionaryHelper can be used because the servlet ManageDictionaries has
   * already been called during initialization.
   */
  public void parse(Session sess) throws Exception {
    DictionaryHelper dictionaryHelper = DictionaryHelper.getInstance(sess);
    String codeRequestCategoryValue;

    if (this.usingJSON) {
      codeRequestCategoryValue = requestObject.getString("codeRequestCategory");
    } else {
      codeRequestCategoryValue = requestNode.getAttributeValue("codeRequestCategory");
    }

    RequestCategory requestCategory = dictionaryHelper.getRequestCategoryObject(codeRequestCategoryValue);
    parse(sess, requestCategory);
  }

  public void parseForImport(Session sess, RequestCategory requestCategory) throws Exception {
    parse(sess, requestCategory, true);
  }

  public void parse(Session sess, RequestCategory requestCategory) throws Exception {
    parse(sess, requestCategory, false);
  }

  /*
   * Call this version of parse when coming from a batch java app instead of the
   * web (servlet) interface. In this case, we can't rely on DictionaryHelper
   * since ManageDictionaries only works as a command, not in a stand-alone java
   * app.
   */
  private void parse(Session sess, RequestCategory requestCategory, boolean isImport) throws Exception {
    this.isImport = isImport;

    if (this.usingJSON) {
      this.initializeRequest(requestObject, sess, requestCategory);
    } else {
      this.initializeRequest(requestNode, sess, requestCategory);
    }

    if (this.usingJSON) {
      for (int i = 0; i < requestObject.getJsonArray("samples").size(); i++) {
        JsonObject sampleObject = requestObject.getJsonArray("samples").getJsonObject(i);
        this.initializeSample(requestObject, sampleObject, sess, requestCategory);
      }
    } else {
      for (Iterator i = requestNode.getChild("samples").getChildren("Sample").iterator(); i.hasNext();) {
        Element sampleNode = (Element) i.next();
        this.initializeSample(requestNode, sampleNode, sess, requestCategory);
      }
    }

    if (this.usingJSON) {
      if (requestObject.get("hybridizations") != null) {
        for (int i = 0; i < requestObject.getJsonArray("hybridizations").size(); i++) {
          JsonObject hybridization = requestObject.getJsonArray("hybridizations").getJsonObject(i);
          initializeHyb(hybridization);
        }
      }
    } else {
      if (requestNode.getChild("hybridizations") != null && !requestNode.getChild("hybridizations").getChildren("Hybridization").isEmpty()) {
        for (Iterator i = requestNode.getChild("hybridizations").getChildren("Hybridization").iterator(); i.hasNext();) {
          Element hybNode = (Element) i.next();
          initializeHyb(hybNode);
        }
      }
    }


    if (this.usingJSON) {
      if (requestObject.get("sequenceLanes") != null) {
        for (int i = 0; i < requestObject.getJsonArray("sequenceLanes").size(); i++) {
          JsonObject sequenceLane = requestObject.getJsonArray("sequenceLanes").getJsonObject(i);
          initializeSequenceLane(sequenceLane);
        }
      }
    } else {
      if (requestNode.getChild("sequenceLanes") != null && !requestNode.getChild("sequenceLanes").getChildren("SequenceLane").isEmpty()) {
        for (Iterator i = requestNode.getChild("sequenceLanes").getChildren("SequenceLane").iterator(); i.hasNext();) {
          Element sequenceLaneNode = (Element) i.next();
          initializeSequenceLane(sequenceLaneNode);
        }
      }
    }



  }

  private void initializeRequest(JsonObject n, Session sess, RequestCategory requestCategory) throws Exception {

    Integer idRequest = new Integer(n.getString("idRequest"));
    System.out.println ("[initializeRequest] idRequest: " + idRequest);
    if (idRequest.intValue() == 0) {
      request = new Request();
      request.setCreateDate(new java.sql.Date(System.currentTimeMillis()));
      request.setCodeVisibility(n.getString("codeVisibility"));
      request.setPrivacyExpirationDate(convertDate(n.getString("privacyExpirationDate")));

      // We use the experiment ID in the XML if this is an import
      if (isImport) {
        request.setNumber(n.get("number") != null ? n.getString("number") : null);

        JsonArray requestProperties = n.getJsonArray("RequestProperties");
        if(requestProperties != null){

          for(int i = 0; i < requestProperties.size(); i++) {
            String idProperty = requestProperties.getJsonObject(i).getString("idProperty");
            String name = requestProperties.getJsonObject(i).getString("name");
            String value = requestProperties.getJsonObject(i).getString("value");
            List<String> idPropertyValuePairList = new ArrayList<String>();
            idPropertyValuePairList.add(idProperty);
            idPropertyValuePairList.add(value);
            this.requestAnnotationMap.put(name,idPropertyValuePairList);
          }

        }

      }

      if (n.get("idInstitution") != null && !n.getString("idInstitution").equals("")) {
        request.setIdInstitution(new Integer(n.getString("idInstitution")));
      }
      isNewRequest = true;
    } else {
      request = sess.load(Request.class, idRequest);
      originalIdLab = request.getIdLab();
      saveReuseOfSlides = true;

      // If it is an existing request we want to set any new samples to have
      // same seqPrepByCore vaule as old samples.
      if (request.getSamples().size() > 0) {
        seqPrepByCore = ((Sample) request.getSamples().iterator().next()).getSeqPrepByCore();
      }

      // Reset the complete date
      // a QC request to a microarray or sequencing request
      if (this.isQCAmendRequest()) {
        request.setCompletedDate(null);
        request.setCodeRequestStatus(RequestStatus.SUBMITTED);
      }
      request.setLastModifyDate(new java.sql.Date(System.currentTimeMillis()));

      // Only some users have permissions to set the visibility on the request
      if (this.secAdvisor.canUpdate(request, SecurityAdvisor.PROFILE_OBJECT_VISIBILITY)) {
        if (n.get("codeVisibility") == null || n.getString("codeVisibility").equals("")) {
          throw new Exception("Visibility is required for experiment " + request.getNumber());
        }
        request.setCodeVisibility(n.getString("codeVisibility"));
        request.setPrivacyExpirationDate(convertDate(n.getString("privacyExpirationDate")));

        if (n.getString("idInstitution") != null && !n.getString("idInstitution").equals("") && !n.getString("idInstitution").equals("null")) {
          request.setIdInstitution(new Integer(n.getString("idInstitution")));
        }
      }
    }

    if (n.get("codeRequestCategory") != null) {
      request.setCodeRequestCategory(n.getString("codeRequestCategory"));
      if (requestCategory.getIsOwnerOnly() != null && requestCategory.getIsOwnerOnly().equals("Y")) {
        request.setCodeVisibility(Visibility.VISIBLE_TO_OWNER);
      }
    }

    initializeRequest(n, request, sess, requestCategory);
  }

  private void initializeRequest(Element n, Session sess, RequestCategory requestCategory) throws Exception {

    Integer idRequest = new Integer(n.getAttributeValue("idRequest"));
    System.out.println ("[initializeRequest] idRequest: " + idRequest);
    if (idRequest.intValue() == 0) {
      request = new Request();
      request.setCreateDate(new java.sql.Date(System.currentTimeMillis()));
      request.setCodeVisibility(n.getAttributeValue("codeVisibility"));
      request.setPrivacyExpirationDate(convertDate(n.getAttributeValue("privacyExpirationDate")));

      // We use the experiment ID in the XML if this is an import
      if (isImport) {
        request.setNumber(n.getAttributeValue("number"));

        Element requestProp = n.getChild("RequestProperties");
        if(requestProp != null ){
          List<Element> reqAnnotations = requestProp.getChildren();
          for(Element requestAnnot: reqAnnotations){
            String idProperty = requestAnnot.getAttributeValue("idProperty");
            String name = requestAnnot.getAttributeValue("name");
            String value = requestAnnot.getAttributeValue("value");
            List<String> idPropertyValuePairList = new ArrayList<String>();
            idPropertyValuePairList.add(idProperty);
            idPropertyValuePairList.add(value);
            this.requestAnnotationMap.put(name,idPropertyValuePairList);
          }

        }

      }

      if (n.getAttributeValue("idInstitution") != null && !n.getAttributeValue("idInstitution").equals("")) {
        request.setIdInstitution(new Integer(n.getAttributeValue("idInstitution")));
      }
      isNewRequest = true;
    } else {
      request = sess.load(Request.class, idRequest);
      originalIdLab = request.getIdLab();
      saveReuseOfSlides = true;

      // If it is an existing request we want to set any new samples to have
      // same seqPrepByCore vaule as old samples.
      if (request.getSamples().size() > 0) {
        seqPrepByCore = ((Sample) request.getSamples().iterator().next()).getSeqPrepByCore();
      }

      // Reset the complete date
      // a QC request to a microarray or sequencing request
      if (this.isQCAmendRequest()) {
        request.setCompletedDate(null);
        request.setCodeRequestStatus(RequestStatus.SUBMITTED);
      }
      request.setLastModifyDate(new java.sql.Date(System.currentTimeMillis()));

      // Only some users have permissions to set the visibility on the request
      if (this.secAdvisor.canUpdate(request, SecurityAdvisor.PROFILE_OBJECT_VISIBILITY)) {
        if (n.getAttributeValue("codeVisibility") == null || n.getAttributeValue("codeVisibility").equals("")) {
          throw new Exception("Visibility is required for experiment " + request.getNumber());
        }
        request.setCodeVisibility(n.getAttributeValue("codeVisibility"));
        request.setPrivacyExpirationDate(convertDate(n.getAttributeValue("privacyExpirationDate")));

        if (n.getAttributeValue("idInstitution") != null && !n.getAttributeValue("idInstitution").equals("") && !n.getAttributeValue("idInstitution").equals("null")) {
          request.setIdInstitution(new Integer(n.getAttributeValue("idInstitution")));
        }
      }
    }

    if (n.getAttributeValue("codeRequestCategory") != null) {
      request.setCodeRequestCategory(n.getAttributeValue("codeRequestCategory"));
      if (requestCategory.getIsOwnerOnly() != null && requestCategory.getIsOwnerOnly().equals("Y")) {
        request.setCodeVisibility(Visibility.VISIBLE_TO_OWNER);
      }
    }

    initializeRequest(n, request, sess, requestCategory);
  }

  private java.sql.Date convertDate(String dateString) throws Exception {
    java.sql.Date date = null;
    if (dateString != null && dateString.length() > 0) {
      DateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
      java.util.Date tmpDate = formatter.parse(dateString);
      date = new java.sql.Date(tmpDate.getTime());
    }
    return date;
  }

  private void initializeRequest(Element n, Request request, Session sess, RequestCategory requestCategory) throws Exception {

    if (n.getAttributeValue("isExternal") != null && !n.getAttributeValue("isExternal").equals("")) {
      request.setIsExternal(n.getAttributeValue("isExternal"));
    }

    if (n.getAttributeValue("amendState") != null && !n.getAttributeValue("amendState").equals("")) {
      amendState = n.getAttributeValue("amendState");
    }

    request.setName(this.unEscape(n.getAttributeValue("name")));

    otherCharacteristicLabel = this.unEscape(n.getAttributeValue(PropertyEntry.OTHER_LABEL));

    request.setCodeRequestCategory(n.getAttributeValue("codeRequestCategory"));

    if (n.getAttributeValue("idCoreFacility") != null && !n.getAttributeValue("idCoreFacility").equals("")) {
      request.setIdCoreFacility(new Integer(n.getAttributeValue("idCoreFacility")));
    } else {
      request.setIdCoreFacility(null);
    }

    if (n.getAttributeValue("codeApplication") != null && !n.getAttributeValue("codeApplication").equals("")) {
      request.setCodeApplication(n.getAttributeValue("codeApplication"));
    }

    if (n.getAttributeValue("idAppUser") != null && !n.getAttributeValue("idAppUser").equals("")) {
      request.setIdAppUser(new Integer(n.getAttributeValue("idAppUser")));
    }
    if (n.getAttributeValue("idSubmitter") != null && !n.getAttributeValue("idSubmitter").equals("")) {
      request.setIdSubmitter(new Integer(n.getAttributeValue("idSubmitter")));
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
    if (n.getAttributeValue("idSampleDropOffLocation") != null && !n.getAttributeValue("idSampleDropOffLocation").equals("")) {
      request.setIdSampleDropOffLocation(new Integer(n.getAttributeValue("idSampleDropOffLocation")));
    } else {
      request.setIdSampleDropOffLocation(null);
    }
    if (n.getAttributeValue("idProduct") != null && !n.getAttributeValue("idProduct").equals("")) {
      request.setIdProduct(new Integer(n.getAttributeValue("idProduct")));
    }
    if (n.getAttributeValue("coreToExtractDNA") != null && !n.getAttributeValue("coreToExtractDNA").equals(""))
      request.setCoreToExtractDNA(n.getAttributeValue("coreToExtractDNA"));

    if (n.getAttributeValue("applicationNotes") != null && !n.getAttributeValue("applicationNotes").equals(""))
      request.setApplicationNotes(n.getAttributeValue("applicationNotes"));

    if (n.getAttributeValue("includeBisulfideConversion") != null && !n.getAttributeValue("includeBisulfideConversion").equals(""))
      request.setIncludeBisulfideConversion(n.getAttributeValue("includeBisulfideConversion"));

    if (n.getAttributeValue("includeQubitConcentration") != null && !n.getAttributeValue("includeQubitConcentration").equals(""))
      request.setIncludeQubitConcentration(n.getAttributeValue("includeQubitConcentration"));

    if (n.getAttributeValue("newBillingTemplateIdBillingAccount") != null && !n.getAttributeValue("newBillingTemplateIdBillingAccount").equals("")) {
      BillingTemplate oldBillingTemplate = BillingTemplateQueryManager.retrieveBillingTemplate(sess, request);
      if (oldBillingTemplate == null || !oldBillingTemplate.canBeDeactivated(sess)) {
        throw new Exception("Current billing template cannot be deactivated");
      }
      Integer newIdBillingAccount = new Integer(n.getAttributeValue("newBillingTemplateIdBillingAccount"));
      request.setIdBillingAccount(newIdBillingAccount);
      billingTemplate = new BillingTemplate(request);
      billingTemplateItems = new TreeSet<BillingTemplateItem>();
      billingTemplateItems.add(getBillingTemplateItemForIdBA(newIdBillingAccount));
      isOpeningNewBillingTemplate = true;
      reassignBillingAccount = false;
    } else if (n.getAttributeValue("isOpeningNewBillingTemplate") != null && n.getAttributeValue("isOpeningNewBillingTemplate").equals("Y") && (n.getChild("BillingTemplate") != null || (n.getChild("billingTemplate") != null && n.getChild("billingTemplate").getChild("BillingTemplate") != null))) {
      BillingTemplate oldBillingTemplate = BillingTemplateQueryManager.retrieveBillingTemplate(sess, request);
      if (oldBillingTemplate == null || !oldBillingTemplate.canBeDeactivated(sess)) {
        throw new Exception("Current billing template cannot be deactivated");
      }
      Element billingTemplateNode = n.getChild("BillingTemplate") != null ? n.getChild("BillingTemplate") : n.getChild("billingTemplate").getChild("BillingTemplate");
      BillingTemplateParser btParser = new BillingTemplateParser(billingTemplateNode);
      btParser.parse(sess);
      billingTemplate = btParser.getBillingTemplate();
      billingTemplate.setOrder(request);
      billingTemplateItems = btParser.getBillingTemplateItems();
      isOpeningNewBillingTemplate = true;
      reassignBillingAccount = false;
    } else if (n.getAttributeValue("idBillingAccount") != null && !n.getAttributeValue("idBillingAccount").equals("")) {
      Integer newIdBillingAccount = new Integer(n.getAttributeValue("idBillingAccount"));
      request.setIdBillingAccount(newIdBillingAccount);
      billingTemplate = BillingTemplateQueryManager.retrieveBillingTemplate(sess, request);
      // If the billing account has been changed, we need to know so that any billing items can be revised as well.
      if (!isNewRequest && !this.isExternalExperiment()) {
        if (request.getAcceptingBalanceAccountId(sess) == null || !request.getAcceptingBalanceAccountId(sess).equals(newIdBillingAccount) || (billingTemplate != null && billingTemplate.getItems().size() > 1)) {
          reassignBillingAccount = true;
          if (!this.secAdvisor.hasPermission(SecurityAdvisor.CAN_ACCESS_ANY_OBJECT) && !ensureNonAdminCanAccessBillingAccount(newIdBillingAccount, sess)) {
            throw new Exception("User cannot access selected billing account.");
          }
        }
      }
      if (billingTemplate == null) {
        billingTemplate = new BillingTemplate(request);
      }
      billingTemplateItems = new TreeSet<BillingTemplateItem>();
      billingTemplateItems.add(getBillingTemplateItemForIdBA(newIdBillingAccount));
    } else if (n.getAttributeValue("idBillingTemplate") != null && !n.getAttributeValue("idBillingTemplate").equals("")) {
      billingTemplate = sess.get(BillingTemplate.class, Integer.parseInt(n.getAttributeValue("idBillingTemplate")));
      Hibernate.initialize(billingTemplate.getItems());
      billingTemplateItems = billingTemplate.getItems();
      Hibernate.initialize(billingTemplate.getMasterBillingItems());
      if (!isNewRequest && !this.isExternalExperiment()) {
        BillingTemplate oldTemplate = BillingTemplateQueryManager.retrieveBillingTemplate(sess, request);
        if (oldTemplate == null || !oldTemplate.equals(billingTemplate)) {
          reassignBillingAccount = true;
        }
      }
      billingTemplate.setOrder(request);
    } else if (n.getChild("BillingTemplate") != null || (n.getChild("billingTemplate") != null && n.getChild("billingTemplate").getChild("BillingTemplate") != null)) {
      Element billingTemplateNode = n.getChild("BillingTemplate") != null ? n.getChild("BillingTemplate") : n.getChild("billingTemplate").getChild("BillingTemplate");
      BillingTemplateParser btParser = new BillingTemplateParser(billingTemplateNode);
      btParser.parse(sess);
      billingTemplate = btParser.getBillingTemplate();
      billingTemplateItems = btParser.getBillingTemplateItems();
      if (!isNewRequest && !this.isExternalExperiment()) {
        BillingTemplate oldTemplate = BillingTemplateQueryManager.retrieveBillingTemplate(sess, request);
        if (oldTemplate == null || !oldTemplate.equals(billingTemplate)) {
          reassignBillingAccount = true;
        }
      }
      billingTemplate.setOrder(request);
    }

      request.setDescription(n.getAttributeValue("description"));

    if (n.getAttributeValue("reagent") != null && !n.getAttributeValue("reagent").equals("")) {
      request.setReagent(n.getAttributeValue("reagent"));
    }
    if (n.getAttributeValue("elutionBuffer") != null && !n.getAttributeValue("elutionBuffer").equals("")) {
      request.setElutionBuffer(n.getAttributeValue("elutionBuffer"));
    }
    if (n.getAttributeValue("usedDnase") != null && !n.getAttributeValue("usedDnase").equals("")) {
      request.setUsedDnase(n.getAttributeValue("usedDnase"));
    } else{
      request.setUsedDnase("N");
    }
    if (n.getAttributeValue("usedRnase") != null && !n.getAttributeValue("usedRnase").equals("")) {
      request.setUsedRnase(n.getAttributeValue("usedRnase"));
    } else{
      request.setUsedRnase("N");
    }
    if (n.getAttributeValue("keepSamples") != null && !n.getAttributeValue("keepSamples").equals("")) {
      request.setKeepSamples(n.getAttributeValue("keepSamples"));
    }

    if (n.getAttributeValue("captureLibDesignId") != null && !n.getAttributeValue("captureLibDesignId").equals(""))
      request.setCaptureLibDesignId(n.getAttributeValue("captureLibDesignId"));

    if (n.getAttributeValue("analysisInstructions") != null && !n.getAttributeValue("analysisInstructions").equals(""))
      request.setAnalysisInstructions(n.getAttributeValue("analysisInstructions"));

      request.setCorePrepInstructions(n.getAttributeValue("corePrepInstructions"));

      request.setAdminNotes(n.getAttributeValue("adminNotes"));

    if (n.getAttributeValue("codeProtocolType") != null && !n.getAttributeValue("codeProtocolType").equals("")) {
      request.setCodeProtocolType(n.getAttributeValue("codeProtocolType"));
    }
    if (n.getAttributeValue("codeBioanalyzerChipType") != null && !n.getAttributeValue("codeBioanalyzerChipType").equals("")) {
      request.setCodeBioanalyzerChipType(n.getAttributeValue("codeBioanalyzerChipType"));
    }
    if (n.getAttributeValue("codeIsolationPrepType") != null && !n.getAttributeValue("codeIsolationPrepType").equals("")) {
      request.setCodeIsolationPrepType(n.getAttributeValue("codeIsolationPrepType"));
    }
    if (n.getAttributeValue("bioinformaticsAssist") != null && !n.getAttributeValue("bioinformaticsAssist").equals("")) {
      request.setBioinformaticsAssist(n.getAttributeValue("bioinformaticsAssist"));
    }
    if (request.getBioinformaticsAssist() == null || (!request.getBioinformaticsAssist().equals("Y") && !request.getBioinformaticsAssist().equals("N"))) {
      request.setBioinformaticsAssist("N");
    }

    if (n.getAttributeValue("hasPrePooledLibraries") != null && !n.getAttributeValue("hasPrePooledLibraries").equals("")) {
      request.setHasPrePooledLibraries(n.getAttributeValue("hasPrePooledLibraries"));
    }
    if (request.getHasPrePooledLibraries() == null || (!request.getHasPrePooledLibraries().equals("Y") && !request.getHasPrePooledLibraries().equals("N"))) {
      request.setHasPrePooledLibraries("N");
    }

    if (request.getHasPrePooledLibraries().equals("Y") && n.getAttributeValue("numPrePooledTubes") != null && !n.getAttributeValue("numPrePooledTubes").equals("")) {
      request.setNumPrePooledTubes(new Integer(n.getAttributeValue("numPrePooledTubes")));
    } else {
      request.setNumPrePooledTubes(null);
    }

    previousCodeRequestStatus = request.getCodeRequestStatus();
    if (n.getAttributeValue("codeRequestStatus") != null && !n.getAttributeValue("codeRequestStatus").equals("")) {
      // Don't change request status to submitted unless the request is in new status
      if (n.getAttributeValue("codeRequestStatus").equals(RequestStatus.SUBMITTED) && (request.getCodeRequestStatus() != null && !request.getCodeRequestStatus().equals(RequestStatus.NEW))) {
        // Do nothing
      } else {
        request.setCodeRequestStatus(n.getAttributeValue("codeRequestStatus"));
        if (n.getAttributeValue("codeRequestStatus").equals(RequestStatus.COMPLETED)) {
          if (request.getCompletedDate() == null) {
            request.setCompletedDate(new java.sql.Date(System.currentTimeMillis()));
          }
          // Now change the billing items for the request from PENDING to COMPLETE
          for (BillingItem billingItem : request.getBillingItemList(sess)) {
            if (billingItem.getCodeBillingStatus().equals(BillingStatus.PENDING)) {
              billingItem.setCodeBillingStatus(BillingStatus.COMPLETED);
            }
          }
        }
      }
    } else {
      if (PropertyDictionaryHelper.getInstance(sess).getCoreFacilityRequestCategoryProperty(request.getIdCoreFacility(), request.getCodeRequestCategory(), PropertyDictionary.NEW_REQUEST_SAVE_BEFORE_SUBMIT).equals("Y")) {
        request.setCodeRequestStatus(RequestStatus.NEW);
      } else {
        request.setCodeRequestStatus(RequestStatus.SUBMITTED);
      }
    }
    request.setProtocolNumber(n.getAttributeValue("protocolNumber"));

    if (n.getChild("PropertyEntries") != null) {
      for (Iterator i1 = n.getChild("PropertyEntries").getChildren("PropertyEntry").iterator(); i1.hasNext();) {
        Element scNode = (Element) i1.next();
        if (scNode.getAttributeValue("isSelected").equals("true")) {
          this.propertiesToApplyMap.put(scNode.getAttributeValue("idProperty"), null);
        }
      }
    }

    if (n.getChild("SeqLibTreatmentEntries") != null) {
      for (Iterator i1 = n.getChild("SeqLibTreatmentEntries").getChildren("SeqLibTreatment").iterator(); i1.hasNext();) {
        Element sltNode = (Element) i1.next();
        this.seqLibTreatmentMap.put(sltNode.getAttributeValue("value"), null);
      }
    }

    if (n.getChild("collaborators") != null) {
      for (Iterator i1 = n.getChild("collaborators").getChildren("ExperimentCollaborator").iterator(); i1.hasNext();) {
        Element collaboratorNode = (Element) i1.next();
        this.collaboratorUploadMap.put(collaboratorNode.getAttributeValue("idAppUser"), collaboratorNode.getAttributeValue("canUploadData"));
        this.collaboratorUpdateMap.put(collaboratorNode.getAttributeValue("idAppUser"), collaboratorNode.getAttributeValue("canUpdate"));
      }
    }

    // Figure out if the user intended to save sample treatments
    if (n.getAttributeValue(TreatmentEntry.TREATMENT) != null && n.getAttributeValue(TreatmentEntry.TREATMENT).equalsIgnoreCase("Y")) {
      showTreatments = true;
    }

    // Is reuse slides checked on request (for new submits only, not updates)
    if (n.getAttributeValue("reuseSlides") != null && n.getAttributeValue("reuseSlides").equalsIgnoreCase("Y")) {
      this.saveReuseOfSlides = true;
    }

    // On existing requests, save visibility and privacyExpirationDate
    if (!isNewRequest) {
      if (request.getRequestCategory().getIsOwnerOnly() == null || request.getRequestCategory().getIsOwnerOnly().equals("N")) {
        if (this.secAdvisor.canUpdate(request, SecurityAdvisor.PROFILE_OBJECT_VISIBILITY)) {
          request.setCodeVisibility(n.getAttributeValue("codeVisibility"));
          request.setPrivacyExpirationDate(convertDate(n.getAttributeValue("privacyExpirationDate")));
        }
      } else if (request.getRequestCategory().getIsOwnerOnly() != null && request.getRequestCategory().getIsOwnerOnly().equals("Y")) {
        request.setCodeVisibility(Visibility.VISIBLE_TO_OWNER);
      }
    }

  }

  private void initializeRequest(JsonObject n, Request request, Session sess, RequestCategory requestCategory) throws Exception {

    if (n.get("isExternal") != null && !n.getString("isExternal").equals("")) {
      request.setIsExternal(n.getString("isExternal"));
    }

    if (n.get("amendState") != null && !n.getString("amendState").equals("")) {
      amendState = n.getString("amendState");
    }

    request.setName(n.get("name") != null ? this.unEscape(n.getString("name")) : null);

    otherCharacteristicLabel = this.unEscape(n.get(PropertyEntry.OTHER_LABEL) != null ? n.getString(PropertyEntry.OTHER_LABEL) : null);

    request.setCodeRequestCategory(n.getString("codeRequestCategory"));

    if (n.get("idCoreFacility") != null && !n.getString("idCoreFacility").equals("")) {
      request.setIdCoreFacility(new Integer(n.getString("idCoreFacility")));
    } else {
      request.setIdCoreFacility(null);
    }

    if (n.get("codeApplication") != null && !n.getString("codeApplication").equals("")) {
      request.setCodeApplication(n.getString("codeApplication"));
    }

    if (n.get("idAppUser") != null && !n.getString("idAppUser").equals("")) {
      request.setIdAppUser(new Integer(n.getString("idAppUser")));
    }
    if (n.get("idSubmitter") != null && !n.getString("idSubmitter").equals("")) {
      request.setIdSubmitter(new Integer(n.getString("idSubmitter")));
    }
    if (n.get("idLab") != null && !n.getString("idLab").equals("")) {
      request.setIdLab(new Integer(n.getString("idLab")));
    }
    if (n.get("idProject") != null && !n.getString("idProject").equals("")) {
      request.setIdProject(new Integer(n.getString("idProject")));
    }

    if (n.get("idSlideProduct") != null && !n.getString("idSlideProduct").equals("")) {
      request.setIdSlideProduct(new Integer(n.getString("idSlideProduct")));
    }

    if (n.get("idSampleTypeDefault") != null && !n.getString("idSampleTypeDefault").equals("")) {
      request.setIdSampleTypeDefault(new Integer(n.getString("idSampleTypeDefault")));
    }
    if (n.get("idOrganismSampleDefault") != null && !n.getString("idOrganismSampleDefault").equals("")) {
      request.setIdOrganismSampleDefault(new Integer(n.getString("idOrganismSampleDefault")));
    } else {
      request.setIdOrganismSampleDefault(null);
    }
    if (n.get("idSampleDropOffLocation") != null && !n.getString("idSampleDropOffLocation").equals("")) {
      request.setIdSampleDropOffLocation(new Integer(n.getString("idSampleDropOffLocation")));
    } else {
      request.setIdSampleDropOffLocation(null);
    }
    if (n.get("idProduct") != null && !n.getString("idProduct").equals("")) {
      request.setIdProduct(new Integer(n.getString("idProduct")));
    }
    if (n.get("coreToExtractDNA") != null && !n.getString("coreToExtractDNA").equals(""))
      request.setCoreToExtractDNA(n.getString("coreToExtractDNA"));

    if (n.get("applicationNotes") != null && !n.getString("applicationNotes").equals(""))
      request.setApplicationNotes(n.getString("applicationNotes"));

    if (n.get("includeBisulfideConversion") != null && !n.getString("includeBisulfideConversion").equals(""))
      request.setIncludeBisulfideConversion(n.getString("includeBisulfideConversion"));

    if (n.get("includeQubitConcentration") != null && !n.getString("includeQubitConcentration").equals(""))
      request.setIncludeQubitConcentration(n.getString("includeQubitConcentration"));

    if (n.get("newBillingTemplateIdBillingAccount") != null && !n.getString("newBillingTemplateIdBillingAccount").equals("")) {
      BillingTemplate oldBillingTemplate = BillingTemplateQueryManager.retrieveBillingTemplate(sess, request);
      if (oldBillingTemplate == null || !oldBillingTemplate.canBeDeactivated(sess)) {
        throw new Exception("Current billing template cannot be deactivated");
      }
      Integer newIdBillingAccount = new Integer(n.getString("newBillingTemplateIdBillingAccount"));
      request.setIdBillingAccount(newIdBillingAccount);
      billingTemplate = new BillingTemplate(request);
      billingTemplateItems = new TreeSet<BillingTemplateItem>();
      billingTemplateItems.add(getBillingTemplateItemForIdBA(newIdBillingAccount));
      isOpeningNewBillingTemplate = true;
      reassignBillingAccount = false;
    } else if (Util.getJsonStringSafeNonNull(n, "isOpeningNewBillingTemplate").equals("Y") && n.get("BillingTemplate") != null) {
      BillingTemplate oldBillingTemplate = BillingTemplateQueryManager.retrieveBillingTemplate(sess, request);

      if (oldBillingTemplate == null || !oldBillingTemplate.canBeDeactivated(sess)) {
        throw new Exception("Current billing template cannot be deactivated");
      }

      JsonObject billingTemplateJSON = n.getJsonObject("BillingTemplate");
      BillingTemplateParser btParser = new BillingTemplateParser(billingTemplateJSON);
      btParser.parse(sess);
      billingTemplate = btParser.getBillingTemplate();
      billingTemplate.setOrder(request);
      billingTemplateItems = btParser.getBillingTemplateItems();
      isOpeningNewBillingTemplate = true;
      reassignBillingAccount = false;
    } else if (n.get("BillingTemplate") != null) {
      JsonObject billingTemplateJSON = n.getJsonObject("BillingTemplate");
      BillingTemplateParser btParser = new BillingTemplateParser(billingTemplateJSON);
      btParser.parse(sess);
      billingTemplate = btParser.getBillingTemplate();
      billingTemplateItems = btParser.getBillingTemplateItems();
      if (!isNewRequest && !this.isExternalExperiment()) {
        BillingTemplate oldTemplate = BillingTemplateQueryManager.retrieveBillingTemplate(sess, request);
        if (oldTemplate == null || !oldTemplate.equals(billingTemplate)) {
          reassignBillingAccount = true;
        }
      }
      billingTemplate.setOrder(request);
    } else if (n.get("idBillingAccount") != null && !n.getString("idBillingAccount").equals("")) {
      Integer newIdBillingAccount = new Integer(n.getString("idBillingAccount"));
      request.setIdBillingAccount(newIdBillingAccount);
      billingTemplate = BillingTemplateQueryManager.retrieveBillingTemplate(sess, request);
      // If the billing account has been changed, we need to know so that any billing items can be revised as well.
      if (!isNewRequest && !this.isExternalExperiment()) {
        if (request.getAcceptingBalanceAccountId(sess) == null || !request.getAcceptingBalanceAccountId(sess).equals(newIdBillingAccount) || (billingTemplate != null && billingTemplate.getItems().size() > 1)) {
          reassignBillingAccount = true;
          if (!this.secAdvisor.hasPermission(SecurityAdvisor.CAN_ACCESS_ANY_OBJECT) && !ensureNonAdminCanAccessBillingAccount(newIdBillingAccount, sess)) {
            throw new Exception("User cannot access selected billing account.");
          }
        }
      }
      if (billingTemplate == null) {
        billingTemplate = new BillingTemplate(request);
      }
      billingTemplateItems = new TreeSet<BillingTemplateItem>();
      billingTemplateItems.add(getBillingTemplateItemForIdBA(newIdBillingAccount));
    } else if (n.get("idBillingTemplate") != null && !n.getString("idBillingTemplate").equals("")) {
      billingTemplate = sess.get(BillingTemplate.class, Integer.parseInt(n.getString("idBillingTemplate")));
      Hibernate.initialize(billingTemplate.getItems());
      billingTemplateItems = billingTemplate.getItems();
      Hibernate.initialize(billingTemplate.getMasterBillingItems());
      if (!isNewRequest && !this.isExternalExperiment()) {
        BillingTemplate oldTemplate = BillingTemplateQueryManager.retrieveBillingTemplate(sess, request);
        if (oldTemplate == null || !oldTemplate.equals(billingTemplate)) {
          reassignBillingAccount = true;
        }
      }
      billingTemplate.setOrder(request);
    }

      request.setDescription(n.getString("description"));

    if (n.get("reagent") != null && !n.getString("reagent").equals("")) {
      request.setReagent(n.getString("reagent"));
    }
    if (n.get("elutionBuffer") != null && !n.getString("elutionBuffer").equals("")) {
      request.setElutionBuffer(n.getString("elutionBuffer"));
    }
    if (n.get("usedDnase") != null && !n.getString("usedDnase").equals("")) {
      request.setUsedDnase(n.getString("usedDnase"));
    } else{
      request.setUsedDnase("N");
    }
    if (n.get("usedRnase") != null && !n.getString("usedRnase").equals("")) {
      request.setUsedRnase(n.getString("usedRnase"));
    } else{
      request.setUsedRnase("N");
    }
    if (n.get("keepSamples") != null && !n.getString("keepSamples").equals("")) {
      request.setKeepSamples(n.getString("keepSamples"));
    }

    if (n.get("captureLibDesignId") != null && !n.getString("captureLibDesignId").equals(""))
      request.setCaptureLibDesignId(n.getString("captureLibDesignId"));

    if (n.get("analysisInstructions") != null && !n.getString("analysisInstructions").equals(""))
      request.setAnalysisInstructions(n.getString("analysisInstructions"));

      request.setCorePrepInstructions(n.getString("corePrepInstructions"));

      request.setAdminNotes(n.getString("adminNotes"));

    if (n.get("codeProtocolType") != null && !n.getString("codeProtocolType").equals("")) {
      request.setCodeProtocolType(n.getString("codeProtocolType"));
    }
    if (n.get("codeBioanalyzerChipType") != null && !n.getString("codeBioanalyzerChipType").equals("")) {
      request.setCodeBioanalyzerChipType(n.getString("codeBioanalyzerChipType"));
    }
    if (n.get("codeIsolationPrepType") != null && !n.getString("codeIsolationPrepType").equals("")) {
      request.setCodeIsolationPrepType(n.getString("codeIsolationPrepType"));
    }
    if (n.get("bioinformaticsAssist") != null && !n.getString("bioinformaticsAssist").equals("")) {
      request.setBioinformaticsAssist(n.getString("bioinformaticsAssist"));
    }
    if (request.getBioinformaticsAssist() == null || (!request.getBioinformaticsAssist().equals("Y") && !request.getBioinformaticsAssist().equals("N"))) {
      request.setBioinformaticsAssist("N");
    }

    if (n.get("hasPrePooledLibraries") != null && !n.getString("hasPrePooledLibraries").equals("")) {
      request.setHasPrePooledLibraries(n.getString("hasPrePooledLibraries"));
    }
    if (request.getHasPrePooledLibraries() == null || (!request.getHasPrePooledLibraries().equals("Y") && !request.getHasPrePooledLibraries().equals("N"))) {
      request.setHasPrePooledLibraries("N");
    }

    if (request.getHasPrePooledLibraries().equals("Y") && n.getString("numPrePooledTubes") != null && !n.getString("numPrePooledTubes").equals("")) {
      request.setNumPrePooledTubes(new Integer(n.getString("numPrePooledTubes")));
    } else {
      request.setNumPrePooledTubes(null);
    }

    previousCodeRequestStatus = request.getCodeRequestStatus();
    if (n.get("codeRequestStatus") != null && !n.getString("codeRequestStatus").equals("")) {
      // Don't change request status to submitted unless the request is in new status
      if (n.getString("codeRequestStatus").equals(RequestStatus.SUBMITTED) && (request.getCodeRequestStatus() != null && !request.getCodeRequestStatus().equals(RequestStatus.NEW))) {
        // Do nothing
      } else {
        request.setCodeRequestStatus(n.getString("codeRequestStatus"));
        if (n.getString("codeRequestStatus").equals(RequestStatus.COMPLETED)) {
          if (request.getCompletedDate() == null) {
            request.setCompletedDate(new java.sql.Date(System.currentTimeMillis()));
          }
          // Now change the billing items for the request from PENDING to COMPLETE
          for (BillingItem billingItem : request.getBillingItemList(sess)) {
            if (billingItem.getCodeBillingStatus().equals(BillingStatus.PENDING)) {
              billingItem.setCodeBillingStatus(BillingStatus.COMPLETED);
            }
          }
        }
      }
    } else {
      if (PropertyDictionaryHelper.getInstance(sess).getCoreFacilityRequestCategoryProperty(request.getIdCoreFacility(), request.getCodeRequestCategory(), PropertyDictionary.NEW_REQUEST_SAVE_BEFORE_SUBMIT).equals("Y")) {
        request.setCodeRequestStatus(RequestStatus.NEW);
      } else {
        request.setCodeRequestStatus(RequestStatus.SUBMITTED);
      }
    }
    request.setProtocolNumber(n.getString("protocolNumber"));

    try {

    if (n.getJsonArray("PropertyEntries") != null) {
      for (int i = 0; i < n.getJsonArray("PropertyEntries").size(); i++) {
        JsonObject property = n.getJsonArray("PropertyEntries").getJsonObject(i);
        if (property.get("isSelected") != null && property.getString("isSelected").equals("true")) {
          this.propertiesToApplyMap.put(property.getString("idProperty"), null);
        }
      }
    }
} catch (Exception ee)
    {
      System.out.println("[RequestParser:init] PropertyEntries is not an array, ignoring it. " + ee.toString());
    }

 try {
    if (n.getJsonArray("SeqLibTreatmentEntries") != null) {
      for (int i = 0; i < n.getJsonArray("SeqLibTreatmentEntries").size(); i++) {
        this.seqLibTreatmentMap.put(n.getJsonArray("SeqLibTreatmentEntries").getJsonObject(i).getString("value"), null);
      }
    }
 } catch (Exception ee)
 {
   System.out.println("[RequestParser:init] SeqLibTreatmentEntries is not an array, ignoring it. " + ee.toString());
 }

 try {
    if (n.getJsonArray("collaborators") != null) {
      for (int i = 0; i < n.getJsonArray("collaborators").size(); i++) {
        JsonObject collaborator = n.getJsonArray("collaborators").getJsonObject(i);
        this.collaboratorUploadMap.put(collaborator.getString("idAppUser"), collaborator.getString("canUploadData"));
        this.collaboratorUpdateMap.put(collaborator.getString("idAppUser"), collaborator.getString("canUpdate"));
      }
    }
 } catch (Exception ee)
 {
   System.out.println("[RequestParser:init] collaborators is not an array, ignoring it. " + ee.toString());
 }


    // Figure out if the user intended to save sample treatments
    if (n.get(TreatmentEntry.TREATMENT) != null && n.getString(TreatmentEntry.TREATMENT).equalsIgnoreCase("Y")) {
      showTreatments = true;
    }

    // Is reuse slides checked on request (for new submits only, not updates)
    if (n.get("reuseSlides") != null && n.getString("reuseSlides").equalsIgnoreCase("Y")) {
      this.saveReuseOfSlides = true;
    }

    // On existing requests, save visibility and privacyExpirationDate
    if (!isNewRequest) {
      if (request.getRequestCategory().getIsOwnerOnly() == null || request.getRequestCategory().getIsOwnerOnly().equals("N")) {
        if (this.secAdvisor.canUpdate(request, SecurityAdvisor.PROFILE_OBJECT_VISIBILITY)) {
          request.setCodeVisibility(n.get("codeVisibility") != null ? n.getString("codeVisibility") : null);
          request.setPrivacyExpirationDate(convertDate(n.getString("privacyExpirationDate")));
        }
      } else if (request.getRequestCategory().getIsOwnerOnly() != null && request.getRequestCategory().getIsOwnerOnly().equals("Y")) {
        request.setCodeVisibility(Visibility.VISIBLE_TO_OWNER);
      }
    }

  }

  public BillingTemplateItem getBillingTemplateItemForIdBA(int idBillingAccount) throws Exception {
    BillingTemplateItem item = new BillingTemplateItem();
    item.setIdBillingAccount(idBillingAccount);
    item.setPercentSplit(BillingTemplateItem.WILL_TAKE_REMAINING_BALANCE);
    return item;
  }

  public Set<BillingTemplateItem> getBillingTemplateItems() {
    return billingTemplateItems;
  }

  private void initializeSample(JsonObject requestNode, JsonObject n, Session sess, RequestCategory requestCategory) throws Exception {
    boolean isNewSample = false;
    Sample sample = null;

    String idSampleString = n.getString("idSample");
    if (isNewRequest || idSampleString == null || idSampleString.equals("") || idSampleString.startsWith("Sample")) {
      sample = new Sample();
      isNewSample = true;
    } else {
      sample = sess.load(Sample.class, new Integer(idSampleString));
    }
    sample.setIdSampleString(idSampleString);

    PropertyDictionaryHelper propertyHelper = PropertyDictionaryHelper.getInstance(sess);

    Boolean isExternal = (requestNode.get("isExternal") != null && requestNode.getString("isExternal").equals("Y"));

    if (requestCategory.getCategoryType() != null && requestCategory.getCategoryType().getIsIllumina().equals("Y") && !isExternal) {
      initializeSample(n, sample, idSampleString, isNewSample, propertyHelper, true);
    } else if (requestCategory.getCategoryType() != null && requestCategory.getType().equals(RequestCategoryType.TYPE_MISEQ) && !isExternal) {
      initializeSample(n, sample, idSampleString, isNewSample, propertyHelper, true);
    } else {
      initializeSample(n, sample, idSampleString, isNewSample, propertyHelper, false);
    }

    if (isExternal) {
      // the request create screen doesn't do the idOrganism at the request
      // level so skip.
      if (requestNode.get("idOrganism") != null && requestNode.getString("idOrganism").toString().length() > 0) {
        sample.setIdOrganism(new Integer(requestNode.getString("idOrganism")));
        if (requestNode.get("otherOrganism") != null) {
          sample.setOtherOrganism(requestNode.getString("otherOrganism"));
        } else {
          sample.setOtherOrganism("");
        }
      }
    }
  }

  private void initializeSample(Element requestNode, Element n, Session sess, RequestCategory requestCategory) throws Exception {
    boolean isNewSample = false;
    Sample sample = null;

    String idSampleString = n.getAttributeValue("idSample");
    if (isNewRequest || idSampleString == null || idSampleString.equals("") || idSampleString.startsWith("Sample")) {
      sample = new Sample();
      isNewSample = true;
    } else {
      sample = sess.load(Sample.class, new Integer(idSampleString));
    }
    sample.setIdSampleString(idSampleString);

    PropertyDictionaryHelper propertyHelper = PropertyDictionaryHelper.getInstance(sess);

    Boolean isExternal = (requestNode.getAttributeValue("isExternal") != null && requestNode.getAttributeValue("isExternal").equals("Y"));

    if (requestCategory.getCategoryType() != null && requestCategory.getCategoryType().getIsIllumina().equals("Y") && !isExternal) {
      initializeSample(n, sample, idSampleString, isNewSample, propertyHelper, true);
    } else if (requestCategory.getCategoryType() != null && requestCategory.getType().equals(RequestCategoryType.TYPE_MISEQ) && !isExternal) {
      initializeSample(n, sample, idSampleString, isNewSample, propertyHelper, true);
    } else if (requestCategory.getCategoryType() != null && requestCategory.getType().equals(RequestCategoryType.TYPE_ILLSEQ) && !isExternal) {
      initializeSample(n, sample, idSampleString, isNewSample, propertyHelper, true);
    } else if (requestCategory.getCategoryType() != null && requestCategory.getType().equals(RequestCategoryType.TYPE_NOSEQ) && !isExternal) {
      initializeSample(n, sample, idSampleString, isNewSample, propertyHelper, true);
    } else {
      initializeSample(n, sample, idSampleString, isNewSample, propertyHelper, false);
    }

    if (isExternal) {
      // the request create screen doesn't do the idOrganism at the request
      // level so skip.
      if (requestNode.getAttributeValue("idOrganism") != null && requestNode.getAttributeValue("idOrganism").toString().length() > 0) {
        sample.setIdOrganism(new Integer(requestNode.getAttributeValue("idOrganism")));
        if (requestNode.getAttributeValue("otherOrganism") != null) {
          sample.setOtherOrganism(requestNode.getAttributeValue("otherOrganism"));
        } else {
          sample.setOtherOrganism("");
        }
      }
    }
  }

  private void initializeSample(JsonObject n, Sample sample, String idSampleString, boolean isNewSample, PropertyDictionaryHelper propertyHelper, boolean isHiseqOrMiseq) throws Exception {

    sample.setName(n.get("name") != null ? unEscape(n.getString("name")) : null);

    sample.setDescription(n.get("description") != null ? unEscape(n.getString("description")) : null);

    // We use the sample ID in the XML if this is an import
    if (isImport) {
      sample.setNumber(n.getString("number"));
    }

    if (n.get("idSampleType") != null && !n.getString("idSampleType").equals("")) {
      sample.setIdSampleType(new Integer(n.getString("idSampleType")));
    } else {
      sample.setIdSampleType(null);
    }
    if (n.get("idSampleSource") != null && !n.getString("idSampleSource").equals("")) {
      sample.setIdSampleSource(new Integer(n.getString("idSampleSource")));
    } else {
      sample.setIdSampleSource(null);
    }
    if (n.get("numberSequencingLanes") != null && !n.getString("numberSequencingLanes").equals("")) {
      sample.setNumberSequencingLanes(new Integer(n.getString("numberSequencingLanes")));
    } else {
      sample.setNumberSequencingLanes(null);
    }

    if (n.get("otherSamplePrepMethod") != null && !n.getString("otherSamplePrepMethod").equals("")) {
      sample.setOtherSamplePrepMethod(n.getString("otherSamplePrepMethod"));
    } else {
      sample.setOtherSamplePrepMethod(null);
    }
    if (n.get("idOrganism") != null && !n.getString("idOrganism").equals("")) {
      sample.setIdOrganism(new Integer(n.getString("idOrganism")));
    } else {
      sample.setIdOrganism(null);
    }
    if (n.get("otherOrganism") != null && !n.getString("otherOrganism").equals("")) {
      sample.setOtherOrganism(n.getString("otherOrganism"));
    } else {
      sample.setOtherOrganism(null);
    }
    if (n.get("concentration") != null && !n.getString("concentration").equals("")) {
      String conc = n.getString("concentration").replaceAll(",", "");
      sample.setConcentration(new BigDecimal(conc));
    } else {
      sample.setConcentration(null);
    }

    if (n.get("sampleVolume") != null && !n.getString("sampleVolume").equals("")) {
      String volume = n.getString("sampleVolume").replaceAll(",", "");
      sample.setSampleVolume(new BigDecimal(volume));
    } else {
      sample.setSampleVolume(null);
    }

    if (n.get("codeConcentrationUnit") != null && !n.getString("codeConcentrationUnit").equals("")) {
      sample.setCodeConcentrationUnit(unEscape(n.getString("codeConcentrationUnit")));
    } else {
      sample.setCodeConcentrationUnit(ConcentrationUnit.DEFAULT_SAMPLE_CONCENTRATION_UNIT);
    }
    if (n.get("qubitConcentration") != null && !n.getString("qubitConcentration").equals("")) {
      sample.setQubitConcentration(new BigDecimal(n.getString("qubitConcentration")));
    } else {
      sample.setQubitConcentration(null);
    }
    if (n.get("qcCodeApplication") != null && !n.getString("qcCodeApplication").equals("")) {
      sample.setQcCodeApplication(n.getString("qcCodeApplication"));
    } else {
      sample.setQcCodeApplication(null);
    }
    if (n.get("codeBioanalyzerChipType") != null && !n.getString("codeBioanalyzerChipType").equals("")) {
      sample.setCodeBioanalyzerChipType(n.getString("codeBioanalyzerChipType"));
    } else {
      sample.setCodeBioanalyzerChipType(null);
    }
    if (n.get("idOligoBarcode") != null && !n.getString("idOligoBarcode").equals("")) {
      sample.setIdOligoBarcode(new Integer(n.getString("idOligoBarcode")));
    } else {
      sample.setIdOligoBarcode(null);
    }
    if (n.get("idOligoBarcodeB") != null && !n.getString("idOligoBarcodeB").equals("")) {
      sample.setIdOligoBarcodeB(new Integer(n.getString("idOligoBarcodeB")));
    } else {
      sample.setIdOligoBarcodeB(null);
    }

    if (isHiseqOrMiseq) {
      if (n.get("multiplexGroupNumber") != null && !n.getString("multiplexGroupNumber").equals("")) {
        sample.setMultiplexGroupNumber(new Integer(n.getString("multiplexGroupNumber")));
      } else {
        // Allow to continue if just downloading a spread sheet.
        if (!this.forDownload) {
          throw new Exception("MultiplexGroupNumber cannot be empty for HiSeq or MiSeq experiments");
        }
      }
    } else {
      if (n.get("multiplexGroupNumber") != null && !n.getString("multiplexGroupNumber").equals("")) {
        sample.setMultiplexGroupNumber(new Integer(n.getString("multiplexGroupNumber")));
      } else {
        sample.setMultiplexGroupNumber(null);
      }
    }

    if (n.get("barcodeSequence") != null && !n.getString("barcodeSequence").equals("")) {
      sample.setBarcodeSequence(n.getString("barcodeSequence"));
    } else {
      sample.setBarcodeSequence(null);
    }
    if (n.get("barcodeSequenceB") != null && !n.getString("barcodeSequenceB").equals("")) {
      sample.setBarcodeSequenceB(n.getString("barcodeSequenceB"));
    } else {
      sample.setBarcodeSequenceB(null);
    }
    if (n.get("idSeqLibProtocol") != null && !n.getString("idSeqLibProtocol").trim().equals("")) {
      sample.setIdSeqLibProtocol(new Integer(n.getString("idSeqLibProtocol")));
    } else {
      sample.setIdSeqLibProtocol(null);
    }

    if (seqPrepByCore != null) {
      sample.setSeqPrepByCore(seqPrepByCore);
    } else if (n.get("seqPrepByCore") != null && !n.getString("seqPrepByCore").equals("")) {
      sample.setSeqPrepByCore(n.getString("seqPrepByCore"));
    } else {
      sample.setSeqPrepByCore("Y");
    }

    if (n.get("fragmentSizeFrom") != null && !n.getString("fragmentSizeFrom").equals("")) {
      sample.setFragmentSizeFrom(new Integer(n.getString("fragmentSizeFrom")));
    } else {
      sample.setFragmentSizeFrom(null);
    }
    if (n.get("fragmentSizeTo") != null && !n.getString("fragmentSizeTo").equals("")) {
      sample.setFragmentSizeTo(new Integer(n.getString("fragmentSizeTo")));
    } else {
      sample.setFragmentSizeTo(null);
    }
    if (n.get("prepInstructions") != null && !n.getString("prepInstructions").equals("")) {
      sample.setPrepInstructions(n.getString("prepInstructions"));
    } else {
      sample.setPrepInstructions(null);
    }
    if (n.get("meanLibSizeActual") != null && !n.getString("meanLibSizeActual").equals("")) {
      sample.setMeanLibSizeActual(new Integer((n.getString("meanLibSizeActual"))));
    } else {
      sample.setMeanLibSizeActual(null);
    }

    if (propertyHelper.getProperty(PropertyDictionary.BST_LINKAGE_SUPPORTED) != null && propertyHelper.getProperty(PropertyDictionary.BST_LINKAGE_SUPPORTED).equals("Y")) {
      if (n.get("ccNumber") != null && !n.getString("ccNumber").equals("")) {
        String ccNumber = n.getString("ccNumber");
        sample.setCcNumber(ccNumber);
        if (!ccNumberList.contains(ccNumber)) {
          ccNumberList.add(ccNumber);
        }
      } else {
        sample.setCcNumber(null);
      }
    }

    if (n.get("qcLibConcentration") != null && !n.getString("qcLibConcentration").equals("")) {
      sample.setQcLibConcentration(new BigDecimal(n.getString("qcLibConcentration")));
    } else {
      sample.setQcLibConcentration(null);
    }

    sampleMap.put(idSampleString, sample);
    sampleIds.add(idSampleString);

    // Hash sample characteristics entries
    Map annotations = new HashMap();
    for (Iterator i = n.keySet().iterator(); i.hasNext();) {
      String attributeName = (String) i.next();
      String value = n.get(attributeName) != null ? unEscape(n.getString(attributeName)) : null;

      // Strip off "ANNOT" from attribute name
      if (attributeName.startsWith("ANNOT")) {
        attributeName = attributeName.substring(5);
      }

      if (value != null && this.propertiesToApplyMap.containsKey(attributeName)) {
        annotations.put(Integer.valueOf(attributeName), value);
        sampleAnnotationCodeMap.put(attributeName, null);
      }
    }
    sampleAnnotationMap.put(idSampleString, annotations);

    // Hash sample treatment
    if (showTreatments && n.get(TreatmentEntry.TREATMENT) != null && !n.getString(TreatmentEntry.TREATMENT).equals("")) {
      sampleTreatmentMap.put(idSampleString, unEscape(n.getString(TreatmentEntry.TREATMENT)));
    }

    // If the user can manage workflow, initialize the sample quality control fields
    // (for updating).
    if (this.secAdvisor.hasPermission(SecurityAdvisor.CAN_MANAGE_WORKFLOW)) {
      if (n.get("qual260nmTo280nmRatio") != null && !n.getString("qual260nmTo280nmRatio").equals("")) {
        sample.setQual260nmTo280nmRatio(new BigDecimal(n.getString("qual260nmTo280nmRatio")));
      } else {
        sample.setQual260nmTo280nmRatio(null);
      }

      if (n.get("qual260nmTo230nmRatio") != null && !n.getString("qual260nmTo230nmRatio").equals("")) {
        sample.setQual260nmTo230nmRatio(new BigDecimal(n.getString("qual260nmTo230nmRatio")));
      } else {
        sample.setQual260nmTo230nmRatio(null);
      }

      if (n.get("qualFragmentSizeFrom") != null && !n.getString("qualFragmentSizeFrom").equals("")) {
        sample.setQualFragmentSizeFrom(new Integer(n.getString("qualFragmentSizeFrom")));
      } else {
        sample.setQualFragmentSizeFrom(null);
      }
      if (n.get("qualFragmentSizeTo") != null && !n.getString("qualFragmentSizeTo").equals("")) {
        sample.setQualFragmentSizeTo(new Integer(n.getString("qualFragmentSizeTo")));
      } else {
        sample.setQualFragmentSizeTo(null);
      }

      if (n.get("qualCalcConcentration") != null && !n.getString("qualCalcConcentration").equals("")) {
        sample.setQualCalcConcentration(new BigDecimal(n.getString("qualCalcConcentration")));
      } else {
        sample.setQualCalcConcentration(null);
      }

      if (n.get("qual28sTo18sRibosomalRatio") != null && !n.getString("qual28sTo18sRibosomalRatio").equals("")) {
        sample.setQual28sTo18sRibosomalRatio(new BigDecimal(n.getString("qual28sTo18sRibosomalRatio")));
      } else {
        sample.setQual28sTo18sRibosomalRatio(null);
      }

      if (n.get("qualRINNumber") != null && !n.getString("qualRINNumber").equals("")) {
        sample.setQualRINNumber(n.getString("qualRINNumber"));
      } else {
        sample.setQualRINNumber(null);
      }

      if (n.get("qualStatus") != null && !n.getString("qualStatus").equals("")) {
        String status = n.getString("qualStatus");
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

      if (n.get("seqPrepQualCodeBioanalyzerChipType") != null && !n.getString("seqPrepQualCodeBioanalyzerChipType").equals("")) {
        sample.setSeqPrepQualCodeBioanalyzerChipType(n.getString("seqPrepQualCodeBioanalyzerChipType"));
      } else {
        sample.setSeqPrepQualCodeBioanalyzerChipType(null);
      }

      if (n.get("seqPrepGelFragmentSizeFrom") != null && !n.getString("seqPrepGelFragmentSizeFrom").equals("")) {
        sample.setSeqPrepGelFragmentSizeFrom(new Integer(n.getString("seqPrepGelFragmentSizeFrom")));
      } else {
        sample.setSeqPrepGelFragmentSizeFrom(null);
      }
      if (n.get("seqPrepGelFragmentSizeTo") != null && !n.getString("seqPrepGelFragmentSizeTo").equals("")) {
        sample.setSeqPrepGelFragmentSizeTo(new Integer(n.getString("seqPrepGelFragmentSizeTo")));
      } else {
        sample.setSeqPrepGelFragmentSizeTo(null);
      }

      if (n.get("seqPrepStatus") != null && !n.getString("seqPrepStatus").equals("")) {
        String status = n.getString("seqPrepStatus");
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

    }

    // Have well and plate names so create well and plate rows
    if (n.get("wellName") != null && n.getString("wellName").length() > 0 && n.get("plateName") != null && n.getString("plateName").length() > 0) {
      this.hasPlates = true;
      Plate plate = new Plate();
      String plateIdAsString = "";
      if (n.get("idPlate") != null && n.getString("idPlate").length() > 0) {
        plateIdAsString = n.getString("idPlate");
        plate.setIdPlate(Integer.parseInt(n.getString("idPlate")));
      } else {
        plateIdAsString = n.getString("plateName");
        if (plateMap.containsKey(plateIdAsString)) {
          plate.setIdPlate(plateMap.get(plateIdAsString).getIdPlate());
        }
      }
      plate.setLabel(n.getString("plateName"));
      this.plateMap.put(plateIdAsString, plate);

      PlateWell well = new PlateWell();
      String wellIdAsString = "";
      if (n.get("idPlateWell") != null && n.getString("idPlateWell").length() > 0) {
        wellIdAsString = n.getString("idPlateWell");
        well.setIdPlateWell(Integer.parseInt(n.getString("idPlateWell")));
      } else {
        wellIdAsString = plateIdAsString + "&" + n.getString("wellName");
      }
      well.setRow(n.getString("wellName").substring(0, 1));
      well.setCol(Integer.parseInt(n.getString("wellName").substring(1)));
      this.wellMap.put(wellIdAsString, well);

      SamplePlateWell samplePlateWell = new SamplePlateWell();
      samplePlateWell.plateIdAsString = plateIdAsString;
      samplePlateWell.wellIdAsString = wellIdAsString;
      this.sampleToPlateMap.put(idSampleString, samplePlateWell);
    }

    // Hash map of assays chosen. Build up the map
    ArrayList<String> assays = new ArrayList<String>();
    for (Iterator i = n.keySet().iterator(); i.hasNext();) {
      String attributeName = (String) i.next();
      if (attributeName.startsWith("hasAssay") && n.get(attributeName) != null && n.getString(attributeName).equals("Y")) {
        String name = attributeName.substring(8);
        assays.add(name);
      }
    }
    this.sampleAssays.put(idSampleString, assays);

    // Cherry picking source and destination wells.
    if (n.get("sourcePlate") != null && n.getString("sourcePlate").length() > 0) {
      this.cherryPickSourcePlates.put(idSampleString, n.getString("sourcePlate"));
    }
    if (n.get("sourceWell") != null && n.getString("sourceWell").length() > 0) {
      this.cherryPickSourceWells.put(idSampleString, n.getString("sourceWell"));
    }
    if (n.get("destinationWell") != null && n.getString("destinationWell").length() > 0) {
      this.cherryPickDestinationWells.put(idSampleString, n.getString("destinationWell"));
    }
  }

  private void initializeSample(Element n, Sample sample, String idSampleString, boolean isNewSample, PropertyDictionaryHelper propertyHelper, boolean isHiseqOrMiseq) throws Exception {

    sample.setName(unEscape(n.getAttributeValue("name")));

    sample.setDescription(unEscape(n.getAttributeValue("description")));

    // We use the sample ID in the XML if this is an import
    if (isImport) {
      sample.setNumber(n.getAttributeValue("number"));
    }

    if (n.getAttributeValue("idSampleType") != null && !n.getAttributeValue("idSampleType").equals("")) {
      sample.setIdSampleType(new Integer(n.getAttributeValue("idSampleType")));
    } else {
      sample.setIdSampleType(null);
    }
    if (n.getAttributeValue("idSampleSource") != null && !n.getAttributeValue("idSampleSource").equals("")) {
      sample.setIdSampleSource(new Integer(n.getAttributeValue("idSampleSource")));
    } else {
      sample.setIdSampleSource(null);
    }
    if (n.getAttributeValue("numberSequencingLanes") != null && !n.getAttributeValue("numberSequencingLanes").equals("")) {
      sample.setNumberSequencingLanes(new Integer(n.getAttributeValue("numberSequencingLanes")));
    } else {
      sample.setNumberSequencingLanes(null);
    }

    if (n.getAttributeValue("otherSamplePrepMethod") != null && !n.getAttributeValue("otherSamplePrepMethod").equals("")) {
      sample.setOtherSamplePrepMethod(n.getAttributeValue("otherSamplePrepMethod"));
    } else {
      sample.setOtherSamplePrepMethod(null);
    }
    if (n.getAttributeValue("idOrganism") != null && !n.getAttributeValue("idOrganism").equals("")) {
      sample.setIdOrganism(new Integer(n.getAttributeValue("idOrganism")));
    } else {
      sample.setIdOrganism(null);
    }
    if (n.getAttributeValue("otherOrganism") != null && !n.getAttributeValue("otherOrganism").equals("")) {
      sample.setOtherOrganism(n.getAttributeValue("otherOrganism"));
    } else {
      sample.setOtherOrganism(null);
    }
    if (n.getAttributeValue("concentration") != null && !n.getAttributeValue("concentration").equals("")) {
      String conc = n.getAttributeValue("concentration").replaceAll(",", "");
      sample.setConcentration(new BigDecimal(conc));
    } else {
      sample.setConcentration(null);
    }

    if (n.getAttributeValue("sampleVolume") != null && !n.getAttributeValue("sampleVolume").equals("")) {
      String volume = n.getAttributeValue("sampleVolume").replaceAll(",", "");
      sample.setSampleVolume(new BigDecimal(volume));
    } else {
      sample.setSampleVolume(null);
    }

    if (n.getAttributeValue("codeConcentrationUnit") != null && !n.getAttributeValue("codeConcentrationUnit").equals("")) {
      sample.setCodeConcentrationUnit(unEscape(n.getAttributeValue("codeConcentrationUnit")));
    } else {
      sample.setCodeConcentrationUnit(ConcentrationUnit.DEFAULT_SAMPLE_CONCENTRATION_UNIT);
    }
    if (n.getAttributeValue("qubitConcentration") != null && !n.getAttributeValue("qubitConcentration").equals("")) {
      sample.setQubitConcentration(new BigDecimal(n.getAttributeValue("qubitConcentration")));
    } else {
      sample.setQubitConcentration(null);
    }
    if (n.getAttributeValue("qcCodeApplication") != null && !n.getAttributeValue("qcCodeApplication").equals("")) {
      sample.setQcCodeApplication(n.getAttributeValue("qcCodeApplication"));
    } else {
      sample.setQcCodeApplication(null);
    }
    if (n.getAttributeValue("codeBioanalyzerChipType") != null && !n.getAttributeValue("codeBioanalyzerChipType").equals("")) {
      sample.setCodeBioanalyzerChipType(n.getAttributeValue("codeBioanalyzerChipType"));
    } else {
      sample.setCodeBioanalyzerChipType(null);
    }
    if (n.getAttributeValue("idOligoBarcode") != null && !n.getAttributeValue("idOligoBarcode").equals("")) {
      sample.setIdOligoBarcode(new Integer(n.getAttributeValue("idOligoBarcode")));
    } else {
      sample.setIdOligoBarcode(null);
    }
    if (n.getAttributeValue("idOligoBarcodeB") != null && !n.getAttributeValue("idOligoBarcodeB").equals("")) {
      sample.setIdOligoBarcodeB(new Integer(n.getAttributeValue("idOligoBarcodeB")));
    } else {
      sample.setIdOligoBarcodeB(null);
    }

    if (isHiseqOrMiseq) {
      if (n.getAttributeValue("multiplexGroupNumber") != null && !n.getAttributeValue("multiplexGroupNumber").equals("")) {
        sample.setMultiplexGroupNumber(new Integer(n.getAttributeValue("multiplexGroupNumber")));
      } else {
        // Allow to continue if just downloading a spread sheet.
        if (!this.forDownload) {
          throw new Exception("MultiplexGroupNumber cannot be empty for HiSeq or MiSeq experiments");
        }
      }
    } else {
      if (n.getAttributeValue("multiplexGroupNumber") != null && !n.getAttributeValue("multiplexGroupNumber").equals("")) {
        sample.setMultiplexGroupNumber(new Integer(n.getAttributeValue("multiplexGroupNumber")));
      } else {
        sample.setMultiplexGroupNumber(null);
      }
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
    if (n.getAttributeValue("idSeqLibProtocol") != null && !n.getAttributeValue("idSeqLibProtocol").trim().equals("")) {
      sample.setIdSeqLibProtocol(new Integer(n.getAttributeValue("idSeqLibProtocol")));
    } else {
      sample.setIdSeqLibProtocol(null);
    }

    if (seqPrepByCore != null) {
      sample.setSeqPrepByCore(seqPrepByCore);
    } else if (n.getAttributeValue("seqPrepByCore") != null && !n.getAttributeValue("seqPrepByCore").equals("")) {
      sample.setSeqPrepByCore(n.getAttributeValue("seqPrepByCore"));
    } else {
      sample.setSeqPrepByCore("Y");
    }

    if (n.getAttributeValue("fragmentSizeFrom") != null && !n.getAttributeValue("fragmentSizeFrom").equals("")) {
      sample.setFragmentSizeFrom(new Integer(n.getAttributeValue("fragmentSizeFrom")));
    } else {
      sample.setFragmentSizeFrom(null);
    }
    if (n.getAttributeValue("fragmentSizeTo") != null && !n.getAttributeValue("fragmentSizeTo").equals("")) {
      sample.setFragmentSizeTo(new Integer(n.getAttributeValue("fragmentSizeTo")));
    } else {
      sample.setFragmentSizeTo(null);
    }
    if (n.getAttributeValue("prepInstructions") != null && !n.getAttributeValue("prepInstructions").equals("")) {
      sample.setPrepInstructions(n.getAttributeValue("prepInstructions"));
    } else {
      sample.setPrepInstructions(null);
    }
    if (n.getAttributeValue("meanLibSizeActual") != null && !n.getAttributeValue("meanLibSizeActual").equals("")) {
      sample.setMeanLibSizeActual(new Integer((n.getAttributeValue("meanLibSizeActual"))));
    } else {
      sample.setMeanLibSizeActual(null);
    }

    if (propertyHelper.getProperty(PropertyDictionary.BST_LINKAGE_SUPPORTED) != null && propertyHelper.getProperty(PropertyDictionary.BST_LINKAGE_SUPPORTED).equals("Y")) {
      if (n.getAttributeValue("ccNumber") != null && !n.getAttributeValue("ccNumber").equals("")) {
        String ccNumber = n.getAttributeValue("ccNumber");
        sample.setCcNumber(ccNumber);
        if (!ccNumberList.contains(ccNumber)) {
          ccNumberList.add(ccNumber);
        }
      } else {
        sample.setCcNumber(null);
      }
    }

    if (n.getAttributeValue("qcLibConcentration") != null && !n.getAttributeValue("qcLibConcentration").equals("")) {
      String qcLibConcentration = n.getAttributeValue("qcLibConcentration").replaceAll(",", "");
      sample.setQcLibConcentration(new BigDecimal(qcLibConcentration));
    } else {
      sample.setQcLibConcentration(null);
    }

    sampleMap.put(idSampleString, sample);
    sampleIds.add(idSampleString);

    // Hash sample characteristics entries
    Map annotations = new HashMap();
    for (Iterator i = n.getAttributes().iterator(); i.hasNext();) {

      Attribute a = (Attribute) i.next();
      String attributeName = a.getName();
      String value = unEscape(a.getValue());

      // Strip off "ANNOT" from attribute name
      if (attributeName.startsWith("ANNOT")) {
        attributeName = attributeName.substring(5);
      }

      if (value != null && this.propertiesToApplyMap.containsKey(attributeName)) {
        annotations.put(Integer.valueOf(attributeName), value);
        sampleAnnotationCodeMap.put(attributeName, null);
      }
    }
    sampleAnnotationMap.put(idSampleString, annotations);

    // Hash sample treatment
    if (showTreatments && n.getAttributeValue(TreatmentEntry.TREATMENT) != null && !n.getAttributeValue(TreatmentEntry.TREATMENT).equals("")) {
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

      if (n.getAttributeValue("qualFragmentSizeFrom") != null && !n.getAttributeValue("qualFragmentSizeFrom").equals("")) {
        sample.setQualFragmentSizeFrom(new Integer(n.getAttributeValue("qualFragmentSizeFrom")));
      } else {
        sample.setQualFragmentSizeFrom(null);
      }
      if (n.getAttributeValue("qualFragmentSizeTo") != null && !n.getAttributeValue("qualFragmentSizeTo").equals("")) {
        sample.setQualFragmentSizeTo(new Integer(n.getAttributeValue("qualFragmentSizeTo")));
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

      if (n.getAttributeValue("seqPrepQualCodeBioanalyzerChipType") != null && !n.getAttributeValue("seqPrepQualCodeBioanalyzerChipType").equals("")) {
        sample.setSeqPrepQualCodeBioanalyzerChipType(n.getAttributeValue("seqPrepQualCodeBioanalyzerChipType"));
      } else {
        sample.setSeqPrepQualCodeBioanalyzerChipType(null);
      }

      if (n.getAttributeValue("seqPrepGelFragmentSizeFrom") != null && !n.getAttributeValue("seqPrepGelFragmentSizeFrom").equals("")) {
        sample.setSeqPrepGelFragmentSizeFrom(new Integer(n.getAttributeValue("seqPrepGelFragmentSizeFrom")));
      } else {
        sample.setSeqPrepGelFragmentSizeFrom(null);
      }
      if (n.getAttributeValue("seqPrepGelFragmentSizeTo") != null && !n.getAttributeValue("seqPrepGelFragmentSizeTo").equals("")) {
        sample.setSeqPrepGelFragmentSizeTo(new Integer(n.getAttributeValue("seqPrepGelFragmentSizeTo")));
      } else {
        sample.setSeqPrepGelFragmentSizeTo(null);
      }

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

    }

    // Have well and plate names so create well and plate rows
    if (n.getAttributeValue("wellName") != null && n.getAttributeValue("wellName").length() > 0 && n.getAttributeValue("plateName") != null && n.getAttributeValue("plateName").length() > 0) {
      this.hasPlates = true;
      Plate plate = new Plate();
      String plateIdAsString = "";
      if (n.getAttributeValue("idPlate") != null && n.getAttributeValue("idPlate").length() > 0) {
        plateIdAsString = n.getAttributeValue("idPlate");
        plate.setIdPlate(Integer.parseInt(n.getAttributeValue("idPlate")));
      } else {
        plateIdAsString = n.getAttributeValue("plateName");
        if (plateMap.containsKey(plateIdAsString)) {
          plate.setIdPlate(plateMap.get(plateIdAsString).getIdPlate());
        }
      }
      plate.setLabel(n.getAttributeValue("plateName"));
      this.plateMap.put(plateIdAsString, plate);

      PlateWell well = new PlateWell();
      String wellIdAsString = "";
      if (n.getAttributeValue("idPlateWell") != null && n.getAttributeValue("idPlateWell").length() > 0) {
        wellIdAsString = n.getAttributeValue("idPlateWell");
        well.setIdPlateWell(Integer.parseInt(n.getAttributeValue("idPlateWell")));
      } else {
        wellIdAsString = plateIdAsString + "&" + n.getAttributeValue("wellName");
      }
      well.setRow(n.getAttributeValue("wellName").substring(0, 1));
      well.setCol(Integer.parseInt(n.getAttributeValue("wellName").substring(1)));
      this.wellMap.put(wellIdAsString, well);

      SamplePlateWell samplePlateWell = new SamplePlateWell();
      samplePlateWell.plateIdAsString = plateIdAsString;
      samplePlateWell.wellIdAsString = wellIdAsString;
      this.sampleToPlateMap.put(idSampleString, samplePlateWell);
    }

    // Hash map of assays chosen. Build up the map
    ArrayList<String> assays = new ArrayList<String>();
    for (Iterator i = n.getAttributes().iterator(); i.hasNext();) {
      Attribute attr = (Attribute) i.next();
      if (attr.getName().startsWith("hasAssay") && attr.getValue() != null && attr.getValue().equals("Y")) {
        String name = attr.getName().substring(8);
        assays.add(name);
      }
    }
    this.sampleAssays.put(idSampleString, assays);

    // Cherry picking source and destination wells.
    if (n.getAttributeValue("sourcePlate") != null && n.getAttributeValue("sourcePlate").length() > 0) {
      this.cherryPickSourcePlates.put(idSampleString, n.getAttributeValue("sourcePlate"));
    }
    if (n.getAttributeValue("sourceWell") != null && n.getAttributeValue("sourceWell").length() > 0) {
      this.cherryPickSourceWells.put(idSampleString, n.getAttributeValue("sourceWell"));
    }
    if (n.getAttributeValue("destinationWell") != null && n.getAttributeValue("destinationWell").length() > 0) {
      this.cherryPickDestinationWells.put(idSampleString, n.getAttributeValue("destinationWell"));
    }
  }

  private void initializeHyb(JsonObject n) {

    HybInfo hybInfo = new HybInfo();

    hybInfo.setIdHybridization(n.get("idHybridization") != null ? n.getString("idHybridization") : null);

    String idSampleChannel1String = n.get("idSampleChannel1") != null ? n.getString("idSampleChannel1") : null;
    if (idSampleChannel1String != null && !idSampleChannel1String.equals("")) {
      hybInfo.setIdSampleChannel1String(idSampleChannel1String);
      hybInfo.setSampleChannel1((Sample) sampleMap.get(idSampleChannel1String));
    }

    String idSampleChannel2String = n.get("idSampleChannel2") != null ? n.getString("idSampleChannel2") : null;
    if (idSampleChannel2String != null && !idSampleChannel2String.equals("")) {
      hybInfo.setIdSampleChannel2String(idSampleChannel2String);
      hybInfo.setSampleChannel2((Sample) sampleMap.get(idSampleChannel2String));
    }

    String codeSlideSource = null;
    if (n.get("codeSlideSource") != null && !n.getString("codeSlideSource").equals("")) {
      codeSlideSource = n.getString("codeSlideSource");
    }
    hybInfo.setCodeSlideSource(codeSlideSource);

    if (n.get("idSlideDesign") != null && !n.getString("idSlideDesign").equals("")) {
      hybInfo.setIdSlideDesign(new Integer(n.getString("idSlideDesign")));
    }

    hybInfo.setNotes(n.get("notes") != null ? unEscape(n.getString("notes")): null);

    //
    // Workflow fields
    //

    // Labeling (channel1)
    if (n.get("labelingYieldChannel1") != null && !n.getString("labelingYieldChannel1").equals("")) {
      hybInfo.setLabelingYieldChannel1(new BigDecimal(n.getString("labelingYieldChannel1")));
    }
    if (n.get("idLabelingProtocolChannel1") != null && !n.getString("idLabelingProtocolChannel1").equals("")) {
      hybInfo.setIdLabelingProtocolChannel1(new Integer(n.getString("idLabelingProtocolChannel1")));
    }

    if (n.get("codeLabelingReactionSizeChannel1") != null && !n.getString("codeLabelingReactionSizeChannel1").equals("")) {
      hybInfo.setCodeLabelingReactionSizeChannel1(n.getString("codeLabelingReactionSizeChannel1"));
    }

    if (n.get("numberOfReactionsChannel1") != null && !n.getString("numberOfReactionsChannel1").equals("")) {
      hybInfo.setNumberOfReactionsChannel1(new Integer(n.getString("numberOfReactionsChannel1")));
    }
    if (n.get("labelingStatusChannel1") != null && !n.getString("labelingStatusChannel1").equals("")) {
      String status = n.getString("labelingStatusChannel1");
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
    if (n.get("labelingYieldChannel2") != null && !n.getString("labelingYieldChannel2").equals("")) {
      hybInfo.setLabelingYieldChannel2(new BigDecimal(n.getString("labelingYieldChannel2")));
    }
    if (n.get("idLabelingProtocolChannel2") != null && !n.getString("idLabelingProtocolChannel2").equals("")) {
      hybInfo.setIdLabelingProtocolChannel2(new Integer(n.getString("idLabelingProtocolChannel2")));
    }

    if (n.get("codeLabelingReactionSizeChannel2") != null && !n.getString("codeLabelingReactionSizeChannel2").equals("")) {
      hybInfo.setCodeLabelingReactionSizeChannel2(n.getString("codeLabelingReactionSizeChannel2"));
    }

    if (n.get("numberOfReactionsChannel2") != null && !n.getString("numberOfReactionsChannel2").equals("")) {
      hybInfo.setNumberOfReactionsChannel2(new Integer(n.getString("numberOfReactionsChannel2")));
    }
    if (n.get("labelingStatusChannel2") != null && !n.getString("labelingStatusChannel2").equals("")) {
      String status = n.getString("labelingStatusChannel2");
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
    if (n.get("hybStatus") != null && !n.getString("hybStatus").equals("")) {
      String status = n.getString("hybStatus");
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

    if (n.get("slideBarcode") != null && !n.getString("slideBarcode").equals("")) {
      hybInfo.setSlideBarcode(n.getString("slideBarcode"));
    }
    if (n.get("arrayCoordinateName") != null && !n.getString("arrayCoordinateName").equals("")) {
      hybInfo.setArrayCoordinateName(n.getString("arrayCoordinateName"));
    }

    if (n.get("idHybProtocol") != null && !n.getString("idHybProtocol").equals("")) {
      hybInfo.setIdHybProtocol(new Integer(n.getString("idHybProtocol")));
    }
    if (n.get("idScanProtocol") != null && !n.getString("idScanProtocol").equals("")) {
      hybInfo.setIdScanProtocol(new Integer(n.getString("idScanProtocol")));
    }
    if (n.get("idFeatureExtractionProtocol") != null && !n.getString("idFeatureExtractionProtocol").equals("")) {
      hybInfo.setIdFeatureExtractionProtocol(new Integer(n.getString("idFeatureExtractionProtocol")));
    }

    // Extraction
    if (n.get("extractionStatus") != null && !n.getString("extractionStatus").equals("")) {
      String status = n.getString("extractionStatus");
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

  private void initializeHyb(Element n) {

    HybInfo hybInfo = new HybInfo();

    hybInfo.setIdHybridization(n.getAttributeValue("idHybridization"));

    String idSampleChannel1String = n.getAttributeValue("idSampleChannel1");
    if (idSampleChannel1String != null && !idSampleChannel1String.equals("")) {
      hybInfo.setIdSampleChannel1String(idSampleChannel1String);
      hybInfo.setSampleChannel1((Sample) sampleMap.get(idSampleChannel1String));
    }

    String idSampleChannel2String = n.getAttributeValue("idSampleChannel2");
    if (idSampleChannel2String != null && !idSampleChannel2String.equals("")) {
      hybInfo.setIdSampleChannel2String(idSampleChannel2String);
      hybInfo.setSampleChannel2((Sample) sampleMap.get(idSampleChannel2String));
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

  private void initializeSequenceLane(JsonObject n) {

    SequenceLaneInfo sequenceLaneInfo = new SequenceLaneInfo();

    sequenceLaneInfo.setIdSequenceLane(n.get("idSequenceLane") != null ? n.getString("idSequenceLane") : null);

    String idSampleString = n.get("idSample") != null ? n.getString("idSample") : null;
    if (idSampleString != null && !idSampleString.equals("")) {
      sequenceLaneInfo.setIdSampleString(idSampleString);
      sequenceLaneInfo.setSample((Sample) sampleMap.get(idSampleString));
    }

    // We use the sample ID in the XML if this is an import
    if (isImport) {
      sequenceLaneInfo.setNumber(n.get("number") != null ? n.getString("number") : null);
    }

    if (n.get("idNumberSequencingCycles") != null && !n.getString("idNumberSequencingCycles").equals("")) {
      sequenceLaneInfo.setIdNumberSequencingCycles(new Integer(n.getString("idNumberSequencingCycles")));
    }

    if (n.get("idNumberSequencingCyclesAllowed") != null && !n.getString("idNumberSequencingCyclesAllowed").equals("")) {
      sequenceLaneInfo.setIdNumberSequencingCyclesAllowed(new Integer(n.getString("idNumberSequencingCyclesAllowed")));
    }

    if (n.get("idSeqRunType") != null && !n.getString("idSeqRunType").equals("")) {
      sequenceLaneInfo.setIdSeqRunType(new Integer(n.getString("idSeqRunType")));
    }

    if (n.get("idGenomeBuildAlignTo") != null && !n.getString("idGenomeBuildAlignTo").equals("")) {
      sequenceLaneInfo.setIdGenomeBuildAlignTo(new Integer(n.getString("idGenomeBuildAlignTo")));
    }

    if (n.get("flowCellChannelSampleConcentrationpM") != null && !n.getString("flowCellChannelSampleConcentrationpM").equals("")) {
      sequenceLaneInfo.setFlowCellChannelSampleConcentrationpM(new BigDecimal(n.getString("flowCellChannelSampleConcentrationpM")));
    }

    //
    // workflow fields
    //
    if (n.get("numberSequencingCyclesActual") != null && !n.getString("numberSequencingCyclesActual").equals("")) {
      sequenceLaneInfo.setNumberSequencingCyclesActual(new Integer(n.getString("numberSequencingCyclesActual")));
    }
    if (n.get("clustersPerTile") != null && !n.getString("clustersPerTile").equals("")) {
      sequenceLaneInfo.setClustersPerTile(new Integer(n.getString("clustersPerTile")));
    }
    if (n.get("fileName") != null && !n.getString("fileName").equals("")) {
      sequenceLaneInfo.setFileName(n.getString("fileName"));
    }

    // first cycle status
    if (n.get("firstCycleStatus") != null && !n.getString("firstCycleStatus").equals("")) {
      String status = n.getString("firstCycleStatus");
      if (status.equals(Constants.STATUS_COMPLETED)) {
        sequenceLaneInfo.setSeqRunFirstCycleCompleted("Y");
        sequenceLaneInfo.setSeqRunFirstCycleFailed("N");
      } else if (status.equals(Constants.STATUS_TERMINATED)) {
        sequenceLaneInfo.setSeqRunFirstCycleCompleted("N");
        sequenceLaneInfo.setSeqRunFirstCycleFailed("Y");
      }
    } else {
      sequenceLaneInfo.setSeqRunFirstCycleCompleted("N");
      sequenceLaneInfo.setSeqRunFirstCycleFailed("N");
    }

    // last cycle status
    if (n.get("lastCycleStatus") != null && !n.getString("lastCycleStatus").equals("")) {
      String status = n.getString("lastCycleStatus");
      if (status.equals(Constants.STATUS_COMPLETED)) {
        sequenceLaneInfo.setSeqRunLastCycleCompleted("Y");
        sequenceLaneInfo.setSeqRunLastCycleFailed("N");
      } else if (status.equals(Constants.STATUS_TERMINATED)) {
        sequenceLaneInfo.setSeqRunLastCycleCompleted("N");
        sequenceLaneInfo.setSeqRunLastCycleFailed("Y");
      }
    } else {
      sequenceLaneInfo.setSeqRunLastCycleCompleted("N");
      sequenceLaneInfo.setSeqRunLastCycleFailed("N");
    }

    // pipeline status
    if (n.get("pipelineStatus") != null && !n.getString("pipelineStatus").equals("")) {
      String status = n.getString("pipelineStatus");
      if (status.equals(Constants.STATUS_COMPLETED)) {
        sequenceLaneInfo.setSeqRunPipelineCompleted("Y");
        sequenceLaneInfo.setSeqRunPipelineFailed("N");
      } else if (status.equals(Constants.STATUS_TERMINATED)) {
        sequenceLaneInfo.setSeqRunPipelineCompleted("N");
        sequenceLaneInfo.setSeqRunPipelineFailed("Y");
      }
    } else {
      sequenceLaneInfo.setSeqRunPipelineCompleted("N");
      sequenceLaneInfo.setSeqRunPipelineFailed("N");
    }

    sequenceLaneInfos.add(sequenceLaneInfo);
  }

  private void initializeSequenceLane(Element n) {

    SequenceLaneInfo sequenceLaneInfo = new SequenceLaneInfo();

    sequenceLaneInfo.setIdSequenceLane(n.getAttributeValue("idSequenceLane"));

    String idSampleString = n.getAttributeValue("idSample");
    if (idSampleString != null && !idSampleString.equals("")) {
      sequenceLaneInfo.setIdSampleString(idSampleString);
      sequenceLaneInfo.setSample((Sample) sampleMap.get(idSampleString));
    }

    // We use the sample ID in the XML if this is an import
    if (isImport) {
      sequenceLaneInfo.setNumber(n.getAttributeValue("number"));
    }

    if (n.getAttributeValue("idNumberSequencingCycles") != null && !n.getAttributeValue("idNumberSequencingCycles").equals("")) {
      sequenceLaneInfo.setIdNumberSequencingCycles(new Integer(n.getAttributeValue("idNumberSequencingCycles")));
    }

    if (n.getAttributeValue("idNumberSequencingCyclesAllowed") != null && !n.getAttributeValue("idNumberSequencingCyclesAllowed").equals("")) {
      sequenceLaneInfo.setIdNumberSequencingCyclesAllowed(new Integer(n.getAttributeValue("idNumberSequencingCyclesAllowed")));
    }

    if (n.getAttributeValue("idSeqRunType") != null && !n.getAttributeValue("idSeqRunType").equals("")) {
      sequenceLaneInfo.setIdSeqRunType(new Integer(n.getAttributeValue("idSeqRunType")));
    }

    if (n.getAttributeValue("idGenomeBuildAlignTo") != null && !n.getAttributeValue("idGenomeBuildAlignTo").equals("")) {
      sequenceLaneInfo.setIdGenomeBuildAlignTo(new Integer(n.getAttributeValue("idGenomeBuildAlignTo")));
    }

    if (n.getAttributeValue("flowCellChannelSampleConcentrationpM") != null && !n.getAttributeValue("flowCellChannelSampleConcentrationpM").equals("")) {
      sequenceLaneInfo.setFlowCellChannelSampleConcentrationpM(new BigDecimal(n.getAttributeValue("flowCellChannelSampleConcentrationpM")));
    }

    //
    // workflow fields
    //
    if (n.getAttributeValue("numberSequencingCyclesActual") != null && !n.getAttributeValue("numberSequencingCyclesActual").equals("")) {
      sequenceLaneInfo.setNumberSequencingCyclesActual(new Integer(n.getAttributeValue("numberSequencingCyclesActual")));
    }
    if (n.getAttributeValue("clustersPerTile") != null && !n.getAttributeValue("clustersPerTile").equals("")) {
      sequenceLaneInfo.setClustersPerTile(new Integer(n.getAttributeValue("clustersPerTile")));
    }
    if (n.getAttributeValue("fileName") != null && !n.getAttributeValue("fileName").equals("")) {
      sequenceLaneInfo.setFileName(n.getAttributeValue("fileName"));
    }

    // first cycle status
    if (n.getAttributeValue("firstCycleStatus") != null && !n.getAttributeValue("firstCycleStatus").equals("")) {
      String status = n.getAttributeValue("firstCycleStatus");
      if (status.equals(Constants.STATUS_COMPLETED)) {
        sequenceLaneInfo.setSeqRunFirstCycleCompleted("Y");
        sequenceLaneInfo.setSeqRunFirstCycleFailed("N");
      } else if (status.equals(Constants.STATUS_TERMINATED)) {
        sequenceLaneInfo.setSeqRunFirstCycleCompleted("N");
        sequenceLaneInfo.setSeqRunFirstCycleFailed("Y");
      }
    } else {
      sequenceLaneInfo.setSeqRunFirstCycleCompleted("N");
      sequenceLaneInfo.setSeqRunFirstCycleFailed("N");
    }

    // last cycle status
    if (n.getAttributeValue("lastCycleStatus") != null && !n.getAttributeValue("lastCycleStatus").equals("")) {
      String status = n.getAttributeValue("lastCycleStatus");
      if (status.equals(Constants.STATUS_COMPLETED)) {
        sequenceLaneInfo.setSeqRunLastCycleCompleted("Y");
        sequenceLaneInfo.setSeqRunLastCycleFailed("N");
      } else if (status.equals(Constants.STATUS_TERMINATED)) {
        sequenceLaneInfo.setSeqRunLastCycleCompleted("N");
        sequenceLaneInfo.setSeqRunLastCycleFailed("Y");
      }
    } else {
      sequenceLaneInfo.setSeqRunLastCycleCompleted("N");
      sequenceLaneInfo.setSeqRunLastCycleFailed("N");
    }

    // pipeline status
    if (n.getAttributeValue("pipelineStatus") != null && !n.getAttributeValue("pipelineStatus").equals("")) {
      String status = n.getAttributeValue("pipelineStatus");
      if (status.equals(Constants.STATUS_COMPLETED)) {
        sequenceLaneInfo.setSeqRunPipelineCompleted("Y");
        sequenceLaneInfo.setSeqRunPipelineFailed("N");
      } else if (status.equals(Constants.STATUS_TERMINATED)) {
        sequenceLaneInfo.setSeqRunPipelineCompleted("N");
        sequenceLaneInfo.setSeqRunPipelineFailed("Y");
      }
    } else {
      sequenceLaneInfo.setSeqRunPipelineCompleted("N");
      sequenceLaneInfo.setSeqRunPipelineFailed("N");
    }

    sequenceLaneInfos.add(sequenceLaneInfo);
  }

  private boolean ensureNonAdminCanAccessBillingAccount(Integer idBillingAccount, Session sess) {
    boolean canAccess = false;

    BillingAccount billingAccount = sess.load(BillingAccount.class, idBillingAccount);
    if (billingAccount.getUsers() != null && billingAccount.getUsers().size() > 0) {
      for (Iterator iter = billingAccount.getUsers().iterator(); iter.hasNext();) {
        AppUser user = (AppUser) iter.next();
        if (user.getIdAppUser().equals(secAdvisor.getIdAppUser())) {
          canAccess = true;
          break;
        }
      }
    } else {
      canAccess = true;
    }

    if (secAdvisor.hasPermission(SecurityAdvisor.CAN_ACCESS_ANY_OBJECT)) {
      canAccess = true;
    }

    return canAccess;
  }

  public Map getCharacteristicsToApplyMap() {
    return propertiesToApplyMap;
  }

  public Map getSampleAnnotationCodeMap() {
    return sampleAnnotationCodeMap;
  }

  public Map getSampleAnnotationMap() {
    return sampleAnnotationMap;
  }
  public Map<String,List<String>> getRequestAnnotationMap(){
    return this.requestAnnotationMap;
  }
  public Map getSampleMap() {
    return sampleMap;
  }

  public Map getSampleTreatmentMap() {
    return sampleTreatmentMap;
  }

  public Map getSeqLibTreatmentMap() {
    return seqLibTreatmentMap;
  }

  public Map getCollaboratorUploadMap() {
    return collaboratorUploadMap;
  }

  public Map getCollaboratorUpdateMap() {
    return collaboratorUpdateMap;
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
    private String idHybridization;
    private String idSampleChannel1String;
    private String idSampleChannel2String;
    private Sample sampleChannel1;
    private Sample sampleChannel2;
    private String codeSlideSource;
    private Integer idSlideDesign;
    private String notes;

    private BigDecimal labelingYieldChannel1;
    private Integer idLabelingProtocolChannel1;
    private Integer numberOfReactionsChannel1;
    private String codeLabelingReactionSizeChannel1;
    private String labelingCompletedChannel1 = "N";
    private String labelingFailedChannel1 = "N";
    private String labelingBypassedChannel1 = "N";

    private BigDecimal labelingYieldChannel2;
    private Integer idLabelingProtocolChannel2;
    private Integer numberOfReactionsChannel2;
    private String codeLabelingReactionSizeChannel2;
    private String labelingCompletedChannel2 = "N";
    private String labelingFailedChannel2 = "N";
    private String labelingBypassedChannel2 = "N";

    private String slideBarcode;
    private String arrayCoordinateName;
    private Integer idHybProtocol;
    private Integer idScanProtocol;
    private Integer idFeatureExtractionProtocol;
    private String hybCompleted = "N";
    private String hybFailed = "N";
    private String hybBypassed = "N";
    private String extractionCompleted;
    private String extractionFailed;
    private String extractionBypassed;

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

    public void setCodeLabelingReactionSizeChannel1(String codeLabelingReactionSizeChannel1) {
      this.codeLabelingReactionSizeChannel1 = codeLabelingReactionSizeChannel1;
    }

    public String getCodeLabelingReactionSizeChannel2() {
      return codeLabelingReactionSizeChannel2;
    }

    public void setCodeLabelingReactionSizeChannel2(String codeLabelingReactionSizeChannel2) {
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
    private String idSequenceLane;
    private String idSampleString;
    private String number;

    private Sample sample;
    private Integer idSeqRunType;
    private Integer idNumberSequencingCycles;
    private Integer idNumberSequencingCyclesAllowed;
    private Integer idGenomeBuildAlignTo;
    private String analysisInstructions;
    private Integer numberSequencingCyclesActual;
    private Integer clustersPerTile;
    private String fileName;
    private String seqRunFirstCycleCompleted = "N";
    private String seqRunFirstCycleFailed = "N";
    private String seqRunLastCycleCompleted = "N";
    private String seqRunLastCycleFailed = "N";
    private String seqRunPipelineCompleted = "N";
    private String seqRunPipelineFailed = "N";
    private BigDecimal flowCellChannelSampleConcentrationpM;

    public Integer getIdSeqRunType() {
      return idSeqRunType;
    }

    public void setIdSeqRunType(Integer idSeqRunType) {
      this.idSeqRunType = idSeqRunType;
    }

    public BigDecimal getFlowCellChannelSampleConcentrationpM() {
      return flowCellChannelSampleConcentrationpM;
    }

    public void setFlowCellChannelSampleConcentrationpM(BigDecimal flowCellChannelSampleConcentrationpM) {
      this.flowCellChannelSampleConcentrationpM = flowCellChannelSampleConcentrationpM;
    }

    public Integer getIdNumberSequencingCycles() {
      return idNumberSequencingCycles;
    }

    public void setIdNumberSequencingCycles(Integer idNumberSequencingCycles) {
      this.idNumberSequencingCycles = idNumberSequencingCycles;
    }

    public Integer getIdNumberSequencingCyclesAllowed() {
      return idNumberSequencingCyclesAllowed;
    }

    public void setIdNumberSequencingCyclesAllowed(Integer idNumberSequencingCyclesAllowed) {
      this.idNumberSequencingCyclesAllowed = idNumberSequencingCyclesAllowed;
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

    public Integer getIdGenomeBuildAlignTo() {
      return idGenomeBuildAlignTo;
    }

    public void setIdGenomeBuildAlignTo(Integer idGenomeBuildAlignTo) {
      this.idGenomeBuildAlignTo = idGenomeBuildAlignTo;
    }

    public String getAnalysisInstructions() {
      return analysisInstructions;
    }

    public void setAnalysisInstructions(String analysisInstructions) {
      this.analysisInstructions = analysisInstructions;
    }

    public Integer getNumberSequencingCyclesActual() {
      return numberSequencingCyclesActual;
    }

    public void setNumberSequencingCyclesActual(Integer numberSequencingCyclesActual) {
      this.numberSequencingCyclesActual = numberSequencingCyclesActual;
    }

    public Integer getClustersPerTile() {
      return clustersPerTile;
    }

    public void setClustersPerTile(Integer clustersPerTile) {
      this.clustersPerTile = clustersPerTile;
    }

    public String getFileName() {
      return fileName;
    }

    public void setFileName(String fileName) {
      this.fileName = fileName;
    }

    public String getSeqRunFirstCycleCompleted() {
      return seqRunFirstCycleCompleted;
    }

    public void setSeqRunFirstCycleCompleted(String seqRunFirstCycleCompleted) {
      this.seqRunFirstCycleCompleted = seqRunFirstCycleCompleted;
    }

    public String getSeqRunFirstCycleFailed() {
      return seqRunFirstCycleFailed;
    }

    public void setSeqRunFirstCycleFailed(String seqRunFirstCycleFailed) {
      this.seqRunFirstCycleFailed = seqRunFirstCycleFailed;
    }

    public String getSeqRunLastCycleCompleted() {
      return seqRunLastCycleCompleted;
    }

    public void setSeqRunLastCycleCompleted(String seqRunLastCycleCompleted) {
      this.seqRunLastCycleCompleted = seqRunLastCycleCompleted;
    }

    public String getSeqRunLastCycleFailed() {
      return seqRunLastCycleFailed;
    }

    public void setSeqRunLastCycleFailed(String seqRunLastCycleFailed) {
      this.seqRunLastCycleFailed = seqRunLastCycleFailed;
    }

    public String getSeqRunPipelineCompleted() {
      return seqRunPipelineCompleted;
    }

    public void setSeqRunPipelineCompleted(String seqRunPipelineCompleted) {
      this.seqRunPipelineCompleted = seqRunPipelineCompleted;
    }

    public String getSeqRunPipelineFailed() {
      return seqRunPipelineFailed;
    }

    public void setSeqRunPipelineFailed(String seqRunPipelineFailed) {
      this.seqRunPipelineFailed = seqRunPipelineFailed;
    }

    public String getNumber() {
      return number;
    }

    public void setNumber(String number) {
      this.number = number;
    }

    public int compareTo(SequenceLaneInfo anotherSequenceLaneInfo) {
      if (this.getSample() == null && anotherSequenceLaneInfo.getSample() == null) {
        return 0;
      } else if (this.getSample() == null) {
        return 1;
      } else if (anotherSequenceLaneInfo.getSample() == null) {
        return -1;
      } else {
        SampleComparator sc = new SampleComparator();

        return sc.compare(this.getSample(), anotherSequenceLaneInfo.getSample());
      }
    }
  }

  public boolean isNewRequest() {
    return isNewRequest;
  }

  public Integer getOriginalIdLab() {
    return this.originalIdLab;
  }

  public boolean isExternalExperiment() {
    return request.getIsExternal() != null && request.getIsExternal().equalsIgnoreCase("Y");
  }

  public boolean isAmendRequest() {
    return amendState != null && !amendState.equals("");
  }

  public boolean isQCAmendRequest() {
    return amendState.equals(Constants.AMEND_QC_TO_MICROARRAY) || amendState.equals(Constants.AMEND_QC_TO_SEQ);
  }

  public boolean isSaveReuseOfSlides() {
    return saveReuseOfSlides;
  }

  public void setSaveReuseOfSlides(boolean saveReuseOfSlides) {
    this.saveReuseOfSlides = saveReuseOfSlides;
  }

  public static String unEscapeBasic(String text) {
    if (text == null) {
      return text;
    }
    text = text.replaceAll("&amp;", "&");
    text = text.replaceAll("&quot;", "\"");
    text = text.replaceAll("&apos;", "'");
    text = text.replaceAll("&gt;", ">");
    text = text.replaceAll("&lt;", "<");
    text = text.replaceAll("&#181;", "�");
    text = text.replaceAll("&#xD;", "\r");

    return text;
  }

  public static String unEscape(String text) {
    if (text == null) {
      return text;
    }

    text = text.replaceAll("&#xD;", "         ");
    text = unEscapeBasic(text);
    text = text.replaceAll("&#xA;", "         ");
    text = text.replaceAll("&#x10;", "         ");
    text = text.replaceAll("&#13;", "         ");
    text = text.replaceAll("&#x9;", "    ");
    return text;
  }

  public List getSequenceLaneInfos() {
    return sequenceLaneInfos;
  }

  public void setSequenceLaneInfos(List sequenceLaneInfos) {
    this.sequenceLaneInfos = sequenceLaneInfos;
  }

  public String getAmendState() {
    return amendState;
  }

  public void setAmendState(String amendState) {
    this.amendState = amendState;
  }

  public boolean isReassignBillingAccount() {
    return reassignBillingAccount;
  }

  public List<String> getCcNumberList() {
    return ccNumberList;
  }

  public Plate getPlate(String idSampleString) {
    SamplePlateWell spw = this.sampleToPlateMap.get(idSampleString);
    if (spw != null) {
      return this.plateMap.get(spw.plateIdAsString);
    } else {
      return null;
    }
  }

  public PlateWell getWell(String idSampleString) {
    SamplePlateWell spw = this.sampleToPlateMap.get(idSampleString);
    if (spw != null) {
      return this.wellMap.get(spw.wellIdAsString);
    } else {
      return null;
    }
  }

  public String getPlateIdAsString(String idSampleString) {
    SamplePlateWell spw = this.sampleToPlateMap.get(idSampleString);
    if (spw != null) {
      return spw.plateIdAsString;
    } else {
      return null;
    }
  }

  public ArrayList<String> getAssays(String idSampleString) {
    return sampleAssays.get(idSampleString);
  }

  public String getCherryPickSourcePlate(String idSampleString) {
    return this.cherryPickSourcePlates.get(idSampleString);
  }

  public String getCherryPickSourceWell(String idSampleString) {
    return this.cherryPickSourceWells.get(idSampleString);
  }

  public String getCherryPickDestinationWell(String idSampleString) {
    return this.cherryPickDestinationWells.get(idSampleString);
  }

  public Map<String, ArrayList<String>> getSampleAssays() {
    return sampleAssays;
  }

  public Boolean hasPlates() {
    return this.hasPlates;
  }

  public String getPreviousCodeRequestStatus() {
    return previousCodeRequestStatus;
  }

  public BillingTemplate getBillingTemplate() {
    return billingTemplate;
  }

  private class SamplePlateWell implements Serializable {
    public String plateIdAsString = "";
    public String wellIdAsString = "";
  }

  public Boolean getIsOpeningNewBillingTemplate() { return isOpeningNewBillingTemplate; }
}
