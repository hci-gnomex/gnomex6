package hci.gnomex.utility;

import hci.framework.model.DetailObject;
import hci.gnomex.model.AppUser;
import hci.gnomex.model.BillingAccount;

import java.io.Serializable;
import java.math.BigDecimal;
import java.text.DecimalFormatSymbols;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;

import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;

import javax.json.JsonArray;
import javax.json.JsonObject;


public class BillingAccountParser extends DetailObject implements Serializable {
  
  protected Document   doc;
  protected JsonArray  originalArray;

  protected Map        billingAccountMap = new HashMap();
  
  public BillingAccountParser(Document doc) {
    this.doc = doc;
    this.originalArray = null;
  }
  public BillingAccountParser(JsonArray originalArray) {
    this.originalArray = originalArray;
    this.doc = null;
  }
  
  public void parse(Session sess) throws Exception{
    if (this.doc != null) {
      this.parseXML(sess);
    } else if (this.originalArray != null) {
      this.parseJSON(sess);
    } else {
      // Do nothing
    }
  }

  protected void parseXML(Session sess) throws Exception{
    Element root = this.doc.getRootElement();


    for(Iterator i = root.getChildren("BillingAccount").iterator(); i.hasNext();) {
      Element node = (Element)i.next();

      String idBillingAccountString = node.getAttributeValue("idBillingAccount");
      BillingAccount billingAccount = null;
      if (idBillingAccountString.startsWith("BillingAccount")) {
        billingAccount = new BillingAccount();
      } else {
        billingAccount = (BillingAccount)sess.load(BillingAccount.class, new Integer(idBillingAccountString));
      }

      this.initializeBillingAccountXML(sess, node, billingAccount);

      billingAccountMap.put(idBillingAccountString, billingAccount);
    }
  }
  
