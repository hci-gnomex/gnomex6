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

public class MakeChartOScopeLinks extends HttpServlet {

    private static Logger LOG = Logger.getLogger(MakeChartOScopeLinks.class);
    private String serverName;
    private String catalogPath;
    private String chartOScopeURL;
    private String dataTrackFileServerWebContext;
    private String baseURL;
    private File linkdir;
    private int idAnalysis;

    public String analysisName = null;

    private String analysisDirectory = null;
    protected String errorDetails = "";
    public String username = null;
    public String username1 = null;

    Session sess = null;

    public void init() {

    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        serverName = request.getServerName();
        System.out.println("[MakeChartOScopeLinks] serverName " + serverName);

        username1 = request.getRemoteUser();
        if (request.getParameter("idAnalysis") != null) {
            idAnalysis = Integer.valueOf(request.getParameter("idAnalysis"));
            System.out.println("[MakeChartOScopeLinks] idAnalysis: " + idAnalysis);
        }

        // the catalog.yaml file
        if (request.getParameter("catalogPath") != null && !request.getParameter("catalogPath").equals("")) {
            catalogPath = request.getParameter("catalogPath");
            System.out.println("[MakeChartOScopeLinks] catalogPath: " + catalogPath);
        }

        // Get security advisor
        SecurityAdvisor secAdvisor = (SecurityAdvisor) request.getSession().getAttribute(SecurityAdvisor.SECURITY_ADVISOR_SESSION_KEY);

        if (secAdvisor != null)
         {
            username = secAdvisor.getUsername();
             sess = null;
             try {
                 sess = secAdvisor.getReadOnlyHibernateSession(request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "guest");
             } catch (Exception ex) {
                 throw new RuntimeException(ex);
             }
             DictionaryHelper dh = DictionaryHelper.getInstance(sess);
         }
            dataTrackFileServerWebContext = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.DATATRACK_FILESERVER_WEB_CONTEXT);
            baseURL = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.DATATRACK_FILESERVER_URL);

            String baseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null, PropertyDictionaryHelper.PROPERTY_ANALYSIS_DIRECTORY);

            Analysis a = sess.get(Analysis.class, idAnalysis);
            analysisDirectory = Util.getAnalysisDirectory(baseDir, a);
            analysisName = a.getName();
            System.out.println("[MakeChartOScopeLinks] baseDir: " + baseDir + " analysisDirectory: " + analysisDirectory);

            linkdir = this.setupDirectories();      // directory under URLLinks

            // create all the softlinks to the data files in the ChartOScope directory
            String chartOScopeDirectoryName = catalogPath.substring(0,catalogPath.lastIndexOf("/") + 1);
            File chartOScopeDirectory = new File(chartOScopeDirectoryName);
            createSoftLinksToChartOScopeData(chartOScopeDirectory, linkdir);

            // tell them what to do next
            String theCatalogPath = linkdir.getAbsolutePath() + "/" + catalogPath.substring(catalogPath.lastIndexOf("/") + 1);
            String softLinksPath = theCatalogPath.substring(theCatalogPath.indexOf("URLLinks"));
            String softLinksURL = baseURL + "/" + softLinksPath;

            PrintWriter out = response.getWriter();
            response.setContentType("text/html");
            response.getOutputStream().println("<h1>Directions for ChartOScope</h1>");
            response.getOutputStream().println("<br><p>Copy this URL:</p>\n");
            response.getOutputStream().println("<p>" + softLinksURL + "</p>");
            response.getOutputStream().println("<br><p>In a separate tab navigate to https://main.cartoscope.app</p>");
            response.getOutputStream().println("<br><p>Click on person icon in upper right hand corner and login.</p>");
            response.getOutputStream().println("<p>Click on the URL icon and paste the copied URL</p>");
            response.getOutputStream().println("<br><p>Save any images/results to a local folder and use one of the</p>");
            response.getOutputStream().println("<p>Upload options to add those files to the analysis if desired.</p>");
            response.getOutputStream().flush();
        }

    private File setupDirectories() {
        File linkdir = null;

        try {
            // look and or make directory to hold soft links to data
            File urlLinkDir = DataTrackUtil.checkUCSCLinkDirectory(baseURL, dataTrackFileServerWebContext);

            String linkPath = this.checkForUserFolderExistence(urlLinkDir, username, analysisName);

            if (linkPath == null) {
                linkPath = UUID.randomUUID().toString() + "$" + username + "$" + analysisName;
            }

            // Create the users' data directory
            linkdir = new File(urlLinkDir.getAbsoluteFile(), linkPath);

            if (!linkdir.exists())
                linkdir.mkdir();
        } catch (Exception e) {
            System.out.println("[MakeChartOScopeLinks] Error in setupDirectories: " + e);
        }

        return linkdir;
    }

    private String checkForUserFolderExistence(File urlLinkDir, String username, String analysisName) throws Exception {
        if (urlLinkDir == null) {
            System.out.println("[MakeChartOScopeLinks:checkForUserFolderExistence] WARNING urlLinkDir is null!");
            return null;
        }

        File[] directoryList = urlLinkDir.listFiles();

        String desiredDirectory = null;

        for (File directory : directoryList) {
            String dirName = directory.getName();
            if (dirName.length() > 36) {
                String[] pieces = dirName.split("$");
                if (pieces.length != 3) {
                    continue;
                }
                String parsedUsername = pieces[1];
                if (parsedUsername.equalsIgnoreCase(username)) {
                    String parsedAnalysisName = pieces[2];
                    if (parsedAnalysisName.equalsIgnoreCase(analysisName)) {
                        desiredDirectory = dirName;
                        break;
                    }
                }
            }
        }

        return desiredDirectory;
    }

    private void createSoftLinksToChartOScopeData(File chartOScopeDirectory, File linkdir) {
        File[] files = chartOScopeDirectory.listFiles();

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
                    System.out.println("[MakeChartOScopeLinks] Error creating soft link for " + file.getAbsolutePath() + ": " + e);
                }
            }
        }

    }

}

