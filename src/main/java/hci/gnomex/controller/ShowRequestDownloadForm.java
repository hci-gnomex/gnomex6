package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.security.UnknownPermissionException;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.FlowCell;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.model.Request;
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
import java.sql.SQLException;
import java.util.*;
public class ShowRequestDownloadForm extends GNomExCommand implements Serializable {

	private static Logger LOG = Logger.getLogger(ShowRequestDownloadForm.class);

	public String SUCCESS_JSP = "/getHTML.jsp";

	private Integer idRequest;
	private String requestNumbers;
	private String serverName;
	private String baseURL;

	private boolean createdSecurityAdvisor = false;
	private SecurityAdvisor secAdvisor = null;

	public void validate() {
	}

	public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

		if (request.getParameter("idRequest") != null) {
			idRequest = Integer.valueOf(request.getParameter("idRequest"));
		}
		if (request.getParameter("requestNumbers") != null) {
			requestNumbers = request.getParameter("requestNumbers");
		}

		if (idRequest == null && requestNumbers == null) {
			this.addInvalidField("requestNumbers or idRequest", "requestNumber or idRequest is required");
		}

		serverName = request.getServerName();

		baseURL = (request.isSecure() ? "https://" : "http://") + serverName + ":" + request.getServerPort() + request.getContextPath();

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

			// Get the experiment(s)
			List experiments = getExperiments(sess, idRequest, requestNumbers);
			if (experiments == null || experiments.size() == 0) {
				this.addInvalidField("no experiment", "Request not found");
			}

			if (this.isValid()) {
				// Format an HTML page with links to download the files
				String baseDirFlowCell = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null, PropertyDictionaryHelper.PROPERTY_FLOWCELL_DIRECTORY);
				Document doc = formatDownloadHTML(sess, secAdvisor, experiments, serverName, baseDirFlowCell, baseURL);

