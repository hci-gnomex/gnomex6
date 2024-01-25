package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.ProductOrder;
import hci.gnomex.model.ProductOrderFile;
import hci.gnomex.model.TransferLog;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.query.Query;
import org.jdom.Document;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;

import javax.servlet.http.HttpSession;
import java.io.File;
import java.io.IOException;
import java.io.Serializable;
import java.io.StringReader;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class OrganizeProductOrderUploadFiles extends GNomExCommand implements Serializable {

// the static field for logging in Log4J
private static Logger LOG = Logger.getLogger(OrganizeProductOrderUploadFiles.class);

private Integer idProductOrder;
private String filesXMLString;
private Document filesDoc;
private String filesToRemoveXMLString;
private Document filesToRemoveDoc;
private ProductOrderFileDescriptorUploadParser parser;
private ProductOrderFileDescriptorUploadParser filesToRemoveParser;

private String serverName;

public void validate() {
}

public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

	if (request.getParameter("idProductOrder") != null && !request.getParameter("idProductOrder").equals("")) {
		idProductOrder = Integer.valueOf(request.getParameter("idProductOrder"));
	} else {
		this.addInvalidField("idProductOrder", "idProductOrder is required");
	}

	if (request.getParameter("filesXMLString") != null && !request.getParameter("filesXMLString").equals("")) {
		filesXMLString = request.getParameter("filesXMLString");

		StringReader reader = new StringReader(filesXMLString);
		try {
			SAXBuilder sax = new SAXBuilder();
			filesDoc = sax.build(reader);
			parser = new ProductOrderFileDescriptorUploadParser(filesDoc);
		} catch (JDOMException je) {
			this.addInvalidField("FilesLXMLString", "Invalid files xml");
			this.errorDetails = Util.GNLOG(LOG,"Cannot parse filesXMLString", je);
		}
	}

	if (request.getParameter("filesToRemoveXMLString") != null
			&& !request.getParameter("filesToRemoveXMLString").equals("")) {
		filesToRemoveXMLString = "<FilesToRemove>" + request.getParameter("filesToRemoveXMLString")
				+ "</FilesToRemove>";

		StringReader reader = new StringReader(filesToRemoveXMLString);
		try {
			SAXBuilder sax = new SAXBuilder();
			filesToRemoveDoc = sax.build(reader);
			filesToRemoveParser = new ProductOrderFileDescriptorUploadParser(filesToRemoveDoc);
		} catch (JDOMException je) {
			this.addInvalidField("FilesToRemoveXMLString", "Invalid filesToRemove xml");
			this.errorDetails = Util.GNLOG(LOG,"Cannot parse filesToRemoveXMLString", je);
		}
	}

	serverName = request.getServerName();

}

