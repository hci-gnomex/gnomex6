package hci.gnomex.security.duo;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

public final class DuoSigner {

    private static final String DUO_PREFIX = "TX";
    private static final String APP_PREFIX = "APP";
    private static final String AUTH_PREFIX = "AUTH";

    // match your JS constants
    private static final long DUO_EXPIRE_SECONDS = 600;
    private static final long APP_EXPIRE_SECONDS = 7200;

    private DuoSigner() {}

    public static String signRequest(String ikey, String skey, String akey, String username) {
        validate(username, ikey, skey, akey);

        String vals = username + "|" + ikey;

        String duoSig = signVals(skey, vals, DUO_PREFIX, DUO_EXPIRE_SECONDS);
        String appSig = signVals(akey, vals, APP_PREFIX, APP_EXPIRE_SECONDS);

        return duoSig + ":" + appSig;
    }

    public static String verifyResponse(String ikey, String skey, String akey, String sigResponse) {
        if (sigResponse == null) return null;
        String[] parts = sigResponse.split(":");
        if (parts.length != 2) return null;

        String authSig = parts[0];
        String appSig  = parts[1];

        String authUser = parseVals(skey, authSig, AUTH_PREFIX, ikey);
        String appUser  = parseVals(akey, appSig, APP_PREFIX, ikey);

        if (authUser == null || appUser == null) return null;
        if (!authUser.equals(appUser)) return null;

        return authUser;
    }

    private static String signVals(String key, String vals, String prefix, long expireSeconds) {
        long exp = Instant.now().getEpochSecond() + expireSeconds;
        String val = vals + "|" + exp;

        String b64 = Base64.getEncoder().encodeToString(val.getBytes(StandardCharsets.UTF_8));
        String cookie = prefix + "|" + b64;

        String sig = hmacSha1Hex(key, cookie);
        return cookie + "|" + sig;
    }

    private static String parseVals(String key, String val, String prefix, String ikey) {
        long ts = Instant.now().getEpochSecond();

        String[] parts = val.split("\\|");
        if (parts.length != 3) return null;

        String uPrefix = parts[0];
        String uB64    = parts[1];
        String uSig    = parts[2];

        String expectedSig = hmacSha1Hex(key, uPrefix + "|" + uB64);

        // constant-time compare (avoid timing leaks)
        if (!constantTimeEquals(expectedSig, uSig)) return null;
        if (!prefix.equals(uPrefix)) return null;

        String decoded;
        try {
            decoded = new String(Base64.getDecoder().decode(uB64), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException e) {
            return null;
        }

        String[] cookieParts = decoded.split("\\|");
        if (cookieParts.length != 3) return null;

        String user = cookieParts[0];
        String uIkey = cookieParts[1];
        long exp;
        try {
            exp = Long.parseLong(cookieParts[2]);
        } catch (NumberFormatException e) {
            return null;
        }

        if (!ikey.equals(uIkey)) return null;
        if (ts >= exp) return null;

        return user;
    }

    private static String hmacSha1Hex(String key, String msg) {
        try {
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA1"));
            byte[] bytes = mac.doFinal(msg.getBytes(StandardCharsets.UTF_8));
            return toHex(bytes);
        } catch (Exception e) {
            throw new RuntimeException("HMAC failure", e);
        }
    }

    private static String toHex(byte[] bytes) {
        char[] hex = new char[bytes.length * 2];
        final char[] digits = "0123456789abcdef".toCharArray();
        for (int i = 0; i < bytes.length; i++) {
            int v = bytes[i] & 0xFF;
            hex[i * 2] = digits[v >>> 4];
            hex[i * 2 + 1] = digits[v & 0x0F];
        }
        return new String(hex);
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) return false;
        if (a.length() != b.length()) return false;
        int r = 0;
        for (int i = 0; i < a.length(); i++) {
            r |= a.charAt(i) ^ b.charAt(i);
        }
        return r == 0;
    }

    private static void validate(String username, String ikey, String skey, String akey) {
        if (username == null || username.isEmpty() || username.contains("|")) {
            throw new IllegalArgumentException("Invalid username");
        }
        if (ikey == null || ikey.length() != 20) {
            throw new IllegalArgumentException("Invalid ikey");
        }
        if (skey == null || skey.length() != 40) {
            throw new IllegalArgumentException("Invalid skey");
        }
        if (akey == null || akey.length() < 40) {
            throw new IllegalArgumentException("Invalid akey");
        }
    }
}
