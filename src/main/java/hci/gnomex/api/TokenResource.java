package hci.gnomex.api;

import hci.gnomex.model.AppUser;
import hci.gnomex.security.DuoPolicy;
import hci.ri.auth.util.JwtGenerator;
import hci.ri.auth.util.KeystoreRSASignatureConfiguration;
import io.buji.pac4j.subject.Pac4jPrincipal;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.PrincipalCollection;
import org.apache.shiro.subject.Subject;
import org.apache.shiro.web.env.IniWebEnvironment;
import org.apache.shiro.web.util.WebUtils;
import org.pac4j.core.profile.CommonProfile;
import org.pac4j.core.profile.jwt.JwtClaims;
import org.pac4j.jwt.profile.JwtProfile;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Collection;
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
    public Response getAuthenticatedUser(@Context ServletContext context, @Context HttpServletRequest request) {
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
            // 4. Duo Gate Check (with exceptions for External Users and Duo exception users)
            // ===============================
            if (DuoPolicy.isDuoEnabled()) {
                AppUser appUser = getAppUserFromPrincipal(principals); // Retrieve the user from principals

                // For non-external users, only the exception list can bypass Duo verification.
                if (!"Y".equals(appUser.getIsExternalUser())) {
                    String authenticatedUsername = getAuthenticatedUsername(principals);
                    if (!DuoPolicy.isDuoExceptionUser(authenticatedUsername)) {
                        // Check if Duo authentication is already completed
                        org.apache.shiro.session.Session shiroSession = subject.getSession(false);
                        Object duoOk = (shiroSession != null) ? shiroSession.getAttribute("DUO_OK") : null;

                        if (!Boolean.TRUE.equals(duoOk)) {
                            return error(403, "Duo verification required (DUO_OK missing or false)");
                        }
                    }
                }
            }

            // ===============================
            // 5. Build JWT Profile
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
            // 6. Expiration
            // ===============================
            long expSeconds = (System.currentTimeMillis() / 1000) + (TOKEN_EXP_IN_MINUTES * 60);
            profile.addAttribute(JwtClaims.EXPIRATION_TIME, expSeconds);

            // ===============================
            // 7. Generate Token
            // ===============================
            JwtGenerator<CommonProfile> generator = new JwtGenerator<>(sigConfig);
            String token = generator.generate(profile);

            return Response.ok("{\"auth_token\":\"" + token + "\"}").build();
        } catch (Exception e) {
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

    private AppUser getAppUserFromPrincipal(PrincipalCollection principals) {
        // Attempt to retrieve the AppUser from the principals
        AppUser appUser = principals.oneByType(AppUser.class);

        if (appUser == null) {
            // Handle the case where the AppUser is not found in the principals
            throw new WebApplicationException("User not found in the principals", Response.Status.UNAUTHORIZED);
        }

        return appUser;
    }

    private String getAuthenticatedUsername(PrincipalCollection principals) {
        Pac4jPrincipal pjp = principals.oneByType(Pac4jPrincipal.class);
        if (pjp != null && pjp.getProfile() != null) {
            Object uid = getAttributeFromProfile(pjp.getProfile(), "uid");
            if (uid != null && !String.valueOf(uid).trim().isEmpty()) {
                return String.valueOf(uid).trim();
            }
        }

        String login = principals.oneByType(String.class);
        if (login != null && !login.trim().isEmpty()) {
            return login.trim();
        }

        return null;
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
