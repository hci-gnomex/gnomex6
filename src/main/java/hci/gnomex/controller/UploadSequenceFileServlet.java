package hci.gnomex.controller;

import com.oreilly.servlet.multipart.FilePart;
import com.oreilly.servlet.multipart.MultipartParser;
import com.oreilly.servlet.multipart.ParamPart;
import com.oreilly.servlet.multipart.Part;
import hci.gnomex.model.GenomeBuild;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.DataTrackUtil;
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
import java.io.IOException;

public class UploadSequenceFileServlet extends HttpServlet {
    private static Logger LOG = Logger.getLogger(UploadSampleSheetURLServlet.class);

    private static String serverName;

    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
    }

    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        // Restrict commands to local host if request is not secure
        if (!ServletUtil.checkSecureRequest(req)) {
            ServletUtil.reportServletError(res, "Secure connection is required. Prefix your request with 'https'");
            return;
        }

        Session sess = null;

        serverName = req.getServerName();

        Integer idGenomeBuild = null;
        GenomeBuild genomeBuild = null;
        String fileName;

        try {
            sess = HibernateSession.currentSession((req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest"));

            String baseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null, PropertyDictionaryHelper.PROPERTY_DATATRACK_DIRECTORY);

            // Get security advisor
            SecurityAdvisor secAdvisor = (SecurityAdvisor) req.getSession().getAttribute(SecurityAdvisor.SECURITY_ADVISOR_SESSION_KEY);
            if (secAdvisor == null) {
                System.out.println("UploadSequenceFileServlet:  Warning - unable to find existing session. Creating security advisor.");
                secAdvisor = SecurityAdvisor.create(sess, (req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest"));
            }

            if (secAdvisor == null) {
                System.out.println("UploadSequenceFileServlet: Error - Unable to find or create security advisor.");
                throw new ServletException("Unable to upload analysis file.  Servlet unable to obtain security information. Please contact GNomEx support.");
            }

            if (secAdvisor.getIsGuest().equals("Y")) {
                throw new Exception("Insufficient permissions to upload data.");
            }

            res.setDateHeader("Expires", -1);
            res.setDateHeader("Last-Modified", System.currentTimeMillis());
            res.setHeader("Pragma", "");
            res.setHeader("Cache-Control", "");

            MultipartParser mp = new MultipartParser(req, Integer.MAX_VALUE);
            Part part;
            while ((part = mp.readNextPart()) != null) {
                String name = part.getName();
                if (part.isParam()) {
                    // it's a parameter part
                    ParamPart paramPart = (ParamPart) part;
                    String value = paramPart.getStringValue();
                    if (name.equals("idGenomeBuild")) {
                        idGenomeBuild = Integer.valueOf(value);
                    }
                }

                if (idGenomeBuild != null) {
                    break;
                }

            }

            if (idGenomeBuild != null) {
                genomeBuild = sess.get(GenomeBuild.class, idGenomeBuild);
            }
            if (genomeBuild != null) {
                if (secAdvisor.hasPermission(SecurityAdvisor.CAN_WRITE_DICTIONARIES)) {

                    // Make sure that the data root dir exists
                    if (!new File(baseDir).exists()) {
                        boolean success = (new File(baseDir)).mkdir();
                        if (!success) {
                            throw new Exception("Unable to create directory " + baseDir);
                        }
                    }

                    String sequenceDir = genomeBuild.getSequenceDirectory(baseDir);

                    // Create sequence directory if it doesn't exist
                    if (!new File(sequenceDir).exists()) {
                        boolean success = (new File(sequenceDir)).mkdir();
                        if (!success) {
                            throw new Exception("Unable to create directory " + sequenceDir);
                        }
                    }

                    while ((part = mp.readNextPart()) != null) {
                        if (part.isFile()) {
                            // it's a file part
                            FilePart filePart = (FilePart) part;
                            fileName = filePart.getFileName();
                            if (fileName != null) {

                                // Is the fileName valid?
                                if (!DataTrackUtil.isValidSequenceFileType(fileName)) {
                                    throw new Exception("Bypassing upload of sequence files for  "
                                            + genomeBuild.getDas2Name() + " for file" + fileName
                                            + ". Unsupported file extension");
                                }

                                // Write the file
                                filePart.writeTo(new File(sequenceDir));

                            }
                        }
                    }
                    sess.flush();
                }
            }


            JsonObject value = Json.createObjectBuilder()
                    .add("RESULT", "SUCCESS")
                    .add("idGenomeBuild", idGenomeBuild.toString())
                    .build();
            JsonWriter jsonWriter = Json.createWriter(res.getOutputStream());

            res.setContentType("application/json; charset=UTF-8");
            jsonWriter.writeObject(value);
            jsonWriter.close();

        } catch (Exception e) {
            LOG.error("An error occurred in UploadSequenceFileServlet", e);
            HibernateSession.rollback();

            sess.flush();
            res.addHeader("message", e.getMessage());

            JsonObject value = Json.createObjectBuilder()
                    .add("ERROR", e.getMessage())
                    .build();
            JsonWriter jsonWriter = Json.createWriter(res.getOutputStream());

            res.setContentType("application/json; charset=UTF-8");
            jsonWriter.writeObject(value);
            jsonWriter.close();

        } finally {
            if (sess != null) {
                try {
                    HibernateSession.closeSession();
                } catch (Exception e) {
                    LOG.error("An error occurred in UploadSequenceFileServlet", e);
                }
            }
            res.setHeader("Cache-Control", "max-age=0, must-revalidate");
        }
    }

}
