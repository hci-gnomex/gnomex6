package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.gnomex.model.AppUser;
import hci.gnomex.model.BillingAccount;
import hci.gnomex.model.InternalAccountFieldsConfiguration;
import hci.gnomex.model.Lab;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.AppUserNameComparator;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.hibernate.Hibernate;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.*;

public class GetLab extends GNomExCommand implements Serializable {

// the static field for logging in Log4J
private static Logger LOG = Logger.getLogger(GetLab.class);

private Lab lab;
private Boolean isForWorkAuth = false;
private String timestamp;

private boolean includeBillingAccounts = true;
private boolean includeProductCounts = true;
private boolean includeProjects = true;
private boolean includeCoreFacilities = true;
private boolean includeHistoricalOwnersAndSubmitters = true;
private boolean includeInstitutions = true;
private boolean includeSubmitters = true;
private boolean includeMoreCollaboratorInfo = true;

public void validate() {
}

public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

	lab = new Lab();
	HashMap errors = this.loadDetailObject(request, lab);
	this.addInvalidFields(errors);

	if (lab.getIdLab() == null) {
		this.addInvalidField("idLab required", "idLab required");
	}

	String wa = (String) request.getParameter("forWorkAuth");
	if (wa != null && wa.equals("Y")) {
		isForWorkAuth = true;
	} else {
		isForWorkAuth = false;
	}

	timestamp = request.getParameter("timestamp");

	String includeBillingAccountsParameter = request.getParameter("includeBillingAccounts");
	if (includeBillingAccountsParameter != null && Util.isParameterFalse(includeBillingAccountsParameter)) {
		includeBillingAccounts = false;
	}
	String includeProductCountsParameter = request.getParameter("includeProductCounts");
	if (includeProductCountsParameter != null && Util.isParameterFalse(includeProductCountsParameter)) {
		includeProductCounts = false;
	}
	String includeProjectsParameter = request.getParameter("includeProjects");
	if (includeProjectsParameter != null && Util.isParameterFalse(includeProjectsParameter)) {
		includeProjects = false;
	}
	String includeCoreFacilitiesParameter = request.getParameter("includeCoreFacilities");
	if (includeCoreFacilitiesParameter != null && Util.isParameterFalse(includeCoreFacilitiesParameter)) {
		includeCoreFacilities = false;
	}
	String includeHistoricalOwnersAndSubmittersParameter = request.getParameter("includeHistoricalOwnersAndSubmitters");
	if (includeHistoricalOwnersAndSubmittersParameter != null && Util.isParameterFalse(includeHistoricalOwnersAndSubmittersParameter)) {
		includeHistoricalOwnersAndSubmitters = false;
	}
	String includeInstitutionsParameter = request.getParameter("includeInstitutions");
	if (includeInstitutionsParameter != null && Util.isParameterFalse(includeInstitutionsParameter)) {
		includeInstitutions = false;
	}
	String includeSubmittersParameter = request.getParameter("includeSubmitters");
	if (includeSubmittersParameter != null && Util.isParameterFalse(includeSubmittersParameter)) {
		includeSubmitters = false;
	}
	String includeMoreCollaboratorInfoParameter = request.getParameter("includeMoreCollaboratorInfo");
	if (includeMoreCollaboratorInfoParameter != null && Util.isParameterFalse(includeMoreCollaboratorInfoParameter)) {
		includeMoreCollaboratorInfo = false;
	}

}

