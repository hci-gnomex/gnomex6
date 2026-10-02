package hci.gnomex.utility;

import org.apache.log4j.Logger;
import org.apache.poi.EncryptedDocumentException;
import org.apache.poi.hssf.OldExcelFormatException;
import org.apache.poi.poifs.filesystem.FileMagic;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.CellValue;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.StringReader;
import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.Charset;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Reads an uploaded sample sheet into rows of cell strings. Supported formats are tab-delimited text
 * (.txt / .tsv), Excel 2007+ workbooks (.xlsx) and Excel 97-2003 workbooks (.xls).
 * <p>
 * For workbooks only the first visible sheet is read, and each cell is returned as the text Excel
 * displays for it (formulas are evaluated). Tab-delimited files are split exactly as before.
 */
public final class SampleSheetReader {

    private static final Logger LOG = Logger.getLogger(SampleSheetReader.class);

    public static final int MAX_ROWS = 10000;
    public static final int MAX_COLUMNS = 500;

    private static final Charset WINDOWS_1252 = Charset.forName("windows-1252");
    private static final char BYTE_ORDER_MARK = '\uFEFF';

    public enum Format { TSV, XLSX, XLS }

    private SampleSheetReader() {
    }

    public static List<List<String>> read(File file, String originalName) throws IOException, SampleSheetException {
        if (file.length() == 0) {
            throw new SampleSheetException("The sample sheet file is empty.");
        }

        if (detectFormat(file, originalName) == Format.TSV) {
            return readDelimited(file);
        }
        return readWorkbook(file);
    }

    /**
     * Detects the format from the file contents. The extension is only used to reject files that
     * claim to be Excel but are not (e.g. an HTML page saved as .xls).
     */
    public static Format detectFormat(File file, String originalName) throws SampleSheetException {
        FileMagic magic;
        try {
            magic = FileMagic.valueOf(file);
        } catch (IOException | RuntimeException e) {
            magic = FileMagic.UNKNOWN;
        }

        switch (magic) {
            case OOXML:
                return Format.XLSX;
            case OLE2:
                return Format.XLS;
            case BIFF2:
            case BIFF3:
            case BIFF4:
                throw new SampleSheetException(oldFormatMessage());
            case HTML:
            case XML:
                if (hasExcelExtension(originalName)) {
                    throw new SampleSheetException("This file has an Excel extension but is actually a web page or XML file. "
                            + "Please open it in Excel and use 'Save As' to save it as an Excel Workbook (.xlsx), then upload it again.");
                }
                return Format.TSV;
            case UNKNOWN:
                if (hasExcelExtension(originalName)) {
                    throw new SampleSheetException("This file has an Excel extension but is not a valid Excel workbook.");
                }
                return Format.TSV;
            default:
                throw new SampleSheetException("Unsupported file type. Please upload a tab-delimited text file (.txt) "
                        + "or an Excel workbook (.xlsx or .xls).");
        }
    }

    private static boolean hasExcelExtension(String name) {
        if (name == null) {
            return false;
        }
        String lower = name.toLowerCase(Locale.ROOT);
        return lower.endsWith(".xlsx") || lower.endsWith(".xls") || lower.endsWith(".xlsm");
    }

    private static String oldFormatMessage() {
        return "This workbook was saved in a very old Excel format that cannot be read. "
                + "Please open it in Excel and save it as an Excel Workbook (.xlsx), then upload it again.";
    }