				XMLOutputter out = new org.jdom.output.XMLOutputter();
				out.setOmitEncoding(true);
				this.xmlResult = out.outputString(doc);
				this.xmlResult = this.xmlResult.replaceAll("&amp;", "&");
				this.xmlResult = this.xmlResult.replaceAll("�", "&micro");

			}

			if (isValid()) {
				setResponsePage(this.SUCCESS_JSP);
			} else {
				setResponsePage(this.ERROR_JSP);
			}

		} catch (UnknownPermissionException e) {
			this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in ShowRequestDownloadForm ", e);

			throw new RollBackCommandException(e.getMessage());

		} catch (NamingException e) {
			this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in ShowRequestDownloadForm ", e);

			throw new RollBackCommandException(e.getMessage());

		} catch (SQLException e) {
			this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in ShowRequestDownloadForm ", e);

			throw new RollBackCommandException(e.getMessage());

		} catch (Exception e) {
			this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in ShowRequestDownloadForm ", e);

			throw new RollBackCommandException(e.getMessage());
		}

		return this;
	}

	public static List getExperiments(Session sess, Integer idRequest, String requestNumbers) {
		List experiments = new ArrayList();
		if (idRequest != null) {
			Request experiment = (Request) sess.get(Request.class, idRequest);
			experiments.add(experiment);
		} else if (requestNumbers != null) {
			String tokens[] = requestNumbers.split(":");
			for (int x = 0; x < tokens.length; x++) {
				String requestNumber = tokens[x];
				String queryBuf = "";
				if (requestNumber.toUpperCase().endsWith("R")) {
					queryBuf = "SELECT r from Request as r where r.number like '" + Request.getBaseRequestNumber(requestNumber) + "%'";
				} else {
					queryBuf = "SELECT r from Request as r where r.number = '" + requestNumber + "'";
				}
				List results = sess.createQuery(queryBuf).list();
				experiments.addAll(results);
			}
		}
		return experiments;
	}

	/***
	 * Format an HTML page showing download links for each of the files of this experiment
	 * 
	 */
	public static Document formatDownloadHTML(Session sess, SecurityAdvisor secAdvisor, List experiments, String serverName, String baseDirFlowCell,
			String baseURL) throws UnknownPermissionException {
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
		title.addContent("GNomEx Download Files");
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

		for (Iterator ie = experiments.iterator(); ie.hasNext();) {
			Request experiment = (Request) ie.next();

			String baseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, experiment.getIdCoreFacility(), PropertyDictionaryHelper.PROPERTY_EXPERIMENT_DIRECTORY);

			// Make sure the user can read the experiment
			if (!secAdvisor.canRead(experiment)) {
				throw new UnknownPermissionException("Insufficient permissions to show download form for experiment " + experiment.getNumber());
			}
			Element h = new Element("h1");
			h.setAttribute("class", "downloadHeader");
			h.addContent("Download Experiment Files for " + experiment.getNumber());
			maindiv.addContent(h);

			// Now get the files that exist on the file server for this experiment
			Set folders = GetRequestDownloadList.getRequestDownloadFolders(baseDir, Request.getBaseRequestNumber(experiment.getNumber()),
					experiment.getCreateYear(), experiment.getCodeRequestCategory());
			for (Iterator i = folders.iterator(); i.hasNext();) {
				String folder = (String) i.next();

				Map requestMap = new TreeMap();
				Map directoryMap = new TreeMap();
				Map fileMap = new HashMap();
				List requestNumbers = new ArrayList<String>();
				boolean flattenSubDirs = true;
				UploadDownloadHelper.getFileNamesToDownload(sess, serverName, baseDirFlowCell, experiment.getKey(folder), requestNumbers, requestMap,
						directoryMap, PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.FLOWCELL_DIRECTORY_FLAG), flattenSubDirs);
				addDownloadTable(baseURL, maindiv, folder, requestMap, directoryMap, experiment.getNumber(), experiment.getIdRequest(), null);

				if (i.hasNext()) {
					Element br = new Element("br");
					maindiv.addContent(br);
				}
			}

			Element br = new Element("br");
			maindiv.addContent(br);

			for (Iterator i = DownloadSingleFileServlet.getFlowCells(sess, experiment).iterator(); i.hasNext();) {
				FlowCell flowCell = (FlowCell) i.next();

				String theCreateDate = flowCell.formatDate((java.sql.Date) flowCell.getCreateDate());
				String dateTokens[] = theCreateDate.split(Constants.FILE_SEPARATOR);
				String createMonth = dateTokens[0];
				String createDay = dateTokens[1];
				String theCreateYear = dateTokens[2];
				String sortDate = theCreateYear + createMonth + createDay;

				String fcKey = flowCell.getCreateYear() + Constants.DOWNLOAD_KEY_SEPARATOR + sortDate + Constants.DOWNLOAD_KEY_SEPARATOR
						+ experiment.getNumber() + Constants.DOWNLOAD_KEY_SEPARATOR + flowCell.getNumber() + Constants.DOWNLOAD_KEY_SEPARATOR
						+ experiment.getIdCoreFacility() + Constants.DOWNLOAD_KEY_SEPARATOR
						+ PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.FLOWCELL_DIRECTORY_FLAG);

				Map requestMap = new TreeMap();
				Map directoryMap = new TreeMap();
				Map fileMap = new HashMap();
				List requestNumbers = new ArrayList<String>();
				boolean flattenSubDirs = true;
				UploadDownloadHelper.getFileNamesToDownload(sess, serverName, baseDirFlowCell, fcKey, requestNumbers, requestMap, directoryMap,
						PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.FLOWCELL_DIRECTORY_FLAG), flattenSubDirs);
				addDownloadTable(baseURL, maindiv, flowCell.getNumber(), requestMap, directoryMap, experiment.getNumber(), experiment.getIdRequest(),
						flowCell.getIdFlowCell());

			}
			if (ie.hasNext()) {
				br = new Element("br");
				maindiv.addContent(br);
				br = new Element("br");
				maindiv.addContent(br);
				br = new Element("br");
				maindiv.addContent(br);
			}

		}

		return doc;

	}

	private static void addDownloadTable(String baseURL, Element maindiv, String folder, Map requestMap, Map directoryMap, String requestNumber,
			Integer idRequest, Integer idFlowCell) {
		Element tableNode = new Element("table");
		maindiv.addContent(tableNode);
		Element caption = new Element("caption");
		caption.setAttribute("class", "narrow");
		caption.addContent((idFlowCell != null ? "Flow Cell " : "") + folder);
		tableNode.addContent(caption);

		FileDescriptor experimentFd = null;
		List directoryKeys = (List) requestMap.get(requestNumber);
		if (directoryKeys != null) {
			for (Iterator i1 = directoryKeys.iterator(); i1.hasNext();) {
				String directoryKey = (String) i1.next();
				String dirTokens[] = directoryKey.split(Constants.DOWNLOAD_KEY_SEPARATOR);
				List theFiles = (List) directoryMap.get(directoryKey);
				for (Iterator i2 = theFiles.iterator(); i2.hasNext();) {
					FileDescriptor fd = (FileDescriptor) i2.next();
					fd.setDirectoryName(dirTokens[1]);

					recurseAddFileRow(baseURL, tableNode, fd, idRequest);

				}
			}
		}

	}

	private static void recurseAddFileRow(String baseURL, Element tableNode, FileDescriptor fd, Integer idRequest) {
		if (fd.getChildren() != null && fd.getChildren().size() > 0) {
			for (Iterator i = fd.getChildren().iterator(); i.hasNext();) {
				FileDescriptor childFd = (FileDescriptor) i.next();
				recurseAddFileRow(baseURL, tableNode, childFd, idRequest);
			}
		} else {
			String dirParm = fd.getDirectoryName() != null && !fd.getDirectoryName().equals("") ? "&dir=" + fd.getDirectoryName() : "";

			Element downloadLink = new Element("A");
			downloadLink.setAttribute("href",
					baseURL + Constants.FILE_SEPARATOR + Constants.DOWNLOAD_SINGLE_FILE_SERVLET + "?idRequest=" + idRequest + "&fileName=" + fd.getDisplayName() + dirParm);
			downloadLink.addContent(fd.getDisplayName());

			tableNode.addContent(makeRow(downloadLink, fd.getFileSizeText()));
		}

	}

	private static Element makeHeaderRow() {
		Element row = new Element("TR");

		Element cell = new Element("TH");
		cell.addContent("File");
		row.addContent(cell);

		cell = new Element("TH");
		cell.addContent("Size");
		row.addContent(cell);

		return row;
	}

	private static Element makeRow(Element link, String fileSize) {
		Element row = new Element("TR");

		Element cell = new Element("TD");
		cell.setAttribute("class", "noborder");
		cell.addContent(link);
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
