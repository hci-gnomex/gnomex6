package hci.gnomex.utility;

import hci.framework.model.DetailObject;
import hci.gnomex.model.PriceCriteria;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

import org.hibernate.Session;

import javax.json.JsonArray;
import javax.json.JsonObject;

public class PriceCriteriaParser extends DetailObject implements Serializable {

    protected JsonArray array;
    private Map<String, PriceCriteria> priceCriteriaMap = new HashMap<>();

    public PriceCriteriaParser(JsonArray arr) {
        this.array = arr;
    }

    public void parse(Session sess) throws Exception {
        for (int i = 0; i < this.array.size(); i++) {
            JsonObject node = this.array.getJsonObject(i);
            String idPriceCriteriaString = node.getString("idPriceCriteria");
            PriceCriteria priceCriteria;
            if (idPriceCriteriaString.startsWith("PriceCriteria")) {
                priceCriteria = new PriceCriteria();
            } else {
                priceCriteria = sess.load(PriceCriteria.class, new Integer(idPriceCriteriaString));
            }
            this.initializePriceCriteria(node, priceCriteria);
            priceCriteriaMap.put(idPriceCriteriaString, priceCriteria);
        }
    }

    private void initializePriceCriteria(JsonObject n, PriceCriteria priceCriteria) throws Exception {
        if (n.get("filter1") != null && !n.getString("filter1").equals("")) {
            priceCriteria.setFilter1(n.getString("filter1"));
        }
        if (n.get("filter2") != null && !n.getString("filter2").equals("")) {
            priceCriteria.setFilter2(n.getString("filter2"));
        }
    }

    public Map<String, PriceCriteria> getPriceCriteriaMap() {
        return this.priceCriteriaMap;
    }
}
