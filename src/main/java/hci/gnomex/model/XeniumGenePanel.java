package hci.gnomex.model;

import hci.dictionary.model.DictionaryEntry;

import java.io.Serializable;

public class XeniumGenePanel extends DictionaryEntry implements Serializable {
  private int idXeniumGenePanel;
  private String xeniumGenePanel;
  private String isActive;
  private int sortOrder;
  private int idCoreFacility;


  public String getDisplay() {
    String display = this.getNonNullString(getXeniumGenePanel());
    return display;
  }

  public Integer getIdXeniumGenePanel() {
    return idXeniumGenePanel;
  }

  public void setIdXeniumGenePanel(Integer idXeniumGenePanel) {
    this.idXeniumGenePanel = idXeniumGenePanel;
  }

  public String getValue() {
    return getIdXeniumGenePanel().toString();
  }

  public String getIsActive() {
    return isActive;
  }

  public void setIsActive(String isActive) {
    this.isActive = isActive;
  }

  public int getSortOrder() {
    return sortOrder;
  }

  public void setSortOrder(int sortOrder) {
    this.sortOrder = sortOrder;
  }

  public int getIdCoreFacility() {
    return idCoreFacility;
  }

  public void setIdCoreFacility(int idCoreFacility) {
    this.idCoreFacility = idCoreFacility;
  }


  public String getXeniumGenePanel() {
    return xeniumGenePanel;
  }

  public void setXeniumGenePanel(String xeniumGenePanel) {
    this.xeniumGenePanel = xeniumGenePanel;
  }
}
