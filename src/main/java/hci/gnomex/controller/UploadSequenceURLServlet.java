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

public class UploadSequenceURLServlet extends HttpServlet {
    private static Logger LOG = Logger.getLogger(UploadSequenceURLServlet.class);

    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {

        // Restrict commands to local host if request is not secure
        if (!ServletUtil.checkSecureRequest(req)) {
            ServletUtil.reportServletError(res, "Secure connection is required. Prefix your request with 'https'");
            return;
        }

        Session sess = null;

        try {
            sess = HibernateSession.currentReadOnlySession((req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest"));
            Util.buildAndSendUploadFileServletURL(req, res, sess, "UploadSequenceURLServlet", "UploadSequenceFileServlet.gx", Constants.SEQUENCE_FILE_EXTENSIONS);
        } catch (Exception e) {
            LOG.error("Error in UploadSequenceURLServlet", e);
        } finally {
            if (sess != null) {
                try {
                    HibernateSession.closeSession();
                } catch (Exception e) {
                    LOG.error("Error in UploadSequenceURLServlet", e);
                }
            }
        }
    }
}
