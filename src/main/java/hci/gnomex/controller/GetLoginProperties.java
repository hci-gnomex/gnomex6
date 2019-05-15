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

            String jsonResult = Json.createObjectBuilder()
                    .add("result", "SUCCESS")
                    .add(PropertyDictionary.DISABLE_USER_SIGNUP, disableUserSignup)
                    .add(PropertyDictionary.NO_GUEST_ACCESS, noGuestAccess)
                    .build()
                    .toString();

            response.setContentType("application/json");
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
