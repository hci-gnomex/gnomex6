package hci.gnomex.controller;

import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.*;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.servlet.http.HttpSession;
import java.io.File;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Set;
import java.util.TreeSet;


public class SaveDataTrack extends GNomExCommand implements Serializable {

    // the static field for logging in Log4J
    private static Logger LOG = Logger.getLogger(SaveDataTrack.class);

    private DataTrack load;
    private DataTrack dataTrack;
    private boolean isNewDataTrack = false;
    private Integer idDataTrackFolder;
    private JsonArray collaboratorsJSON;
    private JsonArray filesToRemoveJSON;
    private JsonArray propertiesJSON;
    private String serverName;
    private String baseDir;

    public void validate() {
    }

    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

        load = new DataTrack();
        HashMap errors = this.loadDetailObject(request, load);
        this.addInvalidFields(errors);

        String idDataTrackFolderString = request.getParameter("idDataTrackFolder");
        if (Util.isParameterNonEmpty(idDataTrackFolderString)) {
            idDataTrackFolder = Integer.valueOf(idDataTrackFolderString);
        }

        // Make sure that name doesn't have forward slashes (/).
        if (load.getName().contains(Constants.FILE_SEPARATOR) || load.getName().contains("&")) {
            this.addInvalidField("namechar", "The name cannnot contain any characters / or &.");
        }

        try {
            this.collaboratorsJSON = Util.readJSONArray(request, "collaboratorsJSON");
        } catch (Exception e) {
            this.addInvalidField("collaboratorsJSON", "Invalid collaboratorsJSON");
            this.errorDetails = Util.GNLOG(LOG, "Cannot parse collaboratorsJSON", e);
        }

        try {
            this.filesToRemoveJSON = Util.readJSONArray(request, "filesToRemoveJSON");
        } catch (Exception e) {
            this.addInvalidField("filesToRemoveJSON", "Invalid filesToRemoveJSON");
            this.errorDetails = Util.GNLOG(LOG, "Cannot parse filesToRemoveJSON", e);
        }

        try {
            this.propertiesJSON = Util.readJSONArray(request, "propertiesJSON");
        } catch (Exception e) {
            this.addInvalidField("propertiesJSON", "Invalid propertiesJSON");
            this.errorDetails = Util.GNLOG(LOG, "Cannot parse propertiesJSON", e);
        }

