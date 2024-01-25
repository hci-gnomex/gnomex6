package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.Application;
import hci.gnomex.model.ArrayCoordinate;
import hci.gnomex.model.SlideDesign;
import hci.gnomex.model.SlideProduct;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.io.StringReader;
import java.util.*;


public class SaveSlideDesign extends GNomExCommand implements Serializable {
  
 
  
  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(SaveSlideDesign.class);
  
  private boolean     isNewSlideProduct = false;
  
  private SlideDesign  slideDesignScreen;
  private SlideProduct slideProductScreen;
  
  private String       isInSlideSet = "N";
 
  
  private SlideDesign  slideDesign;
  private SlideProduct slideProduct;
  private SlideProduct slideProductOldAssigned;
  
  private Integer      idSlideProductOld = null;
  private Integer      idSlideProductScreen = null;
  
  private String                    arrayCoordinateXMLString = null;
  private Document                  acDoc;
  private ArrayCoordinateParser     acParser;
  
  private String                    applicationXMLString = null;
  private Document                  mcDoc;
  private ApplicationParser  applicationParser;
  
  public void validate() {
  }
  
  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
    
    
    if (request.getParameter("slideSet") != null && !request.getParameter("slideSet").equals("")) {
      String slideSet = request.getParameter("slideSet");
      int n = Integer.parseInt(slideSet);
      idSlideProductScreen = n;
    }
    if (request.getParameter("isInSlideSet") != null && !request.getParameter("isInSlideSet").equals("")) {
      isInSlideSet = request.getParameter("isInSlideSet");
    }
    
    slideDesignScreen = new SlideDesign();
    HashMap errors = this.loadDetailObject(request, slideDesignScreen);
    this.addInvalidFields(errors);
    
    slideProductScreen = new SlideProduct();
    errors = this.loadDetailObject(request, slideProductScreen);
    this.addInvalidFields(errors);

    
    if (request.getParameter("applicationXMLString") != null && !request.getParameter("applicationXMLString").equals("")) {
      applicationXMLString = request.getParameter("applicationXMLString");
      
      StringReader reader = new StringReader(applicationXMLString);
      try {
        SAXBuilder sax = new SAXBuilder();
        mcDoc = sax.build(reader);
        applicationParser = new ApplicationParser(mcDoc);
      } catch (JDOMException je ) {
        LOG.error( "Cannot parse applicationXMLString", je );
        this.addInvalidField( "applicationXMLString", "Invalid applicationXMLString");
      }
    }

