package hci.gnomex.controller;

import hci.gnomex.constants.Constants;
import hci.gnomex.model.FlowCell;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.model.Request;
import hci.gnomex.model.TransferLog;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.FileDescriptor;
import hci.gnomex.utility.*;
import org.apache.commons.codec.binary.Base64;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.math.BigDecimal;
import java.util.*;


public class DownloadSingleFileServlet extends HttpServlet {

  private static Logger LOG = Logger.getLogger(DownloadSingleFileServlet.class);

  private static String                          serverName = null;


  public void init() { }

  protected void doGet(HttpServletRequest req, HttpServletResponse response)
      throws ServletException, IOException {

    Integer idRequest = null;
    String baseDir = null;
    String baseDirFlowCell = null;
    String requestNumber = null;
    String fileName = null;
    String dir = "";
    String view = "N";
    boolean needToPreprocess = false;
    StringBuilder htmlText = new StringBuilder(1024000);
    String experimentDir = null;

    serverName = req.getServerName();
    String username = req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest";

      // Restrict commands to local host if request is not secure
      if (!ServletUtil.checkSecureRequest(req, LOG)) {
          ServletUtil.reportServletError(response, "Secure connection is required. Prefix your request with 'https'",
                  LOG, "Accessing secure command over non-secure line from remote host is not allowed.");
          return;
      }

    // Get the idRequest parameter
    if (req.getParameter("idRequest") != null && !req.getParameter("idRequest").equals("")) {
      idRequest = new Integer(req.getParameter("idRequest"));
    } else if (req.getParameter("requestNumber") != null && !req.getParameter("requestNumber").equals("")) {
      requestNumber = req.getParameter("requestNumber");
    }

    // Get the fileName parameter
    if (req.getParameter("fileName") != null && !req.getParameter("fileName").equals("")) {
      fileName = req.getParameter("fileName");
      // Change all backslash to forward slash for comparison
      fileName = fileName.replaceAll("\\\\", Constants.FILE_SEPARATOR);
    }
    // Get the dir parameter
    if (req.getParameter("dir") != null && !req.getParameter("dir").equals("")) {
      dir = req.getParameter("dir");
    }
    // Get the view flag
    if (req.getParameter("view") != null && !req.getParameter("view").equals("")) {
      view = req.getParameter("view");
    }
    if ((idRequest == null && requestNumber == null) || fileName == null) {
      LOG.error("idRequest/requestNumber and fileName required");

      response.setContentType("text/html; charset=UTF-8");
      response.getOutputStream().println("<html><head><title>Error</title></head>");
      response.getOutputStream().println("<body><b>");
      response.getOutputStream().println("Missing parameters:  idRequest and fileName required<br>");
      response.getOutputStream().println("</body>");
      response.getOutputStream().println("</html>");

      return;
    }

    InputStream in = null;
    SecurityAdvisor secAdvisor = null;
    try {
      // Get security advisor
     secAdvisor = (SecurityAdvisor) req.getSession().getAttribute(SecurityAdvisor.SECURITY_ADVISOR_SESSION_KEY);

      if (secAdvisor != null) {
        String mimeSpoofName = SpoofTxtFiles(fileName);

        // Set the content type and content disposition based on whether we
        // want to serve the file to the browser or download it.
    	String mimeType = req.getSession().getServletContext().getMimeType(mimeSpoofName); // recognized mime types are defined in Tomcat's web.xml

        if (view.equals("Y") && mimeType != null) {
          response.setContentType(mimeType);
          if(response.getCharacterEncoding() == null || (!response.getCharacterEncoding().equals("UTF-8") && !response.getCharacterEncoding().equals("utf-8"))) {
          	response.setCharacterEncoding("UTF-8");
					}
          response.setHeader("Content-Disposition", "filename=" + "\"" + fileName + "\"");
          response.setHeader("Cache-Control", "max-age=0, must-revalidate");
        } else {
          response.setContentType("application/x-download; charset=UTF-8");
          response.setHeader("Content-Disposition", "attachment;filename=" + "\"" + fileName + "\"");
          response.setHeader("Cache-Control", "max-age=0, must-revalidate");
        }

    	needToPreprocess = false;

        if (view.equals("Y")) {
          needToPreprocess = true;
          if (!(fileName.toLowerCase().endsWith("html") || fileName.toLowerCase().endsWith("htm"))) {
        	  needToPreprocess = false;
          }
	  }

        Session sess = secAdvisor.getHibernateSession(req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest");

        baseDirFlowCell = PropertyDictionaryHelper.getInstance(sess).getDirectory(
                req.getServerName(),
                null,
                PropertyDictionaryHelper.PROPERTY_FLOWCELL_DIRECTORY
        );

        Request experiment = null;
        if (idRequest != null) {
          experiment = (Request)sess.load(Request.class, idRequest);
        } else if (requestNumber != null){
          String queryBuf = "";
          if (requestNumber.toUpperCase().endsWith("R")) {
            queryBuf = "SELECT r from Request as r where r.number like '" + requestNumber +"%'";
          } else {
            queryBuf = "SELECT r from Request as r where r.number = '" + requestNumber +"'";
          }
          List rows = sess.createQuery(queryBuf).list();
          if (rows.size() > 0) {
            experiment = (Request)rows.iterator().next();
          }
        }

        // If we can't find the experiment in the database, just bypass it.
        if (experiment == null) {
          throw new Exception("Cannot find experiment " + idRequest);
        }

        // Check permissions - bypass this experiment if the user
        // does not have  permission to read it.
        if (!secAdvisor.canRead(experiment)) {
          throw new Exception(
                  "Insufficient permissions to read experiment " + experiment.getNumber() + ".  Bypassing download."
          );
        }

        baseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(
                req.getServerName(),
                experiment.getIdCoreFacility(),
                PropertyDictionaryHelper.PROPERTY_EXPERIMENT_DIRECTORY
        );

        // Now get the files that exist on the file server for this experiment
        Map requestMap = new TreeMap();
        Map directoryMap = new TreeMap();
        Map fileMap = new HashMap();
        List requestNumbers = new ArrayList<String>();
        Set folders = GetRequestDownloadList.getRequestDownloadFolders(
                baseDir,
                Request.getBaseRequestNumber(experiment.getNumber()),
                experiment.getCreateYear(),
                experiment.getCodeRequestCategory()
        );

        StringBuffer keys = new StringBuffer();
        keys.append(experiment.getKey(""));  // add base directory

        for(Iterator i = folders.iterator(); i.hasNext();) {
          String folder = (String)i.next();
          if (keys.length() > 0) {
            keys.append(":");
          }
          keys.append(experiment.getKey(folder));
        }
        // Also get the flow cells directories for this request
        for(Iterator i = DownloadSingleFileServlet.getFlowCells(sess, experiment).iterator(); i.hasNext();) {
          FlowCell flowCell      =  (FlowCell)i.next();

          String theCreateDate    = flowCell.formatDate((java.sql.Date)flowCell.getCreateDate());
          String dateTokens[] = theCreateDate.split("/");
          String createMonth = dateTokens[0];
          String createDay   = dateTokens[1];
          String theCreateYear  = dateTokens[2];
          String sortDate = theCreateYear + createMonth + createDay;

          String fcKey = flowCell.getCreateYear() + Constants.DOWNLOAD_KEY_SEPARATOR
              + sortDate + Constants.DOWNLOAD_KEY_SEPARATOR
              + experiment.getNumber() + Constants.DOWNLOAD_KEY_SEPARATOR
              + flowCell.getNumber() + Constants.DOWNLOAD_KEY_SEPARATOR
              + experiment.getIdCoreFacility() + Constants.DOWNLOAD_KEY_SEPARATOR
              + PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.FLOWCELL_DIRECTORY_FLAG);
          if (keys.length() > 0) {
            keys.append(":");
          }
          keys.append(fcKey);
        }

        UploadDownloadHelper.getFileNamesToDownload(
                sess,
                serverName,
                baseDirFlowCell,
                keys.toString(),
                requestNumbers,
                requestMap,
                directoryMap,
                PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.FLOWCELL_DIRECTORY_FLAG)
        );

        // Find the file matching the fileName passed in as a parameter
        FileDescriptor experimentFd = null;
        List directoryKeys   = (List)requestMap.get(experiment.getNumber());

        for(Iterator i1 = directoryKeys.iterator(); i1.hasNext();) {
          String directoryKey = (String)i1.next();
          String dirTokens[] = directoryKey.split(Constants.DOWNLOAD_KEY_SEPARATOR);
          String theDirectory = "";

          if (dirTokens.length > 1) {
            theDirectory = dirTokens[1];
          }

          List   theFiles     = (List)directoryMap.get(directoryKey);
          for(Iterator i2 = theFiles.iterator(); i2.hasNext();) {
            FileDescriptor fd = (FileDescriptor) i2.next();
            FileDescriptor matchingFd = recurseGetMatchingFileDescriptor(fd, fileName, theDirectory, dir);
            if (matchingFd != null) {
              experimentFd = matchingFd;
              break;
            }
          }
          if (experimentFd != null) {
            break;
          }
        }

        // If we found the experiment, download it
        if (experimentFd != null) {
          // Insert a transfer log entry
          TransferLog xferLog = new TransferLog();
          xferLog.setFileName(experimentFd.getFileName().substring(baseDir.length() + 5));
          xferLog.setStartDateTime(new java.util.Date(System.currentTimeMillis()));
          xferLog.setTransferType(TransferLog.TYPE_DOWNLOAD);
          xferLog.setTransferMethod(TransferLog.METHOD_HTTP);
          xferLog.setPerformCompression("Y");
          xferLog.setIdRequest(experiment.getIdRequest());
          xferLog.setIdLab(experiment.getIdLab());

          experimentDir = experimentFd.getFileName().substring(
                  0,
                  experimentFd.getFileName().lastIndexOf(Constants.FILE_SEPARATOR_CHAR) + 1
          );

          in = new FileInputStream(experimentFd.getFileName());
          OutputStream out = response.getOutputStream();

          byte b[] = new byte[102400];
          int numRead = 0;
          int size = 0;
          while (numRead != -1) {
            numRead = in.read(b);
            if (numRead != -1) {
              if (!needToPreprocess) {
                  out.write(b, 0, numRead);
              }
              else {
            	  // we are going to preprocess this, save it for now
            	  byte b1[] = new byte[numRead];
            	  System.arraycopy(b, 0, b1, 0, numRead);
            	  htmlText.append(new String (b1,"UTF-8"));
              }
              size += numRead;
            }
          }

          // Save transfer log
          xferLog.setFileSize(new BigDecimal(size));
          xferLog.setEndDateTime(new java.util.Date(System.currentTimeMillis()));
          sess.save(xferLog);

          in.close();

          if (needToPreprocess) {
        	  preProcessIMGTags (out, htmlText, dir, experimentDir);
          }

          out.flush();
          out.close();

          in = null;
          out = null;
        }

        sess.flush();

      } else {
        response.setContentType("text/html; charset=UTF-8");
        response.getOutputStream().println("<html><head><title>Error</title></head>");
        response.getOutputStream().println("<body><b>");
        response.getOutputStream().println(
            "DownloadSingleFileServlet: You must have a SecurityAdvisor in order to run this command." + "<br>"
        );
        response.getOutputStream().println("</body>");
        response.getOutputStream().println("</html>");
        System.out.println( "DownloadSingleFileServlet: You must have a SecurityAdvisor in order to run this command.");
      }
    } catch (Exception e) {
        String errorMessage = Util.GNLOG(LOG,"Error in DownloadSingleFileServlet ", e);
        System.out.println ("[DownloadSingleFileServlet] error: " + errorMessage);

        StringBuilder requestDump = Util.printRequest(req);
        String serverName = req.getServerName();

        PropertyDictionaryHelper propertyHelper = PropertyDictionaryHelper.getInstance(HibernateSession.currentSession());
        String gnomex_tester_email = propertyHelper.getProperty(PropertyDictionary.CONTACT_EMAIL_SOFTWARE_TESTER);

        /*
      Util.sendErrorReport(
              HibernateSession.currentSession(),
              gnomex_tester_email,
              "DoNotReply@hci.utah.edu",
              username,
              errorMessage,
              requestDump
      );
*/
      HibernateSession.rollback();

      response.setContentType("text/html; charset=UTF-8");
      response.getOutputStream().println("<html><head><title>Error</title></head>");
      response.getOutputStream().println("<body><b>");
      response.getOutputStream().println("DownloadSingleFileServlet: An exception occurred " + e.toString() + "<br>");
      response.getOutputStream().println("</body>");
      response.getOutputStream().println("</html>");


    } finally {
      try {
          if (secAdvisor != null) {
              secAdvisor.closeHibernateSession();
          }
      } catch (Exception e) {
      }

      if (in != null) {
        in.close();
      }
    }

  }

  private FileDescriptor recurseGetMatchingFileDescriptor(FileDescriptor fd, String fileName, String theDirectory, String dir) {
    // Change all backslash to forward slash for comparison
    String fdFileName = fd.getFileName().replaceAll("\\\\", Constants.FILE_SEPARATOR);

    if (fdFileName.equals(fileName) || (dir.length() == 0 && theDirectory.equals("upload_staging"))) {
      return fd;
    } else if (fd.getChildren() != null && fd.getChildren().size() > 0) {
      for(Iterator i = fd.getChildren().iterator(); i.hasNext();) {
        FileDescriptor childFd = (FileDescriptor)i.next();
        FileDescriptor matchingFd = recurseGetMatchingFileDescriptor(childFd, fileName, childFd.getDirectoryName(), dir);
        if (matchingFd != null) {
          return matchingFd;
        }
      }
      return null;
    } else {
      return null;
    }
  }

  public static List getFlowCells(Session sess, Request experiment) {
    StringBuffer queryBuf = new StringBuffer();
    queryBuf.append(" SELECT DISTINCT fc ");
    queryBuf.append(" FROM           Request as req ");
    queryBuf.append(" JOIN           req.sequenceLanes as l ");
    queryBuf.append(" JOIN           l.flowCellChannel as ch ");
    queryBuf.append(" JOIN           ch.flowCell as fc ");
    queryBuf.append(" WHERE          req.idRequest = " + experiment.getIdRequest());
    queryBuf.append(" ORDER BY fc.number");

    return sess.createQuery(queryBuf.toString()).list();
  }

