package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.AppUser;
import hci.gnomex.model.Lab;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.LabMemberParser;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.io.StringReader;
import java.util.Comparator;
import java.util.Iterator;
import java.util.TreeSet;



public class SaveGroupMembership extends GNomExCommand implements Serializable {
  
 
  
  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(SaveGroupMembership.class);
  
  private String                membersXMLString;
  private Document              membersDoc;
  private LabMemberParser       labMemberParser;
  
  private String                collaboratorsXMLString;
  private Document              collaboratorsDoc;
  private LabMemberParser       collaboratorParser;

  private Integer               idLab;
  
  
  public void validate() {
  }
  
  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
    
    if (request.getParameter("idLab") != null && !request.getParameter("idLab").equals("")) {
      idLab = Integer.valueOf(request.getParameter("idLab"));
    } else {
      this.addInvalidField("idLab", "idLab required");
    }
    
    if (request.getParameter("membersXMLString") != null && !request.getParameter("membersXMLString").equals("")) {
      membersXMLString = request.getParameter("membersXMLString");
    }
    
    StringReader reader = new StringReader(membersXMLString);
    try {
      SAXBuilder sax = new SAXBuilder();
      membersDoc = sax.build(reader);
      labMemberParser = new LabMemberParser(membersDoc);
    } catch (JDOMException je ) {
      this.addInvalidField( "membersXMLString", "Invalid membersXMLString");
      this.errorDetails = Util.GNLOG(LOG,"Cannot parse membersXMLString", je);
    }
    
    if (request.getParameter("collaboratorsXMLString") != null && !request.getParameter("collaboratorsXMLString").equals("")) {
      collaboratorsXMLString = request.getParameter("collaboratorsXMLString");
    }
    
    reader = new StringReader(collaboratorsXMLString);
    try {
      SAXBuilder sax = new SAXBuilder();
      collaboratorsDoc = sax.build(reader);
      collaboratorParser = new LabMemberParser(collaboratorsDoc);
    } catch (JDOMException je ) {
      this.addInvalidField( "collaboratorsXMLString", "Invalid collaboratorsXMLString");
      this.errorDetails = Util.GNLOG(LOG,"Cannot parse collaboratorsXMLString", je);
    }
   
  }

  public Command execute() throws RollBackCommandException {
    
    try {
      Session sess = HibernateSession.currentSession(this.getUsername());
      
      Lab lab = (Lab)sess.load(Lab.class, idLab);
      
      if (this.getSecurityAdvisor().hasPermission(SecurityAdvisor.CAN_ADMINISTER_USERS) ||
          this.getSecAdvisor().canUpdate(lab, SecurityAdvisor.PROFILE_GROUP_MEMBERSHIP)) {
        
        labMemberParser.parse(sess);
        collaboratorParser.parse(sess);
        
        
        
        //
        // Save lab members
        //
        TreeSet members = new TreeSet(new AppUserComparator());
        for(Iterator i = labMemberParser.getAppUserMap().keySet().iterator(); i.hasNext();) {
          Integer idAppUser = (Integer)i.next();
          AppUser appUser = (AppUser)labMemberParser.getAppUserMap().get(idAppUser);     
          members.add(appUser);
        }
        lab.setMembers(members);
        
        sess.flush();
        
        
        //
        // Save lab collaborators
        //
        TreeSet collaborators = new TreeSet(new AppUserComparator());
        for(Iterator i = collaboratorParser.getAppUserMap().keySet().iterator(); i.hasNext();) {
          Integer idAppUser = (Integer)i.next();
          AppUser appUser = (AppUser)collaboratorParser.getAppUserMap().get(idAppUser);     
          collaborators.add(appUser);
        }
        lab.setCollaborators(collaborators);
        
        sess.flush();
        
                
        this.xmlResult = "<SUCCESS idLab=\"" + lab.getIdLab() + "\"/>";
      
        setResponsePage(this.SUCCESS_JSP);
      } else {
        this.addInvalidField("Insufficient permissions", "Insufficient permission to assign group membership.");
        setResponsePage(this.ERROR_JSP);
      }
      
    }catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in SaveGroupMembership ", e);
      throw new RollBackCommandException(e.getMessage());
        
    }
    
    return this;
  }
  
 
  
  private class AppUserComparator implements Comparator, Serializable {
    public int compare(Object o1, Object o2) {
      AppUser u1 = (AppUser)o1;
      AppUser u2 = (AppUser)o2;
      
      return u1.getIdAppUser().compareTo(u2.getIdAppUser());
      
    }
  }

}
