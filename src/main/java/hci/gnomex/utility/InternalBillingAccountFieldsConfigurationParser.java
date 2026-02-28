package hci.gnomex.utility;

import hci.framework.model.DetailObject;
import hci.gnomex.model.InternalAccountFieldsConfiguration;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;


public class InternalBillingAccountFieldsConfigurationParser extends DetailObject implements Serializable {
  
  /**
   * 
   */
  private static final long serialVersionUID = 1L;
  private Document                                       doc;
  private List<InternalAccountFieldsConfiguration>       configurations = new ArrayList<InternalAccountFieldsConfiguration>();
  
  
  public InternalBillingAccountFieldsConfigurationParser(Document doc) {
    this.doc = doc;
  }
  
  public void parse(Session sess) throws Exception{
    
    Element confNode = this.doc.getRootElement();
    
    

    for(Iterator i = confNode.getChildren("InternalAccountFieldsConfiguration").iterator(); i.hasNext();) {
      Element node = (Element)i.next();
      String idString = node.getAttributeValue("idInternalAccountFieldsConfiguration");
      InternalAccountFieldsConfiguration conf = new InternalAccountFieldsConfiguration();
      if (idString != null && idString.length() > 0) {
        conf = (InternalAccountFieldsConfiguration)sess.load(InternalAccountFieldsConfiguration.class, Integer.valueOf(idString));
      }
      conf.setDisplayName(node.getAttributeValue("displayName"));
      conf.setFieldName(node.getAttributeValue("fieldName"));
      conf.setInclude(node.getAttributeValue("include"));
      conf.setIsNumber(node.getAttributeValue("isNumber"));
      conf.setIsRequired(node.getAttributeValue("isRequired"));
      conf.setMaxLength(Integer.valueOf(node.getAttributeValue("maxLength")));
      conf.setMinLength(Integer.valueOf(node.getAttributeValue("minLength")));
      conf.setSortOrder(Integer.valueOf(node.getAttributeValue("sortOrder")));
      
      configurations.add(conf);
    }
  }
 
  
  public List<InternalAccountFieldsConfiguration> getConfigurations() {
    return configurations;
  }
}
