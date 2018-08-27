package hci.gnomex.utility;

import hci.framework.model.DetailObject;
import hci.gnomex.model.AppUser;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;

import javax.json.JsonArray;
import javax.json.JsonObject;


public class LabMemberParser extends DetailObject implements Serializable {

  protected Document   doc;
  protected JsonArray json;

  protected Map<Integer, AppUser>         appUserMap = new HashMap<Integer, AppUser>();
  protected Map<AppUser, String>  newMemberEmailList = new HashMap<AppUser, String>();

  public LabMemberParser(Document doc) {
    this.doc = doc;
    this.json = null;
  }

  public LabMemberParser(JsonArray json) {
    this.doc = null;
    this.json = json;
  }

  public void parse(Session session) throws Exception{
    if (doc != null) {
      this.parseXML(session);
    } else if (json != null) {
      this.parseJSON(session);
    } else {
      // Do nothing
    }
  }

  public void parseJSON(Session session) throws Exception{
    if (this.json != null) {
      for(int i = 0; i < this.json.size(); i++) {
        JsonObject member = this.json.getJsonObject(i);

        if (member.get("idAppUser") == null && member.get("AppUser") != null) {
          member = member.getJsonObject("AppUser");
        }

        if (member.get("idAppUser") != null) {
          String idAppUserString = member.getString("idAppUser");
          AppUser appUser = session.get(AppUser.class, new Integer(idAppUserString));

          appUserMap.put(appUser.getIdAppUser(), appUser);

          if(member.get("newMember") != null && member.getString("newMember").equals("Y")) {
            newMemberEmailList.put(appUser, appUser.getEmail());
          }
        }

      }
    }
  }

  public void parseXML(Session session) throws Exception{
    Element root = this.doc.getRootElement();

    for(Iterator i = root.getChildren("AppUser").iterator(); i.hasNext();) {
      Element node = (Element)i.next();

      String idAppUserString = node.getAttributeValue("idAppUser");
      AppUser appUser = session.get(AppUser.class, new Integer(idAppUserString));

      appUserMap.put(appUser.getIdAppUser(), appUser);

      if(node.getAttributeValue("newMember") != null && node.getAttributeValue("newMember").equals("Y")) {
        newMemberEmailList.put(appUser, appUser.getEmail());
      }
    }
  }

  public Map<Integer, AppUser> getAppUserMap() {
    return appUserMap;
  }

  public Map<AppUser, String> getNewMemberEmailList() {
    return newMemberEmailList;
  }
}
