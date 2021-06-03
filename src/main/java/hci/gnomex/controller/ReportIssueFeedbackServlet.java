package hci.gnomex.controller;

import com.oreilly.servlet.multipart.FilePart;
import com.oreilly.servlet.multipart.MultipartParser;
import com.oreilly.servlet.multipart.ParamPart;
import com.oreilly.servlet.multipart.Part;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.*;
import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.hibernate.Session;

import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.Date;

public class ReportIssueFeedbackServlet extends HttpServlet {
    private static String serverName;

    private static final int STATUS_ERROR = 999;
    private static final Logger LOG = Logger.getLogger(ReportIssueFeedbackServlet.class);

    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        doPost(req, res);
    }

    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        // Restrict commands to local host if request is not secure
        if (!ServletUtil.checkSecureRequest(req)) {
            ServletUtil.reportServletError(res, "Secure connection is required. Prefix your request with 'https'");
            return;
        }

        String subject = "Issue Reported";
        String fromAddress = null;
        String body = "Feedback";
        String format = "text";
        String IdAppUser = "";
        String AppUserName = "";
        String UNID = "";
        BufferedImage image;
        File outputfile = null;
        SimpleDateFormat sdf = new SimpleDateFormat();

        try {
            serverName = req.getServerName();
            Date currentDate = new Date(System.currentTimeMillis());
            Session sess = HibernateSession.currentReadOnlySession(req.getUserPrincipal() != null ? req.getUserPrincipal()
                    .getName() : "guest");

            // Get the dictionary helper
            DictionaryHelper dh = DictionaryHelper.getInstance(sess);
            PropertyDictionaryHelper pdh = PropertyDictionaryHelper.getInstance(sess);

            // Get security advisor
            SecurityAdvisor secAdvisor = (SecurityAdvisor) req.getSession().getAttribute(
                    SecurityAdvisor.SECURITY_ADVISOR_SESSION_KEY);
            if (secAdvisor == null) {
                System.out
                        .println("ReportIssueServlet:  Warning - unable to find existing session. Creating security advisor.");
                secAdvisor = SecurityAdvisor.create(sess, (req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest"));
            }

            if (secAdvisor == null) {
                System.out.println("ReportIssueServlet: Error - Unable to find or create security advisor.");
                // 04/05/2021 timM  Don't absolutely have to have the securityAdvisor alive at this point...
//                throw new ServletException(
//                        "Unable to report issue.  Servlet unable to obtain security information. Please contact GNomEx support directly.");
            }
            /*
             * // Only gnomex admins can send broadcast emails if (!secAdvisor .hasPermission(SecurityAdvisor.CAN_ACCESS_ANY_OBJECT)) { throw new
             * ServletException("Insufficent permissions"); }
             */
            MultipartParser mp = new MultipartParser(req, Integer.MAX_VALUE);
            Part part;
            while ((part = mp.readNextPart()) != null) {
                String name = part.getName();
                if (part.isParam()) {
                    // it's a parameter part
                    ParamPart paramPart = (ParamPart) part;
                    String value = paramPart.getStringValue();
                    if (name.equals("subject")) {
                        subject = value;
                    } else if (name.equals("fromAddress")) {
                        fromAddress = value;
                    } else if (name.equals("body")) {
                        body = value;
                    } else if (name.equals("IdAppUser")) {
                        IdAppUser = value;
                    } else if (name.equals("AppUserName")) {
                        AppUserName = value;
                    } else if (name.equals("UNID")) {
                        UNID = value;
                    }
                } else if (part.isFile()) {
                    FilePart filePart = (FilePart) part;

                    InputStream is = filePart.getInputStream();
                    byte[] binaryData = IOUtils.toByteArray(is);

                    {
                    }
                    if (is == null) {
                        throw new ServletException("Empty input stream.");
                    }
                    try {
                        ByteArrayInputStream bais = new ByteArrayInputStream(binaryData);
                        image = ImageIO.read(bais);
                        String filename = "IssueReportedScreenshot " + currentDate.toString() + ".png";
                        filename = filename.replaceAll("\\s", "");
                        filename = filename.replaceAll(":", "");
                        filename = pdh.getQualifiedProperty(PropertyDictionary.TEMP_DIRECTORY, req.getServerName())
                                + filename;
                        File outputfileTemp = new File(filename);
                        // File outputfileTemp = new File("ReportIssueScreenshot.png");
                        ImageIO.write(image, "png", outputfileTemp);
                        String absolutePath = outputfileTemp.getAbsolutePath().replace("\\", Constants.FILE_SEPARATOR);
                        outputfile = new File(absolutePath);

                    } catch (Exception e) {
                        LOG.error("Error in ReportIssueFeedbackServlet", e);
                        res.setStatus(STATUS_ERROR);

                        throw new ServletException("Failed to write screenshot to file.");

                    } finally {
                        is.close();
                    }
                }
            }

            String theSubject = subject + " " + currentDate.toString();
            String addPHI = DictionaryHelper.getInstance(sess).getPropertyDictionary(
                    PropertyDictionary.ADD_PHI_TO_SUPPORT_EMAIL);
            if (addPHI != null && addPHI.equals("Y")) {
                theSubject += " PHI ";
            }
            String emailRecipients = DictionaryHelper.getInstance(sess).getPropertyDictionary(
                    PropertyDictionary.CONTACT_EMAIL_SOFTWARE_BUGS);
System.out.println ("[ReportIssueFeedbackServlet] emailRecipients: " + emailRecipients);
            // Email app user
            String emailBody;
            if (!MailUtil.isValidEmail(fromAddress)) {
                fromAddress = DictionaryHelper.getInstance(sess).getPropertyDictionary(
                        PropertyDictionary.GENERIC_NO_REPLY_EMAIL);
                emailBody = "Time: "
                        + sdf.format(currentDate)
                        + "\r"
                        + "RequestURL: "
                        + req.getRequestURL().toString()
                        + "\r"
                        + "AppUserName: "
                        + "Anonymous "
                        + "\r"
                        + "-------------------------------------------User Feedback-----------------------------------------------------"
                        + "\r" + body;
            } else {

                emailBody = "Time: "
                        + sdf.format(currentDate)
                        + "\r"
                        + "RequestURL: "
                        + req.getRequestURL().toString()
                        + "\r"
                        + "IdAppUser: "
                        + IdAppUser
                        + "\r"
                        + "AppUserName: "
                        + AppUserName
                        + "\r"
                        + "UNID: "
                        + UNID
                        + "\r"
                        + "-------------------------------------------User Feedback-----------------------------------------------------"
                        + "\r" + body;
            }

            System.out.println ("[ReportIssueFeedbackServlet] fromAddress: " + fromAddress);
            MailUtilHelper helper = new MailUtilHelper(emailRecipients, fromAddress, theSubject, emailBody, outputfile, format.equalsIgnoreCase("HTML"), dh, serverName);
            MailUtil.validateAndSendEmail(helper);

            outputfile.delete();

            res.setHeader("Cache-Control", "max-age=0, must-revalidate");

            String baseURL = "";
            StringBuffer fullPath = req.getRequestURL();
            String extraPath = req.getServletPath() + (req.getPathInfo() != null ? req.getPathInfo() : "");
            int pos = fullPath.lastIndexOf(extraPath);
            if (pos > 0) {
                baseURL = fullPath.substring(0, pos);
            }

            org.dom4j.io.OutputFormat format1 = org.dom4j.io.OutputFormat.createPrettyPrint();
            org.dom4j.io.HTMLWriter writer;
            res.setContentType("text/html; charset=UTF-8");

            Document doc = DocumentHelper.createDocument();
            Element root = doc.addElement("HTML");
            Element head = root.addElement("HEAD");
            Element link = head.addElement("link");
            link.addAttribute("rel", "stylesheet");
            link.addAttribute("type", "text/css");
            link.addAttribute("href", baseURL + "/css/message.css");
            Element body1 = root.addElement("BODY");
            Element h3 = body1.addElement("H3");
            h3.addCDATA("The issue has been successfully reported. Thank you.");
            body1.addElement("BR");
            body1.addElement("BR");

            writer = new org.dom4j.io.HTMLWriter(res.getWriter(), format1);
            writer.write(doc);
            writer.flush();
            writer.close();
            res.setStatus(HttpServletResponse.SC_ACCEPTED);

        } catch (Exception e) {
            LOG.error("Error in ReportIssueFeedback", e);
            res.setStatus(STATUS_ERROR);

            throw new ServletException(
                    "Unable to report issue due to a server error.  Please contact GNomEx support directly.");
        } finally {
            try {
                HibernateSession.closeSession();
            } catch (Exception e1) {
                LOG.error("Error in ReportIssueFeedback", e1);
            }
        }

    }
}
