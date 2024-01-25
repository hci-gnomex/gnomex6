package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.ArrayCoordinate;
import hci.gnomex.model.SlideDesign;
import hci.gnomex.model.SlideProduct;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.Iterator;
import java.util.List;



public class DeleteSlideSet extends GNomExCommand implements Serializable {



  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(DeleteSlideSet.class);


  private Integer      idSlideProduct = null;




  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

   if (request.getParameter("idSlideProduct") != null && !request.getParameter("idSlideProduct").equals("")) {
     idSlideProduct = Integer.valueOf(request.getParameter("idSlideProduct"));
   } else {
     this.addInvalidField("idSlideProduct", "idSlideProduct is required.");
   }


   // see if we have a valid form
   if (isValid()) {
     setResponsePage(this.SUCCESS_JSP);
   } else {
     setResponsePage(this.ERROR_JSP);
   }
  }

  public Command execute() throws RollBackCommandException {

    try {
      Session sess = HibernateSession.currentSession(this.getUsername());

      // Check permissions
      if (this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_WORKFLOW)) {
        SlideProduct slideProduct = (SlideProduct)sess.load(SlideProduct.class, idSlideProduct);
        /*
        //
        // Check to see if there are any slide designs attached.  If so, disallow
        // the delete.
        //
        if (slideProduct.getSlideDesigns() != null && slideProduct.getSlideDesigns().size() > 0) {
          StringBuffer buf = new StringBuffer();
          for(Iterator i = slideProduct.getSlideDesigns().iterator(); i.hasNext();) {
            SlideDesign sd = (SlideDesign)i.next();
            buf.append(sd.getName());
            if (i.hasNext()) {
              buf.append(", ");
            }
          }
          this.addInvalidField("slideDesigns", "Slide(s) " + buf.toString() + " must be unassigned from the slide set before the slide set can be deleted." );
        }
         */

        //
        // Delete slide
        //
        if (this.isValid()) {
          // first iterate through the slide designs and delete the array coords because the cannot not be mapped
          // because of some odd bug in dictionary manager
          Iterator sdIter = slideProduct.getSlideDesigns().iterator();
          while (sdIter.hasNext()) {
            SlideDesign sd = (SlideDesign) sdIter.next();
            //
            // Delete array coordinates
            //
            List arrayCoords = sess.createQuery("SELECT ac from ArrayCoordinate ac where ac.idSlideDesign = " + sd.getIdSlideDesign()).list();
            for(Iterator i = arrayCoords.iterator(); i.hasNext();) {
              ArrayCoordinate ac  = (ArrayCoordinate)i.next();
              sess.delete(ac);
            }

          }
          sess.delete(slideProduct);
          sess.flush();
        }


        this.xmlResult = "<SUCCESS/>";

        setResponsePage(this.SUCCESS_JSP);

      } else {
        this.addInvalidField("insufficient permission", "Insufficient permissions to delete slide set.");
        setResponsePage(this.ERROR_JSP);
      }
    }catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in DeleteSlideSet ", e);

      throw new RollBackCommandException(e.getMessage());

    }


    // see if we have a valid form
    if (isValid()) {
      setResponsePage(this.SUCCESS_JSP);
    } else {
      setResponsePage(this.ERROR_JSP);
    }

    return this;
  }






}
