package hci.gnomex.utility;

import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.openxml4j.opc.PackageAccess;
import org.apache.poi.poifs.crypt.EncryptionInfo;
import org.apache.poi.poifs.crypt.EncryptionMode;
import org.apache.poi.poifs.crypt.Encryptor;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

public class SampleSheetReaderTest {

    @Rule
    public TemporaryFolder tmp = new TemporaryFolder();

    private static final Object[][] BASIC = {
            {"Sample Name", "Organism", "Conc. (ng/ul)"},
            {"S1", "Human", "12"},
            {"S2", "Mouse", "3.5"},
    };

    // ---------------------------------------------------------------- tab delimited

    @Test
    public void readsTabDelimitedExactlyAsBefore() throws Exception {
        File f = writeText("basic.txt", "Sample Name\tOrganism\tConc. (ng/ul)\r\nS1\tHuman\t12\r\nS2\tMouse\t3.5\r\n", StandardCharsets.UTF_8);
        assertEquals(expected(BASIC), SampleSheetReader.read(f, "basic.txt"));
    }

    @Test
    public void tabDelimitedKeepsEmptyTrailingCells() throws Exception {
        File f = writeText("ragged.txt", "a\tb\t\nc\n", StandardCharsets.UTF_8);
        assertEquals(Arrays.asList(Arrays.asList("a", "b", ""), Arrays.asList("c")), SampleSheetReader.read(f, "ragged.txt"));
    }

    @Test
    public void tabDelimitedStripsUtf8ByteOrderMark() throws Exception {
        File f = writeText("bom.txt", "\uFEFFSample Name\tVolume\nS1\t5 \u00B5l\n", StandardCharsets.UTF_8);
        List<List<String>> rows = SampleSheetReader.read(f, "bom.txt");
        assertEquals("Sample Name", rows.get(0).get(0));
        assertEquals("5 \u00B5l", rows.get(1).get(1));
    }

    @Test
    public void tabDelimitedFallsBackToWindows1252() throws Exception {
        // Excel's "Text (Tab delimited)" is written in the Windows ANSI code page.
        File f = writeText("ansi.txt", "Name\tVolume\nS1\t5 \u00B5l\n", Charset.forName("windows-1252"));
        assertEquals("5 \u00B5l", SampleSheetReader.read(f, "ansi.txt").get(1).get(1));
    }

    // ---------------------------------------------------------------- workbooks

    @Test
    public void xlsxAndXlsGiveSameResultAsText() throws Exception {
        File xlsx = writeWorkbook(new XSSFWorkbook(), "basic.xlsx", BASIC);
        File xls = writeWorkbook(new HSSFWorkbook(), "basic.xls", BASIC);

        assertEquals(SampleSheetReader.Format.XLSX, SampleSheetReader.detectFormat(xlsx, "basic.xlsx"));
        assertEquals(SampleSheetReader.Format.XLS, SampleSheetReader.detectFormat(xls, "basic.xls"));
        assertEquals(expected(BASIC), SampleSheetReader.read(xlsx, "basic.xlsx"));
        assertEquals(expected(BASIC), SampleSheetReader.read(xls, "basic.xls"));
    }

