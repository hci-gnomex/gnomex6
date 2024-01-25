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

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.Iterator;
import java.util.List;



public class DeleteProtocol extends GNomExCommand implements Serializable {

  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(DeleteProtocol.class);


  private Integer   idProtocol;
  private String    protocolClassName;


  private Integer   idProtocolDeleted;

  private Boolean   canDelete = true;
  private String    protocolName;

  private final static String SEQ_LIB_PROTOCOL_CLASS_NAME = "hci.gnomex.model.SeqLibProtocol";
  private final static String HYB_PROTOCOL_CLASS_NAME = "hci.gnomex.model.HybProtocol";
  private final static String FEATURE_EXTRACTION_PROTOCOL_CLASS_NAME = "hci.gnomex.model.FeatureExtraction";
  private final static String SCAN_PROTOCOL_CLASS_NAME = "hci.gnomex.model.ScanProtocol";
  private final static String ANALYSIS_PROTOCOL_CLASS_NAME = "hci.gnomex.model.AnalysisProtocol";
  private final static String LABELING_PROTOCOL_CLASS_NAME = "hci.gnomex.model.LabelingProtocol";


  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    if (request.getParameter("idProtocol") != null && !request.getParameter("idProtocol").equals("")) {
      idProtocol = Integer.valueOf(request.getParameter("idProtocol"));
    }
    if (request.getParameter("protocolClassName") != null && !request.getParameter("protocolClassName").equals("")) {
      protocolClassName = request.getParameter("protocolClassName");
    }
    if (protocolClassName == null) {
      this.addInvalidField("protocolClassName", "protocolClassName is required");
    }
    if (idProtocol == null) {
      this.addInvalidField("idProtocol", "idProtocol is required");
    }


  }

  public Command execute() throws RollBackCommandException {

    try {
      Session sess = HibernateSession.currentSession(this.getUsername());

      if (this.getSecurityAdvisor().hasPermission(SecurityAdvisor.CAN_WRITE_DICTIONARIES)) {

        //If it is a seq lib protocol we must remove the associations between SeqLibProtocolApplication and OligoBarcodeSchemeAllowed before
        //actually deleting the protocol.
        if(protocolClassName.equals(SEQ_LIB_PROTOCOL_CLASS_NAME)) {
          List l = sess.createQuery("Select s from Sample s where idSeqLibProtocol = " + idProtocol ).list();
          if(l.size() > 0) {
            canDelete = false;
            SeqLibProtocol slp = (SeqLibProtocol)sess.load(SeqLibProtocol.class, idProtocol);
            slp.setIsActive("N");
            protocolName = slp.getDisplay();
          } else {
            deleteSeqLibAssociations(sess);
          }

        } else if(protocolClassName.equals(HYB_PROTOCOL_CLASS_NAME)) {
          List l = sess.createQuery("Select h from Hybridization h where idHybProtocol = " + idProtocol ).list();

          if(l.size() > 0) {
            canDelete = false;
            HybProtocol h = (HybProtocol)sess.load(HybProtocol.class, idProtocol);
            h.setIsActive("N");
            protocolName = h.getDisplay();
          } else {
            deleteFeatureOrHybOrScanOrLabelingProtocolAssociations(sess, "idHybProtocolDefault");
          }

        } else if(protocolClassName.equals(FEATURE_EXTRACTION_PROTOCOL_CLASS_NAME)) {
          List l = sess.createQuery("Select h from Hybridization h where idFeatureExtractionProtocol = " + idProtocol ).list();

          if(l.size() > 0) {
            canDelete = false;
            FeatureExtractionProtocol fep = (FeatureExtractionProtocol)sess.load(FeatureExtractionProtocol.class, idProtocol);
            fep.setIsActive("N");
            protocolName = fep.getDisplay();
          } else {
            deleteFeatureOrHybOrScanOrLabelingProtocolAssociations(sess, "idFeatureExtractionProtocolDefault");
          }

        } else if(protocolClassName.equals(SCAN_PROTOCOL_CLASS_NAME)) {
          List l = sess.createQuery("Select h from Hybridization h where idScanProtocol = " + idProtocol ).list();

          if(l.size() > 0) {
            canDelete = false;
            ScanProtocol sp = (ScanProtocol)sess.load(ScanProtocol.class, idProtocol);
            sp.setIsActive("N");
            protocolName = sp.getDisplay();
          } else {
            deleteFeatureOrHybOrScanOrLabelingProtocolAssociations(sess, "idScanProtocolDefault");
          }

        } else if(protocolClassName.equals(LABELING_PROTOCOL_CLASS_NAME)) {
          List l = sess.createQuery("Select ls from LabeledSample ls where idLabelingProtocol = " + idProtocol ).list();

          if(l.size() > 0) {
            canDelete = false;
            LabelingProtocol lp = (LabelingProtocol)sess.load(LabelingProtocol.class, idProtocol);
            lp.setIsActive("N");
            protocolName = lp.getDisplay();
          } else {
            deleteFeatureOrHybOrScanOrLabelingProtocolAssociations(sess, "idLabelingProtocolDefault");
          }

        }else if(protocolClassName.equals(ANALYSIS_PROTOCOL_CLASS_NAME)) {
          List l = sess.createQuery("Select a from Analysis a where idAnalysisProtocol = " + idProtocol ).list();

          if(l.size() > 0) {
            canDelete = false;
            AnalysisProtocol a = (AnalysisProtocol)sess.load(AnalysisProtocol.class, idProtocol);
            a.setIsActive("N");
            protocolName = a.getDisplay();
          }
        }

        if(canDelete) {
          DictionaryEntry protocol = null;
          Class theClass = Class.forName(protocolClassName);
          protocol = (DictionaryEntry)sess.load(theClass, idProtocol);

          sess.delete(protocol);
          sess.flush();

          idProtocolDeleted = Integer.valueOf(protocol.getValue());

          this.xmlResult = "<SUCCESS idProtocol=\"" + idProtocolDeleted + "\"/>";
        } else {
          this.xmlResult = "<SUCCESS inactiveProtocol=\"" + protocolName + "\"/>";
        }

        setResponsePage(this.SUCCESS_JSP);
      } else {
        this.addInvalidField("Insufficient permissions", "Insufficient permission to edit dictionareis.");
        setResponsePage(this.ERROR_JSP);
      }


    }catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in DeleteProtocol ", e);

      throw new RollBackCommandException(e.getMessage());

    }

    return this;
  }

  private void deleteSeqLibAssociations(Session sess) {
    List l = sess.createQuery("Select app from SeqLibProtocolApplication app where idSeqLibProtocol = " + idProtocol ).list();

    for(Iterator i = l.iterator(); i.hasNext();){
      SeqLibProtocolApplication app = (SeqLibProtocolApplication) i.next();
      sess.delete(app);
    }

    l = sess.createQuery("Select oligo from OligoBarcodeSchemeAllowed oligo where idSeqLibProtocol = " + idProtocol ).list();

    for(Iterator i = l.iterator(); i.hasNext();){
      OligoBarcodeSchemeAllowed oligo = (OligoBarcodeSchemeAllowed) i.next();
      sess.delete(oligo);
    }

  }

  private void deleteFeatureOrHybOrScanOrLabelingProtocolAssociations(Session sess, String colName) {

    List l = sess.createQuery("Select rca from RequestCategoryApplication rca where " + colName + " = " + idProtocol ).list();

    for(Iterator i = l.iterator(); i.hasNext();){
      RequestCategoryApplication rca = (RequestCategoryApplication) i.next();
      sess.delete(rca);
    }

  }


}
