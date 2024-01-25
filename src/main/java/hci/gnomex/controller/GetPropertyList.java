package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.framework.utilities.XMLReflectException;
import hci.gnomex.model.Property;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;

import javax.naming.NamingException;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.sql.SQLException;
import java.util.Iterator;
import java.util.List;
public class GetPropertyList extends GNomExCommand implements Serializable {

  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(GetPropertyList.class);

  // If Y indicates only the property without optinos, organisms, etc. is to be returned.
  private String propertyOnly = "N";

  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    if (request.getParameter("propertyOnly") != null && !request.getParameter("propertyOnly").equals("")) {
      propertyOnly = request.getParameter("propertyOnly");
    }

    if (isValid()) {
      setResponsePage(this.SUCCESS_JSP);
    } else {
      setResponsePage(this.ERROR_JSP);
    }

  }

  public Command execute() throws RollBackCommandException {

    try {

      Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());

      Document doc = new Document(new Element("PropertyList"));

      List properties = sess.createQuery("SELECT prop from Property prop order by prop.name").list();

      for (Iterator i = properties.iterator(); i.hasNext();) {

        Property property = (Property) i.next();
        this.getSecAdvisor().flagPermissions(property);

        if (propertyOnly.equals("Y")) {
          property.excludeMethodFromXML("getOptions");
          property.excludeMethodFromXML("getOrganisms");
          property.excludeMethodFromXML("getPlatformApplications");
          property.excludeMethodFromXML("getAnalysisTypes");
          property.excludeMethodFromXML("getAppUsers");
        }

        Element node = property.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();
        doc.getRootElement().addContent(node);
      }

      org.jdom.output.XMLOutputter out = new org.jdom.output.XMLOutputter();
      this.xmlResult = out.outputString(doc);

      setResponsePage(this.SUCCESS_JSP);
    } catch (NamingException e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetPropertyList ", e);

      throw new RollBackCommandException(e.getMessage());

    } catch (SQLException e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetPropertyList ", e);

      throw new RollBackCommandException(e.getMessage());
    } catch (XMLReflectException e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetPropertyList ", e);

      throw new RollBackCommandException(e.getMessage());
    } catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetPropertyList ", e);

      throw new RollBackCommandException(e.getMessage());
    }

    if (isValid()) {
      setResponsePage(this.SUCCESS_JSP);
    } else {
      setResponsePage(this.ERROR_JSP);
    }

    return this;
  }

}
