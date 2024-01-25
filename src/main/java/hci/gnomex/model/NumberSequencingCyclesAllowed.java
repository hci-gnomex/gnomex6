package hci.gnomex.model;

import hci.dictionary.model.DictionaryEntry;

import java.io.Serializable;



public class NumberSequencingCyclesAllowed extends DictionaryEntry implements Serializable {
  private Integer  idNumberSequencingCyclesAllowed;
  private String   name;
  private Integer  idNumberSequencingCycles;
  private String   codeRequestCategory;
  private Integer  idSeqRunType;
  private NumberSequencingCycles numberSequencingCycles;
  private SeqRunType seqRunType;
  private String   isCustom;
  private Integer  sortOrder;
  private String   isActive;
  private String   protocolDescription;
  
  public String getDisplay() {
    return name != null && !name.isEmpty() ?
        name : 
        getCodeRequestCategory() + " - " + getNumberSequencingCyclesDisplay() + " - " + getSeqRunTypeDisplay();
  }

  public String getValue() {
    return idNumberSequencingCyclesAllowed.toString();
  }

  
  public Integer getIdNumberSequencingCyclesAllowed() {
    return idNumberSequencingCyclesAllowed;
  }

  
  public void setIdNumberSequencingCyclesAllowed(
      Integer idNumberSequencingCyclesAllowed) {
    this.idNumberSequencingCyclesAllowed = idNumberSequencingCyclesAllowed;
  }

  
  public Integer getIdNumberSequencingCycles() {
    return idNumberSequencingCycles;
  }

  
  public void setIdNumberSequencingCycles(Integer idNumberSequencingCycles) {
    this.idNumberSequencingCycles = idNumberSequencingCycles;
  }

  
  public String getCodeRequestCategory() {
    return codeRequestCategory;
  }

  
  public void setCodeRequestCategory(String codeRequestCategory) {
    this.codeRequestCategory = codeRequestCategory;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public Integer getIdSeqRunType() {
    return idSeqRunType;
  }

  public void setIdSeqRunType(Integer idSeqRunType) {
    this.idSeqRunType = idSeqRunType;
  }

  private NumberSequencingCycles getNumberSequencingCycles() {
    return numberSequencingCycles;
  }

  private void setNumberSequencingCycles(
      NumberSequencingCycles numberSequencingCycles) {
    this.numberSequencingCycles = numberSequencingCycles;
  }

  public String getIsCustom() {
    return isCustom;
  }

  public void setIsCustom(String isCustom) {
    this.isCustom = isCustom;
  }
  
  private SeqRunType getSeqRunType() {
    return seqRunType;
  }

  private void setSeqRunType(SeqRunType seqRunType) {
    this.seqRunType = seqRunType;
  }

  public String getNumberSequencingCyclesDisplay() {
    return numberSequencingCycles != null ? numberSequencingCycles.getNumberSequencingCycles().toString() : "";
  }

  public String getSeqRunTypeDisplay() {
    return seqRunType != null ? seqRunType.getSeqRunType() : "";
  }
  public String getSeqRunTypeSortOrder() {
    return seqRunType != null ? seqRunType.getSortOrder().toString() : "";
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

  public String getProtocolDescription() {
    return protocolDescription;
  }
  public void setProtocolDescription(String protocolDescription) {
    this.protocolDescription = protocolDescription;
  }
}