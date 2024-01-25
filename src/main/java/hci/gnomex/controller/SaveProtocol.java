package hci.gnomex.controller;

import hci.dictionary.model.DictionaryEntry;
import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.*;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.json.Json;
import javax.servlet.http.HttpSession;
import java.io.Serializable;



public class SaveProtocol extends GNomExCommand implements Serializable {
  
  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(SaveProtocol.class);
  

  private Integer   idProtocol;
  private String    protocolClassName;
  private String    protocolName;
  private String    protocolDescription;
  private String    protocolUrl;
  private String    isActive = "Y";
  private String    codeRequestCategory;
  private Integer   idAnalysisType;
  private Integer   idAppUser;
  private String    adapterSequenceThreePrime;
  private String    adapterSequenceFivePrime;
  
  private boolean newProtocol = false;
  
  public void validate() {
  }
  
  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
    
    if (request.getParameter("idProtocol") != null && !request.getParameter("idProtocol").equals("")) {
      idProtocol = Integer.valueOf(request.getParameter("idProtocol"));
    } 
    if (request.getParameter("protocolClassName") != null && !request.getParameter("protocolClassName").equals("")) {
      protocolClassName = request.getParameter("protocolClassName");
    } 
    if (request.getParameter("protocolName") != null && !request.getParameter("protocolName").equals("")) {
      protocolName = request.getParameter("protocolName");
    } 
    if (request.getParameter("protocolUrl") != null && !request.getParameter("protocolUrl").equals("")) {
      protocolUrl = request.getParameter("protocolUrl");
    } 
    if (request.getParameter("protocolDescription") != null && !request.getParameter("protocolDescription").equals("")) {
      protocolDescription = request.getParameter("protocolDescription");
    } 
    if (request.getParameter("isActive") != null && !request.getParameter("isActive").equals("")) {
      isActive = request.getParameter("isActive");
    } 
    if (request.getParameter("codeRequestCategory") != null && !request.getParameter("codeRequestCategory").equals("")) {
      codeRequestCategory = request.getParameter("codeRequestCategory");
    } 
    if (request.getParameter("idAnalysisType") != null && !request.getParameter("idAnalysisType").equals("")) {
      idAnalysisType = Integer.valueOf(request.getParameter("idAnalysisType"));
    }
    if (request.getParameter("idAppUser") != null && !request.getParameter("idAppUser").equals("")) {
      idAppUser = Integer.valueOf(request.getParameter("idAppUser"));
    }
    if (protocolClassName == null) {
      this.addInvalidField("protocolClassName", "protocolClassName is required");
    }
    if (protocolName == null) {
      this.addInvalidField("protocolName", "protocolName is required");
    }
    if (request.getParameter("adapterSequenceThreePrime") != null && !request.getParameter("adapterSequenceThreePrime").equals("")) {
      adapterSequenceThreePrime = request.getParameter("adapterSequenceThreePrime");
    }
    if (request.getParameter("adapterSequenceFivePrime") != null && !request.getParameter("adapterSequenceFivePrime").equals("")) {
      adapterSequenceFivePrime = request.getParameter("adapterSequenceFivePrime");
    }
    

   
  }

  public Command execute() throws RollBackCommandException {

    // Guests cannot save protocols.
    if (this.getSecAdvisor().isGuest()) {
      this.addInvalidField("Insufficient permissions", "Insufficient permission to edit dictionareis.");
      setResponsePage(this.ERROR_JSP);
      return this;
    }

    try {
      Session sess = HibernateSession.currentSession(this.getUsername());
      
      if (this.getSecurityAdvisor().hasPermission(SecurityAdvisor.CAN_WRITE_DICTIONARIES) || 
          (protocolClassName.equals(AnalysisProtocol.class.getName()))) {
        
        DictionaryEntry protocol = null;
        if (idProtocol == null || idProtocol.intValue() == 0) {
          newProtocol = true;
          if (protocolClassName.equals(HybProtocol.class.getName())) {
            protocol = new HybProtocol();
            ((HybProtocol)protocol).setHybProtocol(protocolName);
            ((HybProtocol)protocol).setIsActive("Y");
            ((HybProtocol)protocol).setCodeRequestCategory(codeRequestCategory);
          } else if (protocolClassName.equals(LabelingProtocol.class.getName())) {
            protocol = new LabelingProtocol();
            ((LabelingProtocol)protocol).setLabelingProtocol(protocolName);
            ((LabelingProtocol)protocol).setIsActive("Y");
            ((LabelingProtocol)protocol).setCodeRequestCategory(codeRequestCategory);
          } else if (protocolClassName.equals(ScanProtocol.class.getName())) {
            protocol = new ScanProtocol();
            ((ScanProtocol)protocol).setScanProtocol(protocolName);
            ((ScanProtocol)protocol).setIsActive("Y");
            ((ScanProtocol)protocol).setCodeRequestCategory(codeRequestCategory);
          } else if (protocolClassName.equals(FeatureExtractionProtocol.class.getName())) {
            protocol = new FeatureExtractionProtocol();
            ((FeatureExtractionProtocol)protocol).setFeatureExtractionProtocol(protocolName);
            ((FeatureExtractionProtocol)protocol).setIsActive("Y");
            ((FeatureExtractionProtocol)protocol).setCodeRequestCategory(codeRequestCategory);
          } else if (protocolClassName.equals(SeqLibProtocol.class.getName())) {
            protocol = new SeqLibProtocol();
            ((SeqLibProtocol)protocol).setSeqLibProtocol(protocolName);
            if (protocolDescription != null) {
              ((SeqLibProtocol)protocol).setDescription(protocolDescription);
            }
            ((SeqLibProtocol)protocol).setIsActive(isActive);
            if (protocolUrl != null) {
              ((SeqLibProtocol)protocol).setUrl(protocolUrl);
            }
            if (adapterSequenceThreePrime != null) {
              ((SeqLibProtocol)protocol).setAdapterSequenceThreePrime(adapterSequenceThreePrime);
            }
            if (adapterSequenceFivePrime != null) {
              ((SeqLibProtocol)protocol).setAdapterSequenceFivePrime(adapterSequenceFivePrime);
            }
          } else if (protocolClassName.equals(AnalysisProtocol.class.getName())) {
            protocol = new AnalysisProtocol();
            ((AnalysisProtocol)protocol).setAnalysisProtocol(protocolName);
            ((AnalysisProtocol)protocol).setIsActive("Y");
            ((AnalysisProtocol)protocol).setIdAnalysisType(idAnalysisType);
            
            // Force personal ownership of analysis protocol if user not admin
            if (!this.getSecurityAdvisor().hasPermission(SecurityAdvisor.CAN_WRITE_DICTIONARIES)) {
              SecurityAdvisor secAd = (SecurityAdvisor)this.getSecurityAdvisor();
              ((AnalysisProtocol)protocol).setIdAppUser(secAd.getIdAppUser());
            } else {              
              ((AnalysisProtocol)protocol).setIdAppUser(idAppUser);
            }
            
          } else {
            addInvalidField("unknown protocol", "Unknown protocol");
          }
          
          
          if (isValid()) {
            sess.save(protocol);            
          }
          
        } else {
          if (protocolClassName.equals(HybProtocol.class.getName())) {
            protocol =  (DictionaryEntry)sess.load(HybProtocol.class, idProtocol);
            ((HybProtocol)protocol).setHybProtocol(protocolName);
            ((HybProtocol)protocol).setDescription(protocolDescription);
            ((HybProtocol)protocol).setUrl(protocolUrl);
            ((HybProtocol)protocol).setIsActive(isActive);
            ((HybProtocol)protocol).setCodeRequestCategory(codeRequestCategory);
          } else if (protocolClassName.equals(LabelingProtocol.class.getName())) {
            protocol =  (DictionaryEntry)sess.load(LabelingProtocol.class, idProtocol);
            ((LabelingProtocol)protocol).setLabelingProtocol(protocolName);
            ((LabelingProtocol)protocol).setDescription(protocolDescription);
            ((LabelingProtocol)protocol).setUrl(protocolUrl);
            ((LabelingProtocol)protocol).setIsActive(isActive);
            ((LabelingProtocol)protocol).setCodeRequestCategory(codeRequestCategory);
          } else if (protocolClassName.equals(ScanProtocol.class.getName())) {
            protocol =  (DictionaryEntry)sess.load(ScanProtocol.class, idProtocol);
            ((ScanProtocol)protocol).setScanProtocol(protocolName);
            ((ScanProtocol)protocol).setDescription(protocolDescription);
            ((ScanProtocol)protocol).setUrl(protocolUrl);
            ((ScanProtocol)protocol).setIsActive(isActive);
            ((ScanProtocol)protocol).setCodeRequestCategory(codeRequestCategory);
          } else if (protocolClassName.equals(FeatureExtractionProtocol.class.getName())) {
            protocol =  (DictionaryEntry)sess.load(FeatureExtractionProtocol.class, idProtocol);
            ((FeatureExtractionProtocol)protocol).setFeatureExtractionProtocol(protocolName);
            ((FeatureExtractionProtocol)protocol).setDescription(protocolDescription);
            ((FeatureExtractionProtocol)protocol).setIsActive(isActive);
            ((FeatureExtractionProtocol)protocol).setUrl(protocolUrl);
            ((FeatureExtractionProtocol)protocol).setCodeRequestCategory(codeRequestCategory);
          }  else if (protocolClassName.equals(SeqLibProtocol.class.getName())) {
            protocol =  (DictionaryEntry)sess.load(SeqLibProtocol.class, idProtocol);
            ((SeqLibProtocol)protocol).setSeqLibProtocol(protocolName);
            ((SeqLibProtocol)protocol).setDescription(protocolDescription);
            ((SeqLibProtocol)protocol).setIsActive(isActive);
            ((SeqLibProtocol)protocol).setUrl(protocolUrl);
            ((SeqLibProtocol)protocol).setAdapterSequenceThreePrime(adapterSequenceThreePrime);
            ((SeqLibProtocol)protocol).setAdapterSequenceFivePrime(adapterSequenceFivePrime);
          } else if (protocolClassName.equals(AnalysisProtocol.class.getName())) {
            protocol =  (DictionaryEntry)sess.load(AnalysisProtocol.class, idProtocol);
            ((AnalysisProtocol)protocol).setAnalysisProtocol(protocolName);
            ((AnalysisProtocol)protocol).setDescription(protocolDescription);
            ((AnalysisProtocol)protocol).setIsActive(isActive);
            ((AnalysisProtocol)protocol).setUrl(protocolUrl);
            ((AnalysisProtocol)protocol).setIdAnalysisType(idAnalysisType);

            
            // Force personal ownership of analysis protocol if user not admin
            if (!this.getSecurityAdvisor().hasPermission(SecurityAdvisor.CAN_WRITE_DICTIONARIES)) {
              SecurityAdvisor secAd = (SecurityAdvisor)this.getSecurityAdvisor();
              ((AnalysisProtocol)protocol).setIdAppUser(secAd.getIdAppUser());
            } else {              
              ((AnalysisProtocol)protocol).setIdAppUser(idAppUser);
            }
            
            
          } else {
            addInvalidField("unknown protocol", "Unknown protocol");
          }
        }
       
        
        if (this.isValid()) {
          sess.flush();

          if (protocol != null) {
            this.jsonResult = Json.createObjectBuilder()
                                  .add("result",                 "SUCCESS")
                                  .add("idProtocolSaved",        "" + protocol.getValue())
                                  .add("protocolName",           "" + protocolName)
                                  .add("savedProtocolClassName", "" + protocolClassName)
                                  .add("newProtocol",            "" + newProtocol)
                                  .build().toString();
          } else {
            this.jsonResult = Json.createObjectBuilder()
                                  .add("result", "ERROR")
                                  .add("protocolName",           "" + protocolName)
                                  .add("savedProtocolClassName", "" + protocolClassName)
                                  .add("newProtocol",            "" + newProtocol)
                                  .build().toString();
          }
        }

        if (this.isValid()) {
          setResponsePage(this.SUCCESS_JSP);          
        } else {
          setResponsePage(this.ERROR_JSP);
        }
      } else {
        this.addInvalidField("Insufficient permissions", "Insufficient permission to edit dictionareis.");
        setResponsePage(this.ERROR_JSP);
      }

    } catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in SaveProtocol ", e);
      throw new RollBackCommandException(e.getMessage());
        
    }
    
    return this;
  }
  
  

}
