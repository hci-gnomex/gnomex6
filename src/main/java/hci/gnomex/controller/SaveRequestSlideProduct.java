package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.Hybridization;
import hci.gnomex.model.Request;
import hci.gnomex.model.SlideDesign;
import hci.gnomex.model.SlideProduct;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.Iterator;



public class SaveRequestSlideProduct extends GNomExCommand implements Serializable {
  
 
  
  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(SaveRequest.class);
  

  
  private Request    request;
  private Integer    idSlideProduct;
  private Integer    idRequest;

  
  
  public void validate() {
  }
  
  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
    
    
    
    if (request.getParameter("idSlideProduct") != null && !request.getParameter("idSlideProduct").equals("")) {
      idSlideProduct = Integer.valueOf(request.getParameter("idSlideProduct"));
    } else {
      this.addInvalidField("idSlideProduct", "idSlideProduct is required");
    }
    
    if (request.getParameter("idRequest") != null && !request.getParameter("idRequest").equals("")) {
      idRequest = Integer.valueOf(request.getParameter("idRequest"));
    } else {
      this.addInvalidField("idRequest", "idRequest is required");
    }
    
  }

  public Command execute() throws RollBackCommandException {
    
    try {
      Session sess = HibernateSession.currentSession(this.getUsername());
      
      request = (Request)sess.load(Request.class, idRequest);
      
      if (this.getSecAdvisor().canUpdate(request)) {
        request.setIdSlideProduct(idSlideProduct);            

        // For non-slide sets, reassign the slide design 
        SlideProduct slideProduct = (SlideProduct)sess.get(SlideProduct.class, idSlideProduct);
        if (slideProduct.getSlidesInSet() == null || slideProduct.getSlidesInSet().intValue() == 1) {
          SlideDesign newSlideDesign = (SlideDesign)slideProduct.getSlideDesigns().iterator().next();
          for(Iterator i = request.getHybridizations().iterator(); i.hasNext();) {
            Hybridization hyb = (Hybridization)i.next();
            hyb.setIdSlideDesign(newSlideDesign.getIdSlideDesign());
          }
        }
        // For slide sets, blank out the hyb slide design
        else {
          for (Iterator i = request.getHybridizations().iterator(); i.hasNext();) {
            Hybridization hyb = (Hybridization) i.next();
            hyb.setIdSlideDesign(null);
          }
        }
        
        sess.flush();

        

        this.xmlResult = "<SUCCESS idRequest=\"" + request.getIdRequest() + "\"/>";
      
        setResponsePage(this.SUCCESS_JSP);        
      } else {
        this.addInvalidField("Insufficient permissions", "Insufficient permission to modify request.");
        setResponsePage(this.ERROR_JSP);
      }
    }catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in SaveRequestSlideProject ", e);
      throw new RollBackCommandException(e.getMessage());
        
    }
    
    return this;
  }
  
  
  

}
