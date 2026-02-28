package hci.gnomex.utility;

import hci.framework.model.DetailObject;
import org.hibernate.Session;

import javax.json.JsonArray;
import javax.json.JsonObject;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;


public class AnalysisHybParser extends DetailObject implements Serializable {
  
  protected JsonArray    hybsList;
  protected List        idHybridizationList = new ArrayList();
  protected HashMap     idRequestMap = new HashMap();
  
  public AnalysisHybParser(JsonArray hybsList) {
    this.hybsList = hybsList;
 
  }
  
  public void parse(Session sess) throws Exception{
    
    JsonArray root = this.hybsList;
    
    
    for(int i = 0; i < root.size(); i++ ) {
      JsonObject node = root.getJsonObject(i);
      
      String idHybridizationString = node.get("idHybridization") != null ? node.getString("idHybridization") : null;
      Integer idHybridization = Integer.valueOf(idHybridizationString);
      
      String idRequestString = node.get("idRequest") != null ? node.getString("idRequest") : null;
      Integer idRequest =  Integer.valueOf(idRequestString);
      if(idHybridization != null && idRequest != null){
        idHybridizationList.add(idHybridization);
        idRequestMap.put(idHybridization,idRequest);
      }
    }
  }

  
  public List getIdHybridizations() {
    return idHybridizationList;
  }
  
  public Integer getIdRequest(Integer idHybridization) {
    return (Integer)idRequestMap.get(idHybridization);
  }
}
