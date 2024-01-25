package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.framework.security.UnknownPermissionException;
import hci.framework.utilities.XMLReflectException;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.*;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Hibernate;
import org.hibernate.Session;
import org.hibernate.query.Query;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.naming.NamingException;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.sql.SQLException;
import java.util.*;

public class GetAnalysis extends GNomExCommand implements Serializable {

private static Logger LOG = Logger.getLogger(GetAnalysis.class);

private Integer idAnalysis;
private String analysisNumber;
private String showUploads = "N";
private String getdatatrackdata = "Y";
private String serverName;
private String baseDir;


public void validate() {
}

public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

	if (request.getParameter("idAnalysis") != null) {
		idAnalysis = Integer.valueOf(request.getParameter("idAnalysis"));
	}
	if (request.getParameter("analysisNumber") != null && !request.getParameter("analysisNumber").equals("")) {
		analysisNumber = request.getParameter("analysisNumber");
	}
	if (request.getParameter("showUploads") != null && !request.getParameter("showUploads").equals("")) {
		showUploads = request.getParameter("showUploads");
//		System.out.println ("[GetAnalysis] showUploads: " + showUploads);
	}

	if (request.getParameter("getdatatrackdata") != null && !request.getParameter("getdatatrackdata").equals("")) {
		getdatatrackdata = request.getParameter("getdatatrackdata");
		System.out.println ("[GetAnalysis] getdatatrackdata: " + getdatatrackdata);
	}

	if (idAnalysis == null && analysisNumber == null) {
		this.addInvalidField("idAnalysis or analysisNumber", "Either idAnalysis or analysisNumber must be provided");
	}
	serverName = request.getServerName();
}

