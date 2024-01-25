package hci.gnomex.controller;

import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.ServletUtil;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

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
            sess = HibernateSession.currentReadOnlySession((req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest"));
            Util.buildAndSendUploadFileServletURL(req, res, sess, "UploadSampleSheetURLServlet", "UploadSampleSheetFileServlet.gx", Util.EMPTY_STRING_ARRAY);
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
