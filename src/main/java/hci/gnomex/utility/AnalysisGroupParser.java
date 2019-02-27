package hci.gnomex.utility;

import hci.framework.model.DetailObject;
import hci.gnomex.model.AnalysisGroup;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

import org.hibernate.Session;

import javax.json.JsonArray;
import javax.json.JsonObject;

public class AnalysisGroupParser extends DetailObject implements Serializable {

    private JsonArray agArray;
    private Map<String, AnalysisGroup> analysisGroupMap = new HashMap<>();

    public AnalysisGroupParser(JsonArray agArray) {
        this.agArray = agArray;
    }

    public void parse(Session sess) throws Exception {
        if (agArray.size() != 1 || !agArray.getJsonObject(0).getString("idAnalysisGroup").equals("") || !agArray.getJsonObject(0).getString("name").equals("")) {
            for (int i = 0; i < agArray.size(); i++) {
                JsonObject node = agArray.getJsonObject(i);
                String idAnalysisGroupString = Util.getJsonStringSafeNonNull(node, "idAnalysisGroup");
                AnalysisGroup ag = sess.load(AnalysisGroup.class, new Integer(idAnalysisGroupString));
                analysisGroupMap.put(idAnalysisGroupString, ag);
            }
        }
    }

    public Map<String, AnalysisGroup> getAnalysisGroupMap() {
        return analysisGroupMap;
    }
}
