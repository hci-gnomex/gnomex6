package hci.gnomex.utility;

import hci.framework.model.DetailObject;
import hci.gnomex.model.AnalysisGroup;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

import org.hibernate.Session;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;


public class AnalysisGroupParser extends DetailObject implements Serializable {
  
  protected JsonArray    agArray;
  protected Map         analysisGroupMap = new HashMap();
  
  public AnalysisGroupParser(JsonArray agArray) {
    this.agArray = agArray;
 
  }
  
  public void parse(Session sess) throws Exception{


    if(		agArray.size() == 1 &&
            agArray.getJsonObject(0).getString("idAnalysisGroup").equals("") &&
            agArray.getJsonObject(0).getString("name").equals("")
    	) {    	
    		return;	//we have a Lab with no AnalysisGroups. Leave the analysisGroupMap empty.    	
    }else{    
	    for(int i = 0; i < agArray.size(); i++) {
	      JsonObject node = agArray.getJsonObject(i);
	      
	      String idAnalysisGroupString = node.get("idAnalysisGroup") != null ? node.getString("idAnalysisGroup") : "";
	
	      AnalysisGroup ag = (AnalysisGroup)sess.load(AnalysisGroup.class, new Integer(idAnalysisGroupString));	      
	      
	      analysisGroupMap.put(idAnalysisGroupString, ag);
	    }
    }
  }

  
  public Map getAnalysisGroupMap() {
    return analysisGroupMap;
  }
}
