package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.*;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.ExperimentFile;
import hci.gnomex.model.Request;
import hci.gnomex.model.Sample;
import hci.gnomex.model.SampleExperimentFile;
import hci.gnomex.model.TransferLog;
import hci.gnomex.utility.DictionaryHelper;
import hci.gnomex.utility.FileDescriptorUploadParser;
import hci.gnomex.utility.PropertyDictionaryHelper;

import java.io.File;
import java.io.Serializable;
import java.io.StringReader;
import java.math.BigDecimal;
import java.sql.Date;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.regex.Pattern;

import javax.json.*;
import javax.servlet.http.HttpSession;

import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.query.Query;
import org.jdom.Element;
import org.jdom.input.SAXBuilder;

public class OrganizeExperimentUploadFiles extends GNomExCommand implements Serializable {

    // the static field for logging in Log4J
    private static Logger LOG = Logger.getLogger(OrganizeExperimentUploadFiles.class);

    private Integer idRequest;
    private JsonArray experimentFileList;
    private JsonObject files;
    private JsonArray filesToRemoveList;
    private JsonArray filesToUnlink;
    private JsonArray linkedSampleFileList;
    private FileDescriptorUploadParser parser;
    private FileDescriptorUploadParser filesToRemoveParser;
    private List directoryFilesToUnlink = new ArrayList();
    private List deletedSefEntries = new ArrayList();

    private String serverName;

    private DictionaryHelper dictionaryHelper = null;

    private static String flowCellDir = null;

    public void validate() {
    }

    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

        if (request.getParameter("idRequest") != null && !request.getParameter("idRequest").equals("")) {
            idRequest = new Integer(request.getParameter("idRequest"));
        } else {
            this.addInvalidField("idRequest", "idRequest is required");
        }

        if (request.getParameter("filesJSONString") != null && !request.getParameter("filesJSONString").equals("")) {
            String filesJSONString = request.getParameter("filesJSONString");
//            System.out.println("[OEUF] filesXMLString:\n" + filesXMLString + "\n");

            if(Util.isParameterNonEmpty(filesJSONString)){
                try(JsonReader jsonReader = Json.createReader(new StringReader(filesJSONString))) {
                    this.files = jsonReader.readObject();
                    parser = new FileDescriptorUploadParser(files);
                } catch (Exception e) {
                    this.addInvalidField("FilesJSONString", "Invalid files json");
                    this.errorDetails = Util.GNLOG(LOG,"Cannot parse filesJSONString", e);
                }

            }

        }

        if (request.getParameter("experimentFileJSONString") != null
                && !request.getParameter("experimentFileJSONString").equals("")) {
            String experimentFileJSONString =  request.getParameter("experimentFileJSONString");
//            System.out.println("[OEUF] experimentFileXMLString:\n" + experimentFileXMLString + "\n");
            if(Util.isParameterNonEmpty(experimentFileJSONString)){
                try(JsonReader jsonReader = Json.createReader( new StringReader(experimentFileJSONString))) {
                    experimentFileList = jsonReader.readArray();
                } catch (Exception e) {
                    this.addInvalidField("experimentFileJSONString", "Invalid experiment File json");
                    this.errorDetails = Util.GNLOG(LOG,"Cannot parse experimentFileJSONString", e);
                }

            }

        }

        if (request.getParameter("filesToRemoveJSONString") != null
                && !request.getParameter("filesToRemoveJSONString").equals("")) {
            String filesToRemoveJSONString = request.getParameter("filesToRemoveJSONString");
//            System.out.println("[OEUF] filesToRemoveXMLString:\n" + filesToRemoveXMLString + "\n");

            if(Util.isParameterNonEmpty(filesToRemoveJSONString)){
                try(JsonReader jsonReader = Json.createReader(new StringReader(filesToRemoveJSONString))) {
                    filesToRemoveList = jsonReader.readArray();
                    filesToRemoveParser = new FileDescriptorUploadParser(filesToRemoveList);
                } catch (Exception e) {
                    this.addInvalidField("FilesToRemoveJSONString", "Invalid filesToRemove json");
                    this.errorDetails = Util.GNLOG(LOG,"Cannot parse filesToRemoveJSONString", e);
                }
            }
        }

