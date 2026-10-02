package hci.gnomex.controller;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class UploadSampleSheetFileServletTest {

    @Test
    public void sanitizeXmlRemovesInvalidCharacters() {
        assertEquals("AB\tC", UploadSampleSheetFileServlet.sanitizeXml("A\u0000B\u0008\tC\uFFFE"));
    }

    @Test
    public void sanitizeXmlKeepsNonAsciiText() {
        assertEquals("5 \u00B5l caf\u00E9 \uD83E\uDDEC", UploadSampleSheetFileServlet.sanitizeXml("5 \u00B5l caf\u00E9 \uD83E\uDDEC"));
    }

    @Test
    public void sanitizeXmlHandlesNull() {
        assertEquals("", UploadSampleSheetFileServlet.sanitizeXml(null));
    }
}
