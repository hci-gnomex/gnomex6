package hci.gnomex.api;

import hci.gnomex.security.DuoPolicy;
import hci.gnomex.security.duo.DuoConfig;
import hci.gnomex.security.duo.DuoSigner;
import io.buji.pac4j.subject.Pac4jPrincipal;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.PrincipalCollection;
import org.apache.shiro.subject.Subject;
import org.pac4j.core.profile.CommonProfile;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;


@Path("/duo")
@Produces(MediaType.APPLICATION_JSON)
public class DuoResource {

    @GET
    @Path("/config")
    public Response config() throws Exception {
        DuoConfig cfg = DuoConfig.load(DuoPolicy.isDuoEnabled());
        return Response.ok(new ConfigResponse(cfg.isUseDuo(), cfg.getHost())).build();
    }

    @POST
    @Path("/sign")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response sign(SignRequest req) throws Exception {
        if (req == null || req.username == null || req.username.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST).entity("{\"error\":\"username required\"}").build();
        }

        DuoConfig cfg = DuoConfig.load(DuoPolicy.isDuoEnabled());
        if (!cfg.isUseDuo()) {
            return Response.status(Response.Status.CONFLICT).entity("{\"error\":\"duo disabled\"}").build();
        }

        String sigRequest = DuoSigner.signRequest(cfg.getIkey(), cfg.getSkey(), cfg.getAkey(), req.username.trim());
        return Response.ok(new SignResponse(cfg.getHost(), sigRequest)).build();
    }

    @POST
    @Path("/verify")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response verify(VerifyRequest req) throws Exception {

        // -----------------------------
        // 0) Validate input
        // -----------------------------
        if (req == null || req.sig_response == null || req.sig_response.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"sig_response required\"}")
                    .build();
        }

        // -----------------------------
        // 1) Duo enabled?
        // -----------------------------
        DuoConfig cfg = DuoConfig.load(DuoPolicy.isDuoEnabled());
        if (!cfg.isUseDuo()) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"error\":\"duo disabled\"}")
                    .build();
        }

        // -----------------------------
        // 2) Must already be authenticated (primary login succeeded)
        //    We do NOT trust any username sent from the browser.
        // -----------------------------
        Subject subject = SecurityUtils.getSubject();
        if (subject == null) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"no subject (shiro not initialized)\"}")
                    .build();
        }

        PrincipalCollection principals = subject.getPrincipals();
        if (principals == null || principals.isEmpty()) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"not authenticated\"}")
                    .build();
        }

        // Extract the authenticated username from principals
        // - pac4j case: uid attribute
        // - direct shiro case: String principal
        String authenticatedUser = null;

        Pac4jPrincipal pjp = principals.oneByType(Pac4jPrincipal.class);
        if (pjp != null) {
            CommonProfile prof = pjp.getProfile();
            Object uid = (prof != null) ? prof.getAttribute("uid") : null;
            if (uid != null) {
                authenticatedUser = String.valueOf(uid);
            }
        }

        if (authenticatedUser == null) {
            String login = principals.oneByType(String.class);
            if (login != null && !login.isBlank()) {
                authenticatedUser = login;
            }
        }

        if (authenticatedUser == null || authenticatedUser.isBlank()) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"unable to determine authenticated user\"}")
                    .build();
        }

        // -----------------------------
        // 3) Verify Duo signature -> yields Duo-verified username
        // -----------------------------
        String duoUser = DuoSigner.verifyResponse(
                cfg.getIkey(),
                cfg.getSkey(),
                cfg.getAkey(),
                req.sig_response.trim()
        );

        if (duoUser == null || duoUser.isBlank()) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"ok\":false}")
                    .build();
        }

        // -----------------------------
        // 4) Enforce match: Duo must verify the SAME user that is authenticated
        // -----------------------------
        if (!authenticatedUser.equalsIgnoreCase(duoUser)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"duo user mismatch\"}")
                    .build();
        }

        // -----------------------------
        // 5) Mark session as Duo-verified (Shiro session, not HttpSession)
        // -----------------------------
        org.apache.shiro.session.Session shiroSession = subject.getSession(true);
        shiroSession.setAttribute("DUO_OK", Boolean.TRUE);
        shiroSession.setAttribute("DUO_USER", duoUser);

        // Optional: expire Duo approval with token TTL (15 min) or slightly longer
        // shiroSession.setTimeout(15 * 60 * 1000L);
        String sid = String.valueOf(shiroSession.getId());

        // -----------------------------
        // 6) Return success
        // -----------------------------
        return Response.ok(new VerifyResponse(true, duoUser)).build();
    }

    // DTOs (simple public fields for RESTEasy JSON)
    public static final class ConfigResponse {
        public boolean useduo;
        public String duohost;
        public ConfigResponse(boolean useduo, String duohost) {
            this.useduo = useduo;
            this.duohost = duohost;
        }
    }

    public static final class SignRequest {
        public String username;
    }

    public static final class SignResponse {
        public String duohost;
        public String sig_request;
        public SignResponse(String duohost, String sig_request) {
            this.duohost = duohost;
            this.sig_request = sig_request;
        }
    }

    public static final class VerifyRequest {
        public String sig_response;
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
