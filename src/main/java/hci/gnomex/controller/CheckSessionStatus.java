package hci.gnomex.controller;

/**
 * The front controller for the test application
 *
 * @author Bin Yu
 * @created August 17, 2002
 */

import org.hibernate.Session;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Timestamp;
import java.util.Date;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.PropertyDictionaryHelper;
import hci.gnomex.utility.Util;

public class CheckSessionStatus extends HttpServlet {

    /**
     * Initialize global variables
     *
     * @throws ServletException Description of the Exception
     */
    public void init() throws ServletException {

    }


    /**
     * Process the HTTP Get request
     *
     * @param request  Description of the Parameter
     * @param response Description of the Parameter
     * @throws ServletException Description of the Exception
     * @throws IOException      Description of the Exception
     */
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
    }

    /**
     * Process the HTTP Post request
     *
     * @param request  Description of the Parameter
     * @param response Description of the Parameter
     * @throws ServletException Description of the Exception
     * @throws IOException      Description of the Exception
     */
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // get the users session
        String xmlResult;
        if (!request.isRequestedSessionIdValid()) {
            xmlResult = "<data><sa exists='false' lastAccessedTime='-1' inactiveTime='-1' currentTime='-1' "
                    + "sessionMaxInActiveTime='0' kiosk='true' /></data>";
//      LOG.debug("Session is not valid anymore");
        } else {
            HttpSession session = request.getSession();
            if (session == null || session.isNew()) {
                xmlResult = "<data><sa exists='false' lastAccessedTime='-1' inactiveTime='-1' currentTime='-1' "
                        + "sessionMaxInActiveTime='0' />"
                        + "</data>";
            } else {
                Long slac = (Long) session.getAttribute("lastGNomExAccessTime");
                long lastTime;
                if (slac == null)
                    lastTime = session.getLastAccessedTime();
                else
                    lastTime = slac.longValue();

                xmlResult = "<data>"
                        + "<sa exists='true' "
                        + "lastAccessedTime='" + lastTime + "' "
                        + "currentTime='" + new Date().getTime() + "' "
                        + "sessionMaxInActiveTime='" + request.getSession().getMaxInactiveInterval() + "' ";

                String temp = "";
                xmlResult += temp + "/>"
                        + "</data>";


 /*
                Session hybSession = null;
                try {
                    hybSession = HibernateSession.currentSession("guest");

                    String updateAccounts = PropertyDictionaryHelper.getInstance(hybSession).getProperty(PropertyDictionary.AUTOUPDATE_ACCOUNTS);

                    if (updateAccounts != null && updateAccounts.equalsIgnoreCase("y")) {
                        temp = "billingAccountsLatestChange='"
                                + hybSession.getNamedQuery("getLatestBillingAccountChange").uniqueResult()
                                + "' ";
                    }
                } catch (Exception e) {
                    // Logging disabled due to high number of calls
                } finally {
                    if (hybSession != null) {
                        try {
                            HibernateSession.closeSession();
                        } catch (Exception e) {
//              LOG.error("An error occurred in CheckSessionStatus", e);
                        }
                    }
                }


                xmlResult += temp + "/>"
                        + "</data>";
*/
            }
        }
        String jsonResult = Util.xmlToJson(xmlResult);
        response.setContentType("text/html; charset=UTF-8");
        PrintWriter out = response.getWriter();
        out.println(jsonResult);
        out.close();
    }
}
