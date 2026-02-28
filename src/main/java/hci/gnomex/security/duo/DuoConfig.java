package hci.gnomex.security.duo;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.io.FileInputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;

/**
 * Server-only Duo configuration.
 *
 * This class MUST NEVER be returned directly from a JAX-RS resource.
 * Secrets are protected with @JsonIgnore as a defensive safety net.
 */
public final class DuoConfig {

    private final boolean useDuo;

    /** Integration key (safe-ish to expose, but still server-owned) */
    private final String ikey;

    /** Server-only secrets */
    @JsonIgnore
    private final String skey;

    @JsonIgnore
    private final String akey;

    /** Duo API host */
    private final String host;

    private DuoConfig(boolean useDuo, String ikey, String skey, String akey, String host) {
        this.useDuo = useDuo;
        this.ikey = ikey;
        this.skey = skey;
        this.akey = akey;
        this.host = host;
    }

    /* =========================
       Public / internal getters
       ========================= */

    public boolean isUseDuo() {
        return useDuo;
    }

    public String getIkey() {
        return ikey;
    }

    public String getHost() {
        return host;
    }

    /* =========================
       Server-only getters
       ========================= */

    @JsonIgnore
    public String getSkey() {
        return skey;
    }

    @JsonIgnore
    public String getAkey() {
        return akey;
    }

    /* =========================
       Factory loader
       ========================= */

    public static DuoConfig load(boolean useDuoFlagFromDbOrProps) throws Exception {

        // Duo disabled globally → return empty, non-secret config
        if (!useDuoFlagFromDbOrProps) {
            return new DuoConfig(false, "", "", "", "");
        }

        // Prefer JVM system properties (best for prod)
        String ikey = System.getProperty("gnomex.duo.ikey");
        String skey = System.getProperty("gnomex.duo.skey");
        String akey = System.getProperty("gnomex.duo.akey");
        String host = System.getProperty("gnomex.duo.host");

        if (notBlank(ikey) && notBlank(skey) && notBlank(akey) && notBlank(host)) {
            return new DuoConfig(
                    true,
                    ikey.trim(),
                    skey.trim(),
                    akey.trim(),
                    host.trim()
            );
        }

        // Fallback to legacy properties file
        Path propsPath = Path.of("/properties/duo.properties");
        if (!Files.exists(propsPath)) {
            throw new IllegalStateException(
                    "Duo properties file not found: " + propsPath
            );
        }

        Properties props = new Properties();
        try (FileInputStream in = new FileInputStream(propsPath.toFile())) {
            props.load(in);
        }

        ikey = require(props, "ikey");
        skey = require(props, "skey");
        akey = require(props, "akey");
        host = require(props, "host");

        return new DuoConfig(true, ikey, skey, akey, host);
    }

    /* =========================
       Helpers
       ========================= */

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
