package hci.gnomex.controller;

import hci.gnomex.constants.Constants;
import hci.gnomex.model.AppUser;
import hci.gnomex.utility.HibernateSession;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonWriter;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

/**
 * Created by u0556399 on 3/25/2020.
 */
public class CheckIsGNomExAccount extends HttpServlet {
	private static Logger LOG = Logger.getLogger(CheckIsGNomExAccount.class);

	private static String webContextPath;


	protected static void initLog4j() {
		String configFile;
		configFile = webContextPath + "/WEB-INF/classes/" + Constants.LOGGING_PROPERTIES;
		org.apache.log4j.PropertyConfigurator.configure(configFile);
		if (configFile == null) {
			System.err.println("[GNomExFrontController] No configuration file specified for log4j!");
		}
		org.apache.log4j.PropertyConfigurator.configure(configFile);
	}

	public void init(ServletConfig config) throws ServletException {
		super.init(config);
		webContextPath = config.getServletContext().getRealPath(Constants.FILE_SEPARATOR);

		initLog4j();  // we should only do this once
	}


	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		Session sess = null;

		try {
			sess = HibernateSession.currentReadOnlySession("guest");
			JsonObjectBuilder value = null;

			if (request != null && request.getParameter("UID") != null && !request.getParameter("UID").equals("")) {
				String username = request.getParameter("UID");

				List accounts = sess.createQuery(""
						+ " SELECT au "
						+ "   FROM AppUser AS au "
						+ "  WHERE au.uNID = :username "
						+ "     OR au.userNameExternal = :username "
				).setParameter("username", username).list();

				if (accounts.size() == 1) {
					value = Json.createObjectBuilder()
											.add("result", "SUCCESS")
											.add("hasUserAccount", "Y");
					if (((AppUser) accounts.get(0)).getIsActive() == null || !((AppUser) accounts.get(0)).getIsActive().equals("N")) {
						value.add("isActive", "Y");
					} else {
						value.add("isActive", "N");
					}

					if (((AppUser) accounts.get(0)).getPasswordExpired() != null && ((AppUser) accounts.get(0)).getPasswordExpired().equals("Y")) {
						value.add("passwordExpired", "Y");
					} else {
						value.add("passwordExpired", "N");
					}

				} else if (accounts.size() == 0) {
					value = Json.createObjectBuilder()
											.add("result", "SUCCESS")
											.add("hasUserAccount", "N")
											.add("isActive", "N")
											.add("passwordExpired", "N");
				} else {
					value = Json.createObjectBuilder()
											.add("result", "SUCCESS")
											.add("hasUserAccount", "N")
											.add("isActive", "N")
											.add("passwordExpired", "N");
				}
			} else {
				throw new Exception("No username received. Please contact GNomEx Support for assistance.");
			}

			JsonWriter jsonWriter = Json.createWriter(response.getOutputStream());
			response.setContentType("application/json; charset=UTF-8");
			jsonWriter.writeObject(value.build());
			jsonWriter.close();

		} catch (Exception e) {
			LOG.error("An error occurred in GetNewAccountServlet", e);
			response.addHeader("message", e.getMessage());

			JsonObject value = Json.createObjectBuilder()
														 .add("message", e.getMessage())
														 .add("result", "ERROR")
														 .build();
			JsonWriter jsonWriter = Json.createWriter(response.getOutputStream());

			response.setContentType("application/json; charset=UTF-8");
			jsonWriter.writeObject(value);
			jsonWriter.close();
		} finally {
			if (sess != null) {
				try {
					HibernateSession.closeSession();
				} catch (Exception e) {
					LOG.error("An error occurred in GetNewAccountServlet", e);
				}
			}

			response.setHeader("Cache-Control", "max-age=0, must-revalidate");
		}
	}

	protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		this.doGet(req, res);
	}
}