private void preProcessIMGTags (OutputStream out, StringBuilder htmlText, String dir, String experimentDir) {
	int 					ipos = -1; 			// start of <img tag
	int						epos = -1; 			// > end of tag
	int						nxtpos = 0;			// next position in htmlText to search
	int						lenhtmlText = -1;	// size of htmlText

	lenhtmlText = htmlText.length();

	while (nxtpos < lenhtmlText) {
		// find the start of the <img tag
		ipos = htmlText.indexOf("<img",nxtpos);

		if (ipos == -1) {
			// we are done, put the rest out
			epos = lenhtmlText - 1;
			outString (htmlText,nxtpos,epos,out);
			break;
		}

		epos = htmlText.indexOf(">",ipos+4);
		if (epos == -1) {
			// assume it was the last characer
			epos = lenhtmlText - 1;
		}

		// put out everything up to the image tag
		outString (htmlText,nxtpos,ipos,out);

		// get the line
		String imgline = htmlText.substring (ipos, epos+1);

		// process it
		if (!processIMG (imgline,out, dir, experimentDir)) {
			// not the kind of img we are interested in, output the original text here
			outString (htmlText,ipos,epos+1,out);
		}

		nxtpos = epos + 1;
	} // end of while
}

private void outString (StringBuilder theText, int startpos, int endpos, OutputStream out) {

	String theBytes = theText.substring(startpos,endpos);
	byte[] asBytes = null;

	try {
		asBytes = theBytes.getBytes("UTF-8");
		out.write(asBytes);
	} catch (UnsupportedEncodingException e) {
		// TODO Auto-generated catch block
	} catch (IOException e) {
		// TODO Auto-generated catch block
	}
}

