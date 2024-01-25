package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.framework.utilities.XMLReflectException;
import hci.gnomex.model.PlateWell;
import hci.gnomex.model.Request;
import hci.gnomex.security.SecurityAdvisor;
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
import java.text.SimpleDateFormat;
import java.util.Iterator;
import java.util.List;

public class GetPlateWells extends GNomExCommand implements Serializable {

  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(GetPlateWells.class);

  private int                   idPlate;


  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    if (request.getParameter("idPlate") != null && !request.getParameter("idPlate").equals("")) {
      idPlate = Integer.parseInt(request.getParameter("idPlate"));
    } else {
      this.addInvalidField("idPlate", "idPlate is required");
    }

  }

  public Command execute() throws RollBackCommandException {

    try {
      if (this.getSecurityAdvisor().hasPermission( SecurityAdvisor.CAN_MANAGE_DNA_SEQ_CORE )) {

        Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());


        Document doc = new Document(new Element("PlateWellList"));

        List plateWells = sess.createQuery("SELECT pw from PlateWell as pw where pw.idPlate=" + idPlate).list();

        for(Iterator i = plateWells.iterator(); i.hasNext();) {
          PlateWell plateWell = (PlateWell)i.next();
          plateWell.excludeMethodFromXML("getPlate");

          Element node = plateWell.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();

          node.setAttribute("submitDate", "");
          node.setAttribute("submitter", "");

          if ( plateWell.getIdRequest() != null ) {
            String idRequestString = plateWell.getIdRequest().toString();
            if ( idRequestString != null && !idRequestString.equals("")) {
              Request request = (Request) sess.createQuery("SELECT r from Request as r where r.idRequest=" + idRequestString).uniqueResult();
              if ( request != null ) {
                node.setAttribute("submitDate",  request.getCreateDate() != null ? new SimpleDateFormat("MM/dd/yyyy").format(request.getCreateDate()) : "");
                node.setAttribute("submitter", request.getOwnerName());
                node.setAttribute("requestNumber", request.getNumber());
              }
            }
          }


          doc.getRootElement().addContent(node);
        }

        org.jdom.output.XMLOutputter out = new org.jdom.output.XMLOutputter();
        this.xmlResult = out.outputString(doc);

        setResponsePage(this.SUCCESS_JSP);

      } else {
        this.addInvalidField( "Insufficient permissions",
        "Insufficient permission to view well list." );
      }
    }catch (NamingException e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetPlateWells ", e);

      throw new RollBackCommandException(e.getMessage());

    }catch (SQLException e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetPlateWells ", e);

      throw new RollBackCommandException(e.getMessage());
    } catch (XMLReflectException e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetPlateWells ", e);

      throw new RollBackCommandException(e.getMessage());
    } catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetPlateWells ", e);

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
