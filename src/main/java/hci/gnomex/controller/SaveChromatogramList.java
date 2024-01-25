package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.ChromatogramParser;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.io.StringReader;

public class SaveChromatogramList extends GNomExCommand implements Serializable {
  
  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(SaveChromatogramList.class);
  
  private String                       chromatogramXMLString;
  private Document                     chromatogramDoc;
  private ChromatogramParser           parser;
  
  
  private String                serverName = null;
  private String                launchAppURL;
  private String                appURL;
  
  public void validate() {
  }
  
  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
    
    if (request.getParameter("chromatogramXMLString") != null && !request.getParameter("chromatogramXMLString").equals("")) {
      chromatogramXMLString = "<ChromatogramList>" + request.getParameter("chromatogramXMLString") + "</ChromatogramList>";
      
      StringReader reader = new StringReader(chromatogramXMLString);
      try {
        SAXBuilder sax = new SAXBuilder();
        chromatogramDoc = sax.build(reader);
        parser = new ChromatogramParser(chromatogramDoc);
      } catch (JDOMException je ) {
         this.addInvalidField( "ChromatogramXMLString", "Invalid xml");
        this.errorDetails = Util.GNLOG(LOG,"Cannot parse chromatogramXMLString", je);
      }
    }

    
    serverName = request.getServerName();
    
    try {
      launchAppURL = this.getLaunchAppURL(request);      
      appURL = this.getAppURL(request);      
    } catch (Exception e) {
      LOG.warn("Cannot get launch app URL in SaveChromatogramList", e);
    }


  }

  public Command execute() throws RollBackCommandException {
    
    if (chromatogramXMLString != null) {
      try {
        Session sess = HibernateSession.currentSession(this.getUsername());

        if (this.getSecurityAdvisor().hasPermission( SecurityAdvisor.CAN_MANAGE_DNA_SEQ_CORE )) {


          parser.parse(sess, this.getSecAdvisor(), launchAppURL, appURL, serverName);

          sess.flush();

          this.xmlResult = "<SUCCESS/>";

          setResponsePage(this.SUCCESS_JSP);          

        } else {
          this.addInvalidField("Insufficient permissions", "Insufficient permission to save chromatogram list.");
          setResponsePage(this.ERROR_JSP);
        }
        
      }catch (Exception e){
        LOG.error("An exception has occurred in SaveChromatogramList ", e);

        throw new RollBackCommandException(e.getMessage());

      }finally {
        try {
          //closeHibernateSession;        
        } catch(Exception e){
        LOG.error("Error", e);
      }
      }
      
    } else {
      this.xmlResult = "<SUCCESS/>";
      setResponsePage(this.SUCCESS_JSP);
    }
    
    return this;
  }
  
  

}
