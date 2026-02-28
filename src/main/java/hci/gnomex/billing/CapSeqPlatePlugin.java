package hci.gnomex.billing;

import hci.gnomex.model.*;
import org.hibernate.Session;

import java.util.*;


public class CapSeqPlatePlugin extends BillingPlugin {

  public List<BillingItem> constructBillingItems(Session sess, String amendState, BillingPeriod billingPeriod, PriceCategory priceCategory, Request request,
      Set<Sample> samples, Set<LabeledSample> labeledSamples, Set<Hybridization> hybs, Set<SequenceLane> lanes, Map<String, ArrayList<String>> sampleToAssaysMap,
      String billingStatus, Set<PropertyEntry> propertyEntries, BillingTemplate billingTemplate) {


    List<BillingItem> billingItems = new ArrayList<BillingItem>();

    if (samples == null || samples.size() == 0) {
      return billingItems;
    }

    // We don't add billing items on a 4-plate cap seq order since it is a bulk charge on the 4 plates, partial or full
    if (request.getBillingItems() != null && !request.getBillingItems().isEmpty()) {
      return billingItems;
    }


    // detect if samples submitted in plate wells
    boolean sampleInPlateWell = false;
    HashMap<Plate, ?> plateMap = new HashMap<Plate, String>();
    for (Sample s : samples) {
      if (s.getWells() != null) {
        for (PlateWell w : (Set<PlateWell>)s.getWells()) {
          if (w.getPlate() != null && w.getPlate().getCodePlateType().equals(PlateType.SOURCE_PLATE_TYPE)) {
            sampleInPlateWell = true;
            plateMap.put(w.getPlate(), null);
          }
        }
      }
    }
    // This billing plug-in only applies for samples submitted in plates
    if (!sampleInPlateWell) {
      return billingItems;
    }
    // This billing plug-in only applies for orders with 4 plates
    if (plateMap.size() != 4) {
      return billingItems;
    }

    qty = 4;



    // Find the price
    Price price = getPriceForRange(priceCategory);

    // Unit price is for 4 plates.
    qty = 1;

    // Instantiate a BillingItem for the matched billing price
    if (price != null) {
    	billingItems.addAll(this.makeBillingItems(request, price, priceCategory, qty, billingPeriod, billingStatus, sess, billingTemplate));
    }


    return billingItems;
  }

}