  protected void initializeBillingAccountXML(Session sess, Element n, BillingAccount billingAccount) throws Exception {

    if (n.getAttributeValue("accountName") != null && !n.getAttributeValue("accountName").equals("")) {
      billingAccount.setAccountName(n.getAttributeValue("accountName"));
    } 
    if (n.getAttributeValue("accountNumberBus") != null) {
      billingAccount.setAccountNumberBus(n.getAttributeValue("accountNumberBus"));
    } 
    if (n.getAttributeValue("accountNumberOrg") != null) {
      billingAccount.setAccountNumberOrg(n.getAttributeValue("accountNumberOrg"));
    } 
    if (n.getAttributeValue("accountNumberFund") != null) {
      billingAccount.setAccountNumberFund(n.getAttributeValue("accountNumberFund"));
    } 
    if (n.getAttributeValue("accountNumberActivity") != null) {
      billingAccount.setAccountNumberActivity(n.getAttributeValue("accountNumberActivity"));
    } 
    if (n.getAttributeValue("accountNumberProject") != null) {
      billingAccount.setAccountNumberProject(n.getAttributeValue("accountNumberProject"));
    } 
    if (n.getAttributeValue("accountNumberAccount") != null) {
      billingAccount.setAccountNumberAccount(n.getAttributeValue("accountNumberAccount"));
    } 
    if (n.getAttributeValue("accountNumberAu") != null) {
      billingAccount.setAccountNumberAu(n.getAttributeValue("accountNumberAu"));
    } 
    if (n.getAttributeValue("custom1") != null) {
      billingAccount.setCustom1(n.getAttributeValue("custom1"));
    } 
    if (n.getAttributeValue("custom2") != null) {
      billingAccount.setCustom2(n.getAttributeValue("custom2"));
    } 
    if (n.getAttributeValue("custom3") != null) {
      billingAccount.setCustom3(n.getAttributeValue("custom3"));
    } 
    
    if (n.getAttributeValue("startDate") != null && !n.getAttributeValue("startDate").equals("")) {
      billingAccount.setStartDate(this.parseDate(n.getAttributeValue("startDate")));
    } else {
      billingAccount.setStartDate(null);
    }
    
    if (n.getAttributeValue("expirationDate") != null && !n.getAttributeValue("expirationDate").equals("")) {
      billingAccount.setExpirationDate(this.parseDate(n.getAttributeValue("expirationDate")));
    } else {
      billingAccount.setExpirationDate(null);
    }
    
    if (n.getAttributeValue("idFundingAgency") != null && !n.getAttributeValue("idFundingAgency").equals("")) {
      billingAccount.setIdFundingAgency(new Integer(n.getAttributeValue("idFundingAgency")));
    } else {
      billingAccount.setIdFundingAgency(null);
    }
    if (n.getAttributeValue("isPO") != null && !n.getAttributeValue("isPO").equals("")) {
        billingAccount.setIsPO(n.getAttributeValue("isPO"));
    } else {
      billingAccount.setIsPO("N");
    }
    
    if (n.getAttributeValue("isCreditCard") != null && !n.getAttributeValue("isCreditCard").equals("")) {
      billingAccount.setIsCreditCard(n.getAttributeValue("isCreditCard"));
    } else {
      billingAccount.setIsCreditCard("N");
    }
    
    if (n.getAttributeValue("idCreditCardCompany") != null && !n.getAttributeValue("idCreditCardCompany").equals("")) {
      billingAccount.setIdCreditCardCompany(Integer.valueOf(n.getAttributeValue("idCreditCardCompany")));
    } else {
      billingAccount.setIdCreditCardCompany(null);
    }

    if (n.getAttributeValue("zipCode") != null && !n.getAttributeValue("zipCode").equals("")) {
      billingAccount.setZipCode(n.getAttributeValue("zipCode"));
    } else {
      billingAccount.setZipCode("");
    }

    if (n.getAttributeValue("activeAccount") != null && !n.getAttributeValue("activeAccount").equals("")) {
      billingAccount.setActiveAccount(n.getAttributeValue("activeAccount"));
    } else {
      billingAccount.setActiveAccount("Y");
    }

    if (n.getAttributeValue("totalDollarAmountDisplay") != null && !n.getAttributeValue("totalDollarAmountDisplay").equals("")) {
      String totalDollarAmount = n.getAttributeValue("totalDollarAmountDisplay");
      DecimalFormatSymbols dfs = new DecimalFormatSymbols();
      String regex = "[^0-9" + dfs.getDecimalSeparator() + "]";
      totalDollarAmount = totalDollarAmount.replaceAll(regex, "");
      totalDollarAmount = totalDollarAmount.replace(dfs.getDecimalSeparator(), '.');
      billingAccount.setTotalDollarAmount(new BigDecimal(totalDollarAmount));
   }


    if (n.getAttributeValue("shortAcct") != null && !n.getAttributeValue("shortAcct").equals("")) {
      billingAccount.setShortAcct(n.getAttributeValue("shortAcct"));
    } else {
      billingAccount.setShortAcct(null);
    }
    
    if (n.getAttributeValue("idCoreFacility") != null && !n.getAttributeValue("idCoreFacility").equals("")) {
      billingAccount.setIdCoreFacility(new Integer(n.getAttributeValue("idCoreFacility")));
    } else {
      billingAccount.setIdCoreFacility(null);
    }
        
    if (n.getAttributeValue("isApproved") != null && !n.getAttributeValue("isApproved").equals("")) {
      String isApproved = n.getAttributeValue("isApproved");
      
      // If we have toggled from not approved to approved, set the approved date
      if (isApproved.equals("Y") && billingAccount.getIdBillingAccount() != null) {
        if (billingAccount.getIsApproved() == null || 
            billingAccount.getIsApproved().equals("") ||
            billingAccount.getIsApproved().equalsIgnoreCase("N")) {
          billingAccount.setApprovedDate(new java.sql.Date(System.currentTimeMillis()));
          billingAccount.isJustApproved(true);
        }
      }
      billingAccount.setIsApproved(isApproved);
      
      if (n.getAttributeValue("submitterEmail") != null) {
        billingAccount.setSubmitterEmail(n.getAttributeValue("submitterEmail"));
      }
    } else {
      billingAccount.setIsApproved("N");
    }

    updateUsersXML(sess, n, billingAccount);
  }

  private void updateUsersXML(Session sess, Element node, BillingAccount acct) {
    HashMap<Integer, AppUser> addMap = new HashMap<Integer, AppUser>();
    HashMap<Integer, AppUser> removeMap = new HashMap<Integer, AppUser>();
    String acctUsers = node.getAttributeValue("acctUsers");
    if (acctUsers != null && !acctUsers.equals("")) {
      String[] tokens = acctUsers.split(",");
      for (int x = 0; x < tokens.length; x++) {
        String idAppUserString = tokens[x];
        addMap.put(Integer.valueOf(idAppUserString), null);
      }
    }
    
    // update arrays.
    if (acct.getUsers() != null) {
      for(Iterator i = acct.getUsers().iterator(); i.hasNext(); ) {
        AppUser user = (AppUser)i.next();
        if (addMap.containsKey(user.getIdAppUser())) {
          addMap.remove(user.getIdAppUser());
        } else {
          removeMap.put(user.getIdAppUser(), user);
        }
      }
    } else {
      acct.setUsers(new HashSet());
    }
    
    // Add new ones
    for(Integer id:addMap.keySet()) {
      AppUser user = addMap.get(id);
      user = (AppUser)sess.load(AppUser.class, id);
      acct.getUsers().add(user);
    }
    
    // Remove deleted ones
    for(Integer id:removeMap.keySet()) {
      AppUser user = removeMap.get(id);
      acct.getUsers().remove(user);
    }
  }

