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
import hci.gnomex.utility.FileDescriptorUploadParser;
import hci.gnomex.utility.PropertyDictionaryHelper;

import java.io.File;
import java.io.Serializable;
import java.io.StringReader;
import java.math.BigDecimal;
import java.sql.Date;
import java.util.ArrayList;
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
    private List<String> directoryFilesToUnlink = new ArrayList<>();
    private List<Integer> deletedSefEntries = new ArrayList<>();

    private String serverName;

    private final Map<String, String> sampleHierarchy = new HashMap<String, String>() {{
        put("SampleGroup", "Sample");
        put("Sample", "SeqRunNumber");
        put("SeqRunNumber", "FileDescriptor");
    }};

    public void validate() {
    }

    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

        if (request.getParameter("idRequest") != null && !request.getParameter("idRequest").equals("")) {
            idRequest = new Integer(request.getParameter("idRequest"));
        } else {
            this.addInvalidField("idRequest", "idRequest is required");
        }

        String filesJSONString = request.getParameter("filesJSONString");
        if (Util.isParameterNonEmpty(filesJSONString)) {
            try (JsonReader jsonReader = Json.createReader(new StringReader(filesJSONString))) {
                this.files = jsonReader.readObject();
                parser = new FileDescriptorUploadParser(files);
            } catch (Exception e) {
                this.addInvalidField("FilesJSONString", "Invalid files json");
                this.errorDetails = Util.GNLOG(LOG, "Cannot parse filesJSONString", e);
            }
        }

        String experimentFileJSONString = request.getParameter("experimentFileJSONString");
        if (Util.isParameterNonEmpty(experimentFileJSONString)) {
            try (JsonReader jsonReader = Json.createReader(new StringReader(experimentFileJSONString))) {
                experimentFileList = jsonReader.readArray();
            } catch (Exception e) {
                this.addInvalidField("experimentFileJSONString", "Invalid experiment File json");
                this.errorDetails = Util.GNLOG(LOG, "Cannot parse experimentFileJSONString", e);
            }
        }

        String filesToRemoveJSONString = request.getParameter("filesToRemoveJSONString");
        if (Util.isParameterNonEmpty(filesToRemoveJSONString)) {
            try (JsonReader jsonReader = Json.createReader(new StringReader(filesToRemoveJSONString))) {
                filesToRemoveList = jsonReader.readArray();
                filesToRemoveParser = new FileDescriptorUploadParser(filesToRemoveList);
            } catch (Exception e) {
                this.addInvalidField("FilesToRemoveJSONString", "Invalid filesToRemove json");
                this.errorDetails = Util.GNLOG(LOG, "Cannot parse filesToRemoveJSONString", e);
            }
        }

        String filesToUnlinkJSONString = request.getParameter("filesToUnlinkJSONString");
        if (Util.isParameterNonEmpty(filesToUnlinkJSONString)) {
            try (JsonReader jsonReader = Json.createReader(new StringReader(filesToUnlinkJSONString))) {
                filesToUnlink = jsonReader.readArray();
            } catch (Exception e) {
                this.addInvalidField("FilesToUnlinkXMLString", "Invalid filesToUnlink json");
                this.errorDetails = Util.GNLOG(LOG, "Cannot parse filesToUnlinkJSONString", e);
            }
        }

        String linkedSampleFileJsonString = request.getParameter("linkedSampleFileJSONString");
        if (Util.isParameterNonEmpty(linkedSampleFileJsonString)) {
            try (JsonReader jsonReader = Json.createReader(new StringReader(linkedSampleFileJsonString))) {
                linkedSampleFileList = jsonReader.readArray();
            } catch (Exception je) {
                this.addInvalidField("linkedSampleFileJSONString", "Invalid linkedSample json");
                this.errorDetails = Util.GNLOG(LOG, "Cannot parse linkedSampleFileJSONString", je);
            }
        }

        serverName = request.getServerName();
    }

    public Command execute() throws RollBackCommandException {

        List<String> problemFiles = new ArrayList<>();
        Session sess;
        if (files != null) {
            try {
                sess = this.getSecAdvisor().getHibernateSession(this.getUsername());

                Request request = sess.load(Request.class, idRequest);
                String baseRequestNumber = Request.getBaseRequestNumber(request.getNumber());
                String baseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, request.getIdCoreFacility(), PropertyDictionaryHelper.PROPERTY_EXPERIMENT_DIRECTORY);
                String flowCellDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, request.getIdCoreFacility(), PropertyDictionaryHelper.PROPERTY_FLOWCELL_DIRECTORY);
                baseDir += request.getCreateYear() + Constants.FILE_SEPARATOR + Request.getBaseRequestNumber(request.getNumber());

                if (this.getSecAdvisor().canUploadData(request)) {

                    parser.parse();

                    // Add new directories to the file system
                    for (String directoryName : parser.getNewDirectoryNames()) {
                        File dir = new File(baseDir + Constants.FILE_SEPARATOR + directoryName);
                        if (!dir.exists()) {
                            boolean success = dir.mkdirs();
                            if (!success) {
                                // File was not successfully created
                                throw new Exception("Unable to create directory " + directoryName);
                            }
                        }

                        // tim 01/28/2019 added (converted to json 8/16/2019)
                        this.jsonResult = Json.createObjectBuilder()
                                .add("result", "SUCCESS")
                                .build()
                                .toString();
                        setResponsePage(this.SUCCESS_JSP);
                        return this;                  // you can only have one...
                    }

                    // Rename files
                    for (String file : parser.getFilesToRenameMap().keySet()) {
                        String newFileName = parser.getFilesToRenameMap().get(file);
                        File f1 = new File(file);
                        File f2 = new File(newFileName);
                        boolean success = FileUtil.renameTo(f1, f2);
                        if (success) {
                            for (String directory : parser.getFileNameMap().keySet()) {
                                List<String> fileNames = parser.getFileNameMap().get(directory);
                                for (String parserFile : fileNames) {
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
                            String newExpFileName = newFileName.substring(newFileName.indexOf(baseRequestNumber)).replace("\\", Constants.FILE_SEPARATOR);
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
                    for (String folder : parser.getFoldersToRenameMap().keySet()) {
                        String newFolder = parser.getFoldersToRenameMap().get(folder);
                        File f2 = new File(baseDir + Constants.FILE_SEPARATOR + newFolder);
                        f2.mkdir();
                        for (Iterator<String> j = parser.getFileNameMap().keySet().iterator(); j.hasNext();) {
                            String directory = j.next();
                            if (directory.contains(folder + Constants.FILE_SEPARATOR)) {
                                parser.getFileNameMap().remove(directory);
                                j = parser.getFileNameMap().keySet().iterator();
                            }
                            if (directory.equals(folder)) {
                                List<String> fileNames = parser.getFileNameMap().get(directory);
                                parser.getFileNameMap().remove(directory);
                                parser.getFileNameMap().put(newFolder, fileNames);
                                j = parser.getFileNameMap().keySet().iterator();
                            }
                        }
                    }

                    // Move files to designated folder
                    for (String directoryName : parser.getFileNameMap().keySet()) {
                        List<String> fileNames = parser.getFileNameMap().get(directoryName);
                        String targetDirName;
                        directoryName = directoryName.replace("\\", Constants.FILE_SEPARATOR);
                        String[] path = directoryName.split(Pattern.quote(Constants.FILE_SEPARATOR));
                        StringBuilder directoryNameBuilder = new StringBuilder();
                        for (String s : path) {
                            if (!baseDir.contains(s)) {
                                directoryNameBuilder.append(s);
                                directoryNameBuilder.append(Constants.FILE_SEPARATOR);
                            }
                        }
                        directoryName = directoryNameBuilder.toString();

                        for (String fileName : fileNames) {
                            if (fileName.toUpperCase().contains(flowCellDir.toUpperCase())) {
                                continue;
                            }
                            File sourceFile = new File(fileName);

                            // if sourceFile does not exist, it was probably already moved/renamed when its
                            // parent directory was moved/renamed, so don't report the error
                            if (!sourceFile.exists()) {
                                continue;
                            }

                            if (baseDir.contains(directoryName) || baseDir.contains(directoryName.subSequence(0, directoryName.length() - 1))) {
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
                                continue;
                            }

                            if (!FileUtil.renameTo(sourceFile, destFile)) {
                                problemFiles.add(fileName);
                            }
                            /*
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
                             */
                        }
                    }

                    // Remove files from file system
                    if (filesToRemoveParser != null) {
                        for (String fileName : filesToRemoveParser.parseFilesToRemove()) {
                            File f = new File(fileName);

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
                                            if (sef.getIdExpFileRead1() != null && sef.getIdExpFileRead1().equals(ef.getIdExperimentFile())) {
                                                sef.setIdExpFileRead1(null);
                                            } else if (sef.getIdExpFileRead2() != null && sef.getIdExpFileRead2().equals(ef.getIdExperimentFile())) {
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
                        for (String fileName : directoryFilesToUnlink) {
                            String currentFileName = fileName.substring(fileName.indexOf(baseRequestNumber)).replace("\\", Constants.FILE_SEPARATOR);
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
                                    if (sef.getIdExpFileRead1() != null && sef.getIdExpFileRead1().equals(ef.getIdExperimentFile())) {
                                        sef.setIdExpFileRead1(null);
                                    } else if (sef.getIdExpFileRead2() != null && sef.getIdExpFileRead2().equals(ef.getIdExperimentFile())) {
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
                        for (int i = 0; i < filesToUnlink.size(); i++) {
                            JsonObject fileDescriptor = filesToUnlink.getJsonObject(i);

                            if (fileDescriptor.get("idExperimentFile") != null && !fileDescriptor.getString("idExperimentFile").equals("")) {
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
                                    } else if (sef.getIdExpFileRead2() != null && sef.getIdExpFileRead2().equals(idExperimentFile)) {
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
                    HashMap<String, ExperimentFile> expFileDictionary = new HashMap<>();
                    if (experimentFileList != null) {
                        JsonArray root = this.experimentFileList;
                        for (int i = 0; i < root.size(); i++) {
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

                    Map<String, List<JsonObject>> sampleGroup = new TreeMap<>();
                    if (linkedSampleFileList != null) {
                        JsonArray root = this.linkedSampleFileList;
                        for (int i = 0; i < root.size(); i++) {
                            JsonObject child = root.getJsonObject(i);
                            if (Util.getJsonStringSafeNonNull(child, "xmlNodeName").equals("Sample")) {
                                if (sampleGroup.containsKey("*||*")) {
                                    List<JsonObject> samples = sampleGroup.get("*||*");
                                    samples.add(child);
                                    sampleGroup.put("*||*", samples);
                                } else {
                                    List<JsonObject> samples = new ArrayList<>();
                                    samples.add(child);
                                    sampleGroup.put("*||*", samples);
                                }
                            } else if (Util.getJsonStringSafeNonNull(child, "xmlNodeName").equals("SampleGroup")) {
                                recurseAddSamples(child, sampleGroup, Util.getJsonStringSafeNonNull(child, "displayName"));
                            }
                        }
                    }

                    for (String displayName : sampleGroup.keySet()) {
                        int fileCount;
                        List<JsonObject> sampleNodes = sampleGroup.get(displayName);
                        for (JsonObject sampleNode : sampleNodes) {
                            Integer idSample = Integer.parseInt(Util.getJsonStringSafeNonNull(sampleNode, "idSample"));
                            Sample s = sess.load(Sample.class, idSample);
                            s.setGroupName(displayName);
                            sess.save(s);
                            int seqRunNumber = 0;

                            JsonArray sampChildren = getJsonChildren(sampleNode);
                            for (int k = 0; k < sampChildren.size(); k++) {
                                JsonObject seqRunNode = sampChildren.getJsonObject(k);
                                SampleExperimentFile sef = new SampleExperimentFile();
                                Integer idSampleExperimentFile = null;
                                if (seqRunNode.get("idSampleExperimentFile") != null) {
                                    idSampleExperimentFile = Integer.parseInt(seqRunNode.getString("idSampleExperimentFile"));
                                }

                                // if you find deleted sef that means the sef has been moved and let it be seen as a new sef
                                if (!deletedSefEntries.contains(idSampleExperimentFile)) {
                                    seqRunNumber = seqRunNumber + 1;
                                    if (idSampleExperimentFile != null) {
                                        sef = sess.load(SampleExperimentFile.class, idSampleExperimentFile);
                                    }
                                }

                                fileCount = 1;
                                JsonArray seqRunChildren = getJsonChildren(seqRunNode);
                                for (int l = 0; l < seqRunChildren.size(); l++) {
                                    JsonObject expFile = seqRunChildren.getJsonObject(l);
                                    ExperimentFile ef = new ExperimentFile();

                                    // If it is in the dictionary use it.
                                    String zipEntryName = Util.getJsonStringSafeNonNull(expFile, "zipEntryName");

                                    if (expFileDictionary.containsKey(zipEntryName.replace("\\", Constants.FILE_SEPARATOR))) {
                                        ef = expFileDictionary.get(zipEntryName.replace("\\", Constants.FILE_SEPARATOR));
                                    } else if (expFile.get("idExperimentFile") != null && !expFile.getString("idExperimentFile").equals("")) {
                                        ef = sess.get(ExperimentFile.class, Integer.parseInt(expFile.getString("idExperimentFile")));
                                        // The experiment file may have been deleted from above code
                                        if (ef == null) {
                                            continue;
                                        }
                                    } else {
                                        java.util.Date d = new java.util.Date();
                                        ef.setIdRequest(this.idRequest);
                                        ef.setFileName(zipEntryName.replace("\\", Constants.FILE_SEPARATOR));
                                        ef.setFileSize(new BigDecimal(Util.getJsonStringSafeNonNull(expFile, "fileSize")));
                                        ef.setCreateDate(new Date(d.getTime()));
                                        sess.save(ef);
                                    }
                                    if (sef != null && ef != null) {
                                        if (sef.getIdExpFileRead1() != null && ef.getIdExperimentFile() != null && fileCount == 1 && sef.getIdExpFileRead1().equals(ef.getIdExperimentFile())) {
                                            fileCount++;
                                            continue;
                                        } else if (sef.getIdExpFileRead2() != null && ef.getIdExperimentFile() != null && fileCount == 2 && sef.getIdExpFileRead2().equals(ef.getIdExperimentFile())) {
                                            fileCount++;
                                            continue;
                                        }
                                    }

                                    if (fileCount == 1) {
                                        sef.setIdSample(idSample);
                                        sef.setSeqRunNumber(seqRunNumber);
                                        sef.setIdExpFileRead1(ef.getIdExperimentFile());
                                        if (k == sampChildren.size() - 1) {
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

                    String problemFileWarning = "";
                    if (problemFiles.size() > 0) {
                        problemFileWarning = "Warning: Unable to move some files:\n" + Util.listToString(problemFiles, "\n", 5);
                    }

                    JsonObjectBuilder valueBuilder = Json.createObjectBuilder().add("result", "SUCCESS");
                    if (!problemFileWarning.equals("")) {
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

    private JsonArray getJsonChildren(JsonObject child) {
        String parentName = Util.getJsonStringSafeNonNull(child, "xmlNodeName");
        String childName = sampleHierarchy.get(parentName);
        JsonArray children;
        if (childName != null && child.get(childName) != null) {
            children = child.getJsonArray(childName);
        } else {
            children = Json.createArrayBuilder().build();
        }
        return children;
    }

    private void recurseAddSamples(JsonObject child, Map<String, List<JsonObject>> sampleGroup, String displayName) {
        JsonArray children = getJsonChildren(child);
        for (int i = 0; i < children.size(); i++) {
            JsonObject subChild = children.getJsonObject(i);
            if (Util.getJsonStringSafeNonNull(subChild, "xmlNodeName").equals("Sample")) {
                if (sampleGroup.containsKey(displayName)) {
                    List<JsonObject> samples = sampleGroup.get(displayName);
                    samples.add(subChild);
                    sampleGroup.put(displayName, samples);
                } else {
                    List<JsonObject> samples = new ArrayList<>();
                    samples.add(subChild);
                    sampleGroup.put(displayName, samples);
                }
            } else if (Util.getJsonStringSafeNonNull(subChild, "xmlNodeName").equals("SampleGroup")) {
                String name = Util.getJsonStringSafeNonNull(subChild, "displayName");
                recurseAddSamples(subChild, sampleGroup, displayName + Constants.FILE_SEPARATOR + name);
            }
        }
    }

    private void deleteDir(File f, String fileName) throws Exception {
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
        }
    }

}
