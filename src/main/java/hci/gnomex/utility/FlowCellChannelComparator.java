package hci.gnomex.utility;

import hci.gnomex.model.FlowCellChannel;

import java.io.Serializable;
import java.util.Comparator;

 public class FlowCellChannelComparator implements Comparator<FlowCellChannel>, Serializable {
    public int compare(FlowCellChannel o1, FlowCellChannel o2) {
      return o1.getNumber().compareTo(o2.getNumber());
    }
  }