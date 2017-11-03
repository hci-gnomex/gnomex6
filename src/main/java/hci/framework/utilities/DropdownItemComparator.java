package hci.framework.utilities;

import java.io.Serializable;
import java.util.Comparator;

/**
 * Title:        HCI Application Framework
 * Description:  A collection of classes for developing HTML based enterprise applications
 * Copyright:    Copyright (c) 2001
 * Company:      HCI Informatics
 * @author Kirt Henrie
 * @version 1.0
 */

public class DropdownItemComparator implements Comparator, Serializable {

  public DropdownItemComparator() {
  }

  public int compare(Object one, Object two) {
    // a 1 sorts the table according to the query in the dropdown reload method
    int result = 1;

    return result;
  }
}