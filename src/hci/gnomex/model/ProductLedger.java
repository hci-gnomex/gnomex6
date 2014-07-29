package hci.gnomex.model;

import hci.dictionary.model.DictionaryEntry;

import java.io.Serializable;
import java.sql.Date;



public class ProductLedger extends DictionaryEntry implements Serializable {
  
  private Integer     idProductLedger;
  private Integer     idLab;
  private Integer     idProduct;
  private Integer     qty;
  private String      comment;
  private Date        timeStamp;
  private Integer     idProductOrder; // To record which product order added to the ledger
  private String      requestNumber;  // To record which request used some of the product

  
  public String getDisplay() {
    String display = this.getNonNullString(getIdProductLedger());
    return display;
  }

  public String getValue() {
    return this.getNonNullString(getIdProductLedger());
  }

  
  public Integer getIdProductLedger() {
    return idProductLedger;
  }

  
  public void setIdProductLedger( Integer idProductLedger ) {
    this.idProductLedger = idProductLedger;
  }

  
  public Integer getIdLab() {
    return idLab;
  }

  
  public void setIdLab( Integer idLab ) {
    this.idLab = idLab;
  }

  
  public Integer getIdProduct() {
    return idProduct;
  }

  
  public void setIdProduct( Integer idProduct ) {
    this.idProduct = idProduct;
  }

  
  public Integer getQty() {
    return qty;
  }

  
  public void setQty( Integer qty ) {
    this.qty = qty;
  }

  
  public String getComment() {
    return comment;
  }

  
  public void setComment( String comment ) {
    this.comment = comment;
  }

  
  public Date getTimeStamp() {
    return timeStamp;
  }

  
  public void setTimeStamp( Date timeStamp ) {
    this.timeStamp = timeStamp;
  }

  
  public Integer getIdProductOrder() {
    return idProductOrder;
  }

  
  public void setIdProductOrder( Integer idProductOrder ) {
    this.idProductOrder = idProductOrder;
  }

  
  public String getRequestNumber() {
    return requestNumber;
  }

  
  public void setRequestNumber( String requestNumber ) {
    this.requestNumber = requestNumber;
  }

 
}