package hci.gnomex.controller;

import hci.gnomex.constants.Constants;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.utility.*;

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

public class UploadDataTrackURLServlet extends HttpServlet {
    private static final Logger LOG = Logger.getLogger(UploadDataTrackURLServlet.class);

    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {

        // Restrict commands to local host if request is not secure
        if (!ServletUtil.checkSecureRequest(req)) {
            ServletUtil.reportServletError(res, "Secure connection is required. Prefix your request with 'https'");
            return;
        }

        Session sess = null;

        try {
            boolean isLocalHost = req.getServerName().equalsIgnoreCase("localhost") || req.getServerName().equals("127.0.0.1");

            sess = HibernateSession.currentReadOnlySession((req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest"));
            String portNumber = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.HTTP_PORT);
            if (portNumber == null) {
                portNumber = "";
            } else {
                portNumber = ":" + portNumber;
            }

            String baseURL = "http" + (isLocalHost ? "://" : "s://") + req.getServerName() + portNumber + req.getContextPath();
            String URL = baseURL + "/UploadDataTrackFileServlet.gx";

            // Get the valid file extensions
            StringBuilder fileExtensions = new StringBuilder();
            for (int x = 0; x < Constants.DATATRACK_FILE_EXTENSIONS.length; x++) {
                if (fileExtensions.length() > 0) {
                    fileExtensions.append(";");
                }
                fileExtensions.append("*");
                fileExtensions.append(Constants.DATATRACK_FILE_EXTENSIONS[x]);
            }

            JsonObject value = Json.createObjectBuilder()
                    .add("name", "UploadDataTrackURLServlet")
                    .add("url", URL)
                    .add("fileExtensions", fileExtensions.toString())
                    .build();
            res.setContentType("application/json");
            try (JsonWriter jsonWriter = Json.createWriter(res.getOutputStream())) {
                jsonWriter.writeObject(value);
            }
        } catch (Exception e) {
            LOG.error("Error in UploadDataTrackFileServlet", e);
        } finally {
            if (sess != null) {
                try {
                    HibernateSession.closeSession();
                } catch (Exception e) {
                    LOG.error("Error in UploadDataTrackFileServlet", e);
                }
            }
        }
    }
}