public Command execute() throws RollBackCommandException {
	long startTime = System.currentTimeMillis();
	String reqNumber = "";

	try {

		Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername(), "GetAnalysis");

		DictionaryHelper dh = DictionaryHelper.getInstance(sess);
		baseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null,
				PropertyDictionaryHelper.PROPERTY_ANALYSIS_DIRECTORY);

		String use_altstr = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.USE_ALT_REPOSITORY);
		if (use_altstr != null && use_altstr.equalsIgnoreCase("yes")) {
			baseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null,
					PropertyDictionaryHelper.ANALYSIS_DIRECTORY_ALT,this.getUsername());
		}
		Analysis a = null;
		if (idAnalysis != null && idAnalysis.intValue() == 0) {
			a = new Analysis();
			a.setIdAnalysis(0);
		} else if (idAnalysis != null) {
			a = sess.get(Analysis.class, idAnalysis);
			Hibernate.initialize(a.getAnalysisGroups());

		} else {
			a = GetAnalysis.getAnalysisFromAnalysisNumber(sess, analysisNumber);
			if (a != null) {
				Hibernate.initialize(a.getAnalysisGroups());
			}
		}

		if (a == null) {
			this.addInvalidField("missingAnalysis", "Cannot find analysis idAnalysis=" + idAnalysis
					+ " analysisNumber=" + analysisNumber);
		} else {
			if (!this.getSecAdvisor().canRead(a)) {
				this.addInvalidField("permissionerror", "Insufficient permissions to access this analysis Group.");
			} else {
				this.getSecAdvisor().flagPermissions(a);

			}
		}

		if (isValid()) {
			reqNumber = a.getNumber();

			// If user can write analysis, show collaborators.
			if (this.getSecAdvisor().canUpdate(a)) {
				Hibernate.initialize(a.getCollaborators());
			} else {
				a.excludeMethodFromXML("getCollaborators");
			}

			Hibernate.initialize(a.getTopics());

			if (a.getTopics() != null) {
				Iterator<?> it = a.getTopics().iterator();
				while (it.hasNext()) {
					Topic t = (Topic) it.next();
					t.excludeMethodFromXML("getTopics");
					t.excludeMethodFromXML("getRequests");
					t.excludeMethodFromXML("getAnalyses");
					t.excludeMethodFromXML("getDataTracks");
					t.excludeMethodFromXML("getAppUser");
					t.excludeMethodFromXML("getLab");
				}

			}

			a.excludeMethodFromXML("getExperimentItems"); // we will add this manually below. This is needed to deal with archived requests

			Document doc = new Document(new Element("OpenAnalysisList"));
			Element aNode = a.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();
			aNode.setAttribute("labName", Util.getLabDisplayName(a.getLab(), this.getUserPreferences()));

			Element experimentItems = new Element("experimentItems");
			for (Iterator i = a.getExperimentItems().iterator(); i.hasNext();) {
				AnalysisExperimentItem aei = (AnalysisExperimentItem) i.next();
				Request r = sess.load(Request.class, aei.getIdRequest());

				if (r.getArchived() == null || !r.getArchived().equals("Y")) {
					Element aeiXML = aei.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();
					Util.preserveXMLNodeName(aeiXML);
					experimentItems.addContent(aeiXML);
				}
			}


			//Adding xml node name as an attribute to





			aNode.addContent(experimentItems);

			// Hash the know analysis files
			Map knownAnalysisFileMap = new HashMap(5000);
			for (Iterator i = a.getFiles().iterator(); i.hasNext();) {
				AnalysisFile af = (AnalysisFile) i.next();
				knownAnalysisFileMap.put(af.getQualifiedFileName(), af);
			}

			// Now add in the files from the upload staging area
			Element filesNode = new Element("ExpandedAnalysisFileList");
			aNode.addContent(filesNode);

			Map analysisMap = new TreeMap();
			Map directoryMap = new TreeMap();
			Map fileMap = new HashMap(5000);
			List analysisNumbers = new ArrayList<String>();
			GetExpandedAnalysisFileList.getFileNamesToDownload(baseDir, a.getKey(), analysisNumbers, analysisMap,
					directoryMap, false);

			for (Iterator i = analysisNumbers.iterator(); i.hasNext();) {
				String analysisNumber = (String) i.next();
				List directoryKeys = (List) analysisMap.get(analysisNumber);

				// For each directory of analysis
				for (Iterator i1 = directoryKeys.iterator(); i1.hasNext();) {

					String directoryKey = (String) i1.next();

					String[] dirTokens = directoryKey.split("-");

					String directoryName = "";
					if (dirTokens.length > 1) {
						directoryName = dirTokens[1];
					}

					// Show files uploads that are in the staging area.
					if (showUploads.equals("Y")) {
						Element analysisUploadNode = new Element("AnalysisUpload");
						filesNode.addContent(analysisUploadNode);
						String key = a.getKey(Constants.UPLOAD_STAGING_DIR);
						Map<Integer, Integer> dataTrackMap = GetAnalysisDownloadList.getDataTrackMap(sess, idAnalysis);
						GetAnalysisDownloadList.addExpandedFileNodes(false, baseDir, aNode, analysisUploadNode,
								analysisNumber, key, knownAnalysisFileMap, fileMap, dataTrackMap, sess);
					}
				}
			}

			// Add properties
			Element pNode = getProperties(dh, a);

			aNode.addContent(pNode);

			doc.getRootElement().addContent(aNode);
			Util.setIcons(doc);

        // Append related nodes
           	this.appendRelatedNodes(this.getSecAdvisor(), sess, a, aNode, getdatatrackdata);

			XMLOutputter out = new org.jdom.output.XMLOutputter();
			this.xmlResult = out.outputString(doc);

//			System.out.println ("[GetAnalysis] xmlResult:\n" + this.xmlResult);
		}

		if (isValid()) {
			setResponsePage(this.SUCCESS_JSP);
		} else {
			setResponsePage(this.ERROR_JSP);
		}

	} catch (UnknownPermissionException e) {
		this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetAnalysis ", e);

		throw new RollBackCommandException(e.getMessage());

	} catch (NamingException e) {
		this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetAnalysis ", e);

		throw new RollBackCommandException(e.getMessage());
	} catch (SQLException e) {
		this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetAnalysis ", e);

		throw new RollBackCommandException(e.getMessage());
	} catch (XMLReflectException e) {
		this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetAnalysis ", e);

		throw new RollBackCommandException(e.getMessage());
	} catch (Exception e) {
		this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetAnalysis ", e);

		throw new RollBackCommandException(e.getMessage());
	}

	String dinfo = " GetAnalysis (" + this.getUsername() + " - " + reqNumber + "), ";
	Util.showTime(startTime, dinfo);

	return this;
}

