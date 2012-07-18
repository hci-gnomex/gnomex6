package hci.gnomex.model;



import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.Date;
import java.sql.SQLException;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import javax.naming.NamingException;

import org.hibernate.HibernateException;
import org.jdom.Document;

import hci.gnomex.constants.Constants;
import hci.framework.utilities.XMLReflectException;
import hci.hibernate3utils.HibernateDetailObject;



public class Sample extends HibernateDetailObject {
  
  private Integer     idSample;
  private Integer     idRequest;
  private Request     request;
  private String      number;
  private String      name;
  private String      description;
  private BigDecimal  concentration;
  private String      codeConcentrationUnit;
  private Integer     idOrganism;
  private String      otherOrganism;
  private Integer     idSampleType;
  private String      otherSamplePrepMethod;
  private Integer     idSeqLibProtocol;
  private String      codeBioanalyzerChipType;
  private Integer     idOligoBarcode;
  private Date        qualDate;
  private String      qualFailed;
  private String      qualBypassed;
  private BigDecimal  qual260nmTo280nmRatio;
  private BigDecimal  qual260nmTo230nmRatio;
  private BigDecimal  qualCalcConcentration;
  private BigDecimal  qual28sTo18sRibosomalRatio;
  private String      qualRINNumber;
  private Integer     qualFragmentSizeFrom;
  private Integer     qualFragmentSizeTo;
  private Integer     fragmentSizeFrom;
  private Integer     fragmentSizeTo;
  private String      seqPrepByCore;
  private Date        seqPrepDate;
  private String      seqPrepFailed;
  private String      seqPrepBypassed;
  private BigDecimal  seqPrepLibConcentration;
  private String      seqPrepQualCodeBioanalyzerChipType;
  private Integer     seqPrepGelFragmentSizeFrom;
  private Integer     seqPrepGelFragmentSizeTo;
  private BigDecimal  seqPrepStockLibVol;
  private BigDecimal  seqPrepStockEBVol;
  private Date        seqPrepStockDate;
  private String      seqPrepStockFailed;
  private String      seqPrepStockBypassed;
  private String      prepInstructions;
  private String      ccNumber;
  private Integer     multiplexGroupNumber;
  private String      barcodeSequence;
  private Set         propertyEntries;
  private Set         treatmentEntries;
  private Set         labeledSamples;
  private Set         wells;
  
  private int         sequenceLaneCount; // a non-persistent variable used for XML
  
  private String      idSampleString;  // a non-persistent variable used for estimated billing charges
                                       // before sample has been saved.


  public String getDescription() {
    return description;
  }
  
  public void setDescription(String description) {
    this.description = description;
  }
  
  public Integer getIdRequest() {
    return idRequest;
  }
  
  public void setIdRequest(Integer idRequest) {
    this.idRequest = idRequest;
  }
  
  public Integer getIdSample() {
    return idSample;
  }
  
  public void setIdSample(Integer idSample) {
    this.idSample = idSample;
  }
  
  public String getName() {
    return name;
  }
  
  public void setName(String name) {
    this.name = name;
  }
  
  public String getNumber() {
    return number;
  }
  
  public void setNumber(String number) {
    this.number = number;
  }
  
  public BigDecimal getQual260nmTo230nmRatio() {
    return qual260nmTo230nmRatio;
  }
  
  public void setQual260nmTo230nmRatio(BigDecimal qual260nmTo230nmRatio) {
    this.qual260nmTo230nmRatio = qual260nmTo230nmRatio;
  }
  
  public BigDecimal getQual260nmTo280nmRatio() {
    return qual260nmTo280nmRatio;
  }
  
  public void setQual260nmTo280nmRatio(BigDecimal qual260nmTo280nmRatio) {
    this.qual260nmTo280nmRatio = qual260nmTo280nmRatio;
  }
  
  public BigDecimal getQual28sTo18sRibosomalRatio() {
    return qual28sTo18sRibosomalRatio;
  }
  
  public void setQual28sTo18sRibosomalRatio(BigDecimal qual28sTo18sRibosomalRatio) {
    this.qual28sTo18sRibosomalRatio = qual28sTo18sRibosomalRatio;
  }
  
  public Date getQualDate() {
    return qualDate;
  }
  
  public void setQualDate(Date qualDate) {
    this.qualDate = qualDate;
  }
  
  public String getQualFailed() {
    return qualFailed;
  }
  
  public void setQualFailed(String qualFailed) {
    this.qualFailed = qualFailed;
  }
  
