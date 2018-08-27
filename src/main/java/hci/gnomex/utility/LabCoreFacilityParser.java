package hci.gnomex.utility;

import hci.framework.model.DetailObject;
import hci.gnomex.model.CoreFacility;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;

import javax.json.JsonArray;
import javax.json.JsonObject;


public class LabCoreFacilityParser extends DetailObject implements Serializable {
  
  protected Document  doc;
  protected JsonArray originalArray;
  protected Map        coreFacilityMap = new HashMap();

  public LabCoreFacilityParser(Document doc) {
    this.doc = doc;
    this.originalArray = null;
  }
  public LabCoreFacilityParser(JsonArray originalObject) {
    this.doc = null;
    this.originalArray = originalObject;
  }
  
  public void parse(Session sess) throws Exception{
    if (this.doc != null) {
      this.parseXML(sess);
    } else if (this.originalArray != null) {
      this.parseJSON(sess);
    } else {
      // Do nothing
    }
  }

  public void parseXML(Session sess) throws Exception{
    Element root = this.doc.getRootElement();

    for(Iterator i = root.getChildren("CoreFacility").iterator(); i.hasNext();) {
      Element node = (Element)i.next();

      String idCoreFacilityString = node.getAttributeValue("idCoreFacility");
      CoreFacility facility = (CoreFacility)sess.get(CoreFacility.class, new Integer(idCoreFacilityString));

      coreFacilityMap.put(facility.getIdCoreFacility(), facility);
    }
  }

  public void parseJSON(Session sess) throws Exception{
    for(int i = 0; i < originalArray.size(); i++) {
      JsonObject coreFacilityJson = originalArray.getJsonObject(i);

      String idCoreFacilityString = coreFacilityJson.getString("idCoreFacility");
      CoreFacility facility = sess.get(CoreFacility.class, new Integer(idCoreFacilityString));

      coreFacilityMap.put(facility.getIdCoreFacility(), facility);
    }
  }

  
  public Map getCoreFacilityMap() {
    return coreFacilityMap;
  }
}
