package hci.gnomex.controller;

import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.PropertyDictionaryHelper;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.json.Json;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

public class GetLoginProperties extends HttpServlet {

    private static Logger LOG = Logger.getLogger(GetLoginProperties.class);

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            Session sess = HibernateSession.currentReadOnlySession("guest");

            // Determine if user sign up screen is enabled
            boolean disableUserSignup = false;
            PropertyDictionary disableUserSignupProp = (PropertyDictionary) sess.createQuery("from PropertyDictionary p where p.propertyName='" + PropertyDictionary.DISABLE_USER_SIGNUP + "'").uniqueResult();
            if (disableUserSignupProp != null && disableUserSignupProp.getPropertyValue().equals("Y")) {
                disableUserSignup = true;
            }

            // Determine if guest access is allowed
            boolean noGuestAccess = true;
            PropertyDictionary noGuestAccessProp = (PropertyDictionary) sess.createQuery("from PropertyDictionary p where p.propertyName='" + PropertyDictionary.NO_GUEST_ACCESS + "'").uniqueResult();
            if (noGuestAccessProp == null || !noGuestAccessProp.getPropertyValue().equals("Y")) {
                noGuestAccess = false;
            }

            boolean noPublicAccess = true;
            PropertyDictionary noPublicAccessProp = (PropertyDictionary) sess.createQuery("from PropertyDictionary p where p.propertyName='" + PropertyDictionary.NO_PUBLIC_VISIBILITY + "'").uniqueResult();
            if(noPublicAccessProp == null || !noPublicAccessProp.getPropertyValue().equals("Y")){
                noPublicAccess = false;
            }

            boolean maintenanceMode = false;
            String maintenanceSplash = "";
            PropertyDictionary maintenanceModeProp = (PropertyDictionary) sess.createQuery("from PropertyDictionary p where p.propertyName='" + PropertyDictionary.MAINTENANCEMODE + "'").uniqueResult();
            if (maintenanceModeProp != null && maintenanceModeProp.getPropertyValue().equalsIgnoreCase("YES")) {
                maintenanceMode = true;

                // then you can't do much else
                disableUserSignup = true;
                noGuestAccess = true;

                PropertyDictionary maintenanceSplashProp = (PropertyDictionary)
                sess.createQuery(
                        "from PropertyDictionary p where p.propertyName='"
                            + PropertyDictionary.MAINTENANCE_SPLASH
                            + "'")
                    .uniqueResult();
                if (maintenanceSplashProp != null) {
                    maintenanceSplash = maintenanceSplashProp.getPropertyValue();
                }
            }


            String jsonResult = Json.createObjectBuilder()
                    .add("result", "SUCCESS")
                    .add(PropertyDictionary.DISABLE_USER_SIGNUP, disableUserSignup)
                    .add(PropertyDictionary.NO_GUEST_ACCESS, noGuestAccess)
                    .add(PropertyDictionary.NO_PUBLIC_VISIBILITY,noPublicAccess)
                    .add(PropertyDictionary.MAINTENANCEMODE,maintenanceMode)
                    .add(PropertyDictionary.MAINTENANCE_SPLASH,maintenanceSplash)
                    .build()
                    .toString();

            response.setContentType("application/json; charset=UTF-8");
            try (PrintWriter out = response.getWriter()) {
                out.print(jsonResult);
                out.flush();
            }
        } catch (Exception e) {
            LOG.error("Error in GetLoginProperties", e);
        } finally {
            try {
                HibernateSession.closeSession();
            } catch (Exception e) {
                LOG.error("Error in GetLoginProperties", e);
            }
        }
    }

}
