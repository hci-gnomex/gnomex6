package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.framework.utilities.XMLReflectException;
import hci.gnomex.model.AppUserPublic;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.jdbc.ReturningWork;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.naming.NamingException;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashMap;
public class GetAppUserPublic extends GNomExCommand implements Serializable {

	// the static field for logging in Log4J
	private static Logger LOG = Logger.getLogger(GetAppUserPublic.class);

	private AppUserPublic appUser;

	public void validate() {
	}

	public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

		appUser = new AppUserPublic();
		HashMap errors = this.loadDetailObject(request, appUser);
		this.addInvalidFields(errors);

		if (appUser.getIdAppUser() == null) {
			this.addInvalidField("idAppUser required", "idAppUser required");
		}

		if (isValid()) {
			setResponsePage(this.SUCCESS_JSP);
		} else {
			setResponsePage(this.ERROR_JSP);
		}

	}

	public Command execute() throws RollBackCommandException {
		Session sess = null;
		Connection con = null;

		try {
			sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());

			AppUserPublic theAppUser = sess.get(AppUserPublic.class, appUser.getIdAppUser());

			Document doc = new Document(theAppUser.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement());

			MyReturnWork mw = new MyReturnWork(appUser.getIdAppUser());
			ResultSet rs = sess.doReturningWork(mw);

			Element notificationLabs = new Element("notificationLabs");
			while (rs.next()) {
				Element labNode = new Element("Lab");
				labNode.setAttribute("idLab", "" + rs.getInt("idLab"));

				String lastName = rs.getString("lastName");
				String firstName = rs.getString("firstName");
				String labName = Util.formatLabDisplayName(firstName, lastName, this.getUserPreferences());
				String doUploadAlert = rs.getString("doUploadAlert");
				if (doUploadAlert == null || doUploadAlert.equals("")) {
					doUploadAlert = "N";
				}

				labNode.setAttribute("labName", labName);
				labNode.setAttribute("role", rs.getString("role"));
				labNode.setAttribute("doUploadAlert", doUploadAlert);
				notificationLabs.addContent(labNode);
			}
			doc.getRootElement().addContent(notificationLabs);
			rs.close();

			XMLOutputter out = new org.jdom.output.XMLOutputter();
			this.xmlResult = out.outputString(doc);

			setResponsePage(this.SUCCESS_JSP);

		} catch (NamingException e) {
			this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetAppUserPublic ", e);

			throw new RollBackCommandException(e.getMessage());

		} catch (SQLException e) {
			this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetAppUserPublic ", e);

			throw new RollBackCommandException(e.getMessage());
		} catch (XMLReflectException e) {
			this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetAppUserPublic ", e);

			throw new RollBackCommandException(e.getMessage());
		} catch (Exception e) {
			this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetAppUserPublic ", e);

			throw new RollBackCommandException(e.getMessage());
		}

		if (isValid()) {
			setResponsePage(this.SUCCESS_JSP);
		} else {
			setResponsePage(this.ERROR_JSP);
		}

		return this;
	}

}

class MyReturnWork implements ReturningWork<ResultSet> {
	private Integer idAppUser;

	public MyReturnWork(Integer idAppUser) {
		this.idAppUser = idAppUser;
	}

	@Override
	public ResultSet execute(Connection conn) throws SQLException {
		Statement stmt = conn.createStatement();
		StringBuffer buf = new StringBuffer("select lm.idLab, l.lastName, l.firstName, 'Manager' as role, sendUploadAlert as doUploadAlert\n");
		buf.append(" from LabManager lm\n");
		buf.append("   join Lab l\n");
		buf.append("   on lm.idLab = l.idLab\n");
		buf.append(" where idAppUser = " + idAppUser.intValue() + "\n");
		buf.append(" union\n");
		buf.append(" select  lm.idLab, l.lastName, l.firstName, 'Collaborator' as role, sendUploadAlert as doUploadAlert\n");
		buf.append(" from LabCollaborator lm\n");
		buf.append("   join Lab l\n");
		buf.append("   on lm.idLab = l.idLab\n");
		buf.append(" where idAppUser = " + idAppUser.intValue() + "\n");
		buf.append(" union\n");
		buf.append(" select  lm.idLab, l.lastName, l.firstName, 'User' as role, sendUploadAlert  as doUploadAlert\n");
		buf.append(" from LabUser lm\n");
		buf.append("   join Lab l\n");
		buf.append("   on lm.idLab = l.idLab\n");
		buf.append(" where idAppUser = " + idAppUser.intValue() + "\n");
		buf.append(" order by lastName, firstName, role\n");
		return stmt.executeQuery(buf.toString());

	}

}