  public String getQualRINNumber() {
    return qualRINNumber;
  }
  
  public void setQualRINNumber(String qualRINNumber) {
    this.qualRINNumber = qualRINNumber;
  }

  
  public Set getPropertyEntries() {
    return propertyEntries;
  }

  
  public void setPropertyEntries(Set propertyEntries) {
    this.propertyEntries = propertyEntries;
  }

  
  public Set getTreatmentEntries() {
    return treatmentEntries;
  }

  
  public void setTreatmentEntries(Set treatmentEntries) {
    this.treatmentEntries = treatmentEntries;
  }

  
  public Integer getIdSampleType() {
    return idSampleType;
  }

  
  public void setIdSampleType(Integer idSampleType) {
    this.idSampleType = idSampleType;
  }

  
  public Set getLabeledSamples() {
    return labeledSamples;
  }

  
  public void setLabeledSamples(Set labeledSamples) {
    this.labeledSamples = labeledSamples;
  }

  
  public BigDecimal getConcentration() {
    return concentration;
  }

  
  public void setConcentration(BigDecimal concentration) {
    this.concentration = concentration;
  }

  
  public BigDecimal getQualCalcConcentration() {
    return qualCalcConcentration;
  }

  
  public void setQualCalcConcentration(BigDecimal qualCalcConcentration) {
    this.qualCalcConcentration = qualCalcConcentration;
  }

  public Integer getRow() {
    return this.idSample;
  }
  
  public void registerMethodsToExcludeFromXML() {
    this.excludeMethodFromXML("getPropertyEntries");
    this.excludeMethodFromXML("getTreatmentEntries");
    this.excludeMethodFromXML("getLabeledSamples");
    this.excludeMethodFromXML("getRequest");
    this.excludeMethodFromXML("getWells");
  }
  
  public Document toXMLDocument(List useBaseClass) throws XMLReflectException {
    return toXMLDocument(useBaseClass, DATE_OUTPUT_SQL);
  }

  public Document toXMLDocument(List list, int dateOutputStyle ) throws XMLReflectException {

    Document doc = super.toXMLDocument(list, dateOutputStyle);
    for (Iterator i = getPropertyEntries().iterator(); i.hasNext();) {
      PropertyEntry entry = (PropertyEntry) i.next();
      doc.getRootElement().setAttribute("ANNOT" + entry.getIdProperty().toString(), entry.getValue());
      if (entry.getOtherLabel() != null && !entry.getOtherLabel().equals("")) {
        doc.getRootElement().setAttribute(PropertyEntry.OTHER_LABEL, entry.getOtherLabel());
      }
    }
    
    for (Iterator i = getTreatmentEntries().iterator(); i.hasNext();) {
      TreatmentEntry entry = (TreatmentEntry) i.next();
      doc.getRootElement().setAttribute("treatment",
          entry.getTreatment());
    }

    return doc;
  }

  
  public String getCodeBioanalyzerChipType() {
    return codeBioanalyzerChipType;
  }

  
  public void setCodeBioanalyzerChipType(String codeBioanalyzerChipType) {
    this.codeBioanalyzerChipType = codeBioanalyzerChipType;
  }
  
  public String getQualCompleted() {
    if (qualDate != null) {
      return "Y";
    } else {
      return "N";
    }
  }
  
  public String getCanChangeSampleInfo() {
    if (this.getQualDate() != null || 
        (this.getQualFailed() != null && this.getQualFailed().equals("Y"))) {
      return "N";
    } else {
      return "Y";
    }
  }
  
  public String getCanChangeSampleName() {
    return getCanChangeSampleInfo();
  }
  
  public String getCanChangeSampleType() {
    return getCanChangeSampleInfo();
    
  }

  public String getCanChangeSampleConcentration() {
    return getCanChangeSampleInfo();    
  }
  
  public String getCanChangeSeqPrepByCore() {
    return getCanChangeSampleInfo();
  }

  public String getCodeConcentrationUnit() {
    return codeConcentrationUnit;
  }

  
  public void setCodeConcentrationUnit(String codeConcentrationUnit) {
    this.codeConcentrationUnit = codeConcentrationUnit;
  }


  
  public Integer getIdOrganism() {
    return idOrganism;
  }

  
  public void setIdOrganism(Integer idOrganism) {
    this.idOrganism = idOrganism;
  }

  
  public String getQualBypassed() {
    return qualBypassed;
  }

  
  public void setQualBypassed(String qualBypassed) {
    this.qualBypassed = qualBypassed;
  }
  
