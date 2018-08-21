package hci.gnomex.utility;

import hci.framework.model.DetailObject;
import hci.gnomex.model.Institution;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;

import javax.json.JsonArray;
import javax.json.JsonObject;


public class LabInstitutionParser extends DetailObject implements Serializable {

  protected Document   doc;
  protected JsonArray originalObject;
  protected Map        institutionMap = new HashMap();


  public LabInstitutionParser(Document doc) {
    this.doc = doc;
    this.originalObject = null;
  }
  public LabInstitutionParser(JsonArray originalObject) {
    this.doc = null;
    this.originalObject = originalObject;
  }

  public void parse(Session sess) throws Exception {
    if (doc != null) {
      this.parseXML(sess);
    } else if (originalObject != null) {
      this.parseJSON(sess);
    } else {
      // Do nothing.
    }
  }

  public void parseJSON(Session session) throws Exception {
    if (originalObject != null) {
      for (int i = 0; i < originalObject.size(); i++) {
        if (originalObject.getJsonObject(i).get("idInstitution") != null) {
          String      idInstitutionString = originalObject.getJsonObject(i).getString("idInstitution");
          Institution institution         = session.get(Institution.class, new Integer(idInstitutionString));

          institutionMap.put(institution.getIdInstitution(), institution);
        }
      }
    }
  }

  public void parseXML(Session sess) throws Exception {
    Element root = this.doc.getRootElement();

    for(Iterator i = root.getChildren("Institution").iterator(); i.hasNext();) {
      Element node = (Element)i.next();

      String idInstitutionString = node.getAttributeValue("idInstitution");
      Institution institution = (Institution)sess.get(Institution.class, new Integer(idInstitutionString));

      institutionMap.put(institution.getIdInstitution(), institution);
    }
  }

  public Map getInstitutionMap() {
    return institutionMap;
  }
}