public Command execute() throws RollBackCommandException {

	long startTime = System.currentTimeMillis();
	String labNumber = "";

	try {

		Document doc = new Document(new Element("OpenLabList"));
		if (StringUtils.isNotEmpty(timestamp)) {
			doc.getRootElement().setAttribute("timestamp", timestamp);
		}
		doc.getRootElement().setAttribute("includeBillingAccounts", includeBillingAccounts ? "Y" : "N");
		doc.getRootElement().setAttribute("includeProductCounts", includeProductCounts ? "Y" : "N");
		doc.getRootElement().setAttribute("includeProjects", includeProjects ? "Y" : "N");
		doc.getRootElement().setAttribute("includeCoreFacilities", includeCoreFacilities ? "Y" : "N");
		doc.getRootElement().setAttribute("includeHistoricalOwnersAndSubmitters", includeHistoricalOwnersAndSubmitters ? "Y" : "N");
		doc.getRootElement().setAttribute("includeInstitutions", includeInstitutions ? "Y" : "N");
		doc.getRootElement().setAttribute("includeSubmitters", includeSubmitters ? "Y" : "N");
		doc.getRootElement().setAttribute("includeMoreCollaboratorInfo", includeMoreCollaboratorInfo ? "Y" : "N");

		Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername(), "GetLab");

		Lab theLab = (Lab) sess.get(Lab.class, lab.getIdLab());
		labNumber = "" + theLab.getIdLab();

		// workaround until NullPointer exception is dealt with
		InternalAccountFieldsConfiguration.getConfiguration(sess);

		// We want the billing accounts to show up if the user is authorized to submit
		// requests for this lab

		if (includeBillingAccounts && (this.getSecAdvisor().isGroupIAmMemberOrManagerOf(theLab.getIdLab())
				|| this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_ADMINISTER_USERS))) {
			if (theLab.getBillingAccounts() != null) {
				Hibernate.initialize(theLab.getBillingAccounts());
			}
		}

		// We want the list of institutions to show up for the lab
		if (includeInstitutions && (this.getSecAdvisor().isGroupIAmMemberOrManagerOf(theLab.getIdLab())
				|| this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_ADMINISTER_USERS))) {
			Hibernate.initialize(theLab.getInstitutions());
		}

		theLab.excludeMethodFromXML("getIsMyLab");
		theLab.excludeMethodFromXML("getCanSubmitRequests");
		theLab.excludeMethodFromXML("getCanManage");
		theLab.excludeMethodFromXML("getHasPublicData");

		if (includeProjects) {
			Hibernate.initialize(theLab.getProjects());
		}
		if (includeCoreFacilities) {
			Hibernate.initialize(theLab.getCoreFacilities());
		} else {
			theLab.excludeMethodFromXML("getCoreFacilities");
		}

		List productQuantity = null;
		if (includeProductCounts) {
			// Get product qty counts and append to lab node below
			StringBuffer buf1 = new StringBuffer("SELECT pl.idProduct, SUM(pl.qty) from ProductLedger as pl where idLab = "
					+ lab.getIdLab() + " group by pl.idProduct");
			productQuantity = sess.createQuery(buf1.toString()).list();
		}

		if (this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_ADMINISTER_USERS)
				|| this.getSecAdvisor().canUpdate(theLab, SecurityAdvisor.PROFILE_GROUP_MEMBERSHIP)
				|| this.getSecAdvisor().isLabICanSubmitTo(theLab)) {

			Hibernate.initialize(theLab.getMembers());
			Hibernate.initialize(theLab.getCollaborators());
			Hibernate.initialize(theLab.getManagers());
			if (includeInstitutions) {
				Hibernate.initialize(theLab.getInstitutions());
			} else {
				theLab.excludeMethodFromXML("getInstitutions");
			}

			blockAppUserContent(theLab.getMembers());
			blockAppUserContent(theLab.getCollaborators());
			blockAppUserContent(theLab.getManagers());

			// Get the total charges to date on all billing accounts
			StringBuffer buf = new StringBuffer("SELECT bi.idBillingAccount, sum(bi.invoicePrice) ");
			buf.append(" FROM  BillingItem bi");
			buf.append(" WHERE bi.idLab = " + lab.getIdLab());
			buf.append(" GROUP BY bi.idBillingAccount ");
			List rows = sess.createQuery(buf.toString()).list();
			HashMap totalChargesMap = new HashMap();
			for (Iterator i = rows.iterator(); i.hasNext();) {
				Object[] row = (Object[]) i.next();
				totalChargesMap.put(row[0], row[1]);
			}
			for (Iterator i = theLab.getBillingAccounts().iterator(); i.hasNext();) {
				BillingAccount ba = (BillingAccount) i.next();
				ba.setTotalChargesToDate((BigDecimal) totalChargesMap.get(ba.getIdBillingAccount()));
				ba.excludeMethodFromXML("getUsers");
				Hibernate.initialize(ba.getUsers());
			}

			theLab.excludeMethodFromXML("getApprovedBillingAccounts"); // Added explicitly below
			theLab.excludeMethodFromXML("getInternalBillingAccounts"); // Added explicitly below
			theLab.excludeMethodFromXML("getPOBillingAccounts"); // Added explicitly below
			theLab.excludeMethodFromXML("getCreditCardBillingAccounts"); // Added explicitly below
			theLab.excludeMethodFromXML("getBillingAccounts"); // Added explicitly below
			if (!includeProjects) {
				theLab.excludeMethodFromXML("getProjects");
			}
			Element labNode = theLab.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();

			if (includeMoreCollaboratorInfo) {
				this.appendPossibleCollaborators(labNode, theLab);
				this.appendMembersCollaborators(labNode, theLab);
			}
			if (includeSubmitters) {
				this.appendSubmitters(labNode, theLab);
			}
			if (includeHistoricalOwnersAndSubmitters) {
				this.appendHistoricalOwnersAndSubmitters(labNode, theLab, sess);
			}

			if (includeBillingAccounts) {
				this.appendBillingAccounts(new ArrayList(theLab.getBillingAccounts()), "billingAccounts", labNode, theLab);
				this.appendBillingAccounts(theLab.getApprovedBillingAccounts(), "approvedBillingAccounts", labNode, theLab);
				this.appendBillingAccounts(theLab.getInternalBillingAccounts(), "internalBillingAccounts", labNode, theLab);
				this.appendBillingAccounts(theLab.getPOBillingAccounts(), "pOBillingAccounts", labNode, theLab);
				this.appendBillingAccounts(theLab.getCreditCardBillingAccounts(), "creditCardBillingAccounts", labNode,
						theLab);
				List<BillingAccount> authorizedBillingAccounts = new ArrayList<BillingAccount>(
						GetAuthorizedBillingAccounts.retrieveAuthorizedBillingAccounts(sess, this.getSecAdvisor(), this
										.getSecAdvisor().getAppUser().getIdAppUser(), theLab.getIdLab(), null, true, true, true,
								true, true));
				this.appendBillingAccounts(authorizedBillingAccounts, "authorizedBillingAccounts", labNode, theLab);
			}
			if (includeProductCounts) {
				this.appendProductCount(labNode, productQuantity);
			}

			doc.getRootElement().addContent(labNode);

		} else if (this.getSecAdvisor().isGroupIAmMemberOf(theLab.getIdLab())
				|| this.getSecAdvisor().isGroupICollaborateWith(theLab.getIdLab())
				|| this.getSecAdvisor().isLabICanSubmitTo(theLab)) {

			// For adding services to lab, lab member needs to be able to select
			// from list of other lab members.
			if (this.getSecAdvisor().isGroupIAmMemberOf(theLab.getIdLab())
					|| this.getSecAdvisor().isLabICanSubmitTo(theLab)
					|| this.getSecAdvisor().isGroupIAmMemberOrManagerOf(theLab.getIdLab()) ) {
				Hibernate.initialize(theLab.getMembers());
				Hibernate.initialize(theLab.getManagers());
				blockAppUserContent(theLab.getMembers());
				blockAppUserContent(theLab.getManagers());
				if (!includeProjects) {
					theLab.excludeMethodFromXML("getProjects");
				}
			} else {
				theLab.excludeMethodFromXML("getProjects");
			}

			if (!includeInstitutions) {
				theLab.excludeMethodFromXML("getInstitutions");
			}

			theLab.excludeMethodFromXML("getApprovedBillingAccounts");
			theLab.excludeMethodFromXML("getInternalBillingAccounts");
			theLab.excludeMethodFromXML("getPoBillingAccounts");
			theLab.excludeMethodFromXML("getCreditCardBillingAccounts");

			// Block details about total dollar amount on billing accounts
			for (Iterator i = theLab.getBillingAccounts().iterator(); i.hasNext();) {
				BillingAccount ba = (BillingAccount) i.next();
				ba.excludeMethodFromXML("getTotalDollarAmount");
				ba.excludeMethodFromXML("getTotalDollarAmountDisplay");
				ba.excludeMethodFromXML("getTotalDollarAmountRemaining");
				ba.excludeMethodFromXML("getTotalDollarAmountRemainingDisplay");
				ba.excludeMethodFromXML("getTotalChargesToDateDisplay");
				ba.excludeMethodFromXML("getUsers");
				Hibernate.initialize(ba.getUsers());
			}

			Element labNode = theLab.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();
			if (this.getSecAdvisor().isGroupIAmMemberOrManagerOf(theLab.getIdLab())
					|| this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_ADMINISTER_USERS)) {
				if (includeMoreCollaboratorInfo) {
					this.appendPossibleCollaborators(labNode, theLab);
					this.appendMembersCollaborators(labNode, theLab);
				}
			}
			if (includeSubmitters) {
				this.appendSubmitters(labNode, theLab);
			}
			if (includeHistoricalOwnersAndSubmitters) {
				this.appendHistoricalOwnersAndSubmitters(labNode, theLab, sess);
			}

			if (includeBillingAccounts) {
				this.appendBillingAccounts(theLab.getApprovedBillingAccounts(), "approvedBillingAccounts", labNode, theLab);
				List<BillingAccount> authorizedBillingAccounts = new ArrayList<BillingAccount>(
						GetAuthorizedBillingAccounts.retrieveAuthorizedBillingAccounts(sess, this.getSecAdvisor(), this
										.getSecAdvisor().getAppUser().getIdAppUser(), theLab.getIdLab(), null, true, true, true,
								true, true));
				this.appendBillingAccounts(authorizedBillingAccounts, "authorizedBillingAccounts", labNode, theLab);
			}
			if (includeProductCounts) {
				this.appendProductCount(labNode, productQuantity);
			}

			doc.getRootElement().addContent(labNode);

		} else if (isForWorkAuth) {
			theLab.excludeMethodFromXML("getMembers");
			theLab.excludeMethodFromXML("getCollaboratorss");
			theLab.excludeMethodFromXML("getManagerss");
			theLab.excludeMethodFromXML("getInstitutions");
			theLab.excludeMethodFromXML("getProjects");
			theLab.excludeMethodFromXML("getApprovedBillingAccounts");
			theLab.excludeMethodFromXML("getPoBillingAccounts");
			theLab.excludeMethodFromXML("getCreditCardBillingAccounts");
			theLab.excludeMethodFromXML("getInternalBillingAccounts");

			Element labNode = theLab.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();
			doc.getRootElement().addContent(labNode);

		}
		this.xmlResult = new XMLOutputter().outputString(doc);

	} catch (Exception e) {
		this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetLab ", e);
		throw new RollBackCommandException(e.getMessage());
	}
	if (isValid()) {
		setResponsePage(this.SUCCESS_JSP);
	} else {
		setResponsePage(this.ERROR_JSP);
	}

	String dinfo = " GetLab (" + this.getUsername() + " - " + labNumber + "), ";
	Util.showTime(startTime, dinfo);


	return this;
}

