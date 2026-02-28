package hci.framework.model;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.ParsePosition;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.GregorianCalendar;

/**
 *@author     khenrie
 *@created    August 16, 2002
 *
 *  A Class that implements several string formatting
 *  methods, it is used primarily in a JSP to display fields from the
 *  DetailObject. If the input is null or not valid, the result will be an
 *  empty string.
 */
public class FieldFormatter {

  // phone output possibilities
  /**
   *  Output of (###) ###-####
   */
  public final static int PHONE_OUTPUT_AREA_CODE_PARENS = 0;
  /**
   *  Output of ### ###-####
   */
  public final static int PHONE_OUTPUT_AREA_CODE_NO_PARENS = 1;
  /**
   *  Output of ###-####
   */
  public final static int PHONE_OUTPUT_NO_AREA_CODE = 2;

  // Date output possibilities
  /**
   * Unknown or unset output
   */
  public final static int DATE_OUTPUT_UNKNOWN = -1;

  /**
   *  Output of yyyy-MM-dd                from formatDate()
   *            yyyy-MM-dd HH:mm:ss       from formatDateTime()
   *            yyyy-MM-dd HH:mm:ss.sss   from formatTimestamp()
   */
  public final static int DATE_OUTPUT_SQL = 0;

  /**
   *  Output of MM-dd-yyyy                from formatDate()
   *            MM-dd-yyyy HH:mm:ss       from formatDateTime()
   *            MM-dd-yyyy HH:mm:ss.sss   from formatTimestamp()
   */
  public final static int DATE_OUTPUT_DASH = 1;

  /**
   *  Output of MM/dd/yyyy                from formatDate()
   *            MM/dd/yyyy HH:mm:ss       from formatDateTime()
   *            MM/dd/yyyy HH:mm:ss.sss   from formatTimestamp()
   */
  public final static int DATE_OUTPUT_SLASH = 2;

  /**
   *  Output of MM-dd-yy                from formatDate()
   *            MM-dd-yy HH:mm:ss       from formatDateTime()
   *            MM-dd-yy HH:mm:ss.sss   from formatTimestamp()
   */
  public final static int DATE_OUTPUT_DASH_SHORT = 3;

  /**
   *  Output of MM/dd/yy                from formatDate()
   *            MM/dd/yy HH:mm:ss       from formatDateTime()
   *            MM/dd/yy HH:mm:ss.sss   from formatTimestamp()
   */
  public final static int DATE_OUTPUT_SLASH_SHORT = 4;

  /**
   *  Output of yyyyMMdd              from formatDate()
   *            yyyyMMddTHHmmss       from formatDateTime()
   *            yyyyMMddTHHmmss       from formatTimestamp()
   */
  public final static int DATE_OUTPUT_ALTIO = 5;

  /**
   *  Output of yyyyMMdd              from formatDate()
   *            yyyyMMddTHHmmss       from formatDateTime()
   *            yyyyMMddTHHmmss       from formatTimestamp()
   */
  public final static int DATE_OUTPUT_DASH_12 = 6;


  /**
   *  Constructor for the FieldFormatter object
   */
  public FieldFormatter() { }

  public static void main(String[] args) {
    System.out.println("Test me, please.");
  }
  
  /**
   *  Converts a valid date string entry (MM/DD/YYYY, MM-DD-YYYY, or MMDDYYYY)
   *  to the desired output format (static fields of this class)
   *
   *@param  dateString   Input String
   *@param  outputStyle  The desired output style (static fields of this class)
   *@return              Formatted output String or an empty string if the input is not valid
   */
  public String formatDate(String dateString, int outputStyle) {
    String result = "";
    java.sql.Date resultDate = parseDate(dateString);
    result = formatDate(resultDate, outputStyle);

    return result;
  }

