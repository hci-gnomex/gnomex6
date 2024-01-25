package hci.gnomex.billing;

import hci.gnomex.model.*;
import hci.gnomex.utility.DictionaryHelper;
import org.hibernate.Session;

import java.util.*;


public class IlluminaLibSampleQualityPlugin extends BillingPlugin {

  public List<BillingItem> constructBillingItems(Session sess, String amendState, BillingPeriod billingPeriod, PriceCategory priceCategory, Request request, 
      Set<Sample> samples, Set<LabeledSample> labeledSamples, Set<Hybridization> hybs, Set<SequenceLane> lanes, Map<String, ArrayList<String>> sampleToAssaysMap, 
      String billingStatus, Set<PropertyEntry> propertyEntries, BillingTemplate billingTemplate) {
    
    List<BillingItem> billingItems = new ArrayList<BillingItem>();
    Map codeChipTypeMap = new HashMap();
    Map codeChipTypeNoteMap = new HashMap();
    
    if (samples == null || samples.size() == 0) {
      return billingItems;
    }
    
    
    // Count up number of samples for each codeBioanalyzerChipType
    for(Iterator i = samples.iterator(); i.hasNext();) {
      Sample sample = (Sample)i.next();

      // The price of QC is built into libary prep when core preps the library,
      // so bypass creating billing item when seqPrepCore=Y.
      if (sample.getSeqPrepByCore() != null && sample.getSeqPrepByCore().equals("Y")) {
        continue;
      }
      
      String codeChipType = sample.getSeqPrepQualCodeBioanalyzerChipType();
      
      // If we don't have a bioanalyzer chip type assigned yet on the sample,
      // use the default based on the sample type
      if ( codeChipType == null || codeChipType.equals("")) {
        DictionaryHelper dh = DictionaryHelper.getInstance(sess);
        codeChipType = BioanalyzerChipType.DNA1000;
      } 
      
      Integer sampleCount = (Integer)codeChipTypeMap.get(codeChipType);
      if (sampleCount == null) {
        sampleCount = 0;
      }
      sampleCount = Integer.valueOf(sampleCount.intValue() + 1);
      codeChipTypeMap.put(codeChipType, sampleCount);
      
      // Store the notes associated with this billing item
      // Show the sample numbers in the billing note
      String notes = (String)codeChipTypeNoteMap.get(codeChipType);
      if (notes == null) {
        notes = "";
      }
      if (notes.length() > 0) {
        notes += ",";
      }
      notes += sample.getNumber();
      codeChipTypeNoteMap.put(codeChipType, notes);
    }
    
    
    // Now generate a billing item for each bioanalyzer chip type
    for(Iterator i = codeChipTypeMap.keySet().iterator(); i.hasNext();) {
      String  codeBioanalyzerChipType = (String)i.next();
      Integer qty = (Integer)codeChipTypeMap.get(codeBioanalyzerChipType);
      String notes = (String)codeChipTypeNoteMap.get(codeBioanalyzerChipType);
      
      // Find the billing price for the bioanalyzer chip type
      Price price = null;
      for(Iterator i1 = priceCategory.getPrices().iterator(); i1.hasNext();) {
        Price p = (Price)i1.next();
        for(Iterator i2 = p.getPriceCriterias().iterator(); i2.hasNext();) {
          PriceCriteria criteria = (PriceCriteria)i2.next();
          if (criteria.getFilter2() != null && criteria.getFilter2().equals(codeBioanalyzerChipType)) {
            price = p;
            break;
          }
          
        }
          
      }
      
      if (request.getHasPrePooledLibraries() != null && request.getHasPrePooledLibraries().equals("Y") && request.getNumPrePooledTubes() != null && request.getNumPrePooledTubes() > 0) {
        qty = request.getNumPrePooledTubes();
      }
      
      // Instantiate a BillingItem for the matched billing price
      if (price != null) {
    	  billingItems.addAll(this.makeBillingItems(request, price, priceCategory, qty.intValue(), billingPeriod, billingStatus, sess, billingTemplate));
      }
    }
    
    
    return billingItems;
  }



}
