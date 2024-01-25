package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.framework.utilities.XMLReflectException;
import hci.gnomex.model.GenomeBuildLite;
import hci.gnomex.model.Organism;
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
public class GetOrganismList extends GNomExCommand implements Serializable {

  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(GetOrganismList.class);

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

      Document doc = new Document(new Element("OrganismList"));

      List organisms = sess.createQuery("SELECT o from Organism o order by case when o.organism='Other' then 'aaa' else o.organism end").list();

      for (Iterator i = organisms.iterator(); i.hasNext();) {
        Organism organism = (Organism) i.next();
        this.getSecAdvisor().flagPermissions(organism);
        Element node = organism.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();

        StringBuffer query = new StringBuffer("SELECT gb from GenomeBuildLite gb");
        query.append(" where gb.idOrganism=" + organism.getIdOrganism());
        query.append(" order by gb.genomeBuildName");
        List genomeBuilds = sess.createQuery(query.toString()).list();

        Element gbEle = new Element("genomeBuilds");
        for (Iterator j = genomeBuilds.iterator(); j.hasNext();) {
          GenomeBuildLite genomeBuild = (GenomeBuildLite) j.next();
          this.getSecAdvisor().flagPermissions(genomeBuild);
          Element childNode = genomeBuild.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();
          childNode.setName("GenomeBuild");
          gbEle.addContent(childNode);
        }
        node.addContent(gbEle);

        doc.getRootElement().addContent(node);
      }

      org.jdom.output.XMLOutputter out = new org.jdom.output.XMLOutputter();
      this.xmlResult = out.outputString(doc);

      setResponsePage(this.SUCCESS_JSP);
    } catch (NamingException e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetOrganismList ", e);

      throw new RollBackCommandException(e.getMessage());

    } catch (SQLException e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetOrganismList ", e);

      throw new RollBackCommandException(e.getMessage());
    } catch (XMLReflectException e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetOrganismList ", e);

      throw new RollBackCommandException(e.getMessage());
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
