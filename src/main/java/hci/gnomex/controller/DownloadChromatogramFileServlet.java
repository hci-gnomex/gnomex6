package hci.gnomex.controller;

import hci.gnomex.constants.Constants;
import hci.gnomex.model.Chromatogram;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.PropertyDictionaryHelper;
import hci.gnomex.utility.ServletUtil;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public class DownloadChromatogramFileServlet extends HttpServlet {

    private static Logger LOG = Logger.getLogger(DownloadChromatogramFileServlet.class);

    public void init() {

    }

    protected void doGet(HttpServletRequest req, HttpServletResponse response)
            throws ServletException, IOException {
        Integer     idChromatogram = null;
        String userName = "";

        // Restrict commands to local host if request is not secure
        if (!ServletUtil.checkSecureRequest(req, LOG)) {
            ServletUtil.reportServletError(response, "Secure connection is required. Prefix your request with 'https'",
                    LOG, "Accessing secure command over non-secure line from remote host is not allowed.");
            return;
        }

        // Get the idChromatogram
        if (req.getParameter("idChromatogram") != null && !req.getParameter("idChromatogram").equals("")) {
            idChromatogram = Integer.valueOf(req.getParameter("idChromatogram"));
        }

        if (idChromatogram == null) {
            LOG.error("idChromatogram required");
            Chromatogram.missingIdResponse(response);
            return;
        }

        InputStream in = null;
        SecurityAdvisor secAdvisor = null;

        try {

            userName = req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest";

            // Get security advisor
            secAdvisor = (SecurityAdvisor) req.getSession().getAttribute(SecurityAdvisor.SECURITY_ADVISOR_SESSION_KEY);


            if (secAdvisor != null) {

                Session sess = secAdvisor.getHibernateSession(req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest");
                Chromatogram chromatogram = (Chromatogram)sess.load(Chromatogram.class, idChromatogram);


                // Check permissions - bypass this file if the user
                // does not have  permission to read it.
                boolean hasPermission = false;
                if (chromatogram.getRequest() == null) {
                    // Only the admins and dna seq core admins can access chromatograms for control samples
                    hasPermission = secAdvisor.hasPermission(SecurityAdvisor.CAN_ADMINISTER_ALL_CORE_FACILITIES) ||
                            secAdvisor.hasPermission(SecurityAdvisor.CAN_MANAGE_DNA_SEQ_CORE);
                } else {
                    // For chromatograms that belong to an experiment, make sure
                    // the user has read permission on the experiment itself.
                    if (secAdvisor.canRead(chromatogram.getRequest())) {
                        hasPermission = true;
                    }
                }
                if (!hasPermission) {
                    response.setContentType("text/html; charset=UTF-8");
                    response.getOutputStream().println(
                            "<html><head><title>Error</title></head>");
                    response.getOutputStream().println("<body><b>");
                    response.getOutputStream().println(
                            "DownloadChromatogramFileServlet: Insufficient permission to read this chromatogram."
                                    + "<br>");
                    response.getOutputStream().println("</body>");
                    response.getOutputStream().println("</html>");
                    System.out.println( "DownloadChromatogramFileServlet: Insufficient permission to read chromatogram.");
                    return;
                }


                response.setContentType("application/x-download; charset=UTF-8");
                response.setHeader("Content-Disposition", "attachment;filename=" + chromatogram.getFileName());
                response.setHeader("Cache-Control", "max-age=0, must-revalidate");


                String fileName = chromatogram.getQualifiedFilePath() + Constants.FILE_SEPARATOR + chromatogram.getFileName();

                in = new FileInputStream(fileName);
                OutputStream out = response.getOutputStream();
                byte b[] = new byte[102400];
                int numRead = 0;
                int size = 0;
                while (numRead != -1) {
                    numRead = in.read(b);
                    if (numRead != -1) {
                        out.write(b, 0, numRead);
                        size += numRead;
                    }
                }
                in.close();
                out.close();
                out.flush();
                in = null;


            } else {
                response.setContentType("text/html; charset=UTF-8");
                response.getOutputStream().println(
                        "<html><head><title>Error</title></head>");
                response.getOutputStream().println("<body><b>");
                response.getOutputStream().println(
                        "DownloadChromatogramFileServlet: You must have a SecurityAdvisor in order to run this command."
                                + "<br>");
                response.getOutputStream().println("</body>");
                response.getOutputStream().println("</html>");
                System.out.println( "DownloadChromatogramFileServlet: You must have a SecurityAdvisor in order to run this command.");
            }
        } catch (Exception e) {
            String errorMessage = Util.GNLOG(LOG,"Error in DownloadChromatogramFileServlet ", e);
            StringBuilder requestDump = Util.printRequest(req);
            String serverName = req.getServerName();

            PropertyDictionaryHelper propertyHelper = PropertyDictionaryHelper.getInstance(HibernateSession.currentSession());
            String gnomex_tester_email = propertyHelper.getProperty(PropertyDictionary.CONTACT_EMAIL_SOFTWARE_TESTER);

            Util.sendErrorReport(HibernateSession.currentSession(),gnomex_tester_email, "DoNotReply@hci.utah.edu", userName, errorMessage, requestDump);

            HibernateSession.rollback();
            response.setContentType("text/html; charset=UTF-8");
            response.getOutputStream().println(
                    "<html><head><title>Error</title></head>");
            response.getOutputStream().println("<body><b>");
            response.getOutputStream().println(
                    "DownloadChromatogramFileServlet: An exception occurred " + e.toString()
                            + "<br>");
            response.getOutputStream().println("</body>");
            response.getOutputStream().println("</html>");


        } finally {
            try {
                secAdvisor.closeHibernateSession();
            } catch (Exception e) {
            }

            if (in != null) {
                in.close();
            }
        }

    }




}
