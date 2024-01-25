package hci.gnomex.controller;

import hci.gnomex.model.AppUser;
import hci.gnomex.model.CoreFacility;
import hci.gnomex.model.Lab;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.query.Query;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;

public class ApproveUser extends HttpServlet {
public static Logger LOG = Logger.getLogger(ApproveUser.class);
private static String serverName;


protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
	serverName = req.getServerName();
	doPost(req, res);
}

protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
	String guid = "";
	String idAppUser = "";
	AppUser au;
	String message = "";
	Boolean deleteUser = false;

	// new lab parameters
	String requestedLabFirstName = "";
	String requestedLabName = "";
	String department = "";
	String labEmail = "";
	String labPhone = "";
	Integer requestedLabId = -1;
	List<Integer> idCoreFacilities = null;

	try {
		Session sess = HibernateSession.currentSession("approveUserServlet");
		guid = (request.getParameter("guid") != null) ? request.getParameter("guid") : "";
		idAppUser = (request.getParameter("idAppUser") != null) ? request.getParameter("idAppUser") : "";

		deleteUser = false;
		if (request.getParameter("deleteUser") != null && !request.getParameter("deleteUser").equals("")
				&& request.getParameter("deleteUser").equals("Y")) {
			deleteUser = true;
		}

		if (request.getParameter("requestedLabFirstName") != null
				&& !request.getParameter("requestedLabFirstName").equals("")) {
			requestedLabFirstName = request.getParameter("requestedLabFirstName");
		}

		if (request.getParameter("requestedLabId") != null && !request.getParameter("requestedLabId").equals("")) {
			requestedLabId = Integer.parseInt(request.getParameter("requestedLabId"));
		}

		if (request.getParameter("requestedLabName") != null && !request.getParameter("requestedLabName").equals("")) {
			requestedLabName = request.getParameter("requestedLabName");
		}

		if (request.getParameter("contactEmail") != null && !request.getParameter("contactEmail").equals("")) {
			labEmail = request.getParameter("contactEmail");
		}

		if (request.getParameter("contactPhone") != null && !request.getParameter("contactPhone").equals("")) {
			labPhone = request.getParameter("contactPhone");
		}

		if (request.getParameter("department") != null && !request.getParameter("department").equals("")) {
			department = request.getParameter("department");
		}
		if(request.getParameter("idCoreFacilities") != null && !request.getParameter("idCoreFacilities").equals("")){
			try{
				String[] coreFacilitiesArray =  (request.getParameter("idCoreFacilities")).split(",");
				idCoreFacilities = new ArrayList<>();
				for(String idCoreFacility : coreFacilitiesArray){
					idCoreFacilities.add(Integer.parseInt(idCoreFacility));
				}
			}catch(NumberFormatException e){
				message = "Error was cause when trying to determine which core facility lab belongs to please contact GNomEx Support ";
				throw new NumberFormatException(message);
			}

		}


		PropertyDictionaryHelper pdh = PropertyDictionaryHelper.getInstance(sess);
		DictionaryHelper dictionaryHelper = DictionaryHelper.getInstance(sess);
		String doNotReplyEmail = pdh.getProperty(PropertyDictionary.GENERIC_NO_REPLY_EMAIL);

		au = (AppUser) sess.createQuery("from AppUser au where au.idAppUser = '" + idAppUser + "'").uniqueResult();

		if (au == null) {
			message = "This user does not exist.";
		} else if (au.getIsActive().equals("Y")) {
			message = "This user has already been activated.  Thanks.";
		} else if (au.getIsActive().equals("N") && deleteUser) {
			String email = au.getEmail();
			sess.delete(au);
			sess.flush();

			MailUtilHelper helper = new MailUtilHelper(
					email,
					doNotReplyEmail,
					"Your GNomEx account has NOT been approved.",
					"You have not been given access to GNomEx. Please contact the P.I. of the lab you were requesting access to for the reason behind this.  If you requested the creation of a new lab, please contact the core facility director whose core you were trying to join.  Thank you.",
					null, true, dictionaryHelper, serverName);
			helper.setRecipientAppUser(au);
			MailUtil.validateAndSendEmail(helper);

			message = "The user has been successfully deleted.  The user has been notified of this action.";

		}else if (au.getGuid() != null && au.getGuid().equals(guid) && au.getGuidExpiration() != null
				&& au.getGuidExpiration().after(new Date(System.currentTimeMillis()))) { // guid
																							// matches
			au.setIsActive("Y");
			au.setGuid(null);
			au.setGuidExpiration(null);

			Lab theLab = null;
			// if we have a lab name, email, and phone then we have a new lab (these fields are required)
			if (!requestedLabName.equals("") && !labEmail.equals("") && !labPhone.equals("")) {
				// first check to make sure that the lab doesn't already exist.
				// this can happen if multiple requests for the same lab are generated and the core facility admin
				// approves all of the emails.  Then the same lab will re-created, thus causing duplicates.
				Query q = sess.createQuery("select l from Lab l where l.lastName = :lastName and l.firstName = :firstName");
				q.setParameter("lastName", requestedLabName);
				q.setParameter("firstName", requestedLabFirstName);
				List<Lab> labList = q.list();
				if(labList.size() == 1){
					theLab = sess.load(Lab.class, labList.get(0).getIdLab());
				} else{
					theLab = new Lab();
					theLab.setFirstName(requestedLabFirstName);
					theLab.setLastName(requestedLabName);
					theLab.setDepartment(department);
					theLab.setContactEmail(labEmail);
					theLab.setContactPhone(labPhone);
					theLab.setDepartment(department);
					theLab.setIsActive("Y");
					theLab.setCoreFacilities(new HashSet<CoreFacility>());
				}

			} else if (requestedLabId != -1) {
				theLab = sess.load(Lab.class, requestedLabId);
			}

			HashSet labSet = new HashSet();
			labSet.add(theLab);
			au.setLabs(labSet);
			if(requestedLabId == -1 && idCoreFacilities != null ){
				for(Integer idCoreFacilty :  idCoreFacilities){
					CoreFacility cf =  sess.load(CoreFacility.class, idCoreFacilty);
					theLab.getCoreFacilities().add(cf);
				}

			}


			//theLab.setCoreFacilities();

			String url = request.getRequestURL().substring(0, request.getRequestURL().indexOf("ApproveUser.gx"));
			String gnomexURL = "<a href='" + url + "'>Click here</a> to login.";

			String body = "Welcome to GNomEx.  Your user account has been activated<br><br>" + gnomexURL + "<br><br>";

			MailUtilHelper helper = new MailUtilHelper(au.getEmail(), doNotReplyEmail,
					"Your GNomEx account is now active", body, null, true, dictionaryHelper, serverName);
			helper.setRecipientAppUser(au);
			MailUtil.validateAndSendEmail(helper);

			message = "User successfully activated.  The user will be notified that their account is now active";
			sess.saveOrUpdate(theLab);
			sess.save(au);
			sess.flush();
		} else {
			message = "The link you clicked on has expired.  You will have to activate the user through the GNomEx app.";
			au.setGuid(null);
			au.setGuidExpiration(null);
			sess.save(au);
			sess.flush();
		}

	} catch (Exception e) {
		if(message == null || message.equals("")){
			message = "There was an issue activating the user.  Please activate through the GNomEx app and contact GNomEx support.  Thanks.";
		}
		LOG.error(message, e);
	} finally {
		try {
			HibernateSession.closeSession();
			String url = "/approve_user.jsp"; // relative url for display jsp page
			ServletContext sc = getServletContext();
			RequestDispatcher rd = sc.getRequestDispatcher(url);
			request.setAttribute("message", message);

			rd.forward(request, response);
		} catch (Exception e1) {
			LOG.error("ApproveUser warning - cannot close hibernate session", e1);
		}
	}
}

}