  /**
   *  Converts a valid date string entry (MM/DD/YYYY, MM-DD-YYYY, or MMDDYYYY)
   *  to the desired output format (static fields of this class)
   *
   *@param  dateString   Input java.util.Date
   *@return              Formatted output String or an empty string if the input is not valid
   */
  public String formatDate(java.util.Date date) {
    String result = "";
    result = formatDate(date, FieldFormatter.DATE_OUTPUT_SLASH);
    return result;
  }
  
  /**
   *  Converts a valid date string entry (MM/DD/YYYY, MM-DD-YYYY, or MMDDYYYY)
   *  to the desired output format (static fields of this class)
   *
   * ** This method is here just to provide backward compatibility for projects
   * using the Hibernate2Utils.jar compiled prior to 5/5/05. For some reason the
   * signature for java.sql.Date is not recognized as matching java.util.Date, so
   * this forces the conversion. When projects have been moved to the latest jars,
   * we should be able to remove this method signature if we want.
   *
   *@param  dateString   Input String
   *@param  outputStyle  The desired output style (static fields of this class)
   *@return              Formatted output String or an empty string if the input is not valid
   */
  public String formatDate(java.sql.Date inputDate, int outputStyle) {
  	String result = "";
  	java.util.Date resultDate = inputDate;
  	result = formatDate(resultDate, outputStyle);
  	
  	return result;
  }
  
  /**
   *  Converts a valid Date input to the desired output format (static fields of this class)
   *
   *@param  inputDate     Input Date
   *@param  outputStyle  The desired output format (static fields of this class)
   *@return               A formatted date String or an empty String if the input is not valid
   */
  public String formatDate(java.util.Date inputDate, int outputStyle) {
    String result = "";

    if (inputDate != null) {
      if (outputStyle == FieldFormatter.DATE_OUTPUT_SQL) {
        result = new SimpleDateFormat("yyyy-MM-dd").format(inputDate);
      }
      else if (outputStyle == FieldFormatter.DATE_OUTPUT_DASH) {
        result = new SimpleDateFormat("MM-dd-yyyy").format(inputDate);
      }
      else if (outputStyle == FieldFormatter.DATE_OUTPUT_SLASH) {
        result = new SimpleDateFormat("MM/dd/yyyy").format(inputDate);
      }
      else if (outputStyle == FieldFormatter.DATE_OUTPUT_DASH_SHORT) {
        result = new SimpleDateFormat("MM-dd-yy").format(inputDate);
      }
      else if (outputStyle == FieldFormatter.DATE_OUTPUT_SLASH_SHORT) {
        result = new SimpleDateFormat("MM/dd/yy").format(inputDate);
      }
      else if (outputStyle == FieldFormatter.DATE_OUTPUT_ALTIO) {
        result = new SimpleDateFormat("yyyyMMdd").format(inputDate);
      }
      else if (outputStyle == FieldFormatter.DATE_OUTPUT_DASH_12) {
        result = new SimpleDateFormat("MM-dd-yyyy").format(inputDate);
      }
      else {
        result = inputDate.toString();
      }
    }

    return result;
  }

  /**
   *  Converts a valid datetime entry (MM/DD/YYYY, MM-DD-YYYY, or MMDDYYYY) to the desired
   *  output format (static fields of this class)
   *
   *@param  dateString   Input String
   *@param  outputStyle  The desired output style (static fields of this class)
   *@return              Formatted output String or an empty string if the input is not valid
   */
  public String formatDateTime(String dateString, int outputStyle) throws ParseException {
    String result = "";
    java.util.Date resultDate = parseDateTime(dateString);
    result = formatDateTime(resultDate, outputStyle);

    return result;
  }