  public String getQualStatus() {
    if (qualDate != null) {
      return Constants.STATUS_COMPLETED;
    } else if (this.getQualFailed() != null && this.getQualFailed().equals("Y")) {
      return Constants.STATUS_TERMINATED;
    } else if (this.getQualBypassed() != null && this.getQualBypassed().equals("Y")) {
      return Constants.STATUS_BYPASSED;
    } else {
      return "";
    }
  }
  
  public String getQualStatusAbbreviated() {
    if (qualDate != null) {
      return "Done";
    } else if (this.getQualFailed() != null && this.getQualFailed().equals("Y")) {
      return "Failed";
    } else if (this.getQualBypassed() != null && this.getQualBypassed().equals("Y")) {
      return "Bypassed";
    } else {
      return "";
    }
  }



  
  public Integer getFragmentSizeFrom() {
    return fragmentSizeFrom;
  }

  
  public void setFragmentSizeFrom(Integer fragmentSizeFrom) {
    this.fragmentSizeFrom = fragmentSizeFrom;
  }

  
  public Integer getFragmentSizeTo() {
    return fragmentSizeTo;
  }

  
  public void setFragmentSizeTo(Integer fragmentSizeTo) {
    this.fragmentSizeTo = fragmentSizeTo;
  }

  
  public String getSeqPrepByCore() {
    return seqPrepByCore;
  }

  
  public void setSeqPrepByCore(String seqPrepByCore) {
    this.seqPrepByCore = seqPrepByCore;
  }

  
  public Date getSeqPrepDate() {
    return seqPrepDate;
  }

  
  public void setSeqPrepDate(Date seqPrepDate) {
    this.seqPrepDate = seqPrepDate;
  }
  
  public String getSeqPrepStatus() {
    if (seqPrepDate != null) {
      return Constants.STATUS_COMPLETED;
    } else if (this.getSeqPrepFailed() != null && this.getSeqPrepFailed().equals("Y")) {
      return Constants.STATUS_TERMINATED;
    } else if (this.getSeqPrepBypassed() != null && this.getSeqPrepBypassed().equals("Y")) {
      return Constants.STATUS_BYPASSED;
    } else {
      return "";
    }
  }

  
  public String getSeqPrepFailed() {
    return seqPrepFailed;
  }

  
  public void setSeqPrepFailed(String seqPrepFailed) {
    this.seqPrepFailed = seqPrepFailed;
  }

  
  public String getSeqPrepBypassed() {
    return seqPrepBypassed;
  }

  
  public void setSeqPrepBypassed(String seqPrepBypassed) {
    this.seqPrepBypassed = seqPrepBypassed;
  }

  
  public Integer getQualFragmentSizeFrom() {
    return qualFragmentSizeFrom;
  }

  
  public void setQualFragmentSizeFrom(Integer qualFragmentSizeFrom) {
    this.qualFragmentSizeFrom = qualFragmentSizeFrom;
  }

  
  public Integer getQualFragmentSizeTo() {
    return qualFragmentSizeTo;
  }

  
  public void setQualFragmentSizeTo(Integer qualFragmentSizeTo) {
    this.qualFragmentSizeTo = qualFragmentSizeTo;
  }

  
  public BigDecimal getSeqPrepLibConcentration() {
    return seqPrepLibConcentration;
  }

  
  public void setSeqPrepLibConcentration(BigDecimal seqPrepLibConcentration) {
    this.seqPrepLibConcentration = seqPrepLibConcentration;
  }

  
  public String getSeqPrepQualCodeBioanalyzerChipType() {
    return seqPrepQualCodeBioanalyzerChipType;
  }

  
  public void setSeqPrepQualCodeBioanalyzerChipType(
      String seqPrepQualCodeBioanalyzerChipType) {
    this.seqPrepQualCodeBioanalyzerChipType = seqPrepQualCodeBioanalyzerChipType;
  }

  
  public BigDecimal getSeqPrepStockLibVol() {
    return seqPrepStockLibVol;
  }

  
  public void setSeqPrepStockLibVol(BigDecimal seqPrepStockLibVol) {
    this.seqPrepStockLibVol = seqPrepStockLibVol;
  }

  
  public BigDecimal getSeqPrepStockEBVol() {
    return seqPrepStockEBVol;
  }

  
  public void setSeqPrepStockEBVol(BigDecimal seqPrepStockEBVol) {
    this.seqPrepStockEBVol = seqPrepStockEBVol;
  }

  
  public Date getSeqPrepStockDate() {
    return seqPrepStockDate;
  }

  
  public void setSeqPrepStockDate(Date seqPrepStockDate) {
    this.seqPrepStockDate = seqPrepStockDate;
  }

  
  public String getSeqPrepStockFailed() {
    return seqPrepStockFailed;
  }

  
  public void setSeqPrepStockFailed(String seqPrepStockFailed) {
    this.seqPrepStockFailed = seqPrepStockFailed;
  }

  
  public String getSeqPrepStockBypassed() {
    return seqPrepStockBypassed;
  }

  
  public void setSeqPrepStockBypassed(String seqPrepStockBypassed) {
    this.seqPrepStockBypassed = seqPrepStockBypassed;
  }

  
  public Integer getSeqPrepGelFragmentSizeFrom() {
    return seqPrepGelFragmentSizeFrom;
  }

  
  public void setSeqPrepGelFragmentSizeFrom(Integer seqPrepGelFragmentSizeFrom) {
    this.seqPrepGelFragmentSizeFrom = seqPrepGelFragmentSizeFrom;
  }

  
  public Integer getSeqPrepGelFragmentSizeTo() {
    return seqPrepGelFragmentSizeTo;
  }

  
  public void setSeqPrepGelFragmentSizeTo(Integer seqPrepGelFragmentSizeTo) {
    this.seqPrepGelFragmentSizeTo = seqPrepGelFragmentSizeTo;
  }

  
  public Integer getIdOligoBarcode() {
    return idOligoBarcode;
  }

  
  public void setIdOligoBarcode(Integer idOligoBarcode) {
    this.idOligoBarcode = idOligoBarcode;
  }

  
  public Integer getIdSeqLibProtocol() {
    return idSeqLibProtocol;
  }

  
  public void setIdSeqLibProtocol(Integer idSeqLibProtocol) {
    this.idSeqLibProtocol = idSeqLibProtocol;
  }

  
  public int getSequenceLaneCount() {
    return sequenceLaneCount;
  }

  
  public void setSequenceLaneCount(int sequenceLaneCount) {
    this.sequenceLaneCount = sequenceLaneCount;
  }

  
  public String getPrepInstructions() {
    return prepInstructions;
  }

  
  public void setPrepInstructions(String prepInstructions) {
    this.prepInstructions = prepInstructions;
  }

