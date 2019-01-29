package hci.gnomex.utility;


import hci.framework.model.DetailObject;
import hci.gnomex.constants.Constants;

import java.io.File;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.jdom.Document;
import org.jdom.Element;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;


public class FileDescriptorUploadParser extends DetailObject implements Serializable {
  
  protected JsonObject files;
  protected JsonArray  filesToRemove;
  protected Map        fileNameMap = new LinkedHashMap();
  protected List       newDirectoryNames = new ArrayList();
  protected Map        filesToRename = new LinkedHashMap();
  protected Map        foldersToRename = new LinkedHashMap();
  
  public FileDescriptorUploadParser(JsonObject files) {
    this.files = files;
  }
  public FileDescriptorUploadParser(JsonArray filesToRemoveList){
    this.filesToRemove = filesToRemoveList;
  }

  
  public void parse() throws Exception{
    fileNameMap = new LinkedHashMap();
    newDirectoryNames = new ArrayList();
    
    JsonObject root = this.files;


    JsonArray requestDownloadList = root.get("RequestDownload") != null ? root.getJsonArray("RequestDownload") : Json.createArrayBuilder().build();
    
    for(int i = 0; i < requestDownloadList.size(); i++) {
      JsonObject folderObj = requestDownloadList.getJsonObject(i);
      String requestNumber = folderObj.get("requestNumber") != null ? folderObj.getString("requestNumber") : "";
      String []keyTokens = (folderObj.get("key") != null ? folderObj.getString("key") : "").split(Constants.DOWNLOAD_KEY_SEPARATOR);
      String directoryName = keyTokens[3];
      String newName = folderObj.get("newName") != null ? folderObj.getString("newName") : "";
      if(!newName.equals("")){
        foldersToRename.put(directoryName, newName);
      }

      // Keep track of all new folders
      recurseDirectories(folderObj, null, "RequestDownload");
    }

    JsonArray fileDescriptorList = root.get("FileDescriptor") != null ? root.getJsonArray("FileDescriptor") : Json.createArrayBuilder().build();
    if(fileDescriptorList.size() > 0){
      recurseDirectories(root , null, "Request");
    }

 }
  
  private void recurseDirectories(JsonObject folderObj, String parentDir, String objName) {
    String directoryName = null;
    if (objName.equals("RequestDownload")) {
      String []keyTokens = (folderObj.get("key") != null ? folderObj.getString("key") : "" ).split(Constants.DOWNLOAD_KEY_SEPARATOR);
      directoryName = keyTokens[3];
      
    } else if (folderObj.get("type") != null && folderObj.getString("type").equals("dir")) {
      directoryName = folderObj.get("displayName") != null ? folderObj.getString("displayName") : "";
    }
    else if(objName.equals("Request")){
      directoryName = folderObj.get("displayName") != null ? folderObj.getString("displayName") : "";
      directoryName = directoryName.substring(0, directoryName.indexOf("R") + 1); //Strip any revision number off
    }
    
    if (directoryName == null) {
      return;
    }

    String qualifiedDir = parentDir != null ? parentDir  + File.separator + directoryName : directoryName;
    if (folderObj.get("isNew") != null && folderObj.getString("isNew").equals("Y")) {
      newDirectoryNames.add(qualifiedDir);
    }
    
    // Get the files to be moved
    JsonArray fileDescriptorList = folderObj.get("FileDescriptor") != null ? folderObj.getJsonArray("FileDescriptor") : Json.createArrayBuilder().build();
    for(int i = 0; i < fileDescriptorList.size(); i++) {
      JsonObject fileObj = fileDescriptorList.getJsonObject(i);
      //Check to see if we need to rename anything
      String fileName = (fileObj.get("fileName") != null ? fileObj.getString("fileName") : "") .replaceAll("\\\\", Constants.FILE_SEPARATOR);
      String displayName = fileObj.get("displayName") != null ? fileObj.getString("displayName") : "";
      String newFileName = fileName.replace(fileName.substring(fileName.lastIndexOf(Constants.FILE_SEPARATOR) + 1), displayName);
      if(!newFileName.equals(fileName) && !fileName.equals("")){
        filesToRename.put(fileName, newFileName);
      }

      // Ignore new directories here.
      if (fileObj.get("isNew") != null && fileObj.getString("isNew").equals("Y")) {
        continue;
      }
      
      fileName = fileObj.get("fileName") != null ? fileObj.getString("fileName") : "";
      
      List fileNames = (List)fileNameMap.get(qualifiedDir);
      if (fileNames == null) {
        fileNames = new ArrayList();
        qualifiedDir = qualifiedDir.replace("\\", Constants.FILE_SEPARATOR);
        fileNameMap.put(qualifiedDir, fileNames);
      }
      fileNames.add(fileName);
    }

    if(!objName.equals("Request")){
      JsonArray requestDownloadList = folderObj.get("RequestDownload") != null ? folderObj.getJsonArray("RequestDownload") : Json.createArrayBuilder().build();
      for(int i = 0; i < requestDownloadList.size(); i++) {
        JsonObject childFolderObj = requestDownloadList.getJsonObject(i);
        if(childFolderObj.get("newName") != null && !childFolderObj.getString("newName").equals("")){
          foldersToRename.put(directoryName, childFolderObj.get("newName"));
        }
        recurseDirectories(childFolderObj, qualifiedDir, "RequestDownload");
      }
    }
    
    for(int i = 0; i < fileDescriptorList.size(); i++) {
      JsonObject childFolderObj = fileDescriptorList.getJsonObject(i);
      recurseDirectories(childFolderObj, qualifiedDir, "FileDescriptor");
    }
    
  }
  
  public List getNewDirectoryNames() {
    return newDirectoryNames;
  }
  
  public List parseFilesToRemove() throws Exception {
    ArrayList fileNames = new ArrayList();
    

    for(int i = 0; i < this.filesToRemove.size();  i++) {
       JsonObject fileObj = filesToRemove.getJsonObject(i);
//      System.out.println("ready to remove  fileName" + node.getAttributeValue("fileName"));
      fileNames.add(fileObj.get("fileName") != null ? fileObj.getString("fileName") : "");
    }

    return fileNames;
    
  }
  
  public Map getFileNameMap() {
    return fileNameMap;
  }
  
  public Map getFilesToRenameMap(){
    return filesToRename;
  }
  
  public Map getFoldersToRenameMap(){
    return foldersToRename;
  }


}