  /**
   *  Converts a valid Datetime input to the desired output format (static fields of this class)
   *
   *@param  inputDate     Input Date
   *@param  outputStyle  The desired output format (static fields of this class)
   *@return               A formatted date String or an empty String if the input is not valid
   */
  public String formatDateTime(java.util.Date inputDate, int outputStyle) {
    String result = "";

    if (inputDate != null) {
      if (outputStyle == FieldFormatter.DATE_OUTPUT_SQL) {
        result = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(inputDate);
      }
      else if (outputStyle == FieldFormatter.DATE_OUTPUT_DASH) {
        result = new SimpleDateFormat("MM-dd-yyyy HH:mm:ss").format(inputDate);
      }
      else if (outputStyle == FieldFormatter.DATE_OUTPUT_SLASH) {
        result = new SimpleDateFormat("MM/dd/yyyy HH:mm:ss").format(inputDate);
      }
      else if (outputStyle == FieldFormatter.DATE_OUTPUT_DASH_SHORT) {
        result = new SimpleDateFormat("MM-dd-yy HH:mm:ss").format(inputDate);
      }
      else if (outputStyle == FieldFormatter.DATE_OUTPUT_SLASH_SHORT) {
        result = new SimpleDateFormat("MM/dd/yy HH:mm:ss").format(inputDate);
      }
      else if (outputStyle == FieldFormatter.DATE_OUTPUT_ALTIO) {
        result = new SimpleDateFormat("yyyyMMdd'T'HHmmss").format(inputDate);
      }
      else if (outputStyle == FieldFormatter.DATE_OUTPUT_DASH_12) {
        result = new SimpleDateFormat("MM-dd-yyyy h:mm a").format(inputDate);
      }
      else {
        result = inputDate.toString();
      }
    }

    return result;
  }

  /**
   *  Converts a valid timestamp string to a typical output format (MM/dd/yyyy hh:mm:ss a)
   * !This version maintained for backward compatibility!
   *@param  value        Input String
   *@return              Formatted output String or an empty string if the input is not valid
   */
  public String formatTimestamp(String value) throws ParseException {

    String outValue = "";
    java.sql.Timestamp ts = parseTimestamp(value);
    if (ts != null) {
      outValue = formatTimestamp(ts);
    }

    return outValue;
  }

  /**
   * Converts a timestamp entry to a typical output format (MM/dd/yyyy hh:mm:ss a)
   * !This version maintained for backward compatibility!
   *@param  value        Input String
   *@return              Formatted output String or an empty string if the input is not valid
   */
  public String formatTimestamp(java.sql.Timestamp ts) {
      Calendar c = new GregorianCalendar();
      String outValue = null;
      c.setTime(ts);

      if ((c.get(Calendar.HOUR) != 0) || (c.get(Calendar.MINUTE) != 0) || (c.get(Calendar.SECOND) != 0)) {
          SimpleDateFormat sdf = new SimpleDateFormat("MM/dd/yyyy hh:mm:ss a"); // use ampm for reverse compatibility
          outValue = sdf.format(ts);
      } else {
          SimpleDateFormat sdf = new SimpleDateFormat("MM/dd/yyyy");
          outValue = sdf.format(ts);
      }

      return outValue;
    }

  
    /**
     *  Converts a valid Timestamp input to the desired output format (static fields of this class)
     *
     *@param  ts           Input Timestamp
     *@param  outputStyle  The desired output format (static fields of this class)
     *@return               A formatted date String or an empty String if the input is not valid
     */
  public String formatTimestamp(java.sql.Timestamp ts, int outputStyle) {
  	String result = "";
  	if (ts != null) {
  		if (outputStyle == FieldFormatter.DATE_OUTPUT_SQL) {
  			result = ts.toString(); // use timestamp's default output
  		}
  		else if (outputStyle == FieldFormatter.DATE_OUTPUT_DASH) {
  			//          result = new SimpleDateFormat("MM-dd-yyyy HH:mm:ss").format(ts) + "." + (ts.getNanos()/1000000);
  			result = new SimpleDateFormat("MM-dd-yyyy HH:mm:ss.S").format(ts);
  		}
  		else if (outputStyle == FieldFormatter.DATE_OUTPUT_SLASH) {
  			result = new SimpleDateFormat("MM/dd/yyyy HH:mm:ss.S").format(ts);
  		}
  		else if (outputStyle == FieldFormatter.DATE_OUTPUT_DASH_SHORT) {
  			result = new SimpleDateFormat("MM-dd-yy HH:mm:ss.S").format(ts);
  		}
  		else if (outputStyle == FieldFormatter.DATE_OUTPUT_SLASH_SHORT) {
  			result = new SimpleDateFormat("MM/dd/yy HH:mm:ss.S").format(ts);
  		}
  		else if (outputStyle == FieldFormatter.DATE_OUTPUT_ALTIO) {
  			result = new SimpleDateFormat("yyyyMMdd'T'HHmmss").format(ts);
  		}
      else if (outputStyle == FieldFormatter.DATE_OUTPUT_DASH_12) {
        result = new SimpleDateFormat("MM-dd-yyyy HH:mm:ss.S").format(ts);
      }
  		else {
  			result = formatTimestamp(ts);
  		}
  	}
  	
  	return result;
  }

