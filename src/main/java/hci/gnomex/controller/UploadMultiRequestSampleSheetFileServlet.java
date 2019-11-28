package hci.gnomex.controller;

import hci.gnomex.constants.Constants;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.*;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;

import javax.json.Json;
import javax.json.JsonObject;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.hibernate.Session;

import com.oreilly.servlet.multipart.FilePart;
import com.oreilly.servlet.multipart.MultipartParser;
import com.oreilly.servlet.multipart.ParamPart;
import com.oreilly.servlet.multipart.Part;

public class UploadMultiRequestSampleSheetFileServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    // the static field for logging in Log4J
    private static Logger LOG = Logger.getLogger(UploadMultiRequestSampleSheetFileServlet.class);

    private static final int ERROR_MISSING_TEMP_DIRECTORY_PROPERTY = 900;
    private static final int ERROR_INVALID_TEMP_DIRECTORY = 901;
    private static final int ERROR_SECURITY_EXCEPTION = 902;
    private static final int ERROR_UPLOAD_MISC = 903;

    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
    }

    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        // Restrict commands to local host if request is not secure
        if (!ServletUtil.checkSecureRequest(req)) {
            ServletUtil.reportServletError(res, "Secure connection is required. Prefix your request with 'https'");
            return;
        }

        String directoryName = "";
        String fileName = null;

        try {
            Session sess = HibernateSession.currentReadOnlySession((req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest"));

            // Get security advisor
            SecurityAdvisor secAdvisor = (SecurityAdvisor) req.getSession().getAttribute(SecurityAdvisor.SECURITY_ADVISOR_SESSION_KEY);
            if (secAdvisor == null) {
                System.out.println("UploadSampleSheetFileServlet:  Warning - unable to find existing session. Creating security advisor.");
                secAdvisor = SecurityAdvisor.create(sess, (req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest"));
            }

            if (secAdvisor == null) {
                System.out.println("UploadMultiRequestSampleSheetFileServlet: Error - Unable to find or create security advisor.");
                res.setStatus(ERROR_SECURITY_EXCEPTION);
                LOG.error("UploadMultiRequestSampleSheetFileServlet: Unable to upload sample sheet file.  Servlet unable to obtain security information. Please contact GNomEx support.");
                throw new ServletException("Unable to upload sample sheet file.  Servlet unable to obtain security information. Please contact GNomEx support.");
            }

            // Only admins can import multiple requests
            if (!secAdvisor.hasPermission(SecurityAdvisor.CAN_WRITE_ANY_OBJECT)) {
                LOG.error("UploadMultiRequestSampleSheetFileServlet: Only admins can import multi-request spread sheets.");
                throw new ServletException("Only admins can import multi-request spread sheets");
            }

            PrintWriter out = res.getWriter();
            res.setHeader("Cache-Control", "max-age=0, must-revalidate");

            MultipartParser mp = new MultipartParser(req, Integer.MAX_VALUE);
            Part part;

            directoryName = PropertyDictionaryHelper.getInstance(sess).getQualifiedProperty(PropertyDictionary.TEMP_DIRECTORY, req.getServerName());
            if (directoryName == null || directoryName.equals("")) {
                res.setStatus(UploadMultiRequestSampleSheetFileServlet.ERROR_MISSING_TEMP_DIRECTORY_PROPERTY);
                LOG.error("UploadMultiRequestSampleSheetFileServlet: Unable to upload sample sheet. Missing GNomEx property for temp_directory.  Please add using 'Manage Dictionaries'.");
                throw new ServletException("Unable to upload sample sheet. Missing GNomEx property for temp_directory.  Please add using 'Manage Dictionaries'.");
            }
            if (!directoryName.endsWith(Constants.FILE_SEPARATOR) && !directoryName.endsWith("\\")) {
                directoryName += Constants.FILE_SEPARATOR;
            }

            File dir = new File(directoryName);
            if (!dir.exists()) {
                if (!dir.mkdir()) {
                    res.setStatus(UploadMultiRequestSampleSheetFileServlet.ERROR_INVALID_TEMP_DIRECTORY);
                    LOG.error("UploadMultiRequestSampleSheetFileServlet:Unable to upload sample sheet.  Cannot create temp directory " + directoryName);
                    throw new ServletException("Unable to upload sample sheet.  Cannot create temp directory " + directoryName);
                }
            }
            if (!dir.canRead()) {
                res.setStatus(UploadMultiRequestSampleSheetFileServlet.ERROR_INVALID_TEMP_DIRECTORY);
                LOG.error("UploadMultiRequestSampleSheetFileServlet:Unable to upload sample sheet.  Cannot read temp directory "
                        + directoryName);
                throw new ServletException("Unable to upload sample sheet.  Cannot read temp directory " + directoryName);
            }
            if (!dir.canWrite()) {
                res.setStatus(UploadMultiRequestSampleSheetFileServlet.ERROR_INVALID_TEMP_DIRECTORY);
                LOG.error("UploadMultiRequestSampleSheetFileServlet:Unable to upload sample sheet.  Cannot write to temp directory " + directoryName);
                throw new ServletException("Unable to upload sample sheet.  Cannot write to temp directory " + directoryName);
            }

            boolean fileWasWritten = false;
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
                        // the part actually contained a file
                        filePart.writeTo(new File(directoryName));
                        fileWasWritten = true;
                    } else {
                    }
                    out.flush();
                }
            }

            JsonObject result = Json.createObjectBuilder().add("FilleNotWritten", true).build();

            if (fileWasWritten) {
                MultiRequestSampleSheetFileParser parser = new MultiRequestSampleSheetFileParser(directoryName + fileName,
                        secAdvisor);
                parser.parse(sess);
                result = parser.toJSONObject();
            }

            PrintWriter responseOut = res.getWriter();
            res.setHeader("Cache-Control", "cache, must-revalidate, proxy-revalidate, s-maxage=0, max-age=0");
            res.setHeader("Pragma", "public");
            res.setDateHeader("Expires", 0);
            res.setContentType("application/json; charset=UTF-8");

            responseOut.println(result.toString());

        } catch (ServletException e) {
            unexpectedError(e, res);
            LOG.error("Error in UploadMultiRequestSampleSheetFileServlet: ", e);
        } catch (org.jdom.IllegalDataException e) {
            unexpectedError(e, res);
        } catch (Exception e) {
            res.setStatus(ERROR_UPLOAD_MISC);
            unexpectedError(e, res);
            LOG.error("Error in UploadMultiRequestSampleSheetFileServlet: ", e);
            throw new ServletException("Unable to upload file " + fileName + " due to a server error.\n\n" + e.toString()
                    + "\n\nPlease contact GNomEx support.");
        } finally {
            try {
                HibernateSession.closeSession();
            } catch (Exception e1) {
                LOG.error("UploadSampleSheetFileServlet warning - cannot close hibernate session", e1);
            }

            // Delete the file when finished
            File f = new File(directoryName + fileName);
            f.delete();
        }
    }

    private void unexpectedError(Exception e, HttpServletResponse res) {
        try {
            LOG.error("Error in UploadMultiRequestSampleSheetFileServlet: ", e);
            PrintWriter responseOut = res.getWriter();
            res.setHeader("Cache-Control", "cache, must-revalidate, proxy-revalidate, s-maxage=0, max-age=0");
            res.setHeader("Pragma", "public");
            res.setDateHeader("Expires", 0);
            res.setContentType("application/xml; charset=UTF-8");
            responseOut.println("<ERROR message=\"Illegal data\"/>");
        } catch (IOException ioe) {
            LOG.error("UploadMultiRequestSampleSheetParser unable to build response:", ioe);
        }
    }
}