    @Test
    public void numbersAreReadAsDisplayed() throws Exception {
        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Samples");
            Row row = sheet.createRow(0);
            row.createCell(0).setCellValue(12.0);
            row.createCell(1).setCellValue(123456789012.0);
            row.createCell(2).setCellValue(0.25);
            row.createCell(3).setCellValue(1.5);
            row.createCell(4).setCellValue(0.2);

            CellStyle twoDecimals = wb.createCellStyle();
            twoDecimals.setDataFormat(wb.createDataFormat().getFormat("0.00"));
            row.getCell(3).setCellStyle(twoDecimals);

            CellStyle percent = wb.createCellStyle();
            percent.setDataFormat(wb.createDataFormat().getFormat("0%"));
            row.getCell(4).setCellStyle(percent);

            File f = save(wb, "numbers.xlsx");
            assertEquals(Arrays.asList("12", "123456789012", "0.25", "1.50", "20%"), SampleSheetReader.read(f, "numbers.xlsx").get(0));
        }
    }

    @Test
    public void formulasAreEvaluatedAndErrorsAreBlank() throws Exception {
        try (Workbook wb = new XSSFWorkbook()) {
            Row row = wb.createSheet("Samples").createRow(0);
            row.createCell(0).setCellValue("Run1");
            row.createCell(1).setCellValue(7);
            row.createCell(2).setCellFormula("A1&\"_\"&B1");
            row.createCell(3).setCellFormula("1/0");
            row.createCell(4).setCellValue("end");

            File f = save(wb, "formulas.xlsx");
            assertEquals(Arrays.asList("Run1", "7", "Run1_7", "", "end"), SampleSheetReader.read(f, "formulas.xlsx").get(0));
        }
    }

    @Test
    public void sparseSheetIsRectangularAndTrimmed() throws Exception {
        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Samples");
            // Rows 0-1 blank (dropped), header on row 2, blank row 4 (kept), formatted empty rows at the end (dropped).
            sheet.createRow(0);
            Row header = sheet.createRow(2);
            header.createCell(0).setCellValue("Name");
            header.createCell(1).setCellValue("Type");
            header.createCell(2).setCellValue("Notes");
            Row s1 = sheet.createRow(3);
            s1.createCell(0).setCellValue("S1");
            s1.createCell(2).setCellValue("line one\nline two");
            Row s2 = sheet.createRow(5);
            s2.createCell(0).setCellValue("S2");
            s2.createCell(9).setCellValue("");   // formatted but empty column
            sheet.createRow(20).createCell(0).setCellValue("   ");

            File f = save(wb, "sparse.xlsx");
            List<List<String>> rows = SampleSheetReader.read(f, "sparse.xlsx");
            assertEquals(Arrays.asList(
                    Arrays.asList("Name", "Type", "Notes"),
                    Arrays.asList("S1", "", "line one line two"),
                    Arrays.asList("", "", ""),
                    Arrays.asList("S2", "", "")), rows);
        }
    }

    @Test
    public void readsFirstVisibleSheet() throws Exception {
        try (Workbook wb = new XSSFWorkbook()) {
            wb.createSheet("Hidden").createRow(0).createCell(0).setCellValue("wrong");
            wb.createSheet("Visible").createRow(0).createCell(0).setCellValue("right");
            wb.setSheetHidden(0, true);
            wb.setActiveSheet(1);
            wb.setSelectedTab(1);

            File f = save(wb, "hidden.xlsx");
            assertEquals("right", SampleSheetReader.read(f, "hidden.xlsx").get(0).get(0));
        }
    }

    @Test
    public void singleColumnSheet() throws Exception {
        File f = writeWorkbook(new XSSFWorkbook(), "one.xlsx", new Object[][]{{"Sample Name"}, {"S1"}, {"S2"}});
        assertEquals(expected(new Object[][]{{"Sample Name"}, {"S1"}, {"S2"}}), SampleSheetReader.read(f, "one.xlsx"));
    }

    @Test
    public void excelFileWithTextExtensionIsDetectedByContent() throws Exception {
        File xlsx = writeWorkbook(new XSSFWorkbook(), "renamed.txt", BASIC);
        assertEquals(expected(BASIC), SampleSheetReader.read(xlsx, "renamed.txt"));
    }

    // ---------------------------------------------------------------- errors

    @Test
    public void emptyFileIsRejected() throws Exception {
        File f = tmp.newFile("empty.txt");
        assertRejected(f, "empty.txt", "empty");
    }

    @Test
    public void htmlSavedAsXlsIsRejected() throws Exception {
        File f = writeText("report.xls", "<html><body><table><tr><td>S1</td></tr></table></body></html>", StandardCharsets.UTF_8);
        assertRejected(f, "report.xls", "web page");
    }

    @Test
    public void textWithExcelExtensionIsRejected() throws Exception {
        File f = writeText("fake.xlsx", "Sample Name\tOrganism\n", StandardCharsets.UTF_8);
        assertRejected(f, "fake.xlsx", "not a valid Excel workbook");
    }

    @Test
    public void emptyWorkbookIsRejected() throws Exception {
        try (Workbook wb = new XSSFWorkbook()) {
            wb.createSheet("Sheet1");
            assertRejected(save(wb, "blank.xlsx"), "blank.xlsx", "is empty");
        }
    }

    @Test
    public void tooManyRowsIsRejected() throws Exception {
        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Samples");
            sheet.createRow(0).createCell(0).setCellValue("Name");
            sheet.createRow(SampleSheetReader.MAX_ROWS).createCell(0).setCellValue("too far");
            assertRejected(save(wb, "big.xlsx"), "big.xlsx", "rows");
        }
    }

    @Test
    public void passwordProtectedWorkbookIsRejected() throws Exception {
        File plain = writeWorkbook(new XSSFWorkbook(), "plain.xlsx", BASIC);
        File encrypted = new File(tmp.getRoot(), "protected.xlsx");

        try (POIFSFileSystem fs = new POIFSFileSystem()) {
            EncryptionInfo info = new EncryptionInfo(EncryptionMode.agile);
            Encryptor encryptor = info.getEncryptor();
            encryptor.confirmPassword("secret");
            try (OPCPackage opc = OPCPackage.open(plain, PackageAccess.READ_WRITE);
                 OutputStream os = encryptor.getDataStream(fs)) {
                opc.save(os);
            }
            try (FileOutputStream out = new FileOutputStream(encrypted)) {
                fs.writeFilesystem(out);
            }
        }

        assertRejected(encrypted, "protected.xlsx", "password");
    }

    // ---------------------------------------------------------------- helpers

    private void assertRejected(File f, String name, String messageFragment) throws IOException {
        try {
            SampleSheetReader.read(f, name);
            fail("Expected SampleSheetException");
        } catch (SampleSheetException e) {
            assertTrue("Unexpected message: " + e.getMessage(), e.getMessage().contains(messageFragment));
        }
    }

    private File writeText(String name, String content, Charset charset) throws IOException {
        File f = new File(tmp.getRoot(), name);
        Files.write(f.toPath(), content.getBytes(charset));
        return f;
    }

    private File writeWorkbook(Workbook wb, String name, Object[][] data) throws IOException {
        try {
            Sheet sheet = wb.createSheet("Samples");
            for (int r = 0; r < data.length; r++) {
                Row row = sheet.createRow(r);
                for (int c = 0; c < data[r].length; c++) {
                    Object value = data[r][c];
                    if (value instanceof Number) {
                        row.createCell(c).setCellValue(((Number) value).doubleValue());
                    } else {
                        row.createCell(c).setCellValue(String.valueOf(value));
                    }
                }
            }
            return save(wb, name);
        } finally {
            wb.close();
        }
    }

    private File save(Workbook wb, String name) throws IOException {
        File f = new File(tmp.getRoot(), name);
        try (FileOutputStream out = new FileOutputStream(f)) {
            wb.write(out);
        }
        return f;
    }

    private static List<List<String>> expected(Object[][] data) {
        List<List<String>> rows = new java.util.ArrayList<>();
        for (Object[] row : data) {
            List<String> cells = new java.util.ArrayList<>();
            for (Object value : row) {
                cells.add(String.valueOf(value));
            }
            rows.add(cells);
        }
        return rows;
    }
}