public static Analysis getAnalysisFromAnalysisNumber(Session sess, String analysisNumber) {
	Analysis analysis = null;
	analysisNumber = analysisNumber.replaceAll("#", "");
	StringBuffer buf = new StringBuffer("SELECT a from Analysis as a where a.number = '" + analysisNumber.toUpperCase()
			+ "'");
	List analyses = sess.createQuery(buf.toString()).list();
	if (analyses.size() > 0) {
		analysis = (Analysis) analyses.get(0);
	}
	return analysis;
}

public static void appendDataTrackNodes(SecurityAdvisor secAdvisor, Session sess, Analysis a, Element aNode)
		throws UnknownPermissionException {

	StringBuffer queryBuf = new StringBuffer();
	queryBuf.append("SELECT DISTINCT dt FROM DataTrack dt ");
	queryBuf.append("JOIN dt.dataTrackFiles dtf ");
	queryBuf.append("JOIN dtf.analysisFile af ");
	queryBuf.append("WHERE af.idAnalysis=:id");
	Query q = sess.createQuery(queryBuf.toString());
	q.setParameter("id", a.getIdAnalysis());

	List dataTracks = q.list();
	aNode.setAttribute("dataTrackCount", Integer.valueOf(dataTracks.size()).toString());

	for (Iterator i = dataTracks.iterator(); i.hasNext();) {
		DataTrack dt = (DataTrack) i.next();

		Element dtNode = new Element("DataTrack");
		aNode.addContent(dtNode);
		dtNode.setAttribute("idDataTrack", dt.getIdDataTrack().toString());
		dtNode.setAttribute("idDataTrackFolder", dt.getIdDataTrackFolder().toString());
		dtNode.setAttribute("number", dt.getNumber());
		dtNode.setAttribute("name", secAdvisor.canRead(dt) ? (dt.getName() != null ? dt.getName() : "")
				: "(Not authorized)");
		dtNode.setAttribute("createdBy", dt.getCreatedBy() != null ? dt.getCreatedBy() : "");
		dtNode.setAttribute("label",
				dt.getNumber() + " "
						+ (secAdvisor.canRead(dt) ? (dt.getName() != null ? dt.getName() : "") : "(Not authorized)"));
		dtNode.setAttribute("codeVisibility", dt.getCodeVisibility() != null ? dt.getCodeVisibility() : "");
	}
}

/**
 * Adds custom properties to the xml document.
 * @param dh
 *            Dictionary helper to find properties
 * @param analysis
 *            Analysis object with property values.
 */