  protected void parseJSON(Session sess) throws Exception {
    if (this.originalArray == null) {
      return;
    }

    for(int i = 0; i < this.originalArray.size(); i++) {
      JsonObject billingAccountJson = this.originalArray.getJsonObject(i);
      String idBillingAccountString = billingAccountJson.getString("idBillingAccount");

      BillingAccount billingAccount = null;

      if (idBillingAccountString.startsWith("BillingAccount")) {
        billingAccount = new BillingAccount();
      } else {
        billingAccount = (BillingAccount)sess.load(BillingAccount.class, new Integer(idBillingAccountString));
      }

      this.initializeBillingAccountJSON(sess, billingAccountJson, billingAccount);

      billingAccountMap.put(idBillingAccountString, billingAccount);
    }
  }

  protected void initializeBillingAccountJSON(Session sess, JsonObject billingAccountJson, BillingAccount billingAccount) throws Exception {

    if (billingAccountJson.getString("accountName") != null && !billingAccountJson.getString("accountName").equals("")) {
      billingAccount.setAccountName(billingAccountJson.getString("accountName"));
    }
    if (billingAccountJson.getString("accountNumberBus") != null) {
      billingAccount.setAccountNumberBus(billingAccountJson.getString("accountNumberBus"));
    }
    if (billingAccountJson.getString("accountNumberOrg") != null) {
      billingAccount.setAccountNumberOrg(billingAccountJson.getString("accountNumberOrg"));
    }
    if (billingAccountJson.getString("accountNumberFund") != null) {
      billingAccount.setAccountNumberFund(billingAccountJson.getString("accountNumberFund"));
    }
    if (billingAccountJson.getString("accountNumberActivity") != null) {
      billingAccount.setAccountNumberActivity(billingAccountJson.getString("accountNumberActivity"));
    }
    if (billingAccountJson.getString("accountNumberProject") != null) {
      billingAccount.setAccountNumberProject(billingAccountJson.getString("accountNumberProject"));
    }
    if (billingAccountJson.getString("accountNumberAccount") != null) {
      billingAccount.setAccountNumberAccount(billingAccountJson.getString("accountNumberAccount"));
    }
    if (billingAccountJson.getString("accountNumberAu") != null) {
      billingAccount.setAccountNumberAu(billingAccountJson.getString("accountNumberAu"));
    }
    if (billingAccountJson.getString("custom1") != null) {
      billingAccount.setCustom1(billingAccountJson.getString("custom1"));
    }
    if (billingAccountJson.getString("custom2") != null) {
      billingAccount.setCustom2(billingAccountJson.getString("custom2"));
    }
    if (billingAccountJson.getString("custom3") != null) {
      billingAccount.setCustom3(billingAccountJson.getString("custom3"));
    }

    if (billingAccountJson.getString("startDate") != null && !billingAccountJson.getString("startDate").equals("")) {
      billingAccount.setStartDate(this.parseDate(billingAccountJson.getString("startDate")));
    } else {
      billingAccount.setStartDate(null);
    }

    if (billingAccountJson.getString("expirationDate") != null && !billingAccountJson.getString("expirationDate").equals("")) {
      billingAccount.setExpirationDate(this.parseDate(billingAccountJson.getString("expirationDate")));
    } else {
      billingAccount.setExpirationDate(null);
    }

    if (billingAccountJson.getString("idFundingAgency") != null && !billingAccountJson.getString("idFundingAgency").equals("")) {
      billingAccount.setIdFundingAgency(new Integer(billingAccountJson.getString("idFundingAgency")));
    } else {
      billingAccount.setIdFundingAgency(null);
    }
    if (billingAccountJson.getString("isPO") != null && !billingAccountJson.getString("isPO").equals("")) {
      billingAccount.setIsPO(billingAccountJson.getString("isPO"));
    } else {
      billingAccount.setIsPO("N");
    }

    if (billingAccountJson.getString("isCreditCard") != null && !billingAccountJson.getString("isCreditCard").equals("")) {
      billingAccount.setIsCreditCard(billingAccountJson.getString("isCreditCard"));
    } else {
      billingAccount.setIsCreditCard("N");
    }

    if (billingAccountJson.getString("idCreditCardCompany") != null && !billingAccountJson.getString("idCreditCardCompany").equals("")) {
      billingAccount.setIdCreditCardCompany(Integer.valueOf(billingAccountJson.getString("idCreditCardCompany")));
    } else {
      billingAccount.setIdCreditCardCompany(null);
    }

    if (billingAccountJson.getString("zipCode") != null && !billingAccountJson.getString("zipCode").equals("")) {
      billingAccount.setZipCode(billingAccountJson.getString("zipCode"));
    } else {
      billingAccount.setZipCode("");
    }

    if (billingAccountJson.getString("activeAccount") != null && !billingAccountJson.getString("activeAccount").equals("")) {
      billingAccount.setActiveAccount(billingAccountJson.getString("activeAccount"));
    } else {
      billingAccount.setActiveAccount("Y");
    }

    if (billingAccountJson.getString("totalDollarAmountDisplay") != null && !billingAccountJson.getString("totalDollarAmountDisplay").equals("")) {
      String totalDollarAmount = billingAccountJson.getString("totalDollarAmountDisplay");
      DecimalFormatSymbols dfs = new DecimalFormatSymbols();
      String regex = "[^0-9" + dfs.getDecimalSeparator() + "]";
      totalDollarAmount = totalDollarAmount.replaceAll(regex, "");
      totalDollarAmount = totalDollarAmount.replace(dfs.getDecimalSeparator(), '.');
      billingAccount.setTotalDollarAmount(new BigDecimal(totalDollarAmount));
    }


    if (billingAccountJson.getString("shortAcct") != null && !billingAccountJson.getString("shortAcct").equals("")) {
      billingAccount.setShortAcct(billingAccountJson.getString("shortAcct"));
    } else {
      billingAccount.setShortAcct(null);
    }

    if (billingAccountJson.getString("idCoreFacility") != null && !billingAccountJson.getString("idCoreFacility").equals("")) {
      billingAccount.setIdCoreFacility(new Integer(billingAccountJson.getString("idCoreFacility")));
    } else {
      billingAccount.setIdCoreFacility(null);
    }

    if (billingAccountJson.getString("isApproved") != null && !billingAccountJson.getString("isApproved").equals("")) {
      String isApproved = billingAccountJson.getString("isApproved");

      // If we have toggled from not approved to approved, set the approved date
      if (isApproved.equals("Y") && billingAccount.getIdBillingAccount() != null) {
        if (billingAccount.getIsApproved() == null ||
            billingAccount.getIsApproved().equals("") ||
            billingAccount.getIsApproved().equalsIgnoreCase("N")) {
          billingAccount.setApprovedDate(new java.sql.Date(System.currentTimeMillis()));
          billingAccount.isJustApproved(true);
        }
      }
      billingAccount.setIsApproved(isApproved);

      if (billingAccountJson.getString("submitterEmail") != null) {
        billingAccount.setSubmitterEmail(billingAccountJson.getString("submitterEmail"));
      }
    } else {
      billingAccount.setIsApproved("N");
    }

    updateUsersJSON(sess, billingAccountJson, billingAccount);
  }

