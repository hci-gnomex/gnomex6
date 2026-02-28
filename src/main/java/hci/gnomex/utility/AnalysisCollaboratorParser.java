package hci.gnomex.utility;

import hci.framework.model.DetailObject;
import org.hibernate.Session;

import javax.json.JsonArray;
import javax.json.JsonObject;
import java.io.Serializable;
import java.util.HashMap;


public class AnalysisCollaboratorParser extends DetailObject implements Serializable {
  
  protected JsonArray collaboratorList;
  protected HashMap     collaboratorUploadMap = new HashMap();
  protected HashMap     collaboratorUpdateMap = new HashMap();
  
  public AnalysisCollaboratorParser(JsonArray collaboratorList) {
    this.collaboratorList = collaboratorList;
  }
  
  public void parse(Session sess) throws Exception{
    
    for(int i = 0; i < collaboratorList.size(); i++) {
      JsonObject node = collaboratorList.getJsonObject(i);
      
      String idAppUserString = node.get("idAppUser") != null ? node.getString("idAppUser") : null;
      Integer idAppUser = Integer.valueOf(idAppUserString);
      String canUploadData = node.get("canUploadData") != null ? node.getString("canUploadData") : null;
      String canUpdate = node.get("canUpdate") != null ? node.getString("canUpdate") : null;

      if(idAppUser != null && canUploadData != null){
        collaboratorUploadMap.put(idAppUser, canUploadData);
      }
      if(idAppUser != null  && canUpdate != null){
        collaboratorUpdateMap.put(idAppUser, canUpdate);
      }

    }
  }

  
  public HashMap getCollaboratorUploadMap() {
    return collaboratorUploadMap;
  }
  
  public HashMap getCollaboratorUpdateMap() {
    return collaboratorUpdateMap;
  }

}
