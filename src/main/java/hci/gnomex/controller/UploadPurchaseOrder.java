package hci.gnomex.controller;

import com.oreilly.servlet.multipart.FilePart;
import com.oreilly.servlet.multipart.MultipartParser;
import com.oreilly.servlet.multipart.ParamPart;
import com.oreilly.servlet.multipart.Part;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.BillingAccount;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.PropertyDictionaryHelper;
import hci.gnomex.utility.ServletUtil;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonWriter;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

public class UploadPurchaseOrder extends HttpServlet {

    private static final int ERROR_MISSING_TEMP_DIRECTORY_PROPERTY = 900;
    private static final int ERROR_INVALID_TEMP_DIRECTORY = 901;
    private static Logger LOG = Logger.getLogger(UploadPurchaseOrder.class);

    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
    }

    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        // Restrict commands to local host if request is not secure
        if (!ServletUtil.checkSecureRequest(req)) {
            ServletUtil.reportServletError(res, "Secure connection is required. Prefix your request with 'https'");
            return;
        }

        try {
            Session sess = HibernateSession.currentSession((req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest"));

            res.setContentType("text/html; charset=UTF-8");
            MultipartParser mp = new MultipartParser(req, Integer.MAX_VALUE);
            FileInputStream fileStream;
            byte[] blob = new byte[1024];
            Part part;
            String fileType = null;
            Integer idBillingAccount = null;
            File file = null;

            String directoryName = PropertyDictionaryHelper.getInstance(sess).getQualifiedProperty(
                    PropertyDictionary.TEMP_DIRECTORY, req.getServerName());
            if (directoryName == null || directoryName.equals("")) {
                res.setStatus(UploadPurchaseOrder.ERROR_MISSING_TEMP_DIRECTORY_PROPERTY);
                throw new ServletException(
                        "Unable to upload sample sheet. Missing GNomEx property for temp_directory.  Please add using 'Manage Dictionaries'.");
            }
            if (!directoryName.endsWith(Constants.FILE_SEPARATOR) && !directoryName.endsWith("\\")) {
                directoryName += Constants.FILE_SEPARATOR;
            }

            File dir = new File(directoryName);
            if (!dir.exists()) {
                if (!dir.mkdir()) {
                    res.setStatus(UploadPurchaseOrder.ERROR_INVALID_TEMP_DIRECTORY);
                    throw new ServletException("Unable to upload sample sheet.  Cannot create temp directory " + directoryName);
                }
            }
            if (!dir.canRead()) {
                res.setStatus(UploadPurchaseOrder.ERROR_INVALID_TEMP_DIRECTORY);
                throw new ServletException("Unable to upload sample sheet.  Cannot read temp directory " + directoryName);
            }
            if (!dir.canWrite()) {
                res.setStatus(UploadPurchaseOrder.ERROR_INVALID_TEMP_DIRECTORY);
                throw new ServletException("Unable to upload sample sheet.  Cannot write to temp directory " + directoryName);
            }

            while ((part = mp.readNextPart()) != null) {
                String name = part.getName();
                if (part.isParam()) {
                    // it's a parameter part
                    ParamPart paramPart = (ParamPart) part;
                    String value = paramPart.getStringValue();
                    if (name.equals("idBillingAccount")) {
                        idBillingAccount = Integer.valueOf(value);
                    }
                } else if (part.isFile()) {
                    FilePart filePart = (FilePart) part;
                    String fileName = filePart.getFileName();
                    fileType = fileName.substring(fileName.lastIndexOf("."));

                    if (fileName != null) {
                        file = new File(directoryName + fileName);
                        filePart.writeTo(file);
                        fileStream = new FileInputStream(file);
                        blob = new byte[(int) file.length()];
                        fileStream.read(blob);
                        fileStream.close();
                    }
                }
            }
            BillingAccount ba = sess.load(BillingAccount.class, idBillingAccount);
            ba.setPurchaseOrderForm(blob);
            ba.setOrderFormFileType(fileType.toLowerCase());
            ba.setOrderFormFileSize(file.length());
            sess.update(ba);
            sess.flush();
            // Delete the file now that we are finished
            file.delete();

            JsonObject value = Json.createObjectBuilder()
                                   .add("result", "SUCCESS")
                                   .build();
            res.setContentType("application/json; charset=UTF-8");
            JsonWriter jsonWriter = Json.createWriter(res.getOutputStream());
            jsonWriter.writeObject(value);
            jsonWriter.close();

        } catch (Exception e) {
            HibernateSession.rollback();
            LOG.error("Unexpected error in UploadPurchaseOrder", e);
            throw new ServletException("Unable to upload purchase order file.  Please contact gnomex support.");
        } finally {
            try {
                HibernateSession.closeSession();
            } catch (Exception e) {
                LOG.error("Unable to close hibernate session in UploadPurcahseOrder", e);
            }
        }
    }

}
