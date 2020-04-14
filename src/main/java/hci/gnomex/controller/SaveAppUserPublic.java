package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.AppUser;
import hci.gnomex.security.EncryptionUtility;
import hci.gnomex.utility.HibernateSession;

import java.io.Serializable;
import java.io.StringReader;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.*;

import javax.json.*;
import javax.servlet.http.HttpSession;

import hci.gnomex.utility.PasswordUtil;
import org.hibernate.query.Query;
import org.hibernate.Session;
import org.hibernate.jdbc.Work;
import org.apache.log4j.Logger;
public class SaveAppUserPublic extends GNomExCommand implements Serializable {

	// the static field for logging in Log4J
	private static Logger LOG = Logger.getLogger(SaveAppUserPublic.class);

	//private static String LAB_USER = "USER";
	//private static String LAB_MANAGER = "MANAGER";
	//private static String LAB_COLLABORATOR = "COLLABORATOR";

	private AppUser appUserScreen;
	private JsonArray userNotificationLabs = null;
	private EncryptionUtility passwordEncrypter;

	public void validate() {
	}

	public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

		appUserScreen = new AppUser();
		HashMap errors = this.loadDetailObject(request, appUserScreen);
		this.addInvalidFields(errors);
		if (appUserScreen.getIdAppUser() == null || appUserScreen.getIdAppUser() == 0) {
			this.addInvalidField("idAppUser", "idAppUser is null or zero");
		}