  private void updateUsersJSON(Session sess, JsonObject billingAccountJson, BillingAccount acct) {
    HashMap<Integer, AppUser> addMap = new HashMap<Integer, AppUser>();
    HashMap<Integer, AppUser> removeMap = new HashMap<Integer, AppUser>();

    String acctUsers = billingAccountJson.getString("acctUsers");
    if (acctUsers != null && !acctUsers.equals("")) {
      String[] tokens = acctUsers.split(",");
      for (int x = 0; x < tokens.length; x++) {
        String idAppUserString = tokens[x];
        addMap.put(Integer.valueOf(idAppUserString), null);
      }
    }

    // update arrays.
    if (acct.getUsers() != null) {
      for(Iterator i = acct.getUsers().iterator(); i.hasNext(); ) {
        AppUser user = (AppUser)i.next();
        if (addMap.containsKey(user.getIdAppUser())) {
          addMap.remove(user.getIdAppUser());
        } else {
          removeMap.put(user.getIdAppUser(), user);
        }
      }
    } else {
      acct.setUsers(new HashSet());
    }

    // Add new ones
    for(Integer id:addMap.keySet()) {
      AppUser user = addMap.get(id);
      user = (AppUser)sess.load(AppUser.class, id);
      acct.getUsers().add(user);
    }

    // Remove deleted ones
    for(Integer id:removeMap.keySet()) {
      AppUser user = removeMap.get(id);
      acct.getUsers().remove(user);
    }
  }


  public Map getBillingAccountMap() {
    return billingAccountMap;
  }

  
  public void setBillingAccountMap(Map billingAccountMap) {
    this.billingAccountMap = billingAccountMap;
  }
}
