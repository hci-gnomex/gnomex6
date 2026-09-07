package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.Analysis;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.naming.NamingException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.*;
import java.sql.SQLException;
import java.util.*;

public class MakeCartOScopeLinks extends HttpServlet {

    private static Logger LOG = Logger.getLogger(MakeCartOScopeLinks.class);
    private String serverName;
    private String catalogPath;
    private String cartOScopeURL;
    private String fileServerWebContext;
    private String baseURL;
    private File linkdir;
    private int idAnalysis;

    public String analysisName = null;

    private String analysisDirectory = null;
    protected String errorDetails = "";
    public String username = null;
    public String username1 = null;
   public String linkdirname = null;
   public File foundDirectory = null;
   public String foundDirectoryname = null;

   public String linkPath = null;
    Session sess = null;

    public void init() {

    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        serverName = request.getServerName();
        System.out.println("[MakeCartOScopeLinks] serverName " + serverName);

        username = request.getRemoteUser();
        System.out.println("[MakeCartOScopeLinks] username1 " + username);

        if (request.getParameter("idAnalysis") != null) {
            idAnalysis = Integer.valueOf(request.getParameter("idAnalysis"));
            System.out.println("[MakeCartOScopeLinks] idAnalysis: " + idAnalysis);
        }

        // the catalog.yaml file
        if (request.getParameter("catalogPath") != null && !request.getParameter("catalogPath").equals("")) {
            catalogPath = request.getParameter("catalogPath");
            System.out.println("[MakeCartOScopeLinks] catalogPath: " + catalogPath);
        }

        // the analysisName
        if (request.getParameter("analysisName") != null && !request.getParameter("analysisName").equals("")) {
            analysisName = request.getParameter("analysisName");
            System.out.println("[MakeCartOScopeLinks] analysisName: " + analysisName);
        }

        // Get security advisor
        SecurityAdvisor secAdvisor = (SecurityAdvisor) request.getSession().getAttribute(SecurityAdvisor.SECURITY_ADVISOR_SESSION_KEY);
        if (secAdvisor == null) System.out.println("[MakeCartOScopeLinks] WARNING: SecurityAdvisor is null!");
        if (secAdvisor != null)
         {
             String username2 = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "guest";
            username1 = secAdvisor.getUsername();
            System.out.println("[MakeCartOScopeLinks] username1: " + username1 + " username2: " + username2);
             sess = null;
             try {
                 sess = secAdvisor.getReadOnlyHibernateSession(request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "guest");
             } catch (Exception ex) {
                 System.out.println("[MakeCartOScopeLinks] WARNING: Could not get read-only Hibernate session: " + ex);
                 throw new RuntimeException(ex);
             }
             DictionaryHelper dh = DictionaryHelper.getInstance(sess);
         }
            fileServerWebContext = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.DATATRACK_FILESERVER_WEB_CONTEXT);    // /var/www/html/gnomexdata/
            baseURL = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.DATATRACK_FILESERVER_URL);  // https://hci-bio-app.hci.utah.edu/gnomexdata/

            String baseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null, PropertyDictionaryHelper.PROPERTY_ANALYSIS_DIRECTORY);   // /Repository/AnalysisData/
            System.out.println("[MakeCartOScopeLinks] baseURL: " + baseURL + " fileServerWebContext: " + fileServerWebContext + " analysisName: " + analysisName);

 //           Analysis a = sess.get(Analysis.class, idAnalysis);

            //                         1         2         3         4
            //               01234567890123456789012345678901234567890
            // catalogpath = /Repository/AnalysisData/2026/A8829/cartoscope/MMR14_PRE/catalog.yaml

//            analysisDirectory = Util.getAnalysisDirectory(baseDir, a);
//            analysisName = a.getName();  // it's a parameter
//            System.out.println("[MakeCartOScopeLinks] baseDir: " + baseDir + " analysisDirectory: " + analysisDirectory + " analysisName: " + analysisName);

            // see if directory exists for this unid and analysis name
            try {
                linkdir = this.checkForUserFolderExistence(new File(fileServerWebContext, Constants.URL_LINK_DIR_NAME), username, analysisName);
                }
            catch (Exception e) {
                System.out.println("[MakeCartOScopeLinks] exception checking for user folder existence: " + e);
                throw new RuntimeException(e);
            }

            if (linkdir == null) {
                linkdir = this.setupDirectory();      // directory under URLLinks,i.e., /var/www/html/gnomexdata/URLLinks/uuid$username$analysisName
                linkdirname = linkdir.getAbsolutePath();
                System.out.println("[MakeCartOScopeLinks] Created directory for user " + username + " and analysisName " + analysisName + " linkdirname: " + linkdirname);
            }

            System.out.println("[MakeCartOScopeLinks] Found directory for user " + username + " and analysisName " + analysisName + " linkdirname: " + linkdirname);

            // create all the softlinks to the data files in the CartOScope directory
            String cartOScopeDirectoryName = catalogPath.substring(0,catalogPath.lastIndexOf("/") + 1);

            File cartOScopeDirectory = new File(cartOScopeDirectoryName);
            String catalogURL1 = createSoftLinksToCartOScopeData(cartOScopeDirectory, linkdir, catalogPath);
            String catalogURL = baseURL + "/" + Constants.URL_LINK_DIR_NAME + "/" + linkPath;
            // tell them what to do next
