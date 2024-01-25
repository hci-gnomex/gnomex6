package hci.gnomex.utility;

import hci.gnomex.model.Analysis;
import hci.gnomex.security.SecurityAdvisor;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;


public class AnalysisVisibilityParser implements Serializable {
  
  protected Document   doc;
  protected List       analysisList = new ArrayList();
  
  public AnalysisVisibilityParser(Document doc) {
    this.doc = doc;
 
  }
  
  public void parse(Session sess, SecurityAdvisor secAdvisor, Logger log) throws Exception{
    
    Element rootNode = this.doc.getRootElement();
    
    
    for(Iterator i = rootNode.getChildren("Analysis").iterator(); i.hasNext();) {
      Element aNode = (Element)i.next();
      
      String idAnalysis           = aNode.getAttributeValue("idAnalysis");
      String codeVisibility       = aNode.getAttributeValue("codeVisibility");
      
      Analysis analysis = (Analysis)sess.load(Analysis.class, Integer.valueOf(idAnalysis));
      
      if (secAdvisor.canUpdate(analysis, SecurityAdvisor.PROFILE_OBJECT_VISIBILITY)) {
        if (codeVisibility == null || codeVisibility.equals("")) {
          throw new Exception("Visibility is required for analysis " + analysis.getNumber());
        }
        analysis.setCodeVisibility(codeVisibility);          
        analysisList.add(analysis);
      }
      else {
        // Skip saving requests that user does not have permission to save
        log.warn("Bypassing update of visibility on analysis group " + analysis.getNumber() + 
            ".  User " + secAdvisor.getUserLastName() + ", " + secAdvisor.getUserFirstName() + 
            " does not have permission to update visibility.");
      }

    }
    
   
  }
  
   
  public List getAnalysiss() {
    return analysisList;
  }
  
  
  public void resetIsDirty() {
    Element rootNode = this.doc.getRootElement();

      for (Object o : rootNode.getChildren("Analysis")) {
          Element workItemNode = (Element) o;
          workItemNode.setAttribute("isDirty", "N");
      }
  }


  


}
