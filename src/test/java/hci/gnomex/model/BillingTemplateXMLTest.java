package hci.gnomex.model;

import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.input.SAXBuilder;
import org.jdom.output.XMLOutputter;
import org.junit.Test;

import java.io.StringReader;
import java.lang.reflect.Proxy;
import java.math.BigDecimal;
import java.util.TreeSet;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;

/**
 * BillingTemplate.toXML output is written with jdom's XMLOutputter (GetBillingTemplate, GetRequest,
 * CreateBillingItems), which escapes attribute values itself. Values must therefore be put on the
 * Element raw; pre-escaping them shows up in the client as literal "&amp;" / "&quot;".
 */
public class BillingTemplateXMLTest {

    private static final String ACCOUNT_NAME = "Smith & Jones \"Core\" <Lab's>";

    @Test
    public void attributeValuesSurviveARoundTripUnchanged() throws Exception {
        Element item = parse(render(template()).getRootElement()).getRootElement().getChild("BillingTemplateItem");

        assertEquals(ACCOUNT_NAME, item.getAttributeValue("accountName"));
        assertEquals("1234 - " + ACCOUNT_NAME, item.getAttributeValue("accountNumberDisplay"));
        assertEquals("1234", item.getAttributeValue("accountNumber"));
        assertEquals("7", item.getAttributeValue("idBillingAccount"));
        assertEquals("100", item.getAttributeValue("idLab"));
    }

    @Test
    public void serialisedXmlIsEscapedExactlyOnce() throws Exception {
        String xml = new XMLOutputter().outputString(render(template()));

        assertFalse(xml, xml.contains("&amp;amp;"));
        assertFalse(xml, xml.contains("&amp;quot;"));
        assertFalse(xml, xml.contains("&amp;lt;"));
    }

    @Test
    public void nullValuesBecomeEmptyAttributes() throws Exception {
        BillingTemplate template = template();
        BillingTemplateItem item = template.getItems().iterator().next();
        item.setDollarAmount(null);
        item.setPercentSplit(null);

        Element node = render(template).getRootElement().getChild("BillingTemplateItem");

        assertEquals("", node.getAttributeValue("dollarAmount"));
        assertEquals("", node.getAttributeValue("percentSplit"));
        assertEquals("", node.getAttributeValue("dollarAmountBalance"));
    }

    // ---------------------------------------------------------------- fixtures

    private static BillingTemplate template() {
        BillingTemplate template = new BillingTemplate() {
            // The real check queries billing items.
            @Override public boolean canBeDeactivated(Session sess) { return false; }
        };
        template.setIsActive("Y");
        template.setIdBillingTemplate(1);
        template.setTargetClassIdentifier(55);
        template.setTargetClassName("hci.gnomex.model.Request");

        BillingTemplateItem item = new BillingTemplateItem(template);
        item.setIdBillingTemplateItem(2);
        item.setIdBillingAccount(7);
        item.setPercentSplit(new BigDecimal("0.5"));

        TreeSet<BillingTemplateItem> items = new TreeSet<>();
        items.add(item);
        template.setItems(items);
        return template;
    }

    private static Document render(BillingTemplate template) {
        return new Document(template.toXML(stubSession(), null, null));
    }

    private static Document parse(Element root) throws Exception {
        String xml = new XMLOutputter().outputString(new Document((Element) root.clone()));
        return new SAXBuilder().build(new StringReader(xml));
    }

    /** A Session whose load(BillingAccount.class, id) returns an in-memory account; nothing else is supported. */
    private static Session stubSession() {
        Lab lab = new Lab() {
            @Override public Integer getIdLab() { return 100; }
            @Override public String getName() { return "Jones, Pat Lab"; }
        };
        BillingAccount account = new BillingAccount() {
            // The real getters consult DB-backed account-field configuration.
            @Override public String getAccountName() { return ACCOUNT_NAME; }
            @Override public String getAccountNumber() { return "1234"; }
            @Override public String getAccountNumberDisplay() { return "1234 - " + ACCOUNT_NAME; }
            @Override public Lab getLab() { return lab; }
        };
        return (Session) Proxy.newProxyInstance(
                Session.class.getClassLoader(),
                new Class<?>[]{Session.class},
                (proxy, method, args) -> {
                    if (method.getName().equals("load") && args.length == 2 && args[0] == BillingAccount.class) {
                        return account;
                    }
                    throw new UnsupportedOperationException("stub Session: " + method);
                });
    }
}
