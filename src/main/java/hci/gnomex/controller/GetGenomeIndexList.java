package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.framework.utilities.XMLReflectException;
import hci.gnomex.model.GenomeIndex;
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
public class GetGenomeIndexList extends GNomExCommand implements Serializable {

  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(GetGenomeIndexList.class);

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

      Document doc = new Document(new Element("GenomeIndexList"));

      List genomeIndexList = sess.createQuery("SELECT genomeIndex from GenomeIndex genomeIndex order by genomeIndex.genomeIndexName").list();

      for (Iterator i = genomeIndexList.iterator(); i.hasNext();) {
        GenomeIndex gnIdx = (GenomeIndex) i.next();
        this.getSecAdvisor().flagPermissions(gnIdx);
        Element node = gnIdx.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();
        doc.getRootElement().addContent(node);
      }

      org.jdom.output.XMLOutputter out = new org.jdom.output.XMLOutputter();
      this.xmlResult = out.outputString(doc);

      setResponsePage(this.SUCCESS_JSP);
    } catch (NamingException e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetGenomeIndexList ", e);

      throw new RollBackCommandException(e.getMessage());

    } catch (SQLException e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetGenomeIndexList ", e);

      throw new RollBackCommandException(e.getMessage());
    } catch (XMLReflectException e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetGenomeIndexList ", e);

      throw new RollBackCommandException(e.getMessage());
    } catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetGenomeIndexList ", e);

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