private void appendProductCount(Element labNode, List productQuantities) {
	Element productCounts = new Element("productCounts");

	for (Iterator i = productQuantities.iterator(); i.hasNext();) {
		Element product = new Element("product");
		Object[] row = (Object[]) i.next();
		Integer idProduct = (Integer) row[0];
		Integer qty = (int) (long) row[1];

		product.setAttribute("idProduct", idProduct.toString());
		product.setAttribute("qty", qty.toString());

		productCounts.addContent(product);
	}

	labNode.addContent(productCounts);

}

	private void appendPossibleCollaborators(Element labNode, Lab theLab) throws Exception {
		// Show all the members and collaborators
		// if the user can submit requests
		Element possibleCollaboratorsNode = new Element("possibleCollaborators");
		labNode.addContent(possibleCollaboratorsNode);

		TreeMap appUsers = new TreeMap();
		for (Iterator i2 = theLab.getMembers().iterator(); i2.hasNext();) {
			AppUser u = (AppUser) i2.next();
			appUsers.put(u.getDisplayName(), u);
		}
		for (Iterator i2 = theLab.getCollaborators().iterator(); i2.hasNext();) {
			AppUser u = (AppUser) i2.next();
			appUsers.put(u.getDisplayName(), u);
		}
		for (Iterator i2 = appUsers.keySet().iterator(); i2.hasNext();) {
			String key = (String) i2.next();
			AppUser user = (AppUser) appUsers.get(key);
			this.blockAppUserContent(user);

			possibleCollaboratorsNode.addContent(user.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement());
		}
	}

	private void appendMembersCollaborators(Element labNode, Lab theLab) throws Exception {
		// Show all the collaborators
		// if the user can submit requests
		Element membersCollaboratorsNode = new Element("membersCollaborators");
		labNode.addContent(membersCollaboratorsNode);

		TreeMap appUsers = new TreeMap();
		for (Iterator i2 = theLab.getCollaborators().iterator(); i2.hasNext();) {
			AppUser u = (AppUser) i2.next();
			appUsers.put(u.getDisplayName(), u);
		}
		for (Iterator i2 = appUsers.keySet().iterator(); i2.hasNext();) {
			String key = (String) i2.next();
			AppUser user = (AppUser) appUsers.get(key);
			this.blockAppUserContent(user);

			membersCollaboratorsNode.addContent(user.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement());
		}
	}

