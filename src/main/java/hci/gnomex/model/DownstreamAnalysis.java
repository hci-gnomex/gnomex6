package hci.gnomex.model;

import hci.dictionary.model.DictionaryEntry;

import java.io.Serializable;



public class DownstreamAnalysis extends DictionaryEntry implements Serializable {


  private Integer idDownstreamAnalysis;
  private String  downstreamAnalysis;
  private String  isActive;

  public String getDisplay() {
    String display = this.getNonNullString(getDownstreamAnalysis());
    return display;
  }

  public String getValue() {
    return getIdDownstreamAnalysis().toString();
  }

  public String getIsActive() {
    return isActive;
  }


  public void setIsActive(String isActive) {
    this.isActive = isActive;
  }


  public String getDownstreamAnalysis() {
    return downstreamAnalysis;
  }


  public void setDownstreamAnalysis(String downstreamAnalysis) {
    this.downstreamAnalysis = downstreamAnalysis;
  }


  public Integer getIdDownstreamAnalysis() {
    return idDownstreamAnalysis;
  }


  public void setIdDownstreamAnalysis(Integer idDownstreamAnalysis) {
    this.idDownstreamAnalysis = idDownstreamAnalysis;
  }



}