    if (request.getParameter("arrayCoordinateXMLString") != null && !request.getParameter("arrayCoordinateXMLString").equals("")) {
      arrayCoordinateXMLString = request.getParameter("arrayCoordinateXMLString");
      
      StringReader reader = new StringReader(arrayCoordinateXMLString);
      try {
        SAXBuilder sax = new SAXBuilder();
        acDoc = sax.build(reader);
        acParser = new ArrayCoordinateParser(acDoc);
      } catch (JDOMException je ) {
        LOG.error( "Cannot parse arrayCoordinateXMLString", je );
        this.addInvalidField( "arrayCoordinateXMLString", "Invalid arrayCoordinateXMLString");
      }
    }
  }

  public Command execute() throws RollBackCommandException {
    
    try {
      Session sess = HibernateSession.currentSession(this.getUsername());

      if (this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_WORKFLOW)) {
        // Parse array coordinate xml
        if (acParser != null) {
          acParser.parse(sess);
        }

        // Parse microarray category xml
        if (applicationParser != null) {
          applicationParser.parse(sess);
        }
        
        
        // If this is an existing slide design, find it.
        if (slideDesignScreen.getIdSlideDesign() != null && slideDesignScreen.getIdSlideDesign().intValue() != 0) {
          slideDesign = (SlideDesign)sess.load(SlideDesign.class, slideDesignScreen.getIdSlideDesign());
          
          // Find the old slide product assigned to the existing slide design
          if (slideDesign.getIdSlideProduct() != null) {
            slideProductOldAssigned = (SlideProduct)sess.load(SlideProduct.class, slideDesign.getIdSlideProduct());            
          }
        }
        

        
        // Create new Slide Product when this is a new slide design and it is 
        // not part of a set -or- this is an existing slide design that has
        // been changed to not be part of a slide set
        if (idSlideProductScreen == null && isInSlideSet.equals("N")) {          
          if (slideDesignScreen.getIdSlideDesign().intValue() == 0 ||
              (slideDesign != null && slideProductOldAssigned != null && slideProductOldAssigned.getIsSlideSet().equals("Y"))){
            slideProduct = new SlideProduct();
            isNewSlideProduct = true;

            initializeSlideProduct();

            slideProduct.setName(slideDesignScreen.getName());
            slideProduct.setSlidesInSet(1);
            slideProduct.setIsSlideSet("N");

            sess.save(slideProduct);
            
          } else {
            slideProduct = (SlideProduct)sess.load(SlideProduct.class, idSlideProductScreen);
            initializeSlideProduct();
            if (slideProduct.getIsSlideSet().equals("N")) {
              slideProduct.setName(slideDesignScreen.getName());
            }
          }
        } else {
          slideProduct = (SlideProduct)sess.load(SlideProduct.class, idSlideProductScreen);
          
          if (isInSlideSet.equals("N")) {
            initializeSlideProduct();            
          }
          if (slideProduct.getIsSlideSet().equals("N")) {
            slideProduct.setName(slideDesignScreen.getName());              
          }
            
        }
        
        
        //
        // Save slide design
        //      
        if (slideDesignScreen.getIdSlideDesign() == null || slideDesignScreen.getIdSlideDesign().intValue() == 0) {
          // Insert  Slide
          slideDesign = new SlideDesign();
          slideDesign.setIsActive("Y");
          
          initializeSlideDesign();
        } else {
          // Update Slide
          slideDesign = (SlideDesign)sess.load(SlideDesign.class, slideDesignScreen.getIdSlideDesign());

          initializeSlideDesign();
        }
        sess.save(slideDesign);
        
        if (acParser != null) {
          //
          // Save array coordinates
          //
          List existingArrayCoordinates = sess.createQuery("SELECT ac from ArrayCoordinate ac where ac.idSlideDesign = " + slideDesign.getIdSlideDesign()).list();
          for(Iterator i = acParser.getArrayCoordinateMap().keySet().iterator(); i.hasNext();) {
            String idArrayCoordinateString = (String)i.next();
            ArrayCoordinate ac = (ArrayCoordinate)acParser.getArrayCoordinateMap().get(idArrayCoordinateString);
            
            if (ac.getIdSlideDesign() == null) {
              ac.setIdSlideDesign(slideDesign.getIdSlideDesign());          
            }
            sess.save(ac);
          }
          
          // Remove array coordinates no longer in the list
          
          List arrayCoordinatesToRemove = new ArrayList();
          for (Iterator i = existingArrayCoordinates.iterator(); i.hasNext();) {
            ArrayCoordinate ac = (ArrayCoordinate) i.next();
            if (!acParser.getArrayCoordinateMap().containsKey(ac.getIdArrayCoordinate().toString())) {
              arrayCoordinatesToRemove.add(ac);
            }
          }
          for (Iterator i = arrayCoordinatesToRemove.iterator(); i.hasNext();) {
            ArrayCoordinate ac = (ArrayCoordinate) i.next();
            sess.delete(ac);
          }        
        }
        
        if (applicationParser != null && isInSlideSet.equals("N")) {
          //
          // Save applications
          //
          Set applications = new TreeSet();
          for(Iterator i = applicationParser.getCodeApplicationMap().keySet().iterator(); i.hasNext();) {
            String codeApplication = (String)i.next();
            Application application = (Application)applicationParser.getCodeApplicationMap().get(codeApplication);
            applications.add(application);
          }
          slideProduct.setApplications(applications);
        }
        
        sess.flush();
        

        // Set the slide count on the slide product
        List slideDesignCount = sess.createQuery("SELECT sd.idSlideDesign from SlideProduct sp JOIN sp.slideDesigns sd WHERE sp.idSlideProduct = " + slideProduct.getIdSlideProduct()).list();
        slideProduct.setSlidesInSet(Integer.valueOf(slideDesignCount.size()));
        if (isInSlideSet.equals("Y") && slideProduct.getSlidesInSet().intValue() == 1) {
          slideProduct.setSlidesInSet(2);
        }
        sess.flush();
        
        // If we have reassigned the slide product, delete the old one if it is now orphaned
        /*
         * Not reassigning slides
        if (slideProduct != null &&
            slideProductOldAssigned != null && 
            slideProductOldAssigned.getIdSlideProduct().intValue() != slideProduct.getIdSlideProduct().intValue() &&
            slideProductOldAssigned.getIsSlideSet().equals("N")) {
          sess.refresh(slideProductOldAssigned);
          if (slideProductOldAssigned.getSlideDesigns().size() == 0) {
            sess.delete(slideProductOldAssigned);
            sess.flush();
          }
        }
        */
        
        this.xmlResult = "<SUCCESS idSlideDesign=\"" + slideDesign.getIdSlideDesign() + "\"/>";
      
        setResponsePage(this.SUCCESS_JSP);
        
      } else {
        this.addInvalidField("Insufficient permissions", "Insufficient permission to save slide design.");
        setResponsePage(this.ERROR_JSP);
      }
    }catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in SaveSlideDesign ", e);
      throw new RollBackCommandException(e.getMessage());
        
    }
    
    return this;
  }
  
  private void initializeSlideProduct() {
    
    slideProduct.setIdOrganism(slideProductScreen.getIdOrganism());
    slideProduct.setIdVendor(slideProductScreen.getIdVendor());
    slideProduct.setArraysPerSlide(slideProductScreen.getArraysPerSlide());
    slideProduct.setIsCustom(slideProductScreen.getIsCustom());
    slideProduct.setIdLab(slideProductScreen.getIdLab());
    slideProduct.setIsActive(slideProductScreen.getIsActive());
    slideProduct.setCatalogNumber(slideProductScreen.getCatalogNumber());
    slideProduct.setIdBillingSlideProductClass(slideProductScreen.getIdBillingSlideProductClass());
    slideProduct.setIdBillingSlideServiceClass(slideProductScreen.getIdBillingSlideServiceClass());
    
    if(slideProductScreen.getArraysPerSlide() == null || 
       slideProductScreen.getArraysPerSlide().intValue() == 0) {
      slideProduct.setArraysPerSlide(1);
    }

  }

  private void initializeSlideDesign() {
    
    if (slideDesign.getIdSlideProduct() != null && idSlideProductScreen != null && 
        slideDesign.getIdSlideProduct().intValue() != idSlideProductScreen.intValue() ) {
      idSlideProductOld = slideDesign.getIdSlideProduct();
    } else if (slideDesign.getIdSlideProduct() != null && idSlideProductScreen == null) {
      idSlideProductOld = slideDesign.getIdSlideProduct();
    }
    
    
    slideDesign.setSlideDesignProtocolName(slideDesignScreen.getSlideDesignProtocolName());
    slideDesign.setIdSlideProduct(slideProduct.getIdSlideProduct());      
    slideDesign.setName(slideDesignScreen.getName());   
    slideDesign.setAccessionNumberArrayExpress(slideDesignScreen.getAccessionNumberArrayExpress());
    slideDesign.setIsActive(slideDesignScreen.getIsActive());
  }
    

}
