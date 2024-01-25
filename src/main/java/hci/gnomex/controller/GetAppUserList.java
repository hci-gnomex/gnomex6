package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.framework.utilities.Annotations;
import hci.framework.utilities.XMLReflectException;
import hci.gnomex.model.AppUser;
import hci.gnomex.model.AppUserFilter;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.naming.NamingException;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
public class GetAppUserList extends GNomExCommand implements Serializable {

  private static Logger LOG = Logger.getLogger(GetAppUserList.class);

  private AppUserFilter filter;
  private String listKind = "AppUserList";

  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
    filter = new AppUserFilter();
    HashMap errors = this.loadDetailObject(request, filter);
    this.addInvalidFields(errors);

    if (request.getParameter("listKind") != null && !request.getParameter("listKind").equals("")) {
      listKind = request.getParameter("listKind");
    }
  }

  public Command execute() throws RollBackCommandException {

    try {

      Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());

      Document doc = new Document(new Element(listKind));

      StringBuffer buf = filter.getQuery(this.getSecAdvisor());
      LOG.debug("App user query: " + buf.toString());
      List users = sess.createQuery(buf.toString()).list();

      for (Iterator i = users.iterator(); i.hasNext();) {
        AppUser user = (AppUser) i.next();

        // Exclude extra user information
        user.excludeMethodFromXML("getCodeUserPermissionKind");
        user.excludeMethodFromXML("getuNID");
        // user.excludeMethodFromXML("getEmail");
        user.excludeMethodFromXML("getDepartment");
        user.excludeMethodFromXML("getInstitute");
        user.excludeMethodFromXML("getJobTitle");
        user.excludeMethodFromXML("getCodeUserPermissionKind");
        user.excludeMethodFromXML("getUserNameExternal");
        user.excludeMethodFromXML("getPasswordExternal");
        user.excludeMethodFromXML("getPhone");
        user.excludeMethodFromXML("getLabs");
        user.excludeMethodFromXML("getCollaboratingLabs");
        user.excludeMethodFromXML("getManagingLabs");
        user.excludeMethodFromXML("getPasswordExternalEntered");
        user.excludeMethodFromXML("getIsExternalUser");
        user.excludeMethodFromXML("getPasswordExternal");
        user.excludeMethodFromXML("getSalt");
        user.excludeMethodFromXML("getGuid");

        doc.getRootElement().addContent(user.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL, null, Annotations.IGNORE).getRootElement());

      }

      XMLOutputter out = new org.jdom.output.XMLOutputter();
      this.xmlResult = out.outputString(doc);
      setResponsePage(this.SUCCESS_JSP);
    } catch (NamingException e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetAppUserList ", e);

      throw new RollBackCommandException(e.getMessage());

    } catch (SQLException e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetAppUserList ", e);

      throw new RollBackCommandException(e.getMessage());
    } catch (XMLReflectException e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetAppUserList ", e);

      throw new RollBackCommandException(e.getMessage());
    } catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetAppUserList ", e);

      throw new RollBackCommandException(e.getMessage());
    }

    return this;
  }

}