public Command execute() throws RollBackCommandException {

	List<String> problemFiles = new ArrayList<String>();
	Session sess = null;
	if (filesXMLString != null) {
		try {
			sess = this.getSecAdvisor().getHibernateSession(this.getUsername());

			ProductOrder productOrder = (ProductOrder) sess.load(ProductOrder.class, idProductOrder);

			String baseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName,
					productOrder.getIdCoreFacility(), PropertyDictionaryHelper.PROPERTY_PRODUCT_ORDER_DIRECTORY);
			baseDir += productOrder.getCreateYear();

			parser.parse();

			// Add new directories to the file system
			for (Iterator i = parser.getNewDirectoryNames().iterator(); i.hasNext();) {
				String directoryName = (String) i.next();
				File dir = new File(baseDir + Constants.FILE_SEPARATOR + directoryName);
				if (!dir.exists()) {
					boolean success = dir.mkdirs();
					if (!success) {
						// Directory not successfully created
						throw new Exception("Unable to create directory " + directoryName);
					}
				}
			}

			// Rename files for(Iterator i = parser.getFilesToRenameMap().keySet().iterator(); i.hasNext();)
			Object[] keys = parser.getFilesToRenameMap().keySet().toArray();
			for (int i = keys.length - 1; i >= 0; i--) {
				String file = (String) keys[i];
				File f1 = new File(file);
				String[] contents = (String[]) parser.getFilesToRenameMap().get(file);
				File f2 = new File(contents[0]);
				String idFileString = contents[1];
				String qualifiedFilePath = contents[2];
				String displayName = contents[3];

				if (!FileUtil.renameTo(f1,f2)) {
					throw new Exception("Error Renaming File, f1: " + f1.toString() + " f2: " + f2.toString());
				} else {
					// Rename the files in the DB
					if (idFileString != null) {
						ProductOrderFile pof;
						if (!idFileString.startsWith("ProductOrderFile") && !idFileString.equals("")) {
							pof = (ProductOrderFile) sess.load(ProductOrderFile.class, Integer.valueOf(idFileString));
							pof.setFileName(displayName);
							pof.setBaseFilePath(f2.getAbsolutePath().replace("\\", Constants.FILE_SEPARATOR));
							pof.setQualifiedFilePath(qualifiedFilePath);
							sess.save(pof);
							sess.flush();
						} else if (idFileString.startsWith("ProductOrderFile") && !f2.exists()) {
							pof = new ProductOrderFile();
							pof.setFileName(displayName);
							pof.setBaseFilePath(f2.getAbsolutePath().replace("\\", Constants.FILE_SEPARATOR));
							pof.setQualifiedFilePath(qualifiedFilePath);
							sess.save(pof);
							sess.flush();
						} else {
							for (Iterator j = parser.getChildrenToMoveMap().keySet().iterator(); j.hasNext();) {
								String oldFileName = (String) j.next();
								String[] afParts = (String[]) parser.getChildrenToMoveMap().get(oldFileName);
								if (afParts[1].startsWith("ProductOrderFile")) {
									continue;
								}
								pof = (ProductOrderFile) sess.load(ProductOrderFile.class, Integer.valueOf(afParts[1]));
								pof.setFileName(afParts[3]);
								pof.setBaseFilePath(afParts[0]);

								String[] filePath = afParts[0].split(Constants.FILE_SEPARATOR);
								pof.setQualifiedFilePath(filePath[filePath.length - 2]);

								sess.save(pof);
								sess.flush();

							}
						}
					}
				}

			}

			// Move files to designated folder
			for (Iterator i = parser.getFileNameMap().keySet().iterator(); i.hasNext();) {

				String directoryName = (String) i.next();

				// Get the qualifiedFilePath (need to remove the productOrder number folder from directory name)
				String[] pathTokens = directoryName.split(Constants.FILE_SEPARATOR);
				String qualifiedFilePath = "";
				if (pathTokens.length > 1) {
					qualifiedFilePath = pathTokens[1];
				}
				for (int i2 = 2; i2 < pathTokens.length; i2++) {
					qualifiedFilePath += Constants.FILE_SEPARATOR + pathTokens[i2];
				}

				List fileNames = (List) parser.getFileNameMap().get(directoryName);

				for (Iterator i1 = fileNames.iterator(); i1.hasNext();) {
					String fileName = (String) i1.next();
					File sourceFile = new File(fileName);
					// don't move it it doesn't exist.
					if (!sourceFile.exists()) {
						continue;
					}
					int lastIndex = fileName.lastIndexOf("\\");
					if (lastIndex == -1) {
						lastIndex = fileName.lastIndexOf(Constants.FILE_SEPARATOR);
					}
					String baseFileName = fileName;
					if (lastIndex != -1) {
						baseFileName = fileName.substring(lastIndex);
					}
					Boolean duplicateUpload = fileNames.contains(baseDir + Constants.FILE_SEPARATOR + productOrder.getProductOrderNumber()
							+ Constants.FILE_SEPARATOR + Constants.UPLOAD_STAGING_DIR + baseFileName);
					String mostRecentFile = "";
					if (duplicateUpload) {
						mostRecentFile = (String) fileNames.get(fileNames.indexOf(baseDir + Constants.FILE_SEPARATOR
								+ productOrder.getProductOrderNumber() + Constants.FILE_SEPARATOR + Constants.UPLOAD_STAGING_DIR
								+ baseFileName));
					}

					// Change qualifiedFilePath if the file is registered in the db
					if (parser.getFileIdMap().containsKey(fileName)) {

						String idFileString = (String) parser.getFileIdMap().get(fileName);

						if (idFileString != null) {
							ProductOrderFile pof = new ProductOrderFile();
							if (!idFileString.startsWith("ProductOrderFile") && !idFileString.equals("")) {
								pof = (ProductOrderFile) sess.load(ProductOrderFile.class, Integer.valueOf(idFileString));
							} else if (idFileString.startsWith("ProductOrderFile")) {
								pof = new ProductOrderFile();
								pof.setCreateDate(new java.sql.Date(System.currentTimeMillis()));
								pof.setCreateDate(new java.sql.Date(System.currentTimeMillis()));
								pof.setIdProductOrder(Integer.valueOf(idProductOrder));
								pof.setFileName(new File(fileName).getName());
								pof.setBaseFilePath(baseDir + Constants.FILE_SEPARATOR + productOrder.getProductOrderNumber());
							}

							if (duplicateUpload) {
								pof.setFileSize(new BigDecimal(new File(mostRecentFile).length()));
								Boolean firstUpload = true;
								while (i1.hasNext()) {
									String test = (String) i1.next();
									if (test.equals(mostRecentFile)) {
										i1.remove();
										i1 = fileNames.iterator();
										new File(mostRecentFile).delete();
										firstUpload = false;
										break;
									}
								}
								if (firstUpload) {
									i1 = fileNames.iterator();
									i1.next();
									i1.remove();
									i1 = fileNames.iterator();
								}
							} else {
								if (new File(fileName).exists()) {
									pof.setFileSize(new BigDecimal(new File(fileName).length()));
								}
							}
							pof.setQualifiedFilePath(qualifiedFilePath);
							sess.save(pof);

						}

					}
					sess.flush();

					sourceFile = sourceFile.getAbsoluteFile();
					String targetDirName = baseDir + Constants.FILE_SEPARATOR + productOrder.getProductOrderNumber()
							+ Constants.FILE_SEPARATOR + qualifiedFilePath;
					File targetDir = new File(targetDirName);
					targetDir = targetDir.getAbsoluteFile();

					if (!targetDir.exists()) {
						boolean success = targetDir.mkdirs();
						if (!success) {
							throw new Exception("Unable to create directory " + targetDir.getAbsolutePath().replace("\\", Constants.FILE_SEPARATOR));
						}
					}

					// Don't try to move if the file is in the same directory
					String td = targetDir.getAbsolutePath().replace("\\", Constants.FILE_SEPARATOR);
					String sd = sourceFile.getAbsolutePath().replace("\\", Constants.FILE_SEPARATOR);
					sd = sd.substring(0, sd.lastIndexOf(Constants.FILE_SEPARATOR));

					if (td.equals(sd)) {
						continue;
					}

					File destFile = new File(targetDir, sourceFile.getName());
					if (!destFile.exists() && sourceFile.isDirectory()) {
						destFile.mkdirs();
					}

					if (!FileUtil.renameTo(sourceFile, destFile)) {
						problemFiles.add(fileName);
					}
				}
			}

			// Remove files from file system
			if (filesToRemoveParser != null) {
				filesToRemoveParser.parseFilesToRemove();

				for (Iterator i = filesToRemoveParser.getFilesToDeleteMap().keySet().iterator(); i.hasNext();) {

					String idFileString = (String) i.next();

					List fileNames = (List) filesToRemoveParser.getFilesToDeleteMap().get(idFileString);

					for (Iterator i1 = fileNames.iterator(); i1.hasNext();) {
						String fileName = (String) i1.next();

						// Remove references of file in TransferLog
						String queryBuf = "SELECT tl from TransferLog tl where tl.idProductOrder = :idProductOrder AND tl.fileName like :fileName";
						Query query = sess.createQuery(queryBuf);
						query.setParameter("idProductOrder", idProductOrder);
						query.setParameter("fileName", "%" + new File(fileName).getName());
						List transferLogs = query.list();

						// Go ahead and delete the transfer log if there is just one row.
						// If there are multiple transfer log rows for this filename, just;
						// bypass deleting the transfer log since it is not possible
						// to tell which entry should be deleted.
						if (transferLogs.size() == 1) {
							TransferLog transferLog = (TransferLog) transferLogs.get(0);
							sess.delete(transferLog);
						}

						// Delete the file from the DB
						if (idFileString != null) {
							ProductOrderFile pof;
							if (!idFileString.startsWith("ProductOrderFile") && !idFileString.equals("")) {
								pof = (ProductOrderFile) sess.load(ProductOrderFile.class, Integer.valueOf(idFileString));
								productOrder.getFiles().remove(pof);
							}
						}
						sess.flush();

						// Delete the file from the file system
						if (new File(fileName).exists()) {
							File deleteFile = new File(fileName);

							if (deleteFile.isDirectory()) {
								if (!deleteDir(deleteFile)) {
									throw new Exception("Unable to delete files");
								}
							}

							boolean success = new File(fileName).delete();
							if (!success) {
								// File was not successfully deleted
								throw new Exception("Unable to delete file " + fileName);
							}
						}

						sess.flush();
					}
				}
			}

			// clean up ghost files
			String queryBuf = "SELECT pof from ProductOrderFile pof where pof.idProductOrder = :idProductOrder";
			Query query = sess.createQuery(queryBuf);
			query.setParameter("idProductOrder", idProductOrder);
			List ghostFiles = query.list();

			for (Iterator i = ghostFiles.iterator(); i.hasNext();) {
				ProductOrderFile pof = (ProductOrderFile) i.next();
				String filePath = pof.getBaseFilePath() + Constants.FILE_SEPARATOR + pof.getQualifiedFilePath() + Constants.FILE_SEPARATOR
						+ pof.getFileName();

				if (!new File(filePath).exists()) {
					productOrder.getFiles().remove(pof);
				}
			}

			String stagingDirectory = baseDir + Constants.FILE_SEPARATOR + productOrder.getProductOrderNumber() + Constants.FILE_SEPARATOR + Constants.UPLOAD_STAGING_DIR;
			FileUtil.pruneEmptyDirectories(stagingDirectory);

			sess.flush();

			this.xmlResult = "<SUCCESS";
			if (problemFiles.size() > 0) {
				String problemFileWarning = "Warning: Unable to move some files:\n" + Util.listToString(problemFiles, "\n", 5);
				this.xmlResult += " warning=" + '"' + problemFileWarning + '"';
			}
			this.xmlResult += "/>";

			setResponsePage(this.SUCCESS_JSP);

		} catch (Exception e) {
			LOG.error("An exception has occurred in OrganizeProdutOrderUploadFiles ", e);

			throw new RollBackCommandException(e.getMessage());

		}

	} else {
		this.xmlResult = "<SUCCESS/>";
		setResponsePage(this.SUCCESS_JSP);
	}

	return this;
}

private Boolean deleteDir(File childFile) throws IOException {
	for (String f : childFile.list()) {
		File delFile = new File(childFile.getAbsolutePath().replace("\\", Constants.FILE_SEPARATOR) + Constants.FILE_SEPARATOR + f);
		if (delFile.isDirectory()) {
			deleteDir(delFile);
			if (!delFile.delete()) {
				return false;
			}
		} else {
			if (!delFile.delete()) {
				return false;
			}
		}
	}

	return true;

}

}
