package hci.gnomex.utility;

import org.junit.Test;

import java.sql.Date;
import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class DataTrackUtilTest {

    @Test
    public void stripBadURLCharsKeepsSafeCharacters() {
        assertEquals("my_track.v2/file.bam", DataTrackUtil.stripBadURLChars("my_track.v2/file.bam", "_"));
        assertEquals("my_track__1_", DataTrackUtil.stripBadURLChars("my track (1)", "_"));
        assertEquals("abc", DataTrackUtil.stripBadURLChars("a-b c", ""));
    }

    @Test
    public void recognisesDataTrackFileTypesCaseInsensitively() {
        assertTrue(DataTrackUtil.isValidDataTrackFileType("reads.bam"));
        assertTrue(DataTrackUtil.isValidDataTrackFileType("reads.bam.bai"));
        assertTrue(DataTrackUtil.isValidDataTrackFileType("READS.BAM"));
        assertTrue(DataTrackUtil.isValidDataTrackFileType("calls.vcf.gz"));
        assertTrue(DataTrackUtil.isValidDataTrackFileType("peaks.narrowPeak"));
        assertFalse(DataTrackUtil.isValidDataTrackFileType("reads.fastq.gz"));
        assertFalse(DataTrackUtil.isValidDataTrackFileType("notes.txt"));
    }

    @Test
    public void recognisesSequenceFileTypes() {
        assertTrue(DataTrackUtil.isValidSequenceFileType("chr1.fasta"));
        assertTrue(DataTrackUtil.isValidSequenceFileType("chr1.BNIB"));
        assertFalse(DataTrackUtil.isValidSequenceFileType("chr1.fa"));
    }

    @Test
    public void dateRoundTripsThroughMmDdYyyy() throws Exception {
        Date d = DataTrackUtil.parseDate("03/07/2024");
        assertEquals("03/07/2024", DataTrackUtil.formatDate(d));
    }

    @Test
    public void getKilobytesRoundsAndNeverReturnsZero() {
        assertEquals(1, DataTrackUtil.getKilobytes(0));
        assertEquals(1, DataTrackUtil.getKilobytes(100));
        assertEquals(1, DataTrackUtil.getKilobytes(1024));
        assertEquals(2, DataTrackUtil.getKilobytes(1536));
        assertEquals(1024, DataTrackUtil.getKilobytes(1024 * 1024));
    }

    @Test
    public void escapeHTMLEscapesMarkupAndSwapsDoubleQuotes() {
        assertEquals("a &lt;b&gt; &amp; 'c'", DataTrackUtil.escapeHTML("a <b> & \"c\""));
        assertEquals(null, DataTrackUtil.escapeHTML(null));
    }

    @Test
    public void removeHTMLTagsReplacesTagsWithSpaces() {
        assertEquals(" bold  text", DataTrackUtil.removeHTMLTags("<b>bold</b> text"));
        assertEquals(null, DataTrackUtil.removeHTMLTags(null));
    }

    @Test
    public void createRandomWordsUsesOnlyTheGivenAlphabet() {
        String[] alphabet = {"A", "B", "C"};
        List<String> letters = Arrays.asList(alphabet);
        String[] words = DataTrackUtil.createRandomWords(alphabet, 6, 5);

        assertEquals(5, words.length);
        for (String w : words) {
            assertEquals(6, w.length());
            for (char c : w.toCharArray()) {
                assertTrue("unexpected char " + c, letters.contains(String.valueOf(c)));
            }
        }
    }
}
