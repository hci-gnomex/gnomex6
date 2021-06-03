package hci.gnomex.controller;

import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.utility.HibernateSession;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.json.Json;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Properties;

public class GetLoginProperties extends HttpServlet {

    private static Logger LOG = Logger.getLogger(GetLoginProperties.class);

    // Properties file keys
    private static final String IKEY = "ikey";
    private static final String SKEY = "skey";
    private static final String HOST = "host";
    private static final String AKEY = "akey";

    private Properties duoProperties;


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
            if (noPublicAccessProp == null || !noPublicAccessProp.getPropertyValue().equals("Y")) {
                noPublicAccess = false;
            }

            boolean useDuo = false;
            PropertyDictionary useDuoProp = (PropertyDictionary) sess.createQuery("from PropertyDictionary p where p.propertyName='" + PropertyDictionary.USEDUO + "'").uniqueResult();
            if (useDuoProp != null && useDuoProp.getPropertyValue().equalsIgnoreCase("Y")) {
                useDuo = true;
            }

            String duoExceptions = "none";
            if (useDuo) {
                PropertyDictionary duoExceptionsProp = (PropertyDictionary) sess.createQuery("from PropertyDictionary p where p.propertyName='" + PropertyDictionary.DUOEXCEPTIONS + "'").uniqueResult();
                if (duoExceptionsProp != null) {
                    duoExceptions = duoExceptionsProp.getPropertyValue();
                }
            }

            String useDuostr = "no";
            if (useDuo) {
                useDuostr = "yes";
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

            String ikey = "";
            String skey = "";
            String akey = "";
            String duoHost = "";

            if (useDuo) {
                try {
                    duoProperties = getDuoProperties();
                } catch (Exception e) {
                    System.out.println("[GetLoginProperties TwoFactorAuth] ERROR: " + e);
                    throw new ServletException(e);
                }

                ikey = duoProperties.getProperty(IKEY);
                skey = duoProperties.getProperty(SKEY);
                akey = duoProperties.getProperty(AKEY);
                duoHost = duoProperties.getProperty(HOST);


            } // end of useDuo if


            String jsonResult = Json.createObjectBuilder()
                    .add("result", "SUCCESS")
                    .add(PropertyDictionary.DISABLE_USER_SIGNUP, disableUserSignup)
                    .add(PropertyDictionary.NO_GUEST_ACCESS, noGuestAccess)
                    .add("useduo",useDuostr)
                    .add("ikey", ikey)
                    .add("skey", skey)
                    .add("akey", akey)
                    .add("duohost", duoHost)
                    .add(PropertyDictionary.DUOEXCEPTIONS, duoExceptions)
                    .add(PropertyDictionary.NO_PUBLIC_VISIBILITY, noPublicAccess)
                    .add(PropertyDictionary.MAINTENANCEMODE, maintenanceMode)
                    .add(PropertyDictionary.MAINTENANCE_SPLASH, maintenanceSplash)
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

    private static Properties getDuoProperties() throws FileNotFoundException, IOException, DuoPropertyException {
        Properties duoProperties = new Properties();
        duoProperties.load(new FileInputStream("/properties/duo.properties"));

        if (!duoProperties.containsKey(IKEY)) {
            throw new DuoPropertyException("ikey is a required property");
        }
        if (!duoProperties.containsKey(SKEY)) {
            throw new DuoPropertyException("skey is a required property");
        }
        if (!duoProperties.containsKey(AKEY)) {
            throw new DuoPropertyException("akey is a required property");
        }
        if (!duoProperties.containsKey(HOST)) {
            throw new DuoPropertyException("host is a required property");
        }

        return duoProperties;
    }
}
    final class DuoPropertyException extends Exception {
        public DuoPropertyException(String message) {
            super(message);
        }

    }

