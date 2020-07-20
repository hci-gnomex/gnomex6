package hci.gnomex.controller;

import hci.gnomex.constants.Constants;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.model.Request;
import hci.gnomex.model.SequenceLane;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.FileDescriptor;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.util.Iterator;
import java.util.List;
import java.util.UUID;

public class FastDataTransferDownloadExpServlet extends HttpServlet {

  /**
   * 
   */
  private static final long serialVersionUID = 1L;

  private static Logger LOG = Logger.getLogger(FastDataTransferDownloadExpServlet.class);

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

      // Read the experiment file parser, which contains a list of selected analysis files,
      //from session variable stored by CacheFileDownloadList.
        FileDescriptorParser parser = (FileDescriptorParser) req.getSession().getAttribute(CacheFileDownloadList.SESSION_KEY_FILE_DESCRIPTOR_PARSER);

      // Get security advisor
      SecurityAdvisor secAdvisor = (SecurityAdvisor) req.getSession().getAttribute(SecurityAdvisor.SECURITY_ADVISOR_SESSION_KEY);

      if (secAdvisor != null) {

        Session sess = secAdvisor.getReadOnlyHibernateSession(req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest");
        DictionaryHelper dh = DictionaryHelper.getInstance(sess);


        // Make sure the system is configured to run FDT
        String fdtSupported = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.FDT_SUPPORTED);
        if (fdtSupported == null || !fdtSupported.equals("Y")) {
          ServletUtil.reportServletError(response, "GNomEx is not configured to support FDT.  Please contact GNomEx support to set " +
                  "appropriate property", LOG);
          return;
        }

        String theIdAnalysis = "";
        String theRemoteIPAddress = GNomExCommand.getRemoteIP(req);
        String theAppUser = secAdvisor.getIdAppUser().toString() ;
        StringBuilder filesToDownload = new StringBuilder(8*10242000);

        parser.parse();

        String softlinks_dir = "";
        // Create random name directory for storing softlinks
        UUID uuid = UUID.randomUUID();

        String requestNumberBase = "";
        String theidRequest = "";
        String theidLab = "";

        // For each request
        for(Iterator i = parser.getRequestNumbers().iterator(); i.hasNext();) {
          String requestNumber = (String)i.next();

          Request request = findRequest(sess, requestNumber);

          // If we can't find the request in the database, just bypass it.
          if (request == null) {
            LOG.error("Unable to find request " + requestNumber + ".  Bypassing fdt download for user " + (req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest") + ".");
            continue;
          }

          if (request.getRequestCategory().getIsClinicalResearch() != null && request.getRequestCategory().getIsClinicalResearch().equals("Y")) {
            LOG.error("Clinical Research experiment " + requestNumber + " is are not allowed to download using FDT");
            continue;
          }
          
          // Check permissions - bypass this request if the user 
          // does not have  permission to read it.
          if (!secAdvisor.canRead(request)) {  
            LOG.error("Insufficient permissions to read request " + requestNumber + ".  Bypassing fdt download for user " + (req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest") + ".");
            continue;
          }

          // remember idRequest and idLab
            theidRequest = "" + request.getIdRequest();
          theidLab = "" + request.getIdLab();

          List fileDescriptors = parser.getFileDescriptors(requestNumber);

          // For each file to be downloaded for the request
          for (Iterator i1 = fileDescriptors.iterator(); i1.hasNext();) {

            FileDescriptor fd = (FileDescriptor) i1.next();

            // Ignore file descriptors that represent directories.  We will
            // just download  actual files.
            if (fd.getType().equals("dir")) {
              continue;
            }


            // Since we use the request number to determine if user has permission to read the data, make sure
            // it matches the request number of the directory.  If it doesn't bypass the download
            // for this file.
            requestNumberBase = Request.getBaseRequestNumber(requestNumber);
            if (!requestNumberBase.equalsIgnoreCase(fd.getMainFolderName(sess, serverName, request.getIdCoreFacility()))) {
              boolean isAuthorizedDirectory = false;
              // If this is a flow cell, make sure that that a sequence lane on this request has this flow cell
              for(Iterator i2 = request.getSequenceLanes().iterator(); i2.hasNext();) {
                SequenceLane lane = (SequenceLane)i2.next();
                if (lane.getFlowCellChannel() != null && 
                    lane.getFlowCellChannel().getFlowCell().getNumber().equals(fd.getMainFolderName(sess, serverName, request.getIdCoreFacility()))) {
                  isAuthorizedDirectory = true;
                  break;
                }

              }
              if (!isAuthorizedDirectory) {
                LOG.error("Request number " + requestNumber + " does not correspond to the directory " + fd.getMainFolderName(sess, serverName, request.getIdCoreFacility()) + " for attempted download on " + fd.getFileName() +  ".  Bypassing download." );
                continue;              
              }
            }



            // Make softlinks dir
            if(softlinks_dir.length() == 0) {							
              softlinks_dir = PropertyDictionaryHelper.getInstance(sess).getFDTDirectoryForGNomEx(req.getServerName())+uuid.toString();
              File dir = new File(softlinks_dir);
              boolean success = dir.mkdir();
              if (!success) {
                response.setStatus(999);
                System.out.println("Error. Unable to create softlinks directory.");
                return;
              } 

              String theFileTransferLogFile = "fdtDownloadTransferLog_" + uuid.toString();
              UploadDownloadHelper.writeDownloadInfoFile(softlinks_dir, emailAddress, secAdvisor,req, theidRequest,theidLab,"",theFileTransferLogFile);
              
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
            }


            if (fd.getFileSize() == 0) {
              // Ignore files with length of zero
              continue;
            }


            // Get file/location of file to create symbolic link to
            String zipEntryName = fd.getZipEntryName();
            int indxFileName = zipEntryName.lastIndexOf(Constants.FILE_SEPARATOR);
            int indxDirPath = zipEntryName.indexOf(requestNumberBase);


            // Get fileName to use for the name of the softlink
            String fileName = softlinks_dir+Constants.FILE_SEPARATOR+zipEntryName.substring((indxDirPath > 0 ? indxDirPath-1 : 0));
            
            // Make intermediate directories if necessary
            String dirsName = softlinks_dir+Constants.FILE_SEPARATOR+zipEntryName.substring((indxDirPath > 0 ? indxDirPath-1 : 0), indxFileName);
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

            // keep track of the files being downloaded so we can update the TransferLog table
            String theFileName = fd.getFileName();
            String theFileSize = "" + fd.getFileSize();
            filesToDownload.append("insert into TransferLog values (" +
                    "0,'download','fdt'," +
                    "'" + Util.getCurrentDateString() + "'," +
                    "'" + Util.getCurrentDateString() + "','" +
                    theFileName +
                    "'," +
                    theFileSize +
                    ",'Y'," +
                    theIdAnalysis +
                    ',' +
                    theidRequest +
                    ',' +
                    theidLab +
                    ",'" +
                    emailAddress +
                    "','" +
                    theRemoteIPAddress +
                    "'," +
                    theAppUser +
                    ",null);\n");
          } // end of for each file
        } // end of for each request

        // create the TransferLog file
        String uuidStr = uuid.toString();
        createTransferLogFile (softlinks_dir, uuidStr, filesToDownload );
        secAdvisor.closeReadOnlyHibernateSession();
        
        // clear out session variable
        req.getSession().setAttribute(CacheFileDownloadList.SESSION_KEY_FILE_DESCRIPTOR_PARSER, null);
        String fdtJarLoc = PropertyDictionaryHelper.getInstance(sess).getFDTJarLocation(req.getServerName());
        String fdtServerName = PropertyDictionaryHelper.getInstance(sess).getFDTServerName(req.getServerName());
        String softLinksPath = PropertyDictionaryHelper.getInstance(sess).GetFDTDirectory(req.getServerName())+uuid.toString()+ Constants.FILE_SEPARATOR+requestNumberBase;
        if (fdtJarLoc == null || fdtJarLoc.equals("")) {
            System.out.println ("[FDTDES] WARNING no fdtJarLoc, server: " + req.getServerName());
          fdtJarLoc = "http://hci-bio-app.hci.utah.edu/fdt/";
        }
        
        if(showCommandLineInstructions != null && showCommandLineInstructions.equals("Y")) {
          response.setContentType("text/html");
          response.setContentType("text/html");
          response.getOutputStream().println("<H1>Please read, the FDT download directions have changed</H1>");
          response.getOutputStream().println("<BR>");
          response
                  .getOutputStream()
                  .println("<p>1.  Download <a href=\"" + fdtJarLoc +"\">fdtCommandLine.jar</a> (right mouse click then save)</p>");
          response.getOutputStream().println("<p>2.  Open port 54321 in all firewalls surrounding your computer (this may occur automatically upon transfer).</p>");
          response.getOutputStream().println("<p>3.  Execute the following:</p>");
          response.getOutputStream().println("<p>    For a Windows system use this command line:</p>");
          response.getOutputStream().println("<p>    java -jar fdtCommandLine.jar -noupdates -pull -r -c " + fdtServerName + " -d . " + softLinksPath + "</P>");
          response.getOutputStream().println("<p>    Otherwise use this command line:</p>");
          response.getOutputStream().println("< p>   java -jar ./fdtCommandLine.jar -noupdates -pull -r -c " + fdtServerName + " -d . "  + softLinksPath + "</P>");


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
		      String codebase_param = PropertyDictionaryHelper.getInstance(sess).getFDTClientCodebase(req.getServerName());
		      out.println("codebase=\""+codebase_param+"\">");
          out.println("<!--");
          out.println("");
          out.println("***** Please read, the directions have changed *****");
          out.println("Command line download instructions:");
          out.println("");
          out.println("1) Download the fdtCommandLine.jar app from " + fdtJarLoc);
          out.println("2) Open port 54321 in all firewalls surrounding your computer (this may occur automatically upon transfer).");
          out.println("3) Execute the following on the command line after changing the path2xxx variables:");
          out.println("4) There is a 24 hour timeout on this command.  After that time please generate a new command line using the FDT Download Command Line link.");
          out.println("");
          out.println("java -jar path2YourLocalCopyOfFDT/fdtCommandLine.jar -noupdates -pull -r -c " + fdtServerName + " -d path2SaveDataOnYourLocalComputer " + softLinksPath);
          out.println("");
          out.println("-->");	
          out.println("<information>");
		      out.println("<title>GNomEx FDT Download Experiment Files</title>");
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
		    System.out.println( "FastDataTransferDownloadExpServlet: You must have a SecurityAdvisor in order to run this command.");
		  }
		} catch (Exception e) {
		  response.setStatus(999);

		  LOG.error( "FastDataTransferDownloadExpServlet: An exception occurred ", e);

		} 					

	}    


  public void createTransferLogFile (String taskFileDir, String uuidStr, StringBuilder filesToTransfer ) {
    String taskFileName = taskFileDir + "/" + "fdtDownloadTransferLog" + "_" + uuidStr;
    File taskFile;
    int numTries = 10;
    while(true) {
      taskFile = new File(taskFileName);
      if(!taskFile.exists()) {
        boolean success;
        try {
          success = taskFile.createNewFile();
          if (!success) {
            System.out.println("[FastDataTransferUploadStart CTLF] Error: unable to create fdtDownloadTransferLog file. " + taskFileName);
            return;
          }
          break;
        } catch (IOException e) {
          System.out.println("[FastDataTransferUploadStart CTLF] Error: unable to create fdtDownloadTransferLog file. " + taskFileName);
          return;
        }
      }
      // If the file already exists then try again but don't try forever
      numTries--;
      if(numTries == 0) {
        System.out.println("[FastDataTransferUploadStart CTLF] Error: Unable to create fdtDownloadTransferLog file: " + taskFileName);
        return;
      }
    }


    try {
      BufferedWriter pw = new BufferedWriter(new FileWriter(taskFile));
      pw.write(filesToTransfer.toString());
      pw.flush();
      pw.close();
    } catch (IOException e) {
      System.out.println("[FastDataTransferUploadStart CTLF] IOException: file " + taskFileName + " " + e.getMessage());
      return;
    }
  }

  public static Request findRequest(Session sess, String requestNumber) {
	  Request request = null;
	  List requests = sess.createQuery("SELECT req from Request req where req.number = '" + requestNumber + "'").list();
	  if (requests.size() == 1) {
	    request = (Request)requests.get(0);
	  }
	  return request;    
	}

}