  public String getCcNumber() {
	return ccNumber;
  }
	
  public void setCcNumber(String ccNumber) {
	this.ccNumber = ccNumber;
  }

  
  public String getOtherSamplePrepMethod() {
    return otherSamplePrepMethod;
  }

  
  public void setOtherSamplePrepMethod(String otherSamplePrepMethod) {
    this.otherSamplePrepMethod = otherSamplePrepMethod;
  }

  
  public Integer getMultiplexGroupNumber() {
    return multiplexGroupNumber;
  }

  
  public void setMultiplexGroupNumber(Integer multiplexGroupNumber) {
    this.multiplexGroupNumber = multiplexGroupNumber;
  }

  
  public String getBarcodeSequence() {
    return barcodeSequence;
  }

  
  public void setBarcodeSequence(String barcodeSequence) {
    this.barcodeSequence = barcodeSequence;
  }

  public String getOtherOrganism() {
    return otherOrganism;
  }

  public void setOtherOrganism(String otherOrganism) {
    this.otherOrganism = otherOrganism;
  }
  
  public Request getRequest() {
    return request;
  }

  public void setRequest(Request request) {
    this.request = request;
  }
  
  /*
   * Added this getter so that XML has attribute @numberSequencingLanes
   * so that it is highlighted on 'Add services' when QC request
   * is converted to a sequencing request.
   */
  public String getNumberSequencingLanes() {
    return "";
  }

  public Set getWells() {
    return wells;
  }

  public void setWells(Set wells) {
    this.wells = wells;
  }

  public String getIdSampleString() {
    return idSampleString;
  }

  public void setIdSampleString(String idSampleString) {
    this.idSampleString = idSampleString;
  }

  public PlateWell getSourceWell() {
    PlateWell well = null;
    for (Iterator i = getWells().iterator(); i.hasNext();) {
      PlateWell w = (PlateWell)i.next();
      if (w.getIdPlate() == null || w.getPlate().getCodePlateType().equals(PlateType.SOURCE_PLATE_TYPE)) {
        well = w;
        break;
      }
    }
    return well;
  }
}
