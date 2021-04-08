package hci.gnomex.controller;

import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.DictionaryHelper;
import hci.gnomex.utility.PropertyDictionaryHelper;
import hci.gnomex.utility.ServletUtil;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class FastDataTransferUploadGetJnlpServlet extends HttpServlet {

    /**
     *
     */
    private static final long serialVersionUID = 1L;

    private static Logger LOG = Logger.getLogger(FastDataTransferUploadGetJnlpServlet.class);

    private static String serverName = "";


    public void init() {

    }

    protected void doGet(HttpServletRequest req, HttpServletResponse response)
            throws ServletException, IOException {

        serverName = req.getServerName();

        String uuid = (String) req.getParameter("uuid");
        if (uuid == null) {
            ServletUtil.reportServletError(response, "Missing UUID parameter.", LOG);
            return;
        }

        String showCommandLineInstructions = "N";
        if (req.getParameter("showCommandLineInstructions") != null && !req.getParameter("showCommandLineInstructions").equals("")) {
            showCommandLineInstructions = req.getParameter("showCommandLineInstructions");
        }

        // Restrict commands to local host if request is not secure
        if (!ServletUtil.checkSecureRequest(req, LOG)) {
            ServletUtil.reportServletError(response, "Secure connection is required. Prefix your request with 'https'",
                    LOG, "Accessing secure command over non-secure line from remote host is not allowed.");
            return;
        }


        try {

            // Get security advisor
            SecurityAdvisor secAdvisor = (SecurityAdvisor) req.getSession().getAttribute(SecurityAdvisor.SECURITY_ADVISOR_SESSION_KEY);

            if (secAdvisor != null) {

                Session sess = secAdvisor.getReadOnlyHibernateSession(req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest");
                DictionaryHelper dh = DictionaryHelper.getInstance(sess);

                // Make sure the system is configured to run FDT
                String fdtSupported = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.FDT_SUPPORTED);
                if (fdtSupported == null || !fdtSupported.equals("Y")) {
                    ServletUtil.reportServletError(response, "GNomEx is not configured to support FDT.  Please contact GNomEx support to set " +
                            "appropriate property.", LOG);
                    return;
                }

                secAdvisor.closeReadOnlyHibernateSession();

                req.getSession().setAttribute(CacheFileDownloadList.SESSION_KEY_FILE_DESCRIPTOR_PARSER, null);
                String fdtJarLoc = PropertyDictionaryHelper.getInstance(sess).getFDTJarLocation(serverName);
                String fdtServerName = PropertyDictionaryHelper.getInstance(sess).getFDTServerName(serverName);
                String softLinksPath = PropertyDictionaryHelper.getInstance(sess).GetFDTDirectory(serverName)+uuid;
                if (fdtJarLoc == null || fdtJarLoc.equals("")) {
                    System.out.println ("[FDTUGJS] WARNING WARNING: fdtJarLoc is empty, servername: " + serverName);
                    fdtJarLoc = "https://hci-bio-app.hci.utah.edu/gnomexdata/fdt/";
                }

                if(showCommandLineInstructions != null && showCommandLineInstructions.equals("Y")) {

                    response.setContentType("text/html");
                    response.getOutputStream().println("<h1>Please read, the FDT upload directions have changed</h1>");
                    response.getOutputStream().println("<br><p>1.  Download <a href=\""+ fdtJarLoc +"\">fdtCommandLine.jar</a> (right mouse click then save)</p>\n");
                    response.getOutputStream().println("<p>2.  Open port 54321 in all firewalls surrounding your computer (this may occur automatically upon transfer).</p>");
                    response.getOutputStream().println("<p>3.  Execute the following:</p>");
                    response.getOutputStream().println("<p>    For a Windows system use this command line:</p>");
                    response.getOutputStream().println("<p>    java -jar fdtCommandLine.jar -noupdates -ka 999999 -r -c " + fdtServerName + " -d " + softLinksPath + " . </p>");
                    response.getOutputStream().println("<p>    Otherwise use this command line:</p>");
                    response.getOutputStream().println("<p>    java -jar ./fdtCommandLine.jar -noupdates -ka 999999 -r -c " + fdtServerName + " -d " + softLinksPath + " ./ </p>");
                    response.getOutputStream().flush();
                    return;



                }

                response.setHeader("Content-Disposition","attachment;filename=\"gnomex.jnlp\"");
                response.setContentType("application/jnlp; charset=UTF-8");
                response.setHeader("Cache-Control", "max-age=0, must-revalidate");
                try {
                    ServletOutputStream out = response.getOutputStream();


                    out.println("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
                    out.println("<jnlp spec=\"1.0\"");
                    String codebase_param = PropertyDictionaryHelper.getInstance(sess).getFDTClientCodebase(serverName);
                    out.println("codebase=\""+codebase_param+"\">");
                    out.println("<!--");
                    out.println("");
                    out.println("***** Please read, the directions have changed *****");
                    out.println("Command line upload instructions:");
                    out.println("");
                    out.println("1) Download the fdtCommandLine.jar app from " + fdtJarLoc);
                    out.println("2) Open port 54321 in all firewalls surrounding your computer (this may occur automatically upon transfer).");
                    out.println("3) Execute the following on the command line after changing the path2xxx variables:");
                    out.println("4) There is a 24 hour timeout on this command.  After that time please generate a new command line using the FDT Upload Command Line link.");
                    out.println("");
                    out.println("java -jar path2YourLocalCopyOfFDT/fdtCommandLine.jar -noupdates -ka 999999 -r -c " + fdtServerName + " -d " + softLinksPath + " path2YourLocalDirContainingFiles2Upload/");
                    out.println("");
                    out.println("-->");
                    out.println("<information>");
                    out.println("<title>GNomEx FDT Upload</title>");
                    out.println("<vendor>Sun Microsystems, Inc.</vendor>");
                    out.println("<offline-allowed/>");
                    out.println("</information>");
                    out.println("<security> ");
                    out.println("<all-permissions/> ");
                    out.println("</security>");
                    out.println("<resources>");
                    out.println("<jar href=\"fdtClient.jar\"/>");
                    out.println("<j2se version=\"1.6+\"/>");
                    out.println("</resources>");
                    out.println("<application-desc main-class=\"gui.FdtMain\">");
                    out.println("<argument>"+fdtServerName+"</argument>");
                    out.println("<argument>upload</argument>");
                    out.println("<argument>" + softLinksPath + "</argument>");
                    out.println("</application-desc>");
                    out.println("</jnlp>");
                    out.close();
                    out.flush();

                } catch (IOException e) {
                    LOG.error( "Unable to get response output stream.", e );
                }

            } else {
                response.setStatus(999);
                System.out.println( "FastDataTransferUploadGetJnlpServlet: You must have a SecurityAdvisor in order to run this command.");
            }
        } catch (Exception e) {
            response.setStatus(999);
            LOG.error( "FastDataTransferUploadGetJnlpServlet: An exception occurred ", e);

        }

    }

}
