package hci.gnomex.controller;

import hci.gnomex.constants.Constants;
import hci.gnomex.model.ProductOrder;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.util.Iterator;
import java.util.List;
import java.util.UUID;

// ****************************************************************
//      NOTE FDT is not currently available for Products
// ****************************************************************

public class FastDataTransferDownloadProductOrderServlet extends HttpServlet {

    /**
     *
     */
    private static final long serialVersionUID = 1L;

    private static Logger LOG = Logger.getLogger(FastDataTransferDownloadProductOrderServlet.class);

    private static String serverName = "";



    public void init() {

    }

    protected void doGet(HttpServletRequest req, HttpServletResponse response)
            throws ServletException, IOException {

        serverName = req.getServerName();

        String emailAddress = "";
        if (req.getParameter("emailAddress") != null && !req.getParameter("emailAddress").equals("")) {
            emailAddress = req.getParameter("emailAddress");
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

            String xmlText = "";
            BufferedReader brIn;

            brIn = req.getReader();
            String input;
            while((input = brIn.readLine()) != null) {
                xmlText = xmlText + input;
            }
            brIn.close();

            // Read productOrder file parser, which contains a list of selected productOrder files,
            //from session variable stored by CacheProductOrderFileDownloadList.
            ProductOrderFileDescriptorParser parser = (ProductOrderFileDescriptorParser) req.getSession().getAttribute(CacheProductOrderFileDownloadList.SESSION_KEY_FILE_DESCRIPTOR_PARSER);

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

                parser.parse();

                String softlinks_dir = "";
                // Create random name directory for storing softlinks
                UUID uuid = UUID.randomUUID();

                String productOrderNumberBase = "";


                // For each productOrder
                for(Iterator i = parser.getProductOrderIds().iterator(); i.hasNext();) {
                    String productOrderNumber = (String)i.next();

                    ProductOrder productOrder = null;
                    List productOrderList = sess.createQuery("SELECT po from ProductOrder po where po.productOrderNumber = '" + productOrderNumber + "'").list();
                    if (productOrderList.size() == 1) {
                        productOrder = (ProductOrder)productOrderList.get(0);
                    }

                    // If we can't find the productOrder in the database, just bypass it.
                    if (productOrder == null) {
                        LOG.error("Unable to find productOrder " + productOrderNumber + ".  Bypassing fdt download for user " + (req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest") + ".");
                        continue;
                    }

                    // Check permissions - bypass this productOrder if the user
                    // does not have  permission to read it.
                    if (!secAdvisor.canRead(productOrder)) {
                        LOG.error("Insufficient permissions to read productOrder " + productOrderNumber + ".  Bypassing fdt download for user " + (req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest") + ".");
                        continue;
                    }

                    List fileDescriptors = parser.getFileDescriptors(productOrderNumber);

                    // For each file to be downloaded for the productOrder
                    for (Iterator i1 = fileDescriptors.iterator(); i1.hasNext();) {

                        FileDescriptor fd = (FileDescriptor) i1.next();

                        // Ignore file descriptors that represent directories.  We will
                        // just download  actual files.
                        if (fd.getType().equals("dir")) {
                            continue;
                        }


                        // Since we use the request number to determine if user has permission to read the data, match sure
                        // it matches the request number of the directory.  If it doesn't bypass the download
                        // for this file.
                        productOrderNumberBase = fd.getNumber();
                        if (!productOrderNumber.equalsIgnoreCase(productOrderNumberBase)) {
                            LOG.error("ProductOrder number does not match directory for attempted download on " + fd.getFileName() + " for user " + (req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest") + ".  Bypassing fdt download." );
                            continue;
                        }

                        // Make softlinks directory
                        if(softlinks_dir.length() == 0) {
                            softlinks_dir = PropertyDictionaryHelper.getInstance(sess).getFDTDirectoryForGNomEx(serverName)+uuid.toString();
                            File dir = new File(softlinks_dir);
                            boolean success = dir.mkdir();
                            if (!success) {
                                response.setStatus(999);
                                System.out.println("Error. Unable to create softlinks directory.");
                                return;
                            }

                            // Write file with info for the TransferLoggerMain daemon
                            String theFileTransferLogFile = "fdtDownloadTransferLog_" + uuid.toString();
                            UploadDownloadHelper.writeDownloadInfoFile(softlinks_dir, emailAddress, secAdvisor, req, "", "","",theFileTransferLogFile);

                            // change ownership to HCI_fdt user
                            String fdtUser = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.FDT_USER);
                            if (fdtUser == null || fdtUser.equals("")) {
                                fdtUser = "fdt";
                            }
                            String fdtGroup = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.FDT_GROUP);
                            if (fdtGroup == null || fdtGroup.equals("")) {
                                fdtGroup = "fdt_security";
                            }
                            Process process = Runtime.getRuntime().exec( new String[] { "chown", "-R", fdtUser + ":" + fdtGroup, softlinks_dir } );
                            process.waitFor();
                            process.destroy();

                            // only fdt user and group have permissions on this directory
                            process = Runtime.getRuntime().exec( new String[] { "chmod", "770", softlinks_dir } );
                            process.waitFor();
                            process.destroy();

                            softlinks_dir = softlinks_dir + Constants.FILE_SEPARATOR;
                        }


                        if (fd.getFileSize() == 0) {
                            // Ignore files with length of zero
                            continue;
                        }


                        // Get file/location of file to create symbolic link to
                        String fullPath = fd.getFileName();
                        int indxFileName = fullPath.lastIndexOf(Constants.FILE_SEPARATOR);
                        int indxDirPath = fullPath.indexOf(productOrderNumberBase);

                        // Get fileName to use for the name of the softlink
                        String fileName = softlinks_dir+fullPath.substring(indxDirPath);

                        // Make intermediate directories if necessary
                        String dirsName = softlinks_dir+fullPath.substring(indxDirPath, indxFileName);
                        File dir = new File(dirsName);
                        if(!dir.exists()) {
                            boolean isDirCreated = dir.mkdirs();
                            if (!isDirCreated) {
                                response.setStatus(999);
                                System.out.println("Error. Unable to create " + dirsName);
                                return;
                            }
                        }

                        Process process = Runtime.getRuntime().exec( new String[] { "ln", "-s", fd.getFileName(), fileName } );
                        process.waitFor();
                        process.destroy();
                    }
                }

                secAdvisor.closeReadOnlyHibernateSession();

                // clear out session variable
                req.getSession().setAttribute(CacheProductOrderFileDownloadList.SESSION_KEY_FILE_DESCRIPTOR_PARSER, null);

                String fdtJarLoc = PropertyDictionaryHelper.getInstance(sess).getFDTJarLocation(serverName);
                String fdtServerName = PropertyDictionaryHelper.getInstance(sess).getFDTServerName(serverName);
                String softLinksPath = PropertyDictionaryHelper.getInstance(sess).GetFDTDirectory(serverName)+uuid.toString()+ Constants.FILE_SEPARATOR+productOrderNumberBase;
                if (fdtJarLoc == null || fdtJarLoc.equals("")) {
                    fdtJarLoc = "http://hci-bio-app.hci.utah.edu/FDT/";
                }

                if(showCommandLineInstructions != null && showCommandLineInstructions.equals("Y")) {
                    response.setContentType("text/html");
                    response.getOutputStream().println("<P>***** Please read, the directions have changed *****");
                    response.getOutputStream().println("<BR>Complete the following steps to run FDT from the command line:");
                    response.getOutputStream().println("<BR>1) Download the fdtCommandLine.jar app from " + fdtJarLoc);
                    response.getOutputStream().println("<BR>2) Open port 54321 in all firewalls surrounding your computer (this may occur automatically upon transfer).");
                    response.getOutputStream().println("<BR>3) Execute the following on the command line(Make sure paths reflect your environment):");
                    response.getOutputStream().println("<BR>4) There is a 24 hour timeout on this command.  After that time please generate a new command line using the FDT Upload Command Line link.");
                    response.getOutputStream().println("<BR><BR>For a Windows system use this command line:");
                    response.getOutputStream().println("<BR>java -jar fdtCommandLine.jar -noupdates -pull -r -c " + fdtServerName + " -d . " + softLinksPath + "</P>");
                    response.getOutputStream().println("<BR><BR>Otherwise use this command line:");
                    response.getOutputStream().println("<BR>java -jar ./fdtCommandLine.jar -noupdates -pull -r -c " + fdtServerName + " -d ./ " + softLinksPath + "</P>");
                    response.getOutputStream().flush();
                    return;
                }


                response.setHeader("Content-Disposition","attachment;filename=\"gnomex.jnlp\"");
                response.setContentType("application/jnlp");
                response.setHeader("Cache-Control", "max-age=0, must-revalidate");
                try {
                    ServletOutputStream out = response.getOutputStream();

                    out.println("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
                    out.println("<jnlp spec=\"1.0\"");
                    String codebase_param = PropertyDictionaryHelper.getInstance(sess).getFDTClientCodebase(serverName);
                    out.println("codebase=\""+codebase_param+"\">");
                    out.println("<!--");
                    out.println("");
                    out.println("Command line download instructions:");
                    out.println("");
                    if (fdtJarLoc == null || fdtJarLoc.equals("")) {
                        fdtJarLoc = "http://hci-bio-app.hci.utah.edu/FDT/";
                    }
                    out.println("1) Download the fdtCommandLine.jar app from " + fdtJarLoc);
                    out.println("2) Open port 54321 in all firewalls surrounding your computer (this may occur automatically upon transfer).");
                    out.println("3) Execute the following on the command line after changing the path2xxx variables:");
                    out.println("4) There is a 24 hour timeout on this command.  After that time please generate a new command line using the FDT Upload Command Line link.");
                    out.println("");
                    out.println("java -jar path2YourLocalCopyOfFDT/fdtCommandLine.jar -noupdates -pull -r -c " + fdtServerName + " -d path2SaveDataOnYourLocalComputer " + softLinksPath);
                    out.println("");
                    out.println("-->");
                    out.println("<information>");
                    out.println("<title>GNomEx FDT Download ProductOrder Files</title>");
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
                    out.println("<argument>download</argument>");
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
                System.out.println( "FastDataTransferDownloadProductOrderServlet: You must have a SecurityAdvisor in order to run this command.");
            }
        } catch (Exception e) {
            response.setStatus(999);
            LOG.error( "FastDataTransferDownloadProductOrderServlet: An exception occurred ", e);

        }

    }


}
