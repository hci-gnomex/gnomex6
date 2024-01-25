package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.framework.security.UnknownPermissionException;
import hci.gnomex.model.*;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.servlet.http.HttpSession;
import java.io.Serializable;

public class GetProtocol extends GNomExCommand implements Serializable {

  private static Logger LOG = Logger.getLogger(GetProtocol.class);
  private Integer idProtocol;
  private String codeProtocol;
  private String protocolClassName;

  public Command execute() throws RollBackCommandException {

    try {
      Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());

      String id = null;
      String protocolName = null;
      String codeRequestCategory = null;
      String description = null;
      String url = null;
      String isActive = null;
      Integer idAnalysisType = null;
      Integer idAppUser = null;
      String canRead = "N";
      String canUpdate = "N";
      String canDelete = "N";
      String adapterSequenceThreePrime = null;
      String adapterSequenceFivePrime = null;
      String hasAdapters = "N";

      if ((this.idProtocol != null && this.idProtocol.intValue() != 0) || (this.codeProtocol != null && this.codeProtocol.length() > 0)) {
        if (this.protocolClassName.equals(FeatureExtractionProtocol.class.getName())) {
          FeatureExtractionProtocol fep = (FeatureExtractionProtocol) sess.load(FeatureExtractionProtocol.class, this.idProtocol);
          id = fep.getIdFeatureExtractionProtocol().toString();
          protocolName = fep.getFeatureExtractionProtocol();
          codeRequestCategory = fep.getCodeRequestCategory();
          description = fep.getDescription();
          url = fep.getUrl();
          isActive = fep.getIsActive();
          setPermissions(fep);
          canRead   = fep.canRead() ? "Y" : "N";
          canUpdate = fep.canUpdate() ? "Y" : "N";
          canDelete = fep.canDelete() ? "Y" : "N";

        } else if (this.protocolClassName.equals(HybProtocol.class.getName())) {
          HybProtocol hp = (HybProtocol) sess.load(HybProtocol.class, this.idProtocol);
          id = hp.getIdHybProtocol().toString();
          protocolName = hp.getHybProtocol();
          codeRequestCategory = hp.getCodeRequestCategory();
          description = hp.getDescription();
          url = hp.getUrl();
          isActive = hp.getIsActive();
          setPermissions(hp);
          canRead   = hp.canRead() ? "Y" : "N";
          canUpdate = hp.canUpdate() ? "Y" : "N";
          canDelete = hp.canDelete() ? "Y" : "N";

        } else if (this.protocolClassName.equals(LabelingProtocol.class.getName())) {
          LabelingProtocol lp = (LabelingProtocol) sess.load(LabelingProtocol.class,this.idProtocol);
          id = lp.getIdLabelingProtocol().toString();
          protocolName = lp.getLabelingProtocol();
          codeRequestCategory = lp.getCodeRequestCategory();
          description = lp.getDescription();
          url = lp.getUrl();
          isActive = lp.getIsActive();
          setPermissions(lp);
          canRead   = lp.canRead() ? "Y" : "N";
          canUpdate = lp.canUpdate() ? "Y" : "N";
          canDelete = lp.canDelete() ? "Y" : "N";

        } else if (this.protocolClassName.equals(ScanProtocol.class.getName())) {
          ScanProtocol sp = (ScanProtocol) sess.load(ScanProtocol.class,this.idProtocol);
          id = sp.getIdScanProtocol().toString();
          protocolName = sp.getScanProtocol();
          codeRequestCategory = sp.getCodeRequestCategory();
          description = sp.getDescription();
          url = sp.getUrl();
          isActive = sp.getIsActive();
          setPermissions(sp);
          canRead   = sp.canRead() ? "Y" : "N";
          canUpdate = sp.canUpdate() ? "Y" : "N";
          canDelete = sp.canDelete() ? "Y" : "N";
        } else if (this.protocolClassName.equals(SeqLibProtocol.class.getName())) {
          SeqLibProtocol sp = (SeqLibProtocol) sess.load(SeqLibProtocol.class,this.idProtocol);
          id = sp.getIdSeqLibProtocol().toString();
          protocolName = sp.getSeqLibProtocol();
          description = sp.getDescription();
          url = sp.getUrl();
          isActive = sp.getIsActive();
          setPermissions(sp);
          adapterSequenceThreePrime = sp.getAdapterSequenceThreePrime() != null ? sp.getAdapterSequenceThreePrime() : "";
          adapterSequenceFivePrime = sp.getAdapterSequenceFivePrime() != null ? sp.getAdapterSequenceFivePrime() : "";
          hasAdapters = "Y";
          canRead   = sp.canRead() ? "Y" : "N";
          canUpdate = sp.canUpdate() ? "Y" : "N";
          canDelete = sp.canDelete() ? "Y" : "N";
        } else if (this.protocolClassName.equals(PipelineProtocol.class.getName())) {
          PipelineProtocol pp = (PipelineProtocol) sess.load(PipelineProtocol.class,this.idProtocol);
          id = pp.getIdPipelineProtocol().toString();
          protocolName = pp.getProtocol();
          description = pp.getDescription();
          url = null;
          isActive = "Y";
          setPermissions(pp);
          canRead   = pp.canRead() ? "Y" : "N";
          canUpdate = pp.canUpdate() ? "Y" : "N";
          canDelete = pp.canDelete() ? "Y" : "N";
        } else if (this.protocolClassName.equals(AnalysisProtocol.class.getName())) {
          AnalysisProtocol ap = (AnalysisProtocol) sess.load(AnalysisProtocol.class,this.idProtocol);
          id = ap.getIdAnalysisProtocol().toString();
          protocolName = ap.getAnalysisProtocol();
          description = ap.getDescription();
          url = ap.getUrl();
          isActive = ap.getIsActive();
          idAnalysisType = ap.getIdAnalysisType();
          idAppUser = ap.getIdAppUser();
          setPermissions(ap);
          canRead   = ap.canRead() ? "Y" : "N";
          canUpdate = ap.canUpdate() ? "Y" : "N";
          canDelete = ap.canDelete() ? "Y" : "N";
        } else if (this.protocolClassName.equals(NumberSequencingCyclesAllowed.class.getName())) {
          NumberSequencingCyclesAllowed seq = (NumberSequencingCyclesAllowed) sess.load(NumberSequencingCyclesAllowed.class,this.idProtocol);
          id = seq.getIdNumberSequencingCyclesAllowed().toString();
          protocolName = seq.getName();
          description = seq.getProtocolDescription();
          url = "";
          codeRequestCategory = seq.getCodeRequestCategory();
          isActive = seq.getIsActive();
          setPermissions(seq);
          canRead   = seq.canRead() ? "Y" : "N";
          canUpdate = seq.canUpdate() ? "Y" : "N";
          canDelete = seq.canDelete() ? "Y" : "N";
        } else if (this.protocolClassName.equals(BioanalyzerChipType.class.getName())) {
          BioanalyzerChipType qc = (BioanalyzerChipType) sess.load(BioanalyzerChipType.class,this.codeProtocol);
          id = qc.getCodeBioanalyzerChipType();
          protocolName = qc.getBioanalyzerChipType();
          description = qc.getProtocolDescription();
          url = "";
          isActive = qc.getIsActive();
          canRead   = "N";
          canUpdate = "N";
          canDelete = "N";
        }

        Element root = new Element("Protocol");
        Document doc = new Document(root);
        root.addContent(new Element("id").addContent(id));
        root.addContent(new Element("name").addContent(protocolName));
        root.addContent(new Element("description").addContent(description));
        root.addContent(new Element("url").addContent(url));
        root.addContent(new Element("idAppUser").addContent(idAppUser != null ? idAppUser.toString() : ""));
        if (hasAdapters.equals("Y")) {
          root.addContent(new Element("adapterSequenceThreePrime").addContent(adapterSequenceThreePrime));
          root.addContent(new Element("adapterSequenceFivePrime").addContent(adapterSequenceFivePrime));
        }
        root.addContent(new Element("hasAdapters").addContent(hasAdapters));
        root.addContent(new Element("canRead").addContent(canRead));
        root.addContent(new Element("canUpdate").addContent(canUpdate));
        root.addContent(new Element("canDelete").addContent(canDelete));

        if (this.protocolClassName.equals(AnalysisProtocol.class.getName())) {
          root.addContent(new Element("idAnalysisType").addContent(idAnalysisType != null ? idAnalysisType.toString() : ""));
        } else {
          root.addContent(new Element("codeRequestCategory").addContent(codeRequestCategory));
        }

        root.addContent(new Element("isActive").addContent(isActive));
        root.addContent(new Element("protocolClassName").addContent(this.protocolClassName));

        XMLOutputter out = new XMLOutputter();
        this.xmlResult = out.outputString(doc);

      } else {
        this.addInvalidField("Unknown Protocol", "Unknown Protocol");
      }

      this.validate();
    } catch (HibernateException e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception occured in GetProtocol " , e);
      throw new RollBackCommandException();
    } catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception occured in GetProtocol "  , e);
      throw new RollBackCommandException();
    }
    return this;
  }

  public void setPermissions(DetailObject o) {
    try {
      o.canRead(this.getSecAdvisor().canRead(o));
    } catch (UnknownPermissionException e) {
      LOG.error(e.getClass().toString() + ": " , e);
      o.canRead(false);
    }

    try {
      o.canUpdate(this.getSecAdvisor().canUpdate(o));
    } catch (UnknownPermissionException e) {
      LOG.error(e.getClass().toString() + ": " , e);
      o.canUpdate(false);
    }

    try {
      o.canDelete(this.getSecAdvisor().canDelete(o));
    } catch (UnknownPermissionException e) {
      LOG.error(e.getClass().toString() + ": " , e);
      o.canDelete(false);
    }


  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    if (request.getParameter("id") != null && !request.getParameter("id").equals("")) {
      try {
        this.idProtocol = Integer.valueOf(request.getParameter("id"));
      } catch (NumberFormatException ex) {
        this.codeProtocol = request.getParameter("id");
      }
    } else {
      this.addInvalidField("Protocol Id", "Protocol ID is required.");
    }

    if (request.getParameter("protocolClassName") != null && !request.getParameter("protocolClassName").equals("")) {
      this.protocolClassName = request.getParameter("protocolClassName");
    } else {
      this.addInvalidField("Protocol Class Name", "Protocol Class Name is required");
    }

    this.validate();

  }

  public void validate() {
    if (isValid()) {
      setResponsePage(this.SUCCESS_JSP);
    } else {
      setResponsePage(this.ERROR_JSP);
    }
  }

}
