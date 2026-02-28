package hci.gnomex.billing;

import hci.gnomex.model.*;
import org.hibernate.Session;

import java.util.*;


public class IlluminaExomeCapturePerCapPlugin extends BillingPlugin {
  // Capture is for up to six samples
  static final int SAMPLES_PER_CAPTURE = 6;

  public List<BillingItem> constructBillingItems(Session sess, String amendState, BillingPeriod billingPeriod, PriceCategory priceCategory, Request request, 
      Set<Sample> samples, Set<LabeledSample> labeledSamples, Set<Hybridization> hybs, Set<SequenceLane> lanes, Map<String, ArrayList<String>> sampleToAssaysMap, 
      String billingStatus, Set<PropertyEntry> propertyEntries, BillingTemplate billingTemplate) {
    
    List<BillingItem> billingItems = new ArrayList<BillingItem>();
    
    if (!this.hasValidData(sess, request, samples)) {
    	return billingItems;
    }
    
    HashMap<String, Integer> sampleMap = new HashMap<String, Integer>();
    for(Iterator i = samples.iterator(); i.hasNext();) {
      Sample s = (Sample)i.next();
      
      // Only charge for lib prep if core is performing it.
      if (s.getSeqPrepByCore() != null && s.getSeqPrepByCore().equals("N")) {
        continue;
      } 
      
      String key = null;
      if (s.getMultiplexGroupNumber() == null || s.getMultiplexGroupNumber().equals("")) {
        key = s.getName();
      } else {
        key = s.getMultiplexGroupNumber().toString();
      }
      Integer sampleCount = sampleMap.get(key);
      if (sampleCount == null) {
        sampleCount = 0;
      }
      sampleCount = Integer.valueOf(sampleCount.intValue() + 1);
      sampleMap.put(key, sampleCount);
    }
    
    qty = 0;
    for (Iterator i = sampleMap.keySet().iterator(); i.hasNext();) {
      String key = (String)i.next();
      Integer sampleCount = sampleMap.get(key);

      qty ++;
    }
    

    // Find the price
    Price price = null;
    for(Iterator i1 = priceCategory.getPrices().iterator(); i1.hasNext();) {
      Price p = (Price)i1.next();
      if (p.getIsActive() != null && p.getIsActive().equals("Y")) {
        for(Iterator i2 = p.getPriceCriterias().iterator(); i2.hasNext();) {
          PriceCriteria criteria = (PriceCriteria)i2.next();
          if (criteria.getFilter1().equals(request.getCodeApplication())) {          
            price = p;
            break;            
          }
        }
      }
    }
    
    qty = this.checkQty(sess, request, samples, qty);

    // Instantiate a BillingItem for the matched price
    if (price != null) {
    	billingItems.addAll(this.makeBillingItems(request, price, priceCategory, qty, billingPeriod, billingStatus, sess, billingTemplate));
    }
    
    
    return billingItems;
  }

  

}
