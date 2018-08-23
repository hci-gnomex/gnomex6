package hci.gnomex.utility;

import hci.framework.model.DetailObject;

import java.io.Serializable;
import java.util.*;

import javax.json.JsonArray;

public class PriceSheetCategoryParser extends DetailObject implements Serializable {

    private JsonArray array;
    private Set<String> codeRequestCategories = new HashSet<>();

    public PriceSheetCategoryParser(JsonArray arr) {
        this.array = arr;
    }

    public void parse() throws Exception {
        for (int i = 0; i < this.array.size(); i++) {
            this.codeRequestCategories.add(this.array.getJsonObject(i).getString("codeRequestCategory"));
        }
    }

    public Set<String> getCodeRequestCategories() {
        return this.codeRequestCategories;
    }

}
