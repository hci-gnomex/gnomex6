package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.framework.utilities.XMLReflectException;
import hci.gnomex.model.AppUser;
import hci.gnomex.model.Plate;
import hci.gnomex.model.PlateWell;
import hci.gnomex.model.Request;
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
import java.text.SimpleDateFormat;
import java.util.Iterator;
import java.util.List;

public class GetPlate extends GNomExCommand implements Serializable {

  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(GetPlate.class);

  private Integer                   idPlate;


  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    if (request.getParameter("idPlate") != null && !request.getParameter( "idPlate" ).equals( "0" )) {
      idPlate = Integer.valueOf(request.getParameter("idPlate"));
    } else {
      this.addInvalidField("idPlate", "idPlate is required");
    }
    this.validate();

  }

  public Command execute() throws RollBackCommandException {

    try {

      if (this.getSecurityAdvisor().hasPermission( SecurityAdvisor.CAN_MANAGE_DNA_SEQ_CORE )) {

        Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());

        Plate p = (Plate)sess.get(Plate.class, idPlate);

        if (p == null) {
          this.addInvalidField("missingPlate", "Cannot find plate idPlate=" + idPlate );
        }

        if ( p.getInstrumentRun() == null ) {
          p.setQuadrant( -1 );
        }

        Document doc = new Document(new Element("PlateList"));

        p.excludeMethodFromXML("getPlateWells");
        p.excludeMethodFromXML( "getInstrumentRun" );
        Element pNode = p.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();

        String creator = p.getCreator();
        if ( creator != null && !creator.equals( "" ) ) {
          AppUser user = (AppUser)sess.get(AppUser.class, Integer.valueOf(creator));
          pNode.setAttribute( "creator", user != null ? Util.getAppUserDisplayName(user, this.getUserPreferences()) : creator);
        } else {
          pNode.setAttribute( "creator", creator);
        }

        Element pwNode = new Element("plateWells");

        List plateWells = sess.createQuery("SELECT pw from PlateWell as pw where pw.idPlate=" + idPlate ).list();

        for(Iterator i = plateWells.iterator(); i.hasNext();) {
          PlateWell plateWell = (PlateWell)i.next();
          plateWell.excludeMethodFromXML("getPlate");
          plateWell.excludeMethodFromXML("getSample");
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
        doc.getRootElement().addContent(pNode);

        XMLOutputter out = new org.jdom.output.XMLOutputter();
        this.xmlResult = out.outputString(doc);

        setResponsePage(this.SUCCESS_JSP);

      } else {
        this.addInvalidField( "Insufficient permissions",
        "Insufficient permission to view plate." );
      }
    }catch (NamingException e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetPlate ", e);

      throw new RollBackCommandException(e.getMessage());

    }catch (SQLException e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetPlate ", e);

      throw new RollBackCommandException(e.getMessage());
    } catch (XMLReflectException e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetPlate ", e);

      throw new RollBackCommandException(e.getMessage());
    } catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetPlate ", e);

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
