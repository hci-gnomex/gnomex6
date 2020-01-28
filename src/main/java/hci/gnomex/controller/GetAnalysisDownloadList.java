package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.utility.Util;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.framework.model.FieldFormatter;
import hci.framework.utilities.XMLReflectException;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.Analysis;
import hci.gnomex.model.AnalysisFile;
import hci.gnomex.model.AnalysisGroupFilter;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.FileDescriptor;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.PropertyDictionaryHelper;

import java.io.File;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

import javax.servlet.http.HttpSession;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.hibernate.Hibernate;
import org.hibernate.Session;
import org.hibernate.query.NativeQuery;
import org.jdom.Document;
import org.jdom.Element;

public class GetAnalysisDownloadList extends GNomExCommand implements Serializable {

    private static Logger LOG = Logger.getLogger(GetAnalysisDownloadList.class);

    private String includeUploadStagingDir = "N";
    private String skipUploadStagingDirFiles = "N";

    private String serverName;
    private Integer idAnalysis;
    private String analysisNumber;
    private boolean autoCreate;

    public void validate() {
    }

    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
        AnalysisGroupFilter filter = new AnalysisGroupFilter();
        HashMap errors = this.loadDetailObject(request, filter);
        this.addInvalidFields(errors);

        if (Util.isParameterNonEmpty(request.getParameter("includeUploadStagingDir"))) {
            includeUploadStagingDir = request.getParameter("includeUploadStagingDir");
        }

        if (Util.isParameterNonEmpty(request.getParameter("skipUploadStagingDirFiles"))) {
            skipUploadStagingDirFiles = request.getParameter("skipUploadStagingDirFiles");
        }

        if (request.getParameter("idAnalysis") != null) {
            idAnalysis = new Integer(request.getParameter("idAnalysis"));
        }

        autoCreate = request.getParameter("autoCreate") != null && Util.isParameterTrue(request.getParameter("autoCreate"));

        if (Util.isParameterNonEmpty(request.getParameter("analysisNumber"))) {
            analysisNumber = request.getParameter("analysisNumber");
        }
        if (idAnalysis == null && analysisNumber == null) {
            this.addInvalidField("idAnalysis or analysisNumber", "Either idAnalysis or analysisNumber must be provided");
        }

