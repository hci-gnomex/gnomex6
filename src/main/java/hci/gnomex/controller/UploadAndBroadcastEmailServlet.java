package hci.gnomex.controller;

import hci.gnomex.model.AppUser;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.*;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonWriter;

import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.query.Query;

import com.oreilly.servlet.multipart.FilePart;
import com.oreilly.servlet.multipart.MultipartParser;
import com.oreilly.servlet.multipart.ParamPart;
import com.oreilly.servlet.multipart.Part;

public class UploadAndBroadcastEmailServlet extends HttpServlet {

    private static String serverName;

    private static final int STATUS_ERROR = 999;
    private static final Logger LOG = Logger.getLogger(UploadAndBroadcastEmailServlet.class);

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        doPost(req, res);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        // Restrict commands to local host if request is not secure
        if (!ServletUtil.checkSecureRequest(req)) {
            ServletUtil.reportServletError(res, "Secure connection is required. Prefix your request with 'https'");
            return;
        }

        try {
            String subject = "GNomEx announcement";
            String fromAddress = "";
            StringBuffer body = null;
            String format = "text";

            serverName = req.getServerName();
            Session sess = HibernateSession.currentReadOnlySession((req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest"));

            // Get the dictionary helper
            DictionaryHelper dh = DictionaryHelper.getInstance(sess);

            // Get security advisor
            SecurityAdvisor secAdvisor = (SecurityAdvisor) req.getSession().getAttribute(SecurityAdvisor.SECURITY_ADVISOR_SESSION_KEY);
            if (secAdvisor == null) {
                System.out.println("UploadAndBroadcaseEmailServlet:  Warning - unable to find existing session. Creating security advisor.");
                secAdvisor = SecurityAdvisor.create(sess, (req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest"));
            }

            if (secAdvisor == null) {
                System.out.println("UploadAndBroadcaseEmailServlet: Error - Unable to find or create security advisor.");
                throw new ServletException("Unable to upload analysis file.  Servlet unable to obtain security information. Please contact GNomEx support.");
            }

            // Only gnomex admins can send broadcast emails
            if (!secAdvisor.hasPermission(SecurityAdvisor.CAN_ACCESS_ANY_OBJECT)) {
                throw new ServletException("Insufficent permissions");
            }

            // Get a list of all active users with email accounts for selected cores.
            String appUserQueryString = "SELECT DISTINCT a from AppUser a join a.labs l join l.coreFacilities c "
                    + " where a.isActive = 'Y' and a.email is not NULL and a.email != '' and c.idCoreFacility in (:ids) ORDER BY a.lastName, a.firstName ";
            ArrayList<Integer> coreIds = new ArrayList<>();

            if (req.getParameter("coreFacilityIds") != null && !req.getParameter("coreFacilityIds").equals("")) {
                String idsFromReq = req.getParameter("coreFacilityIds");
                coreIds.addAll(this.parseCoreFacilityIDs(idsFromReq));
            } else {
                coreIds.add(-1);
            }

            if (req.getParameter("body") != null && !req.getParameter("body").equals("")) {

                body = new StringBuffer(req.getParameter("body"));

                if (req.getParameter("subject") != null && !req.getParameter("subject").equals("")) {
                    subject = req.getParameter("subject");
                }
                if (req.getParameter("fromAddress") != null && !req.getParameter("fromAddress").equals("")) {
                    fromAddress = req.getParameter("fromAddress");
                }
                if (req.getParameter("format") != null && !req.getParameter("format").equals("")) {
                    format = req.getParameter("format");
                }

            } else {
                MultipartParser mp = new MultipartParser(req, Integer.MAX_VALUE);
                Part part;
                while ((part = mp.readNextPart()) != null) {
                    String name = part.getName();
                    if (part.isParam()) {
                        // it's a parameter part
                        ParamPart paramPart = (ParamPart) part;
                        String value = paramPart.getStringValue();

                        if (name.equals("format")) {
                            format = value;
                        } else if (name.equals("subject")) {
                            subject = value;
                        } else if (name.equals("fromAddress")) {
                            fromAddress = value;
                        } else if (name.equals("coreFacilityIds")) {
                            coreIds.clear();
                            coreIds.addAll(this.parseCoreFacilityIDs(value));
                        }

                    } else if (part.isFile()) {
                        FilePart filePart = (FilePart) part;
                        InputStream is = filePart.getInputStream();

                        if (is == null) {
                            throw new ServletException("Empty input stream.");
                        }

                        String line;
                        body = new StringBuffer();
                        try {
                            BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
                            while ((line = reader.readLine()) != null) {
                                body.append(line).append("\n");
                            }
                        } finally {
                            is.close();
                        }
                    }
                }

            }

            Query appUserQuery = sess.createQuery(appUserQueryString);
            appUserQuery.setParameterList("ids", coreIds);
            List appUsers = appUserQuery.list();

            JsonObjectBuilder jsonResult = null;
            JsonArrayBuilder jsonArrayInvalidEmails = Json.createArrayBuilder();

            int userCount = 0;
            if (body != null && body.length() > 0) {

                for (Iterator i = appUsers.iterator(); i.hasNext(); ) {
                    AppUser appUser = (AppUser) i.next();

                    String emailRecipients = appUser.getEmail();
                    if (!MailUtil.isValidEmail(emailRecipients)) {
                        JsonObject jsonObjectValidEmail = Json.createObjectBuilder()
                                          .add("idAppUser", appUser.getIdAppUser())
                                          .add("email", emailRecipients)
                                          .build();
                        jsonArrayInvalidEmails.add(jsonObjectValidEmail);
                        continue;
                    }

                    // Email app user
                    if (!MailUtil.isValidEmail(fromAddress)) {
                        fromAddress = DictionaryHelper.getInstance(sess).getPropertyDictionary(
                                PropertyDictionary.GENERIC_NO_REPLY_EMAIL);
                    }

                    MailUtilHelper helper = new MailUtilHelper(emailRecipients, fromAddress, subject, body.toString(), null, format.equalsIgnoreCase("HTML"), dh, serverName);
                    helper.setRecipientAppUser(appUser);
                    MailUtil.validateAndSendEmail(helper);

                    userCount++;

                }

            }

            res.setHeader("Cache-Control", "max-age=0, must-revalidate");
            res.setStatus(HttpServletResponse.SC_ACCEPTED);
            res.setContentType("application/json; charset=UTF-8");
            jsonResult = Json.createObjectBuilder()
                       .add("result", "SUCCESS")
                       .add("userCount", "" + userCount)
                       .add("InvalidEmails", jsonArrayInvalidEmails.build());

            JsonWriter jsonWriter = Json.createWriter(res.getOutputStream());
            jsonWriter.writeObject(jsonResult.build());
            jsonWriter.close();

        } catch (ServletException e) {
            LOG.error("An exception has occurred in UploadAndBroadcastEmailServlet ", e);
            res.addHeader("message", e.getMessage());
            res.setContentType("application/json; charset=UTF-8");

            JsonObject jsonResultError = Json.createObjectBuilder()
                                             .add("result", "ERROR")
                                             .add("message", e.getMessage())
                                             .build();
            JsonWriter jsonWriter = Json.createWriter(res.getOutputStream());
            jsonWriter.writeObject(jsonResultError);
            jsonWriter.close();

        } catch (Exception e) {
            LOG.error("An exception has occurred in UploadAndBroadcastEmailServlet ", e);
            res.setStatus(STATUS_ERROR);

            throw new ServletException("Unable to send broadcast email due to a server error.  Please contact GNomEx support.");
        } finally {
            try {
                HibernateSession.closeSession();
            } catch (Exception e1) {
                LOG.error("An exception has occurred in UploadAndBroadcastEmailServlet ", e1);
            }
        }
    }

    private Set<Integer> parseCoreFacilityIDs(String value) {
        Set<Integer> parsedIDs = new HashSet<>();
        if (!value.contains(",")) {
            parsedIDs.add(Integer.parseInt(value));
        } else {
            for (String id : value.split(",")) {
                parsedIDs.add(Integer.parseInt(id));
            }
        }
        return parsedIDs;
    }

}