private Element getProperties(DictionaryHelper dh, Analysis analysis) {
	Element propertiesNode = new Element("AnalysisProperties");
	for (Property property : dh.getPropertyList()) {

		if (property.getForAnalysis() == null || !property.getForAnalysis().equals("Y")) {
			// Skip if this property isn't applicable to Analysis
			continue;
		}

		// Check to see if there are Organism restrictions
		Set organismRestrictions = property.getOrganisms();
		if (organismRestrictions != null && organismRestrictions.size() > 0) {
			Integer idOrganism = analysis.getIdOrganism();
			if (organismRestrictions != null && idOrganism != null) {
				boolean organismFound = false;
				for (Iterator i = organismRestrictions.iterator(); i.hasNext();) {
					Organism thisOrganism = (Organism) i.next();
					if (idOrganism.compareTo(thisOrganism.getIdOrganism()) == 0) {
						organismFound = true;
						break;
					}
				}
				if (!organismFound) {
					// If the organism has been specified but is not on the "restrict by" list
					// then don't show the annotation.
					continue;
				}
			} else {
				// If the organism has not been specified but a "restrict by" list exists
				// then don't show the annotation.
				continue;
			}
		}

		// Check to see if there are Analysis Type restrictions
		Set analysisTypeRestrictions = property.getAnalysisTypes();
		if (analysisTypeRestrictions != null && analysisTypeRestrictions.size() > 0) {
			Integer at = analysis.getIdAnalysisType();
			if (at != null) {
				boolean atFound = false;
				for (Iterator i = analysisTypeRestrictions.iterator(); i.hasNext();) {
					AnalysisType thisAT = (AnalysisType) i.next();
					if (at.compareTo(thisAT.getIdAnalysisType()) == 0) {
						atFound = true;
						break;
					}
				}
				if (!atFound) {
					// If the analysis type has been specified but is not on the "restrict by" list
					// then don't show the annotation.
					continue;
				}
			} else {
				// If the analysis type has not been specified but a "restrict by" list exists
				// then don't show the annotation.
				continue;
			}
		}

		// Find the analysis data corresponding to this property (if present)
		PropertyEntry ap = null;
		for (Iterator i = analysis.getPropertyEntries().iterator(); i.hasNext();) {
			PropertyEntry propertyEntry = (PropertyEntry) i.next();
			if (propertyEntry.getIdProperty().equals(property.getIdProperty())) {
				ap = propertyEntry;
				break;
			}
		}

		// If no data and property is inactive, don't show it.
		if (ap == null && property.getIsActive().equals("N")) {
			continue;
		}

		Element propNode = new Element("PropertyEntry");
		propertiesNode.addContent(propNode);

		propNode.setAttribute("idPropertyEntry", ap != null ? ap.getIdPropertyEntry().toString() : "");
		propNode.setAttribute("name", property.getName());
		propNode.setAttribute("value", ap != null && ap.getValue() != null ? ap.getValue() : "");
		propNode.setAttribute("codePropertyType", property.getCodePropertyType());
		propNode.setAttribute("idProperty", property.getIdProperty().toString());
		propNode.setAttribute("isRequired", property.getIsRequired());

		Property.appendEntryContentXML(property, ap, propNode);
		//Util.preserveXMLNodeName(propNode);
	}
	return propertiesNode;
}

/**
 * The callback method allowing you to manipulate the HttpServletRequest prior to forwarding to the response JSP. This can be used to put the results from the
 * execute method into the request object for display in the JSP.
 *
 * @param request
 *            The new requestState value
 * @return Description of the Return Value
 */
public HttpServletWrappedRequest setRequestState(HttpServletWrappedRequest request) {
	// load any result objects into request attributes, keyed by the useBean id in the jsp
	request.setAttribute("xmlResult", this.xmlResult);

	// Garbage collect
	this.xmlResult = null;
	System.gc();

	return request;
}

/**
 * The callback method called after the loadCommand, and execute methods, this method allows you to manipulate the HttpServletResponse object prior to
 * forwarding to the result JSP (add a cookie, etc.)
 *
 * @param response
 *            The HttpServletResponse for the command
 * @return The processed response
 */
public HttpServletResponse setResponseState(HttpServletResponse response) {
	response.setHeader("Cache-Control", "max-age=0, must-revalidate");
	return response;
}

/*
 * Append related experiments, data tracks, and topics.
 */
