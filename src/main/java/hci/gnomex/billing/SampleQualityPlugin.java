package hci.gnomex.billing;

import hci.gnomex.constants.Constants;
import hci.gnomex.model.*;
import hci.gnomex.utility.DictionaryHelper;
import hci.gnomex.utility.PropertyDictionaryHelper;
import org.hibernate.Session;

import java.util.*;


public class SampleQualityPlugin extends BillingPlugin {

  public List<BillingItem> constructBillingItems(Session sess, String amendState, BillingPeriod billingPeriod, PriceCategory priceCategory, Request request, 
      Set<Sample> samples, Set<LabeledSample> labeledSamples, Set<Hybridization> hybs, Set<SequenceLane> lanes, Map<String, ArrayList<String>> sampleToAssaysMap, 
      String billingStatus, Set<PropertyEntry> propertyEntries, BillingTemplate billingTemplate) {
    
    
    List<BillingItem> billingItems = new ArrayList<BillingItem>();
    Map codeChipTypeMap = new HashMap();
    Map codeChipTypeNoteMap = new HashMap();

    if (samples == null || samples.size() == 0) {
      return billingItems;
    }
    
    // If we changed a QC request -> Solexa request, ignore any billing for sample quality because
    // we have already performed it.
    if (amendState != null && amendState.equals(Constants.AMEND_QC_TO_SEQ)) {
      return billingItems;
    }
    
    // skip qc billing if request category property indicates this, unless qc failed.  Note this was introduced since Brian includes qc billing in lib prep for illumina.
    DictionaryHelper dh = DictionaryHelper.getInstance(sess);
    PropertyDictionaryHelper pdh = PropertyDictionaryHelper.getInstance(sess);
    String illuminaQCInPrepStr = pdh.getCoreFacilityRequestCategoryProperty(request.getIdCoreFacility(), request.getCodeRequestCategory(), PropertyDictionary.ILLUMINA_QC_IN_LIB_PREP);
    Boolean illuminaQCInPrep = illuminaQCInPrepStr != null && illuminaQCInPrepStr.equals("Y");
    
    // Count up number of samples for each codeBioanalyzerChipType
    Application application = null;
    if (request.getCodeApplication() != null) {
      application = (Application)sess.get(Application.class, request.getCodeApplication());
    }
    for(Iterator i = samples.iterator(); i.hasNext();) {
      Sample sample = (Sample)i.next();
      
      
      // Bypass sample quality on illumina requests where the library is
      // not prepped by core.
      if (RequestCategory.isIlluminaRequestCategory(request.getCodeRequestCategory())) {
        if (sample.getSeqPrepByCore() != null && sample.getSeqPrepByCore().equals("N")) {
          continue;
        }
        // Bypass sample quality when pricing is included in lib prep -- unless qc failed in which case we charge for it.
        if (illuminaQCInPrep && (sample.getQualFailed() == null || !sample.getQualFailed().equals("Y"))) {
          continue;
        }
      }
      
      String filter1 = Application.BIOANALYZER_QC;
      String filter2 = null;
      
      if (RequestCategory.isIlluminaRequestCategory(request.getCodeRequestCategory()) && sample.getQcCodeApplication() == null) {
        if (application != null && application.getCodeApplication().indexOf("RNA") >= 0) {
          filter2 = BioanalyzerChipType.RNA_NANO;
        } else  {
          filter1 = Application.QUBIT_PICOGREEN_QC;
        } 
        
      } else if ((request.getCodeRequestCategory().equals(RequestCategory.AGILIENT_MICROARRAY_REQUEST_CATEGORY) || request.getCodeRequestCategory().equals(RequestCategory.AGILIENT_1_COLOR_MICROARRAY_REQUEST_CATEGORY)) &&
                  request.getCodeApplication().equals(Application.CGH_MICROARRAY_CATEGORY)) {
          filter2 =  Application.DNA_GEL_QC;
      } else if ((request.getCodeRequestCategory().equals(RequestCategory.AGILIENT_MICROARRAY_REQUEST_CATEGORY) || request.getCodeRequestCategory().equals(RequestCategory.AGILIENT_1_COLOR_MICROARRAY_REQUEST_CATEGORY)) &&
                  request.getCodeApplication().equals(Application.CHIP_ON_CHIP_MICROARRAY_CATEGORY)) {
          filter2 = BioanalyzerChipType.DNA1000;
      } else if ((request.getCodeRequestCategory().equals(RequestCategory.AGILIENT_MICROARRAY_REQUEST_CATEGORY) || request.getCodeRequestCategory().equals(RequestCategory.AGILIENT_1_COLOR_MICROARRAY_REQUEST_CATEGORY)) &&
                  request.getCodeApplication().equals(Application.EXPRESSION_MICROARRAY_CATEGORY)) {
          filter2 = BioanalyzerChipType.RNA_NANO;
      } else if (request.getCodeRequestCategory().equals(RequestCategory.AFFYMETRIX_MICROARRAY_REQUEST_CATEGORY) &&
                  request.getCodeApplication().equals(Application.EXPRESSION_MICROARRAY_CATEGORY)) {
        filter2 = BioanalyzerChipType.RNA_NANO;
      } else if (request.getCodeRequestCategory().equals(RequestCategory.AFFYMETRIX_MICROARRAY_REQUEST_CATEGORY) &&
                  request.getCodeApplication().equals(Application.SNP_MICROARRAY_CATEGORY)) {
        filter1 = Application.DNA_GEL_QC;
      } else {
        filter1 = null;
        if (sample.getQcCodeApplication() != null) {
          filter1 = sample.getQcCodeApplication();
        } else if (application != null) {
          filter1 = application.getCodeApplication();
        }
        Application qcApplication = dh.getApplicationObject(filter1);
        filter2 = null;
        if (qcApplication.getHasChipTypes() != null && qcApplication.getHasChipTypes().equals("Y")) {
          filter2 = sample.getCodeBioanalyzerChipType();
        }
        
        // If we don't have a chip type assigned yet on the sample,
        // use the default based on the sample type
        if ( filter1.equals(Application.BIOANALYZER_QC)) {
          if (filter2 == null || filter2.equals("")) {
            if (dh.getSampleType(sample).indexOf("RNA") >= 1) {
              filter2 = BioanalyzerChipType.RNA_NANO;
            } else {
              filter2 = BioanalyzerChipType.DNA1000;
            }
          }
        }
      }        
      

      // Store the qty associated with this billing item.
      String key = filter1 + "-" + filter2;
      Integer sampleCount = (Integer)codeChipTypeMap.get(key);
      if (sampleCount == null) {
        sampleCount = 0;
      }
      sampleCount = Integer.valueOf(sampleCount.intValue() + 1);
      codeChipTypeMap.put(key, sampleCount);

      // Store the notes associated with this billing item
      // Show the sample numbers in the billing note
      String notes = (String)codeChipTypeNoteMap.get(key);
      if (notes == null) {
        notes = "";
      }
      if (notes.length() > 0) {
        notes += ",";
      }
      notes += sample.getNumber();
      codeChipTypeNoteMap.put(key, notes);
    
    }
    
    // Now generate a billing item for each bioanalyzer chip type
    for(Iterator i = codeChipTypeMap.keySet().iterator(); i.hasNext();) {
      String  key = (String)i.next();
      String[] tokens = key.split("-");
      String  filter1 = tokens[0];
      String  filter2 = tokens[1];
      
      Integer qty = (Integer)codeChipTypeMap.get(key);
      String notes = (String)codeChipTypeNoteMap.get(key);
      
      // Find the price for kind of sample quality
      Price price = null;
      for(Iterator i1 = priceCategory.getPrices().iterator(); i1.hasNext();) {
        Price p = (Price)i1.next();
        if (p.getIsActive() != null && p.getIsActive().equals("Y")) {
          for(Iterator i2 = p.getPriceCriterias().iterator(); i2.hasNext();) {
            PriceCriteria criteria = (PriceCriteria)i2.next();
            if (criteria.getFilter1().equals(filter1)) {
              if (filter2.equals("null")) {
                if (criteria.getFilter2() == null || criteria.getFilter2().equals("")) {
                  price = p;
                  break;              
                  
                }
              } else {
                if (criteria.getFilter2() != null && criteria.getFilter2().equals(filter2)) {
                  price = p;
                  break;
                }
              }
            } 
          }
        }
      }
      
      // Instantiate a BillingItem for the matched billing price
      if (price != null) {
    	  billingItems.addAll(this.makeBillingItems(request, price, priceCategory, qty, billingPeriod, billingStatus, sess, billingTemplate));
      }
    }
    
    
    return billingItems;
  }
  
}