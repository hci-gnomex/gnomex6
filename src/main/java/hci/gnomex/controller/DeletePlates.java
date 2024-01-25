package hci.gnomex.controller;


import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.Plate;
import hci.gnomex.model.PlateWell;
import hci.gnomex.model.Request;
import hci.gnomex.model.RequestStatus;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.io.StringReader;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
public class DeletePlates extends GNomExCommand implements Serializable {

  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(DeletePlates.class);

  private String platesToDeleteXMLString;
  private Document platesToDeleteDoc;

  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    if (request.getParameter("platesToDeleteXMLString") != null && !request.getParameter("platesToDeleteXMLString").equals("")) {
      platesToDeleteXMLString = request.getParameter("platesToDeleteXMLString");
      StringReader reader = new StringReader(platesToDeleteXMLString);
      try {
        SAXBuilder sax = new SAXBuilder();
        platesToDeleteDoc = sax.build(reader);
      } catch (JDOMException je ) {
        this.addInvalidField( "platesToDeleteXMLString", "Invalid platesToDeleteXMLString");
        this.errorDetails = Util.GNLOG(LOG,"Cannot parse platesToDeleteXMLString", je);
      }
    }


  }

  public Command execute() throws RollBackCommandException {

    try {
      Session sess = HibernateSession.currentSession(this.getUsername());

    //Change this conditional to check for this.getSecurityAdvisor().hasPermission(SecurityAdvisor.canDelete())
      if (this.getSecurityAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_DNA_SEQ_CORE)) {
        for(Iterator i = this.platesToDeleteDoc.getRootElement().getChildren().iterator(); i.hasNext();) {
          Element node = (Element)i.next();
          Integer idPlate = Integer.parseInt(node.getText());
          Plate plate = (Plate) sess.load(Plate.class, idPlate);
          changeStatusDeletePlates(sess, plate, RequestStatus.PROCESSING);
          sess.delete(plate); //delete the instrument run after all associations to it have been removed(ie:plate, plate wells)

        }
        sess.flush();
        setResponsePage(this.SUCCESS_JSP);

      } else {
        this.addInvalidField("Insufficient permissions", "Insufficient permission to edit dictionaries.");
        setResponsePage(this.ERROR_JSP);
      }


    }catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in DeletePlate ", e);

      throw new RollBackCommandException(e.getMessage());

    }

    return this;
  }

 private void changeStatusDeletePlates( Session sess, Plate plate, String status ) throws ProductException {

    // Get any requests on that run
    Map requests = new HashMap();
    ChromatogramParser cp = new ChromatogramParser();
    List wells = sess.createQuery( "SELECT pw from PlateWell as pw " +
        " where pw.idPlate =" + plate.getIdPlate()).list();
    for(Iterator i1 = wells.iterator(); i1.hasNext();) {
      PlateWell well = (PlateWell)i1.next();

      if(well.getRedoFlag().equals("Y")){
        cp.requeueSourceWells(well.getIdPlateWell(), sess);
      }

      if (well.getIdRequest() != null && !well.getIdRequest().equals( "" ) && !requests.containsKey( well.getIdRequest() ) ) {
        Request req = (Request) sess.get(Request.class, well.getIdRequest());
        requests.put( req.getIdRequest(), req );
      }
      sess.delete(well);
    }

    // Change request Status
    for ( Iterator i = requests.keySet().iterator(); i.hasNext();) {
      int idReq = (Integer) i.next();
      Request req = (Request) sess.get(Request.class, idReq );
      ProductUtil.updateLedgerOnRequestStatusChange(sess, req, req.getCodeRequestStatus(), status);
      req.setCodeRequestStatus( status );
    }
    sess.flush();
  }



}
