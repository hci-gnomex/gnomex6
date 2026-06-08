package hci.gnomex.security;

import hci.gnomex.model.AppUser;
import hci.gnomex.utility.HibernateSession;
import org.hibernate.Session;

import javax.naming.NamingException;
import java.sql.SQLException;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Server-side Duo MFA eligibility aligned with {@code DirectLoginComponent} and
 * {@code CheckIsGNomExAccount}.
 */
public final class DuoEligibility {

    /** HCI university ID: u + 7 or 8 digits (same as Angular {@code /^[uU]\d{7,8}$/}). */
    private static final Pattern HCI_UNIVERSITY_ID = Pattern.compile("^[uU]\\d{7,8}$");

    private DuoEligibility() {}

    public static boolean isHciUniversityId(String username) {
        return username != null && HCI_UNIVERSITY_ID.matcher(username.trim()).matches();
    }

    /**
     * Whether this user must complete Duo before receiving a JWT (mirrors the login UI Duo branch).
     */
    public static boolean requiresDuoMfa(String username) throws SQLException, NamingException {
        if (!DuoPolicy.isDuoEnabled()) {
            return false;
        }
        if (username == null || username.isBlank()) {
            return false;
        }
        String normalized = username.trim();
        if (DuoPolicy.isDuoExceptionUser(normalized)) {
            return false;
        }
        if (!isHciUniversityId(normalized)) {
            return false;
        }
        AccountStatus status = lookupAccountStatus(normalized);
        return status.hasUserAccount() && status.isActive();
    }

    /**
     * Whether the user may receive a token after primary login (account exists and is active),
     * matching the UI checks before {@code requestAccessToken()}.
     */
    public static boolean passesAccountGateForToken(String username) throws SQLException, NamingException {
        if (username == null || username.isBlank()) {
            return false;
        }
        AccountStatus status = lookupAccountStatus(username.trim());
        return status.hasUserAccount() && status.isActive();
    }

    /**
     * Lookup result aligned with {@code CheckIsGNomExAccount.gx}.
     */
    public static AccountStatus lookupAccountStatus(String username) throws SQLException, NamingException {
        Session sess = null;
        try {
            sess = HibernateSession.currentReadOnlySession("guest");
            @SuppressWarnings("unchecked")
            List<AppUser> accounts = sess.createQuery(
                            " SELECT au "
                                    + "   FROM AppUser AS au "
                                    + "  WHERE au.uNID = :username "
                                    + "     OR au.userNameExternal = :username ")
                    .setParameter("username", username)
                    .list();

            if (accounts.size() == 1) {
                AppUser user = accounts.get(0);
                boolean active = user.getIsActive() == null || !"N".equals(user.getIsActive());
                return new AccountStatus(true, active);
            }
            return new AccountStatus(false, false);
        } finally {
            HibernateSession.closeSession();
        }
    }

    public static final class AccountStatus {
        private final boolean hasUserAccount;
        private final boolean active;

        public AccountStatus(boolean hasUserAccount, boolean active) {
            this.hasUserAccount = hasUserAccount;
            this.active = active;
        }

        public boolean hasUserAccount() {
            return hasUserAccount;
        }

        public boolean isActive() {
            return active;
        }
    }
}
