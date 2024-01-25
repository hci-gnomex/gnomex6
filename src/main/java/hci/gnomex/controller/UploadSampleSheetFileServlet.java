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
import hci.gnomex.utility.ServletUtil;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;

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

            PrintWriter out = res.getWriter();
            res.setHeader("Cache-Control", "max-age=0, must-revalidate");

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

            if (fileWasWritten) {
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

                BufferedReader readbuffer = new BufferedReader(new FileReader(directoryName + fileName));
                String strRead;
                while ((strRead = readbuffer.readLine()) != null) {
                    currentRow = new Element("Row");
                    currentRow.setAttribute("Name", "" + rowNum);
                    sampleSheetList.addContent(currentRow);
                    String splitarray[] = strRead.split("\t", -1);
                    for (int i = 0; i < splitarray.length; i++) {
                        String thisEntry = splitarray[i];
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
                readbuffer.close();
                doc.getRootElement().addContent(columnSelector);
                doc.getRootElement().addContent(sampleSheetList);
            }

            // Delete the file when finished
            File f = new File(directoryName + fileName);
            f.delete();

            PrintWriter responseOut = res.getWriter();
            res.setHeader("Cache-Control", "cache, must-revalidate, proxy-revalidate, s-maxage=0, max-age=0");
            res.setHeader("Pragma", "public");
            res.setDateHeader("Expires", 0);
            res.setContentType("application/json; charset=UTF-8");

            XMLOutputter xmlOut = new XMLOutputter();
            String xmlResult = xmlOut.outputString(doc);
            String jsonResult = Util.xmlToJson(xmlResult);
            responseOut.println(jsonResult);


        } catch (ServletException e) {

            throw new ServletException(e.getMessage());
        } catch (org.jdom.IllegalDataException e) {

            PrintWriter responseOut = res.getWriter();
            res.setHeader("Cache-Control", "cache, must-revalidate, proxy-revalidate, s-maxage=0, max-age=0");
            res.setHeader("Pragma", "public");
            res.setDateHeader("Expires", 0);
            res.setContentType("application/xml; charset=UTF-8");
            responseOut.println("<ERROR message=\"Illegal data\"/>");
        } catch (Exception e) {
            LOG.error("An error has occurred in UploadSampleSheetFileServlet - " + e.toString(), e);
            res.setStatus(ERROR_UPLOAD_MISC);

            throw new ServletException("Unable to upload file " + fileName + " due to a server error.\n\n" + e.toString()
                    + "\n\nPlease contact GNomEx support.");
        } finally {
            try {
                HibernateSession.closeSession();
            } catch (Exception e1) {
                LOG.error("An error has occurred in UploadSampleSheetFileServlet - " + e1.toString(), e1);
            }
        }

    }
}