  /**
   *  Converts a valid Timestamp input to the desired output format (static fields of this class)
   *
   *@param  date           Input java.util.Date
   *@param  outputStyle  The desired output format (static fields of this class)
   *@return               A formatted date String or an empty String if the input is not valid
   */
public String formatTimestamp(java.util.Date date, int outputStyle) {
	String result = "";
	if (date != null) {
		Timestamp timestamp = new Timestamp(date.getTime());
		result = this.formatTimestamp(timestamp,outputStyle);
	}
	return result;
}
  
    /**
     *  Parses a valid date entry (MM/DD/YYYY, MM-DD-YYYY, or MMDDYYYY) to java.sql.Date
     *
     *@param  dateString   Input String
     *@result              java.sql.Date object or null if the input is not valid
     */
    public java.sql.Date parseDate(String dateString) {
      java.sql.Date result;
      ParsePosition pos = new ParsePosition(0);
      result = this.parseDate(dateString, pos);

      return result;
    }

    /**
     *  Parses a valid date string (MM/DD/YYYY, MM-DD-YYYY, or MMDDYYYY) to java.sql.Date,
     *  starting at pos and updating pos to next character after matched data.
     *
     *@param  dateString   Input String
     *@param  pos          The position to begin parsing, updated to char after matched data
     *@result              java.sql.Date object or null if the input is not valid
     */
    public java.sql.Date parseDate(String dateString, ParsePosition pos) {
      java.sql.Date result = null;

      String charLess = this.stripChar(dateString, '-');
      charLess = this.stripChar(charLess, '/');
      charLess = this.stripChar(charLess, ' ');
      charLess = this.stripChar(charLess, 'T');
      charLess = this.stripChar(charLess, ':');
      charLess = this.stripChar(charLess, '.');
      charLess = this.stripChar(charLess, 'A');
      charLess = this.stripChar(charLess, 'a');
      charLess = this.stripChar(charLess, 'P');
      charLess = this.stripChar(charLess, 'p');
      charLess = this.stripChar(charLess, 'M');
      charLess = this.stripChar(charLess, 'm');

      if (dateString != null && dateString.length() > 7 && this.isNumericString(charLess)) {
        try {
          SimpleDateFormat sdf = new SimpleDateFormat();
          sdf.setLenient(false);

          if (dateString.indexOf("-", pos.getIndex()) != -1 && dateString.indexOf("T", pos.getIndex()) == -1) {
            if (dateString.indexOf("-", pos.getIndex()) > 3) {
              // try the sql format yyyy-MM-dd
              sdf.applyPattern("yyyy-MM-dd");
              result = new java.sql.Date(sdf.parse(dateString, pos).getTime());
            } else {
              // we have a date in the format of MM-dd-yyyy
              sdf.applyPattern("MM-dd-yyyy");
              result = new java.sql.Date(sdf.parse(dateString, pos).getTime());
            }
          }
          else if (dateString.indexOf("/") != -1) {
            // we have a date in the format of MM/dd/yyyy
            sdf.applyPattern("MM/dd/yyyy");
            result = new java.sql.Date(sdf.parse(dateString, pos).getTime());
          }
          else if (dateString.indexOf("T") == 8) {
            // this is an Altio date
            sdf.applyLocalizedPattern("yyyyMMdd");
            result = new java.sql.Date(sdf.parse(dateString, pos).getTime());
          }
          else {
            // we could have a valid date in the form of MMddyyyy
            sdf.applyPattern("MMddyyyy");
            result = new java.sql.Date(sdf.parse(dateString, pos).getTime());
          }

        } catch (Exception e) {
          // ignore, not critical
          return null;
        }
      }

      return result;
    }