        if (this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_ACCESS_ANY_OBJECT)
                && !filter.hasSufficientCriteria(this.getSecAdvisor())) {
            this.addInvalidField("filterRequired", "Please enter at least one search criterion.");
        }

        serverName = request.getServerName();
    }

    public Command execute() throws RollBackCommandException {
        long startTime = System.currentTimeMillis();
        String reqNumber = "";

        try {
            Session sess = HibernateSession.currentSession(this.getUsername(), "GetAnalysisDownloadList");

            String baseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null,
                    PropertyDictionaryHelper.PROPERTY_ANALYSIS_DIRECTORY);
            String use_altstr = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.USE_ALT_REPOSITORY);
            if (use_altstr != null && use_altstr.equalsIgnoreCase("yes")) {
                baseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null,
                        PropertyDictionaryHelper.ANALYSIS_DIRECTORY_ALT, this.getUsername());
            }

            Analysis a = null;
            if (idAnalysis != null && idAnalysis == 0) {
                a = new Analysis();
                a.setIdAnalysis(0);
            } else if (idAnalysis != null) {
                a = sess.get(Analysis.class, idAnalysis);
                Hibernate.initialize(a.getAnalysisGroups());
            } else {
                analysisNumber = analysisNumber.replaceAll("#", "");
                String buf = "SELECT a from Analysis as a where a.number = '" + analysisNumber.toUpperCase() + "'";
                List analyses = sess.createQuery(buf).list();
                if (analyses.size() > 0) {
                    a = (Analysis) analyses.get(0);
                    Hibernate.initialize(a.getAnalysisGroups());
                }
            }

            if (a == null) {
                this.addInvalidField("missingAnalysis", "Cannot find analysis idAnalysis=" + idAnalysis + " analysisNumber=" + analysisNumber);
            } else {
                if (!this.getSecAdvisor().canRead(a)) {
                    this.addInvalidField("permissionerror", "Insufficient permissions to access this analysis Group.");
                } else {
                    this.getSecAdvisor().flagPermissions(a);
                }
            }

            if (isValid()) {
                reqNumber = a.getNumber();

                FileDescriptor.setupFileType(1);
                Document doc = new Document(new Element("AnalysisDownloadList"));

                a.excludeMethodFromXML("getIdLab");
                a.excludeMethodFromXML("getLab");
                a.excludeMethodFromXML("getIdAppUser");
                a.excludeMethodFromXML("getIdAnalysisType");
                a.excludeMethodFromXML("getIdAnalysisProtocol");
                a.excludeMethodFromXML("getIdOrganism");
                a.excludeMethodFromXML("getCodeVisibility");
                a.excludeMethodFromXML("getIdInstitution");
                a.excludeMethodFromXML("getPrivacyExpirationDate");
                a.excludeMethodFromXML("getAnalysisGroups");
                a.excludeMethodFromXML("getExperimentItems");
                a.excludeMethodFromXML("getFiles");
                a.excludeMethodFromXML("getCollaborators");
                a.excludeMethodFromXML("getGenomeBuilds");
                a.excludeMethodFromXML("getTopics");
                Element aNode = a.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();
                aNode.setAttribute("displayName", a.getName());
                aNode.setAttribute("idLab", a.getIdLab().toString());
                aNode.setAttribute("number", a.getNumber());
                aNode.setAttribute("isSelected", "N");
                aNode.setAttribute("state", "unchecked");
                aNode.setAttribute("isEmpty", "N");

                // Hash the known analysis files
                Map<String, AnalysisFile> knownAnalysisFileMap = new HashMap<>(5000);
                for (Object file : a.getFiles()) {
                    AnalysisFile af = (AnalysisFile) file;
                    knownAnalysisFileMap.put(af.getQualifiedFileName(), af);
                }

                // Now add in the files that exist on the file server
                Map analysisMap = new TreeMap();
                Map directoryMap = new TreeMap();
                Map fileMap = new HashMap(5000);
                List<String> analysisNumbers = new ArrayList<>();

                GetExpandedAnalysisFileList.getFileNamesToDownload(baseDir, a.getKey(), analysisNumbers, analysisMap,
                        directoryMap, false);

                Map<Integer, Integer> dataTrackMap = GetAnalysisDownloadList.getDataTrackMap(sess, a.getIdAnalysis());

                for (String analysisNumber : analysisNumbers) {
                    List directoryKeys = (List) analysisMap.get(analysisNumber);

                    // For each directory of analysis
                    for (Object k : directoryKeys) {
                        String directoryKey = (String) k;
                        String[] dirTokens = directoryKey.split("-");
                        String directoryName = "";
                        if (dirTokens.length > 1) {
                            directoryName = dirTokens[1];
                        }
                        String viewType = Constants.DOWNLOAD_ANALYSIS_SINGLE_FILE_SERVLET + "?idAnalysis=" + a.getIdAnalysis();

                        // Show files uploads that are in the staging area.
                        if (includeUploadStagingDir.equals("Y")) {
                            String key = a.getKey(Constants.UPLOAD_STAGING_DIR);
                            addExpandedFileNodes(autoCreate, baseDir, aNode, aNode, analysisNumber, key,
                                    knownAnalysisFileMap, fileMap, dataTrackMap, sess);
                        } else {
                            // This will add the uploaded files to the file map so if they are not displayed,
                            // they will not be displayed because they are in the DB.
                            String key = a.getKey(Constants.UPLOAD_STAGING_DIR);
                            Element dummyNode = new Element("dummy");
                            addExpandedFileNodes(autoCreate, baseDir, aNode, dummyNode, analysisNumber, key,
                                    knownAnalysisFileMap, fileMap, dataTrackMap, sess);
                        }

                        List theFiles = (List) directoryMap.get(directoryKey);

                        // For each file in the directory
                        for (Object file : theFiles) {
                            FileDescriptor fd = (FileDescriptor) file;
                            AnalysisFile af = knownAnalysisFileMap.get(fd.getQualifiedFileName());
                            if (fd.getDisplayName().equals(Constants.UPLOAD_STAGING_DIR) && skipUploadStagingDirFiles.equals("Y")) {
                                continue;
                            }

                            Element fdNode = new Element("FileDescriptor");

                            if (af != null) {
                                fd.setUploadDate(af.getUploadDate());
                                fd.setIdFileString(af.getIdAnalysisFile().toString());
                                fd.setComments(af.getComments());
                                fd.setId(a.getIdAnalysis());
                            } else {
                                // if this is a data track type file add the analysisFile to the database so we don't have to have the front end
                                // call SaveAnalysisFiles with a potentially huge XML request
                                if (fd.getIsSupportedDataTrack().equals("Y") && autoCreate) {
                                    af = new AnalysisFile();
                                    af.setBaseFilePath(Util.getAnalysisDirectory(baseDir, a));
                                    af.setQualifiedFilePath(directoryName);
                                    af.setFileName(fd.getDisplayName());
                                    af.setIdAnalysis(a.getIdAnalysis());
                                    af.setFileSize(new BigDecimal(fd.getFileSize()));

                                    sess.save(af);
                                    sess.flush();

                                    knownAnalysisFileMap.put(af.getQualifiedFileName(), af);

                                    fd.setIdFileString(af.getIdAnalysisFile().toString());
                                    fd.setId(a.getIdAnalysis());
                                } else {
                                    // just pretend
                                    fd.setIdFileString("AnalysisFile-" + fd.getQualifiedFileName());
                                    fd.setId(a.getIdAnalysis());
                                }
                            }
                            fd.setQualifiedFilePath(directoryName);
                            fd.setDirectoryName(directoryName);
                            fd.setBaseFilePath(Util.getAnalysisDirectory(baseDir, a));
                            fd.setIdLab(a.getIdLab());

                            String comments = "";
                            if ((fd.getType() == null || !fd.getType().equals("dir")) && fd.getComments() != null) {
                                comments = fd.getComments();
                            }
                            fdNode.setAttribute("idAnalysis", a.getIdAnalysis() != null ? a.getIdAnalysis().toString() : "");
                            fdNode.setAttribute("dirty", "N");
                            fdNode.setAttribute("key", directoryName != null && directoryName.length() > 0 ? a.getKey(directoryName) : a.getKey());
                            fdNode.setAttribute("type", fd.getType() != null ? fd.getType() : "");
                            fdNode.setAttribute("displayName", fd.getDisplayName() != null ? fd.getDisplayName() : "");
                            fdNode.setAttribute("fileSize", String.valueOf(fd.getFileSize()));
                            fdNode.setAttribute("fileSizeText", fd.getFileSizeText());
                            fdNode.setAttribute("childFileSize", String.valueOf(fd.getFileSize()));
                            fdNode.setAttribute("fileName", fd.getFileName() != null ? fd.getFileName() : "");
                            fdNode.setAttribute("qualifiedFilePath", fd.getQualifiedFilePath() != null ? fd.getQualifiedFilePath() : "");
                            fdNode.setAttribute("baseFilePath", fd.getBaseFilePath() != null ? fd.getBaseFilePath() : "");
                            fdNode.setAttribute("comments", comments);
                            fdNode.setAttribute("lastModifyDate", fd.getLastModifyDate() != null ? fd.getLastModifyDate().toString() : "");
                            fdNode.setAttribute("zipEntryName", fd.getZipEntryName() != null ? fd.getZipEntryName() : "");
                            fdNode.setAttribute("number", fd.getNumber() != null ? fd.getNumber() : "");
                            fdNode.setAttribute("idAnalysisFileString", fd.getIdFileString());
                            fdNode.setAttribute("idLab", a.getIdLab() != null ? a.getIdLab().toString() : "");
                            fdNode.setAttribute("isSelected", "N");
                            fdNode.setAttribute("state", "unchecked");
                            fdNode.setAttribute("isSupportedDataTrack", fd.getIsSupportedDataTrack());

                            fdNode.setAttribute("UCSCViewer", fd.getIsUCSCViewerAllowed());
                            fdNode.setAttribute("IGVViewer", fd.getIsIGVViewerAllowed());
                            fdNode.setAttribute("BAMIOBIOViewer", fd.getIsBAMIOBIOViewerAllowed());
                            fdNode.setAttribute("URLLinkAllowed", fd.getIsURLLinkAllowed());
                            fdNode.setAttribute("GENEIOBIOViewer", fd.getIsGENELinkAllowed());
                            fdNode.setAttribute("PROTECTED", fd.isProtected());

                            fdNode.setAttribute("viewURL", fd.getViewURL(viewType));
                            setHasDataTrack(fd, dataTrackMap, fdNode);

                            aNode.addContent(fdNode);
                            recurseAddChildren(autoCreate, fdNode, fd, fileMap, knownAnalysisFileMap, dataTrackMap, sess);

                            fileMap.put(fd.getQualifiedFileName(), null);
                        }
                    }
                }

                doc.getRootElement().addContent(aNode);

                // add vcf, bam and ped info
                for (Element element : getVcfBamPedInfo(fileMap)) {
                    if (element != null) {
                        doc.getRootElement().addContent(element);
                    }
                }

                Util.setIcons(doc);
                Util.setFileDescriptorDisplay(doc);
                this.jsonResult = Util.convertXMLDocumentToJSONString(doc);
            }

            if (isValid()) {
                setResponsePage(this.SUCCESS_JSP);
            } else {
                setResponsePage(this.ERROR_JSP);
            }
        } catch (Exception e) {
            this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in GetAnalysisDownloadList ", e);
            throw new RollBackCommandException(e.getMessage());
        }

        Util.showTime(startTime, " GetAnalysisDownloadList (" + this.getUsername() + " - " + reqNumber + "), ");
        return this;
    }

    private static void setHasDataTrack(FileDescriptor fd, Map<Integer, Integer> dataTrackMap, Element fdNode) {
        if (StringUtils.isNumeric(fd.getIdFileString())) {
            if (dataTrackMap.containsKey(Integer.valueOf(fd.getIdFileString()))) {
                fdNode.setAttribute("hasDataTrack", "Y");
            } else {
                fdNode.setAttribute("hasDataTrack", "N");
            }
        } else {
            fdNode.setAttribute("hasDataTrack", "N");
        }
    }

    static void addExpandedFileNodes(boolean autocreate, String baseDir, Element analysisNode,
                                            Element analysisDownloadNode, String analysisNumber, String key, Map knownAnalysisFileMap,
                                            Map fileMap, Map<Integer, Integer> dataTrackMap, Session sess) throws XMLReflectException {
        //
        // Get expanded file list
        //
        Map analysisMap = new TreeMap();
        Map directoryMap = new TreeMap();

        if (!baseDir.endsWith(Constants.FILE_SEPARATOR) && !baseDir.endsWith("\\")) {
            baseDir += Constants.FILE_SEPARATOR;
        }

        List<String> analysisNumbers = new ArrayList<>();
        GetExpandedAnalysisFileList.getFileNamesToDownload(baseDir, key, analysisNumbers, analysisMap, directoryMap, true);
        List directoryKeys = (List) analysisMap.get(analysisNumber);

        String[] tokens = key.split("-");
        String createYear = tokens[0];

        for (Object dirKey : directoryKeys) {
            String directoryKey = (String) dirKey;
            String[] dirTokens = directoryKey.split("-");
            String directoryName = dirTokens[1];
            if (dirTokens.length > 2) {
                directoryName += Constants.FILE_SEPARATOR + dirTokens[2];
            }

            List theFiles = (List) directoryMap.get(directoryKey);

            // For each file in the directory
            if (theFiles != null && theFiles.size() > 0) {
                for (Object file : theFiles) {
                    FileDescriptor fd = (FileDescriptor) file;
                    fd.setQualifiedFilePath(directoryName);

                    AnalysisFile af = (AnalysisFile) knownAnalysisFileMap.get(fd.getQualifiedFileName());

                    if (af != null) {
                        fd.setUploadDate(af.getUploadDate());
                        fd.setIdFileString(af.getIdAnalysisFile().toString());
                        fd.setId(af.getIdAnalysis());
                        fd.setComments(af.getComments());
                        fd.setId(af.getIdAnalysis());
                    } else {
                        if (fd.getIsSupportedDataTrack().equals("Y") && autocreate) {
                            af = new AnalysisFile();
                            af.setBaseFilePath(fd.getBaseFilePath());
                            af.setQualifiedFilePath(fd.getQualifiedFilePath());
                            af.setFileName(fd.getDisplayName());
                            af.setIdAnalysis(fd.getId());
                            af.setFileSize(new BigDecimal(fd.getFileSize()));

                            sess.save(af);
                            sess.flush();

                            knownAnalysisFileMap.put(af.getQualifiedFileName(), af);

                            fd.setIdFileString(af.getIdAnalysisFile().toString());
                            fd.setId(af.getIdAnalysis());
                        } else {
                            // just pretend
                            fd.setIdFileString("AnalysisFile-" + fd.getQualifiedFileName());
                        }
                    }

                    String viewType = Constants.DOWNLOAD_ANALYSIS_SINGLE_FILE_SERVLET + "?idAnalysis=" + analysisNode.getAttributeValue("idAnalysis");

                    fd.setQualifiedFilePath(directoryName);
                    fd.setBaseFilePath(baseDir + createYear + Constants.FILE_SEPARATOR + analysisNumber);
                    fd.setId(analysisNode.getAttributeValue("idAnalysis") != null ? Integer.valueOf(analysisNode.getAttributeValue("idAnalysis")) : null);
                    String idLab = analysisNode.getAttributeValue("idLab");
                    fd.setIdLab(idLab == null || idLab.equals("") ? null : Integer.valueOf(idLab));
                    fd.excludeMethodFromXML("getChildren");

                    Element fdNode = fd.toXMLDocument(null, FieldFormatter.DATE_OUTPUT_ALTIO).getRootElement();
                    fdNode.setAttribute("isSelected", "N");
                    fdNode.setAttribute("state", "unchecked");
                    fdNode.setAttribute("isSupportedDataTrack", fd.getIsSupportedDataTrack());
                    fdNode.setAttribute("UCSCViewer", fd.getIsUCSCViewerAllowed());
                    fdNode.setAttribute("IGVViewer", fd.getIsIGVViewerAllowed());
                    fdNode.setAttribute("BAMIOBIOViewer", fd.getIsBAMIOBIOViewerAllowed());
                    fdNode.setAttribute("URLLinkAllowed", fd.getIsURLLinkAllowed());
                    fdNode.setAttribute("GENEIOBIOViewer", fd.getIsGENELinkAllowed());
                    fdNode.setAttribute("PROTECTED", fd.isProtected());
                    fdNode.setAttribute("viewURL", fd.getViewURL(viewType) != null ? fd.getViewURL(viewType) : "");

                    setHasDataTrack(fd, dataTrackMap, fdNode);
                    recurseAddChildren(autocreate, fdNode, fd, fileMap, knownAnalysisFileMap, dataTrackMap, sess);

                    analysisDownloadNode.addContent(fdNode);
                    analysisDownloadNode.setAttribute("isEmpty", "N");
                    analysisNode.setAttribute("isEmpty", "N");

                    fileMap.put(fd.getQualifiedFileName(), null);
                }
            } else {
                if (!analysisDownloadNode.getName().equals("Analysis")) {
                    analysisDownloadNode.setAttribute("isEmpty", "Y");
                }
            }
        }
    }

    // Builds map of idAnalysisFile entries that have data tracks for the analysis.
    static Map<Integer, Integer> getDataTrackMap(Session sess, Integer idAnalysis) {
        Map<Integer, Integer> dataTrackMap = new HashMap<>();

        String queryString = "SELECT dtf.idAnalysisFile from DataTrackFile as dtf, AnalysisFile as af where af.idAnalysis = :id and dtf.idAnalysisFile = af.idAnalysisFile";
        NativeQuery query = sess.createNativeQuery(queryString);
        query.setParameter("id", idAnalysis);
        for (Object o : query.list()) {
            dataTrackMap.put((Integer) o, (Integer) o);
        }

        return dataTrackMap;
    }

    private static void recurseAddChildren(boolean autocreate, Element fdNode, FileDescriptor fd, Map fileMap,
                                           Map knownFilesMap, Map<Integer, Integer> dataTrackMap, Session sess) throws XMLReflectException {
        if (fd.getChildren() == null || fd.getChildren().size() == 0) {
            if (fd.getType() != null && fd.getType().equals("dir")) {
                fdNode.setAttribute("isEmpty", "Y");
            }
        } else if (fd.getChildren() == null || fd.getChildren().size() > 0) {
            if (fd.getType() != null && fd.getType().equals("dir")) {
                fdNode.setAttribute("isEmpty", "N");

            }
        }

        for (Object o : fd.getChildren()) {
            FileDescriptor childFd = (FileDescriptor) o;

            childFd.setId(fd.getId());
            childFd.setQualifiedFilePath(fd.getQualifiedFilePath() != null && fd.getQualifiedFilePath().length() > 0 ? fd.getQualifiedFilePath() + Constants.FILE_SEPARATOR + fd.getDisplayName() : fd.getDisplayName());
            childFd.setBaseFilePath(fd.getBaseFilePath());
            childFd.setDirectoryName(childFd.getQualifiedFilePath());
            childFd.setIdLab(fd.getIdLab());

            AnalysisFile af = (AnalysisFile) knownFilesMap.get(childFd.getQualifiedFileName());

            if (af != null) {
                if ((fd.getType() == null || !fd.getType().equals("dir")) && af.getComments() != null) {
                    fdNode.setAttribute("comments", af.getComments());
                } else {
                    fdNode.setAttribute("comments", "");
                }
                childFd.setIdFileString(af.getIdAnalysisFile().toString());
                childFd.setUploadDate(af.getUploadDate());
                childFd.setComments(af.getComments());
                childFd.setId(af.getIdAnalysis());
            } else {
                if (childFd.getIsSupportedDataTrack().equals("Y") && autocreate) {
                    // create an AnalysisFile
                    af = new AnalysisFile();
                    af.setBaseFilePath(childFd.getBaseFilePath() != null ? childFd.getBaseFilePath() : "");
                    af.setQualifiedFilePath(childFd.getQualifiedFilePath() != null ? childFd.getQualifiedFilePath() : "");
                    af.setFileName(childFd.getDisplayName());

                    af.setIdAnalysis(childFd.getId());
                    af.setFileSize(new BigDecimal(fd.getFileSize()));

                    sess.save(af);
                    sess.flush();

                    // it is now known
                    knownFilesMap.put(af.getQualifiedFileName(), af);

                    childFd.setIdFileString(af.getIdAnalysisFile().toString());
                    childFd.setId(af.getIdAnalysis());
                } else {
                    childFd.setIdFileString("AnalysisFile-" + childFd.getQualifiedFileName());
                    childFd.setId(fd.getId());
                }
            }

            childFd.excludeMethodFromXML("getChildren");

            Element childFdNode = new Element("FileDescriptor");
            childFdNode.setAttribute("idAnalysis", childFd.getId() != null ? childFd.getId().toString() : "");
            childFdNode.setAttribute("dirty", "N");
            childFdNode.setAttribute("type", childFd.getType() != null ? childFd.getType() : "");
            String displayName = childFd.getDisplayName();
            if (displayName.contains(Constants.FILE_SEPARATOR)) {
                displayName = displayName.substring(displayName.lastIndexOf(Constants.FILE_SEPARATOR) + 1);
            }

            childFdNode.setAttribute("displayName", displayName != null ? displayName : "");
            childFdNode.setAttribute("fileSize", Long.valueOf(childFd.getFileSize()).toString());
            childFdNode.setAttribute("fileSizeText", childFd.getFileSizeText() != null ? childFd.getFileSizeText() : "");
            childFdNode.setAttribute("childFileSize", Long.valueOf(childFd.getChildFileSize()).toString());
            childFdNode.setAttribute("fileName", childFd.getFileName() != null ? childFd.getFileName() : "");
            childFdNode.setAttribute("filePathName", childFd.getQualifiedFileName() != null ? childFd.getQualifiedFileName() : "");
            childFdNode.setAttribute("qualifiedFileName", childFd.getQualifiedFileName() != null ? childFd.getQualifiedFileName() : "");
            childFdNode.setAttribute("qualifiedFilePath", childFd.getQualifiedFilePath() != null ? childFd.getQualifiedFilePath() : "");
            childFdNode.setAttribute("baseFilePath", childFd.getBaseFilePath() != null ? childFd.getBaseFilePath() : "");
            childFdNode.setAttribute("comments", childFd.getComments() != null ? childFd.getComments() : "");
            childFdNode.setAttribute("lastModifyDateDisplay", childFd.getLastModifyDateDisplay() != null ? childFd.getLastModifyDateDisplay() : "");
            childFdNode.setAttribute("uploadDate", childFd.getUploadDate() != null ? childFd.formatDate(childFd.getUploadDate(), DATE_OUTPUT_SQL) : "");
            childFdNode.setAttribute("zipEntryName", childFd.getZipEntryName() != null ? childFd.getZipEntryName() : "");
            childFdNode.setAttribute("number", childFd.getNumber() != null ? childFd.getNumber() : "");
            childFdNode.setAttribute("analysisNumber", childFd.getNumber() != null ? childFd.getNumber() : "");
            childFdNode.setAttribute("idAnalysisFileString", childFd.getIdFileString() != null ? childFd.getIdFileString() : "");
            childFdNode.setAttribute("idLab", childFd.getIdLab() != null ? childFd.getIdLab().toString() : "");
            childFdNode.setAttribute("isSupportedDataTrack", childFd.getIsSupportedDataTrack());
            childFdNode.setAttribute("UCSCViewer", childFd.getIsUCSCViewerAllowed());
            childFdNode.setAttribute("IGVViewer", childFd.getIsIGVViewerAllowed());
            childFdNode.setAttribute("BAMIOBIOViewer", childFd.getIsBAMIOBIOViewerAllowed());
            childFdNode.setAttribute("URLLinkAllowed", childFd.getIsURLLinkAllowed());
            childFdNode.setAttribute("GENEIOBIOViewer", childFd.getIsGENELinkAllowed());
            childFdNode.setAttribute("PROTECTED", childFd.isProtected());

            String viewType = "";
            if (childFd.getId() != null) {
                viewType = Constants.DOWNLOAD_ANALYSIS_SINGLE_FILE_SERVLET + "?idAnalysis=" + childFd.getId().toString();
            }
            childFdNode.setAttribute("viewURL", childFd.getViewURL(viewType) != null ? childFd.getViewURL(viewType) : "");
            childFdNode.setAttribute("isSelected", "N");
            childFdNode.setAttribute("state", "unchecked");

            setHasDataTrack(childFd, dataTrackMap, childFdNode);

            fdNode.addContent(childFdNode);
            fileMap.put(childFd.getQualifiedFileName(), null);
            if (childFd.getChildren() != null && childFd.getChildren().size() > 0) {
                recurseAddChildren(autocreate, childFdNode, childFd, fileMap, knownFilesMap, dataTrackMap, sess);
            } else {
                if (childFd.getType() != null && childFd.getType().equals("dir")) {
                    childFdNode.setAttribute("isEmpty", "Y");
                }
            }
        }
    }

    static Set<String> getAnalysisDownloadFolders(String baseDir, String analysisNumber, String createYear) {
        Set<String> folders = new TreeSet<>();
        String directoryName = baseDir + createYear + Constants.FILE_SEPARATOR + analysisNumber;
        File fd = new File(directoryName);

        if (fd.isDirectory()) {
            String[] fileList = fd.list();
            for (String fileListElement : fileList) {
                String fileName = directoryName + Constants.FILE_SEPARATOR + fileListElement;
                File f1 = new File(fileName);
                if (f1.isDirectory()) {
                    folders.add(fileListElement);
                }
            }
        }
        return folders;
    }

    private static Element[] getVcfBamPedInfo(Map fileMap) {
        Element[] vbpInfo = new Element[3];

        Element vcfInfo = new Element("VCFInfo");
        Element bamInfo = new Element("BAMInfo");
        Element pedInfo = new Element("PEDInfo");

        for (Object key : fileMap.keySet()) {
            String lkey = ((String) key).toLowerCase();
            if (lkey.endsWith(".vcf.gz")) {
                Element viPath = new Element("VCFPath");
                viPath.setAttribute("path", (String) key);
                vcfInfo.addContent(viPath);
            } else if (lkey.endsWith(".bam") || (lkey.endsWith(".cram") )) {
                Element biPath = new Element("BAMPath");
                biPath.setAttribute("path", (String) key);
                bamInfo.addContent(biPath);
            } else if (lkey.endsWith(".ped")) {
                Element piPath = new Element("PEDPath");
                piPath.setAttribute("path", (String) key);
                pedInfo.addContent(piPath);
            }
        }

        vbpInfo[0] = vcfInfo;
        vbpInfo[1] = bamInfo;
        vbpInfo[2] = pedInfo;

        return vbpInfo;
    }

}
