package hci.gnomex.controller;

import hci.gnomex.utility.HibernateSession;
import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.framework.security.UnknownPermissionException;
import hci.framework.utilities.XMLReflectException;

import java.io.Serializable;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import javax.naming.NamingException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.hibernate.Hibernate;
import org.hibernate.Session;
import org.jdom.Element;
import org.jdom.Document;
import org.jdom.output.XMLOutputter;

import hci.gnomex.model.RequestFilter;
import hci.gnomex.model.Request;


public class GetRequest extends GNomExCommand implements Serializable {
  
  private static org.apache.log4j.Logger log = org.apache.log4j.Logger.getLogger(GetRequest.class);
  
  private Integer idRequest;
  private String  requestNumber;

  
  public void validate() {
  }
  
  public void loadCommand(HttpServletRequest request, HttpSession session) {

    if (request.getParameter("idRequest") != null && !request.getParameter("idRequest").equals("")) {
      idRequest = new Integer(request.getParameter("idRequest"));
    } 
    if (request.getParameter("requestNumber") != null && !request.getParameter("requestNumber").equals("")) {
      requestNumber = request.getParameter("requestNumber");
    } 
    
    
    if (idRequest == null && requestNumber == null) {
      this.addInvalidField("idRequest or requestNumber", "Either idRequest or requestNumber must be provided");
    }
  }

  public Command execute() throws RollBackCommandException {
    
    try {
      
   
      Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());
 
      // Find request
      Request request = null;
      if (idRequest != null) {
        request = (Request)sess.get(Request.class, idRequest);
      } else {
        requestNumber = requestNumber.replaceAll("#", "");
        StringBuffer buf = new StringBuffer("SELECT req from Request as req where req.number = '" + requestNumber.toUpperCase() + "'");
        List requests = (List)sess.createQuery(buf.toString()).list();
        if (requests.size() > 0) {
          request = (Request)requests.get(0);
        }
      }      
      if (request != null) {
        // Make sure user has permission to view request
        if (this.getSecAdvisor().canRead(request)) {
          
          Hibernate.initialize(request.getSamples());
          Hibernate.initialize(request.getHybridizations());
          
          this.getSecAdvisor().flagPermissions(request);
        
          // Generate xml
          Document doc = new Document(new Element("OpenRequestList"));
          doc.getRootElement().addContent(request.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement());
        
          XMLOutputter out = new org.jdom.output.XMLOutputter();
          this.xmlResult = out.outputString(doc);
        } else {
          this.addInvalidField("Insufficient Permission", "Insufficient permission to access this request");      
        }
        
      }
    
      if (isValid()) {
        setResponsePage(this.SUCCESS_JSP);
      } else {
        setResponsePage(this.ERROR_JSP);
      }
    
    }catch (UnknownPermissionException e){
      log.error("An exception has occurred in GetRequest ", e);
      throw new RollBackCommandException(e.getMessage());        
    }catch (NamingException e){
      log.error("An exception has occurred in GetRequest ", e);
      e.printStackTrace();
      throw new RollBackCommandException(e.getMessage());
    }catch (SQLException e) {
      log.error("An exception has occurred in GetRequest ", e);
      e.printStackTrace();
      throw new RollBackCommandException(e.getMessage());
    } catch (XMLReflectException e){
      log.error("An exception has occurred in GetRequest ", e);
      e.printStackTrace();
      throw new RollBackCommandException(e.getMessage());
    } catch (Exception e){
      log.error("An exception has occurred in GetRequest ", e);
      e.printStackTrace();
      throw new RollBackCommandException(e.getMessage());
    } finally {
      try {
        this.getSecAdvisor().closeReadOnlyHibernateSession();        
      } catch(Exception e) {
        
      }
    }
    
    return this;
  }

}