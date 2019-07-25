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

public class UploadSampleSheetURLServlet extends HttpServlet {

    // the static field for logging in Log4J
    private static Logger LOG = Logger.getLogger(UploadSampleSheetURLServlet.class);

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
            String portNumber = PropertyDictionaryHelper.getInstance(sess).getQualifiedProperty(PropertyDictionary.HTTP_PORT, req.getServerName());
            if (portNumber == null) {
                portNumber = "";
            } else {
                portNumber = ":" + portNumber;
            }

            String baseURL = "http" + (isLocalHost ? "://" : "s://") + req.getServerName() + portNumber + req.getContextPath();
            String URL = baseURL + Constants.FILE_SEPARATOR + "UploadSampleSheetFileServlet.gx";

            JsonObject value = Json.createObjectBuilder()
                    .add("name", "UploadSampleSheetURLServlet")
                    .add("url", URL)
                    .build();
            res.setContentType("application/json");
            try (JsonWriter jsonWriter = Json.createWriter(res.getOutputStream())) {
                jsonWriter.writeObject(value);
            }
        } catch (Exception e) {
            LOG.error("An error occurred in UploadSampleSheetURLServlet", e);
        } finally {
            try {
                if (sess != null) {
                    HibernateSession.closeSession();
                }
            } catch (Exception e) {
                LOG.error("An error occurred in UploadSampleSheetURLServlet", e);
            }
        }
    }
}
