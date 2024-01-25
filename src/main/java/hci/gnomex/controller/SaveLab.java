package hci.gnomex.controller;

import hci.dictionary.model.DictionaryEntry;
import hci.dictionary.model.NullDictionaryEntry;
import hci.dictionary.utility.DictionaryManager;
import hci.framework.control.Command;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.AppUser;
import hci.gnomex.model.BillingAccount;
import hci.gnomex.model.BillingItem;
import hci.gnomex.model.BillingStatus;
import hci.gnomex.model.CoreFacility;
import hci.gnomex.model.Institution;
import hci.gnomex.model.Lab;
import hci.gnomex.model.Project;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.*;

import java.io.IOException;
import java.io.Serializable;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.mail.MessagingException;
import javax.naming.NamingException;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.hibernate.Hibernate;
import org.hibernate.Session;
import org.hibernate.exception.ConstraintViolationException;
import org.hibernate.query.Query;

public class SaveLab extends GNomExCommand implements Serializable {

	// the static field for logging in Log4J
	private static Logger LOG = Logger.getLogger(SaveLab.class);

	private String               institutionsJSONString;
	private JsonArray            labInstitutionJson;
	private LabInstitutionParser labInstitutionParser;

	private String          membersJSONString;
	private JsonArray       membersJson;
	private LabMemberParser labMemberParser;

	private String          collaboratorsJSONString;
	private JsonArray       collaboratorsJson;
	private LabMemberParser collaboratorParser;

	private String          managersJSONString;
	private JsonArray       managersJson;
	private LabMemberParser managerParser;

	private String               accountsJSONString;
	private JsonArray            accountsJson;
	private BillingAccountParser accountParser;

	private LabCoreFacilityParser coreFacilityParser;

	private Lab labScreen;
	private boolean isNewLab = false;

	private String serverName;
	private String launchAppURL;

	public void validate() {
	}

	public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
		StringReader reader = null;

		labScreen = new Lab();
		HashMap errors = this.loadDetailObject(request, labScreen);
		this.addInvalidFields(errors);
		if (labScreen.getIdLab() == null || labScreen.getIdLab() == 0) {
			isNewLab = true;
		}

		// It is invalid for both the first and last name of the lab to be blank.
		if (labScreen.getFirstName() == null || labScreen.getFirstName().trim().equals("")) {
			if (labScreen.getLastName() == null || labScreen.getLastName().trim().equals("")) {
				this.addInvalidField("reqdname", "Lab first or last name must be filled in");
			}
		}

		if (request.getParameter("institutionsJSONString") != null
				&& !request.getParameter("institutionsJSONString").equals("")) {
			institutionsJSONString = request.getParameter("institutionsJSONString");

			if (Util.isParameterNonEmpty(institutionsJSONString)) {
				try {
					JsonReader jsonReader = Json.createReader(new StringReader(institutionsJSONString));
					labInstitutionJson = jsonReader.readArray();
					labInstitutionParser = new LabInstitutionParser(labInstitutionJson);
				}
				catch (Exception e) {
					this.addInvalidField("institutionsJSONString", "Invalid institutionsJSONString");
					this.errorDetails = Util.GNLOG(LOG, "Cannot parse institutionsJSONString", e);
				}
			}
		}

		if (request.getParameter("membersJSONString") != null
				&& !request.getParameter("membersJSONString").equals("")) {
			membersJSONString = request.getParameter("membersJSONString");

			if (Util.isParameterNonEmpty(membersJSONString)) {
				try {
					JsonReader jsonReader = Json.createReader(new StringReader(membersJSONString));
					membersJson = jsonReader.readArray();
					labMemberParser = new LabMemberParser(membersJson);
				}
				catch (Exception e) {
					this.addInvalidField("membersJSONString", "Invalid membersJSONString");
					this.errorDetails = Util.GNLOG(LOG, "Cannot parse membersJSONString", e);
				}
			}
		}