    /**
     * Splits each line on tabs, as the original upload servlet did. The file is decoded as UTF-8 when it is
     * valid UTF-8 (a byte order mark is removed), otherwise as Windows-1252, which is what Excel writes
     * for "Text (Tab delimited)".
     */
    static List<List<String>> readDelimited(File file) throws IOException {
        String content = decode(Files.readAllBytes(file.toPath()));
        if (!content.isEmpty() && content.charAt(0) == BYTE_ORDER_MARK) {
            content = content.substring(1);
        }

        List<List<String>> rows = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new StringReader(content))) {
            String line;
            while ((line = reader.readLine()) != null) {
                List<String> cells = new ArrayList<>();
                for (String cell : line.split("\t", -1)) {
                    cells.add(cell);
                }
                rows.add(cells);
            }
        }
        return rows;
    }

    private static String decode(byte[] bytes) {
        try {
            return StandardCharsets.UTF_8.newDecoder()
                    .onMalformedInput(CodingErrorAction.REPORT)
                    .onUnmappableCharacter(CodingErrorAction.REPORT)
                    .decode(ByteBuffer.wrap(bytes))
                    .toString();
        } catch (CharacterCodingException e) {
            return new String(bytes, WINDOWS_1252);
        }
    }

    static List<List<String>> readWorkbook(File file) throws IOException, SampleSheetException {
        try (Workbook workbook = WorkbookFactory.create(file, null, true)) {
            Sheet sheet = firstVisibleSheet(workbook);
            if (sheet == null) {
                throw new SampleSheetException("The workbook does not contain a visible sheet.");
            }

            DataFormatter formatter = new DataFormatter(Locale.US);
            FormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();

            List<List<String>> rows = new ArrayList<>();
            int width = 0;
            int firstRowNum = -1;   // Blank rows above the first row with data are dropped.

            for (Row row : sheet) {
                List<String> cells = new ArrayList<>();
                int lastNonBlank = -1;

                for (int c = 0; c < row.getLastCellNum(); c++) {
                    String value = cellText(row.getCell(c), formatter, evaluator);
                    cells.add(value);
                    if (!value.isEmpty()) {
                        lastNonBlank = c;
                    }
                }

                if (lastNonBlank < 0) {
                    continue;   // Blank rows are filled in below only if a later row has data.
                }
                if (firstRowNum < 0) {
                    firstRowNum = row.getRowNum();
                }
                int rowIndex = row.getRowNum() - firstRowNum;
                if (rowIndex >= MAX_ROWS) {
                    throw new SampleSheetException("The sample sheet has more than " + MAX_ROWS + " rows.");
                }
                if (lastNonBlank >= MAX_COLUMNS) {
                    throw new SampleSheetException("The sample sheet has more than " + MAX_COLUMNS + " columns.");
                }

                while (rows.size() < rowIndex) {
                    rows.add(new ArrayList<>());
                }
                rows.add(cells.subList(0, lastNonBlank + 1));
                width = Math.max(width, lastNonBlank + 1);
            }

            if (rows.isEmpty()) {
                throw new SampleSheetException("The first sheet of the workbook (\"" + sheet.getSheetName() + "\") is empty.");
            }

            // Make the grid rectangular so every row has the same columns as the header row.
            List<List<String>> result = new ArrayList<>(rows.size());
            for (List<String> cells : rows) {
                List<String> padded = new ArrayList<>(cells);
                while (padded.size() < width) {
                    padded.add("");
                }
                result.add(padded);
            }
            return result;

        } catch (EncryptedDocumentException e) {
            throw new SampleSheetException("The workbook is password protected. "
                    + "Please remove the password in Excel and upload it again.", e);
        } catch (OldExcelFormatException e) {
            throw new SampleSheetException(oldFormatMessage(), e);
        } catch (IOException | RuntimeException e) {
            LOG.warn("Unable to read sample sheet workbook " + file.getName(), e);
            throw new SampleSheetException("The file could not be read as an Excel workbook. "
                    + "Please make sure it is a valid .xlsx or .xls file (binary .xlsb workbooks are not supported).", e);
        }
    }

    private static Sheet firstVisibleSheet(Workbook workbook) {
        for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
            if (!workbook.isSheetHidden(i) && !workbook.isSheetVeryHidden(i)) {
                return workbook.getSheetAt(i);
            }
        }
        return null;
    }

    /**
     * Returns the text Excel displays for a cell. Error values (#N/A etc.) become blank, and tabs or
     * line breaks inside a cell are replaced with spaces so values match what a tab-delimited export gives.
     */
    static String cellText(Cell cell, DataFormatter formatter, FormulaEvaluator evaluator) {
        if (cell == null) {
            return "";
        }

        String text;
        switch (cell.getCellType()) {
            case FORMULA:
                text = formulaText(cell, formatter, evaluator);
                break;
            case NUMERIC:
                text = numericText(cell, formatter);
                break;
            case ERROR:
                text = "";
                break;
            default:
                text = formatter.formatCellValue(cell);
        }

        return text.replaceAll("[\\t\\r\\n]+", " ").trim();
    }

    private static String formulaText(Cell cell, DataFormatter formatter, FormulaEvaluator evaluator) {
        try {
            CellValue value = evaluator.evaluate(cell);
            if (value == null || value.getCellType() == CellType.ERROR) {
                return "";
            }
            return formatter.formatCellValue(cell, evaluator);
        } catch (RuntimeException e) {
            // Unsupported function or external reference: fall back to the value Excel last calculated.
            switch (cell.getCachedFormulaResultType()) {
                case STRING:
                    return cell.getStringCellValue();
                case NUMERIC:
                    return formatter.formatRawCellContents(cell.getNumericCellValue(),
                            cell.getCellStyle().getDataFormat(), cell.getCellStyle().getDataFormatString());
                case BOOLEAN:
                    return cell.getBooleanCellValue() ? "TRUE" : "FALSE";
                default:
                    return "";
            }
        }
    }

    /**
     * Whole numbers in "General" format are written out in full. Excel (and DataFormatter) would show
     * long numbers such as IDs in scientific notation, e.g. 1.23457E+11.
     */
    private static String numericText(Cell cell, DataFormatter formatter) {
        double value = cell.getNumericCellValue();
        boolean general = cell.getCellStyle() == null || cell.getCellStyle().getDataFormat() == 0;
        if (general && !DateUtil.isCellDateFormatted(cell)
                && value == Math.rint(value) && Math.abs(value) < 1e15) {
            return Long.toString((long) value);
        }
        return formatter.formatCellValue(cell);
    }
}
