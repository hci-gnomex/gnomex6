package hci.gnomex.billing;

import hci.gnomex.model.*;
import hci.gnomex.utility.DictionaryHelper;
import org.hibernate.Session;

import java.util.*;


public class LabelingReactionPlugin extends BillingPlugin {
  public List<BillingItem> constructBillingItems(Session sess, String amendState, BillingPeriod billingPeriod, PriceCategory priceCategory, Request request, 
      Set<Sample> samples, Set<LabeledSample> labeledSamples, Set<Hybridization> hybs, Set<SequenceLane> lanes, Map<String, ArrayList<String>> sampleToAssaysMap, 
      String billingStatus, Set<PropertyEntry> propertyEntries, BillingTemplate billingTemplate) {
    
    List<BillingItem> billingItems = new ArrayList<BillingItem>();
    DictionaryHelper dh = DictionaryHelper.getInstance(sess);
    
    if (labeledSamples == null || labeledSamples.size() == 0) {
      return billingItems;
    }

    
    // Total number of labeling reactions
    qty = 0;
    for(Iterator i = labeledSamples.iterator(); i.hasNext();) {
      LabeledSample ls = (LabeledSample)i.next();
      
      Integer numberReactions = ls.getNumberOfReactions();
      if (numberReactions == null || numberReactions.intValue() == 0) {
        numberReactions = 1;
      }
      
      qty += numberReactions.intValue();
    }
    
    // Show the labeled sample numbers in the note
    String notes = "";
    for(Iterator i = labeledSamples.iterator(); i.hasNext();) {
      LabeledSample ls = (LabeledSample)i.next();
      
      if (notes.length() > 0) {
        notes += ",";
      }
      if (ls.getSample() != null && ls.getSample().getNumber() != null) {
        notes += dh.getLabel(ls.getIdLabel()) + "-" + ls.getSample().getNumber();        
      }
    }
    
    Integer idBillingSlideServiceClass = request.getSlideProduct().getIdBillingSlideServiceClass();
    
    // Now find the price
    Price price = null;
    
    // Bypass labeling for HybMap microarray experiments
    if (request.getCodeApplication().equals(Application.HYBMAP_MICROARRAY_CATEGORY)) {
      return billingItems;
    }
    
    // Lookup prices.  
    // For Affymetrix requests, look at the microarray service class to determine
    // labeling price.
    // For Agilent (and other) requests, look at microarray category to
    // determine labeling price.
    for(Iterator i1 = priceCategory.getPrices().iterator(); i1.hasNext();) {
      Price p = (Price)i1.next();
      if (p.getIsActive() != null && p.getIsActive().equals("Y")) {
        for(Iterator i2 = p.getPriceCriterias().iterator(); i2.hasNext();) {
          PriceCriteria criteria = (PriceCriteria)i2.next();          
          if (request.getCodeRequestCategory().equals(RequestCategory.AFFYMETRIX_MICROARRAY_REQUEST_CATEGORY)) {
              
            if (idBillingSlideServiceClass != null) {
              if (criteria.getFilter1().equals(idBillingSlideServiceClass.toString())) {
                price = p;
                break;          
              }        

            }
          } else {
            if (criteria.getFilter1() != null && criteria.getFilter1().equals(request.getCodeApplication())) {
                price = p;
                break;                 
            }
          }
        }
      }
    }

    // Instantiate a BillingItem for the matched price
    if (price != null) {
    	billingItems.addAll(this.makeBillingItems(request, price, priceCategory, qty, billingPeriod, billingStatus, sess, billingTemplate));

    }
    
    
    return billingItems;  
    }



}
