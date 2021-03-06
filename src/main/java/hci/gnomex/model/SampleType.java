package hci.gnomex.model;

import hci.dictionary.model.DictionaryEntry;

import java.io.Serializable;



public class SampleType extends DictionaryEntry implements Serializable {
  private Integer  idSampleType;
  private String   sampleType;
  private Integer  sortOrder;
  private String   isActive;
  private String   codeNucleotideType;
  private String   notes;
  private Integer  idCoreFacility;
  
  public String getDisplay() {
    String display = this.getNonNullString(getSampleType());
    return display;
  }

  public String getValue() {
    return getIdSampleType().toString();
  }
  
  public Integer getIdSampleType() {
    return idSampleType;
  }

  
  public void setIdSampleType(Integer idSampleType) {
    this.idSampleType = idSampleType;
  }

  
  public String getSampleType() {
    return sampleType;
  }

  
  public void setSampleType(String sampleType) {
    this.sampleType = sampleType;
  }

  
  public String getIsActive() {
    return isActive;
  }

  
  public void setIsActive(String isActive) {
    this.isActive = isActive;
  }

  
  public Integer getSortOrder() {
    return sortOrder;
  }
  
  public void setSortOrder(Integer sortOrder) {
    this.sortOrder = sortOrder;
  }
  
  public String getCodeNucleotideType() {
    return codeNucleotideType;
  }
  
  public void setCodeNucleotideType(String codeNucleotideType) {
    this.codeNucleotideType = codeNucleotideType;
  }
  
  public String getNotes() {
	  return notes;
  }
  
  public void setNotes(String notes) {
	  this.notes = notes;
  }
  
  public Integer getIdCoreFacility() {
    return idCoreFacility;
  }
  
  public void setIdCoreFacility(Integer idCoreFacility) {
    this.idCoreFacility = idCoreFacility;
  }
}