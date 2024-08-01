package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.gnomex.model.InternalAccountFieldsConfiguration;
import hci.gnomex.model.OtherAccountFieldsConfiguration;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.List;

public class GetAccountFieldsConfiguration extends GNomExCommand implements Serializable {

  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(GetAccountFieldsConfiguration.class);


  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {


    if (isValid()) {
      setResponsePage(this.SUCCESS_JSP);
    } else {
      setResponsePage(this.ERROR_JSP);
    }

  }

  public Command execute() throws RollBackCommandException {

    try {

      Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());
      InternalAccountFieldsConfiguration.reloadConfigurations(sess);
      OtherAccountFieldsConfiguration.reloadConfigurations(sess);

      Document doc = new Document(new Element("AccountFieldsConfiguration"));

      Element internalNode = new Element("InternalAccountFieldsConfigurationList");
      List<InternalAccountFieldsConfiguration> internalFields = InternalAccountFieldsConfiguration.getConfiguration(sess);
      for(InternalAccountFieldsConfiguration conf:internalFields) {
        Element node = conf.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();
        internalNode.addContent(node);
      }
      doc.getRootElement().addContent(internalNode);

      Element otherNode = new Element("OtherAccountFieldsConfigurationList");
      List<OtherAccountFieldsConfiguration> otherFields = OtherAccountFieldsConfiguration.getConfiguration(sess);
      for(OtherAccountFieldsConfiguration conf:otherFields) {
        Element node = conf.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();
        otherNode.addContent(node);
      }
      doc.getRootElement().addContent(otherNode);

      org.jdom.output.XMLOutputter out = new org.jdom.output.XMLOutputter();
      this.xmlResult = out.outputString(doc);

      setResponsePage(this.SUCCESS_JSP);
    } catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetOrganismList ", e);
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
