package hci.gnomex.controller;

import com.oreilly.servlet.multipart.FilePart;
import com.oreilly.servlet.multipart.MultipartParser;
import com.oreilly.servlet.multipart.ParamPart;
import com.oreilly.servlet.multipart.Part;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.PropertyDictionaryHelper;
import hci.gnomex.utility.SampleSheetException;
import hci.gnomex.utility.SampleSheetReader;
import hci.gnomex.utility.ServletUtil;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.json.Json;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.util.List;
import java.util.Locale;

/**
 * Receives a sample sheet (tab-delimited .txt, or Excel .xlsx / .xls) and returns its contents as
 * { ColumnSelector: ..., SampleSheetData: [ { Name, Column: [ { Name, Value } ] } ] }.
 */
public class UploadSampleSheetFileServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private static final int ERROR_MISSING_TEMP_DIRECTORY_PROPERTY = 900;
    private static final int ERROR_INVALID_TEMP_DIRECTORY = 901;
    private static final int ERROR_SECURITY_EXCEPTION = 902;
    private static final int ERROR_UPLOAD_MISC = 903;
    private static final Logger LOG = Logger.getLogger(UploadSampleSheetFileServlet.class);

    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
    }

    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        // Restrict commands to local host if request is not secure
        if (!ServletUtil.checkSecureRequest(req)) {
            ServletUtil.reportServletError(res, "Secure connection is required. Prefix your request with 'https'");
            return;
        }

        String fileName = null;
        File uploadedFile = null;

        try {
            Session sess = HibernateSession.currentReadOnlySession((req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest"));

            // Get security advisor
            SecurityAdvisor secAdvisor = (SecurityAdvisor) req.getSession().getAttribute(SecurityAdvisor.SECURITY_ADVISOR_SESSION_KEY);
            if (secAdvisor == null) {
                System.out.println("UploadSampleSheetFileServlet:  Warning - unable to find existing session. Creating security advisor.");
                secAdvisor = SecurityAdvisor.create(sess, (req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest"));
            }

            if (secAdvisor == null) {
                System.out.println("UploadSampleSheetFileServlet: Error - Unable to find or create security advisor.");
                res.setStatus(ERROR_SECURITY_EXCEPTION);
                throw new ServletException("Unable to upload sample sheet file.  Servlet unable to obtain security information. Please contact GNomEx support.");
            }

            String className = "SampleSheet";
            Document doc = new Document(new Element(className));

            MultipartParser mp = new MultipartParser(req, Integer.MAX_VALUE);
            Part part;

            String directoryName = PropertyDictionaryHelper.getInstance(sess).getQualifiedProperty(
                    PropertyDictionary.TEMP_DIRECTORY, req.getServerName());
            if (directoryName == null || directoryName.equals("")) {
                res.setStatus(UploadSampleSheetFileServlet.ERROR_MISSING_TEMP_DIRECTORY_PROPERTY);
                throw new ServletException(
                        "Unable to upload sample sheet. Missing GNomEx property for temp_directory.  Please add using 'Manage Dictionaries'.");
            }
            if (!directoryName.endsWith(Constants.FILE_SEPARATOR) && !directoryName.endsWith("\\")) {
                directoryName += Constants.FILE_SEPARATOR;
            }

            File dir = new File(directoryName);
            if (!dir.exists()) {
                if (!dir.mkdir()) {
                    res.setStatus(UploadSampleSheetFileServlet.ERROR_INVALID_TEMP_DIRECTORY);
                    throw new ServletException("Unable to upload sample sheet.  Cannot create temp directory "
                            + directoryName);
                }
            }
            if (!dir.canRead()) {
                res.setStatus(UploadSampleSheetFileServlet.ERROR_INVALID_TEMP_DIRECTORY);
                throw new ServletException("Unable to upload sample sheet.  Cannot read temp directory " + directoryName);
            }
            if (!dir.canWrite()) {
                res.setStatus(UploadSampleSheetFileServlet.ERROR_INVALID_TEMP_DIRECTORY);
                throw new ServletException("Unable to upload sample sheet.  Cannot write to temp directory "
                        + directoryName);
            }

            boolean hasColumnNames = false;
            while ((part = mp.readNextPart()) != null) {
                String name = part.getName();
                if (part.isParam()) {
                    // it's a parameter part
                    ParamPart paramPart = (ParamPart) part;
                    String value = paramPart.getStringValue();
                    if (name.equals("hasColumnNames")) {
                        String hasColumnNamesValue = value;
                        if (hasColumnNamesValue != null && hasColumnNamesValue.compareTo("1") == 0) {
                            hasColumnNames = true;
                        }

                    }
                }
                if (part.isFile()) {
                    // it's a file part
                    FilePart filePart = (FilePart) part;
                    fileName = filePart.getFileName();
                    if (fileName != null) {
                        // Save under a unique name so concurrent uploads of the same file name don't collide.
                        if (uploadedFile != null) {
                            uploadedFile.delete();
                        }
                        uploadedFile = File.createTempFile("samplesheet_", tempFileSuffix(fileName), dir);
                        try (OutputStream os = new FileOutputStream(uploadedFile)) {
                            filePart.writeTo(os);
                        }
                    }
                }
            }

            if (uploadedFile != null) {
                Element columnSelector = new Element("ColumnSelector");
                // Add a blank column selector
                Element columnSelectorItem = new Element("ColumnSelectorItem");

                // Add a blank entry for the default
                columnSelectorItem.setAttribute("label", "Click here to select column");
                columnSelectorItem.setAttribute("data", "0");
                columnSelector.addContent(columnSelectorItem);

                Element sampleSheetList = new Element("SampleSheetData");
                Element currentRow;
                int rowNum = 1;

                List<List<String>> rows = SampleSheetReader.read(uploadedFile, fileName);
                for (List<String> cells : rows) {
                    currentRow = new Element("Row");
                    currentRow.setAttribute("Name", "" + rowNum);
                    sampleSheetList.addContent(currentRow);
                    for (int i = 0; i < cells.size(); i++) {
                        String thisEntry = sanitizeXml(cells.get(i));
                        int colNum = i + 1;
                        if (rowNum == 1) {
                            columnSelectorItem = new Element("ColumnSelectorItem");
                            // If on first row build the column selector
                            if (hasColumnNames) {
                                columnSelectorItem.setAttribute("label", thisEntry);
                            } else {
                                columnSelectorItem.setAttribute("label", "Column " + colNum);
                            }
                            columnSelectorItem.setAttribute("data", "" + colNum);
                            columnSelector.addContent(columnSelectorItem);
                        }
                        Element currentCol = new Element("Column");
                        currentCol.setAttribute("Name", "" + colNum);
                        currentCol.setAttribute("Value", thisEntry);
                        currentRow.addContent(currentCol);
                    }
                    rowNum++;
                }
                doc.getRootElement().addContent(columnSelector);
                doc.getRootElement().addContent(sampleSheetList);
            }

            XMLOutputter xmlOut = new XMLOutputter();
            String xmlResult = xmlOut.outputString(doc);
            String jsonResult = Util.xmlToJson(xmlResult);
            writeJsonResponse(res, jsonResult);

        } catch (SampleSheetException e) {
            // A problem with the file itself. The client shows result/message in an error dialog.
            LOG.info("UploadSampleSheetFileServlet: unable to read sample sheet " + fileName + " - " + e.getMessage());
            writeJsonResponse(res, errorJson(e.getMessage()));
        } catch (ServletException e) {

            throw new ServletException(e.getMessage());
        } catch (org.jdom.IllegalDataException e) {
            writeJsonResponse(res, errorJson("The sample sheet contains characters that cannot be read."));
        } catch (Exception e) {
            LOG.error("An error has occurred in UploadSampleSheetFileServlet - " + e.toString(), e);
            res.setStatus(ERROR_UPLOAD_MISC);

            throw new ServletException("Unable to upload file " + fileName + " due to a server error.\n\n" + e.toString()
                    + "\n\nPlease contact GNomEx support.");
        } finally {
            // Delete the file when finished
            if (uploadedFile != null && uploadedFile.exists() && !uploadedFile.delete()) {
                LOG.warn("UploadSampleSheetFileServlet: unable to delete temp file " + uploadedFile.getAbsolutePath());
            }
            try {
                HibernateSession.closeSession();
            } catch (Exception e1) {
                LOG.error("An error has occurred in UploadSampleSheetFileServlet - " + e1.toString(), e1);
            }
        }

    }

    private static void writeJsonResponse(HttpServletResponse res, String json) throws IOException {
        // Content type must be set before getWriter() or the response is not encoded as UTF-8.
        res.setHeader("Cache-Control", "cache, must-revalidate, proxy-revalidate, s-maxage=0, max-age=0");
        res.setHeader("Pragma", "public");
        res.setDateHeader("Expires", 0);
        res.setContentType("application/json; charset=UTF-8");
        res.setCharacterEncoding("UTF-8");

        PrintWriter responseOut = res.getWriter();
        responseOut.println(json);
    }

    private static String errorJson(String message) {
        return Json.createObjectBuilder()
                .add("result", "ERROR")
                .add("message", message)
                .build()
                .toString();
    }

    private static String tempFileSuffix(String fileName) {
        String lower = fileName.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".xlsx")) {
            return ".xlsx";
        } else if (lower.endsWith(".xls")) {
            return ".xls";
        }
        return ".txt";
    }

    /** Removes characters that are not allowed in XML 1.0 (JDOM rejects them). */
    static String sanitizeXml(String value) {
        if (value == null) {
            return "";
        }
        StringBuilder sb = new StringBuilder(value.length());
        value.codePoints().forEach(cp -> {
            if (cp == 0x9 || cp == 0xA || cp == 0xD
                    || (cp >= 0x20 && cp <= 0xD7FF)
                    || (cp >= 0xE000 && cp <= 0xFFFD)
                    || (cp >= 0x10000 && cp <= 0x10FFFF)) {
                sb.appendCodePoint(cp);
            }
        });
        return sb.toString();
    }
}
