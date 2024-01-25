package hci.gnomex.utility;

import hci.gnomex.model.Sample;

import java.io.Serializable;
import java.util.Comparator;

 public class SampleNumberComparator implements Comparator, Serializable {
    public int compare(Object o1, Object o2) {
      Sample s1 = (Sample)o1;
      Sample s2 = (Sample)o2;
      
      String[] tokens1 = s1.getNumber().split("X");
      String number1 = tokens1[tokens1.length - 1];

      String[] tokens2 = s2.getNumber().split("X");
      String number2 = tokens2[tokens2.length - 1];
      
      Integer multiplexKey1 = s1.getMultiplexGroupNumber() != null ? s1.getMultiplexGroupNumber() : Integer.valueOf(-1);
      Integer multiplexKey2 = s2.getMultiplexGroupNumber() != null ? s2.getMultiplexGroupNumber() : Integer.valueOf(-1);

      if (multiplexKey1.equals(multiplexKey2)) {
        return Integer.valueOf(number1).compareTo(Integer.valueOf(number2));
      } else {
        return multiplexKey1.compareTo(multiplexKey2);
      }
      
    }
  }