		String userNotificationLabsJSONString = request.getParameter("userNotificationLabsJSONString");
		if (Util.isParameterNonEmpty(userNotificationLabsJSONString)) {
			try {
				JsonReader jsonReader = Json.createReader(new StringReader(userNotificationLabsJSONString));
				this.userNotificationLabs = jsonReader.readArray();
				jsonReader.close();
			} catch (Exception e) {
				this.addInvalidField("userNotificationLabsJSONString", "Invalid userNotificationLabsJSONString");
				this.errorDetails = Util.GNLOG(LOG,"Cannot parse userNotificationLabsJSONString", e);
			}
		}
	}

	public Command execute() throws RollBackCommandException {
		Session sess = null;
		try {
			sess = HibernateSession.currentSession(this.getUsername());
			passwordEncrypter = new EncryptionUtility();

			AppUser appUser = sess.load(AppUser.class, appUserScreen.getIdAppUser());
			if (isDuplicateUserName(sess)){
				this.addInvalidField("Duplicate login/uNID", "That login/uNID is already in use.");
			} else if(initializeAppUser(appUser)) {
				sess.save(appUser);
			} else{
				this.addInvalidField("","Please make sure you have specified a valid login or uNID(u followed by 7 digits)." +
						"If you have specified a login then please make sure to provide a password that meets complexity requirements.");
			}

			if (this.isValid()) {
				sess.flush();

				if (this.userNotificationLabs != null) {
					MyWork mw = new MyWork(this.userNotificationLabs, appUserScreen.getIdAppUser());
					sess.doWork(mw);
				}
				JsonObject value = Json.createObjectBuilder()
						.add("result", "SUCCESS")
						.add("idAppUser", appUser.getIdAppUser())
						.build();
				this.jsonResult = value.toString();
				setResponsePage(this.SUCCESS_JSP);
			} else {
				setResponsePage(this.ERROR_JSP);
			}

		} catch (Exception e) {
			this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in SaveAppUserPublic ", e);
			throw new RollBackCommandException(e.getMessage());
		}

		return this;
	}

	private boolean isDuplicateUserName(Session sess){

		int idAppUser = appUserScreen.getIdAppUser();
		List<Integer> l = new ArrayList<Integer>();
		if(appUserScreen.getuNID() != null && !appUserScreen.getuNID().trim().equals("")){
			Query q = sess.createQuery("SELECT idAppUser from AppUser where uNID = :uNID");
			q.setString("uNID", appUserScreen.getuNID());
			l = q.list();

		} else if(appUserScreen.getUserNameExternal() != null && !appUserScreen.getUserNameExternal().trim().equals("")){
			Query q = sess.createQuery("SELECT idAppUser from AppUser where userNameExternal = :userNameExternal");
			q.setString("userNameExternal", appUserScreen.getUserNameExternal());
			l = q.list();
		}

		//if greater than one then it is duplicate and don't allow
		//if zero then it is fresh and can be used.
		//if it is 1 then check to see if it belongs to current user
		if(l.size() == 0){
			return false;
		} else if(l.size() == 1){
			int x = l.get(0);
			//if they match then it is the owners and it is not duplicate
			//it it is not the owners then the name can't be used.
			return !(x == idAppUser);
		} else {
			return true;
		}
	}

	private boolean initializeAppUser(AppUser appUser) {
		appUser.setFirstName(appUserScreen.getFirstName());
		appUser.setLastName(appUserScreen.getLastName());
		appUser.setInstitute(appUserScreen.getInstitute());
		appUser.setDepartment(appUserScreen.getDepartment());
		appUser.setEmail(appUserScreen.getEmail());
		appUser.setPhone(appUserScreen.getPhone());
		appUser.setUcscUrl(appUserScreen.getUcscUrl());

		if (appUserScreen.getuNID() != null && !appUserScreen.getuNID().trim().equals("")) {
			if(appUserScreen.getuNID().startsWith("u") && appUserScreen.getuNID().length() == 8){
				appUser.setUserNameExternal(null);
				appUser.setPasswordExternal(null);
				appUser.setuNID(appUserScreen.getuNID());
				return true;
			} else{
				return false;
			}


		} else if (appUserScreen.getUserNameExternal() != null && !appUserScreen.getUserNameExternal().trim().equals("")
				&& appUserScreen.getPasswordExternal() != null && !appUserScreen.getPasswordExternal().equals("")) {
				appUser.setuNID(null);
				appUser.setUserNameExternal(appUserScreen.getUserNameExternal());

			// only update password if they have updated it
			if (!appUserScreen.getPasswordExternal().equals(AppUser.MASKED_PASSWORD)) {
				if (!PasswordUtil.passwordMeetsRequirements(appUserScreen.getPasswordExternal())) {
					return false;
				}
				String salt = passwordEncrypter.createSalt();
				String encryptedPassword = passwordEncrypter.createPassword(appUserScreen.getPasswordExternal(), salt);
				appUser.setSalt(salt);
				appUser.setPasswordExternal(encryptedPassword);

			}

			return true;

		} else{
			return false;
		}

	}


	class MyWork implements Work {
		private JsonArray labs;
		private Integer idAppUser;

		private MyWork(JsonArray labs, Integer idAppUser) {
			this.labs = labs;
			this.idAppUser = idAppUser;
		}

		@Override
		public void execute(Connection conn) throws SQLException {
			PreparedStatement stmt = null;
			PreparedStatement stmtManager = null;
			PreparedStatement stmtCollaborator = null;
			PreparedStatement stmtUser = null;
			String updateStringManager = "UPDATE LabManager SET sendUploadAlert = ? WHERE idLab = ? AND idAppUser = ?";
			String updateStringCollaborator = "UPDATE LabCollaborator SET sendUploadAlert = ? WHERE idLab = ? AND idAppUser = ?";
			String updateStringUser = "UPDATE LabUser SET sendUploadAlert = ? WHERE idLab = ? AND idAppUser = ?";
			try {
				conn.setAutoCommit(false);
				stmtManager = conn.prepareStatement(updateStringManager);
				stmtCollaborator = conn.prepareStatement(updateStringCollaborator);
				stmtUser = conn.prepareStatement(updateStringUser);
				for (int i = 0; i < this.labs.size(); i++) {
					JsonObject lab = this.labs.getJsonObject(i);
					String idLab = lab.getString("idLab");
					String role = lab.getString("role");
					String doUploadAlert = lab.getString("doUploadAlert");

					switch (role) {
						case "Manager":
							stmt = stmtManager;
							break;
						case "Collaborator":
							stmt = stmtCollaborator;
							break;
						case "User":
							stmt = stmtUser;
							break;
						default:
							stmt = null;
							break;
					}
					if (stmt == null) {
						continue;
					}

					stmt.setString(1, doUploadAlert);
					stmt.setString(2, idLab);
					stmt.setInt(3, this.idAppUser);
					stmt.executeUpdate();
					conn.commit();

					stmt = null;
				}
			} catch (SQLException e) {
				try {
					conn.rollback();
				} catch (SQLException e2) {
				}
				throw e;
			} finally {
				if (stmtManager != null) {
					stmtManager.close();
				}
				if (stmtCollaborator != null) {
					stmtCollaborator.close();
				}
				if (stmtUser != null) {
					stmtUser.close();
				}
			}
		}
	}
}