    /**
     *  Parses a valid datetime entry (MM/DD/YYYY HH:MM:SS, MM-DD-YYYY HH:MM:SS,
     *  or MMDDYYYY HH:MM:SS) to java.util.Date
     *
     *@param  dateString   Input String
     *@param  pos          The position to begin parsing, updated to char after matched data
     *@result              java.util.Date obj or null if the input is not valid
     */
    public java.util.Date parseDateTime(String value) throws ParseException {

      java.util.Date date = null;
      ParsePosition pos = new ParsePosition(0);

      if ((value.indexOf(" ") > 0) || (value.indexOf("T") > 0)) {
        String dateValue = null;
        String timeValue = "";
        try {
          java.sql.Date dateOnly = this.parseDate(value, pos);
          dateValue = this.formatDate(dateOnly, FieldFormatter.DATE_OUTPUT_SLASH);
          if (value.length() > pos.getIndex()) {
            timeValue = value.substring(pos.getIndex());
            if (timeValue.charAt(0) == ' ' || timeValue.charAt(0) == 'T') {
              timeValue = timeValue.substring(1);
            }
            if (timeValue.equals("")) timeValue = "00:00:00";
          }
          value = dateValue + " " + timeValue;

          SimpleDateFormat sdf = new SimpleDateFormat("MM/dd/yyyy HH:mm:ss"); // should be close to this now
          if (timeValue.toLowerCase().indexOf("am") > 0 || timeValue.toLowerCase().indexOf("pm") > 0) {
            if (timeValue.indexOf(":",timeValue.indexOf(":")+1) < 0) { // no seconds
              sdf.applyPattern("MM/dd/yyyy hh:mm a");
            }
            else {
              sdf.applyPattern("MM/dd/yyyy hh:mm:ss a");
            }
          	if (timeValue.indexOf('.') != -1) {
          		sdf.applyPattern("MM/dd/yyyy hh:mm:ss.S a");
          	}
          } else if (timeValue.indexOf('.') > 0) {
          	sdf.applyPattern("MM/dd/yyyy HH:mm:ss.S"); // if there is millisecond protion present
          }
          if (timeValue.indexOf(":") == -1) {
          	sdf.applyPattern("MM/dd/yyyy HHmmss"); // altio's default fmt - don't know what to do with the '--7' on end, though
          }
          sdf.setLenient(true); // but be lenient to pick up diff time formats

          date = sdf.parse(value); // try to get actual date/time

        } catch (Exception e) {
          throw new ParseException(e.toString(), 0);
        }
      }
      else {
        date = this.parseDate(value);
      }
      return date;
    }

    /**
     *  Parses a valid timestamp entry (same as java.util.Date, or JDBC escape fmt)
     *  to java.sql.Timestamp
     *
     *@param  dateString   Input String
     *@param  pos          The position to begin parsing, updated to char after matched data
     *@result              java.sql.Timestamp obj or null if the input is not valid
     */
    public java.sql.Timestamp parseTimestamp(String value) throws ParseException {

      java.sql.Timestamp timestamp = null;
      ParsePosition pos = new ParsePosition(0);

      try {
        timestamp = java.sql.Timestamp.valueOf(value); // try the jdbc escape format first
      } catch (Exception ex) {
        // if not jdbc escape format, then parse as for datetime (java.util.Date)
        java.util.Date tmpDate = parseDateTime(value);
        if (tmpDate != null) {
          timestamp = new java.sql.Timestamp(tmpDate.getTime());
        }
      }
      return timestamp;
    }

