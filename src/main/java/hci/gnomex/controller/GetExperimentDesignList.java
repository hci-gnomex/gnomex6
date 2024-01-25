package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.framework.utilities.Annotations;
import hci.framework.utilities.XMLReflectException;
import hci.gnomex.model.ExperimentDesign;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class GetExperimentDesignList extends GNomExCommand implements Serializable {



  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(GetExperimentDesignList.class);


  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
  }

  public Command execute() throws RollBackCommandException {

    try {


    Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());



    // Get codes that are used
    StringBuffer queryBuf = new StringBuffer();
    queryBuf.append("SELECT distinct ed.codeExperimentDesign from ExperimentDesignEntry as ed ");
    List usedCodes = (List)sess.createQuery(queryBuf.toString()).list();


    //  Now get all used experiment designs
    List usedDesigns = new ArrayList();
    if (usedCodes.size() > 0) {
      queryBuf = new StringBuffer();
      queryBuf.append("SELECT ed from ExperimentDesign as ed ");
      if (usedCodes.size() > 0) {
        queryBuf.append(" where ed.codeExperimentDesign in (");
        for(Iterator i = usedCodes.iterator(); i.hasNext();) {
          String code= (String)i.next();
          queryBuf.append("'" + code + "'");
          if (i.hasNext()) {
            queryBuf.append(", ");
          }
        }
        queryBuf.append(")");
      }
      usedDesigns = sess.createQuery(queryBuf.toString()).list();
    }


    // Now get all other experiment designs
    queryBuf = new StringBuffer();
    queryBuf.append("SELECT ed from ExperimentDesign as ed ");
    if (usedCodes.size() > 0) {
      queryBuf.append(" where ed.codeExperimentDesign not in (");
      for(Iterator i = usedCodes.iterator(); i.hasNext();) {
        String code= (String)i.next();
        queryBuf.append("'" + code + "'");
        if (i.hasNext()) {
          queryBuf.append(", ");
        }
      }
      queryBuf.append(")");
    }

    List notUsedDesigns = (List)sess.createQuery(queryBuf.toString()).list();


    // Generate XML for each experiment design.
    Document doc = new Document(new Element("ExperimentDesignList"));
    generateXML(doc, usedDesigns,    "Y");
    generateXML(doc, notUsedDesigns, "N");


    XMLOutputter out = new org.jdom.output.XMLOutputter();
    this.xmlResult = out.outputString(doc);

    setResponsePage(this.SUCCESS_JSP);
    }catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetExperimentDesignList ", e);

      throw new RollBackCommandException(e.getMessage());
    }

    return this;
  }

  private void generateXML(Document doc, List designs, String isUsed) throws XMLReflectException {
    for(Iterator i = designs.iterator(); i.hasNext();) {
      ExperimentDesign ed = (ExperimentDesign)i.next();
      Element node = ed.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL, null, Annotations.IGNORE).getRootElement();
      node.setAttribute("isUsed", isUsed);
      node.setAttribute("isSelected", "false");
      doc.getRootElement().addContent(node);
    }
  }

}
