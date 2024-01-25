package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.gnomex.model.InternalAccountFieldsConfiguration;
import hci.gnomex.security.InvalidSecurityAdvisorException;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.output.XMLOutputter;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.sql.SQLException;
import java.util.jar.Attributes;
import java.util.jar.JarFile;
import java.util.jar.Manifest;


public class CreateSecurityAdvisor extends GNomExCommand implements Serializable {

  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(CreateSecurityAdvisor.class);

  private SecurityAdvisor     secAdvisor;
  private String              launchAction;
  private Document            doc;

  private java.util.Date visitDateTime;
  private Integer idAppUser;
  private String ipAddress;
  private String sessionID;
  private hci.gnomex.model.VisitLog visitLog;
  private Integer idCoreFacility;


  /**
   *  The method in which you can do any final validation and add any additional
   *  validation entries into the invalidField hashmap, this should be called in
   *  the loadCommand prior to setting the response jsp
   */
  public void validate() {
  }

  /**
   *  The callback method in which any pre-processing of the command takes place
   *  before the execute method is called. This method is where you would want
   *  to load objects from the HttpServletRequest (passed in), do form
   *  validation, etc. The HttpSession is also available in this method in case
   *  any session data is necessary.
   *
   *@param  request  The HttpServletRequest object
   *@param  session  The HttpSession object
   */
  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
    this.validate();

    launchAction  = (String) request.getParameter("launchAction");
    String coreAsString = (String) request.getParameter("idCoreFacility");
    idCoreFacility = null;
    if (coreAsString != null) {
      try {
        idCoreFacility = Integer.parseInt(coreAsString);
      } catch(NumberFormatException ex) {
        idCoreFacility = null;
      }
    }
    try {

    	// VisitLog Info from request
        sessionID = request.getSession().getId();
        visitDateTime = new java.util.Date(System.currentTimeMillis());
        ipAddress = GNomExCommand.getRemoteIP(request);

      Session sess = HibernateSession.currentSession(this.getUsername());


      //workaround until NullPointer exception is dealt with
      InternalAccountFieldsConfiguration.getConfiguration(sess);

      secAdvisor = SecurityAdvisor.create(sess, this.getUsername(), idCoreFacility);

      // Get gnomex version
      String filename= this.getClass().getProtectionDomain().getCodeSource().getLocation().getFile();
      filename = filename.replace("%20", " ");      // convert any blanks
      JarFile jarfile = new JarFile( filename );
      Manifest manifest = jarfile.getManifest();
      jarfile.close();
      Attributes value = (Attributes)manifest.getEntries().get("gnomex");
      secAdvisor.setVersion(value.getValue("Implementation-Version"));

      // Output the security advisor information
      doc = secAdvisor.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL);

    }
    catch (InvalidSecurityAdvisorException e) {
      this.addInvalidField("invalid permission", e.getMessage());
    }
    catch (HibernateException ex) {
      this.errorDetails = Util.GNLOG(LOG,"An Hibernate exception while trying to Create Security Advisor: ", ex);
      this.addInvalidField("Error", "Hibernate exception while trying to Create Security Advisor: "+ ex);
    }
    catch (SQLException ex) {
      this.errorDetails = Util.GNLOG(LOG,"An SQL exception while trying to Create Security Advisor: ",ex);
      this.addInvalidField("Error", "SQL exception while trying to Create Security Advisor: "+ ex);
    }
    catch (Exception ex) {
      this.errorDetails = Util.GNLOG(LOG,"An exception occurred in CreateSecurityAdvisor ", ex);
      this.addInvalidField("Error", ex.getClass().toString() + " occurred in CreateSecurityAdvisor " + ex);
    }

    // see if we have a valid form
    if (isValid()) {
      setResponsePage(this.SUCCESS_JSP);
    } else {
      setResponsePage(this.ERROR_JSP);
    }
  }

  /**
   *  The callback method where your business logic should be placed. This
   *  method is either called from the FrontController servlet or from the
   *  RequestProcessor Session Bean (if EJB is used). Any data resulting from
   *  the execution of this method should be put into instance variables in this
   *  class.
   *
   *@return                               Returns this command with the results
   *      of the execute method
   *@exception  RollBackCommandException  Description of the Exception
   */
  public Command execute() throws RollBackCommandException {

    try {
      XMLOutputter out = new org.jdom.output.XMLOutputter();
      this.xmlResult = out.outputString(doc);

      // VisitLog info from secAdvisor
      idAppUser = secAdvisor.getIdAppUser();
      // save VisitLog
	  visitLog = new hci.gnomex.model.VisitLog();
	  visitLog.setVisitDateTime(visitDateTime);
	  visitLog.setIdAppUser(idAppUser);
	  visitLog.setIpAddress(ipAddress);
	  visitLog.setSessionID(sessionID);

      Session sess = HibernateSession.currentSession(this.getUsername());
	  sess.save(visitLog);
	  sess.flush();


    }
    catch (Exception ex) {

      this.errorDetails = Util.GNLOG(LOG,"An exception occurred in CreateSecurityAdvisor ", ex);
      throw new RollBackCommandException();
    }

    if (isValid()) {
      if (launchAction != null && !launchAction.equals("")) {
        setResponsePage(launchAction);
      } else {
        setResponsePage(this.SUCCESS_JSP);
      }
    } else {
      setResponsePage(this.ERROR_JSP);
    }
    return this;
  }

  /**
   *  The callback method called after the loadCommand and execute methods
   *  allowing you to do any post-execute processing of the HttpSession. Should
   *  be used to add/remove session data resulting from the execution of this
   *  command
   *
   *@param  session  The HttpSession
   *@return          The processed HttpSession
   */
  public HttpSession setSessionState(HttpSession session) {
    session.setAttribute(SecurityAdvisor.SECURITY_ADVISOR_SESSION_KEY, secAdvisor);
    return session;
  }
}