		if (request.getParameter("collaboratorsJSONString") != null
				&& !request.getParameter("collaboratorsJSONString").equals("")) {
			collaboratorsJSONString = request.getParameter("collaboratorsJSONString");

			if (Util.isParameterNonEmpty(collaboratorsJSONString)) {
				try {
					JsonReader jsonReader = Json.createReader(new StringReader(collaboratorsJSONString));
					collaboratorsJson = jsonReader.readArray();
					collaboratorParser = new LabMemberParser(collaboratorsJson);
				}
				catch (Exception e) {
					this.addInvalidField("collaboratorsJSONString", "Invalid collaboratorsJSONString");
					this.errorDetails = Util.GNLOG(LOG, "Cannot parse collaboratorsJSONString", e);
				}
			}
		}

		if (request.getParameter("managersJSONString") != null && !request.getParameter("managersJSONString").equals("")) {
			managersJSONString = request.getParameter("managersJSONString");

			if (Util.isParameterNonEmpty(managersJSONString)) {
				try {
					JsonReader jsonReader = Json.createReader(new StringReader(managersJSONString));
					managersJson = jsonReader.readArray();
					managerParser = new LabMemberParser(managersJson);
				}
				catch (Exception e) {
					this.addInvalidField("managersJSONString", "Invalid managersJSONString");
					this.errorDetails = Util.GNLOG(LOG, "Cannot parse managersJSONString", e);
				}
			}
		}

		if (request.getParameter("accountsJSONString") != null && !request.getParameter("accountsJSONString").equals("")) {
			accountsJSONString = request.getParameter("accountsJSONString");

			if (Util.isParameterNonEmpty(accountsJSONString)) {
				try {
					JsonReader jsonReader = Json.createReader(new StringReader(accountsJSONString));
					accountsJson = jsonReader.readArray();
					accountParser = new BillingAccountParser(accountsJson);
				}
				catch (Exception e) {
					this.addInvalidField("accountsJSONString", "Invalid accountsJSONString");
					this.errorDetails = Util.GNLOG(LOG, "Cannot parse accountsJSONString", e);
				}
			}
		}

		if (request.getParameter("coreFacilitiesJSONString") != null
				&& !request.getParameter("coreFacilitiesJSONString").equals("")) {
			String coreFacilitiesJSONString = request.getParameter("coreFacilitiesJSONString");

			if (Util.isParameterNonEmpty(coreFacilitiesJSONString)) {
				try {
					JsonReader jsonReader = Json.createReader(new StringReader(coreFacilitiesJSONString));
					JsonArray coreFacilitiesJson = jsonReader.readArray();
					coreFacilityParser = new LabCoreFacilityParser(coreFacilitiesJson);
				}
				catch (Exception e) {
					this.addInvalidField("coreFacilitiesJSONString", "Invalid coreFacilitiesJSONString");
					this.errorDetails = Util.GNLOG(LOG, "Cannot parse coreFacilitiesJSONString", e);
				}
			}
		}

		try {
			launchAppURL = this.getLaunchAppURL(request);
		}
		catch (Exception e) {
			LOG.warn("Cannot get launch app URL in SaveLab", e);
		}

