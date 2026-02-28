package hci.gnomex.billing;

import hci.gnomex.model.*;
import org.hibernate.Session;

import java.util.*;


public class XeniumPlugin extends BillingPlugin {

  public List<BillingItem> constructBillingItems(Session sess, String amendState, BillingPeriod billingPeriod, PriceCategory priceCategory, Request request, 
      Set<Sample> samples, Set<LabeledSample> labeledSamples, Set<Hybridization> hybs, Set<SequenceLane> lanes, Map<String, ArrayList<String>> sampleToAssaysMap, 
      String billingStatus, Set<PropertyEntry> propertyEntries, BillingTemplate billingTemplate) {

    List<BillingItem> billingItems = new ArrayList<BillingItem>();
    
    if (!this.hasValidData(sess, request, samples)) {
    	return billingItems;
    }

    
    // Generate the billing item.  Find the price using the
    // criteria of the xenium application.
    qty = 1;

    // get the xeniumgenepanel from the request
    String xeniumGenePanel = hci.dictionary.utility.DictionaryManager.getDisplay("hci.gnomex.model.XeniumGenePanel",request.getIdXeniumGenePanel().toString());
//    System.out.println("[XeniumPlugin] xeniumGenePanel: is null ********");
    if (xeniumGenePanel == null) {
      // If the xenium gene panel is not set, then we cannot bill.
      System.out.println("[XeniumPlugin] theXeniumGenePanel: is null ********");
      return billingItems;
    }

    System.out.println("[XeniumPlugin] xeniumGenePanel: " + xeniumGenePanel);


    // Find the price.  (There is only one ...)
    Price price = null;
    for(Iterator i1 = priceCategory.getPrices().iterator(); i1.hasNext();) {
        price = (Price)i1.next();

      System.out.println("[XeniumPlugin] price name:" + price.getName());

      if (price.getIsActive() != null && price.getIsActive().equals("Y") && price.getName().equals(xeniumGenePanel)) {
        break;
      }
    }
    
    qty = 1;

    // Instantiate a BillingItem for the matched price
    if (price != null) {
    	billingItems.addAll(this.makeBillingItems(request, price, priceCategory, qty, billingPeriod, billingStatus, sess, billingTemplate));
    }
    
    
    return billingItems;
  }

  

}
