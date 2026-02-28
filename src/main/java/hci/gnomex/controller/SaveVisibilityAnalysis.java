package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.utility.AnalysisVisibilityParser;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;
import org.jdom.output.XMLOutputter;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.io.StringReader;


public class SaveVisibilityAnalysis extends GNomExCommand implements Serializable {
  
 
  
  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(SaveVisibilityAnalysis.class);
  
  private String                       visibilityXMLString;
  private Document                     visibilityDoc;
  private AnalysisVisibilityParser      parser;
  
  
  
  public void validate() {
  }
  
  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
    
    
    if (request.getParameter("visibilityXMLString") != null && !request.getParameter("visibilityXMLString").equals("")) {
      visibilityXMLString = "<AnalysisVisibilityList>" + request.getParameter("visibilityXMLString") + "</AnalysisVisibilityList>";

      StringReader reader = new StringReader(visibilityXMLString);
      try {
        SAXBuilder sax = new SAXBuilder();
        visibilityDoc = sax.build(reader);
        parser = new AnalysisVisibilityParser(visibilityDoc);
      } catch (JDOMException je ) {
        this.addInvalidField( "visibilityXMLString", "Invalid visibilityXMLString");
        this.errorDetails = Util.GNLOG(LOG,"Cannot parse visibilityXMLString", je);
      }
    }
    
    
    

  }

  public Command execute() throws RollBackCommandException {
    
    try {
      Session sess = HibernateSession.currentSession(this.getUsername());

      


      if (visibilityXMLString != null) {
        parser.parse(sess, this.getSecAdvisor(), LOG);
      }

      sess.flush();

      if (visibilityXMLString != null) {
        parser.resetIsDirty();
        XMLOutputter out = new org.jdom.output.XMLOutputter();
        this.xmlResult = out.outputString(visibilityDoc);
      } else {
        this.xmlResult = "<SUCCESS/>";
        setResponsePage(this.SUCCESS_JSP);
      }

      setResponsePage(this.SUCCESS_JSP);


    } catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in SaveVisibilityAnalysis ", e);
      throw new RollBackCommandException(e.getMessage());

    }
      
    
    return this;
  }
  

  
  
  

}
