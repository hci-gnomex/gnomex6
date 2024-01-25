package hci.gnomex.utility;

import javax.servlet.http.HttpServletRequest;
import java.io.Serializable;
//import org.hibernate.Session;

public class JspHelper implements Serializable {

  public static Integer getIdCoreFacility(HttpServletRequest request) {
    String idCoreAsString = (String)((request.getParameter("idCore") != null)?request.getParameter("idCore"):"");
    Integer idCoreFacility = null;
    try {
      idCoreFacility = Integer.valueOf(idCoreAsString);
    } catch(NumberFormatException ex) {
      idCoreFacility = null;
    }
    
    return idCoreFacility;
  }

  public static Integer getIdFacility(HttpServletRequest request) {
    String idFacilityAsString = (String)((request.getParameter("idFacility") != null)?request.getParameter("idFacility"):"");
    Integer idFacility = null;
    try {
      idFacility = Integer.valueOf(idFacilityAsString);
    } catch(NumberFormatException ex) {
      idFacility = null;
    }

    return idFacility;
  }
}
