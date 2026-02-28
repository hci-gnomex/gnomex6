package hci.gnomex.utility;

import hci.framework.model.DetailObject;
import hci.gnomex.model.Step;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

import org.hibernate.Session;

import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonValue;

public class PriceCategoryStepParser extends DetailObject implements Serializable {

    private JsonArray array;
    private Map<String, Step> stepMap = new HashMap<>();

    public PriceCategoryStepParser(JsonArray a) {
        this.array = a;
    }

    public void parse(Session sess) throws Exception {
        for (int i = 0; i < this.array.size(); i++) {
            JsonObject stepObject = this.array.getJsonObject(i);
            JsonValue codeStepVal = stepObject.get("codeStep");
            if (codeStepVal != null) {
                Step step = sess.get(Step.class, stepObject.getString("codeStep"));
                this.stepMap.put(step.getCodeStep(), step);
            }
        }
    }

    public Map<String, Step> getStepMap() {
        return stepMap;
    }
}
