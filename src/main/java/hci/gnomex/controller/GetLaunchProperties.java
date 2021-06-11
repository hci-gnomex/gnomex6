package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.CoreFacility;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.PropertyDictionaryHelper;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.servlet.http.HttpSession;
import java.io.Serializable;

public class GetLaunchProperties extends GNomExCommand implements Serializable {

private static Logger LOG = Logger.getLogger(GetLaunchProperties.class);

private String scheme;
private String serverName;
private String contextPath;
private boolean isSecure = false;
private int serverPort;
private Integer idCoreFacility;
private boolean htgonly;

public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
	try {
		this.validate();
		scheme = request.getScheme();
		serverPort = request.getServerPort();
		serverName = request.getServerName();
		contextPath = request.getContextPath();
		isSecure = request.isSecure();
		String coreAsString = request.getParameter("idCoreFacility");
		if (coreAsString != null && coreAsString.length() > 0) {
			try {
				idCoreFacility = Integer.valueOf(coreAsString);
			} catch (NumberFormatException ex) {
				idCoreFacility = null;
			}
		} else {
			idCoreFacility = null;
		}
	} catch (Exception e) {
		this.errorDetails = Util.GNLOG(LOG,"An exception occurred in GetLaunchProperties ", e);

	}
}

public Command execute() throws RollBackCommandException {

	try {
		Session sess = HibernateSession.currentSession(this.getUsername());
		String universityUserAuthorization = (PropertyDictionaryHelper.getInstance(sess).isUniversityUserAuthentication() ? "Y" : "N");
		String siteLogo = PropertyDictionaryHelper.getSiteLogo(sess, idCoreFacility);
		String siteSplash = PropertyDictionaryHelper.getSiteSplash(sess, idCoreFacility);
		String experimentAlias = PropertyDictionaryHelper.getExperimentAlias(sess, idCoreFacility);

		// Pragmatic programming...
		htgonly = false;
		PropertyDictionary htgonlyProp = (PropertyDictionary) sess.createQuery("from PropertyDictionary p where p.propertyName='" + PropertyDictionary.HTGONLY + "'").uniqueResult();
		if (htgonlyProp != null && htgonlyProp.getPropertyValue().equals("Y")) {
			htgonly = true;
		}


		String baseURL = "";
		if (serverPort == 80 || (serverPort == 443 && isSecure)) {
			baseURL = scheme + "://" + serverName + contextPath;
		} else {
			baseURL = scheme + "://" + serverName + ":" + serverPort + contextPath;
		}

		Document doc = new Document(new Element("LaunchProperties"));

		Element node = new Element("Property");
		node.setAttribute("name", "university_user_authentication");
		node.setAttribute("value", universityUserAuthorization);
		doc.getRootElement().addContent(node);

		node = new Element("Property");
		node.setAttribute("name", "base_url");
		node.setAttribute("value", baseURL);
		doc.getRootElement().addContent(node);

		node = new Element("Property");
		node.setAttribute("name", "site_logo");
		node.setAttribute("value", siteLogo);
		doc.getRootElement().addContent(node);

		node = new Element("Property");
		node.setAttribute("name", "site_splash");
		node.setAttribute("value", siteSplash);
		doc.getRootElement().addContent(node);

		node = new Element("Property");
		node.setAttribute("name", "experiment_alias");
		node.setAttribute("value", experimentAlias);
		doc.getRootElement().addContent(node);

		getCoreFacilities(sess, doc);

		XMLOutputter out = new org.jdom.output.XMLOutputter();
		this.xmlResult = out.outputString(doc);
System.out.println ("[getLaunchProperties] this.xmlResult: " + this.xmlResult + " htgonly: " + htgonly);
		validate();

	} catch (Exception e) {
		LOG.error(e.getClass().toString() + ": ", e);
		throw new RollBackCommandException();
	}

	return this;
}

private void getCoreFacilities(Session sess, Document doc) {
	Element facilitiesNode = new Element("CoreFacilities");
	doc.getRootElement().addContent(facilitiesNode);

	if (CoreFacility.getActiveCoreFacilities(sess) == null || CoreFacility.getActiveCoreFacilities(sess).size() == 0) {
		return;
	}

	for (CoreFacility cf : CoreFacility.getActiveCoreFacilities(sess)) {

		if (cf.getIsActive() != null && cf.getIsActive().equals("Y")) {
			String facilityName = cf.getFacilityName();
			int idCoreFacility = cf.getIdCoreFacility();
System.out.println ("[GetLaunchProperties] htgonly: " + htgonly + "idCoreFacility: " + idCoreFacility);
			if (htgonly && idCoreFacility != 1) {
				continue;
			}


			Element facilityNode = new Element("CoreFacility");
			facilitiesNode.addContent(facilityNode);
			facilityNode.setAttribute("idCoreFacility", String.valueOf(idCoreFacility));
			facilityNode.setAttribute("facilityName", facilityName != null ? facilityName : "");
			facilityNode.setAttribute("contactName", cf.getContactName() != null ? cf.getContactName() : "");
			facilityNode.setAttribute("contactPhone", cf.getContactPhone() != null ? cf.getContactPhone() : "");
			facilityNode.setAttribute("contactEmail", cf.getContactEmail() != null ? cf.getContactEmail() : "");
			facilityNode.setAttribute("description", cf.getDescription() != null ? cf.getDescription() : "");
			facilityNode.setAttribute("shortDescription", cf.getShortDescription() != null ? cf.getShortDescription() : "");
			facilityNode.setAttribute("contactImage", cf.getContactImage() != null ? cf.getContactImage() : "");
			facilityNode.setAttribute("sortOrder", cf.getSortOrder() != null ? cf.getSortOrder().toString() : "");
			facilityNode.setAttribute("labRoom", cf.getLabRoom() != null ? cf.getLabRoom() : "");
			facilityNode.setAttribute("contactRoom", cf.getContactRoom() != null ? cf.getContactRoom() : "");
			facilityNode.setAttribute("labPhone", cf.getLabPhone() != null ? cf.getLabPhone() : "");
		}
	}
}

public void validate() {
	// See if we have a valid form
	if (isValid()) {
		setResponsePage(this.SUCCESS_JSP);
	} else {
		setResponsePage(this.ERROR_JSP);
	}
}

}
