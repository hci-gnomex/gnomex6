package hci.gnomex.utility;

import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;
import org.xml.sax.EntityResolver;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import java.io.File;
import java.io.IOException;
import java.io.StringReader;
import java.util.Iterator;
import java.util.Properties;

public class BatchMailer  {
  
  private String                   specifiedOrionPath = "";
  
  private TomcatCatalinaProperties catalinaProperties;
  
  public BatchMailer() {
    specifiedOrionPath = "";
  }
  
  public BatchMailer(String orionPath) {
    specifiedOrionPath = orionPath;
  }
  
  public Properties getMailProperties() throws Exception {
    // Set up mail properties
    boolean foundHost = false;
    Properties mailProps = new Properties();
    
    String filePath = "../../";
    if(!specifiedOrionPath.isEmpty()) {
      filePath = specifiedOrionPath;
    }
    filePath = filePath + "config/server.xml";
    File serverFile = new File(filePath);
    
    if(serverFile.exists()) {
      try {
        SAXBuilder builder = new SAXBuilder();
        // Just in case the orion site is down, we don't want 
        // to fail because the dtd is unreachable 
        builder.setEntityResolver(new DummyEntityRes());
        
        org.jdom.Document doc = builder.build(serverFile);
        Element root = doc.getRootElement();
        
        Element mailElement = root.getChild("mail-session");
        if(mailElement != null) {
          if (mailElement.getAttributeValue("smtp-host") != null) {
            foundHost = true;
            mailProps.put("mail.smtp.host", mailElement.getAttributeValue("smtp-host"));
            Iterator i = mailElement.getChildren("property").iterator();
            while (i.hasNext()) {
              Element e = (Element) i.next();
              if (e.getAttributeValue("name") != null && e.getAttributeValue("value") != null) {
                mailProps.put(e.getAttributeValue("name"), e.getAttributeValue("value"));
              }
            }
          } 
        }
      } catch (JDOMException e) {
        System.out.println( e.toString() );

      }
    } else {
      // Check for context.xml if we are running under apache tomcat
      catalinaProperties = new TomcatCatalinaProperties(TomcatCatalinaProperties.getCatalinaPropertiesPathFromScripts(specifiedOrionPath));
      String contextFilePath = "../";
      if (specifiedOrionPath.length() > 0) {
        contextFilePath = specifiedOrionPath; 
      }
      File contextFile = new File(contextFilePath + "META-INF/context.xml");
      if (contextFile.exists()) {
        try {
          SAXBuilder builder = new SAXBuilder();
          builder.setEntityResolver(new DummyEntityRes());
          
          org.jdom.Document doc = builder.build(contextFile);
          Element root = doc.getRootElement();
          
          Iterator i = root.getChildren("Resource").iterator();
          while (i.hasNext()) {
            Element mailElement = (Element)i.next();
            if(mailElement != null) {
              if (mailElement.getAttributeValue("mail.smtp.host") != null) {
                foundHost = true;
                mailProps.put("mail.smtp.host", catalinaProperties.getTomcatPropertyToken(mailElement.getAttributeValue("mail.smtp.host")));
                mailProps.put("name", catalinaProperties.getTomcatPropertyToken(mailElement.getAttributeValue("name")));
              } 
            }
            
          }
        } catch (JDOMException e) {
          System.out.println( e.toString() );

        }      
      }
      
    }
    if (!foundHost) {
      throw new Exception("Cannot find mail server info");
    }
    return mailProps;
  }
  
  // Bypassed dtd validation when reading data sources.
  public class DummyEntityRes implements EntityResolver
  {
      public InputSource resolveEntity(String publicId, String systemId)
              throws SAXException, IOException
      {
          return new InputSource(new StringReader(" "));
      }

  } 

}
