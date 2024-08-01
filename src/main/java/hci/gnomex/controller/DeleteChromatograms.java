package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.Chromatogram;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;

import javax.servlet.http.HttpSession;
import java.io.File;
import java.io.Serializable;
import java.io.StringReader;
import java.util.Iterator;

public class DeleteChromatograms extends GNomExCommand implements Serializable {

  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(DeleteChromatograms.class);

  private String chromatsToDeleteXMLString;
  private Document chromatsToDeleteDoc;

  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    if (request.getParameter("chromatsToDeleteXMLString") != null && !request.getParameter("chromatsToDeleteXMLString").equals("")) {
      chromatsToDeleteXMLString = request.getParameter("chromatsToDeleteXMLString");
      StringReader reader = new StringReader(chromatsToDeleteXMLString);
      try {
        SAXBuilder sax = new SAXBuilder();
        chromatsToDeleteDoc = sax.build(reader);
      } catch (JDOMException je ) {
        this.addInvalidField( "chromatsToDeleteXMLString", "Invalid chromatsToDeleteXMLString");
        this.errorDetails = Util.GNLOG(LOG,"Cannot parse chromatsToDeleteXMLString", je);
      }
    }


  }

  public Command execute() throws RollBackCommandException {

    try {
      Session sess = HibernateSession.currentSession(this.getUsername());

      //Change this conditional to check for this.getSecurityAdvisor().hasPermission(SecurityAdvisor.canDelete())
      if (this.getSecurityAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_DNA_SEQ_CORE)) {
        for(Iterator i = this.chromatsToDeleteDoc.getRootElement().getChildren().iterator(); i.hasNext();) {
          Element node = (Element)i.next();
          Integer idChromatogram = Integer.parseInt(node.getAttributeValue("idChromatogram"));
          Chromatogram ch = (Chromatogram) sess.load(Chromatogram.class, idChromatogram);

          File chromatFile = new File(ch.getQualifiedFilePath() + Constants.FILE_SEPARATOR + ch.getFileName());
          chromatFile.delete();

          sess.delete(ch);
        }
        sess.flush();
        setResponsePage(this.SUCCESS_JSP);

      } else {
        this.addInvalidField("Insufficient permissions", "Insufficient permission to edit dictionareis.");
        setResponsePage(this.ERROR_JSP);
      }


    }catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in DeleteChromatograms ", e);

      throw new RollBackCommandException(e.getMessage());

    }

    return this;
  }
}
