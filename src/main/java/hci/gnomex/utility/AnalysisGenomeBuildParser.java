package hci.gnomex.utility;

import hci.framework.model.DetailObject;
import org.hibernate.Session;

import javax.json.JsonArray;
import javax.json.JsonObject;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;


public class AnalysisGenomeBuildParser extends DetailObject implements Serializable {
  
  protected JsonArray gbArray;
  protected List        idGenomeBuildList = new ArrayList();
  
  public AnalysisGenomeBuildParser(JsonArray gbArray) {
    this.gbArray = gbArray;
 
  }
  
  public void parse(Session sess) throws Exception{

    for(int i = 0; i < gbArray.size(); i++) {
      JsonObject node = gbArray.getJsonObject(i);
      
      String idGenomeBuildString = node.get("idGenomeBuild") != null ? node.getString("idGenomeBuild") : null;
      Integer idGenomeBuild = Integer.valueOf(idGenomeBuildString);

//      System.out.println ("[parse AnalysisGenomeBuildParser] idGenomeBuild: " + idGenomeBuild);
      idGenomeBuildList.add(idGenomeBuild);
    }
  }

  
  public List getIdGenomeBuildList() {
    return idGenomeBuildList;
  }

}
