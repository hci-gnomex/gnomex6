package hci.gnomex.controller;

import hci.gnomex.constants.Constants;
import hci.gnomex.utility.*;

import java.io.IOException;

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
            sess = HibernateSession.currentReadOnlySession((req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest"));
            Util.buildAndSendUploadFileServletURL(req, res, sess, "UploadDataTrackURLServlet", "UploadDataTrackFileServlet.gx", Constants.DATATRACK_FILE_EXTENSIONS);
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
