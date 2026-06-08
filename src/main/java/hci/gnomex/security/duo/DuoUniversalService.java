package hci.gnomex.security.duo;

import com.duosecurity.Client;
import com.duosecurity.exception.DuoException;
import com.duosecurity.model.Token;

/**
 * Thin wrapper around Duo's Universal Prompt (Web SDK v4) Java client.
 */
public final class DuoUniversalService {

    private DuoUniversalService() {}

    public static Client createClient(DuoConfig cfg) throws DuoException {
        return new Client(cfg.getIkey(), cfg.getSkey(), cfg.getHost(), cfg.getRedirectUri());
    }

    public static void healthCheck(Client client) throws DuoException {
        client.healthCheck();
    }

    public static String generateState(Client client) {
        return client.generateState();
    }

    public static String createAuthUrl(Client client, String username, String state) throws DuoException {
        return client.createAuthUrl(username, state);
    }

    public static Token exchangeCode(Client client, String duoCode, String username) throws DuoException {
        return client.exchangeAuthorizationCodeFor2FAResult(duoCode, username);
    }
}
