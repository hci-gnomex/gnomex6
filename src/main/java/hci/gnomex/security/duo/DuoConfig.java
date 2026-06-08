package hci.gnomex.security.duo;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.io.FileInputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;

/**
 * Server-only Duo configuration (Web SDK v4 / Universal Prompt).
 *
 * Legacy property names (ikey, skey, host) are retained for backward compatibility
 * with existing duo.properties and JVM -Dgnomex.duo.* settings. Values are the same
 * as Duo's Client ID, Client secret, and API hostname.
 *
 * This class MUST NEVER be returned directly from a JAX-RS resource.
 */
public final class DuoConfig {

    private final boolean useDuo;

    /** Client ID (legacy name: integration key / ikey) */
    private final String ikey;

    /** Client secret (legacy name: secret key / skey) */
    @JsonIgnore
    private final String skey;

    /** Duo API hostname (e.g. api-xxxxx.duosecurity.com) */
    private final String host;

    /** OAuth redirect URI registered in the Duo admin panel */
    @JsonIgnore
    private final String redirectUri;

    private DuoConfig(boolean useDuo, String ikey, String skey, String host, String redirectUri) {
        this.useDuo = useDuo;
        this.ikey = ikey;
        this.skey = skey;
        this.host = host;
        this.redirectUri = redirectUri;
    }

    public boolean isUseDuo() {
        return useDuo;
    }

    public String getIkey() {
        return ikey;
    }

    public String getHost() {
        return host;
    }

    @JsonIgnore
    public String getSkey() {
        return skey;
    }

    @JsonIgnore
    public String getRedirectUri() {
        return redirectUri;
    }

    public static DuoConfig load(boolean useDuoFlagFromDbOrProps) throws Exception {
        if (!useDuoFlagFromDbOrProps) {
            return new DuoConfig(false, "", "", "", "");
        }

        String ikey = System.getProperty("gnomex.duo.ikey");
        String skey = System.getProperty("gnomex.duo.skey");
        String host = System.getProperty("gnomex.duo.host");
        String redirectUri = System.getProperty("gnomex.duo.redirect_uri");

        if (notBlank(ikey) && notBlank(skey) && notBlank(host) && notBlank(redirectUri)) {
            return new DuoConfig(true, ikey.trim(), skey.trim(), host.trim(), redirectUri.trim());
        }

        Path propsPath = Path.of("/properties/duo.properties");
        if (!Files.exists(propsPath)) {
            throw new IllegalStateException("Duo properties file not found: " + propsPath);
        }

        Properties props = new Properties();
        try (FileInputStream in = new FileInputStream(propsPath.toFile())) {
            props.load(in);
        }

        ikey = firstPresent(props, "ikey", "client_id");
        skey = firstPresent(props, "skey", "client_secret");
        host = require(props, "host");
        redirectUri = firstPresent(props, "redirect_uri", "redirectUri");

        return new DuoConfig(true, ikey, skey, host, redirectUri);
    }

    private static String firstPresent(Properties props, String... keys) {
        for (String key : keys) {
            String val = props.getProperty(key);
            if (notBlank(val)) {
                return val.trim();
            }
        }
        throw new IllegalStateException(
                "Missing required Duo property (one of): " + String.join(", ", keys)
        );
    }

    private static String require(Properties props, String key) {
        String val = props.getProperty(key);
        if (!notBlank(val)) {
            throw new IllegalStateException("Missing required Duo property: " + key);
        }
        return val.trim();
    }

    private static boolean notBlank(String s) {
        return s != null && !s.trim().isEmpty();
    }
}
