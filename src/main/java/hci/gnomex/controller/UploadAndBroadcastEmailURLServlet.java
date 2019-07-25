package hci.gnomex.controller;

import hci.gnomex.constants.Constants;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.PropertyDictionaryHelper;
import hci.gnomex.utility.ServletUtil;

import java.io.IOException;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonWriter;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.hibernate.Session;

public class UploadAndBroadcastEmailURLServlet extends HttpServlet {
    private static final Logger LOG = Logger.getLogger(UploadAndBroadcastEmailURLServlet.class);

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // Restrict commands to local host if request is not secure
        if (!ServletUtil.checkSecureRequest(req)) {
            ServletUtil.reportServletError(resp, "Secure connection is required. Prefix your request with 'https'");
            return;
        }

        Session sess = null;

        try {
            boolean isLocalHost = req.getServerName().equalsIgnoreCase("localhost") || req.getServerName().equals("127.0.0.1");

            sess = HibernateSession.currentReadOnlySession((req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest"));
            String portNumber = PropertyDictionaryHelper.getInstance(sess).getQualifiedProperty(PropertyDictionary.HTTP_PORT, req.getServerName());
            if (portNumber == null) {
                portNumber = "";
            } else {
                portNumber = ":" + portNumber;
            }

            String baseURL = "http" + (isLocalHost ? "://" : "s://") + req.getServerName() + portNumber + req.getContextPath();
            String URL = baseURL + Constants.FILE_SEPARATOR + "UploadAndBroadcastEmailServlet.gx";

            JsonObject value = Json.createObjectBuilder()
                    .add("name", "UploadAndBroadcastEmailURLServlet")
                    .add("url", URL)
                    .build();
            resp.setContentType("application/json");
            try (JsonWriter jsonWriter = Json.createWriter(resp.getOutputStream())) {
                jsonWriter.writeObject(value);
            }
        } catch (Exception e) {
            LOG.error("An exception has occurred in UploadAndBroadcastEmailURLServlet ", e);
            System.out.println("An error has occurred in UploadAndBroadcastEmailServlet - " + e.toString());
        } finally {
            if (sess != null) {
                try {
                    HibernateSession.closeSession();
                } catch (Exception e) {
                    LOG.error("An exception has occurred in UploadAndBroadcastEmailURLServlet ", e);
                }
            }
        }
    }
}
