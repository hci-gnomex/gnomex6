package hci.gnomex.utility;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class XMLToolsTest {

    @Test
    public void escapesAmpersandAndAngleBrackets() {
        assertEquals("a&lt;b&gt;&amp;c", XMLTools.escapeXMLChars("a<b>&c"));
    }

    @Test
    public void leavesPlainTextAlone() {
        assertEquals("Sample 12 (ng/ul)", XMLTools.escapeXMLChars("Sample 12 (ng/ul)"));
    }

    @Test
    public void escapesQuotes() {
        assertEquals("&quot;x&quot;", XMLTools.escapeXMLChars("\"x\""));
        assertEquals("it&apos;s", XMLTools.escapeXMLChars("it's"));
    }

    @Test
    public void escapesEachCharacterExactlyOnce() {
        // Regression: '&' used to be replaced after the quotes, giving "&amp;quot;".
        assertEquals("O&apos;Brien &amp; &quot;Sons&quot; &lt;Lab&gt;",
                XMLTools.escapeXMLChars("O'Brien & \"Sons\" <Lab>"));
    }

    @Test
    public void safeXMLValueHandlesNullAndNonStrings() {
        assertEquals("", XMLTools.safeXMLValue(null));
        assertEquals("42", XMLTools.safeXMLValue(42));
        assertEquals("&lt;tag&gt;", XMLTools.safeXMLValue("<tag>"));
    }
}
