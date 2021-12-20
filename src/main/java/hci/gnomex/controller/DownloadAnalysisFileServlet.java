package hci.gnomex.controller;

import hci.gnomex.model.Analysis;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.model.TransferLog;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.*;
import org.apache.commons.compress.archivers.tar.TarArchiveEntry;
import org.apache.commons.compress.archivers.tar.TarArchiveOutputStream;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.util.Iterator;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class DownloadAnalysisFileServlet extends HttpServlet {

  private static Logger LOG = Logger.getLogger(DownloadAnalysisFileServlet.class);

  public void init() {

  }

  protected void doGet(HttpServletRequest req, HttpServletResponse response)
      throws ServletException, IOException {

    String username = req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest";
    ArchiveHelper archiveHelper = new ArchiveHelper();
    // Restrict commands to local host if request is not secure
    if (!ServletUtil.checkSecureRequest(req, LOG)) {
      ServletUtil.reportServletError(response, "Secure connection is required. Prefix your request with 'https'",
              LOG, "Accessing secure command over non-secure line from remote host is not allowed.");
      return;
    }

    //  Get cached file descriptor parser
    AnalysisFileDescriptorParser parser = (AnalysisFileDescriptorParser) req.getSession().getAttribute(CacheAnalysisFileDownloadList.SESSION_KEY_FILE_DESCRIPTOR_PARSER);
    if (parser == null) {
      LOG.error("Unable to get file descriptor parser from session");
      return;
    }

    // Get the parameter that tells us if we are handling a large download.
    if (req.getParameter("mode") != null && !req.getParameter("mode").equals("")) {
      archiveHelper.setMode(req.getParameter("mode"));
    }

    String emailAddress = "";
    if (req.getParameter("emailAddress") != null && !req.getParameter("emailAddress").equals("")) {
      emailAddress = req.getParameter("emailAddress");
    }

    String ipAddress = GNomExCommand.getRemoteIP(req);

    SecurityAdvisor secAdvisor = null;
    try {


      // Get security advisor
      secAdvisor = (SecurityAdvisor) req.getSession().getAttribute(SecurityAdvisor.SECURITY_ADVISOR_SESSION_KEY);

      if (secAdvisor != null) {
        response.setContentType("application/x-download; charset=UTF-8");
        response.setHeader("Content-Disposition", "attachment;filename=gnomexAnalysis.zip");
        response.setHeader("Cache-Control", "max-age=0, must-revalidate");


        Session sess = secAdvisor.getWritableHibernateSession(req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest");

        DictionaryHelper dh = DictionaryHelper.getInstance(sess);
        archiveHelper.setTempDir(dh.getPropertyDictionary(PropertyDictionary.TEMP_DIRECTORY));


        parser.parse();


        // Open the archive output stream
        ZipOutputStream zipOut = null;
        TarArchiveOutputStream tarOut = null;
        if (archiveHelper.isZipMode()) {
          zipOut = new ZipOutputStream(response.getOutputStream());
        } else {
          tarOut = new TarArchiveOutputStream(response.getOutputStream());
        }



        int totalArchiveSize = 0;
        // For each request

        for(Iterator i = parser.getAnalysisNumbers().iterator(); i.hasNext();) {
          String analysisNumber = (String)i.next();

          Analysis analysis = null;
          List analysisList = sess.createQuery("SELECT a from Analysis a where a.number = '" + analysisNumber + "'").list();
          if (analysisList.size() == 1) {
            analysis = (Analysis)analysisList.get(0);
          }

          // If we can't find the analysis in the database, just bypass it.
          if (analysis == null) {
            LOG.error("Unable to find analysis " + analysisNumber + ".  Bypassing download for user " + (req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest") + ".");
            continue;
          }

          // Check permissions - bypass this analysis if the user
          // does not have  permission to read it.
          if (!secAdvisor.canRead(analysis)) {
            LOG.error("Insufficient permissions to read analysis " + analysisNumber + ".  Bypassing download for user " + (req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest") + ".");
            continue;
          }

          List fileDescriptors = parser.getFileDescriptors(analysisNumber);

          // For each file to be downloaded for the analysis
          for (Iterator i1 = fileDescriptors.iterator(); i1.hasNext();) {

            FileDescriptor fd = (FileDescriptor) i1.next();

            // Ignore file descriptors that represent directories.  We just
            // will zip up actual files.
            if (fd.getType().equals("dir")) {
              continue;
            }

            // Insert a transfer log entry
            TransferLog xferLog = new TransferLog();
            xferLog.setFileName(fd.getZipEntryName());
            xferLog.setStartDateTime(new java.util.Date(System.currentTimeMillis()));
            xferLog.setTransferType(TransferLog.TYPE_DOWNLOAD);
            xferLog.setTransferMethod(TransferLog.METHOD_HTTP);
            xferLog.setPerformCompression("Y");
            xferLog.setIdAnalysis(analysis.getIdAnalysis());
            xferLog.setIdLab(analysis.getIdLab());
            xferLog.setEmailAddress(emailAddress);
            xferLog.setIpAddress(ipAddress);
            xferLog.setIdAppUser(secAdvisor.getIdAppUser());


            // Since we use the request number to determine if user has permission to read the data, match sure
            // it matches the request number of the directory.  If it doesn't bypass the download
            // for this file.
            if (!analysisNumber.equalsIgnoreCase(fd.getNumber())) {
              LOG.error("Analysis number does not match directory for attempted download on " + fd.getFileName() + " for user " + (req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest") + ".  Bypassing download." );
              continue;
            }


            // If we are using tar, compress the file first using
            // zip.  If we are zipping the file, just open
            // it to read.
            InputStream in = archiveHelper.getInputStreamToArchive(fd.getFileName(), fd.getZipEntryName());


            // Add an entry to the archive
            // (The file name starts after the year subdirectory)
            if (archiveHelper.isZipMode()) {
              // Add ZIP entry
              zipOut.putNextEntry(new ZipEntry("bioinformatics-analysis-" + archiveHelper.getArchiveEntryName()));
            } else {
              // Add a TAR archive entry
              TarArchiveEntry entry = new TarArchiveEntry("bioinformatics-analysis-" + archiveHelper.getArchiveEntryName());
              entry.setSize(archiveHelper.getArchiveFileSize());
              tarOut.putArchiveEntry(entry);
            }


            // Transfer bytes from the file to the archive file
            OutputStream out = null;
            if (archiveHelper.isZipMode()) {
              out = zipOut;
            } else {
              out = tarOut;
            }
            int size = archiveHelper.transferBytes(in, out);
            totalArchiveSize += size;

            // Save transfer log
            xferLog.setFileSize(new BigDecimal(size));
            xferLog.setEndDateTime(new java.util.Date(System.currentTimeMillis()));
            sess.save(xferLog);

            if (archiveHelper.isZipMode()) {
              zipOut.closeEntry();
            } else {
              tarOut.closeArchiveEntry();
            }

            // Remove temporary files
            archiveHelper.removeTemporaryFile();

          }
        }

        sess.flush();


        if (archiveHelper.isZipMode()) {
          zipOut.finish();
          zipOut.flush();
        } else {
          tarOut.close();
          tarOut.flush();
        }

      } else {
        response.setStatus(999);
        LOG.warn("DownloadAnalyisFileServlet: You must have a SecurityAdvisor in order to run this command.");
      }
    } catch (Exception e) {
      String errorMessage = Util.GNLOG(LOG,"Error in DownloadAnalyisFileServlet ", e);
      StringBuilder requestDump = Util.printRequest(req);
      System.out.println ("[DownloadAnalysisFileServlet] error: " + errorMessage);

      PropertyDictionaryHelper propertyHelper = PropertyDictionaryHelper.getInstance(HibernateSession.currentSession());
      String gnomex_tester_email = propertyHelper.getProperty(PropertyDictionary.CONTACT_EMAIL_SOFTWARE_TESTER);

 //     Util.sendErrorReport(HibernateSession.currentSession(),gnomex_tester_email, "DoNotReply@hci.utah.edu", username, errorMessage, requestDump);

      HibernateSession.rollback();
      response.setStatus(999);

    } finally {
      try {
        if (secAdvisor != null) {
          secAdvisor.closeHibernateSession();
        }
      }catch(Exception e) {
      }
      // clear out session variable
      req.getSession().setAttribute(CacheAnalysisFileDownloadList.SESSION_KEY_FILE_DESCRIPTOR_PARSER, null);
      // Remove temporary files
      archiveHelper.removeTemporaryFile();
    }

  }




}
