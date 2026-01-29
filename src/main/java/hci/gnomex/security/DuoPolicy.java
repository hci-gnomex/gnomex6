package hci.gnomex.security;

import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.PropertyDictionaryHelper;
import org.hibernate.Session;

import javax.naming.NamingException;
import java.sql.SQLException;

public final class DuoPolicy {

    private DuoPolicy() {}

    public static boolean isDuoEnabled() throws SQLException, NamingException {
        Session sess = null;
        try {
            sess = HibernateSession.currentReadOnlySession("guest");
            PropertyDictionaryHelper pdh = PropertyDictionaryHelper.getInstance(sess);
            return "Y".equalsIgnoreCase(
                    pdh.getProperty(PropertyDictionary.USEDUO)
            );
        }
        finally {
            HibernateSession.closeSession();
        }
    }
}
