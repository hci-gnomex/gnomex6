package hci.gnomex.controller;


import java.io.Serializable;
import java.io.StringReader;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.json.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import hci.gnomex.model.*;
import org.hibernate.HibernateException;
import org.hibernate.query.Query;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;

import hci.framework.control.Command;
import hci.gnomex.utility.HttpServletWrappedRequest;import hci.gnomex.utility.Util;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.DictionaryHelper;
import hci.gnomex.utility.HibernateSession;import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.PriceUtil;
import hci.gnomex.utility.PropertyDictionaryHelper;
import org.apache.log4j.Logger;
public class SaveExperimentPlatform extends GNomExCommand implements Serializable {

  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(SaveExperimentPlatform.class);

  private JsonArray sampleTypesList;
  private JsonArray applicationList;
  private JsonArray sequencingOptionList;
  private JsonArray prepTypesList;
  private JsonArray prepQCProtocolList;
  private JsonArray pipelineProtocolList;
  private JsonArray requestCategoryApplicationList;

  private RequestCategory rcScreen;
  private boolean isNewRequestCategory = false;

  private String newCodeRequestCategory;
  private String customWarningMessage;
  private String noProductsMessage;
  private String productStatus;
  private String requireNameDescription;
  private String saveAndSubmit;

  private Map<String, String> newCodeApplicationMap;

  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    rcScreen = new RequestCategory();

    newCodeRequestCategory = request.getParameter("newCodeRequestCategory");
    HashMap errors = this.loadDetailObject(request, rcScreen);
    this.addInvalidFields(errors);
    if (rcScreen.getCodeRequestCategory() == null || rcScreen.getCodeRequestCategory().equals("")) {
      isNewRequestCategory = true;
    }

    if (request.getParameter("type") == null || request.getParameter("type").equals("")) {
      setResponsePage(this.ERROR_JSP);
      this.addInvalidField("Null Platform Type", "The Experiment Platform type cannot be null");
      this.errorDetails = Util.GNLOG(LOG, "The Experiment Platform type cannot be null",null);


    }

    if (request.getParameter("customWarningMessage") != null && !request.getParameter("customWarningMessage").equals("")) {
      this.customWarningMessage = request.getParameter("customWarningMessage");
    }

    if (request.getParameter("noProductsMessage") != null && !request.getParameter("noProductsMessage").equals("")) {
      this.noProductsMessage = request.getParameter("noProductsMessage");
    }

    if (request.getParameter("productStatus") != null && !request.getParameter("productStatus").equals("")) {
      this.productStatus = request.getParameter("productStatus");
    }

    if (request.getParameter("requireNameDescription") != null && !request.getParameter("requireNameDescription").equals("")) {
      this.requireNameDescription = request.getParameter("requireNameDescription");
    }

    if (request.getParameter("saveAndSubmit") != null && !request.getParameter("saveAndSubmit").equals("")) {
      this.saveAndSubmit = request.getParameter("saveAndSubmit");
    }

    if (request.getParameter("sampleTypesJSONString") != null && !request.getParameter("sampleTypesJSONString").equals("")) {
      String sampleTypesJSONString = request.getParameter("sampleTypesJSONString");
      if(Util.isParameterNonEmpty(sampleTypesJSONString)){
        try(JsonReader jsonReader = Json.createReader(new StringReader(sampleTypesJSONString))){
          this.sampleTypesList = jsonReader.readArray();
        }catch (Exception e){
          this.addInvalidField("sampleTypesJSONString", "Invalid sampleTypesJSONString");
          this.errorDetails = Util.GNLOG(LOG, "Cannot parse sampleTypesJSONString",e);
        }
      }
    }

    if (request.getParameter("prepTypesJSONString") != null && !request.getParameter("prepTypesJSONString").equals("")) {
      String prepTypesJSONString = request.getParameter("prepTypesJSONString");
      if(Util.isParameterNonEmpty(prepTypesJSONString)){
        try(JsonReader jsonReader = Json.createReader(new StringReader(prepTypesJSONString))) {
          this.prepTypesList = jsonReader.readArray();
        } catch (Exception e) {
          this.addInvalidField("prepTypesJSONString", "Invalid prepTypesJSONString");
          this.errorDetails = Util.GNLOG(LOG,"Cannot parse prepTypesJSONString", e);
        }

      }

    }

    if (request.getParameter("prepQCProtocolsJSONString") != null && !request.getParameter("prepQCProtocolsJSONString").equals("")) {
      String prepQCProtocolsJSONString = request.getParameter("prepQCProtocolsJSONString");
      if(Util.isParameterNonEmpty(prepQCProtocolsJSONString)){
        try(JsonReader jsonReader = Json.createReader(new StringReader(prepQCProtocolsJSONString))) {
          this.prepQCProtocolList = jsonReader.readArray();
        } catch (Exception e) {
          LOG.error("Cannot parse prepQCProtocolsJSONString", e);
          this.addInvalidField("prepQCProtocolsJSONString", "Invalid prepQCProtocolsJSONString");
          this.errorDetails = Util.GNLOG(LOG,"Cannot parse requestCategoriesXMLString", e);
        }

      }
    }
    if (request.getParameter("pipelineProtocolsJSONString") != null && !request.getParameter("pipelineProtocolsJSONString").equals("")) {
      String pipelineProtocolsJSONString = request.getParameter("pipelineProtocolsJSONString");
      if(Util.isParameterNonEmpty(pipelineProtocolsJSONString)){
        try(JsonReader jsonReader = Json.createReader(new StringReader(pipelineProtocolsJSONString))) {
          this.pipelineProtocolList = jsonReader.readArray();
        } catch (Exception e) {
          this.addInvalidField("pipelineProtocolsJSONString", "Invalid pipelineProtocolsJSONString");
          this.errorDetails = Util.GNLOG(LOG,"pipelineProtocolsJSONString", e);
        }
      }
    }

    if (request.getParameter("applicationsJSONString") != null && !request.getParameter("applicationsJSONString").equals("")) {
      String applicationsJSONString = request.getParameter("applicationsJSONString");
      if(Util.isParameterNonEmpty(applicationsJSONString)){
        try(JsonReader jsonReader = Json.createReader(new StringReader(applicationsJSONString))) {
          this.applicationList = jsonReader.readArray();
        } catch (Exception e) {
          this.addInvalidField("applicationsJSONString", "Invalid applicationsJSONString");
          this.errorDetails = Util.GNLOG(LOG,"Cannot parse applicationsJSONString", e);
        }
      }
    }

    if (request.getParameter("sequencingOptionsJSONString") != null && !request.getParameter("sequencingOptionsJSONString").equals("")) {
      String sequencingOptionsJSONString = request.getParameter("sequencingOptionsJSONString");
      if(Util.isParameterNonEmpty(sequencingOptionsJSONString)){
        try(JsonReader jsonReader = Json.createReader(new StringReader(sequencingOptionsJSONString))) {
          this.sequencingOptionList = jsonReader.readArray();
        } catch (Exception e) {
          this.addInvalidField("sequencingOptionsJSONString", "Invalid sequencingOptionsJSONString");
          this.errorDetails = Util.GNLOG(LOG,"Cannot parse sequencingOptionsJSONString", e);
        }
      }
      if(sequencingOptionList != null){
        for (int i = 0;  i < this.sequencingOptionList.size(); i++) {
          JsonObject node = this.sequencingOptionList.getJsonObject(i);
          try {
            Integer ti = Integer.valueOf( node.getString("idNumberSequencingCycles"));
            if (ti < 0) {
              this.addInvalidField("sequencingOptions.idNumberSequencingLanes", "Invalid number sequencing lanes");
            }

          }catch(NullPointerException e){
            this.addInvalidField("sequencingOptions.idNumberSequencingLanes", "No sequencing lanes were provided");
          }
          catch (NumberFormatException e) {
            this.addInvalidField("sequencingOptions.idNumberSequencingLanes", "Invalid number sequencing lanes");
          }
          try {
            Integer ti = Integer.valueOf(node.getString("idSeqRunType"));
            if (ti < 0) {
              this.addInvalidField("sequencingOptions.idSeqRunType", "Invalid sequence run type");
            }
          }catch (NullPointerException e){
            this.addInvalidField("sequencingOptions.idSeqRunType", "idSeqRunType was not provided sequence");
          }
          catch (NumberFormatException e) {
            this.addInvalidField("sequencingOptions.idSeqRunType", "Invalid sequence run type");
          }
          String name = node.get("name") != null ? node.getString("name") : "";
          if (name == null || name.length() == 0) {
            this.addInvalidField("sequencingOptions.name", "Sequence option must have a non-blank name");
          }
        }
      }
    }