private boolean processIMG (String imgline, OutputStream out, String dir, String experimentDir) {
	boolean processed = false;

	// if already an inline base64 image, just return
	int jpos = imgline.indexOf("src=\"data:image/");
	if (jpos != -1) {
		return processed;
	}


	// there are two types of syntax, image tags containing DownloadSingleFileServlet
	// and those with src="local image name" without a &dir specified
	int syntaxType = 1;								// assume DownloadSingleFileServlet
	int ipos = imgline.indexOf("DownloadSingleFileServlet");
	if (ipos == -1) {
		syntaxType = 2;
	}

	String localdir = null;
	String fileName = null;
	String imageType = "png";
	int startA = 0;							// <
	int endA = 0;							// everything upto src=
	int startC = 0;							// everything after close " on src filename

	if (syntaxType == 1) {
		// get the image filename, here's an example of what the html looks like
		// <img src="https://b2b.hci.utah.edu/gnomex/DownloadSingleFileServlet.gx?requestNumber=103R&fileName=per_base_quality.png&view=Y&dir=Images">
		ipos = imgline.indexOf("fileName=");
		if (ipos == -1) {
			// not a format we can deal with
			return processed;
		}

		int epos = imgline.indexOf("&",ipos+9);
		if (epos == -1) {
			return processed;
		}

		fileName = imgline.substring(ipos+9,epos);

		// figure out what type of image it is
		imageType = "png";
		ipos = fileName.lastIndexOf('.');
		if (ipos != -1 && (ipos+1 < fileName.length()) ) {
			imageType = fileName.substring(ipos+1);
		}

		// get the directory
		ipos = imgline.indexOf("&dir=");
		if (ipos == -1) {
			return processed;
		}

		epos = imgline.indexOf('"',ipos+5);
		if (epos == -1) {
			return processed;
		}

		localdir = imgline.substring(ipos+5,epos) + Constants.FILE_SEPARATOR;
	}
	else if (syntaxType == 2) {
		// <img src="UGP07_Trio_Rec_Pnt_Splice_Indel_10e4.png" alt="Run '.....' " style="width: 100%">
		ipos = imgline.indexOf("src=");
		if (ipos == -1) {
			// not a format we can deal with
			return processed;
		}

		endA = ipos;			// end of everything upto src=
		ipos = imgline.indexOf('"',ipos+4);
		if (ipos == -1) {
			// not a format we can deal with
			return processed;
		}

		int epos = imgline.indexOf('"',ipos+1);
		if (epos == -1) {
			return processed;
		}
		startC = epos+1;		// start up everything after the image name
		fileName = imgline.substring(ipos+1,epos);
		if (fileName.toLowerCase().startsWith("http")) {
			// we only deal with local filenames
			return processed;
		}

		// figure out what type of image it is
		imageType = "png";
		ipos = fileName.lastIndexOf('.');
		if (ipos != -1 && (ipos+1 < fileName.length()) ) {
			imageType = fileName.substring(ipos+1);
		}


		localdir = dir + Constants.FILE_SEPARATOR;
		if (experimentDir.endsWith(localdir))
		{
			localdir = "";
		}
	}

	// get the file
	String pathname = experimentDir + localdir + fileName;
	File imageFd = new File(pathname);

	// read it in
	long filesize = imageFd.length();
	byte thefile[] = new byte[(int)filesize];

    FileInputStream inf;
    boolean readImageOK = true;
	try {
		inf = new FileInputStream(pathname);
		int numRead = 0;
        numRead = inf.read(thefile);
        inf.close();
	} catch (FileNotFoundException e) {
		// TODO Auto-generated catch block
		readImageOK = false;

	} catch (IOException e) {
		// TODO Auto-generated catch block
		readImageOK = false;
	}

	if (!readImageOK) {
		return processed;
	}

	// convert it to base64
	byte[] encodedBytes = Base64.encodeBase64(thefile);

	// now build the <img tag
	StringBuilder imgtag = new StringBuilder (1024000);
	//imgtag.append("<img src=\"data:image/png;base64,");
	if (syntaxType == 1) {
		imgtag.append("<img src=\"data:image/");
		imgtag.append(imageType);
		imgtag.append(";base64,");

		imgtag.append(new String(encodedBytes));
		imgtag.append("\" />");
	}
	else if (syntaxType == 2) {
		String partA = imgline.substring(startA,endA);
		imgtag.append(partA);

		imgtag.append("src=\"data:image/");
		imgtag.append(imageType);
		imgtag.append(";base64,");

		imgtag.append(new String(encodedBytes));
		imgtag.append("\"");

		String partC = imgline.substring(startC);
		imgtag.append(partC);
	}

	// write it out
	outString (imgtag,0,imgtag.length(),out);
	processed = true;

	return processed;
}

  /**
   * A helper function which assists in the process of allowing files to be served as though they were txt files,
   * changing how the browser interacts with them.
   * @param fileName    the original fileName
   * @return            If the file type is listed in Constants.FILE_EXTENSIONS_FOR_VIEW_CUSTOM_TEXT_FILES, then
   *                    returns the properly-formatted filename with a .txt extension.
   *                    Otherwise, returns the original filename.
   */
  public static String SpoofTxtFiles(String fileName) {
      String spoofName = fileName;

      if (fileName != null && !fileName.equals("")) {
          // If the file has a custom extension, but should be displayed as a text file, then load it as a text file.
          for(String extension : Constants.FILE_EXTENSIONS_FOR_VIEW_CUSTOM_TEXT_FILES) {
              if (fileName.endsWith(extension)) {
                  spoofName = fileName.substring(0, fileName.length() - extension.length()) + ".txt";
                  break;
              }
          }
      }

      return spoofName;
  }
}