//            String theCatalogPath = linkdir.getAbsolutePath() + "/" + catalogPath.substring(catalogPath.lastIndexOf("/") + 1);
//            String softLinksPath = theCatalogPath.substring(theCatalogPath.indexOf("URLLinks"));
//            String softLinksURL = baseURL + "/" + softLinksPath;

            response.setContentType("text/html");
            response.getOutputStream().println("<h1>Directions for CartOScope</h1>");
            response.getOutputStream().println("<p>Copy this URL:</p>\n");
            response.getOutputStream().println("<p>" + catalogURL + "</p>");
            response.getOutputStream().println("<br><p>In a separate tab navigate to https://main.cartoscope.app</p>");
            response.getOutputStream().println("<p>Click on person icon in upper right hand corner and login.</p>");
            response.getOutputStream().println("<p>Click on the URL icon and paste the copied URL</p>");
            response.getOutputStream().println("<br><p>Save any images/results to a local folder and use one of the</p>");
            response.getOutputStream().println("<p>Upload options to add those files to the analysis if desired.</p>");
            response.getOutputStream().flush();
        } // end of doGet

    private File setupDirectory() {
        File linkdir = null;

        try {
            // make directory to hold soft links to data
            String urllinks = Constants.URL_LINK_DIR_NAME + "/";
            File urlLinkDir = new File(fileServerWebContext, urllinks);  // /var/www/html/gnomexdata/URLLinks/

            linkPath = UUID.randomUUID().toString() + "$" + username + "$" + analysisName;
            System.out.println("[MakeCartOScopeLinks] linkPath: " + linkPath);

            // Create the users' data directory
            linkdir = new File(urlLinkDir.getAbsoluteFile(), linkPath);
            linkdir.mkdir();

            FileUtil.chmod("770",linkdir.getAbsolutePath());
        } catch (Exception e) {
            System.out.println("[MakeCartOScopeLinks] Error in setupDirectories: " + e);
        }

        return linkdir;
    }

    private File checkForUserFolderExistence(File urlLinkDir, String username, String analysisName) throws Exception {
        if (urlLinkDir == null) {
            System.out.println("[MakeCartOScopeLinks:checkForUserFolderExistence] WARNING urlLinkDir is null!");
            return null;
        }

        System.out.println("[MakeCartOScopeLinks:checkForUserFolderExistence] username: " + username + " analysisName: " + analysisName + " urlLinkDir: " + urlLinkDir.getAbsolutePath());
        File[] directoryList = urlLinkDir.listFiles();

        File desiredDirectory = null;

        for (File directory : directoryList) {
            String dirName = directory.getName();

            String[] pieces = dirName.split("$");
            if (pieces.length != 3) {
                continue;
            }
            String parsedUsername = pieces[1];
            if (parsedUsername.equalsIgnoreCase(username)) {
                String parsedAnalysisName = pieces[2];
                if (parsedAnalysisName.equalsIgnoreCase(analysisName)) {
                    desiredDirectory = directory;
                    break;
                }
            }
        }

        System.out.println("[MakeCartOScopeLinks:checkForUserFolderExistence] desiredDirectory: " + (desiredDirectory != null ? "Found existing directory: " + desiredDirectory.getAbsolutePath() : "No existing directory found for user " + username + " and analysisName " + analysisName));
        return desiredDirectory;
    }

    private String createSoftLinksToCartOScopeData(File cartOScopeDirectory, File linkdir, String catalogyaml) {
        File[] files = cartOScopeDirectory.listFiles();

        for (File file : files) {
            if (file.isFile()) {
                String linkName = linkdir.getAbsolutePath() + "/" + file.getName();
                File linkFile = new File(linkName);
                try {
                    if (!linkFile.exists()) {
                        ProcessBuilder pb = new ProcessBuilder("ln", "-s", file.getAbsolutePath(), linkName);
                        Process process = pb.start();
                        process.waitFor();
                    }
                } catch (Exception e) {
                    System.out.println("[MakeCartOScopeLinks] Error creating soft link for " + file.getAbsolutePath() + ": " + e);
                }
            }
        }
        String catalogURL = linkdir.getAbsolutePath() + "/" + catalogyaml.substring(catalogyaml.lastIndexOf("/") + 1);
        return catalogURL;
    }

}

