package hci.gnomex.model;

import hci.dictionary.model.DictionaryEntry;

import java.io.Serializable;
//import java.math.BigDecimal;



public class BioanalyzerChipType extends DictionaryEntry implements Serializable {
  
  public static final String                    RNA_NANO  = "RNANANO";
  public static final String                    RNA_PICO  = "RNAPICO";
  public static final String                    DNA1000   = "DNA1000";
  public static final String                    SMALL_RNA = "SMALLRNA";
  
  private String      codeBioanalyzerChipType;
  private String      bioanalyzerChipType;
  private String      concentrationRange;
  private String      codeConcentrationUnit;
  private String      maxSampleBufferStrength;
  private Integer     sampleWellsPerChip;
  private String      isActive;
  private String      codeApplication;
  private String      protocolDescription;
  private Integer     sortOrder;
  
  public String getDisplay() {
    String display = this.getNonNullString(getBioanalyzerChipType());
    return display;
  }

  public String getValue() {
    return getCodeBioanalyzerChipType();
  }

  
  public String getBioanalyzerChipType() {
    return bioanalyzerChipType;
  }

  
  public void setBioanalyzerChipType(String bioanalyzerChipType) {
    this.bioanalyzerChipType = bioanalyzerChipType;
  }

  
  public String getCodeBioanalyzerChipType() {
    return codeBioanalyzerChipType;
  }

  
  public void setCodeBioanalyzerChipType(String codeBioanalyzerChipType) {
    this.codeBioanalyzerChipType = codeBioanalyzerChipType;
  }

  
  public String getConcentrationRange() {
    return concentrationRange;
  }

  
  public void setConcentrationRange(String concentrationRange) {
    this.concentrationRange = concentrationRange;
  }

  public String getIsActive() {
    return isActive;
  }

  
  public void setIsActive(String isActive) {
    this.isActive = isActive;
  }


  public Integer getSampleWellsPerChip() {
    return sampleWellsPerChip;
  }

  
  public void setSampleWellsPerChip(Integer sampleWellsPerChip) {
    this.sampleWellsPerChip = sampleWellsPerChip;
  }

  
  public String getMaxSampleBufferStrength() {
    return maxSampleBufferStrength;
  }

  
  public void setMaxSampleBufferStrength(String maxSampleBufferStrength) {
    this.maxSampleBufferStrength = maxSampleBufferStrength;
  }
  
  public String isSelected() {
    return "N";
  }

  
  public String getCodeConcentrationUnit() {
    return codeConcentrationUnit;
  }

  
  public void setCodeConcentrationUnit(String codeConcentrationUnit) {
    this.codeConcentrationUnit = codeConcentrationUnit;
  }

  
  public String getCodeApplication() {
    return codeApplication;
  }
  public void setCodeApplication(String codeApplication) {
    this.codeApplication = codeApplication;
  }

  public String getProtocolDescription() {
    return protocolDescription;
  }
  public void setProtocolDescription(String protocolDescription) {
    this.protocolDescription = protocolDescription;
  }

  public Integer getSortOrder() {
    return sortOrder;
  }

  public void setSortOrder(Integer sortOrder) {
    this.sortOrder = sortOrder;
  }
}