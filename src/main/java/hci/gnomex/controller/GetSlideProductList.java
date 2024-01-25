package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.framework.utilities.XMLReflectException;
import hci.gnomex.model.SlideProduct;
import hci.gnomex.model.SlideProductFilter;
import hci.gnomex.model.Visibility;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Hibernate;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.naming.NamingException;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.sql.SQLException;
import java.util.*;

public class GetSlideProductList extends GNomExCommand implements Serializable {

  private static Logger LOG = Logger.getLogger(GetSlideProductList.class);

  private SlideProductFilter filter;

  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    filter = new SlideProductFilter();
    HashMap errors = this.loadDetailObject(request, filter);
    this.addInvalidFields(errors);
  }

  public Command execute() throws RollBackCommandException {

    try {


    Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());


    Document doc = new Document(new Element("SlideProductList"));

    StringBuffer buf = new StringBuffer();
    List slideProducts = null;
    TreeMap slideProductSortedMap = new TreeMap();

    if (this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_PARTICIPATE_IN_GROUPS)) {
      buf = filter.getQuery(this.getSecAdvisor());
      LOG.info("Query for GetSlideProductList: " + buf.toString());
      slideProducts = (List)sess.createQuery(buf.toString()).list();
    } else {
      slideProducts = new ArrayList();
    }
    for(Iterator i = slideProducts.iterator(); i.hasNext();) {
      SlideProduct sp = (SlideProduct)i.next();
      slideProductSortedMap.put(sp.getName() + sp.getIdSlideProduct(), sp);
    }

    // Figure out the slides that have public experiments on them.  All users
    // can see these slides
    buf = new StringBuffer();
    buf.append("SELECT distinct sp ");
    buf.append("FROM   Request r ");
    buf.append("JOIN   r.slideProduct as sp ");
    buf.append("WHERE  r.codeVisibility = '" + Visibility.VISIBLE_TO_PUBLIC + "'");

    LOG.info("Query for GetSlideProductList: " + buf.toString());
    List publicSlideProducts = (List)sess.createQuery(buf.toString()).list();

    // Indicate that this slides have public experiments on them
    for(Iterator i = publicSlideProducts.iterator(); i.hasNext();) {
      SlideProduct sp = (SlideProduct)i.next();

      sp.hasPublicExperiments(true);
      slideProductSortedMap.put(sp.getName() + sp.getIdSlideProduct(), sp);
    }



    for(Iterator i = slideProductSortedMap.keySet().iterator(); i.hasNext();) {
      String key = (String)i.next();

      SlideProduct sp = (SlideProduct)slideProductSortedMap.get(key);
      Hibernate.initialize(sp.getSlideDesigns());
      Hibernate.initialize(sp.getApplications());

      // Don't show any custom slide products that user doesn't have read permission on.
      if (!this.getSecAdvisor().canRead(sp)) {
        continue;
      }

      Element spNode = sp.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();
      doc.getRootElement().addContent(spNode);

    }

    XMLOutputter out = new org.jdom.output.XMLOutputter();
    this.xmlResult = out.outputString(doc);

    setResponsePage(this.SUCCESS_JSP);
    }catch (NamingException e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetSlideProductList ", e);

      throw new RollBackCommandException(e.getMessage());
    }catch (SQLException e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetSlideProductList ", e);

      throw new RollBackCommandException(e.getMessage());
    } catch (XMLReflectException e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetSlideProductList ", e);

      throw new RollBackCommandException(e.getMessage());
    } catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetSlideProductList ", e);

      throw new RollBackCommandException(e.getMessage());
    }

    return this;
  }

}
