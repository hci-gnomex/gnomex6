package hci.gnomex.utility;

import hci.gnomex.model.*;
import org.hibernate.Session;

import javax.json.Json;
import javax.json.JsonObject;
import java.util.HashSet;
import java.util.Set;

public class UserPreferences {

    public static final String USER_PREFERENCES_SESSION_KEY = "gnomexUserPreferences";

    private boolean formatNamesFirstLast = true;

    public UserPreferences() {
    }

    public UserPreferences(Session session) {
        PropertyDictionaryHelper propertyDictionaryHelper = PropertyDictionaryHelper.getInstance(session);

        String useLastFirstProperty = propertyDictionaryHelper.getProperty(PropertyDictionary.FORMAT_NAMES_LAST_FIRST);
        if (useLastFirstProperty != null && useLastFirstProperty.equals("Y")) {
            this.formatNamesFirstLast = false;
        }
    }

    public UserPreferences(AppUser user, Session session) {
        PropertyDictionaryHelper propertyDictionaryHelper = PropertyDictionaryHelper.getInstance(session);

        Set<Integer> allRelatedIdCoreFacilities = new HashSet<>();
        Set<CoreFacility> managedCores = (Set<CoreFacility>) user.getManagingCoreFacilities();
        if (managedCores != null) {
            for (CoreFacility core : managedCores) {
                allRelatedIdCoreFacilities.add(core.getIdCoreFacility());
            }
        }
        Set<Lab> labs = (Set<Lab>) user.getLabs();
        if (labs != null) {
            for (Lab lab : labs) {
                Set<CoreFacility> cores = (Set<CoreFacility>) lab.getCoreFacilities();
                if (cores != null) {
                    for (CoreFacility core : cores) {
                        allRelatedIdCoreFacilities.add(core.getIdCoreFacility());
                    }
                }
            }
        }
        if (user.getCodeUserPermissionKind().equals(UserPermissionKind.SUPER_ADMIN_PERMISSION_KIND)) {
            for (CoreFacility core : CoreFacility.getActiveCoreFacilities(session)) {
                allRelatedIdCoreFacilities.add(core.getIdCoreFacility());
            }
        }

        // Determine the format of names this user will see across the application
        for (Integer idCoreFacility : allRelatedIdCoreFacilities) {
            String useLastFirstProperty = propertyDictionaryHelper.getCoreFacilityProperty(idCoreFacility, PropertyDictionary.FORMAT_NAMES_LAST_FIRST);
            if (useLastFirstProperty != null && useLastFirstProperty.equals("Y")) {
                this.formatNamesFirstLast = false;
                break;
            }
        }
    }

    public boolean getFormatNamesFirstLast() {
        return this.formatNamesFirstLast;
    }

    public JsonObject toJsonObject() {
        return Json.createObjectBuilder()
                .add("formatNamesFirstLast", this.formatNamesFirstLast ? "Y" : "N")
                .build();
    }

}