        if (request.getParameter("filesToUnlinkJSONString") != null
                && !request.getParameter("filesToUnlinkJSONString").equals("")) {
            String filesToUnlinkJSONString = request.getParameter("filesToUnlinkJSONString");
//            System.out.println("[OEUF] filesToRemoveXMLString:\n" + filesToRemoveXMLString + "\n");

            if(Util.isParameterNonEmpty(filesToUnlinkJSONString)){
                try(JsonReader jsonReader = Json.createReader(new StringReader(filesToUnlinkJSONString))) {
                    filesToUnlink = jsonReader.readArray();
                } catch (Exception e) {
                    this.addInvalidField("FilesToUnlinkXMLString", "Invalid filesToUnlink json");
                    this.errorDetails = Util.GNLOG(LOG,"Cannot parse filesToUnlinkJSONString", e);
                }
            }
        }

        if (request.getParameter("linkedSampleFileJSONString") != null
                && !request.getParameter("linkedSampleFileJSONString").equals("")) {
            String linkedSampleFileJsonString = request.getParameter("linkedSampleFileJSONString");
//            System.out.println("[OEUF] linkedSampleFileXMLString:\n" + linkedSampleFileXMLString + "\n");

            if(Util.isParameterNonEmpty(linkedSampleFileJsonString)){
                try(JsonReader jsonReader = Json.createReader(new StringReader(linkedSampleFileJsonString))) {
                    linkedSampleFileList = jsonReader.readArray();
                } catch (Exception je) {
                    this.addInvalidField("linkedSampleFileJSONString", "Invalid linkedSample json");
                    this.errorDetails = Util.GNLOG(LOG,"Cannot parse linkedSampleFileJSONString", je);
                }

            }


        }

