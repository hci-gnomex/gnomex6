package hci.gnomex.billing;

import hci.gnomex.model.*;
import org.hibernate.Session;

import java.util.*;

public class InternalPercentDiscountPlugin extends BillingPlugin {
  public List<BillingItem> constructBillingItems(Session sess, String amendState, BillingPeriod billingPeriod, PriceCategory priceCategory, Request request, 
      Set<Sample> samples, Set<LabeledSample> labeledSamples, Set<Hybridization> hybs, Set<SequenceLane> lanes, Map<String, ArrayList<String>> sampleToAssaysMap, 
      String billingStatus, Set<PropertyEntry> propertyEntries, BillingTemplate billingTemplate) {

    List<BillingItem> billingItems = new ArrayList<BillingItem>();
    
    if (samples == null || samples.size() == 0) {
      return billingItems;
    }
    
    if ( request.getLab() == null || request.getLab().isExternalLab() ) {
      return billingItems;
    }
    
    // Now find the price
    Price price = null;

    for(Iterator i1 = priceCategory.getPrices().iterator(); i1.hasNext();) {
      Price p = (Price)i1.next();
      if (p.getIsActive() != null && p.getIsActive().equals("Y")) {
        for(Iterator i2 = p.getPriceCriterias().iterator(); i2.hasNext();) {
          PriceCriteria criteria = (PriceCriteria)i2.next();
          if (criteria.getFilter1().equals(billingPeriod.getIdBillingPeriod().toString())) {
            price = p;
            break;          
          }
        }
      }

    }    

    // Instantiate a BillingItem for the matched price
    if (price != null) {
    	billingItems.addAll(this.makeBillingItems(request, price, priceCategory, 1, billingPeriod, billingStatus, sess, billingTemplate));
    }
    
    
    return billingItems;
  }



}
