package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.SlideProduct;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.HashMap;



public class SaveSlideSet extends GNomExCommand implements Serializable {
  
  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(SaveSlideSet.class);
  

  private SlideProduct               slideSetScreen;
  
  
  public void validate() {
  }
  
  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
    
    slideSetScreen = new SlideProduct();
    HashMap errors = this.loadDetailObject(request, slideSetScreen);
    this.addInvalidFields(errors);
    
   
  }

  public Command execute() throws RollBackCommandException {
    
    try {
      Session sess = HibernateSession.currentSession(this.getUsername());
      
      if (this.getSecurityAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_WORKFLOW)) {
        
        SlideProduct slideSet = null;
        if (slideSetScreen.getIdSlideProduct() == null || slideSetScreen.getIdSlideProduct().intValue() == 0) {
          slideSet = new SlideProduct();
          slideSet.setName(slideSetScreen.getName());
          slideSet.setIsActive("Y");
          slideSet.setArraysPerSlide(99);
          slideSet.setIsSlideSet("Y");
          
          sess.save(slideSet);
          
        } else {
          slideSet = (SlideProduct)sess.load(SlideProduct.class, slideSetScreen.getIdSlideProduct());
          slideSet.setName(slideSetScreen.getName());            
        }
       
        
        sess.flush();

        
        this.xmlResult = "<SUCCESS idSlideProduct=\"" + slideSet.getIdSlideProduct() + "\"/>";
      
        setResponsePage(this.SUCCESS_JSP);
      } else {
        this.addInvalidField("Insufficient permissions", "Insufficient permission to save slide set.");
        setResponsePage(this.ERROR_JSP);
      }
      
      
    }catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in SaveSlideSet ", e);

      throw new RollBackCommandException(e.getMessage());
        
    }
    
    return this;
  }
  
  

}
