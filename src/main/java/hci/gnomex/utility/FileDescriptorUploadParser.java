package hci.gnomex.utility;

import hci.framework.model.DetailObject;
import hci.gnomex.constants.Constants;

import java.io.File;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;

public class FileDescriptorUploadParser extends DetailObject implements Serializable {

    protected JsonObject                    files;
    private JsonArray                       filesToRemove;
    private Map<String, List<String>>       fileNameMap = new LinkedHashMap<>();
    private List<String>                    newDirectoryNames = new ArrayList<>();
    private Map<String, String>             filesToRename = new LinkedHashMap<>();
    private Map<String, String>             foldersToRename = new LinkedHashMap<>();

    public FileDescriptorUploadParser(JsonObject files) {
        this.files = files;
    }

    public FileDescriptorUploadParser(JsonArray filesToRemoveList) {
        this.filesToRemove = filesToRemoveList;
    }

    public void parse() throws Exception {
        fileNameMap = new LinkedHashMap<>();
        newDirectoryNames = new ArrayList<>();

        JsonObject root = this.files;

        JsonArray requestDownloadList = root.get("RequestDownload") != null ? root.getJsonArray("RequestDownload") : Json.createArrayBuilder().build();

        for (int i = 0; i < requestDownloadList.size(); i++) {
            JsonObject folderObj = requestDownloadList.getJsonObject(i);
            String[] keyTokens = Util.getJsonStringSafeNonNull(folderObj, "key").split(Constants.DOWNLOAD_KEY_SEPARATOR);
            String directoryName = keyTokens[3];
            String newName = Util.getJsonStringSafeNonNull(folderObj, "newName");
            if (!newName.equals("")) {
                foldersToRename.put(directoryName, newName);
            }

            // Keep track of all new folders
            recurseDirectories(folderObj, null, "RequestDownload");
        }

        JsonArray fileDescriptorList = root.get("FileDescriptor") != null ? root.getJsonArray("FileDescriptor") : Json.createArrayBuilder().build();
        if (fileDescriptorList.size() > 0) {
            recurseDirectories(root, null, "Request");
        }
    }

    private void recurseDirectories(JsonObject folderObj, String parentDir, String objName) {
        String directoryName = null;
        if (objName.equals("RequestDownload")) {
            String[] keyTokens = Util.getJsonStringSafeNonNull(folderObj, "key").split(Constants.DOWNLOAD_KEY_SEPARATOR);
            directoryName = keyTokens[3];
        } else if (Util.getJsonStringSafeNonNull(folderObj, "type").equals("dir")) {
            directoryName = Util.getJsonStringSafeNonNull(folderObj, "displayName");
        } else if (objName.equals("Request")) {
            directoryName = "";
        }

        if ((directoryName == null || directoryName.equals("")) && !objName.equals("Request")) {
            return;
        }

        String qualifiedDir = parentDir != null && !parentDir.equals("") ? parentDir + File.separator + directoryName : directoryName;
        if (!qualifiedDir.equals("") && Util.getJsonStringSafeNonNull(folderObj, "isNew").equals("Y")) {
            newDirectoryNames.add(qualifiedDir);
        }

        // Get the files to be moved
        JsonArray fileDescriptorList = folderObj.get("FileDescriptor") != null ? folderObj.getJsonArray("FileDescriptor") : Json.createArrayBuilder().build();
        for (int i = 0; i < fileDescriptorList.size(); i++) {
            JsonObject fileObj = fileDescriptorList.getJsonObject(i);
            //Check to see if we need to rename anything
            String fileName = Util.getJsonStringSafeNonNull(fileObj, "fileName").replaceAll("\\\\", Constants.FILE_SEPARATOR);
            String displayName = Util.getJsonStringSafeNonNull(fileObj, "displayName");
            String newFileName = fileName.replace(fileName.substring(fileName.lastIndexOf(Constants.FILE_SEPARATOR) + 1), displayName);
            if (!newFileName.equals(fileName) && !fileName.equals("")) {
                filesToRename.put(fileName, newFileName);
            }

            // Ignore new directories here.
            if (Util.getJsonStringSafeNonNull(fileObj, "isNew").equals("Y")) {
                continue;
            }

            fileName = Util.getJsonStringSafeNonNull(fileObj, "fileName");

            List<String> fileNames = fileNameMap.get(qualifiedDir);
            if (fileNames == null) {
                fileNames = new ArrayList<>();
                qualifiedDir = qualifiedDir.replace("\\", Constants.FILE_SEPARATOR);
                fileNameMap.put(qualifiedDir, fileNames);
            }
            fileNames.add(fileName);
        }

        if (!objName.equals("Request")) {
            JsonArray requestDownloadList = folderObj.get("RequestDownload") != null ? folderObj.getJsonArray("RequestDownload") : Json.createArrayBuilder().build();
            for (int i = 0; i < requestDownloadList.size(); i++) {
                JsonObject childFolderObj = requestDownloadList.getJsonObject(i);
                if (!Util.getJsonStringSafeNonNull(childFolderObj, "newName").equals("")) {
                    foldersToRename.put(directoryName, Util.getJsonStringSafeNonNull(childFolderObj, "newName"));
                }
                recurseDirectories(childFolderObj, qualifiedDir, "RequestDownload");
            }
        }

        for (int i = 0; i < fileDescriptorList.size(); i++) {
            JsonObject childFolderObj = fileDescriptorList.getJsonObject(i);
            recurseDirectories(childFolderObj, qualifiedDir, "FileDescriptor");
        }
    }

    public List<String> getNewDirectoryNames() {
        return newDirectoryNames;
    }

    public List<String> parseFilesToRemove() {
        ArrayList<String> fileNames = new ArrayList<>();

        for (int i = 0; i < this.filesToRemove.size(); i++) {
            JsonObject fileObj = filesToRemove.getJsonObject(i);
            fileNames.add(Util.getJsonStringSafeNonNull(fileObj, "fileName"));
        }

        return fileNames;
    }

    public Map<String, List<String>> getFileNameMap() {
        return fileNameMap;
    }

    public Map<String, String> getFilesToRenameMap() {
        return filesToRename;
    }

    public Map<String, String> getFoldersToRenameMap() {
        return foldersToRename;
    }

}
