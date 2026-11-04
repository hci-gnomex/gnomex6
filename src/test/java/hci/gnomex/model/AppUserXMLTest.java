package hci.gnomex.model;

import hci.framework.model.DetailObject;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;
import org.junit.Test;

import java.sql.Timestamp;
import java.util.HashSet;
import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

/**
 * AppUser objects are serialised to the browser by many commands (GetLab sends every member,
 * collaborator and manager of a lab). Password hashes, salts and one-time tokens must never be
 * part of that output, whichever command does the serialising.
 */
public class AppUserXMLTest {

    private static final String[] SECRET_ATTRIBUTES = { "passwordExternal", "salt", "guid", "guidExpiration", "confirmEmailGuid" };

    @Test
    public void userXmlLeavesOutCredentialsAndTokens() throws Exception {
        Element node = user(1, "Ada").toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();

        for (String name : SECRET_ATTRIBUTES) {
            assertNull(name + " should not be serialised", node.getAttribute(name));
        }
        assertEquals("Ada", node.getAttributeValue("firstName"));
        assertEquals("1", node.getAttributeValue("idAppUser"));
    }

    @Test
    public void labMembersLeaveOutCredentialsAndTokens() throws Exception {
        Lab lab = new Lab();
        lab.setIdLab(7);
        lab.setLastName("Test");
        Set<AppUser> members = new HashSet<>();
        members.add(user(1, "Ada"));
        members.add(user(2, "Grace"));
        lab.setMembers(members);
        lab.setCollaborators(new HashSet());
        lab.setManagers(new HashSet());
        // Collections Hibernate would load; the computed getters iterate them.
        lab.setInstitutions(new HashSet());
        lab.setProjects(new HashSet());
        lab.setCoreFacilities(new HashSet());
        lab.excludeMethodFromXML("getBillingAccounts");
        lab.excludeMethodFromXML("getApprovedBillingAccounts");
        lab.excludeMethodFromXML("getInternalBillingAccounts");
        lab.excludeMethodFromXML("getPOBillingAccounts");
        lab.excludeMethodFromXML("getCreditCardBillingAccounts");

        Element labNode = lab.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();
        String xml = new XMLOutputter().outputString(labNode);

        assertNotNull("the lab's members should be serialised", labNode.getChild("members"));
        assertEquals(2, labNode.getChild("members").getChildren().size());
        assertFalse("no salt in " + xml.length() + " chars", xml.contains("not-a-real-salt"));
        assertFalse("no reset token", xml.contains("not-a-real-guid"));
        assertFalse("no email token", xml.contains("not-a-real-email-guid"));
        assertFalse("no password hash", xml.contains("not-a-real-hash"));
    }

    private static AppUser user(int id, String firstName) {
        AppUser user = new AppUser();
        user.setIdAppUser(id);
        user.setFirstName(firstName);
        user.setLastName("Tester");
        user.setIsActive("Y");
        user.setUserNameExternal("user" + id);
        user.setPasswordExternal("not-a-real-hash-" + id);
        user.setSalt("not-a-real-salt-" + id);
        user.setGuid("not-a-real-guid-" + id);
        user.setGuidExpiration(new Timestamp(0));
        user.setConfirmEmailGuid("not-a-real-email-guid-" + id);
        return user;
    }
}
