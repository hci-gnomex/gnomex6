package hci.gnomex.utility;

import hci.framework.model.DetailObject;
import hci.gnomex.model.BillingAccount;
import hci.gnomex.model.Request;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.*;


public class BillingAccountSplitParser extends DetailObject implements Serializable {
  
  protected Document   doc;
  protected List       billingAccounts = new ArrayList();
  protected Map        percentageMap = new HashMap();
  protected Request    request;
  protected Map        invoicePriceMap = new HashMap();
  
  public BillingAccountSplitParser(Document doc) {
    this.doc = doc;
 
  }
  
  public void parse(Session sess) throws Exception{
    
    Element root = this.doc.getRootElement();
    
    for(Iterator i = root.getChildren("Request").iterator(); i.hasNext();) {
      Element node = (Element)i.next();
      String idRequestString = node.getAttributeValue("idRequest");
      request = (Request)sess.load(Request.class, Integer.valueOf(idRequestString));
      
      for(Iterator i1 = node.getChildren("BillingAccount").iterator(); i1.hasNext();) {
        Element baNode = (Element)i1.next();
        
        String idBillingAccountString = baNode.getAttributeValue("idBillingAccount");
        String percentageString = baNode.getAttributeValue("percentage");
        percentageString = percentageString.replaceAll("\\%", "");
        String invoicePriceString = baNode.getAttributeValue("invoicePrice");
        invoicePriceString = invoicePriceString.replaceAll("\\$", "").replaceAll(",", "");
        
        Double percentage = new Double(percentageString);
        BillingAccount billingAccount = null;
        billingAccount = (BillingAccount)sess.load(BillingAccount.class, Integer.valueOf(idBillingAccountString));
        
        billingAccounts.add(billingAccount);
        BigDecimal percentPrice = new BigDecimal(percentage).movePointLeft(2);
        percentageMap.put(Integer.valueOf(idBillingAccountString), percentPrice);
        
        BigDecimal invoicePrice = new BigDecimal(invoicePriceString);
        invoicePriceMap.put(Integer.valueOf(idBillingAccountString), invoicePrice);
      }
    
    }
    
   
  }
  
  public Request getRequest() {
    return request;
  }
  

  
  public BigDecimal getPercentage(Integer idBillingAccount) {
    return (BigDecimal)percentageMap.get(idBillingAccount);
  }
  
  public BigDecimal getInvoicePrice(Integer idBillingAccount) {
    return (BigDecimal)invoicePriceMap.get(idBillingAccount);
  }

  
  public List getBillingAccounts() {
    return this.billingAccounts;
  }
  


}