private void appendSubmitters(Element labNode, Lab theLab) throws Exception {
	Element submittersNode = new Element("submitters");
	labNode.addContent(submittersNode);

	Element activeSubmittersNode = new Element("activeSubmitters");
	labNode.addContent(activeSubmittersNode);

	TreeSet submitters = new TreeSet(new AppUserNameComparator());
	AppUser empty = new AppUser();
	empty.setFirstName("");
	empty.setIsActive("Y");
	submitters.add(empty);
	for (Iterator i = theLab.getMembers().iterator(); i.hasNext();) {
		AppUser u = (AppUser) i.next();
		submitters.add(u);
	}
	for (Iterator i = theLab.getManagers().iterator(); i.hasNext();) {
		AppUser u = (AppUser) i.next();
		submitters.add(u);
	}

	for (Iterator i = submitters.iterator(); i.hasNext();) {
		AppUser u = (AppUser) i.next();
		this.blockAppUserContent(u);

		submittersNode.addContent(u.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement());

		if (u.getIsActive() != null && u.getIsActive().equals("Y")) {
			Element node = u.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();
			if (u.getIdAppUser() == null) {
				node.setAttribute("value", "-1");
			} else {
				node.setAttribute("value", u.getIdAppUser().toString());
			}
			node.setAttribute("display", Util.getAppUserDisplayName(u, this.getUserPreferences()));
			activeSubmittersNode.addContent(node);
		}
	}

}

