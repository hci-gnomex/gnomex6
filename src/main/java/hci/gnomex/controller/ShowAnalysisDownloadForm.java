package hci.gnomex.controller;

import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.security.UnknownPermissionException;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.Analysis;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.naming.NamingException;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.sql.SQLException;
import java.util.*;
public class ShowAnalysisDownloadForm extends GNomExCommand implements Serializable {

	private static Logger LOG = Logger.getLogger(ShowAnalysisDownloadForm.class);

	public String SUCCESS_JSP = "/getHTML.jsp";

	private Integer idAnalysis;
	private String serverName;
	private String baseURL;
	private String emailAddress;

	private boolean createdSecurityAdvisor = false;
	private SecurityAdvisor secAdvisor = null;

	public void validate() {
	}

	public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

		if (request.getParameter("idAnalysis") != null) {
			idAnalysis = Integer.valueOf(request.getParameter("idAnalysis"));
		} else {
			this.addInvalidField("idAnalysis", "idAnalysis is required");
		}

		emailAddress = "";
		if (request.getParameter("emailAddress") != null) {
			emailAddress = request.getParameter("emailAddress");
		}

		serverName = request.getServerName();

		baseURL = (request.isSecure() ? "https://" : "http://") + serverName + request.getContextPath();

	}

	public Command execute() throws RollBackCommandException {
		Session sess = null;
		try {

			sess = HibernateSession.currentReadOnlySession(getUsername());

			// Get security advisor, create one hasn't already been created for this session.
			secAdvisor = this.getSecAdvisor();
			if (secAdvisor == null) {
				secAdvisor = SecurityAdvisor.create(sess, this.getUsername());
				createdSecurityAdvisor = true;
			}

			// Get the analysis
			Analysis analysis = (Analysis) sess.get(Analysis.class, idAnalysis);
			if (analysis == null) {
				this.addInvalidField("no analysis", "Analysis not found");
			}

			if (this.isValid()) {
				// Make sure the user can read the analysis
				if (secAdvisor.canRead(analysis)) {

					// Format an HTML page with links to download the files
					String baseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null, PropertyDictionaryHelper.PROPERTY_ANALYSIS_DIRECTORY);
					String use_altstr = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.USE_ALT_REPOSITORY);
					if (use_altstr != null && use_altstr.equalsIgnoreCase("yes")) {
						baseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null,
								PropertyDictionaryHelper.ANALYSIS_DIRECTORY_ALT,this.getUsername());
					}
					Document doc = formatDownloadHTML(analysis, secAdvisor, baseDir, baseURL, emailAddress);

					XMLOutputter out = new org.jdom.output.XMLOutputter();
					out.setOmitEncoding(true);
					this.xmlResult = out.outputString(doc);
					this.xmlResult = this.xmlResult.replaceAll("&amp;", "&");
					this.xmlResult = this.xmlResult.replaceAll("�", "&micro");

				} else {
					this.addInvalidField("Insufficient permissions", "Insufficient permission to show analysis download form.");
				}

			}

			if (isValid()) {
				setResponsePage(this.SUCCESS_JSP);
			} else {
				setResponsePage(this.ERROR_JSP);
			}

		} catch (UnknownPermissionException e) {
			this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in ShowAnalysisDownloadForm ", e);

			throw new RollBackCommandException(e.getMessage());

		} catch (NamingException e) {
			this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in ShowAnalysisDownloadForm ", e);

			throw new RollBackCommandException(e.getMessage());

		} catch (SQLException e) {
			this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in ShowAnalysisDownloadForm ", e);

			throw new RollBackCommandException(e.getMessage());

		} catch (Exception e) {
			this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in ShowAnalysisDownloadForm ", e);

			throw new RollBackCommandException(e.getMessage());
		}

		return this;
	}

	/***
	 * Format an HTML page showing download links for each of the files of this analysis
	 * 
	 */
	public static Document formatDownloadHTML(Analysis analysis, SecurityAdvisor secAdvisor, String baseDir, String baseURL, String emailAddress)
			throws UnknownPermissionException {
		Element root = new Element("HTML");
		Document doc = new Document(root);

		Element head = new Element("HEAD");
		root.addContent(head);

		Element link = new Element("link");
		link.setAttribute("rel", "stylesheet");
		link.setAttribute("type", "text/css");
		link.setAttribute("href", Constants.REQUEST_FORM_CSS);
		head.addContent(link);

		Element title = new Element("TITLE");
		title.addContent("Download Files for Analysis - " + analysis.getNumber());
		head.addContent(title);

		Element body = new Element("BODY");
		root.addContent(body);

		Element outerDiv = new Element("DIV");
		outerDiv.setAttribute("id", "container");
		body.addContent(outerDiv);

		Element maindiv = new Element("DIV");
		maindiv.setAttribute("id", "containerForm");
		outerDiv.addContent(maindiv);

		Element img = new Element("img");
		img.setAttribute("src", "images/navbar.png");
		maindiv.addContent(img);

		Element hintBox = new Element("h3");
		hintBox.setAttribute("class", "downloadHint");
		hintBox.addContent("Note to Internet Explorer users: your browser is unable to download files over 4 gigabytes (IE 6 limit is 2 gigabytes). To download large files, switch to another browser like Firefox or Opera.");
		maindiv.addContent(hintBox);

		// for(Iterator ie = experiments.iterator(); ie.hasNext();) {
		// Request experiment = (Request)ie.next();

		// Make sure the user can read the experiment
		if (!secAdvisor.canRead(analysis)) {
			throw new UnknownPermissionException("Insufficient permissions to show download form for analysis " + analysis.getNumber());
		}
		Element h = new Element("h1");
		h.setAttribute("class", "downloadHeader");
		h.addContent("Download Analysis Files for " + analysis.getNumber());
		maindiv.addContent(h);

		Map analysisMap = new TreeMap();
		Map directoryMap = new TreeMap();
		Map fileMap = new HashMap();
		List analysisNumbers = new ArrayList<String>();

		GetExpandedAnalysisFileList.getFileNamesToDownload(baseDir, analysis.getKey(), analysisNumbers, analysisMap, directoryMap, false);
		addMainDownloadTable(baseURL, maindiv, "unfiled", analysisMap, directoryMap, analysis.getNumber(), analysis.getIdAnalysis());

		Element br = new Element("br");
		maindiv.addContent(br);

		// Now get the files that exist on the file server for this experiment
		Set<String> folders = GetAnalysisDownloadList.getAnalysisDownloadFolders(baseDir, analysis.getNumber(), analysis.getCreateYear());
		for (Iterator i = folders.iterator(); i.hasNext();) {
			String folder = (String) i.next();

			analysisMap = new TreeMap();
			directoryMap = new TreeMap();
			fileMap = new HashMap();
			analysisNumbers = new ArrayList<String>();
			boolean flattenSubDirs = true;

			GetExpandedAnalysisFileList.getFileNamesToDownload(baseDir, analysis.getKey(folder), analysisNumbers, analysisMap, directoryMap, flattenSubDirs);
			addDownloadTable(baseURL, maindiv, folder, analysisMap, directoryMap, analysis.getNumber(), analysis.getIdAnalysis(), emailAddress);

			if (i.hasNext()) {
				br = new Element("br");
				maindiv.addContent(br);
			}
		}

		br = new Element("br");
		maindiv.addContent(br);

		return doc;

		// h = new Element("h1");
		// h.setAttribute("class", "downloadHeader");
		// h.addContent("Download Analysis Files");
		// maindiv.addContent(h);
		//
		// h = new Element("h2");
		// h.setAttribute("class", "downloadHeader");
		// h.addContent(analysis.getNumber() + " - " + analysis.getName());
		// maindiv.addContent(h);
		//
		//
		// Element tableNode = new Element("table");
		// maindiv.addContent(tableNode);
		//
		//
		// // Hash the know analysis files
		// Map knownAnalysisFileMap = new HashMap();
		// for(Iterator i = analysis.getFiles().iterator(); i.hasNext();) {
		// AnalysisFile af = (AnalysisFile)i.next();
		// knownAnalysisFileMap.put(af.getFileName(), af);
		// }
		//
		// // Now get the files that exist on the file server for this analysis
		// Map analysisMap = new TreeMap();
		// Map directoryMap = new TreeMap();
		// Map fileMap = new HashMap();
		// List analysisNumbers = new ArrayList<String>();
		// GetExpandedAnalysisFileList.getFileNamesToDownload(baseDir, analysis.getKey(), analysisNumbers, analysisMap, directoryMap);
		//
		// // Find the file matching the fileName passed in as a parameter
		// FileDescriptor analysisFd = null;
		// List directoryKeys = (List)analysisMap.get(analysis.getNumber());
		// for(Iterator i1 = directoryKeys.iterator(); i1.hasNext();) {
		// String directoryKey = (String)i1.next();
		// List theFiles = (List)directoryMap.get(directoryKey);
		// for(Iterator i2 = theFiles.iterator(); i2.hasNext();) {
		// FileDescriptor fd = (FileDescriptor)i2.next();
		// AnalysisFile af = (AnalysisFile)knownAnalysisFileMap.get(fd.getDisplayName());
		// if (af != null) {
		// fd.setComments(af.getComments());
		// }
		//
		//
		// Element downloadLink = new Element("A");
		// downloadLink.setAttribute("href", baseURL + Constants.FILE_SEPARATOR + Constants.DOWNLOAD_ANALYSIS_SINGLE_FILE_SERVLET + "?idAnalysis=" + analysis.getIdAnalysis() +
		// "&fileName=" + fd.getDisplayName());
		// downloadLink.addContent(fd.getDisplayName());
		//
		// tableNode.addContent(makeRow(downloadLink, fd.getComments(), fd.getFileSizeText()));
		// }
		// }
		// return doc;

	}

	private static void addDownloadTable(String baseURL, Element maindiv, String folder, Map analysisMap, Map directoryMap, String analysisNumber,
			Integer idAnalysis, String emailAddress) {
		Element tableNode = new Element("table");
		maindiv.addContent(tableNode);
		Element caption = new Element("caption");
		caption.setAttribute("class", "narrow");
		caption.addContent(folder);
		tableNode.addContent(caption);

		FileDescriptor analysisFd = null;
		List directoryKeys = (List) analysisMap.get(analysisNumber);
		if (directoryKeys != null) {
			for (Iterator i1 = directoryKeys.iterator(); i1.hasNext();) {
				String directoryKey = (String) i1.next();
				String dirTokens[] = directoryKey.split("-");
				List theFiles = (List) directoryMap.get(directoryKey);
				for (Iterator i2 = theFiles.iterator(); i2.hasNext();) {
					FileDescriptor fd = (FileDescriptor) i2.next();
					fd.setQualifiedFilePath(dirTokens[0]);

					recurseAddFileRow(baseURL, tableNode, fd, idAnalysis, emailAddress);

				}
			}
		}

	}

	private static void addMainDownloadTable(String baseURL, Element maindiv, String folder, Map analysisMap, Map directoryMap, String analysisNumber,
			Integer idAnalysis) {
		Element tableNode = new Element("table");
		maindiv.addContent(tableNode);
		Element caption = new Element("caption");
		caption.setAttribute("class", "narrow");
		caption.addContent(folder);
		tableNode.addContent(caption);

		List directoryKeys = (List) analysisMap.get(analysisNumber);
		if (directoryKeys != null) {
			for (Iterator i1 = directoryKeys.iterator(); i1.hasNext();) {

				String directoryKey = (String) i1.next();
				String dirTokens[] = directoryKey.split("-");
				List theFiles = (List) directoryMap.get(directoryKey);

				// For each file in the directory
				boolean firstFileInDir = true;
				for (Iterator i2 = theFiles.iterator(); i2.hasNext();) {
					FileDescriptor fd = (FileDescriptor) i2.next();
					fd.setQualifiedFilePath(dirTokens[0]);

					if (fd.getType() != null && !fd.getType().equals("dir")) {
						String dirParm = fd.getQualifiedFilePath() != null && !fd.getQualifiedFilePath().equals("") ? "&dir=" + fd.getQualifiedFilePath() : "";

						Element downloadLink = new Element("A");
						downloadLink.setAttribute("href", baseURL + Constants.FILE_SEPARATOR + Constants.DOWNLOAD_ANALYSIS_SINGLE_FILE_SERVLET + "?idAnalysis=" + idAnalysis
								+ "&fileName=" + fd.getDisplayName() + dirParm);
						downloadLink.addContent(fd.getDisplayName());

						tableNode.addContent(makeRow(downloadLink, "", fd.getFileSizeText()));
					}
				}

			}
		}
	}

	private static void recurseAddFileRow(String baseURL, Element tableNode, FileDescriptor fd, Integer idAnalysis, String emailAddress) {
		if (fd.getChildren() != null && fd.getChildren().size() > 0) {
			for (Iterator i = fd.getChildren().iterator(); i.hasNext();) {
				FileDescriptor childFd = (FileDescriptor) i.next();
				recurseAddFileRow(baseURL, tableNode, childFd, idAnalysis, emailAddress);
			}
		} else {
			String dirParm = fd.getQualifiedFilePath() != null && !fd.getQualifiedFilePath().equals("") ? "&dir=" + fd.getQualifiedFilePath() : "";

			String emailParm = "";
			try {
				emailParm = "&emailAddress=" + URLEncoder.encode(emailAddress, "UTF-8");
			} catch (UnsupportedEncodingException ex) {
				LOG.error("Unable to encode email address", ex);
			}

			Element downloadLink = new Element("A");
			downloadLink.setAttribute("href",
					baseURL + Constants.FILE_SEPARATOR + Constants.DOWNLOAD_ANALYSIS_SINGLE_FILE_SERVLET + "?idAnalysis=" + idAnalysis + "&fileName=" + fd.getDisplayName()
							+ emailParm + dirParm);
			downloadLink.addContent(fd.getDisplayName());

			tableNode.addContent(makeRow(downloadLink, "", fd.getFileSizeText()));
		}

	}

	private static Element makeHeaderRow() {
		Element row = new Element("TR");

		Element cell = new Element("TH");
		cell.addContent("File");
		row.addContent(cell);

		cell = new Element("TH");
		cell.addContent("Comments");
		row.addContent(cell);

		cell = new Element("TH");
		cell.addContent("Size");
		row.addContent(cell);

		return row;
	}

	private static Element makeRow(Element link, String comment, String fileSize) {
		Element row = new Element("TR");

		Element cell = new Element("TD");
		cell.setAttribute("class", "noborder");
		cell.addContent(link);
		row.addContent(cell);

		cell = new Element("TD");
		cell.setAttribute("class", "noborder");
		cell.addContent(comment == null || comment.equals("") ? "&nbsp;" : comment);
		row.addContent(cell);

		cell = new Element("TD");
		cell.setAttribute("class", "noborderSmall");
		cell.addContent(fileSize);
		row.addContent(cell);

		return row;
	}

	/**
	 * The callback method called after the loadCommand, and execute methods, this method allows you to manipulate the HttpServletResponse object prior to
	 * forwarding to the result JSP (add a cookie, etc.)
	 *
	 *            The HttpServletResponse for the command
	 * @return The processed response
	 */
	public HttpServletResponse setResponseState(HttpServletResponse response) {
		return response;
	}

	/**
	 * The callback method called after the loadCommand and execute methods allowing you to do any post-execute processing of the HttpSession. Should be used to
	 * add/remove session data resulting from the execution of this command
	 *
	 * @param session
	 *            The HttpSession
	 * @return The processed HttpSession
	 */
	public HttpSession setSessionState(HttpSession session) {
		if (createdSecurityAdvisor) {
			session.setAttribute(SecurityAdvisor.SECURITY_ADVISOR_SESSION_KEY, secAdvisor);
		}
		return session;
	}

}
