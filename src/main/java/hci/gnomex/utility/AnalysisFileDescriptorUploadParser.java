package hci.gnomex.utility;


import hci.framework.model.DetailObject;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import hci.gnomex.constants.Constants;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;


public class AnalysisFileDescriptorUploadParser extends DetailObject implements Serializable {

    protected JsonArray filesToRemove;
    protected JsonObject files;

    protected Map fileNameMap = new LinkedHashMap();
    protected List newDirectoryNames = new ArrayList();
    protected Map fileIdMap = new LinkedHashMap();
    protected Map filesToDeleteMap = new LinkedHashMap();
    protected Map filesToRename = new LinkedHashMap();
    protected Map childrenToMoveMap = new LinkedHashMap();

    public AnalysisFileDescriptorUploadParser(JsonArray filesToRemove) {
        this.filesToRemove = filesToRemove;

    }
    public AnalysisFileDescriptorUploadParser(JsonObject files) {
        this.files = files;

    }


    public void parse() throws Exception {

        JsonObject root = this.files;
        recurseDirectories(root, null);
    }

    private void recurseDirectories(JsonObject folderNode, String parentDir) {

        String directoryName = null;

        if (parentDir == null && folderNode.get("key") != null) {
            String[] fileParts = folderNode.getString("key").split("-");
            directoryName = fileParts[2];
        } else if(folderNode.get("type") != null && folderNode.getString("type").equals("dir")) {
                directoryName = folderNode.getString("displayName");
        }

        if (directoryName == null) {
            return;
        }

        // Create the folderNode's folder if needed
        String qualifiedDir = parentDir != null ? parentDir + Constants.FILE_SEPARATOR + directoryName : directoryName;

        if (folderNode.get("isNew") != null && folderNode.getString("isNew").equals("Y")) {
                newDirectoryNames.add(qualifiedDir);
        }

        JsonArray fileDescriptors = folderNode.get("FileDescriptor") != null ? folderNode.getJsonArray("FileDescriptor") : Json.createArrayBuilder().build();

        for (int i = 0; i < fileDescriptors.size(); i++ ) {
            JsonObject childFile =  fileDescriptors.getJsonObject(i);
            String fileName = childFile.get("fileName") != null ? childFile.getString("fileName") : "" ;
            String displayName = childFile.get("displayName") != null ? childFile.getString("displayName") : "" ;
            if (fileName == null) {
                continue;
            }
            fileName = fileName.replace("\\", Constants.FILE_SEPARATOR);
            String newFileName = fileName.replace(fileName.substring(fileName.lastIndexOf(Constants.FILE_SEPARATOR) + 1), displayName);
            String fileIdString = childFile.get("idAnalysisFileString") != null ? childFile.getString("idAnalysisFileString") : "" ;
            String qualifiedFilePath = childFile.get("qualifiedFilePath") != null ? childFile.getString("qualifiedFilePath") : "" ;
            String isProtected = childFile.get("PROTECTED") != null ? childFile.getString("PROTECTED") : "" ;

            // just in case the front end let something through it shouldn't have
            if (isProtected == null || isProtected.equalsIgnoreCase("Y")) {
                continue;
            }

            String[] contents = {newFileName, fileIdString, qualifiedFilePath, displayName};
            if (!newFileName.equals(fileName) && !fileName.equals("")) {
                // these are files that were explicitly renamed
                filesToRename.put(fileName, contents);
                if (childFile.get("type") != null && childFile.getString("type").equals("dir")) {
                    renameDirectoryChildren(childFile, newFileName);
                }
            }

            String childFileIdString = childFile.get("idAnalysisFileString") != null ? childFile.getString("idAnalysisFileString") : "" ;

            // Ignore new directories here.
            if (childFile.get("isNew") != null && childFile.getString("isNew").equals("Y")) {
                continue;
            }

            String childFileName = childFile.get("fileName") != null ? childFile.getString("fileName") : "" ;
            if (childFileName.equals("")) {
                newDirectoryNames.add(qualifiedDir + Constants.FILE_SEPARATOR + displayName);
                continue;
            }

            // 03/22/2017 tim -- I see no need to add anything to fileIdMap or fileNameMap if there isn't any changes to the file
            //                   If it wasn't renamed or moved somewhere we are just wasting time

            if (childFile.get("type") != null && !childFile.getString("type").equals("dir")) {
                fileIdMap.put(childFileName, childFileIdString);
            }

            List fileNames = (List) fileNameMap.get(qualifiedDir);


            if (fileNames == null) {
                fileNames = new ArrayList();
                fileNameMap.put(qualifiedDir, fileNames);
            }

            fileNames.add(childFileName);

        } // end of for


        for (int i = 0; i < fileDescriptors.size(); i++  ) {
            JsonObject childFolderNode = fileDescriptors.getJsonObject(i);
            recurseDirectories(childFolderNode, qualifiedDir);
        }

    }


