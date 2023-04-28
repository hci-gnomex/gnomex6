package hci.gnomex.controller;

import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.ServletUtil;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class ReportIssueFeedbackServletGetURL extends HttpServlet {
    private static final Logger LOG = Logger.getLogger(ReportIssueFeedbackServletGetURL.class);

    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {

        // Restrict commands to local host if request is not secure
        if (!ServletUtil.checkSecureRequest(req)) {
            ServletUtil.reportServletError(res, "Secure connection is required. Prefix your request with 'https'");
            return;
        }

        Session sess = null;

        try {
            sess = HibernateSession.currentReadOnlySession((req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest"));
            hci.gnomex.utility.Util.buildAndSendUploadFileServletURL(req, res, sess, "ReportIssueFeedbackServletGetURL", "ReportIssueFeedbackServlet.gx", hci.gnomex.utility.Util.EMPTY_STRING_ARRAY);
        } catch (Exception e) {
            LOG.error("An error has occured in ReportIssueServletGetURL - ");
        } finally {
            if (sess != null) {
                try {
                    HibernateSession.closeSession();
                } catch (Exception e) {
                    LOG.error("An error has occured in ReportIssueServletGetURL - ");
                }
            }
        }
    }
}