@SuppressWarnings("unchecked")
private static void appendRelatedNodes(SecurityAdvisor secAdvisor, Session sess, Analysis analysis, Element node, String getdatatrackdata)
		throws Exception {
	Element relatedNode = new Element("relatedObjects");
	relatedNode.setAttribute("label", "Related Items");
	node.addContent(relatedNode);

	// if only getting datatracks just get them and leave
	if (getdatatrackdata.equalsIgnoreCase("only")) {
		GetAnalysis.appendDataTrackNodes(secAdvisor, sess, analysis, relatedNode);
		return;
	}

	// Hash experiments, and linked sequence lanes and hybs
	TreeMap<Integer, Element> requestNodeMap = new TreeMap<Integer, Element>();
	TreeMap<Integer, TreeSet<SequenceLane>> laneMap = new TreeMap<Integer, TreeSet<SequenceLane>>();
	TreeMap<Integer, TreeSet<Hybridization>> hybMap = new TreeMap<Integer, TreeSet<Hybridization>>();
	TreeMap<Integer, TreeSet<Sample>> sampleMap = new TreeMap<Integer, TreeSet<Sample>>();
	for (AnalysisExperimentItem x : (Set<AnalysisExperimentItem>) analysis.getExperimentItems()) {
		Request request = null;
		if (x.getSequenceLane() != null) {
			request = x.getSequenceLane().getRequest();

			if (request.getArchived() == null || !request.getArchived().equals("Y")) {
				TreeSet<SequenceLane> lanes = laneMap.get(request.getIdRequest());
				if (lanes == null) {
					lanes = new TreeSet<SequenceLane>(new SequenceLaneNumberComparator());
					laneMap.put(request.getIdRequest(), lanes);
				}
				lanes.add(x.getSequenceLane());
			}
		} else if (x.getHybridization() != null) {
			request = x.getHybridization().getLabeledSampleChannel1().getRequest();
			if (request.getArchived() == null || !request.getArchived().equals("Y")) {
				TreeSet<Hybridization> hybs = hybMap.get(request.getIdRequest());
				if (hybs == null) {
					hybs = new TreeSet<Hybridization>(new HybNumberComparator());
					hybMap.put(request.getIdRequest(), hybs);
				}
				hybs.add(x.getHybridization());
			}
		} else if (x.getSample() != null) {
			request = x.getSample().getRequest();
			if (request.getArchived() == null || !request.getArchived().equals("Y")) {
				TreeSet<Sample> samples = sampleMap.get(request.getIdRequest());
				if (samples == null) {
					samples = new TreeSet<Sample>(new SampleComparator());
					sampleMap.put(request.getIdRequest(), samples);
				}
				samples.add(x.getSample());
			}
		}

		if (request.getArchived() == null || !request.getArchived().equals("Y")) {
			Element requestNode = requestNodeMap.get(request.getIdRequest());
			if (requestNode == null) {
				requestNode = request.appendBasicXML(secAdvisor, relatedNode);
				requestNodeMap.put(request.getIdRequest(), requestNode);
			}
		}

	}

	// Append experiments, and seq lanes that connect to analysis or hybs that connect to analysis
	for (Integer idRequest : requestNodeMap.keySet()) {
		Element requestNode = requestNodeMap.get(idRequest);
		if (laneMap.containsKey(idRequest)) {
			for (SequenceLane lane : laneMap.get(idRequest)) {
				Element laneNode = new Element("SequenceLane");
				laneNode.setAttribute("idSequenceLane", lane.getIdSequenceLane().toString());
				laneNode.setAttribute("label", "Seq Lane " + lane.getNumber());
				laneNode.setAttribute("number", lane.getNumber());
				requestNode.addContent(laneNode);
			}
		} else if (hybMap.containsKey(idRequest)) {
			for (Hybridization hyb : hybMap.get(idRequest)) {
				Element hybNode = new Element("Hybridization");
				hybNode.setAttribute("idHybridization", hyb.getIdHybridization().toString());
				hybNode.setAttribute("label", "Hyb " + hyb.getNumber());
				hybNode.setAttribute("number", hyb.getNumber());
				requestNode.addContent(hybNode);
			}
		} else if (sampleMap.containsKey(idRequest)) {
			for (Sample sample : sampleMap.get(idRequest)) {
				Element sampleNode = new Element("Sample");
				sampleNode.setAttribute("idSample", sample.getIdSample().toString());
				sampleNode.setAttribute("label", "Sample " + sample.getNumber());
				sampleNode.setAttribute("number", sample.getNumber());
				requestNode.addContent(sampleNode);
			}
		}
	}

	// Append data tracks
	if (analysis.getFiles().size() > 0  && getdatatrackdata.equalsIgnoreCase("Y") ) {
		GetAnalysis.appendDataTrackNodes(secAdvisor, sess, analysis, relatedNode);
	}

	// Append the parent topics (and the contents of the topic) XML
	Element relatedTopicNode = new Element("relatedTopics");
	relatedTopicNode.setAttribute("label", "Related Topics");
	node.addContent(relatedTopicNode);
	Topic.appendParentTopicsXML(secAdvisor, relatedTopicNode, analysis.getTopics());

}

}