  /**
   *  Converts a valid phone entry (###-###, ###-###-####, (###) ###-####, ##### (HCI number),
   *  #######, ##########) to the specified output format (static fields of this class)
   *
   *@param  inputString   Input String
   *@param  outputFormat  The desired output phone format (static fields of this class)
   *@return               The formatted result String or an empty String if the input is not valid
   */
  public String formatPhone(String inputString, int outputFormat) {
    String result = "";

    if (inputString != null) {
      // strip out any valid phone characters
      result = this.stripChar(inputString, '-');
      result = this.stripChar(result, '(');
      result = this.stripChar(result, ')');
      result = this.stripChar(result, ' ');
      result = this.stripChar(result, '.');

      // validate we have a number
      if (!isNumericString(result)) {
        return "";
      }

      boolean hasAreaCode = false;

      // reformat and return according to output format
      if (result.length() == 10) {
        // we have an area code
        hasAreaCode = true;
      }
      else if (result.length() == 7) {
        // we do not have an area code
      }
      else if (result.length() == 5) {
        // we have an internal hci number, prefix it with 58
        result = "58" + result;
      }
      else {
        // we do not have a valid format, return empty string
        return "";
      }

      int dashIndex = result.length() - 4;

      result = result.substring(0, dashIndex) + "-" + result.substring(dashIndex);

      // now format it according to our desired format
      if (outputFormat == FieldFormatter.PHONE_OUTPUT_AREA_CODE_NO_PARENS) {
        if (hasAreaCode) {
          result = result.substring(0, 3) + " " + result.substring(3);
        }
      }
      else if (outputFormat == FieldFormatter.PHONE_OUTPUT_AREA_CODE_PARENS) {
        if (hasAreaCode) {
          result = "(" + result.substring(0, 3) + ") " + result.substring(3);
        }
      }
      else if (outputFormat == FieldFormatter.PHONE_OUTPUT_NO_AREA_CODE) {
        if (hasAreaCode) {
          result = result.substring(3);
        }
      }
    }
    return result;
  }


  /**
   *  Converts a valid SSN String (with or without -'s) to ###-##-####
   *
   *@param  inputSSN  Input String
   *@return           A formatted SSN or an empty String if the input is not valid
   */
  public String formatSSN(String inputSSN) {
    String result = "";

    if (inputSSN != null) {
      // first strip all valid characters
      result = this.stripChar(inputSSN, '-');
      result = this.stripChar(result, ' ');

      if (result.length() != 9 || !this.isNumericString(result)) {
        // not a valid length or is not numeric
        return "";
      }

      result = result.substring(0, 3) + "-" + result.substring(3, 5) + "-" + result.substring(5);

    }

    return result;
  }


  /**
   *  Formats the BigDecimal input adding commas to the output if specified
   *
   *@param  input      A BigDecimal object
   *@param  addCommas  A boolean indicating whether or not to include commas in the output
   *@return            A formatted String representation of the BigDecimal input or an empty string
   */
  public String formatCurrency(BigDecimal input, boolean addCommas) {
    String result = "";

    if (input != null) {
      input = input.setScale(2, BigDecimal.ROUND_HALF_EVEN);

      result = input.toString();

      result = this.stripChar(result, ',');

      if (addCommas && result.length() > 6) {
        for (int i = result.length() - 3; i > 3; ) {
          i -= 3;
          result = result.substring(0, i) + "," + result.substring(i);
        }
      }
    }

    return result;
  }


  /**
   *  Returns an empty string if the input is null
   *
   *@param  input  Input Object
   *@return        A String representation of the input or an empty string if the input is null
   */
  public String getNonNullString(Object input) {
    String result = "";

    if (input != null) {
      result = input.toString();
    }

    return result;
  }

