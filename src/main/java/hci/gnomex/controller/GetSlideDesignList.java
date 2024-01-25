package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.framework.utilities.XMLReflectException;
import hci.gnomex.model.*;
import hci.gnomex.security.SecurityAdvisor;
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

public class GetSlideDesignList extends GNomExCommand implements Serializable {

  private static Logger LOG = Logger.getLogger(GetSlideDesignList.class);

  private SlideDesignFilter filter;

  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    filter = new SlideDesignFilter();
    HashMap errors = this.loadDetailObject(request, filter);
    this.addInvalidFields(errors);
  }

  public Command execute() throws RollBackCommandException {

    try {


    Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());


    Document doc = new Document(new Element("SlideDesignList"));

    // Only return a list of slide products if the user is a GNomEx user that participates
    // in a group
    if (this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_PARTICIPATE_IN_GROUPS)) {
      StringBuffer buf = filter.getQuery(this.getSecAdvisor());
      LOG.info("Query for GetSlideDesignList: " + buf.toString());
      List slideDesigns = (List)sess.createQuery(buf.toString()).list();

      for(Iterator i = slideDesigns.iterator(); i.hasNext();) {
        Object[] row = (Object[])i.next();
        SlideDesign  sd = (SlideDesign)row[0];
        SlideProduct sp = (SlideProduct)row[1];

        // Don't show any slide designs that user doesn't have read permission
        // on.
        if (!getSecAdvisor().canRead(sp)) {
          continue;
        }

        Element sdNode = sd.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();
        sdNode.setAttribute("arraysPerSlide",         sp.getArraysPerSlide() != null ? sp.getArraysPerSlide().toString() : "");
        sdNode.setAttribute("idVendor",               sp.getIdVendor() != null ? sp.getIdVendor().toString() : "");
        sdNode.setAttribute("idOrganism",             sp.getIdOrganism() != null ? sp.getIdOrganism().toString() : "");
        sdNode.setAttribute("idLab",                  sp.getIdLab() != null ? sp.getIdLab().toString() : "");
        sdNode.setAttribute("isCustom",               sp.getIsCustom() != null ? sp.getIsCustom() : "N");
        sdNode.setAttribute("isActive",               sp.getIsActive() != null ? sp.getIsActive() : "N");
        if (sp.getSlidesInSet() != null && sp.getSlidesInSet().intValue() > 1) {
          sdNode.setAttribute("isInSlideSet", "Y");
          sdNode.setAttribute("idSlideProductSlideSet", sp.getIdSlideProduct().toString());
        } else {
          sdNode.setAttribute("isInSlideSet", "N");
          sdNode.setAttribute("idSlideProductSlideSet", "");
        }

        if (sp.getApplications() != null) {
          Element mcRootNode = new Element("applications");
          sdNode.addContent(mcRootNode);
          StringBuffer concatApplications = new StringBuffer();
          for(Iterator i1 = sp.getApplications().iterator(); i1.hasNext();) {
            Application mc = (Application)i1.next();
            mcRootNode.addContent(mc.toXMLDocument(null).getRootElement());
            concatApplications.append(mc.getApplication());
            if (i1.hasNext()) {
              concatApplications.append(", ");
            }
          }
          sdNode.setAttribute("applications", concatApplications.toString());
        }

        if (sp.getArraysPerSlide() != null && sp.getArraysPerSlide().intValue() > 1) {
          Element acRootNode = new Element("arrayCoordinates");
          sdNode.addContent(acRootNode);

          List arrayCoordinates = sess.createQuery("SELECT ac from ArrayCoordinate ac where ac.idSlideDesign = " + sd.getIdSlideDesign() + " order by ac.x, ac.y").list();
          for(Iterator i1 = arrayCoordinates.iterator(); i1.hasNext();) {
            ArrayCoordinate ac = (ArrayCoordinate)i1.next();
            acRootNode.addContent(ac.toXMLDocument(null).getRootElement());
          }
        }

        doc.getRootElement().addContent(sdNode);

      }

    }

    XMLOutputter out = new org.jdom.output.XMLOutputter();
    this.xmlResult = out.outputString(doc);

    setResponsePage(this.SUCCESS_JSP);
    }catch (NamingException e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetSlideDesignList ", e);

      throw new RollBackCommandException(e.getMessage());
    }catch (SQLException e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetSlideDesignList ", e);

      throw new RollBackCommandException(e.getMessage());
    } catch (XMLReflectException e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetSlideDesignList ", e);

      throw new RollBackCommandException(e.getMessage());
    } catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetSlideDesignList ", e);

      throw new RollBackCommandException(e.getMessage());
    }

    return this;
  }

}
