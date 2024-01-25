package hci.gnomex.utility;

import hci.framework.model.DetailObject;
import hci.gnomex.model.Application;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;


public class ApplicationParser extends DetailObject implements Serializable {
  
  protected Document    doc;
  protected Map         codeApplicationMap = new HashMap();
  
  public ApplicationParser(Document doc) {
    this.doc = doc;
 
  }
  
  public void parse(Session sess) throws Exception{
    
    Element root = this.doc.getRootElement();


      for (Object o : root.getChildren("Application")) {
          Element node = (Element) o;

          String code = node.getAttributeValue("codeApplication");
          Application mc = (Application) sess.load(Application.class, code);

          codeApplicationMap.put(code, mc);

      }
  }

  
  public Map getCodeApplicationMap() {
    return codeApplicationMap;
  }
}
