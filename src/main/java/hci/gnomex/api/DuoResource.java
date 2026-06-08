package hci.gnomex.api;

import com.duosecurity.Client;
import com.duosecurity.exception.DuoException;
import hci.gnomex.security.DuoEligibility;
import hci.gnomex.security.DuoPolicy;
import hci.gnomex.security.duo.DuoConfig;
import hci.gnomex.security.duo.DuoUniversalService;

import io.buji.pac4j.subject.Pac4jPrincipal;

import org.apache.shiro.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.shiro.subject.PrincipalCollection;
import org.apache.shiro.subject.Subject;
import org.pac4j.core.profile.CommonProfile;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;


@Path("/duo")
@Produces(MediaType.APPLICATION_JSON)
public class DuoResource {

    private static final Logger LOG = LoggerFactory.getLogger(DuoResource.class);

    private static final String SESSION_DUO_STATE = "DUO_STATE";
    private static final String SESSION_DUO_OK = "DUO_OK";
    private static final String SESSION_DUO_USER = "DUO_USER";

    @GET
    @Path("/config")
    public Response config() throws Exception {
        DuoConfig cfg = DuoConfig.load(DuoPolicy.isDuoEnabled());
        return Response.ok(new ConfigResponse(cfg.isUseDuo(), cfg.getHost())).build();
    }

