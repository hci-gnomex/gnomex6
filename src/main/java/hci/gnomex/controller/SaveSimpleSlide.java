package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.Application;
import hci.gnomex.model.SlideDesign;
import hci.gnomex.model.SlideProduct;
import hci.gnomex.utility.ApplicationParser;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.io.StringReader;
import java.util.*;

public class SaveSimpleSlide extends GNomExCommand implements Serializable {

  private SlideProduct slideInfo;
  private SlideProduct slideProduct;
  private SlideDesign slideDesign;
  private String idSlideProduct;
  private String idSlideDesign;
  
  private String applicationXMLString = null;
  private Document mcDoc;
  private ApplicationParser applicationParser;


	// the static field for logging in Log4J
	private static Logger LOG = Logger.getLogger(SaveSimpleSlide.class);


	public void validate() {}

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session)
  {
    slideInfo = new SlideProduct();
    HashMap errors = this.loadDetailObject(request, slideInfo);
    this.addInvalidFields(errors);
    
    if(request.getParameter("idSlideProduct") != null && !request.getParameter("idSlideProduct").equals("")){
      idSlideProduct = request.getParameter("idSlideProduct");
    }
    
    if(request.getParameter("idSlideDesign") != null && !request.getParameter("idSlideDesign").equals("")){
      idSlideDesign = request.getParameter("idSlideDesign");
    }
    
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

  }
    

  public Command execute() throws RollBackCommandException {
   try{
      Session sess = HibernateSession.currentSession(this.getUsername());
      
      if(idSlideProduct != null && !idSlideProduct.equals("")){
        slideProduct = (SlideProduct) sess.load(SlideProduct.class, Integer.parseInt(idSlideProduct));
      }
      else{
        slideProduct = new SlideProduct();
      }
      
      if(idSlideDesign != null && !idSlideDesign.equals("")){
        slideDesign = (SlideDesign) sess.load(SlideDesign.class, Integer.parseInt(idSlideDesign));
      }
      else{
        slideDesign = new SlideDesign();
      }
      
      applicationParser.parse(sess);
      
      slideProduct.setName(slideInfo.getName());
      slideProduct.setIdVendor(slideInfo.getIdVendor());
      slideProduct.setIdOrganism(slideInfo.getIdOrganism());
      slideProduct.setIsActive(slideInfo.getIsActive());
      slideProduct.setIsCustom("N");
      slideProduct.setIsSlideSet("N");
      slideProduct.setArraysPerSlide(1);
      slideProduct.setSlidesInSet(1);
      saveApplications(slideProduct, applicationParser);
      
      sess.save(slideProduct);
      sess.flush();
      
      StringBuffer query = new StringBuffer("SELECT sp from SlideProduct sp");
      //query.append(" where sp.name=" + slideInfo.getName());
      List slide = sess.createQuery(query.toString()).list();
      
      for(int i = slide.size()-2; i < slide.size(); i++){
        SlideProduct temp = (SlideProduct) slide.get(i);
        
        if(temp.getName().equals(slideInfo.getName())){
          slideDesign.setName(slideInfo.getName());
          slideDesign.setIsActive(slideInfo.getIsActive());
          slideDesign.setIdSlideProduct(temp.getIdSlideProduct()); 
        }
      }
      sess.save(slideDesign);
      sess.flush();
   }

   catch (Exception e) {
       this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in SaveSimpleSlide ", e);
     throw new RollBackCommandException(e.getMessage());
   }

   this.xmlResult = "<SUCCESS idSlideProduct=\"" + slideProduct.getIdSlideProduct() + "\"" 
   + "idSlideDesign=\"" + slideDesign.getIdSlideDesign() + "\"" + "/>";
   setResponsePage(this.SUCCESS_JSP);
    return this;
  }
      

      
      
  private void saveApplications(SlideProduct slideProduct, ApplicationParser applicationParser) {
    if (applicationParser != null) {
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
    
  }

     
       
  }


