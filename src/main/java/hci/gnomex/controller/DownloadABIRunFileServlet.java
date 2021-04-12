package hci.gnomex.controller;

import hci.framework.model.DetailObject;
import hci.gnomex.model.AppUser;
import hci.gnomex.model.InstrumentRun;
import hci.gnomex.model.InstrumentRunStatus;
import hci.gnomex.model.Plate;
import hci.gnomex.model.PlateWell;
import hci.gnomex.model.ReactionType;
import hci.gnomex.model.Request;
import hci.gnomex.model.RequestStatus;
import hci.gnomex.model.SealType;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.*;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Element;

public class DownloadABIRunFileServlet extends HttpServlet {

private static Logger LOG = Logger.getLogger(DownloadABIRunFileServlet.class);

public void init() {

}

protected void doGet(HttpServletRequest req, HttpServletResponse response) throws ServletException, IOException {
	InstrumentRun ir = null;
	Integer idInstrumentRun = null;
	String codeReactionType = ReactionType.SEQUENCING_REACTION_TYPE;
	// Restrict commands to local host if request is not secure
	if (!ServletUtil.checkSecureRequest(req, LOG)) {
		ServletUtil.reportServletError(response, "Secure connection is required. Prefix your request with 'https'",
				LOG, "Accessing secure command over non-secure line from remote host is not allowed.");
		return;
	}

	// Get the idInstrumentRun
	if (req.getParameter("idInstrumentRun") != null && !req.getParameter("idInstrumentRun").equals("")) {
		idInstrumentRun = Integer.valueOf(req.getParameter("idInstrumentRun"));
	}

	if (idInstrumentRun == null) {
		LOG.error("idInstrumentRun required");

		response.setContentType("text/html; charset=UTF-8");
		response.getOutputStream().println("<html><head><title>Error</title></head>");
		response.getOutputStream().println("<body><b>");
		response.getOutputStream().println("Missing parameter:  idInstrumentRun required" + "<br>");
		response.getOutputStream().println("</body>");
		response.getOutputStream().println("</html>");
		return;

	}

	if (req.getParameter("codeReactionType") != null && !req.getParameter("codeReactionType").equals("")) {
		codeReactionType = req.getParameter("codeReactionType");
	}

	InputStream in = null;
	SecurityAdvisor secAdvisor = null;
	String username = "";
	try {

		// Get security advisor
		secAdvisor = (SecurityAdvisor) req.getSession().getAttribute(SecurityAdvisor.SECURITY_ADVISOR_SESSION_KEY);

		username = req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest";

		if (secAdvisor != null) {

			Session sess = secAdvisor.getHibernateSession(req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest");
			ir = (InstrumentRun) sess.load(InstrumentRun.class, idInstrumentRun);

			String runName = ir.getLabel() != null && !ir.getLabel().equals("") ? ir.getLabel() : ir
					.getIdInstrumentRun().toString();
			runName = runName.replaceAll("\\s", "_");
			String runFileName = runName + ".plt";

			// Check permissions
			if (!secAdvisor.hasPermission(SecurityAdvisor.CAN_MANAGE_DNA_SEQ_CORE)) {
				response.setContentType("text/html");
				response.getOutputStream().println("<html><head><title>Error</title></head>");
				response.getOutputStream().println("<body><b>");
				response.getOutputStream().println(
						"DownloadABIRunFileServlet: Insufficient permission to generate ABI Run (.plt) file." + "<br>");
				response.getOutputStream().println("</body>");
				response.getOutputStream().println("</html>");
				System.out
						.println("DownloadABIRunFileServlet: Insufficient  permission to generate ABI Run (.plt) file.");
				return;
			}

			response.setContentType("application/x-download; charset=UTF-8");
			response.setHeader("Content-Disposition", "attachment;filename=" + runFileName);
			response.setHeader("Cache-Control", "max-age=0, must-revalidate");

			OutputStream out = response.getOutputStream();

			// Change run status
			if (ir.getCodeInstrumentRunStatus() == null
					|| ir.getCodeInstrumentRunStatus().equals(InstrumentRunStatus.PENDING)) {
				ir.setCodeInstrumentRunStatus(InstrumentRunStatus.RUNNING);
				if (ir.getRunDate() == null) {
					ir.setRunDate(new java.util.Date(System.currentTimeMillis()));
				}
			}

			changeRequestsToProcessing(sess, ir);
			sess.flush();

			// Run headers
			if (codeReactionType.equals(ReactionType.FRAGMENT_ANALYSIS_REACTION_TYPE)) {
				response.getOutputStream()
						.print("Container Name\tPlate ID\tDescription\tContainerType\tAppType\tOwner\tOperator\tPlateSealing\tSchedulingPref\t\n");
			} else {
				response.getOutputStream()
						.print("Container Name\tPlate ID\tDescription\tApplication\tContainerType\tOwner\tOperator\tPlateSealing\tSchedulingPref\t\r\n");
			}
			// Run information
			SealType sealType = (SealType) sess.get(SealType.class, ir.getCodeSealType());
			String sealTypeText = sealType.getSealType();

			String plateID = "";
			if (codeReactionType.equals(ReactionType.SEQUENCING_REACTION_TYPE)) {
				plateID = runName;
			} else {
				plateID = idInstrumentRun.toString();
			}
			String owner = "";
			AppUser user = (AppUser) sess.get(AppUser.class, Integer.valueOf(ir.getCreator()));
			owner = user.getShortName() != null ? user.getShortName() : "Core";

			if (codeReactionType.equals(ReactionType.SEQUENCING_REACTION_TYPE)) {
				response.getOutputStream().print(
						runName + "\t" + plateID + "\t\tSequencingAnalysis\t384-Well\t" + owner + "\t3730-1\t"
								+ sealTypeText + "\t1234\t\r\n");
			} else if (codeReactionType.equals(ReactionType.MITO_DLOOP_REACTION_TYPE)) {
				response.getOutputStream().print(
						runName + "\t" + plateID + "\t\tSequencingAnalysis\t384-Well\t" + owner + "\t" + owner + "\t"
								+ sealTypeText + "\t1234\t\r\n");
			} else {
				response.getOutputStream().print(
						runName + "\t" + plateID + "\t\t384-Well\tRegular\t" + owner + "\t" + owner + "\t"
								+ sealTypeText + "\t1234\t\n");
				response.getOutputStream().print("AppServer\tAppInstance\t\n");
				response.getOutputStream().print("GeneMapper\tGeneMapper_Generic_Instance\t\n");
			}

			// Well headers
			if (codeReactionType.equals(ReactionType.FRAGMENT_ANALYSIS_REACTION_TYPE)) {
				response.getOutputStream().print(
						"Well\tSample Name\tComment\tSampleType\tSnp Set\tAnalysis Method\tPanel"
								+ "\tUser-Defined 3\tSize Standard" + "\tUser-Defined 2\tUser-Defined 1"
								+ "\tResults Group 1\tInstrument Protocol 1"
								+ "\tResults Group 2\tInstrument Protocol 2"
								+ "\tResults Group 3\tInstrument Protocol 3"
								+ "\tResults Group 4\tInstrument Protocol 4"
								+ "\tResults Group 5\tInstrument Protocol 5\t\r\n");
			} else {
				response.getOutputStream().print(
						"Well\tSample Name\tComment\tResults Group" + "\tInstrument Protocol 1\tAnalysis Protocol 1"
								+ "\tInstrument Protocol 2\tAnalysis Protocol 2"
								+ "\tInstrument Protocol 3\tAnalysis Protocol 3"
								+ "\tInstrument Protocol 4\tAnalysis Protocol 4"
								+ "\tInstrument Protocol 5\tAnalysis Protocol 5\t\r\n");
			}

			Element runNode = getRunWells(sess, ir);

			if (runNode != null) {
				Iterator i = runNode.getChildren("PlateWell").iterator();

				for (char row = 'A'; row <= 'P'; row++) {
					for (int col = 1; col <= 24; col++) {

						if (i.hasNext()) {
							Element well = (Element) i.next();

							String idPlateWellString = well.getAttributeValue("idPlateWell") != null ? well
									.getAttributeValue("idPlateWell") : "0";
							String sampleName = well.getAttributeValue("sampleName") != null ? well
									.getAttributeValue("sampleName") : "";
							if (well.getAttributeValue("isControl") != null
									&& well.getAttributeValue("isControl").equals("Y")) {
								sampleName = "pGem";
							}
							String idSample = well.getAttributeValue("idSample") != null ? well
									.getAttributeValue("idSample") : "";
							String idPlate = well.getAttributeValue("idPlate") != null ? well
									.getAttributeValue("idPlate") : "";
							String primer = well.getAttributeValue("primer") != null ? well.getAttributeValue("primer")
									: "";
							String assay = well.getAttributeValue("assay") != null ? well.getAttributeValue("assay")
									: "";
							String wellRow = well.getAttributeValue("row") != null ? well.getAttributeValue("row") : "";
							int wellCol = well.getAttributeValue("col") != null ? Integer.valueOf(well
									.getAttributeValue("col")) : 0;

							if (idPlateWellString != null && !idPlateWellString.equals("0")) {

								if (well.getAttributeValue("isControl") != null
										&& well.getAttributeValue("isControl").equals("Y")) {
									idSample = idPlateWellString;
								}

								response.getOutputStream().print(row + String.format("%02d", col) + "\t");

								String fileName;
								if (codeReactionType.equals(ReactionType.SEQUENCING_REACTION_TYPE)) {
									fileName = sampleName;
									fileName = fileName.replaceAll("\\s", "_");
									response.getOutputStream().print(fileName + "\t");
								} else if (codeReactionType.equals(ReactionType.MITO_DLOOP_REACTION_TYPE)) {
									fileName = sampleName + "_" + primer;
									fileName = fileName.replaceAll("\\s", "_");
									response.getOutputStream().print(fileName + "\t");
								} else if (codeReactionType.equals(ReactionType.FRAGMENT_ANALYSIS_REACTION_TYPE)) {
									fileName = sampleName + "_" + assay;
									fileName = fileName.replaceAll("\\s", "_");
									response.getOutputStream().print(fileName + "\t");
								}

								String comments = "<ID:" + idPlateWellString + ">";
								if (codeReactionType.equals(ReactionType.SEQUENCING_REACTION_TYPE)) {
									comments += "<WELL:" + wellRow + String.format("%02d", wellCol) + ">";
								}
								response.getOutputStream().print(comments + "\t");

								if (codeReactionType.equals(ReactionType.SEQUENCING_REACTION_TYPE)) {
									response.getOutputStream().print("HCI\tLongSeq50\tSeq_A\t\r\n");
								} else if (codeReactionType.equals(ReactionType.MITO_DLOOP_REACTION_TYPE)) {
									response.getOutputStream().print("HCI\tLongSeq50\tPCR\t\r\n");
								} else if (codeReactionType.equals(ReactionType.FRAGMENT_ANALYSIS_REACTION_TYPE)) {
									response.getOutputStream().print(
											"\t\t\t\t\t\t\t\tHCI\tFragAnalysis-RCT_50_POP7\t\n");
								}
							}

						}
					}
				}
			}

			out.close();
			out.flush();

		} else {
			response.setContentType("text/html; charset=UTF-8");
			response.getOutputStream().println("<html><head><title>Error</title></head>");
			response.getOutputStream().println("<body><b>");
			response.getOutputStream()
					.println(
							"DownloadABIRunFileServlet: You must have a SecurityAdvisor in order to run this command."
									+ "<br>");
			response.getOutputStream().println("</body>");
			response.getOutputStream().println("</html>");
			System.out
					.println("DownloadABIRunFileServlet: You must have a SecurityAdvisor in order to run this command.");
		}
	} catch (Exception e) {
		String errorMessage = Util.GNLOG(LOG,"Error in DownloadABIRunFileServlet ", e);
		StringBuilder requestDump = Util.printRequest(req);
		String serverName = req.getServerName();

		PropertyDictionaryHelper propertyHelper = PropertyDictionaryHelper.getInstance(HibernateSession.currentSession());
		String gnomex_tester_email = propertyHelper.getProperty(PropertyDictionary.CONTACT_EMAIL_SOFTWARE_TESTER);

		Util.sendErrorReport(HibernateSession.currentSession(),gnomex_tester_email, "DoNotReply@hci.utah.edu", username, errorMessage, requestDump);

		HibernateSession.rollback();
		response.setContentType("text/html; charset=UTF-8");
		response.getOutputStream().println("<html><head><title>Error</title></head>");
		response.getOutputStream().println("<body><b>");
		response.getOutputStream().println("DownloadABIRunFileServlet: An exception occurred " + e.toString() + "<br>");
		response.getOutputStream().println("</body>");
		response.getOutputStream().println("</html>");

	} finally {
		try {
			secAdvisor.closeHibernateSession();
		} catch (Exception e) {
			LOG.error("Exception in DownloadABIRunFileServlet: ", e);
		}

	}

}

private Element getRunWells(Session sess, InstrumentRun ir) {

	try {
		Element irNode = ir.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();

		for (char row = 'A'; row <= 'H'; row++) {

			for (int col = 1; col <= 12; col++) {
				for (int quadrant = 0; quadrant < 3; quadrant = quadrant + 2) {
					Element wellNode = getWellNode(sess, row, col, quadrant, ir);
					irNode.addContent(wellNode);
				}
			}
			for (int col = 1; col <= 12; col++) {
				for (int quadrant = 1; quadrant < 4; quadrant = quadrant + 2) {

					Element wellNode = getWellNode(sess, row, col, quadrant, ir);
					irNode.addContent(wellNode);
				}
			}

		}

		return irNode;

	} catch (Exception e) {
		LOG.error("An exception has occurred in CreateRunFile ", e);

		return null;
	}
}

private Element getWellNode(Session sess, char row, int col, int quadrant, InstrumentRun ir) {
	try {

		String plateQuery = "SELECT p from Plate as p where p.idInstrumentRun=" + ir.getIdInstrumentRun()
				+ "       AND p.quadrant=" + quadrant;
		Plate plate = (Plate) sess.createQuery(plateQuery).uniqueResult();

		Element wellNode = new Element("PlateWell");

		if (plate != null) {

			String wellQuery = "SELECT pw from PlateWell as pw where pw.idPlate=" + plate.getIdPlate()
					+ "        AND pw.row='" + row + "'       AND pw.col=" + col;
			PlateWell plateWell = (PlateWell) sess.createQuery(wellQuery).uniqueResult();

			if (plateWell != null) {
				plateWell.excludeMethodFromXML("getPlate");

				plateWell.excludeMethodFromXML("getSample");
				plateWell.excludeMethodFromXML("getAssay");
				plateWell.excludeMethodFromXML("getPrimer");
				wellNode = plateWell.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();

				if (plateWell.getAssay() != null) {
					wellNode.setAttribute("assay", plateWell.getAssay().getDisplay());
				} else if (plateWell.getPrimer() != null) {
					wellNode.setAttribute("primer", plateWell.getPrimer().getDisplay());
				}

			} else {
				wellNode.setAttribute("idPlateWell", "0");
			}

		} else {
			wellNode.setAttribute("idPlateWell", "0");
		}
		return wellNode;

	} catch (Exception e) {
		LOG.error("An exception has occurred in CreateRunFile ", e);

		return null;
	}
}

private void changeRequestsToProcessing(Session sess, InstrumentRun ir) throws ProductException {

	// Get any requests on that run
	Map requests = new HashMap();
	List wells = sess.createQuery(
			"SELECT pw from PlateWell as pw " + " join pw.plate as plate where plate.idInstrumentRun ="
					+ ir.getIdInstrumentRun()).list();
	for (Iterator i1 = wells.iterator(); i1.hasNext();) {
		PlateWell well = (PlateWell) i1.next();
		if (well.getIdRequest() == null) {
			break;
		}
		if (!well.getIdRequest().equals("") && !requests.containsKey(well.getIdRequest())) {
			Request req = (Request) sess.get(Request.class, well.getIdRequest());
			requests.put(req.getIdRequest(), req);
		}
	}

	// Change request Status
	for (Iterator i = requests.keySet().iterator(); i.hasNext();) {
		int idReq = (Integer) i.next();
		Request req = (Request) sess.get(Request.class, idReq);
		if (req.getCodeRequestStatus() == null) {
			ProductUtil.updateLedgerOnRequestStatusChange(sess, req, req.getCodeRequestStatus(),
					RequestStatus.PROCESSING);
			req.setCodeRequestStatus(RequestStatus.PROCESSING);
		} else if (req.getCodeRequestStatus().equals(RequestStatus.NEW)
				|| req.getCodeRequestStatus().equals(RequestStatus.SUBMITTED)) {
			ProductUtil.updateLedgerOnRequestStatusChange(sess, req, req.getCodeRequestStatus(),
					RequestStatus.PROCESSING);
			req.setCodeRequestStatus(RequestStatus.PROCESSING);
		}
	}
	sess.flush();
}

}