		serverName = request.getServerName();
	}

	public Command execute() throws RollBackCommandException {

		try {
			Session sess = HibernateSession.currentSession(this.getUsername(), "SaveLab");

			StringBuffer buf        = new StringBuffer();
			boolean      whereAdded = false;
			buf.append("from Lab ");
			if (labScreen.getLastName() != null && !labScreen.getLastName().trim().equals("")) {
				buf.append(whereAdded ? " AND " : " WHERE");
				buf.append(" upper(lastName) = :lastName"); // '" + labScreen.getLastName().toUpperCase()+ "'");
				whereAdded = true;
			}
			if (labScreen.getFirstName() != null && !labScreen.getFirstName().trim().equals("")) {
				buf.append(whereAdded ? " AND " : " WHERE");
				buf.append(" upper(firstName) = :firstName"); // '" + labScreen.getFirstName().toUpperCase()+ "'");
				whereAdded = true;
			}
			// If this is an existing lab, check for duplicate lab name, excluding this lab.
			if (!isNewLab) {
				buf.append(" AND idLab != :idLab"); // + labScreen.getIdLab().toString());
			}
			Query labsQuery = sess.createQuery(buf.toString());
			if (labScreen.getLastName() != null && !labScreen.getLastName().trim().equals("")) {
				labsQuery.setParameter("lastName", labScreen.getLastName().toUpperCase());
			}
			if (labScreen.getFirstName() != null && !labScreen.getFirstName().trim().equals("")) {
				labsQuery.setParameter("firstName", labScreen.getFirstName().toUpperCase());
			}
			if (!isNewLab) {
				labsQuery.setParameter("idLab", labScreen.getIdLab());
			}
			List labs = labsQuery.list();

			// If there are duplicate labs, throw an error.
			if (labs.size() > 0) {
				String labFirstName = labScreen.getFirstName() == null || labScreen.getFirstName().trim().equals("") ? ""
						: labScreen.getFirstName() + " ";
				this.addInvalidField("Duplicate Lab Name", "The lab name " + labFirstName + labScreen.getLastName()
						+ " is already in use.");
				setResponsePage(this.ERROR_JSP);
			}

			if (accountParser != null) {
				accountParser.parse(sess);
				// For some reason, this code is necessary for the billing account saves. Without this here, the
				// billing accounts are deleted, perhaps because the lab isn't iniatialized with all of the
				// billing accounts?
				for (Iterator i = accountParser.getBillingAccountMap().keySet().iterator(); i.hasNext(); ) {
					String         idBillingAccountString = (String) i.next();
					BillingAccount ba                     = (BillingAccount) accountParser.getBillingAccountMap().get(idBillingAccountString);
				}
			}


			if (isValid()) {
				if (!this.getSecurityAdvisor().hasPermission(SecurityAdvisor.CAN_ADMINISTER_USERS)) {
					this.addInvalidField("Insufficient permissions", "Insufficient permission to save lab.");
					setResponsePage(this.ERROR_JSP);
				}
			}

			Lab lab = null;

			if (isValid()) {
				if (accountParser != null) {
					accountParser.parse(sess);
				}
				if (labInstitutionParser != null) {
					labInstitutionParser.parse(sess);
				}
				if (labMemberParser != null) {
					labMemberParser.parse(sess);
				}
				if (collaboratorParser != null) {
					collaboratorParser.parse(sess);
				}
				if (managerParser != null) {
					managerParser.parse(sess);
				}
				if (coreFacilityParser != null) {
					coreFacilityParser.parse(sess);
				}

				if (isNewLab) {
					if (labScreen.getExcludeUsage() == null) labScreen.setExcludeUsage("N");
					lab = labScreen;
					sess.save(lab);

				}
				else {

					lab = (Lab) sess.load(Lab.class, labScreen.getIdLab());

					if (!lab.getVersion().equals(labScreen.getVersion())) {
						this.addInvalidField("Locking Violation",
								"Lab modified by another user.  Please refresh and enter your changes again.");
						setResponsePage(this.ERROR_JSP);
					}
					else {
						// Need to initialize billing accounts; otherwise new accounts
						// get in the list and get deleted.
						Hibernate.initialize(lab.getBillingAccounts());

						initializeLab(lab);
					}
				}
			}

			if (isValid()) {
				//
				// Save billing accounts
				//
				Set<BillingAccount> billingAccountsToSave = new TreeSet<BillingAccount>(new BillingAccountComparator());
				if (accountParser != null) {
					for (Iterator i = accountParser.getBillingAccountMap().keySet().iterator(); i.hasNext(); ) {
						String         idBillingAccountString = (String) i.next();
						BillingAccount ba                     = (BillingAccount) accountParser.getBillingAccountMap().get(idBillingAccountString);
						ba.setIdLab(lab.getIdLab());
						sess.save(ba);
						billingAccountsToSave.add(ba);

						// If the billing account isPO then change billing status of all billingItems in the account
						List billingItems = sess.createQuery(""
								+ " SELECT bi "
								+ "   FROM BillingItem bi "
								+ "  WHERE idBillingAccount = " + ba.getIdBillingAccount()
						).list();

						if (ba.getIsPO().equals("Y")) {
							for (Iterator bIterator = billingItems.iterator(); bIterator.hasNext(); ) {
								BillingItem bi = (BillingItem) bIterator.next();
								if (bi.getCodeBillingStatus().equals(BillingStatus.APPROVED)) {
									bi.setCodeBillingStatus(BillingStatus.APPROVED_PO);
									sess.save(bi);
								}
							}
						}
						else if (ba.getIsCreditCard().equals("Y")) {
							for (Iterator bIterator = billingItems.iterator(); bIterator.hasNext(); ) {
								BillingItem bi = (BillingItem) bIterator.next();
								if (bi.getCodeBillingStatus().equals(BillingStatus.APPROVED)) {
									bi.setCodeBillingStatus(BillingStatus.APPROVED_CC);
									sess.save(bi);
								}
							}
						}
						else if (ba.getIsPO().equals("N")) {
							for (Iterator bIterator = billingItems.iterator(); bIterator.hasNext(); ) {
								BillingItem bi = (BillingItem) bIterator.next();
								if (bi.getCodeBillingStatus().equals(BillingStatus.APPROVED_PO)) {
									bi.setCodeBillingStatus(BillingStatus.APPROVED);
									sess.save(bi);
								}
							}
						}
						else if (ba.getIsCreditCard().equals("N")) {
							for (Iterator bIterator = billingItems.iterator(); bIterator.hasNext(); ) {
								BillingItem bi = (BillingItem) bIterator.next();
								if (bi.getCodeBillingStatus().equals(BillingStatus.APPROVED_CC)) {
									bi.setCodeBillingStatus(BillingStatus.APPROVED);
									sess.save(bi);
								}
							}
						}
						sess.flush();

						// If billing account has just been approved, send out a notification
						// email to submitter of work auth form as well as lab managers
						if (ba.isJustApproved()) {
							ba.setIdApprover(this.getSecAdvisor().getIdAppUser());
							AppUser au = (AppUser) sess.load(AppUser.class, this.getSecAdvisor().getIdAppUser());
							BillingAccountUtil.sendApprovedBillingAccountEmail(sess, this.getUserPreferences(), serverName, launchAppURL, ba, lab, au);
						}

						// If this is a new PO billing account notify the PI of the lab of its creation
						// so that they can start billing against it
						if (idBillingAccountString.startsWith("BillingAccount")
								&& (lab.getContactEmail() != null && !lab.getContactEmail().equals(""))) {
							this.sendNewPOAccountEmail(sess, ba, lab);
						}
					}
				}
				// Remove billing accounts no longer in the billing account list
				List billingAccountsToRemove = new ArrayList();
				if (lab.getBillingAccounts() != null) {
					for (Iterator i = lab.getBillingAccounts().iterator(); i.hasNext(); ) {
						BillingAccount ba = (BillingAccount) i.next();
						if (!accountParser.getBillingAccountMap().containsKey(ba.getIdBillingAccount().toString())) {
							billingAccountsToRemove.add(ba);
						}
					}
					for (Iterator i = billingAccountsToRemove.iterator(); i.hasNext(); ) {
						BillingAccount ba = (BillingAccount) i.next();
						ba.setUsers(null);
						lab.getBillingAccounts().remove(ba);
						sess.delete(ba);

						try {
							sess.flush();
						}
						catch (ConstraintViolationException e) {
							String message = "Billing account "
									+ ba.getAccountName()
									+ " cannot be deleted because charges are posted to this account. Instead, please set expiration date to inactivate.";
							this.addInvalidField("bifk", message);
							throw new RollBackCommandException(message);
						}
					}
				}

				if (this.isValid()) {
					if (labInstitutionParser != null) {
						//
						// Save lab institutions
						//
						TreeSet institutions = new TreeSet(new InstitutionComparator());
						for (Iterator i = labInstitutionParser.getInstitutionMap().keySet().iterator(); i.hasNext(); ) {
							Integer     idInstitution = (Integer) i.next();
							Institution institution   = (Institution) labInstitutionParser.getInstitutionMap().get(idInstitution);
							institutions.add(institution);
						}
						lab.setInstitutions(institutions);

						sess.flush();
					}
					if (labMemberParser != null) {
						//
						// Save lab members
						//
						// Lab members to keep
						TreeSet members = new TreeSet(new AppUserComparator());
						for (Iterator i = labMemberParser.getAppUserMap().keySet().iterator(); i.hasNext(); ) {
							Integer idAppUser = (Integer) i.next();
							AppUser appUser   = (AppUser) labMemberParser.getAppUserMap().get(idAppUser);
							members.add(appUser);
						}

						// Lab members to remove
						List membersToRemove = new ArrayList();
						if (lab.getMembers() != null) {
							for (Iterator i = lab.getMembers().iterator(); i.hasNext(); ) {
								AppUser user = (AppUser) i.next();
								if (!labMemberParser.getAppUserMap().containsKey(user.getIdAppUser())) {
									membersToRemove.add(user);
								}
							}
							// Remove the lab member from any accounts they are users on
							if (lab.getBillingAccounts() != null) {
								for (Iterator i = lab.getBillingAccounts().iterator(); i.hasNext(); ) {
									BillingAccount ba = (BillingAccount) i.next();
									for (Iterator i2 = membersToRemove.iterator(); i2.hasNext(); ) {
										AppUser user = (AppUser) i2.next();
										ba.getUsers().remove(user);
									}
								}
							}
						}
						// Save the members who are still part of the lab
						lab.setMembers(members);

						// Notify newly added members
						Map<AppUser, String> newUsers = labMemberParser.getNewMemberEmailList();
						for (Iterator<AppUser> iter = newUsers.keySet().iterator(); iter.hasNext(); ) {
							AppUser newMember = iter.next();
							String  email     = newUsers.get(newMember);
							newMemberNotificationEmail(sess, email, Util.getLabDisplayName(lab, this.getUserPreferences()), newMember);
						}

						sess.flush();

					}
					//
					// Save lab collaborators
					//
					if (collaboratorParser != null) {
						TreeSet collaborators = new TreeSet(new AppUserComparator());
						for (Iterator i = collaboratorParser.getAppUserMap().keySet().iterator(); i.hasNext(); ) {
							Integer idAppUser = (Integer) i.next();
							AppUser appUser   = (AppUser) collaboratorParser.getAppUserMap().get(idAppUser);
							collaborators.add(appUser);
						}
						lab.setCollaborators(collaborators);

						sess.flush();
					}
					//
					// Save lab managers
					//
					if (managerParser != null) {
						TreeSet managers = new TreeSet(new AppUserComparator());
						for (Iterator i = managerParser.getAppUserMap().keySet().iterator(); i.hasNext(); ) {
							Integer idAppUser = (Integer) i.next();
							AppUser appUser   = (AppUser) managerParser.getAppUserMap().get(idAppUser);
							managers.add(appUser);
						}
						lab.setManagers(managers);

						sess.flush();
					}
					//
					// delete any empty projects where user is no longer associated with this lab
					//
					ArrayList<Integer> labAssociatedIds = new ArrayList<Integer>();
					if (lab.getManagers() != null) {
						for (Iterator i = lab.getManagers().iterator(); i.hasNext(); ) {
							AppUser a = (AppUser) i.next();
							labAssociatedIds.add(a.getIdAppUser());
						}
					}
					if (lab.getCollaborators() != null) {
						for (Iterator i = lab.getCollaborators().iterator(); i.hasNext(); ) {
							AppUser a = (AppUser) i.next();
							labAssociatedIds.add(a.getIdAppUser());
						}
					}
					if (lab.getMembers() != null) {
						for (Iterator i = lab.getMembers().iterator(); i.hasNext(); ) {
							AppUser a = (AppUser) i.next();
							labAssociatedIds.add(a.getIdAppUser());
						}
					}
					if (labAssociatedIds.size() == 0) {
						labAssociatedIds.add(-1);
					}

					String deleteProjectString = ""
							+ " SELECT p "
							+ "   FROM Project p "
							+ "  WHERE p.idLab IS NOT NULL "
							+ "    AND p.idAppUser NOT IN (:ids) "
							+ "    AND p.idProject NOT IN (SELECT d.idProject FROM ExperimentDesignEntry d) "
							+ "    AND p.idProject NOT IN (SELECT f.idProject FROM ExperimentFactorEntry f) "
							+ "    AND p.idProject NOT IN (SELECT q.idProject FROM QualityControlStepEntry q) "
							+ "    AND p.idProject NOT IN (SELECT r.idProject FROM Request r) "
							+ "    AND p.idLab=:idLab ";

					Query query = sess.createQuery(deleteProjectString);
					query.setParameterList("ids", labAssociatedIds);
					query.setParameter("idLab", lab.getIdLab());
					List projectsToDelete = query.list();
					for (Iterator i = projectsToDelete.iterator(); i.hasNext(); ) {
						sess.delete(i.next());
					}
					sess.flush();

					//
					// Create default user projects
					//
					if (lab.getMembers() != null && lab.getManagers() != null) {
						HashMap<Integer, List<Project>> userProjectMap = new HashMap<Integer, List<Project>>();
						HashMap<Integer, AppUser>       userMap        = new HashMap<Integer, AppUser>();
						initializeUserProjectMap(userProjectMap, userMap, (Set<AppUser>) lab.getMembers());
						initializeUserProjectMap(userProjectMap, userMap, (Set<AppUser>) lab.getManagers());
						hashProjects(userProjectMap, lab);
						// Now iterate through the hash and create a default project for each user
						// where one is not present
						for (Integer idAppUser : userProjectMap.keySet()) {
							List<Project> defaultProjects = userProjectMap.get(idAppUser);
							if (defaultProjects == null || defaultProjects.isEmpty()) {
								Project project = new Project();
								project.setIdAppUser(idAppUser);
								project.setIdLab(lab.getIdLab());
								AppUser theUser = userMap.get(idAppUser);
								project.setName("Experiments for " + theUser.getFirstLastDisplayName());
								sess.save(project);
							}
						}
						sess.flush();
					}
					//
					// Save core facilities
					//
					if (this.isNewLab) {
						// If a core admin (not a super admin) is adding the lab,
						// assign lab to same core facilty that the admin manages;
						if (!this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_ADMINISTER_ALL_CORE_FACILITIES)
								&& this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_ADMINISTER_USERS)
								&& this.getSecAdvisor().getCoreFacilitiesIManage().size() > 0) {
							TreeSet facilities = new TreeSet(new CoreFacilityComparator());
							for (Iterator i = this.getSecAdvisor().getCoreFacilitiesIManage().iterator(); i.hasNext(); ) {
								CoreFacility facility = (CoreFacility) i.next();
								facilities.add(facility);
							}
							lab.setCoreFacilities(facilities);
							sess.flush();
						}
						else {
							// If a super admin is adding the lab (or an admin that isn't managing a core facility),
							// see if there is just one core facility. in this case, assign the lab to that
							// core facility.
							int          coreFacilityCount   = 0;
							CoreFacility coreFacilityDefault = null;
							for (Iterator i = DictionaryManager.getDictionaryEntries("hci.gnomex.model.CoreFacility")
																								 .iterator(); i.hasNext(); ) {
								DictionaryEntry de = (DictionaryEntry) i.next();
								if (de instanceof NullDictionaryEntry) {
									continue;
								}
								CoreFacility cf = (CoreFacility) de;
								if (cf.getIsActive() != null && cf.getIsActive().equals("Y")) {
									coreFacilityCount++;
									if (coreFacilityDefault == null) {
										coreFacilityDefault = cf;
									}
								}
							}
							if (coreFacilityCount == 1) {
								TreeSet coreFacilities = new TreeSet(new CoreFacilityComparator());
								coreFacilities.add(coreFacilityDefault);
								lab.setCoreFacilities(coreFacilities);
								sess.flush();
							}
						}

					}
					else {
						if ((this.getSecurityAdvisor().hasPermission(SecurityAdvisor.CAN_ADMINISTER_ALL_CORE_FACILITIES) || this
								.getSecAdvisor().getCoreFacilitiesIManage().size() > 0)
								&& coreFacilityParser != null) {
							TreeSet facilities = new TreeSet(new CoreFacilityComparator());
							for (Iterator i = coreFacilityParser.getCoreFacilityMap().keySet().iterator(); i.hasNext(); ) {
								Integer idCoreFacility = (Integer) i.next();
								CoreFacility facility = (CoreFacility) coreFacilityParser.getCoreFacilityMap().get(
										idCoreFacility);
								facilities.add(facility);
							}
							lab.setCoreFacilities(facilities);

							if (labScreen.getIsActive() != null) {
								lab.setIsActive(labScreen.getIsActive());
							} else {
								if (lab.getCoreFacilities() != null && lab.getCoreFacilities().size() > 0) {
									lab.setIsActive("Y");
								}
								else {
									lab.setIsActive("N");
								}
							}

							sess.flush();
						}
					}

					sess.flush();

					this.xmlResult = "<SUCCESS idLab=\"" + lab.getIdLab() + "\"/>";
					JsonObject value = Json.createObjectBuilder()
																 .add("result", "SUCCESS")
																 .add("idLab", "" + lab.getIdLab())
																 .build();
					this.jsonResult = value.toString();

					setResponsePage(this.SUCCESS_JSP);

				}
				else {
					setResponsePage(this.ERROR_JSP);
				}

			}
			else {
				setResponsePage(this.ERROR_JSP);
			}

		}
		catch (Exception e) {
			this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in SaveLab ", e);

			throw new RollBackCommandException(e.getMessage());

		}
		return this;
	}

	private void newMemberNotificationEmail(Session sess, String email, String labName, AppUser recipient) {
		PropertyDictionaryHelper pdh         = PropertyDictionaryHelper.getInstance(sess);
		String                   fromAddress = pdh.getProperty(PropertyDictionary.GENERIC_NO_REPLY_EMAIL);
		StringBuffer             body        = new StringBuffer();
		String                   gnomexURL   = "<a href='" + this.launchAppURL + "'>Click here</a> to login.";
		body.append("This is to notify you that you have been added to the " + labName
				+ " and can now start submitting experiments.<br><br>");
		body.append(gnomexURL);

		if (!MailUtil.isValidEmail(email)) {
			LOG.error("Invalid Email Address " + email);
		}

		try {
			MailUtilHelper helper = new MailUtilHelper(email, fromAddress, "You've been added to a new GNomEx lab",
					body.toString(), null, true, DictionaryHelper.getInstance(sess), serverName);
			if (recipient != null) {
				helper.setRecipientAppUser(recipient);
			}
			MailUtil.validateAndSendEmail(helper);
		}
		catch (Exception e) {
			LOG.error("An exception has occurred in SaveLab ", e);
		}
	}

	private void initializeUserProjectMap(HashMap<Integer, List<Project>> userProjectMap,
																				HashMap<Integer, AppUser> userMap, Set<AppUser> theUsers) {
		for (AppUser theUser : theUsers) {
			List<Project> userProjects = userProjectMap.get(theUser.getIdAppUser());
			if (userProjects == null) {
				userProjects = new ArrayList<Project>();
				userProjectMap.put(theUser.getIdAppUser(), userProjects);
				userMap.put(theUser.getIdAppUser(), theUser);
			}
		}
	}

	private void hashProjects(HashMap<Integer, List<Project>> userProjectMap, Lab lab) {
		// for each project with idAppUser, associate it with the active members and managers of the lab
		if (lab.getProjects() != null) {
			for (Project proj : (Set<Project>) lab.getProjects()) {
				if (proj.getIdAppUser() != null) {
					List<Project> theProjects = userProjectMap.get(proj.getIdAppUser());
					if (theProjects != null) {
						theProjects.add(proj);
					}
				}
			}
		}
	}

	private void initializeLab(Lab lab) {
		lab.setFirstName(labScreen.getFirstName() != null ? labScreen.getFirstName().trim() : labScreen.getFirstName());
		lab.setLastName(labScreen.getLastName() != null ? labScreen.getLastName().trim() : labScreen.getLastName());
		lab.setDepartment(labScreen.getDepartment());

		lab.setContactAddress(labScreen.getContactAddress());
		lab.setContactCity(labScreen.getContactCity());
		lab.setContactCodeState(labScreen.getContactCodeState());
		lab.setContactEmail(labScreen.getContactEmail());
		lab.setContactName(labScreen.getContactName());
		lab.setContactAddress2(labScreen.getContactAddress2());
		lab.setContactPhone(labScreen.getContactPhone());
		lab.setContactZip(labScreen.getContactZip());
		lab.setContactCountry(labScreen.getContactCountry());
		lab.setIsCcsgMember(labScreen.getIsCcsgMember());
		lab.setIsExternalPricing(labScreen.getIsExternalPricing());
		lab.setIsExternalPricingCommercial(labScreen.getIsExternalPricingCommercial());
		lab.setExcludeUsage(labScreen.getExcludeUsage());
		lab.setBillingContactEmail(labScreen.getBillingContactEmail());
		lab.setBillingContactPhone(labScreen.getBillingContactPhone());
		lab.setAwsAccountNumber(labScreen.getAwsAccountNumber());

	}

	private void sendNewPOAccountEmail(Session sess, BillingAccount billingAccount, Lab lab) throws NamingException,
			MessagingException, IOException {
		PropertyDictionaryHelper dictionaryHelper = PropertyDictionaryHelper.getInstance(sess);

		StringBuffer submitterNote = new StringBuffer();
		StringBuffer body          = new StringBuffer();
		String submitterSubject = "GNomEx Billing Account \'" + billingAccount.getAccountName() + "\' for "
				+ Util.getLabDisplayName(lab, this.getUserPreferences()) + " approved";

		String PIEmail = lab.getContactEmail();

		CoreFacility facility = (CoreFacility) sess.load(CoreFacility.class, billingAccount.getIdCoreFacility());

		String emailRecipients = PIEmail;
		if (!MailUtil.isValidEmail(PIEmail)) {
			LOG.error("Invalid Email: " + PIEmail);
		}

		submitterNote.append("The following billing account " + "has been approved."
				+ "  Lab members can now submit experiment " + "requests against this account in <a href=\'" + launchAppURL
				+ "\'>GNomEx</a>.");

		body.append("<br><br>");
		body.append("<table border=\'0\'>");
		body.append("<tr><td>Lab:</td><td>" + lab.getName(false, false) + "</td></tr>");
		body.append("<tr><td>Account:</td><td>" + billingAccount.getAccountName() + "</td></tr>");
		if (billingAccount.getExpirationDateOther() != null && billingAccount.getExpirationDateOther().length() > 0) {
			body.append("<tr><td>Effective until:</td><td>" + billingAccount.getExpirationDateOther() + "</td></tr>");
		}
		body.append("</table>");

		String from = facility.getContactEmail();
		if (!MailUtil.isValidEmail(from)) {
			from = DictionaryHelper.getInstance(sess).getPropertyDictionary(PropertyDictionary.GENERIC_NO_REPLY_EMAIL);
		}

		MailUtilHelper helper = new MailUtilHelper(emailRecipients, from, submitterSubject, submitterNote.toString()
				+ body.toString(), null, true, DictionaryHelper.getInstance(sess), serverName);
		MailUtil.validateAndSendEmail(helper);

	}

	private class AppUserComparator implements Comparator, Serializable {
		public int compare(Object o1, Object o2) {
			AppUser u1 = (AppUser) o1;
			AppUser u2 = (AppUser) o2;

			return u1.getIdAppUser().compareTo(u2.getIdAppUser());

		}
	}

	private class InstitutionComparator implements Comparator, Serializable {
		public int compare(Object o1, Object o2) {
			Institution u1 = (Institution) o1;
			Institution u2 = (Institution) o2;

			return u1.getIdInstitution().compareTo(u2.getIdInstitution());

		}
	}

	private class CoreFacilityComparator implements Comparator, Serializable {
		public int compare(Object o1, Object o2) {
			CoreFacility u1 = (CoreFacility) o1;
			CoreFacility u2 = (CoreFacility) o2;

			return u1.getIdCoreFacility().compareTo(u2.getIdCoreFacility());

		}
	}

}
