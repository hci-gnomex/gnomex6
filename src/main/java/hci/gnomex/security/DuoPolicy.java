package hci.gnomex.security;

import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.utility.HibernateSession;
import org.hibernate.Session;

import javax.naming.NamingException;
import java.sql.SQLException;

public final class DuoPolicy {

    private DuoPolicy() {}

    public static boolean isDuoEnabled() throws SQLException, NamingException {
        Session sess = null;
        try {
            sess = HibernateSession.currentReadOnlySession("guest");
            PropertyDictionary useDuoProp = (PropertyDictionary) sess.createQuery(
                    "from PropertyDictionary p where p.propertyName = :propertyName")
                    .setParameter("propertyName", PropertyDictionary.USEDUO)
                    .uniqueResult();
            String useDuoValue = useDuoProp != null ? useDuoProp.getPropertyValue() : null;
            return "Y".equalsIgnoreCase(useDuoValue);
        }
        finally {
            HibernateSession.closeSession();
        }
    }

    public static boolean isDuoExceptionUser(String username) throws SQLException, NamingException {
        if (username == null || username.trim().isEmpty()) {
            return false;
        }

        Session sess = null;
        try {
            sess = HibernateSession.currentReadOnlySession("guest");
            PropertyDictionary duoExceptionsProp = (PropertyDictionary) sess.createQuery(
                    "from PropertyDictionary p where p.propertyName = :propertyName")
                    .setParameter("propertyName", PropertyDictionary.DUOEXCEPTIONS)
                    .uniqueResult();

            if (duoExceptionsProp == null) {
                return false;
            }

            return isUsernameInDuoExceptions(username, duoExceptionsProp.getPropertyValue());
        }
        finally {
            HibernateSession.closeSession();
        }
    }

    private static boolean isUsernameInDuoExceptions(String username, String duoExceptions) {
        if (duoExceptions == null || duoExceptions.trim().isEmpty()
                || "none".equalsIgnoreCase(duoExceptions.trim())) {
            return false;
        }

        String normalizedUsername = username.trim();
        for (String exceptionUsername : duoExceptions.split("[,;\\s]+")) {
            if (normalizedUsername.equalsIgnoreCase(exceptionUsername.trim())) {
                return true;
            }
        }

        return false;
    }
}
