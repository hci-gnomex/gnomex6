package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.UserPreferences;
import hci.gnomex.utility.Util;
import hci.framework.control.RollBackCommandException;

import java.io.Serializable;
import javax.servlet.http.HttpSession;
import org.apache.log4j.Logger;

public class CreateUserPreferences extends GNomExCommand implements Serializable {

    private static Logger LOG = Logger.getLogger(CreateUserPreferences.class);

    private boolean forGuest;
    private UserPreferences userPreferences;

    public void validate() {
    }

    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
        String forGuestParameter = request.getParameter("forGuest");
        if (Util.isParameterNonEmpty(forGuestParameter) && Util.isParameterTrue(forGuestParameter)) {
            this.forGuest = true;
        }
    }

    public Command execute() throws RollBackCommandException {
        try {
            if (this.forGuest) {
                this.userPreferences = new UserPreferences(this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername()));
            } else {
                this.userPreferences = new UserPreferences(this.getSecAdvisor().getAppUser(), this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername()));
            }
            this.getSecAdvisor().setUserPreferences(this.userPreferences);
            this.jsonResult = this.userPreferences.toJsonObject().toString();
        } catch (Exception ex) {
            this.errorDetails = Util.GNLOG(LOG, "An exception occurred in CreateUserPreferences ", ex);
            throw new RollBackCommandException();
        }
        return this;
    }

    public HttpSession setSessionState(HttpSession session) {
        session.setAttribute(UserPreferences.USER_PREFERENCES_SESSION_KEY, this.userPreferences);
        return session;
    }

}
