package hci.gnomex.controller;

import com.oreilly.servlet.multipart.FilePart;
import com.oreilly.servlet.multipart.MultipartParser;
import com.oreilly.servlet.multipart.ParamPart;
import com.oreilly.servlet.multipart.Part;
import hci.framework.model.DetailObject;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.TransferLog;
import hci.gnomex.security.InvalidSecurityAdvisorException;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.FileUtil;
import hci.gnomex.utility.GnomexFile;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.ServletUtil;
import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.hibernate.Session;
import javax.json.Json;
import javax.json.JsonObject;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.util.Set;

public abstract class UploadFileServletBase extends HttpServlet {

	private static final Logger LOG = Logger.getLogger(UploadFileServletBase.class);

	protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
	}

	protected abstract void setParentObjectName(UploadFileServletData data);
	protected abstract void setIdFieldName(UploadFileServletData data);
	protected abstract void setNumberFieldName(UploadFileServletData data);
	protected abstract void handleIdParameter(UploadFileServletData data, String value);
	protected abstract void handleNumberParameter(UploadFileServletData data, String value);
	protected abstract void setBaseDirectory(UploadFileServletData data);
	protected abstract void setUploadDirectory(UploadFileServletData data);
	protected abstract Set<GnomexFile> getExistingFiles(UploadFileServletData data);
	protected abstract void updateTransferLogFromParentObject(UploadFileServletData data, TransferLog transferLog);
	protected abstract void updateExistingFile(UploadFileServletData data, GnomexFile existingFile);
	protected abstract void createNewFile(UploadFileServletData data);
	protected abstract void updateParentObject(UploadFileServletData data);

	protected SecurityAdvisor getSecurityAdvisor(UploadFileServletData data) throws ServletException, InvalidSecurityAdvisorException {
		SecurityAdvisor secAdvisor = (SecurityAdvisor) data.req.getSession().getAttribute(SecurityAdvisor.SECURITY_ADVISOR_SESSION_KEY);
		if (secAdvisor == null) {
			System.out.println(this.getClass().getSimpleName() + ":  Warning - unable to find existing session. Creating security advisor.");
			secAdvisor = SecurityAdvisor.create(data.sess, data.req.getUserPrincipal() != null ? data.req.getUserPrincipal().getName() : "guest");
		}
		if (secAdvisor == null) {
			System.out.println(this.getClass().getSimpleName() + ": Error - Unable to find or create security advisor.");
			throw new ServletException("Unable to upload " + data.parentObjectName + " file.  Servlet unable to obtain security information. Please contact GNomEx support.");
		}
		return secAdvisor;
	}

	protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		// Restrict commands to local host if request is not secure
		if (!ServletUtil.checkSecureRequest(req)) {
			ServletUtil.reportServletError(res, "Secure connection is required. Prefix your request with 'https'");
			return;
		}

		UploadFileServletData data = new UploadFileServletData();
		try {
			data.req = req;
			data.res = res;
			data.sess = HibernateSession.currentSession(data.req.getUserPrincipal() != null ? data.req.getUserPrincipal().getName() : "guest");
			setParentObjectName(data);
			setIdFieldName(data);
			setNumberFieldName(data);
			SecurityAdvisor secAdvisor = getSecurityAdvisor(data);

			String parameterName = "(none)";
			String parameterValue = "(none)";

			MultipartParser mp = new MultipartParser(data.req, Integer.MAX_VALUE);
			Part part;
			while ((part = mp.readNextPart()) != null) {
				String name = part.getName();
				if (part.isParam()) {
					ParamPart paramPart = (ParamPart) part;
					String value = paramPart.getStringValue();
					if (name.equals(data.idFieldName)) {
						parameterName = data.idFieldName;
						parameterValue = value;
						handleIdParameter(data, value);
						break;
					}
					if (name.equals(data.numberFieldName)) {
						parameterName = data.numberFieldName;
						parameterValue = value;
						handleNumberParameter(data, value);
						break;
					}
				}
			}

			if (data.parentObject == null) {
				System.out.println("Unable to upload files for " + data.parentObjectName + ", " + parameterName + " = " + parameterValue);
				throw new ServletException("Unable to upload file due to a server error.  Please contact GNomEx support.");
			}

			data.res.setContentType("text/html; charset=UTF-8");
			PrintWriter out = data.res.getWriter();
			data.res.setHeader("Cache-Control", "max-age=0, must-revalidate");

			org.dom4j.io.OutputFormat format;
			org.dom4j.io.HTMLWriter writer = null;
			Document doc = null;
			String baseURL = "";
			Element body = null;

			if (data.generateOutput) {
				StringBuffer fullPath = data.req.getRequestURL();
				String extraPath = data.req.getServletPath() + (data.req.getPathInfo() != null ? data.req.getPathInfo() : "");
				int pos = fullPath.lastIndexOf(extraPath);
				if (pos > 0) {
					baseURL = fullPath.substring(0, pos);
				}

				data.res.setContentType("text/html; charset=UTF-8");
				data.res.setHeader("Cache-Control", "max-age=0, must-revalidate");

				format = org.dom4j.io.OutputFormat.createPrettyPrint();
				writer = new org.dom4j.io.HTMLWriter(data.res.getWriter(), format);
				doc = DocumentHelper.createDocument();

				Element root = doc.addElement("HTML");
				Element head = root.addElement("HEAD");
				Element link = head.addElement("link");
				link.addAttribute("rel", "stylesheet");
				link.addAttribute("type", "text/css");
				link.addAttribute("href", baseURL + "/css/message.css");
				body = root.addElement("BODY");
				Element h3 = body.addElement("H3");
				h3.addCDATA("Upload " + data.parentObjectName + " files for " + parameterValue);
			}

			if (secAdvisor.canUploadData(data.parentObject)) {
				setBaseDirectory(data);
				setUploadDirectory(data);

				if (!new File(data.uploadDirectory).exists()) {
					boolean success = (new File(data.uploadDirectory)).mkdirs();
					if (!success) {
						System.out.println(this.getClass().getSimpleName() + ": Unable to create directory " + data.uploadDirectory);
						throw new ServletException("Unable to upload file due to a server error.  Please contact GNomEx support.");
					}
					FileUtil.chmod ("770",data.uploadDirectory);
				}

				boolean uploadedAnyFiles = false;
				while ((part = mp.readNextPart()) != null) {
					if (part.isFile()) {
						FilePart filePart = (FilePart) part;
						data.fileName = filePart.getFileName();
						if (data.fileName != null) {

							// Init the transfer log entry
							TransferLog xferLog = new TransferLog();
							xferLog.setStartDateTime(new java.util.Date(System.currentTimeMillis()));
							xferLog.setTransferType(TransferLog.TYPE_UPLOAD);
							xferLog.setTransferMethod(TransferLog.METHOD_HTTP);
							xferLog.setPerformCompression("N");

							updateTransferLogFromParentObject(data, xferLog);

							// the part actually contained a file
							data.fileSize = filePart.writeTo(new File(data.uploadDirectory));
							uploadedAnyFiles = true;

							// Insert the transfer log entry
							xferLog.setFileSize(new BigDecimal(data.fileSize));
							xferLog.setEndDateTime(new java.util.Date(System.currentTimeMillis()));
							data.sess.save(xferLog);

							if (data.generateOutput) {
								body.addElement("BR");
								body.addCDATA(data.fileName + "   -   successfully uploaded "
										+ new DecimalFormat("#,###").format(data.fileSize) + " bytes.");
							}

							String fullFileName = FileStringUtil.appendFile(data.uploadDirectory, data.fileName);
							GnomexFile existingFile = getExistingFile(data, fullFileName);
							if (existingFile != null) {
								updateExistingFile(data, existingFile);
							} else {
								createNewFile(data);
							}

						}
						out.flush();
					}
				}
				if (uploadedAnyFiles) {
					updateParentObject(data);
				}
				data.sess.flush();

			} else {
				System.out.println(this.getClass().getSimpleName() + " - unable to upload file for " + data.parentObjectName
						+ ", " + parameterName + " = " + parameterValue);
				System.out.println("Insufficient write permissions for user " + secAdvisor.getUserLastName() + ", "
						+ secAdvisor.getUserFirstName());
				throw new ServletException("Unable to upload file  due to a server error.  Please contact GNomEx support.");

			}

			if (data.generateOutput) {
				body.addElement("BR");
				Element h5 = body.addElement("H5");
				h5.addCDATA("In GNomEx, click refresh button to see uploaded " + data.parentObjectName + " files.");

				writer.write(doc);
				writer.flush();

				writer.close();
			}else{
				data.res.setContentType("application/json; charset=UTF-8");
				JsonObject value = Json.createObjectBuilder()
						.add("result", "SUCCESS")
						.build();

				try(PrintWriter pw = data.res.getWriter()){
					pw.print(value.toString());
					pw.flush();
				}
			}

		} catch (Exception e) {
			LOG.error("An exception has occurred in " + this.getClass().getSimpleName() +" ", e);
			HibernateSession.rollback();
			throw new ServletException("Unable to upload file " + (data.fileName != null ? data.fileName + " " : "")
					+ "due to a server error.  Please contact GNomEx support.");
		} finally {
			try {
				HibernateSession.closeSession();
			} catch (Exception e) {
				LOG.error("An exception has occurred in " + this.getClass().getSimpleName(), e);
			}
		}

	}

	protected GnomexFile getExistingFile(UploadFileServletData data, String fullFileName) {
		for (GnomexFile existingFile : getExistingFiles(data)) {
			if (existingFile.getFullPathName().equals(fullFileName)) {
				return existingFile;
			}
		}
		return null;
	}

	protected class UploadFileServletData {
		public Session sess;
		public HttpServletRequest req;
		HttpServletResponse res;
		String parentObjectName;
		String idFieldName;
		String numberFieldName;
		DetailObject parentObject;
		Boolean generateOutput = false;
		String baseDirectory;
		String uploadDirectory;
		String fileName;
		long fileSize;
	}

	/**
	 *  This class contains file and directory name manipulation functions
	 *  It uses hci.gnomex.constants.Constants.FILE_SEPARATOR
	 *  It ensures directories end with the file separator and file names do not
	 */
	protected static class FileStringUtil {

		public static String fixFormat(String path) {
			return path
					.replace("/", Constants.FILE_SEPARATOR)
					.replace("\\", Constants.FILE_SEPARATOR);
		}

		public static String fixFileFormat(String path) {
			path = fixFormat(path);
			path = ensureTrailingFileSeparator(path, false);
			return path;
		}

		public static String fixDirectoryFormat(String path) {
			path = fixFormat(path);
			path = ensureTrailingFileSeparator(path, true);
			return path;
		}

		public static String ensureTrailingFileSeparator(String path, boolean separator) {
			if (separator && !path.endsWith(Constants.FILE_SEPARATOR)) {
				path += Constants.FILE_SEPARATOR;
			}
			if (!separator && path.endsWith(Constants.FILE_SEPARATOR)) {
				path = path.substring(0, path.length() - 1);
			}
			return path;
		}

		public static String ensureLeadingFileSeparator(String path, boolean separator) {
			if (separator && !path.startsWith(Constants.FILE_SEPARATOR)) {
				path = Constants.FILE_SEPARATOR + path;
			}
			if (!separator && path.startsWith(Constants.FILE_SEPARATOR)) {
				path = path.substring(1);
			}
			return path;
		}

		public static String append(String base, String item) {
			base = ensureTrailingFileSeparator(base, true);
			item = ensureLeadingFileSeparator(item, false);
			String path = base + item;
			path = fixFormat(path);
			return path;
		}

		public static String appendDirectory(String base, String item) {
			String path = append(base, item);
			path = fixDirectoryFormat(path);
			return path;
		}

		public static String appendFile(String base, String item) {
			String path = append(base, item);
			path = fixFileFormat(path);
			return path;
		}
	}

}