    if (request.getParameter("requestCategoryApplicationJSONString") != null && !request.getParameter("requestCategoryApplicationJSONString").equals("")) {
      String requestCategoryApplicationJSONString = request.getParameter("requestCategoryApplicationJSONString");
      if(Util.isParameterNonEmpty(requestCategoryApplicationJSONString)){
        try(JsonReader jsonReader = Json.createReader(new StringReader(requestCategoryApplicationJSONString))) {
          this.requestCategoryApplicationList = jsonReader.readArray();
        } catch (Exception e) {
          this.addInvalidField("requestCategoryApplicationJSONString", "Invalid requestCategoryApplicationJSONString");
          this.errorDetails = Util.GNLOG(LOG,"Cannot parse requestCategoryApplicationJSONString", e);
        }

      }
    }

  }

  public Command execute() throws RollBackCommandException {

    try {
      Session sess = HibernateSession.currentSession(this.getUsername());
      DictionaryHelper dh = DictionaryHelper.getInstance(sess);

      if (this.getSecurityAdvisor().hasPermission(SecurityAdvisor.CAN_SUBMIT_REQUESTS)) {

        if (newCodeRequestCategory != null && !newCodeRequestCategory.equals("")) {
          List requestCategories = sess.createQuery("Select rc.codeRequestCategory from RequestCategory as rc").list();
          for (Iterator i1 = requestCategories.iterator(); i1.hasNext();) {
            String crc = (String) i1.next();
            if (crc.equals(newCodeRequestCategory)) {
              this.addInvalidField("Duplicate Code Request Category", "The Code Request Category you selected is already in use.  Please select another.");
              this.setResponsePage(ERROR_JSP);
              return this;
            }
          }
        }

        RequestCategory rc = null;

        if (isNewRequestCategory) {
          rc = rcScreen;
          if (newCodeRequestCategory != null && !newCodeRequestCategory.equals("")) {
            rc.setCodeRequestCategory(newCodeRequestCategory);
          } else {
            rc.setCodeRequestCategory("EXP" + this.getNextAssignedRequestCategoryNumber(sess));
          }
          sess.save(rc);
        } else {
          rc = sess.load(RequestCategory.class, rcScreen.getCodeRequestCategory());
          initializeRequestCategory(rc);
        }

        sess.flush();

        saveSampleTypes(sess, rc);
        saveSequencingOptions(sess, rc);
        saveApplications(sess, rc);
        saveRequestCategoryApplications(sess);
        Boolean unableToDeletePrepQCProtocols = savePrepQCProtocols(sess, rc);
        Boolean unableToDeletePipelineProtocols = savePipelineProtocols(sess, rc);
        Boolean unableToDelete = savePrepTypes(sess);


        // now check and see if we need to create a sample warning property for
        // sample batch size

        Integer idCoreFacility = rc.getIdCoreFacility();
        String codeRequestCategory = rc.getCodeRequestCategory();

        // now check and see if we need to create a sample warning property for
        // sample batch size
        updateProperty(sess, PropertyDictionary.PROPERTY_SAMPLE_BATCH_WARNING, customWarningMessage, "Warning to notify users if they don't use a multiple of the sample batch size specified on the Request Category then they will be charged for unused wells.", "N", idCoreFacility, codeRequestCategory);

        // Now check and see if we need to create a no products message property
        updateProperty(sess, PropertyDictionary.PROPERTY_NO_PRODUCTS_MESSAGE, noProductsMessage, "The message displayed when submitting an experiment order requiring products if the lab does not have any applicable products in their inventory.", "N", idCoreFacility, codeRequestCategory);

        // Now check and see if we need to create a product status property
        updateProperty(sess, PropertyDictionary.STATUS_TO_USE_PRODUCTS, productStatus, "The request status where products are deducted from a lab's inventory.", "N", idCoreFacility, codeRequestCategory);

        // Now check for status of property that requires name and description
        updateProperty(sess, PropertyDictionary.DESCRIPTION_NAME_MANDATORY_FOR_INTERNAL_EXPERIMENTS, requireNameDescription, "Makes the experiment name and description mandatory fields.", "N", idCoreFacility, codeRequestCategory);

        // Now check for status of property that deals with save and submit vs
        // just submit for new requests
        updateProperty(sess, PropertyDictionary.NEW_REQUEST_SAVE_BEFORE_SUBMIT, saveAndSubmit, "Allow users to save a new request and still make changes to the request until they mark the request as submitted.", "N", idCoreFacility, codeRequestCategory);

        sess.flush();

        DictionaryHelper.reload(sess);

        StringBuffer unableToDeleteMsg = new StringBuffer();

        if (unableToDelete) {
          unableToDeleteMsg.append("Certain prep types were marked as inactive instead of deleted because there are requests that are associated with the given prep type");
        }
        if(unableToDeletePrepQCProtocols){
          unableToDeleteMsg.append("Certain Library Prep QC Protocols were unable to be deleted because they are referenced on existing samples.");
        }
        if(unableToDeletePipelineProtocols){
          unableToDeleteMsg.append("Certain Pipeline Protocols were unable to be deleted because they are referenced on existing flow cell channels.");
        }

        if(unableToDeleteMsg.length() > 0){
          this.jsonResult = Json.createObjectBuilder().add("result", "SUCCESS")
                  .add("codeRequestCategory", rc.getCodeRequestCategory())
                  .add("unableToDelete",  unableToDeleteMsg.toString() )
                  .build().toString();

        } else {
          this.jsonResult = Json.createObjectBuilder().add("result", "SUCCESS").add("codeRequestCategory", rc.getCodeRequestCategory())
                  .build().toString();
        }

        setResponsePage(this.SUCCESS_JSP);
      } else {
        this.addInvalidField("Insufficient permissions", "Insufficient permission to save experiment platform.");
        setResponsePage(this.ERROR_JSP);
      }

    } catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in SaveExperimentPlatform ", e);
      throw new RollBackCommandException(e.getMessage());

    }

    return this;
  }

  private void updateProperty(Session sess, String propertyName, String value, String description, String forServerOnly, Integer idCoreFacility, String codeRequestCategory) {
    List props = generatePropertyQuery(sess, propertyName, idCoreFacility, codeRequestCategory).list();
    if (value != null && !value.equals("")) {
      // If we don't have a property we need to create one
      if (props.size() == 0) {
        PropertyDictionary pd = new PropertyDictionary();
        pd.setPropertyName(propertyName);
        pd.setIdCoreFacility(idCoreFacility);
        pd.setCodeRequestCategory(codeRequestCategory);
        pd.setForServerOnly(forServerOnly);
        pd.setPropertyValue(value);
        pd.setPropertyDescription(description);
        sess.save(pd);
      } else if (props.size() == 1) { // Maybe they are just updating the
        // property
        PropertyDictionary pd = (PropertyDictionary) props.get(0);
        pd.setPropertyValue(value);
        sess.save(pd);
      }
    } else { // This will remove the property for the given request category
      if (props.size() > 0) {
        for (Iterator i = props.iterator(); i.hasNext();) {
          PropertyDictionary pd = (PropertyDictionary) i.next();
          sess.delete(pd);
        }
      }
    }
  }

  private Query generatePropertyQuery(Session sess, String property, Integer idCoreFacility, String codeRequestCategory) {
    Query propQuery = sess.createQuery("SELECT p from PropertyDictionary p where p.propertyName = :property and p.idCoreFacility = :idCoreFacility and p.codeRequestCategory = :codeRequestCategory");
    propQuery.setParameter("property", property);
    propQuery.setParameter("idCoreFacility", idCoreFacility);
    propQuery.setParameter("codeRequestCategory", codeRequestCategory);

    return propQuery;
  }

  private void initializeRequestCategory(RequestCategory rc) {
    rc.setIdCoreFacility(rcScreen.getIdCoreFacility());
    rc.setRequestCategory(rcScreen.getRequestCategory());
    rc.setIsActive(rcScreen.getIsActive());
    rc.setType(rcScreen.getType());
    rc.setNotes(rcScreen.getNotes());
    rc.setSortOrder(rcScreen.getSortOrder());
    rc.setIdVendor(rcScreen.getIdVendor());
    rc.setIsInternal(rcScreen.getIsInternal());
    rc.setIsExternal(rcScreen.getIsExternal());
    rc.setIcon(rcScreen.getIcon());
    rc.setIdOrganism(rcScreen.getIdOrganism());
    rc.setNumberOfChannels(rcScreen.getNumberOfChannels());
    rc.setIsClinicalResearch(rcScreen.getIsClinicalResearch());
    rc.setIsOwnerOnly(rcScreen.getIsOwnerOnly());
    rc.setSampleBatchSize(rcScreen.getSampleBatchSize());
    rc.setIdProductType(rcScreen.getIdProductType());
    rc.setAssociatedWithAnalysis(rcScreen.getAssociatedWithAnalysis());
  }

  private Boolean savePrepQCProtocols(Session sess, RequestCategory rc){
    Boolean unableToDelete = false;
    if(prepQCProtocolList == null || prepQCProtocolList.size() == 0){
      return unableToDelete;
    }

    List prepQCProtocols = new ArrayList();
    for (int i = 0; i <  this.prepQCProtocolList.size(); i++) {
      JsonObject node = prepQCProtocolList.getJsonObject(i);
      LibraryPrepQCProtocol lpqp = null;

      String isNew = node.get("isNew") != null ? node.getString("isNew") : "" ;

      // Save new prep type or load the existing one
      if (isNew != null && isNew.equals("Y")) {
        lpqp = new LibraryPrepQCProtocol();
      } else {
        String idLibPrepQCProtocol =  node.get("idLibPrepQCProtocol") != null ? node.getString("idLibPrepQCProtocol") : "";
        lpqp = sess.load(LibraryPrepQCProtocol.class, Integer.parseInt(idLibPrepQCProtocol));
      }

      lpqp.setProtocolDisplay( node.get("protocolDisplay") != null ? node.getString("protocolDisplay") : "");
      lpqp.setCodeRequestCategory(node.get("codeRequestCategory") != null ? node.getString("codeRequestCategory") : "");
      sess.save(lpqp);
      prepQCProtocols.add(lpqp);
    }
    sess.flush();


    List existingPrepTypes = sess.createQuery("SELECT x from LibraryPrepQCProtocol x where x.codeRequestCategory='" + rc.getCodeRequestCategory() + "'" ).list();

    // check if there are any associations, and if not then delete prep qc protocol
    // otherwise leave it be
    for(Iterator i = existingPrepTypes.iterator(); i.hasNext();){
      LibraryPrepQCProtocol lpqp = (LibraryPrepQCProtocol) i.next();
      if(!prepQCProtocols.contains(lpqp)){
        List samples = sess.createQuery("Select s from Sample s where s.idLibPrepQCProtocol = " + lpqp.getIdLibPrepQCProtocol()).list();
        if(samples.size() > 0 ){
          unableToDelete = true;
          continue;
        } else{
          sess.delete(lpqp);
        }
      }
    }

    sess.flush();
    return unableToDelete;
  }

  private Boolean savePipelineProtocols(Session sess, RequestCategory rc){
    Boolean unableToDelete = false;
    if(pipelineProtocolList == null || pipelineProtocolList.size() == 0){
      return unableToDelete;
    }

    List pipelineProtocols = new ArrayList();
    for (int i = 0; i < this.pipelineProtocolList.size(); i++) {
      JsonObject node = pipelineProtocolList.getJsonObject(i) ;
      PipelineProtocol protocol = null;

      String isNew = node.get("isNew") != null ? node.getString("isNew") : "";

      // Save new prep type or load the existing one
      String idPipelineProtocol = node.get("idPipelineProtocol") != null ? node.getString("idPipelineProtocol") : "";
      if (isNew != null && isNew.equals("Y")) {
        protocol = new PipelineProtocol();
      } else {
        protocol = sess.load(PipelineProtocol.class, Integer.parseInt(idPipelineProtocol));
      }

      protocol.setProtocol(node.get("protocol") != null ? node.getString("protocol") : "");
      protocol.setDescription(node.get("description") != null ? node.getString("description") : "");
      protocol.setIdCoreFacility(Integer.parseInt(node.get("idCoreFacility") != null ? node.getString("idCoreFacility") : ""));
      protocol.setIsDefault(node.get("isDefault") != null ? node.getString("isDefault") : "");
      sess.save(protocol);
      pipelineProtocols.add(protocol);
    }
    sess.flush();


    List existingProtocols = sess.createQuery("SELECT x from PipelineProtocol x where x.idCoreFacility='" + rc.getIdCoreFacility() + "'" ).list();

    // check if there are any associations, and if not then delete protocol otherwise leave it be
    for(Iterator i = existingProtocols.iterator(); i.hasNext();){
      PipelineProtocol protocol = (PipelineProtocol) i.next();
      if(!pipelineProtocols.contains(protocol)){
        List flowCellChannels = sess.createQuery("Select f from FlowCellChannel f where f.idPipelineProtocol = " + protocol.getIdPipelineProtocol()).list();
        if(flowCellChannels.size() > 0 ){
          unableToDelete = true;
          continue;
        } else{
          sess.delete(protocol);
        }
      }
    }

    sess.flush();
    return unableToDelete;
  }

  private Boolean savePrepTypes(Session sess) {
    if (prepTypesList == null || prepTypesList.size() == 0) {
      return false;
    }

    Boolean unableToDelete = false;

    List prepTypes = new ArrayList();
    int currentPrepTypeCount = sess.createQuery("Select x from IsolationPrepType x").list().size();

    for (int i = 0;  i < this.prepTypesList.size(); i++) {
      JsonObject node = prepTypesList.getJsonObject(i);
      IsolationPrepType ipt = null;

      String isNew = node.get("isNew") != null ? node.getString("isNew") : "";
      String codeIsolationPrepType = "";

      // Save new prep type or load the existing one
      if (isNew != null && isNew.equals("Y")) {
        ipt = new IsolationPrepType();
        codeIsolationPrepType = IsolationPrepType.CODE_PREP_PREFIX + ++currentPrepTypeCount;
      } else {
        ipt = sess.load(IsolationPrepType.class, node.get("codeIsolationPrepType") != null ? node.getString("codeIsolationPrepType") : "" );
        codeIsolationPrepType = node.get("codeIsolationPrepType") != null ? node.getString("codeIsolationPrepType") : "";
      }


      ipt.setIsActive(node.get("isActive") != null ? node.getString("isActive") : "");
      ipt.setCodeIsolationPrepType(codeIsolationPrepType.toUpperCase());
      ipt.setType( node.get("type") != null ? node.getString("type") : "" );
      ipt.setIsolationPrepType(node.get("isolationPrepType") != null ? node.getString("isolationPrepType") : "");
      ipt.setCodeRequestCategory(node.get("codeRequestCategory") != null ? node.getString("codeRequestCategory") : "");
      prepTypes.add(ipt);
      sess.save(ipt);

      Price price = IsolationPrepType.getIsolationPrepTypePrice(sess, ipt);

      String unitPriceInternal = node.get("unitPriceInternal") != null ? node.getString("unitPriceInternal") : "";
      String unitPriceExternalAcademic = node.get("unitPriceExternalAcademic") != null ? node.getString("unitPriceExternalAcademic") : "";
      String unitPriceExternalCommercial = node.get("unitPriceExternalCommercial") != null ? node.getString("unitPriceExternalCommercial") : "";


      if (price == null) {

        RequestCategory rc = sess.load(RequestCategory.class, node.get("codeRequestCategory") != null ? node.getString("codeRequestCategory") : "");
        price = new Price();
        price.setName(ipt.getIsolationPrepType());
        price.setDescription("");
        price.setIdPriceCategory(getDefaultIsolationPrepTypePriceCategoryId(sess, rc));
        price.setIsActive(ipt.getIsActive());

        price.setUnitPrice(!unitPriceInternal.equals("") ? new BigDecimal(unitPriceInternal) : BigDecimal.ZERO);
        price.setUnitPriceExternalAcademic(!unitPriceExternalAcademic.equals("") ? new BigDecimal(unitPriceExternalAcademic) : BigDecimal.ZERO);
        price.setUnitPriceExternalCommercial(!unitPriceExternalCommercial.equals("") ? new BigDecimal(unitPriceExternalCommercial) : BigDecimal.ZERO);
        sess.save(price);
        sess.flush();

        PriceCriteria crit = new PriceCriteria();
        crit.setIdPrice(price.getIdPrice());
        crit.setFilter1(ipt.getCodeIsolationPrepType());
        sess.save(crit);
      } else {
        price.setUnitPrice(!unitPriceInternal.equals("") ? new BigDecimal(unitPriceInternal) : BigDecimal.ZERO);
        price.setUnitPriceExternalAcademic(!unitPriceExternalAcademic.equals("") ? new BigDecimal(unitPriceExternalAcademic) : BigDecimal.ZERO);
        price.setUnitPriceExternalCommercial( !unitPriceExternalCommercial.equals("") ? new BigDecimal(unitPriceExternalCommercial) : BigDecimal.ZERO);
        price.setIsActive(ipt.getIsActive());
        price.setName(ipt.getIsolationPrepType());
        sess.save(price);
        sess.flush();
      }

    }

    sess.flush();
    List existingPrepTypes = sess.createQuery("SELECT x from IsolationPrepType x").list();

    // Look for prep types that have been deleted and see if we can delete them.
    // If not just mark them as inactive.
    for (Iterator j = existingPrepTypes.iterator(); j.hasNext();) {
      IsolationPrepType ep = (IsolationPrepType) j.next();
      Price existingPrice = IsolationPrepType.getIsolationPrepTypePrice(sess, ep);

      if (!prepTypes.contains(ep)) {
        if (sess.createQuery("Select r from Request r where codeIsolationPrepType = '" + ep.getCodeIsolationPrepType() + "'").list().size() != 0) {
          ep.setIsActive("N");
          existingPrice.setIsActive("N");
          sess.save(ep);
          if (existingPrice != null) {
            sess.save(existingPrice);
          }
          unableToDelete = true;
          continue;
        } else {
          if (getPriceBillingItems(existingPrice, sess) == null || getPriceBillingItems(existingPrice, sess).size() == 0) {
            if(existingPrice != null) {
              sess.delete(existingPrice);
            }
          } else {
            existingPrice.setIsActive("N");
            sess.save(existingPrice);
          }
          sess.delete(ep);
        }
      }
    }

    sess.flush();

    return unableToDelete;

  }

  private List getPriceBillingItems(Price price, Session sess) {
    if (price == null) {
      return null;
    }
    String billingItemQuery = "SELECT bi from BillingItem as bi where bi.idPrice=" + price.getIdPrice();
    List bi = sess.createQuery(billingItemQuery).list();
    return bi;
  }

  private void saveSampleTypes(Session sess, RequestCategory rc) {
    if (sampleTypesList == null || sampleTypesList.size() == 0) {
      return;
    }
    //
    // Save sampleTypes
    //
    HashMap sampleTypeMap = new HashMap();

    for (int i = 0;  i < this.sampleTypesList.size(); i++) {
      JsonObject node = this.sampleTypesList.getJsonObject(i);
      SampleType st = null;

      String id = node.get("idSampleType") != null ? node.getString("idSampleType") : "";

      // Save new sample type or load the existing one
      if (id.startsWith("SampleType")) {
        st = new SampleType();
      } else {
        st = sess.load(SampleType.class, Integer.valueOf(id));
      }

      st.setSampleType(node.get("display") != null ? node.getString("display") : "");
      st.setIsActive(node.get("isActive") != null ? node.getString("isActive") : "");
      st.setCodeNucleotideType( node.get("codeNucleotideType") != null ? node.getString("codeNucleotideType") : "");
      st.setNotes(node.get("notes") != null ? node.getString("notes") : "");
      st.setIdCoreFacility(rc.getIdCoreFacility());

      String sortOrder = node.get("sortOrder") != null ? node.getString("sortOrder") : "";
      if (sortOrder.length() == 0) {
        st.setSortOrder(null);
      } else {
        try {
          st.setSortOrder(Integer.parseInt(sortOrder));
        } catch (NumberFormatException e) {
          st.setSortOrder(null);
        }
      }
      sess.save(st);

      //
      // Save association between sample type and request category
      //
      List existingAssociations = sess.createQuery("SELECT x from SampleTypeRequestCategory x where idSampleType = " + st.getIdSampleType() + " and x.codeRequestCategory = '" + rc.getCodeRequestCategory() + "'").list();

      String isSelected = node.get("isSelected") != null ? node.getString("isSelected") : "";
      if (isSelected.equals("Y")) {
        if (existingAssociations.size() == 0) {
          SampleTypeRequestCategory x = new SampleTypeRequestCategory();
          x.setIdSampleType(st.getIdSampleType());
          x.setCodeRequestCategory(rc.getCodeRequestCategory());
          sess.save(x);
        }
      } else {
        for (Iterator ix = existingAssociations.iterator(); ix.hasNext();) {
          SampleTypeRequestCategory x = (SampleTypeRequestCategory) ix.next();
          sess.delete(x);
        }
      }

      sess.flush();
      sampleTypeMap.put(st.getIdSampleType(), null);
    }

    // Remove sample types
    Query stRemoveQuery = sess.createQuery("SELECT st from SampleType st where idCoreFacility=:idCoreFacility");
    stRemoveQuery.setParameter("idCoreFacility", rc.getIdCoreFacility());
    for (Iterator i = stRemoveQuery.list().iterator(); i.hasNext();) {
      SampleType sampleType = (SampleType) i.next();
      if (!sampleTypeMap.containsKey(sampleType.getIdSampleType())) {
        boolean deleteSampleType = true;
        Integer count = 0;
        List samples = sess.createQuery("select count(*) from Sample s where s.idSampleType = " + sampleType.getIdSampleType()).list();
        if (samples.size() > 0) {
          count += (int) (long) samples.get(0);
        }
        List categories = sess.createQuery("select count(*) from SampleTypeRequestCategory r where r.idSampleType = " + sampleType.getIdSampleType() + " AND r.codeRequestCategory != '" + rc.getCodeRequestCategory() + "'").list();
        if (categories.size() > 0) {
          count += (int) (long) categories.get(0);
        }
        if (count.intValue() > 0) {
          deleteSampleType = false;
        }

        if (deleteSampleType) {
          List catToDelete = sess.createQuery("select r from SampleTypeRequestCategory r where r.idSampleType = " + sampleType.getIdSampleType()).list();
          for (SampleTypeRequestCategory r : (List<SampleTypeRequestCategory>) catToDelete) {
            sess.delete(r);
          }
          sess.delete(sampleType);
        } else {
          if (sampleType.getIsActive() != null && !sampleType.getIsActive().equals("N")) {
            sampleType.setIsActive("N");
          }
        }
      }
    }
    sess.flush();
  }

  private void saveApplications(Session sess, RequestCategory rc) {
    if (applicationList == null || applicationList.size() == 0) {
      return;
    }

    DictionaryHelper dh = DictionaryHelper.getInstance(sess);
    RequestCategoryType rct = dh.getRequestCategoryType(rc.getType());

    newCodeApplicationMap = new HashMap<String, String>();

    Map<String, Price> illuminaLibPrepPriceMap = getIlluminaLibPrepPriceMap(sess, rc);
    Integer idPriceCategoryDefault = getDefaultLibPrepPriceCategoryId(sess, rc);
    Map<String, Price> qcLibPrepPriceMap = getQCLibPrepPriceMap(sess, rc);
    Integer idQCPriceCategoryDefault = getDefaultQCLibPrepPriceCategoryId(sess, rc);
    Map<String, Price> sequenomPriceMap = this.getSequenomPriceMap(sess, rc);
    Integer idSequenomPriceCategoryDefault = getDefaultSequenomPriceCategoryId(sess, rc);
    //
    // Save applications
    //
    HashMap applicationMap = new HashMap();
    for (int i = 0; i < this.applicationList.size(); i++) {
      JsonObject node = this.applicationList.getJsonObject(i);
      Application app = null;

      String codeApplication = node.getString("codeApplication");

      // Save new application or load the existing one
      if (codeApplication.startsWith("Application")) {
        app = new Application();
        app.setCodeApplication("APP" + getNextAssignedAppNumber(sess));
        newCodeApplicationMap.put(codeApplication, app.getCodeApplication());
      } else {
        app = sess.load(Application.class, codeApplication);
      }

      if (app.getCodeApplicationType() == null) {
        app.setCodeApplicationType(ApplicationType.getCodeApplicationType(rct));
      }

      String idLabelingProtocolDefault = node.get("idLabelingProtocolDefault") != null ? node.getString("idLabelingProtocolDefault") : "";
      String idHybProtocolDefault = node.get("idHybProtocolDefault") != null ? node.getString("idHybProtocolDefault") : "";
      String idScanProtocolDefault = node.get("idScanProtocolDefault") != null ? node.getString("idScanProtocolDefault") : "";
      String idFeatureExtractionProtocolDefault = node.get("idFeatureExtractionProtocolDefault") != null ? node.getString("idFeatureExtractionProtocolDefault") : "";
      String idApplicationTheme = node.get("idApplicationTheme") != null ? node.getString("idApplicationTheme") : "";
      String sortOrder = node.get("sortOrder") != null ? node.getString("sortOrder") : "";
      String samplesPerBatch = node.get("samplesPerBatch") != null ? node.getString("samplesPerBatch") : "";

      app.setHasCaptureLibDesign(node.get("hasCaptureLibDesign") != null ? node.getString("hasCaptureLibDesign") : "");
      app.setOnlyForLabPrepped(node.get("onlyForLabPrepped") != null ? node.getString("onlyForLabPrepped") : "");
      if (app.getOnlyForLabPrepped() == null) {
        app.setOnlyForLabPrepped("Y");
      }
      app.setHasChipTypes(node.get("hasChipTypes") != null ? node.getString("hasChipTypes") : "");
      if (app.getHasChipTypes() == null || (!app.getHasChipTypes().equals("Y") && !app.getHasChipTypes().equals("N"))) {
        app.setHasChipTypes("N");
      }
      app.setApplication(node.get("display") != null ? node.getString("display") : "");

      app.setIsActive(node.get("isActive") != null ? node.getString("isActive") : "");

      app.setIdApplicationTheme(idApplicationTheme != null && !idApplicationTheme.equals("") ? Integer.valueOf(idApplicationTheme) : null);
      app.setCoreSteps(node.get("coreSteps") != null ? node.getString("coreSteps") : "" );
      app.setCoreStepsNoLibPrep(node.get("coreStepsNoLibPrep") != null ? node.getString("coreStepsNoLibPrep") : "");
      app.setSortOrder(sortOrder != null && sortOrder.length() > 0 ? Integer.valueOf(sortOrder) : 0);
      app.setSamplesPerBatch(samplesPerBatch != null && !samplesPerBatch.equals("") ? Integer.valueOf(samplesPerBatch) : null);
      app.setIdCoreFacility(rc.getIdCoreFacility());
      sess.save(app);

      applicationMap.put(app.getCodeApplication(), null);

      if (this.requestCategoryApplicationList == null) {
        //
        // Save association between application and request category
        // Note if requestCategoryApplicationsDoc is parsed then it is done in
        // saveRequestCategoryApplications
        //
        List existingAssociations = sess.createQuery("SELECT x from RequestCategoryApplication x where codeApplication = '" + app.getCodeApplication() + "' and x.codeRequestCategory = '" + rc.getCodeRequestCategory() + "'").list();
        String isSelected = node.get("isSelected") != null ? node.getString("isSelected") : "";
        if (isSelected.equals("Y")) {
          // if selected make it active
          app.setIsActive("Y");
          if (existingAssociations.size() == 0) {
            RequestCategoryApplication x = new RequestCategoryApplication();
            x.setCodeApplication(app.getCodeApplication());
            x.setCodeRequestCategory(rc.getCodeRequestCategory());
            x.setIdLabelingProtocolDefault(idLabelingProtocolDefault != null && !idLabelingProtocolDefault.equals("") ? Integer.valueOf(idLabelingProtocolDefault) : null);
            x.setIdHybProtocolDefault(idHybProtocolDefault != null && !idHybProtocolDefault.equals("") ? Integer.valueOf(idHybProtocolDefault) : null);
            x.setIdScanProtocolDefault(idScanProtocolDefault != null && !idScanProtocolDefault.equals("") ? Integer.valueOf(idScanProtocolDefault) : null);
            x.setIdFeatureExtractionProtocolDefault(idFeatureExtractionProtocolDefault != null && !idFeatureExtractionProtocolDefault.equals("") ? Integer.valueOf(idFeatureExtractionProtocolDefault) : null);
            sess.save(x);
          } else {
            for (Iterator ix = existingAssociations.iterator(); ix.hasNext();) {
              RequestCategoryApplication x = (RequestCategoryApplication) ix.next();
              x.setIdLabelingProtocolDefault(idLabelingProtocolDefault != null && !idLabelingProtocolDefault.equals("") ? Integer.valueOf(idLabelingProtocolDefault) : null);
              x.setIdHybProtocolDefault(idHybProtocolDefault != null && !idHybProtocolDefault.equals("") ? Integer.valueOf(idHybProtocolDefault) : null);
              x.setIdScanProtocolDefault(idScanProtocolDefault != null && !idScanProtocolDefault.equals("") ? Integer.valueOf(idScanProtocolDefault) : null);
              x.setIdFeatureExtractionProtocolDefault(idFeatureExtractionProtocolDefault != null && !idFeatureExtractionProtocolDefault.equals("") ? Integer.valueOf(idFeatureExtractionProtocolDefault) : null);
              sess.save(x);
            }
          }
        } else {
          for (Iterator ix = existingAssociations.iterator(); ix.hasNext();) {
            RequestCategoryApplication x = (RequestCategoryApplication) ix.next();
            sess.delete(x);
          }
          sess.flush();
        }
      }

      //
      // Save association between applications and seq lib protocols
      //
      String idSeqLibProtocols = node.get("idSeqLibProtocols") != null ? node.getString("idSeqLibProtocols") : "";
      List existingAssociations = sess.createQuery("SELECT x from SeqLibProtocolApplication x where codeApplication = '" + app.getCodeApplication() + "'").list();
      HashMap<Integer, SeqLibProtocolApplication> existingProtocolMap = new HashMap<Integer, SeqLibProtocolApplication>();
      for (Iterator i1 = existingAssociations.iterator(); i1.hasNext();) {
        SeqLibProtocolApplication x = (SeqLibProtocolApplication) i1.next();
        existingProtocolMap.put(x.getIdSeqLibProtocol(), x);
      }
      HashMap<Integer, SeqLibProtocol> protocolMap = new HashMap<Integer, SeqLibProtocol>();
      if (idSeqLibProtocols != null && !idSeqLibProtocols.equals("")) {
        String[] tokens = idSeqLibProtocols.split(",");
        for (int x = 0; x < tokens.length; x++) {
          String idSeqLibProtocolString = tokens[x];
          protocolMap.put(Integer.valueOf(idSeqLibProtocolString), null);
        }
      }

      addDefaultProtocol(sess, app, protocolMap);

      // Add associations
      for (Iterator i1 = protocolMap.keySet().iterator(); i1.hasNext();) {
        Integer idSeqLibProtocol = (Integer) i1.next();
        // in case the application name has changed be sure to update the seq
        // lib protocol name to match
        SeqLibProtocol slp = sess.load(SeqLibProtocol.class, idSeqLibProtocol);
        slp.setSeqLibProtocol(app.getApplication());
        sess.save(slp);

        if (!existingProtocolMap.containsKey(idSeqLibProtocol)) {
          SeqLibProtocolApplication x = new SeqLibProtocolApplication();
          x.setCodeApplication(app.getCodeApplication());
          x.setIdSeqLibProtocol(idSeqLibProtocol);
          sess.save(x);
        }
      }

      // Remove associations
      for (Iterator i1 = existingProtocolMap.keySet().iterator(); i1.hasNext();) {
        Integer idSeqLibProtocol = (Integer) i1.next();
        if (!protocolMap.containsKey(idSeqLibProtocol)) {
          SeqLibProtocolApplication x = existingProtocolMap.get(idSeqLibProtocol);
          sess.delete(x);
        }
      }

      sess.flush();

      saveOligoBarcodeSchemesAllowed(sess, rc, app, node, protocolMap);
      saveIlluminaLibPrepPrices(sess, rc, app, node, illuminaLibPrepPriceMap, idPriceCategoryDefault);
      saveQCLibPrepPrices(sess, rc, app, null, node, qcLibPrepPriceMap, idQCPriceCategoryDefault);
      saveQCChipTypes(sess, rc, app, node, qcLibPrepPriceMap, idQCPriceCategoryDefault);
      saveSequenomPrices(sess, rc, app, node, sequenomPriceMap, idSequenomPriceCategoryDefault);

      sess.flush();
    }

    // Remove applications
    String appRemoveString = "SELECT a from Application a where idCoreFacility=:id";
    Query appRemoveQuery = sess.createQuery(appRemoveString);
    appRemoveQuery.setParameter("id", rc.getIdCoreFacility());
    for (Iterator i = appRemoveQuery.list().iterator(); i.hasNext();) {
      Application application = (Application) i.next();
      if (application.isApplicableApplication(rct, rc.getIdCoreFacility()) && !applicationMap.containsKey(application.getCodeApplication())) {

        boolean deleteApplication = true;
        List experiments = sess.createQuery("select count(*)from Request r where r.codeApplication = '" + application.getCodeApplication() + "'").list();
        if (experiments.size() > 0) {
          Integer count = (int) (long) experiments.get(0);
          if (count.intValue() > 0) {
            deleteApplication = false;
          }
        }

        // Remove associations
        List existingsAssociations = sess.createQuery("SELECT x from SeqLibProtocolApplication x where codeApplication = '" + application.getCodeApplication() + "'").list();
        for (Iterator i1 = existingsAssociations.iterator(); i1.hasNext();) {
          SeqLibProtocolApplication x = (SeqLibProtocolApplication) i1.next();
          sess.delete(x);
        }
        existingsAssociations = sess.createQuery("SELECT x from RequestCategoryApplication x where codeApplication = '" + application.getCodeApplication() + "'").list();
        for (Iterator i1 = existingsAssociations.iterator(); i1.hasNext();) {
          RequestCategoryApplication x = (RequestCategoryApplication) i1.next();
          sess.delete(x);
        }
        existingsAssociations = sess.createQuery("SELECT x from BioanalyzerChipType x where codeApplication = '" + application.getCodeApplication() + "'").list();
        if (existingsAssociations.size() > 0) {
          for (Iterator i1 = existingsAssociations.iterator(); i1.hasNext();) {
            BioanalyzerChipType x = (BioanalyzerChipType) i1.next();
            // We have to delete the prices (or set inactive) when we delete the
            // chip type because we stored the prices in their map using the
            // code application + codeBioanalyzerChipType. So check for a price
            // and update accordingly before we delete the chip type.
            // If a price has no current billing items we delete otherwise we
            // set it to inactive.
            if(illuminaLibPrepPriceMap != null && qcLibPrepPriceMap != null && sequenomPriceMap != null) {
              Price p1 = illuminaLibPrepPriceMap.get(application.getCodeApplication());
              Price p2 = qcLibPrepPriceMap.get(application.getCodeApplication() + "&" + (x != null ? x.getCodeBioanalyzerChipType() : ""));
              Price p3 = sequenomPriceMap.get(application.getCodeApplication());
              deleteOrInactivatePrice(deleteApplication, sess, p1, p2, p3);
            }
            sess.delete(x);
          }
        } else if (illuminaLibPrepPriceMap != null && qcLibPrepPriceMap != null && sequenomPriceMap != null) {
          Price p1 = illuminaLibPrepPriceMap.get(application.getCodeApplication());
          Price p2 = qcLibPrepPriceMap.get(application.getCodeApplication() + "&");
          Price p3 = sequenomPriceMap.get(application.getCodeApplication());
          deleteOrInactivatePrice(deleteApplication, sess, p1, p2, p3);
        }

        if (deleteApplication) {
          sess.delete(application);
        } else {
          application.setIsActive("N");
          sess.save(application);
        }
      }
    }
    sess.flush();
  }

  private void addDefaultProtocol(Session sess, Application app, HashMap<Integer, SeqLibProtocol> protocolMap) {
    if (protocolMap.keySet().size() == 0) {
      SeqLibProtocol protocol = new SeqLibProtocol();
      protocol.setSeqLibProtocol(app.getApplication());
      protocol.setIsActive("Y");
      sess.save(protocol);
      sess.flush();
      protocolMap.put(protocol.getIdSeqLibProtocol(), null);
    }
  }

  private void saveOligoBarcodeSchemesAllowed(Session sess, RequestCategory rc, Application app, JsonObject node, HashMap<Integer, SeqLibProtocol> protocolMap) {
    // Only save barcode schemes for illumina request categories.
    if (!RequestCategory.isIlluminaRequestCategory(rc.getCodeRequestCategory()) && !RequestCategory.isSequenom(rc.getCodeRequestCategory())) {
      return;
    }

    Integer idA = getIdOligoBarcodeScheme(node, "A");
    Integer idB = getIdOligoBarcodeScheme(node, "B");

    if (protocolMap.keySet().size() == 0) {
      if (idA != null || idB != null) {
        LOG.error("Unable to save oligo barcode scheme mapping for application " + app.getApplication() + " because no SeqLibProtocol is available.");
        return;
      }
    }

    // Note that currently there should only be one protocol for each
    // application
    String queryString = "select obsa from OligoBarcodeSchemeAllowed obsa where idSeqLibProtocol in (:ids)";
    Query query = sess.createQuery(queryString);
    query.setParameterList("ids", protocolMap.keySet());
    List<OligoBarcodeSchemeAllowed> existingSchemes = query.list();
    Boolean aFound = false;
    Boolean bFound = false;
    for (OligoBarcodeSchemeAllowed obsa : existingSchemes) {
      Boolean delete = true;
      if (idA != null && obsa.getIdOligoBarcodeScheme().equals(idA) && (obsa.getIsIndexGroupB() == null || !obsa.getIsIndexGroupB().equals("Y"))) {
        aFound = true;
        delete = false;
      }
      if (idB != null && obsa.getIdOligoBarcodeScheme().equals(idB) && obsa.getIsIndexGroupB() != null && obsa.getIsIndexGroupB().equals("Y")) {
        bFound = true;
        delete = false;
      }
      if (delete) {
        sess.delete(obsa);
      }
    }

    if (!aFound && idA != null) {
      OligoBarcodeSchemeAllowed obsaA = new OligoBarcodeSchemeAllowed();
      obsaA.setIdOligoBarcodeScheme(idA);
      obsaA.setIdSeqLibProtocol((Integer) protocolMap.keySet().toArray()[0]);
      obsaA.setIsIndexGroupB("N");
      sess.save(obsaA);
    }

    if (!bFound && idB != null) {
      OligoBarcodeSchemeAllowed obsaB = new OligoBarcodeSchemeAllowed();
      obsaB.setIdOligoBarcodeScheme(idB);
      obsaB.setIdSeqLibProtocol((Integer) protocolMap.keySet().toArray()[0]);
      obsaB.setIsIndexGroupB("Y");
      sess.save(obsaB);
    }
  }

  private Integer getIdOligoBarcodeScheme(JsonObject node, String aOrB) {
    Integer id = null;
    String key = "idBarcodeScheme" + aOrB;
    String idAsString = node.get(key) != null ? node.getString(key) : "";
    if (idAsString != null && idAsString.length() > 0) {
      try {
        id = Integer.parseInt(idAsString);
      } catch (NumberFormatException e) {
        String application = node.get("application") != null ? node.getString("application") : "";
        LOG.error("Unable to parse oligo barcode scheme " + aOrB + " for app " + application, e);
      }
    }

    return id;
  }

  private void saveQCChipTypes(Session sess, RequestCategory rc, Application app, JsonObject node, Map<String, Price> qcLibPrepPriceMap, Integer idQCPriceCategoryDefault) {
    if (!RequestCategory.isQCRequestCategory(rc.getCodeRequestCategory()) || !app.getHasChipTypes().equals("Y") || !app.getIsActive().equals("Y")) {
      return;
    }
    //
    // Save BioanalyzerChipTypeRows for QC applications (assays)
    //
    String existQueryString = "SELECT x from BioanalyzerChipType x where codeApplication = :codeApp";
    Query existQuery = sess.createQuery(existQueryString);
    existQuery.setParameter("codeApp", app.getCodeApplication());
    List existingChipTypes = existQuery.list();
    Map<String, BioanalyzerChipType> existMap = new HashMap<String, BioanalyzerChipType>();
    for (Iterator existIter = existingChipTypes.iterator(); existIter.hasNext();) {
      BioanalyzerChipType chipType = (BioanalyzerChipType) existIter.next();
      existMap.put(chipType.getCodeBioanalyzerChipType(), chipType);
    }

    Map<String, String> foundChipTypes = new HashMap<String, String>();
    JsonArray chipTypeList = node.get("ChipTypes") != null ? node.getJsonArray("ChipTypes") : null;
    if(chipTypeList != null){
      for (int i = 0; i < chipTypeList.size(); i++ ) {
        JsonObject chipNode = chipTypeList.getJsonObject(i);
        BioanalyzerChipType chip = existMap.get(chipNode.get("codeBioanalyzerChipType") != null ? chipNode.getString("codeBioanalyzerChipType") : "");
        if (chip == null) {
          chip = new BioanalyzerChipType();
          chip.setCodeBioanalyzerChipType(getNextUnassignedCodeBioanalyzerChipType(sess));
        } else {
          foundChipTypes.put(chip.getCodeBioanalyzerChipType(), "");
        }
        setBioanalyzerChipType(chip, app, chipNode);
        sess.save(chip);
        saveQCLibPrepPrices(sess, rc, app, chip, chipNode, qcLibPrepPriceMap, idQCPriceCategoryDefault);
        sess.flush();
      }
    }


    // Remove ones that were removed
    for (Iterator existIter = existingChipTypes.iterator(); existIter.hasNext();) {
      BioanalyzerChipType chipType = (BioanalyzerChipType) existIter.next();
      if (foundChipTypes.get(chipType.getCodeBioanalyzerChipType()) == null && chipType.getIsActive().equals("Y")) {
        removeChipType(chipType, sess);
      }
    }
    sess.flush();
  }

  private void setBioanalyzerChipType(BioanalyzerChipType chip, Application app, JsonObject chipNode) {
    chip.setIsActive("Y");
    chip.setCodeApplication(app.getCodeApplication());
    chip.setBioanalyzerChipType(chipNode.get("bioanalyzerChipType") != null ? chipNode.getString("bioanalyzerChipType") : "");
    chip.setConcentrationRange(chipNode.get("concentrationRange") != null ? chipNode.getString("concentrationRange") : "");
    chip.setMaxSampleBufferStrength(chipNode.get("maxSampleBufferStrength") != null ? chipNode.getString("maxSampleBufferStrength") : "");
    chip.setProtocolDescription(chipNode.get("protocolDescription") != null ? chipNode.getString("protocolDescription") : "");
    String sortOrder = chipNode.get("sortOrder") != null ? chipNode.getString("sortOrder") : "";
    chip.setSortOrder(!sortOrder.trim().equals("") ? new Integer(sortOrder) : null);

    String sampleWellsPerChip = chipNode.get("sampleWellsPerChip") != null ? chipNode.getString("sampleWellsPerChip") : "";
    if(!sampleWellsPerChip.equals("")){
      try {
        Integer wells = Integer.parseInt(sampleWellsPerChip);
        chip.setSampleWellsPerChip(wells);
      } catch (Exception ex) {
        this.addInvalidField("Chip wells", "Wells could not be set");
        this.errorDetails = Util.GNLOG(LOG,"Wells could not be set", ex);
      }
    }

  }

  private void removeChipType(BioanalyzerChipType chipType, Session sess) {
    // Determine if used.
    Boolean used = false;
    Query q = sess.createQuery("Select codeBioanalyzerChipType from Request where codeBioanalyzerChipType=:code");
    q.setParameter("code", chipType.getCodeBioanalyzerChipType());
    if (q.list().size() > 0) {
      used = true;
    }
    if (!used) {
      q = sess.createQuery("Select codeBioanalyzerChipType from Sample where codeBioanalyzerChipType=:code");
      q.setParameter("code", chipType.getCodeBioanalyzerChipType());
      if (q.list().size() > 0) {
        used = true;
      }
    }
    if (!used) {
      q = sess.createQuery("Select codeBioanalyzerChipType from SubmissionInstruction where codeBioanalyzerChipType=:code");
      q.setParameter("code", chipType.getCodeBioanalyzerChipType());
      if (q.list().size() > 0) {
        used = true;
      }
    }
    if (used) {
      chipType.setIsActive("N");
    } else {
      sess.delete(chipType);
    }
  }

  private Map<String, Price> getIlluminaLibPrepPriceMap(Session sess, RequestCategory rc) {
    if (!hasPriceSheet(sess, rc)) {
      return null;
    }

    Map<String, Price> map = new HashMap<String, Price>();
    String queryString = "select p, crit " + " from PriceSheet ps " + " join ps.requestCategories rc " + " join ps.priceCategories pc " + " join pc.priceCategory.prices p " + " join p.priceCriterias crit " + " where ( pc.priceCategory.pluginClassName='hci.gnomex.billing.illuminaLibPrepPlugin'" + " or      pc.priceCategory.pluginClassName='hci.gnomex.billing.ApplicationBatchPlugin' )" + "     and crit.filter1 is not null" + "     and rc.codeRequestCategory = :code";
    Query query = sess.createQuery(queryString);
    query.setParameter("code", rc.getCodeRequestCategory());
    List l = query.list();
    for (Iterator i = l.iterator(); i.hasNext();) {
      Object[] objects = (Object[]) i.next();
      Price price = (Price) objects[0];
      PriceCriteria priceCriteria = (PriceCriteria) objects[1];

      String key = priceCriteria.getFilter1();
      map.put(key, price);
    }

    return map;
  }

  private Map<String, Price> getSequenomPriceMap(Session sess, RequestCategory rc) {
    if (!hasPriceSheet(sess, rc)) {
      return null;
    }

    Map<String, Price> map = new HashMap<String, Price>();
    String queryString = "select p, crit " + " from PriceSheet ps " + " join ps.requestCategories rc " + " join ps.priceCategories pc " + " join pc.priceCategory.prices p " + " join p.priceCriterias crit " + " where pc.priceCategory.pluginClassName='hci.gnomex.billing.ApplicationBatchPlugin'" + "     and crit.filter1 is not null" + "     and rc.codeRequestCategory = :code";
    Query query = sess.createQuery(queryString);
    query.setParameter("code", rc.getCodeRequestCategory());
    List l = query.list();
    for (Iterator i = l.iterator(); i.hasNext();) {
      Object[] objects = (Object[]) i.next();
      Price price = (Price) objects[0];
      PriceCriteria priceCriteria = (PriceCriteria) objects[1];

      String key = priceCriteria.getFilter1();
      map.put(key, price);
    }

    return map;
  }

  private Map<String, Price> getQCLibPrepPriceMap(Session sess, RequestCategory rc) {
    if (!hasPriceSheet(sess, rc)) {
      return null;
    }

    Map<String, Price> map = new HashMap<String, Price>();
    String queryString = "select p, crit " + " from PriceSheet ps " + " join ps.requestCategories rc " + " join ps.priceCategories pc " + " join pc.priceCategory.prices p " + " join p.priceCriterias crit " + " where crit.filter1 is not null" + "     and rc.codeRequestCategory = :code" + "     and p.isActive = 'Y'";
    Query query = sess.createQuery(queryString);
    query.setParameter("code", rc.getCodeRequestCategory());
    List l = query.list();
    for (Iterator i = l.iterator(); i.hasNext();) {
      Object[] objects = (Object[]) i.next();
      Price price = (Price) objects[0];
      PriceCriteria priceCriteria = (PriceCriteria) objects[1];

      String key = priceCriteria.getFilter1() + "&" + (priceCriteria.getFilter2() != null ? priceCriteria.getFilter2() : "");
      map.put(key, price);
    }

    return map;
  }

  private Boolean hasPriceSheet(Session sess, RequestCategory rc) {
    String queryString = "select rc " + " from PriceSheet ps " + " join ps.requestCategories rc " + " where rc.codeRequestCategory = :code AND ps.isActive = 'Y'";
    Query query = sess.createQuery(queryString);
    query.setParameter("code", rc.getCodeRequestCategory());
    List l = query.list();
    return (l.size() > 0);
  }

  private Integer getDefaultLibPrepPriceCategoryId(Session sess, RequestCategory rc) {
    Integer id = null;
    String catName = PropertyDictionaryHelper.getInstance(sess).getCoreFacilityRequestCategoryProperty(rc.getIdCoreFacility(), rc.getCodeRequestCategory(), PropertyDictionary.ILLUMINA_LIBPREP_DEFAULT_PRICE_CATEGORY);
    if (catName == null) {
      id = null;
    } else {
      String queryString = "select pc " + " from PriceSheet ps " + " join ps.requestCategories rc " + " join ps.priceCategories pspc " + " join pspc.priceCategory pc " + " where ( pc.pluginClassName='hci.gnomex.billing.illuminaLibPrepPlugin' " + " or      pc.pluginClassName='hci.gnomex.billing.ApplicationBatchPlugin' )" + "     and rc.codeRequestCategory = :code and pc.name = :name";
      Query query = sess.createQuery(queryString);
      query.setParameter("name", catName);
      query.setParameter("code", rc.getCodeRequestCategory());
      try {
        PriceCategory cat = (PriceCategory) query.uniqueResult();
        if (cat != null) {
          id = cat.getIdPriceCategory();
        } else {
          LOG.error("SaveExperimentPlatform: Invalid default illumina lib prep price category name -- " + catName);
          this.errorDetails = Util.GNLOG(LOG,"SaveExperimentPlatform: Invalid default illumina lib prep price category name -- " + catName, null);
          return null;
        }
      } catch (HibernateException e) {
        LOG.error("SaveExperimentPlatform: Invalid default illumina lib prep price category name -- " + catName, e);
        this.errorDetails = Util.GNLOG(LOG,"SaveExperimentPlatform: Invalid default illumina lib prep price category name -- " + catName, e);
        return null;
      }
    }

    return id;
  }

  private Integer getDefaultSequenomPriceCategoryId(Session sess, RequestCategory rc) {
    Integer id = null;
    String catName = PropertyDictionaryHelper.getInstance(sess).getCoreFacilityRequestCategoryProperty(rc.getIdCoreFacility(), rc.getCodeRequestCategory(), PropertyDictionary.SEQUENOM_DEFAULT_PRICE_CATEGORY);
    if (catName == null) {
      id = null;
    } else {
      String queryString = "select pc " + " from PriceSheet ps " + " join ps.requestCategories rc " + " join ps.priceCategories pspc " + " join pspc.priceCategory pc " + " where pc.pluginClassName='hci.gnomex.billing.ApplicationBatchPlugin' " + "     and rc.codeRequestCategory = :code and pc.name = :name";
      Query query = sess.createQuery(queryString);
      query.setParameter("name", catName);
      query.setParameter("code", rc.getCodeRequestCategory());
      try {
        PriceCategory cat = (PriceCategory) query.uniqueResult();
        if (cat != null) {
          id = cat.getIdPriceCategory();
        } else {
          LOG.error("SaveExperimentPlatform: Invalid default sequenom price category name -- " + catName);
          this.errorDetails = Util.GNLOG(LOG,"SaveExperimentPlatform: Invalid default sequenom price category name -- " + catName, null);
          return null;
        }
      } catch (HibernateException e) {
        LOG.error("SaveExperimentPlatform: Invalid default sequenom price category name -- " + catName, e);
        this.errorDetails = Util.GNLOG(LOG,"SaveExperimentPlatform: Invalid default sequenom price category name -- " + catName, e);
        return null;
      }
    }

    return id;
  }

  private void saveIlluminaLibPrepPrices(Session sess, RequestCategory rc, Application app, JsonObject node, Map<String, Price> map, Integer defaultCategoryId) {
    // Only save lib prep prices for illumina request categories that have price
    // sheet defined.
    if (map == null || !RequestCategory.isIlluminaRequestCategory(rc.getCodeRequestCategory())) {
      return;
    }

    Boolean newPrice = false;
    Price price = map.get(app.getCodeApplication());
    if (price == null) {
      if (defaultCategoryId == null) {
        // no default price category -- can't store new price.
        LOG.error("SaveExperimentPlatform: Unable to store new lib prep price due to no default category for " + rc.getCodeRequestCategory());
        this.errorDetails = Util.GNLOG(LOG,"SaveExperimentPlatform: Unable to store new lib prep price due to no default category for " + rc.getCodeRequestCategory(), null);
        return;
      }
      price = new Price();
      newPrice = true;
    }
    String internal = node.get("unitPriceInternal") != null ? node.getString("unitPriceInternal") : "";
    String academic = node.get("unitPriceExternalAcademic") != null ? node.getString("unitPriceExternalAcademic") : "";
    String commercial = node.get("unitPriceExternalCommercial") != null ? node.getString("unitPriceExternalCommercial") : "";

    // If we don't have any price values then don't create a price
    if ((internal.length() == 0 && academic.length() == 0 && commercial.length() == 0) || (internal.equals("0.00") && academic.equals("0.00") && commercial.equals("0.00"))) {
      return;
    }

    price.setName(app.getApplication());
    price.setDescription("");
    price.setIdPriceCategory(defaultCategoryId);
    price.setIsActive(app.getIsActive());
    setPrice(internal, price.getUnitPrice(), price, PriceUtil.PRICE_INTERNAL);
    setPrice(academic, price.getUnitPriceExternalAcademic(), price, PriceUtil.PRICE_EXTERNAL_ACADEMIC);
    setPrice(commercial, price.getUnitPriceExternalCommercial(), price, PriceUtil.PRICE_EXTERNAL_COMMERCIAL);

    sess.save(price);
    sess.flush();

    if (newPrice) {
      PriceCriteria crit = new PriceCriteria();
      crit.setIdPrice(price.getIdPrice());
      crit.setFilter1(app.getCodeApplication());
      sess.save(crit);
      sess.flush();
      map.put(app.getCodeApplication(), price);
    }
  }

  private void saveSequenomPrices(Session sess, RequestCategory rc, Application app, JsonObject node, Map<String, Price> map, Integer defaultCategoryId) {
    // Only save lib prep prices for sequenom request categories that have price
    // sheet defined.
    if (map == null || !RequestCategory.isSequenom(rc.getCodeRequestCategory())) {
      return;
    }

    Boolean newPrice = false;
    Price price = map.get(app.getCodeApplication());
    if (price == null) {
      if (defaultCategoryId == null) {
        // no default price category -- can't store new price.
        LOG.error("SaveExperimentPlatform: Unable to store new sequenom price due to no default category for " + rc.getCodeRequestCategory());
        this.errorDetails = Util.GNLOG(LOG,"SaveExperimentPlatform: Unable to store new lib prep price due to no default category for " + rc.getCodeRequestCategory(), null);

        return;
      }
      price = new Price();
      newPrice = true;
    }
    price.setName(app.getApplication());
    price.setDescription("");
    price.setIdPriceCategory(defaultCategoryId);
    price.setIsActive(app.getIsActive());

    String unitPriceInternal = node.get("unitPriceInternal") != null ? node.getString("unitPriceInternal") : "";
    String unitPriceExternalAcademic = node.get("unitPriceExternalAcademic") != null ? node.getString("unitPriceExternalAcademic") : "";
    String unitPriceExternalCommercial = node.get("unitPriceExternalCommercial") != null ? node.getString("unitPriceExternalCommercial") : "";

    setPrice(unitPriceInternal, price.getUnitPrice(), price, PriceUtil.PRICE_INTERNAL);
    setPrice(unitPriceExternalAcademic, price.getUnitPriceExternalAcademic(), price, PriceUtil.PRICE_EXTERNAL_ACADEMIC);
    setPrice(unitPriceExternalCommercial, price.getUnitPriceExternalCommercial(), price, PriceUtil.PRICE_EXTERNAL_COMMERCIAL);

    sess.save(price);
    sess.flush();

    if (newPrice) {
      PriceCriteria crit = new PriceCriteria();
      crit.setIdPrice(price.getIdPrice());
      crit.setFilter1(app.getCodeApplication());
      sess.save(crit);
      sess.flush();
      map.put(app.getCodeApplication(), price);
    }
  }

  private Boolean priceModified(JsonObject node) {
    String unitPriceInternal = node.get("unitPriceInternal") != null ? node.getString("unitPriceInternal") : "";
    String unitPriceExternalAcademic = node.get("unitPriceExternalAcademic") != null ? node.getString("unitPriceExternalAcademic") : "";
    String unitPriceExternalCommercial = node.get("unitPriceExternalCommercial") != null ? node.getString("unitPriceExternalCommercial") : "";

    if (unitPriceInternal.length() > 0) {
      return true;
    }
    if (unitPriceExternalAcademic.length() > 0) {
      return true;
    }
    if (unitPriceExternalCommercial.length() > 0) {
      return true;
    }
    return false;
  }

  private Boolean setPrice(String attributeValue, BigDecimal existingPrice, Price price, String whichPrice) {

    Boolean modified = false;

    try {
      modified = PriceUtil.setPrice(attributeValue, existingPrice, price, whichPrice);
    } catch (NumberFormatException e) {
      LOG.error("Unable to parse price: " + attributeValue, e);
      this.errorDetails = Util.GNLOG(LOG,"SaveExperimentPlatform -- Unable to parse price: " + attributeValue, e);
    }

    return modified;
  }

  private Integer getDefaultQCLibPrepPriceCategoryId(Session sess, RequestCategory rc) {
    Integer id = null;
    String queryString = "select pc " + " from PriceSheet ps " + " join ps.requestCategories rc " + " join ps.priceCategories pspc " + " join pspc.priceCategory pc " + " where rc.codeRequestCategory = :code";
    Query query = sess.createQuery(queryString);
    query.setParameter("code", rc.getCodeRequestCategory());
    try {
      // this is just a patch to fix issues
      List<Object> priceCategories = query.list(); // doesn't always return one item, for different codeRequestCategories that aren't applicable for it return multiple.
      PriceCategory cat = null;
      if(priceCategories.size() > 0){
        cat = (PriceCategory) priceCategories.get(0);
      }
      if (cat != null) {
        id = cat.getIdPriceCategory();
      } else {
        LOG.error("SaveExperimentPlatform: Unable to determine price category for request category " + rc.getCodeRequestCategory());
        this.errorDetails = Util.GNLOG(LOG,"SaveExperimentPlatform: Unable to determine price category for request category " + rc.getCodeRequestCategory(), null);
        return null;
      }
    } catch (HibernateException e) {
      LOG.error("SaveExperimentPlatform: Unable to determine price category for request category " + rc.getCodeRequestCategory(), e);
      this.errorDetails = Util.GNLOG(LOG,"SaveExperimentPlatform: Unable to determine price category for request category " + rc.getCodeRequestCategory(), e);
      return null;
    }

    return id;
  }

  private void saveQCLibPrepPrices(Session sess, RequestCategory rc, Application app, BioanalyzerChipType chipType, JsonObject node, Map<String, Price> map, Integer defaultCategoryId) {
    // Only save lib prep prices for qc request categories that have price sheet
    // defined.
    if (!RequestCategory.isQCRequestCategory(rc.getCodeRequestCategory()) || map == null || !priceModified(node)) {
      return;
    }

    Boolean newPrice = false;
    Price price = map.get(app.getCodeApplication() + "&" + (chipType != null ? chipType.getCodeBioanalyzerChipType() : ""));
    if (price == null) {
      if (defaultCategoryId == null) {
        // no default price category -- can't store new price.
        LOG.error("SaveExperimentPlatform: Unable to store new lib prep price due to no default category for " + rc.getCodeRequestCategory());
        return;
      }
      price = new Price();
      newPrice = true;
    }

    if (chipType != null) {
      price.setName(chipType.getBioanalyzerChipType());
    } else {
      price.setName(app.getApplication());
    }
    price.setDescription("");
    price.setIdPriceCategory(defaultCategoryId);
    price.setIsActive(app.getIsActive());
    setPrice(node.get("unitPriceInternal") != null ? node.getString("unitPriceInternal") : "", price.getUnitPrice(), price, PriceUtil.PRICE_INTERNAL);
    setPrice(node.get("unitPriceExternalAcademic") != null ? node.getString("unitPriceExternalAcademic") : "", price.getUnitPriceExternalAcademic(), price, PriceUtil.PRICE_EXTERNAL_ACADEMIC);
    setPrice(node.get("unitPriceExternalCommercial") != null ? node.getString("unitPriceExternalCommercial") : "", price.getUnitPriceExternalCommercial(), price, PriceUtil.PRICE_EXTERNAL_COMMERCIAL);
    sess.save(price);
    sess.flush();

    if (newPrice) {
      PriceCriteria crit = new PriceCriteria();
      crit.setIdPrice(price.getIdPrice());
      crit.setFilter1(app.getCodeApplication());
      if (chipType != null) {
        crit.setFilter2(chipType.getCodeBioanalyzerChipType());
      }
      sess.save(crit);
      sess.flush();
      map.put(app.getCodeApplication() + "&" + (chipType != null ? chipType.getCodeBioanalyzerChipType() : ""), price);
    }
  }

  private void saveRequestCategoryApplications(Session sess) {
    if (requestCategoryApplicationList == null || requestCategoryApplicationList.size() == 0) {
      return;
    }

    Map<String, JsonObject> requestCategoryApplicationMap = new HashMap<String, JsonObject>();
    for (int i = 0;  i < this.requestCategoryApplicationList.size(); i++) {
      JsonObject node = requestCategoryApplicationList.getJsonObject(i);
      String codeApplication = node.get("codeApplication") != null ? node.getString("codeApplication") : "";
      String codeRequestCategory = node.get("codeRequestCategory") != null ? node.getString("codeRequestCategory") : "";
      String key = codeApplication + "\t" + codeRequestCategory;
      node = Util.addToJsonObject(node,"isStored", Json.createValue("N"));
      requestCategoryApplicationMap.put(key, node);
    }

    for (RequestCategoryApplication recApp : (List<RequestCategoryApplication>) sess.createQuery("from RequestCategoryApplication").list()) {
      String key = recApp.getCodeApplication() + "\t" + recApp.getCodeRequestCategory();
      JsonObject node = requestCategoryApplicationMap.get(key);
      if (node != null) {
        String isSelected = node.get("isSelected") != null ? node.getString("isSelected") : "";
        if (!isSelected.equals("Y")) {
          sess.delete(recApp);
        } else {
          node = Util.addToJsonObject(node,"isStored", Json.createValue("Y"));
          requestCategoryApplicationMap.put(key,node);
        }
      }
    }

    for (String key : requestCategoryApplicationMap.keySet()) {
      JsonObject node = requestCategoryApplicationMap.get(key);
      String isSelected = node.get("isSelected") != null ? node.getString("isSelected") : "";

      if (!node.getString("isStored").equals("Y") && isSelected.equals("Y")) {
        RequestCategoryApplication recApp = new RequestCategoryApplication();
        String codeApplication = node.get("codeApplication") != null ? node.getString("codeApplication") : "";
        if (this.newCodeApplicationMap.containsKey(codeApplication)) {
          codeApplication = this.newCodeApplicationMap.get(codeApplication);
        }
        recApp.setCodeApplication(codeApplication);
        recApp.setCodeRequestCategory(node.get("codeRequestCategory") != null ? node.getString("codeRequestCategory") : "");
        sess.save(recApp);
      }
    }

  }

  private Boolean appSelectedInRequestCategory(Session sess, Application app, String isSelected, RequestCategory rc) {
    Boolean hasSelections = false;
    if (isSelected.equals("Y")) {
      hasSelections = true;
    } else {
      Query q = sess.createQuery("Select x from RequestCategoryApplication x where codeApplication = :codeApplication AND codeRequestCategory != :codeRequestCategory");
      q.setParameter("codeApplication", app.getCodeApplication());
      q.setParameter("codeRequestCategory", rc.getCodeRequestCategory());
      List l = q.list();
      if (l.size() > 0) {
        hasSelections = true;
      }
    }

    return hasSelections;
  }

  private void saveSequencingOptions(Session sess, RequestCategory rc) {

    if (sequencingOptionList == null || sequencingOptionList.size() == 0) {
      return;
    }

    DictionaryHelper dh = DictionaryHelper.getInstance(sess);

    Integer idSeqRunTypePaired = null;
    Integer idSeqRunTypeSingle = null;
    for (Iterator i = dh.getSeqRunTypeList().iterator(); i.hasNext();) {
      SeqRunType srt = (SeqRunType) i.next();
      if (srt.getSeqRunType().indexOf("Paired") > -1) {
        idSeqRunTypePaired = srt.getIdSeqRunType();
      }
      if (srt.getSeqRunType().indexOf("Single") > -1) {
        idSeqRunTypeSingle = srt.getIdSeqRunType();
      }
    }

    //
    // Save numberSequencingCycles
    //
    HashMap<Integer, Integer> numberSequencingCyclesAllowedMap = new HashMap<Integer, Integer>();
    Map<String, Price> illuminaSeqOptionPriceMap = getIlluminaSeqOptionPriceMap(sess, rc);
    Integer idPriceCategoryDefault = getDefaultSeqOptionPriceCategoryId(sess, rc);
    for (int i = 0; i <  this.sequencingOptionList.size(); i++) {
      JsonObject node = sequencingOptionList.getJsonObject(i);
      NumberSequencingCyclesAllowed cyclesAllowed = null;

      String idNumberSequencingCyclesAllowed = node.get("idNumberSequencingCyclesAllowed") != null ? node.getString("idNumberSequencingCyclesAllowed") : "";

      // Save new numberSequencingCycles or load the existing one
      if (idNumberSequencingCyclesAllowed.startsWith("NumberSequencingCyclesAllowed")) {
        cyclesAllowed = new NumberSequencingCyclesAllowed();
      } else {
        cyclesAllowed = sess.load(NumberSequencingCyclesAllowed.class, Integer.valueOf(idNumberSequencingCyclesAllowed));
      }

      cyclesAllowed.setCodeRequestCategory(rc.getCodeRequestCategory());
      cyclesAllowed.setIdNumberSequencingCycles(Integer.valueOf(node.get("idNumberSequencingCycles") != null ? node.getString("idNumberSequencingCycles") : "" ));
      cyclesAllowed.setIdSeqRunType(Integer.valueOf(node.get("idSeqRunType") != null ? node.getString("idSeqRunType") : ""));
      String isCustom = node.get("isCustom") != null ? node.getString("isCustom") : "";
      if (isCustom == null || !isCustom.equals("Y")) {
        cyclesAllowed.setIsCustom("N");
      } else {
        cyclesAllowed.setIsCustom("Y");
      }
      cyclesAllowed.setName(node.get("name") != null ? node.getString("name") : "" );
      cyclesAllowed.setIsActive(node.get("isActive") != null ? node.getString("isActive") : "");
      Integer sortOrder = null;
      String sortOrderStr = node.get("sortOrder") != null ? node.getString("sortOrder") : "";
      if (sortOrderStr.length() > 0) {
        try {
          sortOrder = Integer.parseInt(sortOrderStr);
        } catch (NumberFormatException ex) {
          sortOrder = null;
        }
      }
      cyclesAllowed.setSortOrder(sortOrder);
      cyclesAllowed.setProtocolDescription(node.get("protocolDescription") != null ? node.getString("protocolDescription") : "");
      sess.save(cyclesAllowed);

      numberSequencingCyclesAllowedMap.put(cyclesAllowed.getIdNumberSequencingCyclesAllowed(), cyclesAllowed.getIdNumberSequencingCyclesAllowed());

      saveIlluminaSeqOptionPrices(sess, rc, cyclesAllowed, node, illuminaSeqOptionPriceMap, idPriceCategoryDefault);
    }
    sess.flush();

    // Remove numberSequencingCyclesAllowed
    String allCyclesAllowedString = "SELECT a from NumberSequencingCyclesAllowed a where codeRequestCategory=:codeRequestCategory";
    Query allCyclesAllowedQuery = sess.createQuery(allCyclesAllowedString);
    allCyclesAllowedQuery.setParameter("codeRequestCategory", rc.getCodeRequestCategory());
    for (Iterator i = allCyclesAllowedQuery.list().iterator(); i.hasNext();) {
      NumberSequencingCyclesAllowed numberSequencingCyclesAllowed = (NumberSequencingCyclesAllowed) i.next();
      if (!numberSequencingCyclesAllowedMap.containsKey(numberSequencingCyclesAllowed.getIdNumberSequencingCyclesAllowed())) {
        sess.delete(numberSequencingCyclesAllowed);
      }
    }
    sess.flush();
  }

  private Integer getDefaultSeqOptionPriceCategoryId(Session sess, RequestCategory rc) {
    String catName = PropertyDictionaryHelper.getInstance(sess).getCoreFacilityRequestCategoryProperty(rc.getIdCoreFacility(), rc.getCodeRequestCategory(), PropertyDictionary.ILLUMINA_SEQOPTION_DEFAULT_PRICE_CATEGORY);
    Integer id = null;
    if (catName == null) {
      id = null;
    } else {
      String queryString = "select pc " + " from PriceSheet ps " + " join ps.requestCategories rc " + " join ps.priceCategories pspc " + " join pspc.priceCategory pc " + " where pc.pluginClassName='hci.gnomex.billing.IlluminaSeqPlugin'" + "     and rc.codeRequestCategory = :code and pc.name = :name";
      Query query = sess.createQuery(queryString);
      query.setParameter("name", catName);
      query.setParameter("code", rc.getCodeRequestCategory());
      try {
        PriceCategory cat = (PriceCategory) query.uniqueResult();
        if (cat != null) {
          id = cat.getIdPriceCategory();
        } else {
          LOG.error("SaveExperimentPlatform: Invalid default illumina seq option price category name -- " + catName);
          this.errorDetails = Util.GNLOG(LOG, "SaveExperimentPlatform: Invalid default illumina seq option price category name -- " + catName, null);
          id = null;
        }
      } catch (HibernateException e) {
        LOG.error("SaveExperimentPlatform: Invalid default illumina seq option price category name -- " + catName, e);
        id = null;
      }
    }

    return id;
  }

  private Integer getDefaultIsolationPrepTypePriceCategoryId(Session sess, RequestCategory rc) {
    String catName = PropertyDictionaryHelper.getInstance(sess).getCoreFacilityRequestCategoryProperty(rc.getIdCoreFacility(), rc.getCodeRequestCategory(), PropertyDictionary.ISOLATION_DEFAULT_PRICE_CATEGORY);
    Integer id = null;
    if (catName == null) {
      id = null;
    } else {
      String queryString = "select pc " + " from PriceSheet ps " + " join ps.requestCategories rc " + " join ps.priceCategories pspc " + " join pspc.priceCategory pc " + " where pc.pluginClassName='hci.gnomex.billing.NucleicAcidIsolationPlugin'" + "     and rc.codeRequestCategory = :code and pc.name = :name";
      Query query = sess.createQuery(queryString);
      query.setParameter("name", catName);
      query.setParameter("code", rc.getCodeRequestCategory());
      try {
        PriceCategory cat = (PriceCategory) query.uniqueResult();
        if (cat != null) {
          id = cat.getIdPriceCategory();
        } else {
          LOG.error("SaveExperimentPlatform: Invalid default isolation prep type price category name -- " + catName);
          this.errorDetails = Util.GNLOG(LOG, "SaveExperimentPlatform: Invalid default isolation prep type price category name -- " + catName, null);

          id = null;
        }
      } catch (HibernateException e) {
        LOG.error("SaveExperimentPlatform: Invalid default isolation prep type price category name -- " + catName, e);
        this.errorDetails = Util.GNLOG(LOG, "SaveExperimentPlatform: Invalid default isolation prep type price category name -- " + catName, e);
        id = null;
      }
    }

    return id;
  }

  private Map<String, Price> getIlluminaSeqOptionPriceMap(Session sess, RequestCategory rc) {
    if (!hasPriceSheet(sess, rc)) {
      return null;
    }

    Map<String, Price> map = new HashMap<String, Price>();
    String queryString = "select p, crit " + " from PriceSheet ps " + " join ps.requestCategories rc " + " join ps.priceCategories pc " + " join pc.priceCategory.prices p " + " join p.priceCriterias crit " + " where pc.priceCategory.pluginClassName='hci.gnomex.billing.IlluminaSeqPlugin'" + "     and crit.filter1 is not null" + "     and rc.codeRequestCategory = :code";
    Query query = sess.createQuery(queryString);
    query.setParameter("code", rc.getCodeRequestCategory());
    List l = query.list();
    for (Iterator i = l.iterator(); i.hasNext();) {
      Object[] objects = (Object[]) i.next();
      Price price = (Price) objects[0];
      PriceCriteria priceCriteria = (PriceCriteria) objects[1];

      String key = priceCriteria.getFilter1();
      map.put(key, price);
    }

    return map;
  }

  private void saveIlluminaSeqOptionPrices(Session sess, RequestCategory rc, NumberSequencingCyclesAllowed cyclesAllowed, JsonObject node, Map<String, Price> map, Integer defaultCategoryId) {
    // Only save lib prep prices for illumina request categories that have price
    // sheet defined.
    if (!RequestCategory.isIlluminaRequestCategory(rc.getCodeRequestCategory()) || map == null || !priceModified(node)) {
      return;
    }

    Boolean newPrice = false;

    Price price = map.get(cyclesAllowed.getIdNumberSequencingCyclesAllowed().toString());
    if (price == null) {
      if (defaultCategoryId == null) {
        // no default price category -- can't store new price.
        LOG.error("SaveExperimentPlatform: Unable to store new seq option price due to no default category for " + rc.getCodeRequestCategory());
        return;
      }
      price = new Price();
      newPrice = true;
    }
    price.setName(cyclesAllowed.getName());
    price.setDescription("");
    price.setIdPriceCategory(defaultCategoryId);
    price.setIsActive(node.get("isActive") != null ? node.getString("isActive") : "");

    String unitPriceInternal = node.get("unitPriceInternal") != null ? node.getString("unitPriceInternal") : "";
    String unitPriceExternalAcademic = node.get("unitPriceExternalAcademic") != null ? node.getString("unitPriceExternalAcademic") : "";
    String unitPriceExternalCommercial = node.get("unitPriceExternalCommercial") != null ? node.getString("unitPriceExternalCommercial") : "";

    setPrice(unitPriceInternal, price.getUnitPrice(), price, PriceUtil.PRICE_INTERNAL);
    setPrice(unitPriceExternalAcademic, price.getUnitPriceExternalAcademic(), price, PriceUtil.PRICE_EXTERNAL_ACADEMIC);
    setPrice(unitPriceExternalCommercial, price.getUnitPriceExternalCommercial(), price, PriceUtil.PRICE_EXTERNAL_COMMERCIAL);
    sess.save(price);
    sess.flush();

    if (newPrice) {
      PriceCriteria crit = new PriceCriteria();
      crit.setIdPrice(price.getIdPrice());
      crit.setFilter1(cyclesAllowed.getIdNumberSequencingCyclesAllowed().toString());
      sess.save(crit);
    }

  }

  private Integer getNextAssignedAppNumber(Session sess) {
    int lastNumber = 0;
    List apps = sess.createQuery("SELECT a.codeApplication from Application a where a.codeApplication like 'APP%'").list();
    for (Iterator i = apps.iterator(); i.hasNext();) {
      String codeApplication = (String) i.next();
      String theNumber = codeApplication.substring(3);
      try {
        int number = Integer.parseInt(theNumber);
        if (number > lastNumber) {
          lastNumber = number;
        }
      } catch (Exception e) {
        LOG.error("Error in SaveExperimentPlatform", e);
        this.errorDetails = Util.GNLOG(LOG, "Error in SaveExperimentPlatform getnextassignedappnumber ",e);
      }
    }
    return lastNumber + 1;
  }

  private String getNextUnassignedCodeBioanalyzerChipType(Session sess) {
    Integer lastNumber = 0;
    List apps = sess.createQuery("SELECT b.codeBioanalyzerChipType from BioanalyzerChipType b where b.codeBioanalyzerChipType like 'BCT%'").list();
    for (Iterator i = apps.iterator(); i.hasNext();) {
      String codeBioanalyzerChipType = (String) i.next();
      String theNumber = codeBioanalyzerChipType.substring(3);
      try {
        int number = Integer.parseInt(theNumber);
        if (number > lastNumber) {
          lastNumber = number;
        }
      } catch (Exception e) {
        LOG.error("Error in SaveExperimentPlatform", e);
      }
    }
    lastNumber = lastNumber + 10000001;
    return "BCT" + lastNumber.toString().substring(1);
  }

  private Integer getNextAssignedRequestCategoryNumber(Session sess) {
    int lastNumber = 0;
    List requestCategories = sess.createQuery("SELECT rc.codeRequestCategory from RequestCategory rc where rc.codeRequestCategory like 'EXP%'").list();
    for (Iterator i = requestCategories.iterator(); i.hasNext();) {
      String codeRequestCategory = (String) i.next();
      String theNumber = codeRequestCategory.substring(3);
      try {
        int number = Integer.parseInt(theNumber);
        if (number > lastNumber) {
          lastNumber = number;
        }
      } catch (Exception e) {
        LOG.error("Error in SaveExperimentPlatform", e);
        this.errorDetails = Util.GNLOG(LOG, "Error in SaveExperimentPlatform getNextAssignedRequestCategoryNumber ",e);
      }
    }
    return lastNumber + 1;
  }

  private void deleteOrInactivatePrice(Boolean deleteApplication, Session sess, Price p1, Price p2, Price p3) {
    if (deleteApplication) {
      if (p1 != null) {
        if (getPriceBillingItems(p1, sess) == null || getPriceBillingItems(p1, sess).size() == 0) {
          sess.delete(p1);
        } else {
          p1.setIsActive("N");
          sess.save(p1);
        }
      }

      if (p2 != null) {
        if (getPriceBillingItems(p2, sess) == null || getPriceBillingItems(p2, sess).size() == 0) {
          sess.delete(p2);
        } else {
          p2.setIsActive("N");
          sess.save(p2);
        }
      }

      if (p3 != null) {
        if (getPriceBillingItems(p3, sess) == null || getPriceBillingItems(p3, sess).size() == 0) {
          sess.delete(p3);
        } else {
          p3.setIsActive("N");
          sess.save(p3);
        }
      }
    } else {
      if (p1 != null) {
        p1.setIsActive("N");
        sess.save(p1);
      }
      if (p2 != null) {
        p2.setIsActive("N");
        sess.save(p2);
      }
      if (p3 != null) {
        p3.setIsActive("N");
        sess.save(p3);
      }
    }
  }
}