    /**
     * Starts Duo Universal Prompt (v4): returns a redirect URL after primary auth succeeded.
     * Replaces the legacy Web SDK v2 sig_request flow.
     */
    @POST
    @Path("/sign")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response sign(SignRequest req) throws Exception {
        String authenticatedUser = resolveAuthenticatedUser();
        if (authenticatedUser == null) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"not authenticated\"}")
                    .build();
        }

        if (req != null && req.username != null && !req.username.isBlank()
                && !authenticatedUser.equalsIgnoreCase(req.username.trim())) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"username mismatch\"}")
                    .build();
        }

        DuoConfig cfg = DuoConfig.load(DuoPolicy.isDuoEnabled());
        if (!cfg.isUseDuo()) {
            return Response.status(Response.Status.CONFLICT).entity("{\"error\":\"duo disabled\"}").build();
        }

        Response eligibilityFailure = denyUnlessRequiresDuoMfa(authenticatedUser);
        if (eligibilityFailure != null) {
            return eligibilityFailure;
        }

        String duoStep = "createClient";
        try {
            Client duoClient = DuoUniversalService.createClient(cfg);

            duoStep = "healthCheck";
            DuoUniversalService.healthCheck(duoClient);

            duoStep = "generateState";
            String state = DuoUniversalService.generateState(duoClient);

            duoStep = "createAuthUrl";
            String authUrl = DuoUniversalService.createAuthUrl(
                    duoClient, authenticatedUser, state);

            Subject subject = SecurityUtils.getSubject();
            org.apache.shiro.session.Session shiroSession = subject.getSession(true);
            shiroSession.setAttribute(SESSION_DUO_STATE, state);

            return Response.ok(new SignResponse(cfg.getHost(), authUrl, state)).build();
        } catch (DuoException e) {
            LOG.warn("Duo sign failed at step {} for user {}: {}", duoStep, authenticatedUser, e.getMessage(), e);
            return Response.status(Response.Status.SERVICE_UNAVAILABLE)
                    .entity("{\"error\":\"duo unavailable\"}")
                    .build();
        }
    }

    /**
     * Completes Duo Universal Prompt after redirect: validates state and exchanges duo_code.
     */
    @POST
    @Path("/verify")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response verify(VerifyRequest req) throws Exception {
        if (req == null || req.duo_code == null || req.duo_code.isBlank()
                || req.state == null || req.state.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"duo_code and state required\"}")
                    .build();
        }

        DuoConfig cfg = DuoConfig.load(DuoPolicy.isDuoEnabled());
        if (!cfg.isUseDuo()) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"error\":\"duo disabled\"}")
                    .build();
        }

        String authenticatedUser = resolveAuthenticatedUser();
        if (authenticatedUser == null) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"not authenticated\"}")
                    .build();
        }

        Response eligibilityFailure = denyUnlessRequiresDuoMfa(authenticatedUser);
        if (eligibilityFailure != null) {
            return eligibilityFailure;
        }

        Subject subject = SecurityUtils.getSubject();
        org.apache.shiro.session.Session shiroSession = subject.getSession(false);
        if (shiroSession == null) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"no session\"}")
                    .build();
        }

        Object savedState = shiroSession.getAttribute(SESSION_DUO_STATE);
        if (savedState == null || !req.state.trim().equals(savedState.toString())) {
            invalidatePartialDuoSession(subject, shiroSession);
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"invalid state\"}")
                    .build();
        }

        try {
            Client duoClient = DuoUniversalService.createClient(cfg);
            DuoUniversalService.exchangeCode(
                    duoClient, req.duo_code.trim(), authenticatedUser);
        } catch (DuoException e) {
            LOG.warn("Duo verify failed for user {}: {}", authenticatedUser, e.getMessage(), e);
            invalidatePartialDuoSession(subject, shiroSession);
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"ok\":false}")
                    .build();
        }

        shiroSession.removeAttribute(SESSION_DUO_STATE);
        shiroSession.setAttribute(SESSION_DUO_OK, Boolean.TRUE);
        shiroSession.setAttribute(SESSION_DUO_USER, authenticatedUser);

        return Response.ok(new VerifyResponse(true, authenticatedUser)).build();
    }

    /**
     * Mirrors {@code DirectLoginComponent}: only HCI UIDs with an active GNomEx account
     * (and not on the Duo exception list) may use /sign or /verify.
     */
    private static Response denyUnlessRequiresDuoMfa(String username) throws Exception {
        if (DuoEligibility.requiresDuoMfa(username)) {
            return null;
        }
        return Response.status(Response.Status.FORBIDDEN)
                .entity("{\"error\":\"duo mfa not required for this user\"}")
                .build();
    }

    private static void invalidatePartialDuoSession(Subject subject,
            org.apache.shiro.session.Session shiroSession) {
        if (shiroSession != null) {
            shiroSession.removeAttribute(SESSION_DUO_STATE);
            shiroSession.removeAttribute(SESSION_DUO_OK);
            shiroSession.removeAttribute(SESSION_DUO_USER);
        }
        if (subject != null && subject.isAuthenticated()) {
            subject.logout();
        }
    }

    private static String resolveAuthenticatedUser() {
        Subject subject = SecurityUtils.getSubject();
        if (subject == null) {
            return null;
        }

        PrincipalCollection principals = subject.getPrincipals();
        if (principals == null || principals.isEmpty()) {
            return null;
        }

        Pac4jPrincipal pjp = principals.oneByType(Pac4jPrincipal.class);
        if (pjp != null) {
            CommonProfile prof = pjp.getProfile();
            Object uid = (prof != null) ? prof.getAttribute("uid") : null;
            if (uid != null) {
                return String.valueOf(uid);
            }
        }

        String login = principals.oneByType(String.class);
        if (login != null && !login.isBlank()) {
            return login;
        }

        return null;
    }

    public static final class ConfigResponse {
        public boolean useduo;
        public String duohost;
        public ConfigResponse(boolean useduo, String duohost) {
            this.useduo = useduo;
            this.duohost = duohost;
        }
    }

    public static final class SignRequest {
        /** Optional; ignored unless it matches the authenticated principal. */
        public String username;
    }

    public static final class SignResponse {
        public String duohost;
        public String auth_url;
        public String state;
        /** @deprecated v2 field; not populated in v4 */
        public String sig_request;

        public SignResponse(String duohost, String authUrl, String state) {
            this.duohost = duohost;
            this.auth_url = authUrl;
            this.state = state;
            this.sig_request = null;
        }
    }

    public static final class VerifyRequest {
        public String duo_code;
        public String state;
    }

    public static final class VerifyResponse {
        public boolean ok;
        public String username;
        public VerifyResponse(boolean ok, String username) {
            this.ok = ok;
            this.username = username;
        }
    }
}
