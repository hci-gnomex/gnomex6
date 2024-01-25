package hci.gnomex.model;

import hci.dictionary.model.DictionaryEntry;
import hci.gnomex.utility.PropertyDictionaryHelper;

import java.io.Serializable;
import java.sql.Date;
import java.util.Calendar;



public class BillingPeriod extends DictionaryEntry implements Serializable {
  private Integer  idBillingPeriod;
  private String   billingPeriod;
  private Date     startDate;
  private Date     endDate;
  private String   isActive;
  
  public String getDisplay() {
    String display = this.getNonNullString(getBillingPeriod());
    if (isActive == null || isActive.equals("N")) {
      display += " (inactive)";
    }

    return display;
  }

  public String getValue() {
    return getIdBillingPeriod().toString();
  }
  
  public Integer getIdBillingPeriod() {
    return idBillingPeriod;
  }

  
  public void setIdBillingPeriod(Integer idBillingPeriod) {
    this.idBillingPeriod = idBillingPeriod;
  }

  
  
  public String getIsActive() {
    return isActive;
  }

  
  public void setIsActive(String isActive) {
    this.isActive = isActive;
  }

  
  public String getBillingPeriod() {
    return billingPeriod;
  }

  
  public void setBillingPeriod(String billingPeriod) {
    this.billingPeriod = billingPeriod;
  }

  
  public Date getStartDate() {
    return startDate;
  }

  
  public void setStartDate(Date startDate) {
    this.startDate = startDate;
  }
  
  
  public Date getEndDate() {
    return endDate;
  }

  
  public void setEndDate(Date endDate) {
    this.endDate = endDate;
  }

  
  public String getStartDateSort() {
    return this.formatDate(this.startDate, this.DATE_OUTPUT_SQL);
  }


  public String getIsCurrentPeriod() {
    
    Calendar cal = Calendar.getInstance();
    cal.setTime(endDate);
    cal.add(Calendar.DATE, 1);
    java.sql.Date dayAfterEndDate = new java.sql.Date(cal.getTimeInMillis());
    
    java.sql.Date today = new java.sql.Date(System.currentTimeMillis());
    if (this.startDate.getTime() <= today.getTime() &&
        dayAfterEndDate.getTime() > today.getTime()) {
      return "Y";
    } else {
      return "N";
    }
    
  }

  public String getFiscalYear(PropertyDictionaryHelper pdh, Integer idCoreFacility) {
    if (endDate == null) {
      return "";
    }
    Calendar calendar = Calendar.getInstance();
    calendar.setTime(endDate);
    Integer periodMonth = calendar.get(Calendar.MONTH) + 1; // apparently returns 0 relative month
    Integer periodDay = calendar.get(Calendar.DAY_OF_MONTH); // not zero relative -- nice consistency
    Integer fiscalMonth = pdh.convertPropertyToInteger(pdh.getCoreFacilityProperty(idCoreFacility, PropertyDictionary.FISCAL_YEAR_BREAK_MONTH), 1);
    Integer fiscalDay = pdh.convertPropertyToInteger(pdh.getCoreFacilityProperty(idCoreFacility, PropertyDictionary.FISCAL_YEAR_BREAK_DAY), 1);
    if (periodMonth > fiscalMonth || (periodMonth == fiscalMonth && periodDay >= fiscalDay)) {
      Integer retYear = calendar.get(Calendar.YEAR) + 1;
      return retYear.toString();
    } else {
      return Integer.valueOf(calendar.get(Calendar.YEAR)).toString();
    }
  }
  
  public Integer getCalendarYear() {
    Calendar cal = Calendar.getInstance();
    cal.setTime(endDate);
    return cal.get(Calendar.YEAR);
  }
}