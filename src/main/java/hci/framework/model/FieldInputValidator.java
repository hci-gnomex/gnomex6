package hci.framework.model;
import java.math.BigDecimal;

/**
 *  Description of the Class
 *
 *@author     Kirt Henrie
 *@created    August 17, 2002
 */
public class FieldInputValidator extends FieldFormatter {

  /**
   *  Constructor for the FieldInputValidator object
   */
  public FieldInputValidator() { }

  /**
   *  Returns a boolean from an input of true (Y), or false (N or any other input)
   *
   *@param  yOrN  A Y or N to be converted to a boolean
   *@return       The result of the conversion or false
   */
  public boolean getBooleanFromYNString(String yOrN) {
    if (yOrN != null && yOrN.equalsIgnoreCase("Y")) {
      return true;
    }
    else {
      return false;
    }
  }


  /**
   *  Returns a Date object converted from the input or null if not valid
   *
   *@param  dateString  A string from a form field
   *@return             Null if not valid, or a valid Date
   */
  public java.sql.Date validateDate(String dateString) {
    java.sql.Date result = null;

    if (dateString != null) {
      // first call the format method on the string
      dateString = this.formatDate(dateString, FieldInputValidator.DATE_OUTPUT_SQL);

      if (dateString.length() > 0) {
        result = java.sql.Date.valueOf(dateString);
      }

    }

    return result;
  }


  /**
   *  Returns an Integer object converted from the input or null if not valid
   *
   *@param  intString  A string representation of a number
   *@return            A converted Integer object or null if not valid
   */
  public Integer validateInteger(String intString) {
    Integer result = null;

    if (intString != null && this.isNumericString(intString)) {
      if (intString.indexOf('.') != -1) {
        return null;
      }
      result = new Integer(intString);
    }

    return result;
  }


  /**
   *  Returns a BigDecimal object converted from the input or null if not valid
   *
   *@param  floatString  A string representation of a float
   *@return              A converted BigDecimal object or null if not valid
   */
  public BigDecimal validateFloat(String floatString) {
    BigDecimal result = null;

    if (floatString != null && this.isNumericString(floatString)) {
      result = new BigDecimal(floatString);
    }

    return result;
  }
}