  /**
   *  Returns an empty string if the input is null
   *
   *@param  input  Input Object
   *@return        A String representation of the input or an empty string if the input is null
   */
  public String getNonNullString(String input) {
    String result = "";

    if (input != null) {
      result = input.toString();
    }

    return result;
  }

  /**
   *  Returns an empty string if the input is null
   *
   *@param  input  Input Object
   *@return        A String representation of the input or an empty string if the input is null
   */
  public String getNonNullString(Long input) {
    String result = "";

    if (input != null) {
      result = input.toString();
    }

    return result;
  }

  /**
   *  Returns an empty string if the input is null
   *
   *@param  input  Input Object
   *@return        A String representation of the input or an empty string if the input is null
   */
  public String getNonNullString(Integer input) {
    String result = "";

    if (input != null) {
      result = input.toString();
    }

    return result;
  }

  /**
   *  Returns an empty string if the input is null
   *
   *@param  input  Input Object
   *@return        A String representation of the input or an empty string if the input is null
   */
  public String getNonNullString(BigDecimal input) {
    String result = "";

    if (input != null) {
      result = input.toString();
    }

    return result;
  }

  /**
   *  Returns an empty string if the input is null
   *
   *@param  input  Input Object
   *@return        A String representation of the input or an empty string if the input is null
   */
  public String getNonNullString(java.sql.Date input) {
    String result = "";

    if (input != null) {
      result = input.toString();
    }

    return result;
  }

  /**
   *  Returns an nbsp; string if the input is null or an empty string
   *
   *@param  input  Input String
   *@return        The input String or an nbsp; String if the input is null or empty
   */
  public String getValidTDString(String input) {

    String result = this.getNonNullString(input);

    result = result.trim();

    if (result.length() < 1) {
      result = "&nbsp;";
    }

    return result;
  }


  /**
   *  Tests a string for numeric characters
   *
   *@param  testString  Input String
   *@return             true if the String contains only numbers, false if it contains other characters
   */
  public boolean isNumericString(String testString) {
    boolean result = true;

    if (testString == null) {
      return false;
    }

    try {
      if (Double.isNaN(Double.parseDouble(testString))) {
        // we do not have all numerics, return empty string
        result = false;
      }
    } catch (NumberFormatException nfe) {
      // we do not have all numerics, return empty string
      result = false;
    }

    return result;
  }


  /**
   *  Removes the specified character from the input String
   *
   *@param  input       Input String
   *@param  removeChar  The character to remove from the input
   *@return             The input String with the desired character removed
   */
  public String stripChar(String input, char removeChar) {
    StringBuffer resultBuffer = null;

    if (input != null) {
      resultBuffer = new StringBuffer();
      char[] before = input.toCharArray();

      for (int i = 0; i < before.length; i++) {
        if (before[i] != removeChar) {
          resultBuffer.append(before[i]);
        }
      }

    }

    return resultBuffer.toString();
  }
  
  /**
   * Returns the difference of two dates in days, correct for daylight savings time
   * @param java.sql.Date start
   * @param java.sql.Date end
   * @return Integer
   */
  public Integer getDateDifferenceInDays(java.sql.Date start, java.sql.Date end) {
    int milliesconds_per_day = 1000 * 60 * 60 * 24;
    long diff = 0;
    if (start != null && end != null) {
      Calendar cal1 = Calendar.getInstance();
      Calendar cal2 = Calendar.getInstance();
      cal1.setTime(start);
      cal2.setTime(end);

      long startMilli = cal1.getTimeInMillis() + (cal1.getTimeZone().getOffset(cal1.getTimeInMillis()));
      long endMilli = cal2.getTimeInMillis() + (cal2.getTimeZone().getOffset(cal2.getTimeInMillis()));
      
      diff = (endMilli - startMilli)/milliesconds_per_day;
    }
    return new Integer((int)diff);
  }

}