private void appendHistoricalOwnersAndSubmitters(Element labNode, Lab theLab, Session sess) throws Exception {
	Element historicalNode = new Element("historicalOwnersAndSubmitters");
	labNode.addContent(historicalNode);
	TreeSet<AppUser> ownersAndSubmitters = new TreeSet<>(new AppUserNameComparator());
	ownersAndSubmitters.addAll(Lab.getHistoricalOwnersAndSubmitters(sess, theLab.getIdLab()));
	for (AppUser appUser : ownersAndSubmitters) {
		blockAppUserContent(appUser);
		historicalNode.addContent(appUser.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement());
	}
}

private void appendBillingAccounts(List accounts, String nodeName, Element labNode, Lab theLab) throws Exception {
	Element accountsNode = new Element(nodeName);
	labNode.addContent(accountsNode);

	for (Iterator i = accounts.iterator(); i.hasNext();) {
		BillingAccount ba = (BillingAccount) i.next();
		Element node = ba.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();
		ArrayList users = new ArrayList();
		String userIds = "";
		for (Iterator j = ba.getUsers().iterator(); j.hasNext();) {
			AppUser user = (AppUser) j.next();
			Element userNode = user.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();
			if (user.getIdAppUser() == null) {
				userNode.setAttribute("value", "-1");
			} else {
				userNode.setAttribute("value", user.getIdAppUser().toString());
			}
			userNode.setAttribute("display", Util.getAppUserDisplayName(user, this.getUserPreferences()));
			users.add(userNode);

			if (userIds.length() > 0) {
				userIds += ',';
			}
			userIds += user.getIdAppUser().toString();
		}
		node.setAttribute("acctUsers", userIds);
		node.setChildren(users);
		accountsNode.addContent(node);
	}
}

private void blockAppUserContent(Set appUsers) {

	for (Iterator i1 = appUsers.iterator(); i1.hasNext();) {
		AppUser user = (AppUser) i1.next();
		blockAppUserContent(user);
	}

}

private void blockAppUserContent(AppUser user) {
	user.excludeMethodFromXML("getCodeUserPermissionKind");
	user.excludeMethodFromXML("getuNID");
	user.excludeMethodFromXML("getEmail");
	user.excludeMethodFromXML("getDepartment");
	user.excludeMethodFromXML("getInstitute");
	user.excludeMethodFromXML("getJobTitle");
	user.excludeMethodFromXML("getCodeUserPermissionKind");
	user.excludeMethodFromXML("getUserNameExternal");
	user.excludeMethodFromXML("getPasswordExternal");
	user.excludeMethodFromXML("getPhone");
	user.excludeMethodFromXML("getLabs");
	user.excludeMethodFromXML("getCollaboratingLabs");
	user.excludeMethodFromXML("getManagingLabs");
	user.excludeMethodFromXML("getPasswordExternalEntered");
	user.excludeMethodFromXML("getIsExternalUser");
	user.excludeMethodFromXML("getPasswordExternal");

}

}