        serverName = request.getServerName();

    }

    public Command execute() throws RollBackCommandException {

        List<String> problemFiles = new ArrayList<String>();
        Session sess = null;
        if (files != null) {
            try {
                sess = this.getSecAdvisor().getHibernateSession(this.getUsername());

                Request request = (Request) sess.load(Request.class, idRequest);
                String baseRequestNumber = Request.getBaseRequestNumber(request.getNumber());
                String baseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName,
                        request.getIdCoreFacility(), PropertyDictionaryHelper.PROPERTY_EXPERIMENT_DIRECTORY);
                flowCellDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName,
                        request.getIdCoreFacility(), PropertyDictionaryHelper.PROPERTY_FLOWCELL_DIRECTORY);
                baseDir += request.getCreateYear() + Constants.FILE_SEPARATOR + Request.getBaseRequestNumber(request.getNumber());

                if (this.getSecAdvisor().canUploadData(request)) {

                    parser.parse();

                    // Add new directories to the file system
                    for (Iterator i = parser.getNewDirectoryNames().iterator(); i.hasNext(); ) {
                        String directoryName = (String) i.next();
                        File dir = new File(baseDir + Constants.FILE_SEPARATOR + directoryName);
                        if (!dir.exists()) {
                            boolean success = dir.mkdirs();
                            if (!success) {
                                // File was not successfully created
                                throw new Exception("Unable to create directory " + directoryName);
                            }

                        }
                    }

                    // Rename files
                    for (Iterator i = parser.getFilesToRenameMap().keySet().iterator(); i.hasNext(); ) {
                        String file = (String) i.next();
                        String newFileName = (String) parser.getFilesToRenameMap().get(file);
                        File f1 = new File(file);
                        File f2 = new File(newFileName);
                        boolean success = FileUtil.renameTo(f1, f2);
                        if (success) {
                            for (Iterator k = parser.getFileNameMap().keySet().iterator(); k.hasNext(); ) {
                                String directory = (String) k.next();
                                List fileNames = (List) parser.getFileNameMap().get(directory);
                                for (Iterator i1 = fileNames.iterator(); i1.hasNext(); ) {
                                    String parserFile = (String) i1.next();
                                    if (parserFile.equals(file)) {
                                        fileNames.remove(parserFile);
                                        fileNames.add(f2.getAbsolutePath().replace("\\", Constants.FILE_SEPARATOR));
                                        parser.getFileNameMap().put(directory, fileNames);
                                        break;
                                    }
                                }
                            }
                            // Update experiment file name if registered in the db
                            String oldExpFileName = file.substring(file.indexOf(baseRequestNumber)).replace("\\", Constants.FILE_SEPARATOR);
                            String newExpFileName = newFileName.substring(newFileName.indexOf(baseRequestNumber)).replace(
                                    "\\", Constants.FILE_SEPARATOR);
                            String queryBuf = "Select exp from ExperimentFile exp where fileName = :oldExpFileName";
                            Query query = sess.createQuery(queryBuf);
                            query.setParameter("oldExpFileName", oldExpFileName);
                            List expFiles = query.list();
                            if (expFiles.size() == 1) {
                                ExperimentFile ef = (ExperimentFile) expFiles.get(0);
                                ef.setFileName(newExpFileName);
                                sess.save(ef);
                            }
                        } else {
                            throw new Exception("Unable to rename file.  Invalid file name");
                        }

                    }

                    // Rename Folders
                    for (Iterator i = parser.getFoldersToRenameMap().keySet().iterator(); i.hasNext(); ) {
                        String folder = (String) i.next();
                        String newFolder = (String) parser.getFoldersToRenameMap().get(folder);
                        File f1 = new File(baseDir + Constants.FILE_SEPARATOR + folder);
                        File f2 = new File(baseDir + Constants.FILE_SEPARATOR + newFolder);
                        f2.mkdir();
                        for (Iterator j = parser.getFileNameMap().keySet().iterator(); j.hasNext(); ) {
                            String directory = (String) j.next();
                            if (directory.contains(folder + Constants.FILE_SEPARATOR)) {
                                parser.getFileNameMap().remove(directory);
                                j = parser.getFileNameMap().keySet().iterator();
                            }
                            if (directory.equals(folder)) {
                                List fileNames = (List) parser.getFileNameMap().get(directory);
                                parser.getFileNameMap().remove(directory);
                                parser.getFileNameMap().put(newFolder, fileNames);
                                j = parser.getFileNameMap().keySet().iterator();
                            }
                        }
                    }

                    // Move files to designated folder
                    for (Iterator i = parser.getFileNameMap().keySet().iterator(); i.hasNext(); ) {
                        String directoryName = (String) i.next();
                        List fileNames = (List) parser.getFileNameMap().get(directoryName);
                        String targetDirName = "";
                        directoryName = directoryName.replace("\\", Constants.FILE_SEPARATOR);
                        List<String> path = Arrays.asList(directoryName.split(Pattern.quote(Constants.FILE_SEPARATOR)));
                        directoryName = "";
                        for (Iterator<String> iter = path.iterator(); iter.hasNext(); ) {
                            String s = iter.next();
                            if (!baseDir.contains(s)) {
                                directoryName += s + Constants.FILE_SEPARATOR;
                            }
                        }

                        for (Iterator i1 = fileNames.iterator(); i1.hasNext(); ) {
                            String fileName = (String) i1.next();
                            if (fileName.toUpperCase().contains(flowCellDir.toUpperCase())) {
                                continue;
                            }
                            File sourceFile = new File(fileName);

                            // if sourceFile does not exist, it was probably already moved/renamed when its
                            // parent directory was moved/renamed, so don't report the error
                            if (!sourceFile.exists()) {
                                continue;
                            }

                            if (baseDir.contains(directoryName)
                                    || baseDir.contains(directoryName.subSequence(0, directoryName.length() - 1))) {
                                targetDirName = baseDir + Constants.FILE_SEPARATOR;
                            } else {
                                targetDirName = baseDir + Constants.FILE_SEPARATOR + directoryName;
                            }
                            File targetDir = new File(targetDirName);

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

                            if (sourceFile.isDirectory() && destFile.exists() && destFile.isDirectory()) {
                                // nothing to do, the directory already exists
//                                System.out.println("[OEUF] renameTo sourceFile: " + sourceFile.getPath() + " targetFile: " + destFile.getPath() + " directory already exists");
                                continue;
                            }

                            if (FileUtil.renameTo(sourceFile, destFile)) {
                                // If we have renamed a file that is registered in the database
                                // under the ExperimentFile table, then update the ExperimentFile name
                                // so that we don't do an unnecessary delete in the register files servlet
                                String currentExpFileName = fileName.substring(fileName.indexOf(baseRequestNumber))
                                        .replace("\\", Constants.FILE_SEPARATOR); // REMOVE
                                // REPLACE
                                // AFTER
                                // DEBUGGING
                                String queryBuf = "Select exp from ExperimentFile exp where fileName = :currentExpFileName";
                                Query query = sess.createQuery(queryBuf);
                                query.setParameter("currentExpFileName", currentExpFileName);
                                List expFiles = query.list();
                                if (expFiles.size() == 1) {
                                    String newExpFileName = targetDirName.substring(
                                            targetDirName.indexOf(baseRequestNumber)).replace("\\", Constants.FILE_SEPARATOR); // Remove
                                    // replace
                                    // after
                                    // debugging
                                    newExpFileName += Constants.FILE_SEPARATOR + destFile.getName();
                                    newExpFileName = newExpFileName.replace("//", Constants.FILE_SEPARATOR);
                                    ExperimentFile ef = (ExperimentFile) expFiles.get(0);
                                    ef.setFileName(newExpFileName);
                                    ef.setFileSize(BigDecimal.valueOf(destFile.length()));
                                    sess.save(ef);
                                }
                            } else {
                                problemFiles.add(fileName);
                            }

                        } // end of for

                    }

                    // Remove files from file system
                    if (filesToRemoveParser != null) {
                        for (Iterator i = filesToRemoveParser.parseFilesToRemove().iterator(); i.hasNext(); ) {
                            String fileName = (String) i.next();
                            File f = new File(fileName);

                            // Remove references of file in TransferLog
                            String queryBuf = "SELECT tl from TransferLog tl where tl.idRequest = :idRequest AND tl.fileName like :fileName";
                            Query query = sess.createQuery(queryBuf);
                            query.setParameter("idRequest", idRequest);
                            query.setParameter("fileName", "%" + new File(fileName).getName());
                            List transferLogs = query.list();

                            // Go ahead and delete the transfer log if there is just one row.
                            // If there are multiple transfer log rows for this filename, just
                            // bypass deleting the transfer log since it is not possible
                            // to tell which entry should be deleted.
                            if (transferLogs.size() == 1) {
                                TransferLog transferLog = (TransferLog) transferLogs.get(0);
                                sess.delete(transferLog);
                            }

                            // The "file" might be a directory so we have to delete all of the
                            // files underneath it first
                            if (f.isDirectory()) {
                                deleteDir(f, fileName);
                            }

                            if (f.exists()) {
                                boolean success = f.delete();
                                if (!success) {
                                    // File was not successfully deleted
                                    throw new Exception("Unable to delete file " + fileName);
                                } else {
                                    // Delete ExperimentFile if one is registered in the db and
                                    // unlink sample file if need be
                                    String queryString = "Select exp from ExperimentFile exp where fileName = :fileName";
                                    Query query2 = sess.createQuery(queryString);
                                    String currentFileName = fileName.substring(fileName.indexOf(baseRequestNumber))
                                            .replace("\\", Constants.FILE_SEPARATOR); // REMOVE
                                    // REPLACE
                                    // AFTER
                                    // DEBUGGING
                                    query2.setParameter("fileName", currentFileName);
                                    List expFiles = query2.list();
                                    if (expFiles.size() == 1) {
                                        ExperimentFile ef = (ExperimentFile) expFiles.get(0);
                                        String queryBuf3 = "SELECT DISTINCT sef from SampleExperimentFile sef where sef.idExpFileRead1 = :idExperimentFile1 OR sef.idExpFileRead2 = :idExperimentFile2";
                                        Query query3 = sess.createQuery(queryBuf3);
                                        query3.setParameter("idExperimentFile1", ef.getIdExperimentFile());
                                        query3.setParameter("idExperimentFile2", ef.getIdExperimentFile());
                                        List l = query3.list();

                                        if (l.size() == 1) {
                                            SampleExperimentFile sef = (SampleExperimentFile) l.get(0);
                                            if (sef.getIdExpFileRead1() != null
                                                    && sef.getIdExpFileRead1().equals(ef.getIdExperimentFile())) {
                                                sef.setIdExpFileRead1(null);
                                            } else if (sef.getIdExpFileRead2() != null
                                                    && sef.getIdExpFileRead2().equals(ef.getIdExperimentFile())) {
                                                sef.setIdExpFileRead2(null);
                                            }

                                            if (sef.getIdExpFileRead1() == null && sef.getIdExpFileRead2() == null) {
                                                deletedSefEntries.add(sef.getIdSampleExperimentFile());
                                                sess.delete(sef);
                                            } else {
                                                sess.save(sef);
                                            }
                                        }
                                        request.getFiles().remove(ef);
                                        sess.delete(ef);
                                        sess.flush();
                                    }
                                }
                            }

                        }
                        sess.flush();
                    }

                    sess.flush();

                    // TODO Address inconsistency with OrganizeAnalysisUploadFiles and OrganizeProductOrderUploadFiles
                    //  Here baseDir is [PROPERTY_EXPERIMENT_DIRECTORY][year]/[baseRequestNumber]
                    // There baseDir is [PROPERTY_EXPERIMENT_DIRECTORY][year]

                    String stagingDirectory = baseDir + Constants.FILE_SEPARATOR + Constants.UPLOAD_STAGING_DIR;
                    FileUtil.pruneEmptyDirectories(stagingDirectory);

                    if (directoryFilesToUnlink.size() > 0) {
                        for (Iterator i = directoryFilesToUnlink.iterator(); i.hasNext(); ) {
                            String fileName = (String) i.next();
                            String currentFileName = fileName.substring(fileName.indexOf(baseRequestNumber)).replace("\\",
                                    Constants.FILE_SEPARATOR);
                            String queryBuf = "Select exp from ExperimentFile exp where fileName = :currentFileName";
                            Query query = sess.createQuery(queryBuf);
                            query.setParameter("currentFileName", currentFileName);
                            List expFiles = query.list();
                            if (expFiles.size() == 1) {
                                ExperimentFile ef = (ExperimentFile) expFiles.get(0);
                                String queryBuf2 = "SELECT DISTINCT sef from SampleExperimentFile sef where sef.idExpFileRead1 = :idExperimentFile1 OR sef.idExpFileRead2 = :idExperimentFile2";
                                Query query2 = sess.createQuery(queryBuf2);
                                query2.setParameter("idExperimentFile1", ef.getIdExperimentFile());
                                query2.setParameter("idExperimentFile2", ef.getIdExperimentFile());
                                List l = query2.list();

                                if (l.size() == 1) {
                                    SampleExperimentFile sef = (SampleExperimentFile) l.get(0);
                                    if (sef.getIdExpFileRead1() != null
                                            && sef.getIdExpFileRead1().equals(ef.getIdExperimentFile())) {
                                        sef.setIdExpFileRead1(null);
                                    } else if (sef.getIdExpFileRead2() != null
                                            && sef.getIdExpFileRead2().equals(ef.getIdExperimentFile())) {
                                        sef.setIdExpFileRead2(null);
                                    }

                                    if (sef.getIdExpFileRead1() == null && sef.getIdExpFileRead2() == null) {
                                        deletedSefEntries.add(sef.getIdSampleExperimentFile());
                                        sess.delete(sef);
                                    } else {
                                        sess.save(sef);
                                    }
                                }
                                request.getFiles().remove(ef);
                                sess.delete(ef);
                                sess.flush();
                            }
                        }

                        sess.flush();

                    }

                    // Unlink experiment files from Samples
                    if (filesToUnlink != null) {
                        JsonArray root = this.filesToUnlink;
                        for (int i = 0; i < filesToUnlink.size(); i++ ) {
                            JsonObject fileDescriptor = filesToUnlink.getJsonObject(i);

                            if (fileDescriptor.get("idExperimentFile") != null
                                    && !fileDescriptor.getString("idExperimentFile").equals("")) {
                                Integer idExperimentFile = Integer.parseInt(fileDescriptor.getString("idExperimentFile"));
                                String queryBuf = "SELECT DISTINCT sef from SampleExperimentFile sef where sef.idExpFileRead1 = :idExperimentFile1 OR sef.idExpFileRead2 = :idExperimentFile2";
                                Query query = sess.createQuery(queryBuf);
                                query.setParameter("idExperimentFile1", idExperimentFile);
                                query.setParameter("idExperimentFile2", idExperimentFile);
                                List l = query.list();

                                if (l.size() == 1) {
                                    SampleExperimentFile sef = (SampleExperimentFile) l.get(0);
                                    if (sef.getIdExpFileRead1() != null && sef.getIdExpFileRead1().equals(idExperimentFile)) {
                                        sef.setIdExpFileRead1(null);
                                    } else if (sef.getIdExpFileRead2() != null
                                            && sef.getIdExpFileRead2().equals(idExperimentFile)) {
                                        sef.setIdExpFileRead2(null);
                                    }

                                    if (sef.getIdExpFileRead1() == null && sef.getIdExpFileRead2() == null) {
                                        deletedSefEntries.add(sef.getIdSampleExperimentFile());
                                        sess.delete(sef);
                                    } else {
                                        sess.update(sef);
                                    }
                                }
                            }
                        }
                        sess.flush();
                    }

                    // Map existing experiment files to file names that are coming in so
                    // we don't create duplicate experiment files
                    HashMap expFileDictionary = new HashMap();
                    if (experimentFileList != null) {
                        JsonArray root = this.experimentFileList;
                        for (int i = 0 ; i < root.size(); i++) {
                            JsonObject fd = root.getJsonObject(i);
                            String fileName = fd.get("zipEntryName") != null ? fd.getString("zipEntryName") : "";
                            fileName = fileName.replace("\\", Constants.FILE_SEPARATOR);
                            String queryBuf = "Select expFile from ExperimentFile expFile where fileName = :fileName";
                            Query query = sess.createQuery(queryBuf);
                            query.setParameter("fileName", fileName);
                            List expFile = query.list();
                            if (expFile.size() > 0) {
                                ExperimentFile ef = (ExperimentFile) expFile.get(0);
                                expFileDictionary.put(fileName, ef);
                            }
                        }
                    }

                    Map<String, List<Element>> sampleGroup = new TreeMap<String, List<Element>>();
                    if (linkedSampleFileList != null) {
                        /*JsonArray root = this.linkedSampleFileList;

                        for (int i =0; i < root.size(); i++) {
                            JsonObject child = root.getJsonObject(i);
                            if (child.getName().equals("Sample")) {
                                if (sampleGroup.containsKey("*||*")) {
                                    List<Element> samples = sampleGroup.get("*||*");
                                    samples.add(child);
                                    sampleGroup.put("*||*", samples);
                                } else {
                                    List<Element> samples = new ArrayList<Element>();
                                    samples.add(child);
                                    sampleGroup.put("*||*", samples);
                                }
                            } else if (child.getName().equals("SampleGroup")) {
                                recurseAddSamples(child, sampleGroup, child.getAttributeValue("displayName"));
                            }
                        }*/
                    }

                    for (Iterator i = sampleGroup.keySet().iterator(); i.hasNext(); ) {
                        String displayName = (String) i.next();
                        int fileCount = 1;
                        List<Element> sampleNodes = sampleGroup.get(displayName);
                        for (Iterator j = sampleNodes.iterator(); j.hasNext(); ) {
                            Element sampleNode = (Element) j.next();
                            Integer idSample = Integer.parseInt(sampleNode.getAttributeValue("idSample"));
                            Sample s = (Sample) sess.load(Sample.class, idSample);
                            s.setGroupName(displayName);
                            sess.save(s);
                            int seqRunNumber = 0;
                            for (Iterator k = sampleNode.getChildren().iterator(); k.hasNext(); ) {
                                Element seqRunNode = (Element) k.next();
                                SampleExperimentFile sef = new SampleExperimentFile();
                                Integer idSampleExperimentFile = null;
                                if (seqRunNode.getAttributeValue("idSampleExperimentFile") != null) {
                                    idSampleExperimentFile = Integer.parseInt(seqRunNode
                                            .getAttributeValue("idSampleExperimentFile"));
                                }

                                // If we have already deleted the sef in above code. Don't
                                // bother doing anything else.
                                if (deletedSefEntries.contains(idSampleExperimentFile)) {
                                    continue;
                                }

                                seqRunNumber = seqRunNumber + 1;
                                if (idSampleExperimentFile != null && !idSampleExperimentFile.equals("")) {
                                    sef = (SampleExperimentFile) sess.load(SampleExperimentFile.class,
                                            idSampleExperimentFile);
                                }

                                fileCount = 1;
                                for (Iterator l = seqRunNode.getChildren().iterator(); l.hasNext(); ) {
                                    Element expFile = (Element) l.next();
                                    ExperimentFile ef = new ExperimentFile();

                                    // If it is in the dictionary use it.
                                    if (expFileDictionary.containsKey(expFile.getAttributeValue("zipEntryName").replace(
                                            "\\", Constants.FILE_SEPARATOR))) {
                                        ef = (ExperimentFile) expFileDictionary.get(expFile.getAttributeValue(
                                                "zipEntryName").replace("\\", Constants.FILE_SEPARATOR));
                                    } else if (expFile.getAttributeValue("idExperimentFile") != null
                                            && !expFile.getAttributeValue("idExperimentFile").equals("")) {
                                        ef = (ExperimentFile) sess.get(ExperimentFile.class,
                                                Integer.parseInt(expFile.getAttributeValue("idExperimentFile")));
                                        // The experiment file may have been deleted from above code
                                        if (ef == null) {
                                            continue;
                                        }
                                    } else {
                                        java.util.Date d = new java.util.Date();
                                        ef.setIdRequest(this.idRequest);
                                        ef.setFileName(expFile.getAttributeValue("zipEntryName").replace("\\", Constants.FILE_SEPARATOR));
                                        ef.setFileSize(new BigDecimal(expFile.getAttributeValue("fileSize")));
                                        ef.setCreateDate(new Date(d.getTime()));
                                        sess.save(ef);
                                    }
                                    if (sef != null && ef != null) {
                                        if (sef.getIdExpFileRead1() != null && ef.getIdExperimentFile() != null
                                                && fileCount == 1
                                                && sef.getIdExpFileRead1().equals(ef.getIdExperimentFile())) {
                                            fileCount++;
                                            continue;
                                        } else if (sef.getIdExpFileRead2() != null && ef.getIdExperimentFile() != null
                                                && fileCount == 2
                                                && sef.getIdExpFileRead2().equals(ef.getIdExperimentFile())) {
                                            fileCount++;
                                            continue;
                                        }

                                    }

                                    if (fileCount == 1) {
                                        sef.setIdSample(idSample);
                                        sef.setSeqRunNumber(seqRunNumber);
                                        sef.setIdExpFileRead1(ef.getIdExperimentFile());
                                        if (!k.hasNext()) {
                                            sef.setIdExpFileRead2(null);
                                            sess.saveOrUpdate(sef);
                                        }
                                    } else if (fileCount == 2) {
                                        sef.setIdExpFileRead2(ef.getIdExperimentFile());
                                        sess.saveOrUpdate(sef);
                                    }
                                    fileCount++;
                                }
                            }

                        }
                    }
//				System.out.println ("[OEULF] this.xmlResult: " + this.xmlResult);

                    String problemFileWarning = "";
                    if (problemFiles.size() > 0) {
                        problemFileWarning = "Warning: Unable to move some files:\n" + Util.listToString(problemFiles, "\n", 5);
                    }

                    JsonObjectBuilder valueBuilder = Json.createObjectBuilder().add("result", "SUCCESS");
                    if(!problemFileWarning.equals("")){
                        valueBuilder.add("warning", problemFileWarning);
                    }

                    this.jsonResult = valueBuilder.build().toString();

                    setResponsePage(this.SUCCESS_JSP);

                } else {
                    this.addInvalidField("Insufficient permissions", "Insufficient permission to organize uploaded files");
                    setResponsePage(this.ERROR_JSP);
                }

            } catch (Exception e) {
                this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in OrganizeExperimentUploadFiles ", e);

                throw new RollBackCommandException(e.getMessage());
            }
        } else {

            JsonObjectBuilder valueBuilder = Json.createObjectBuilder()
                    .add("result", "INVALID")
                    .add("message", "The organize  Files JSON is missing.");
            this.jsonResult = valueBuilder.build().toString();
            setResponsePage(this.SUCCESS_JSP);
        }

        return this;
    }

    private void recurseAddSamples(Element child, Map<String, List<Element>> sampleGroup, String displayName) {
        for (Iterator i = child.getChildren().iterator(); i.hasNext(); ) {
            Element subChild = (Element) i.next();
            if (subChild.getName().equals("Sample")) {
                if (sampleGroup.containsKey(displayName)) {
                    List<Element> samples = sampleGroup.get(displayName);
                    samples.add(subChild);
                    sampleGroup.put(displayName, samples);
                } else {
                    List<Element> samples = new ArrayList<Element>();
                    samples.add(subChild);
                    sampleGroup.put(displayName, samples);
                }
            } else if (subChild.getName().equals("SampleGroup")) {
                recurseAddSamples(subChild, sampleGroup, displayName + Constants.FILE_SEPARATOR + subChild.getAttributeValue("displayName"));
            }
        }
    }

    public void deleteDir(File f, String fileName) throws Exception {
        for (String file : f.list()) {
            File child = new File(fileName + Constants.FILE_SEPARATOR + file);
            if (child.isDirectory()) {
                deleteDir(child, child.getAbsolutePath().replace("\\", Constants.FILE_SEPARATOR));
            } else if (!(new File(fileName + Constants.FILE_SEPARATOR + file).delete())) {
                throw new Exception("Unable to delete file " + fileName + Constants.FILE_SEPARATOR + file);
            } else {
                filesToRemoveParser.parseFilesToRemove().remove(fileName + Constants.FILE_SEPARATOR + file);
                directoryFilesToUnlink.add(fileName + Constants.FILE_SEPARATOR + file);
            }

        }
        if (f.list().length == 0) {
            if (!f.delete()) {
                throw new Exception("Unable to delete file " + f.getAbsolutePath().replace("\\", Constants.FILE_SEPARATOR));
            }
            return;
        }

    }

}
