package hci.gnomex.api;

import hci.gnomex.model.AppUser;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.security.DuoPolicy;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.PropertyDictionaryHelper;
import hci.ri.auth.util.JwtGenerator;
import hci.ri.auth.util.KeystoreRSASignatureConfiguration;
import io.buji.pac4j.subject.Pac4jPrincipal;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.PrincipalCollection;
import org.apache.shiro.subject.Subject;
import org.apache.shiro.web.env.IniWebEnvironment;
import org.apache.shiro.web.util.WebUtils;
import org.hibernate.Session;
import org.pac4j.core.profile.CommonProfile;
import org.pac4j.core.profile.jwt.JwtClaims;
import org.pac4j.jwt.profile.JwtProfile;

import javax.naming.NamingException;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.ForbiddenException;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.sql.SQLException;
import java.util.Collection;
import java.util.Date;
//import org.pac4j.saml.credentials.authenticator.SAML2Authenticator;

/**
 * A resource for operating on user entities in the system.
 *
 * @author charoldsen
 * @since 1.0.0
 */
@Path("/token")
public class TokenResource {

    final long TOKEN_EXP_IN_MINUTES = 15;

    //@Inject
    //private UserService userService;

    public TokenResource() {
    }

    /**
     * An endpoint to get a JWT token.
     *
     * @return a signed JWT token
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAuthenticatedUser(@Context ServletContext context,
                                         @Context HttpServletRequest request) {

        try {
            // ===============================
            // 1. Shiro Subject
            // ===============================
            Subject subject = SecurityUtils.getSubject();
            if (subject == null) {
                return error(500, "Shiro Subject is null (Shiro not initialized)");
            }

            PrincipalCollection principals = subject.getPrincipals();
            if (principals == null || principals.isEmpty()) {
                return error(401, "No principals found (user not authenticated or Shiro filter not applied)");
            }

            // ===============================
            // 2. Shiro Web Environment
            // ===============================
            Object envObj = WebUtils.getWebEnvironment(context);
            if (envObj == null) {
                return error(500, "WebEnvironment is null (EnvironmentLoaderListener missing?)");
            }
            if (!(envObj instanceof IniWebEnvironment)) {
                return error(500, "WebEnvironment is not IniWebEnvironment: " + envObj.getClass().getName());
            }

            IniWebEnvironment iwe = (IniWebEnvironment) envObj;

            // ===============================
            // 3. Signing config
            // ===============================
            KeystoreRSASignatureConfiguration sigConfig =
                    (KeystoreRSASignatureConfiguration)
                            iwe.getObject("signingConfig", KeystoreRSASignatureConfiguration.class);

            if (sigConfig == null) {
                return error(500, "signingConfig not found in shiro.ini environment");
            }

            // ===============================
            // 4. Duo gate
            // ===============================
            org.apache.shiro.session.Session shiroSession = null;
            if (DuoPolicy.isDuoEnabled()) {
                shiroSession = subject.getSession(false);
                Object duoOk = (shiroSession != null)
                        ? shiroSession.getAttribute("DUO_OK")
                        : null;

                if (!Boolean.TRUE.equals(duoOk)) {
                    return error(403, "Duo verification required (DUO_OK missing or false)");
                }
            }

            // ===============================
            // 5. Build JWT profile
            // ===============================
            JwtProfile profile = new JwtProfile();

            Pac4jPrincipal pjp = principals.oneByType(Pac4jPrincipal.class);
            if (pjp != null) {
                profile.addAttribute("sub", getAttributeFromProfile(pjp.getProfile(), "uid"));
                profile.addAttribute("name", getAttributeFromProfile(pjp.getProfile(), "displayName"));
            } else {
                String login = principals.oneByType(String.class);
                AppUser appUser = principals.oneByType(AppUser.class);

                if (login != null) {
                    profile.addAttribute("sub", login);
                } else {
                    return error(500, "No principal suitable for JWT subject (sub)");
                }

                if (appUser != null && appUser.getIdAppUser() != -1) {
                    profile.addAttribute("name", appUser.getDisplayName());
                } else {
                    profile.addAttribute("name", "University User");
                }
            }

            // ===============================
            // 5b. Duo mismatch guard (bind Duo to token subject)
            // ===============================
            if (DuoPolicy.isDuoEnabled()) {
                // Prefer the same session we already fetched; if not, re-fetch defensively
                if (shiroSession == null) {
                    shiroSession = subject.getSession(false);
                }

                Object duoUser = (shiroSession != null) ? shiroSession.getAttribute("DUO_USER") : null;
                String sub = String.valueOf(profile.getAttribute("sub"));

                if (duoUser == null || sub == null || sub.isBlank()
                        || !sub.equalsIgnoreCase(String.valueOf(duoUser))) {
                    return Response.status(Response.Status.FORBIDDEN)
                            .entity("{\"error\":\"Duo verification mismatch\"}")
                            .build();
                }
            }

            // ===============================
            // 6. Expiration
            // ===============================
            long expSeconds =
                    (System.currentTimeMillis() / 1000) + (TOKEN_EXP_IN_MINUTES * 60);
            profile.addAttribute(JwtClaims.EXPIRATION_TIME, expSeconds);

            // ===============================
            // 7. Generate token
            // ===============================
            JwtGenerator<CommonProfile> generator =
                    new JwtGenerator<>(sigConfig);

            String token = generator.generate(profile);

            return Response.ok("{\"auth_token\":\"" + token + "\"}").build();
        }
        catch (Exception e) {
            // Last-resort catch — ensures you ALWAYS see the cause
            return Response.status(500)
                    .entity("{\"error\":\"Unhandled exception\",\"exception\":\""
                            + e.getClass().getName()
                            + "\",\"message\":\""
                            + safe(e.getMessage())
                            + "\"}")
                    .build();
        }
    }

    private Object getAttributeFromProfile(CommonProfile profile, String attributeName) {
        Object attribute = profile.getAttribute(attributeName);

        if (attribute instanceof Collection<?> && ((Collection<?>) attribute).size() == 1) {
            return ((Collection<?>) attribute).iterator().next();
        }
        else {
            return attribute;
        }
    }

    private Response error(int status, String message) {
        return Response.status(status)
                .entity("{\"error\":\"" + message + "\"}")
                .build();
    }

    private String safe(String msg) {
        return msg == null ? "" : msg.replace("\"", "'");
    }

}




