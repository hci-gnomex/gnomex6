package hci.gnomex.controller;

import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.security.UnknownPermissionException;
import hci.gnomex.model.Analysis;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.output.XMLOutputter;

import javax.naming.NamingException;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.sql.SQLException;
public class ShowAnalysisDownloadFormForGuest extends GNomExCommand implements Serializable {

	private static Logger LOG = Logger.getLogger(ShowAnalysisDownloadFormForGuest.class);

	public String SUCCESS_JSP = "/getHTML.jsp";

	private Integer idAnalysis;
	private String serverName;
	private String baseURL;
	private String emailAddress;

	private DictionaryHelper dictionaryHelper;

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
				secAdvisor = SecurityAdvisor.createGuest();
				createdSecurityAdvisor = true;
			}

			// Get the analysis
			Analysis analysis = (Analysis) sess.get(Analysis.class, idAnalysis);
			if (analysis == null) {
				this.addInvalidField("no analysis", "Analysis not found");
			}

			if (this.isValid()) {
				// Make sure user is authorized to read analysis
				if (secAdvisor.canRead(analysis)) {

					// Format an HTML page with the download links for this analysis
					String baseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null, PropertyDictionaryHelper.PROPERTY_ANALYSIS_DIRECTORY);
					String use_altstr = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.USE_ALT_REPOSITORY);
					if (use_altstr != null && use_altstr.equalsIgnoreCase("yes")) {
						baseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null,
								PropertyDictionaryHelper.ANALYSIS_DIRECTORY_ALT,this.getUsername());
					}

					Document doc = ShowAnalysisDownloadForm.formatDownloadHTML(analysis, secAdvisor, baseDir, baseURL, emailAddress);

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
			this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in ShowAnalysisDownloadFormForGuest ", e);

			throw new RollBackCommandException(e.getMessage());

		} catch (NamingException e) {
			this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in ShowAnalysisDownloadFormForGuest ", e);

			throw new RollBackCommandException(e.getMessage());

		} catch (SQLException e) {
			this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in ShowAnalysisDownloadFormForGuest ", e);

			throw new RollBackCommandException(e.getMessage());

		} catch (Exception e) {
			this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in ShowAnalysisDownloadFormForGuest ", e);

			throw new RollBackCommandException(e.getMessage());
		}

		return this;
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
