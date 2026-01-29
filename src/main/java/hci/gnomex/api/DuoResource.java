package hci.gnomex.api;

import hci.gnomex.security.DuoPolicy;
import hci.gnomex.security.duo.DuoConfig;
import hci.gnomex.security.duo.DuoSigner;

import javax.naming.NamingException;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.PropertyDictionaryHelper;
import org.hibernate.Session;

import java.sql.SQLException;

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
        if (req == null || req.sig_response == null || req.sig_response.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST).entity("{\"error\":\"sig_response required\"}").build();
        }

        DuoConfig cfg = DuoConfig.load(DuoPolicy.isDuoEnabled());
        if (!cfg.isUseDuo()) {
            return Response.status(Response.Status.CONFLICT).entity("{\"error\":\"duo disabled\"}").build();
        }

        String user = DuoSigner.verifyResponse(cfg.getIkey(), cfg.getSkey(), cfg.getAkey(), req.sig_response.trim());
        if (user == null) {
            return Response.status(Response.Status.UNAUTHORIZED).entity("{\"ok\":false}").build();
        }

        return Response.ok(new VerifyResponse(true, user)).build();
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
