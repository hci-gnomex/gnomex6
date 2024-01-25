package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.gnomex.model.*;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.Iterator;
import java.util.List;

public class GetInstrumentRun extends GNomExCommand implements Serializable {

  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(GetInstrumentRun.class);

  private Integer                   idInstrumentRun;


  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    if (request.getParameter("idInstrumentRun") != null) {
      idInstrumentRun = Integer.valueOf(request.getParameter("idInstrumentRun"));
    } else {
      this.addInvalidField("idInstrumentRun", "idInstrumentRun is required");
    }
    this.validate();

  }

  public Command execute() throws RollBackCommandException {

    try {

      if (this.getSecurityAdvisor().hasPermission( SecurityAdvisor.CAN_MANAGE_DNA_SEQ_CORE )) {

        Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());

        InstrumentRun ir = null;

        if (idInstrumentRun == null || idInstrumentRun.intValue() == 0) {
          ir = new InstrumentRun();
        } else {
          ir = (InstrumentRun)sess.get(InstrumentRun.class, idInstrumentRun);
        }

        if (ir == null) {
          this.addInvalidField("missing run", "Cannot find InstrumentRun idInstrumentRun=" + idInstrumentRun );
        }


        Document doc = new Document(new Element("RunList"));

        ir.excludeMethodFromXML( "getInstrumentRunStatus" );
        Element iNode = ir.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();

        String creator = ir.getCreator();
        if ( creator != null && !creator.equals( "" ) ) {
          AppUser user = (AppUser)sess.get(AppUser.class, Integer.valueOf(creator));
          iNode.setAttribute( "creator", user != null ? Util.getAppUserDisplayName(user, this.getUserPreferences()) : creator);
        } else {
          iNode.setAttribute( "creator", creator);
        }

        List plates = sess.createQuery("SELECT p from Plate as p where p.idInstrumentRun=" + idInstrumentRun + "  ORDER BY p.quadrant").list();

        for(Iterator i = plates.iterator(); i.hasNext();) {
          Plate plate = (Plate)i.next();

          plate.excludeMethodFromXML("getPlateWells");
          plate.excludeMethodFromXML("getInstrumentRun");
          Element pNode = plate.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();

          creator = plate.getCreator();
          if ( creator != null && !creator.equals( "" ) ) {
            AppUser user = (AppUser)sess.get(AppUser.class, Integer.valueOf(creator));
            pNode.setAttribute( "creator", user != null ? Util.getAppUserDisplayName(user, this.getUserPreferences()) : creator);
          } else {
            pNode.setAttribute( "creator", creator);
          }

          Element pwNode = new Element("plateWells");

          List plateWells = sess.createQuery("SELECT pw from PlateWell as pw where pw.idPlate=" + plate.getIdPlate() ).list();

          for(Iterator i1 = plateWells.iterator(); i1.hasNext();) {
            PlateWell plateWell = (PlateWell)i1.next();
            plateWell.excludeMethodFromXML("getPlate");
            plateWell.excludeMethodFromXML( "getSample" );
            plateWell.excludeMethodFromXML("getAssay");
            plateWell.excludeMethodFromXML("getPrimer");
            Element node = plateWell.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();

            if ( plateWell.getAssay() != null ) {
              node.setAttribute( "label", plateWell.getAssay().getDisplay() );
            } else if ( plateWell.getPrimer() != null ) {
              node.setAttribute( "label", plateWell.getPrimer().getDisplay() );
            }

            node.setAttribute("requestSubmitDate", "");
            node.setAttribute("requestSubmitter", "");

            if ( plateWell.getIdRequest() != null ) {
              String idRequestString = plateWell.getIdRequest().toString();
              if ( idRequestString != null && !idRequestString.equals("")) {
                Request request = (Request) sess.createQuery("SELECT r from Request as r where r.idRequest=" + idRequestString).uniqueResult();
                if ( request != null ) {
                  node.setAttribute("requestSubmitDate",  request.getCreateDate() != null ? new SimpleDateFormat("MM/dd/yyyy").format(request.getCreateDate()) : "");
                  node.setAttribute("requestSubmitter", request.getOwnerName());
                  node.setAttribute("requestNumber", request.getNumber());
                }
              }
            }

            pwNode.addContent(node);
          }

          pNode.addContent(pwNode);
          iNode.addContent(pNode);
        }


        doc.getRootElement().addContent(iNode);

        XMLOutputter out = new org.jdom.output.XMLOutputter();
        this.xmlResult = out.outputString(doc);

        setResponsePage(this.SUCCESS_JSP);

      } else {
        this.addInvalidField( "Insufficient permissions",
        "Insufficient permission to view run." );
      }
    }catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetInstrumentRun ", e);
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
