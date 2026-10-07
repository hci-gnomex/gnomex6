package hci.gnomex.utility;

import org.junit.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

public class UtilTest {

    // ---------------------------------------------------------------- parseCommaDelimited

    @Test
    public void parseCommaDelimitedSplitsOnCommas() {
        assertArrayEquals(new String[]{"a", "b", "c"}, Util.parseCommaDelimited("a,b,c"));
    }

    @Test
    public void parseCommaDelimitedIgnoresCommasInsideQuotes() {
        assertArrayEquals(new String[]{"a", "\"b,c\"", "d"}, Util.parseCommaDelimited("a,\"b,c\",d"));
    }

    @Test
    public void parseCommaDelimitedReturnsEmptyArrayForNull() {
        assertEquals(0, Util.parseCommaDelimited(null).length);
    }

    // ---------------------------------------------------------------- compareRequestNumbers

    @Test
    public void compareRequestNumbersComparesNumericallyNotLexically() {
        assertTrue(Util.compareRequestNumbers("12R", "9R") > 0);
        assertTrue(Util.compareRequestNumbers("9R", "12R") < 0);
        assertEquals(0, Util.compareRequestNumbers("12R", "12R"));
        assertEquals(0, Util.compareRequestNumbers("12R", "12R1"));  // revision suffix ignored
    }

    @Test
    public void compareRequestNumbersOrdersByLetterPrefixFirst() {
        assertTrue(Util.compareRequestNumbers("A5R", "B1R") < 0);
        assertTrue(Util.compareRequestNumbers("A10R", "A9R") > 0);
        assertTrue(Util.compareRequestNumbers("5R", "A1R") < 0);  // no prefix sorts before any letter
    }

    // ---------------------------------------------------------------- URL / string helpers

    @Test
    public void addURLParameterPicksTheRightSeparator() {
        assertEquals("x?b=2", Util.addURLParameter("x", "b=2"));
        assertEquals("x?a=1&b=2", Util.addURLParameter("x?a=1", "b=2"));
        assertEquals("x?a=1&b=2", Util.addURLParameter("x?a=1", "?b=2"));
        assertEquals("x?b=2", Util.addURLParameter("x", "&b=2"));
    }

    @Test
    public void encodeNameEscapesPlusSigns() {
        assertEquals("a%2Bb%2Bc", Util.encodeName("a+b+c"));
        assertEquals("abc", Util.encodeName("abc"));
        assertNull(Util.encodeName(null));
    }

    @Test
    public void keysToArrayPreservesMapIterationOrder() {
        Map<String, Integer> map = new LinkedHashMap<>();
        map.put("x", 1);
        map.put("y", 2);
        assertArrayEquals(new String[]{"x", "y"}, Util.keysToArray(map));
    }

    // ---------------------------------------------------------------- listToString

    private static final List<String> ABC = Arrays.asList("a", "b", "c");

    @Test
    public void listToStringDefaultsToComma() {
        assertEquals("a,b,c", Util.listToString(ABC));
        assertEquals("", Util.listToString(Collections.emptyList()));
    }

    @Test
    public void listToStringSupportsDelimiterPrefixAndPostfix() {
        assertEquals("a; b; c", Util.listToString(ABC, "; "));
        assertEquals("'a','b','c'", Util.listToString(ABC, "'", "'"));
        assertEquals("[a] [b] [c]", Util.listToString(ABC, " ", "[", "]"));
    }

    @Test
    public void listToStringHonoursMaxItems() {
        assertEquals("a,b", Util.listToString(ABC, 2));
        assertEquals("a,b,c", Util.listToString(ABC, 0));   // <= 0 means no limit
        assertEquals("a,b,c", Util.listToString(ABC, 10));
        assertEquals("a|b", Util.listToString(ABC, "|", 2));
    }

    // ---------------------------------------------------------------- request parameter flags

    @Test
    public void isParameterTrueAcceptsYAndTrue() {
        assertTrue(Util.isParameterTrue("Y"));
        assertTrue(Util.isParameterTrue("y"));
        assertTrue(Util.isParameterTrue("TRUE"));
        assertFalse(Util.isParameterTrue("N"));
        assertFalse(Util.isParameterTrue("yes"));
    }

    @Test
    public void isParameterFalseAcceptsNAndFalse() {
        assertTrue(Util.isParameterFalse("n"));
        assertTrue(Util.isParameterFalse("False"));
        assertFalse(Util.isParameterFalse("Y"));
        assertFalse(Util.isParameterFalse(""));
    }

    @Test
    public void isParameterNonEmptyIsNullSafe() {
        assertFalse(Util.isParameterNonEmpty(null));
        assertFalse(Util.isParameterNonEmpty("   "));
        assertTrue(Util.isParameterNonEmpty(" x "));
    }

    // ---------------------------------------------------------------- genome builds

    @Test
    public void getGRCNameFindsTheGrcAlias() {
        assertEquals("GRCh38", Util.getGRCName("hg38;GRCh38"));
        assertEquals("GRCm39", Util.getGRCName(" GRCm39 ; mm39"));
        assertNull(Util.getGRCName("hg19"));
        assertNull(Util.getGRCName(""));
        assertNull(Util.getGRCName(null));
    }
}
