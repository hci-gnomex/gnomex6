package hci.framework.utilities;
import hci.framework.model.DetailObject;
import hci.framework.model.FieldInputValidator;
import hci.gnomex.utility.HttpServletWrappedRequest;

import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.lang.reflect.Method;
import java.text.ParseException;

import javax.servlet.http.HttpServletRequest;

/**
 *  A class that loads a DetailObject from an HttpServletRequest and does the
 *  conversions from the string to the valid type in the DetailObject (calls
 *  the appropriate setters).
 *
 *@author     Kirt Henrie
 *@created    April 16, 2002
 */
public class DetailLoader extends FieldInputValidator implements Serializable {

  /**
   *  Constructor for the DetailLoader object
   */
  public DetailLoader() { }


  /**
   *  Handles the conversion and populates the DetailObject passed in from the HttpServletRequest
   *  passed in.  If a conversion can not be accomplished the offending field is put into the
   *  HashMap of the DetailObject returned from the method.
   *
   *@param  request  The HttpServletRequest containing the input fields
   *@param  detail   The DetailObject to be populated
   *@return          The processed DetailObject
   */
  public DetailObject loadDetailFromRequest(HttpServletWrappedRequest request, DetailObject detail) {

    Class detailClass = detail.getClass();

    Method[] methods = detailClass.getMethods();

    for (int i = 0; i < methods.length; i++) {
      String methName = methods[i].getName();
      if (methName.substring(0, 3).equals("set")) {
        StringBuffer correctedName = new StringBuffer(methName.substring(3, 4).toLowerCase());
        if (methName.length() > 4) {
          correctedName.append(methName.substring(4));
        }

        String requestedValue = request.getParameter(correctedName.toString());

        if (requestedValue != null && requestedValue.trim().length() > 0) {
          Class argType = methods[i].getParameterTypes()[0];
          String field = correctedName.toString().trim();
          String value = (String) request.getParameter(field);
          Object o = null;
          if (value != null) {
            if (argType == java.sql.Date.class) {
              o = this.parseDate(value);
              if (o == null) {
                detail.addInvalidField(field, "Please enter a valid date in the " + field + " field");
              }
            }
            else if (argType == java.util.Date.class) {
              try {
                o = this.parseDateTime(value);
                if (o == null) {
                  detail.addInvalidField(field, "Please enter a valid date in the " + field + " field");
                }
              }
              catch (ParseException pe) {
                o = null;
                detail.addInvalidField(field, "Please enter a valid date in the " + field + " field");
              }
            }
            else if (argType == String.class) {
              o = value;
            }
            else if (argType == java.math.BigDecimal.class) {
              value = this.stripChar(value, ',');
              try {
                o = new java.math.BigDecimal(value);
              } catch (NumberFormatException nfe) {
                o = null;
                // put invalid value in invalid fields hashmap
                detail.addInvalidField(field, "Please enter a numeric value in the " + field + " field");
              }
            }
            else if (argType == java.lang.Integer.class) {
              if (value != null) {
                try {
                  if (value.equals("0")) {
                    o = new java.lang.Integer(0);
                  }
                  else {
                    o = new java.lang.Integer(value);
                  }
                } catch (NumberFormatException nfe) {
                  o = null;
                  // put invalid value in invalid fields hashmap
                  detail.addInvalidField(field, "Please enter a numeric value in the " + field + " field");
                }
              }
            }
            else if (argType == java.sql.Timestamp.class) {
              try {
                  //value = this.formatTimestamp(value);
                  //o = new java.sql.Timestamp(new java.text.SimpleDateFormat("MM/dd/yyyy HH:mm:ss").parse(value).getTime());
                  o = this.parseTimestamp(value);
              } catch (ParseException pe) {
                  o = null;
                  detail.addInvalidField(field, "The value entered in the " + field + " field is not valid");
              }
            }
            else if (argType == java.lang.Boolean.class) {
            	  try {                     
            		  if (value.equalsIgnoreCase("true") || value.equalsIgnoreCase("yes") || value.equalsIgnoreCase("Y")) {
            			  o = new java.lang.Boolean(true);
            		  } else {
            			  o = new java.lang.Boolean(false);
            		  }            			  
                  } catch (Exception e) {
                      // we must have an invalid value
                      detail.addInvalidField(field, "The value entered in the " + field + " field is not valid");
                  }
            }
            else {
              try {
                o = (argType.getMethod("valueOf", new Class[]{String.class})).invoke(argType, new Object[]{value});
              } catch (Exception e) {
                // we must have an invalid value
                detail.addInvalidField(field, "The value entered in the " + field + " field is not valid");
              }
            }
          }
          else {
            o = null;
          }
          try {
            methods[i].invoke(detail, new Object[]{o});
          } catch (Exception e) {
            e.printStackTrace();
          }
        }
        else if (requestedValue != null && requestedValue.trim().length() == 0) {
          // we have a null value
          try {
            methods[i].invoke(detail, new Object[]{null});
          } catch (Exception e) {
            e.printStackTrace();
          }
        }
      }

    }

    return detail;
  }


  private void writeObject(ObjectOutputStream oos) throws IOException {
    oos.defaultWriteObject();
  }


  private void readObject(ObjectInputStream ois) throws ClassNotFoundException, IOException {
    ois.defaultReadObject();
  }
}
