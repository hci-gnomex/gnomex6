package hci.gnomex.controller;

import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.ServletUtil;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import hci.gnomex.utility.Util;
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
            sess = HibernateSession.currentReadOnlySession((req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest"));
            Util.buildAndSendUploadFileServletURL(req, resp, sess, "UploadAndBroadcastEmailURLServlet", "UploadAndBroadcastEmailServlet.gx", Util.EMPTY_STRING_ARRAY);
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
