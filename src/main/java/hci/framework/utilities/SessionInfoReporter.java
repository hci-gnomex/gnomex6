package hci.framework.utilities;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;

import javax.naming.NamingException;
import javax.servlet.http.HttpSession;

/**
 *  A class to report session information back to the caller.
 *
 *@author     Carolyn Ross
 *@created    February 9, 2005
 */
public class SessionInfoReporter implements Serializable {

  /**
   *  Constructor for the DetailLoader object
   */
  public SessionInfoReporter() { }

  /**
   *  Returns session attributes in XML string
   *
   *@return               An xml string
   */
  public String getSessionAttsXML(HttpSession session) throws NamingException {
    String result = "<session_attributes ";
    java.util.Enumeration e = session.getAttributeNames();
    while (e != null && e.hasMoreElements()) {
      String attName = (String) e.nextElement();
      String attVal = (String) session.getAttribute(attName).toString();
      result = result + attName + "=\"" + ((attVal == null) ? "" : attVal) + "\" ";
    }
    result = result + "/>";
    return result;
  }

  private void writeObject(ObjectOutputStream oos) throws IOException {
    oos.defaultWriteObject();
  }


  private void readObject(ObjectInputStream ois) throws ClassNotFoundException, IOException {
    ois.defaultReadObject();
  }
}
