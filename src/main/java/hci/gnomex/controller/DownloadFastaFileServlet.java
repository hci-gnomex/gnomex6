package hci.gnomex.controller;

import hci.gnomex.constants.Constants;
import hci.gnomex.model.Chromatogram;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
public class DownloadFastaFileServlet extends HttpServlet {

    private static Logger LOG = Logger.getLogger(DownloadFastaFileServlet.class);

    public void init() {
    }

    protected void doGet(HttpServletRequest req, HttpServletResponse response)
            throws ServletException, IOException {
        Chromatogram chromatogram;
        Integer idChromatogram = null;
        String username = "";
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

        SecurityAdvisor secAdvisor = null;

        try {

            // Get security advisor
            secAdvisor = (SecurityAdvisor) req.getSession().getAttribute(SecurityAdvisor.SECURITY_ADVISOR_SESSION_KEY);


            if (secAdvisor != null) {

                Session sess = secAdvisor.getHibernateSession(req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest");
                chromatogram = (Chromatogram)sess.load(Chromatogram.class, idChromatogram);

                String chromatName = chromatogram.getFileName();

                String fastaFileName = chromatName.replace( "ab1", "fasta" );


                response.setContentType("application/x-download; charset=UTF-8");
                response.setHeader("Content-Disposition", "attachment;filename=" + fastaFileName);
                response.setHeader("Cache-Control", "max-age=0, must-revalidate");


                OutputStream out = response.getOutputStream();

                File abiFile = new File(chromatogram.getQualifiedFilePath() + Constants.FILE_SEPARATOR + chromatogram.getFileName());
                ChromatReadUtil chromatReader = new ChromatReadUtil(abiFile);

                String header = ">";
                header += chromatogram.getPlateWell().getSampleName() != null && !chromatogram.getPlateWell().getSampleName()
                        .equals( "" ) ? chromatogram.getPlateWell().getSampleName() : chromatogram.getFileName();
//        String header = ">gi|" + "gi-number" + "|" + "gb" + "|" + "accession" + "|" + "Name Here";
                String seq = chromatReader.getSeq();

                response.getOutputStream().print( header );
                response.getOutputStream().print( "\n" );
                response.getOutputStream().print( seq );


                out.close();
                out.flush();


            } else {
                response.setContentType("text/html; charset=UTF-8");
                response.getOutputStream().println(
                        "<html><head><title>Error</title></head>");
                response.getOutputStream().println("<body><b>");
                response.getOutputStream().println(
                        "DownloadFastaFileServlet: You must have a SecurityAdvisor in order to run this command."
                                + "<br>");
                response.getOutputStream().println("</body>");
                response.getOutputStream().println("</html>");
                System.out.println( "DownloadFastaFileServlet: You must have a SecurityAdvisor in order to run this command.");
            }
        } catch (Exception e) {
            String errorMessage = Util.GNLOG(LOG,"Error in DownloadFastaFileServlet ", e);
            StringBuilder requestDump = Util.printRequest(req);
            String serverName = req.getServerName();

            PropertyDictionaryHelper propertyHelper = PropertyDictionaryHelper.getInstance(HibernateSession.currentSession());
            String gnomex_tester_email = propertyHelper.getProperty(PropertyDictionary.CONTACT_EMAIL_SOFTWARE_TESTER);

            Util.sendErrorReport(HibernateSession.currentSession(),gnomex_tester_email, "DoNotReply@hci.utah.edu", username, errorMessage, requestDump);

            HibernateSession.rollback();
            response.setContentType("text/html; charset=UTF-8");
            response.getOutputStream().println(
                    "<html><head><title>Error</title></head>");
            response.getOutputStream().println("<body><b>");
            response.getOutputStream().println(
                    "DownloadFastaFileServlet: An exception occurred " + e.toString()
                            + "<br>");
            response.getOutputStream().println("</body>");
            response.getOutputStream().println("</html>");


        } finally {
            try {
                secAdvisor.closeHibernateSession();
            } catch (Exception e) {
                LOG.error("Error in DownloadFastaFileServlet", e);

            }


        }

    }


}
