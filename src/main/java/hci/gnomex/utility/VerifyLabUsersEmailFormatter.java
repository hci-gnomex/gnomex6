package hci.gnomex.utility;

import hci.framework.model.DetailObject;
import hci.gnomex.constants.Constants;
import hci.gnomex.controller.GNomExFrontController;
import hci.gnomex.model.AppUser;
import hci.gnomex.model.CoreFacility;
import hci.gnomex.model.Lab;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;


public class VerifyLabUsersEmailFormatter extends DetailObject{
  
  private String           labName;
  private Lab              lab;
  private Map              managers; 
  private Map              members;
  private Map              collaborators;

  private StringBuffer     introNote = new StringBuffer();

  private PropertyDictionaryHelper dictionaryHelper;
  

  public VerifyLabUsersEmailFormatter(Session sess, Lab lab, String labName, Map managers, Map members, Map collaborators) { 
    this.lab = lab;
    this.labName = labName;
    this.managers = managers;
    this.members = members;
    this.collaborators = collaborators;
 
    this.dictionaryHelper = PropertyDictionaryHelper.getInstance(sess);
    
    introNote.append("The following list shows active accounts for the GNomEx microarray and next generation sequencing database.<br>");
    introNote.append("<b>After review of this list, please inform us of individuals that no longer work in your lab group so that<br>their accounts can be inactivated.</b><br>");
  }
  

  public String format(AppUser appUser) throws Exception {


    Element root = new Element("HTML");
    Document doc = new Document(root);
    
    Element body = formatHeader(root);
    
    formatBody(body);
    
    formatFooter(body, appUser);
    
    XMLOutputter out = new org.jdom.output.XMLOutputter();
    String buf = out.outputString(doc);
    buf = buf.replaceAll("&amp;",    "&");
    buf = buf.replaceAll("�",        "&micro");
    buf = buf.replaceAll("&gt;",     ">");
    buf = buf.replaceAll("&lt;",     "<");
    
    return buf;
  }
  
 
  

  protected Element formatHeader(Element root) {

    
    Element head = new Element("HEAD");
    root.addContent(head);
    
    Element style = new Element("style");
    style.setAttribute("type", "text/css");
    style.addContent(this.getCascadingStyleSheet());
    head.addContent(style);
    
    Element title = new Element("TITLE");
    title.addContent("GNomEx User Accounts for " + labName + " Lab");
    head.addContent(title);
    
    Element body = new Element("BODY");
    root.addContent(body);


    body.addContent(introNote.toString());
    
    return body;
  }
  
  protected void formatBody(Element body) {
    
    StringBuffer emailBody = new StringBuffer();
    
    if (!managers.isEmpty()) {
      emailBody.append("<br><u>" + "Lab Manager Accounts" + "</u><br>");;
      for (String manager : (Set<String>)managers.keySet()) {
        emailBody.append(" " + manager + "<br>");
      }
    }

    if (!members.isEmpty()) {
      emailBody.append("<br><u>" +  "Lab Member Accounts" + "</u><br>");;
      for (String member : (Set<String>)members.keySet()) {
        emailBody.append(" " + member + "<br>");            
      }
    }

    if (!collaborators.isEmpty()) {
      emailBody.append("<br><u>" + "Lab Collaborators Accounts" + "</u><br>");;
      for (String collab : (Set<String>)collaborators.keySet()) {
        emailBody.append(" " + collab + "<br>");            
      }
      
    }

    body.addContent(emailBody.toString());
    
  }
  
  private void formatFooter(Element body, AppUser appUser) {
   
    StringBuffer emailFooter = new StringBuffer();
    emailFooter.append("<br>");
    emailFooter.append("Thanks,");
    emailFooter.append("<br>");
    emailFooter.append(appUser.getFirstLastDisplayName());
    if ( appUser.getManagingCoreFacilities() != null ) {
      String coreNames = "";
      for(Iterator i = appUser.getManagingCoreFacilities().iterator(); i.hasNext(); ) {
        CoreFacility facility = (CoreFacility)i.next();
        if (!coreNames.equals("")) {
          coreNames += ", ";
        }
        coreNames += facility.getFacilityName();
      }
      emailFooter.append("<br>");
      emailFooter.append(coreNames);
    }
     
    body.addContent(emailFooter.toString());
  }
  
  private String getCascadingStyleSheet() {
    StringBuffer buf = new StringBuffer();
    BufferedReader input =  null;
    try {
      input = new BufferedReader(new FileReader(GNomExFrontController.getWebContextPath() + Constants.EMAIL_NOTIFY_CSS));
    } catch (FileNotFoundException ex) {
      System.out.println(ex.toString());
    }
    if (input != null) {
      try {
        String line = null; 
        while (( line = input.readLine()) != null){
          buf.append(line);
          buf.append(System.getProperty("line.separator"));
        }
      }
      catch (IOException ex){
        ex.printStackTrace();
      }
      finally {
        try {
          input.close();          
        } catch (IOException e) {
        }
      }
      
    }
    return buf.toString();
  }

}