    public List getNewDirectoryNames() {
        return newDirectoryNames;
    }

    private void renameDirectoryChildren(JsonObject fileNode, String newName) {
        JsonArray childrenFiles =  fileNode.get("FileDescriptor") != null ? fileNode.getJsonArray("FileDescriptor") : Json.createArrayBuilder().build();
        for (int i = 0; i < childrenFiles.size(); i++) {
            JsonObject cf = childrenFiles.getJsonObject(i);

            String displayName = cf.get("displayName") != null ? cf.getString("displayName") : "";
            String fileName = (cf.get("fileName") != null ? cf.getString("fileName") : "").replace("\\", Constants.FILE_SEPARATOR);
            String newFileName = newName + Constants.FILE_SEPARATOR + displayName;
            String fileIdString = cf.get("idAnalysisFileString") != null ? cf.getString("idAnalysisFileString") : "";
            String qualifiedFilePath = newName.substring(newName.lastIndexOf(Constants.FILE_SEPARATOR) + 1);
            String isProtected =  cf.get("PROTECTED") != null ? cf.getString("PROTECTED") : "";
            if (isProtected == null || isProtected.equalsIgnoreCase("Y")) {
                continue;
            }

            String[] contents = {newFileName, fileIdString, qualifiedFilePath, displayName};

            childrenToMoveMap.put(fileName, contents);

            JsonArray grandCF = cf.get("FileDescriptor") != null ? cf.getJsonArray("FileDescriptor") : Json.createArrayBuilder().build();

            if (grandCF.size() > 0) {
                renameDirectoryChildren(cf, newFileName);
            }
        }

    }

    public void parseFilesToRemove() throws Exception {

        for (int i = 0; i < filesToRemove.size(); i++ ) {
            JsonObject rmFile = filesToRemove.getJsonObject(i);

            String fileIdString = rmFile.get("idAnalysisFileString") != null ?  rmFile.getString("idAnalysisFileString") : "";
            String fileName = rmFile.get("fileName") != null ?  rmFile.getString("fileName") : "";

            String isProtected = rmFile.get("PROTECTED") != null ?  rmFile.getString("PROTECTED") : "";
            if (isProtected == null || isProtected.equalsIgnoreCase("Y")) {
                continue;
            }

            List fileNames = (List) filesToDeleteMap.get(fileIdString);

            if (fileNames == null) {
                fileNames = new ArrayList();
                filesToDeleteMap.put(fileIdString, fileNames);
            }

            fileNames.add(fileName);

        }
    }

    public Map getFileNameMap() {
        return fileNameMap;
    }

    public Map getFileIdMap() {
        return fileIdMap;
    }

    public Map getFilesToDeleteMap() {
        return filesToDeleteMap;
    }

    public Map getFilesToRenameMap() {
        return filesToRename;
    }

    public Map getChildrenToMoveMap() {
        return childrenToMoveMap;
    }

}