        serverName = request.getServerName();
    }

    public Command execute() throws RollBackCommandException {

        try {
            Session sess = HibernateSession.currentSession(this.getUsername());
            baseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null, PropertyDictionaryHelper.PROPERTY_DATATRACK_DIRECTORY);

            this.initializeDataTrack(sess);

            if (!this.getSecAdvisor().canUpdate(dataTrack)) {
                throw new GNomExRollbackException("Insufficient permissions", true, "Insufficient permission to save data track");
            }

            if (dataTrack.getIdLab() != null) {
                Lab lab = sess.load(Lab.class, dataTrack.getIdLab());
                if (!lab.validateVisibilityInLab(dataTrack)) {
                    throw new GNomExRollbackException("Institution", true, "You must select an institution when visibility is Institution");
                }
                sess.save(dataTrack);
                sess.flush();
            } else {
                throw new GNomExRollbackException("Lab", true, "You must select a lab");
            }

            if (this.isValid()) {
                // Set collaborators
                if (this.collaboratorsJSON.size() > 0) {
                    TreeSet<AppUser> collaborators = new TreeSet<>(new AppUserComparator());
                    for (int i = 0; i < this.collaboratorsJSON.size(); i++) {
                        JsonObject userNode = this.collaboratorsJSON.getJsonObject(i);
                        Integer idAppUser = Integer.parseInt(userNode.getString("idAppUser"));
                        AppUser user = sess.load(AppUser.class, idAppUser);
                        collaborators.add(user);
                    }
                    dataTrack.setCollaborators(collaborators);

                    sess.flush();
                }

                // Remove dataTrack files that are stored directly in the data track folder.
                // Unlink dataTrack files that are associated with analysis file(s).
                HashMap<Integer, Integer> dataTrackFilesToRemove = new HashMap<>();
                if (this.filesToRemoveJSON.size() > 0) {
                    for (int i = 0; i < this.filesToRemoveJSON.size(); i++) {
                        JsonObject fileNode = this.filesToRemoveJSON.getJsonObject(i);
                        if (fileNode.getString("idDataTrackFile").equals("")) {
                            File file = new File(fileNode.getString("url"));
                            if (!file.delete()) {
                                LOG.warn("Unable remove dataTrack file " + file.getName() + " for dataTrack " + dataTrack.getName());
                            }
                        } else {
                            dataTrackFilesToRemove.put(Integer.valueOf(fileNode.getString("idDataTrackFile")), Integer.valueOf(fileNode.getString("idDataTrackFile")));
                        }
                    }
                }

                // Delete dataTrackFile objects, unlinking from analysis file
                if (!isNewDataTrack) {
                    TreeSet<DataTrackFile> dataTrackFiles = new TreeSet<>(new DataTrackFileComparator());
                    dataTrackFiles.addAll((Set<DataTrackFile>) dataTrack.getDataTrackFiles());
                    dataTrack.setDataTrackFiles(dataTrackFiles);
                    sess.flush();
                    for (Integer idDataTrackFile : dataTrackFilesToRemove.keySet()) {
                        DataTrackFile dtf = sess.load(DataTrackFile.class, idDataTrackFile);
                        sess.delete(dtf);
                    }
                    sess.flush();
                }

                // Delete dataTrack properties
                if (this.propertiesJSON.size() > 0) {
                    for (PropertyEntry pe : (Set<PropertyEntry>) dataTrack.getPropertyEntries()) {
                        boolean found = false;
                        for (int i = 0; i < this.propertiesJSON.size(); i++) {
                            JsonObject propNode = this.propertiesJSON.getJsonObject(i);
                            String idPropertyEntry = Util.getJsonStringSafe(propNode, "idPropertyEntry");
                            if (idPropertyEntry != null && !idPropertyEntry.equals("")) {
                                if (pe.getIdPropertyEntry().equals(Integer.valueOf(idPropertyEntry))) {
                                    found = true;
                                    break;
                                }
                            }
                        }
                        if (!found) {
                            // delete dataTrack property values
                            for (PropertyEntryValue av : (Set<PropertyEntryValue>) pe.getValues()) {
                                sess.delete(av);
                            }
                            // delete dataTrack property
                            sess.delete(pe);
                            sess.flush();
                        }
                    }
                    sess.flush();
                    // Add dataTrack properties
                    for (int i = 0; i < this.propertiesJSON.size(); i++) {
                        JsonObject node = this.propertiesJSON.getJsonObject(i);
                        // Adding dataTracks
                        String idPropertyEntry = Util.getJsonStringSafe(node, "idPropertyEntry");

                        PropertyEntry pe;
                        if (idPropertyEntry == null || idPropertyEntry.equals("")) {
                            pe = new PropertyEntry();
                            pe.setIdProperty(Integer.valueOf(node.getString("idProperty")));
                        } else {
                            pe = sess.get(PropertyEntry.class, Integer.valueOf(idPropertyEntry));
                        }
                        pe.setValue(node.getString("value"));
                        pe.setIdDataTrack(dataTrack.getIdDataTrack());

                        if (idPropertyEntry == null || idPropertyEntry.equals("")) {
                            sess.save(pe);
                            sess.flush();
                        }

                        // Remove PropertyEntryValues
                        if (pe.getValues() != null) {
                            for (PropertyEntryValue av : (Set<PropertyEntryValue>) pe.getValues()) {
                                boolean found = false;
                                if (node.get("PropertyEntryValue") != null) {
                                    JsonArray propertyEntryValuesArray = node.getJsonArray("PropertyEntryValue");
                                    for (int i2 = 0; i2 < propertyEntryValuesArray.size(); i2++) {
                                        JsonObject propertyEntryValue = propertyEntryValuesArray.getJsonObject(i2);
                                        String idPropertyEntryValue = Util.getJsonStringSafe(propertyEntryValue, "idPropertyEntryValue");
                                        if (idPropertyEntryValue != null && !idPropertyEntryValue.equals("")) {
                                            if (av.getIdPropertyEntryValue().equals(Integer.valueOf(idPropertyEntryValue))) {
                                                found = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                                if (!found) {
                                    sess.delete(av);
                                }
                            }
                            sess.flush();
                        }

                        // Add and update PropertyEntryValues
                        if (node.get("PropertyEntryValue") != null) {
                            JsonArray propertyEntryValuesArray = node.getJsonArray("PropertyEntryValue");
                            for (int i2 = 0; i2 < propertyEntryValuesArray.size(); i2++) {
                                JsonObject propertyEntryValue = propertyEntryValuesArray.getJsonObject(i2);
                                String idPropertyEntryValue = Util.getJsonStringSafe(propertyEntryValue, "idPropertyEntryValue");
                                String value = Util.getJsonStringSafe(propertyEntryValue, "value");
                                PropertyEntryValue av;
                                // Ignore 'blank' url value
                                if (value == null || value.equals("") || value.equals("Enter URL here...")) {
                                    continue;
                                }
                                if (idPropertyEntryValue == null || idPropertyEntryValue.equals("")) {
                                    av = new PropertyEntryValue();
                                    av.setIdPropertyEntry(pe.getIdPropertyEntry());
                                } else {
                                    av = sess.load(PropertyEntryValue.class, Integer.valueOf(idPropertyEntryValue));
                                }
                                av.setValue(value);

                                if (idPropertyEntryValue == null || idPropertyEntryValue.equals("")) {
                                    sess.save(av);
                                }
                            }
                        }
                        sess.flush();

                        StringBuilder optionValue = new StringBuilder();
                        TreeSet<PropertyOption> options = new TreeSet<>(new PropertyOptionComparator());
                        if (node.get("PropertyOption") != null) {
                            JsonArray propertyOptionsArray = node.getJsonArray("PropertyOption");
                            for (int i2 = 0; i2 < propertyOptionsArray.size(); i2++) {
                                JsonObject propertyOption = propertyOptionsArray.getJsonObject(i2);
                                Integer idPropertyOption = Integer.parseInt(propertyOption.getString("idPropertyOption"));
                                String selected = Util.getJsonStringSafe(propertyOption, "selected");
                                if (selected != null && selected.equals("Y")) {
                                    PropertyOption option = sess.load(PropertyOption.class, idPropertyOption);
                                    options.add(option);
                                    if (optionValue.length() > 0) {
                                        optionValue.append(",");
                                    }
                                    optionValue.append(option.getOption());
                                }
                            }
                        }
                        pe.setOptions(options);
                        if (options.size() > 0) {
                            pe.setValue(optionValue.toString());
                        }
                        sess.flush();
                    }
                }
                this.jsonResult = Json.createObjectBuilder()
                        .add("result", "SUCCESS")
                        .add("idDataTrack", "" + dataTrack.getIdDataTrack())
                        .add("idDataTrackFolder", idDataTrackFolder != null ? idDataTrackFolder.toString() : "")
                        .build().toString();

                setResponsePage(this.SUCCESS_JSP);
            }
        } catch (Exception e) {
            this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in SaveDataTrack ", e);
            throw new GNomExRollbackException(e.getMessage(), true, e.getMessage());
        }

        return this;
    }

    private void initializeDataTrack(Session sess) throws Exception {

        if (load.getIdDataTrack() == null || load.getIdDataTrack() == 0) {
            createNewDataTrack(sess, load, idDataTrackFolder);
            sendNotification(dataTrack, sess, Notification.NEW_STATE, Notification.SOURCE_TYPE_USER, Notification.TYPE_DATATRACK);
            sendNotification(dataTrack, sess, Notification.NEW_STATE, Notification.SOURCE_TYPE_ADMIN, Notification.TYPE_DATATRACK);
            isNewDataTrack = true;
        } else {
            dataTrack = sess.load(DataTrack.class, load.getIdDataTrack());
            dataTrack.setName(load.getName());
            dataTrack.setDescription(load.getDescription());
            dataTrack.setSummary(load.getSummary());
            dataTrack.setCodeVisibility(load.getCodeVisibility());
            if (dataTrack.getCodeVisibility() != null && dataTrack.getCodeVisibility().equals(Visibility.VISIBLE_TO_INSTITUTION_MEMBERS)) {
                dataTrack.setIdInstitution(load.getIdInstitution());
            } else {
                dataTrack.setIdInstitution(null);
            }
            dataTrack.setIdLab(load.getIdLab());
            dataTrack.setIdAppUser(load.getIdAppUser());
            sess.flush();
            sendNotification(dataTrack, sess, Notification.EXISTING_STATE, Notification.SOURCE_TYPE_USER, Notification.TYPE_DATATRACK);
            sendNotification(dataTrack, sess, Notification.EXISTING_STATE, Notification.SOURCE_TYPE_ADMIN, Notification.TYPE_DATATRACK);
        }
    }

    private void createNewDataTrack(Session sess, DataTrack load, Integer idDataTrackFolder) throws Exception {
        dataTrack = load;
        dataTrack.setCreatedBy(this.getSecAdvisor().getUID());
        dataTrack.setCreateDate(new java.sql.Date(System.currentTimeMillis()));
        dataTrack.setIsLoaded("N");

        // TODO:  GenoPub - Need base directory property
        dataTrack.setDataPath(baseDir);

        // Only set ownership if this is not an admin
        if (!getSecAdvisor().hasPermission(SecurityAdvisor.CAN_ACCESS_ANY_OBJECT)) {
            dataTrack.setIdAppUser(getSecAdvisor().getIdAppUser());
        }

        sess.save(dataTrack);
        sess.flush();

        // Get the dataTrack grouping this dataTrack is in.
        DataTrackFolder folder;
        if (idDataTrackFolder == null) {
            // If this is a root dataTrack, find the default root dataTrack
            // folder for the genome build.
            GenomeBuild gb = sess.load(GenomeBuild.class, load.getIdGenomeBuild());
            folder = gb.getRootDataTrackFolder();
            if (folder == null) {
                throw new Exception("Cannot find root dataTrack folder for " + gb.getGenomeBuildName());
            }
        } else {
            // Otherwise, find the dataTrack grouping passed in as a request parameter.
            folder = sess.load(DataTrackFolder.class, idDataTrackFolder);
        }

        // Add the dataTrack to the dataTrack grouping
        Set<DataTrack> newDataTracks = new TreeSet<>(new DataTrackComparator());
        newDataTracks.addAll((Set<DataTrack>) folder.getDataTracks());
        newDataTracks.add(dataTrack);
        folder.setDataTracks(newDataTracks);

        // Assign a file directory name
        dataTrack.setFileName("DT" + dataTrack.getIdDataTrack());

        sess.flush();
    }

}
