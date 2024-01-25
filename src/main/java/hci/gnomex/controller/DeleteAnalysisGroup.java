package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.AnalysisGroup;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Hibernate;
import org.hibernate.Session;

import javax.servlet.http.HttpSession;
import java.io.Serializable;



public class DeleteAnalysisGroup extends GNomExCommand implements Serializable {



  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(DeleteAnalysisGroup.class);


  private Integer      idAnalysisGroup = null;




  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

   if (request.getParameter("idAnalysisGroup") != null && !request.getParameter("idAnalysisGroup").equals("")) {
     idAnalysisGroup = Integer.valueOf(request.getParameter("idAnalysisGroup"));
   } else {
     this.addInvalidField("idAnalysisGroup", "idAnalysisGroup is required.");
   }

  }

  public Command execute() throws RollBackCommandException {
    try {

      Session sess = HibernateSession.currentSession(this.getUsername());

      AnalysisGroup analysisGroup = (AnalysisGroup)sess.load(AnalysisGroup.class, idAnalysisGroup);

      if (this.getSecAdvisor().canDelete(analysisGroup)) {

        //
        // Initialize the analysis items.  We don't want to orphan them unintentionally.
        //
        Hibernate.initialize(analysisGroup.getAnalysisItems());
        if (analysisGroup.getAnalysisItems().size() > 0) {
          this.addInvalidField("analysisGroup with analysis",
              "Analysis Group cannot be deleted because it has analysis.  Please reassign analysis items to another analysis group before deleting.");
        }

        if (this.isValid()) {

          //
          // Delete AnalysisGroup
          //
          sess.delete(analysisGroup);

          sess.flush();



          this.xmlResult = "<SUCCESS/>";
          setResponsePage(this.SUCCESS_JSP);

        } else {
          this.setResponsePage(this.ERROR_JSP);
        }




      } else {
        this.addInvalidField("Insufficient permissions", "Insufficient permissions to delete analysisGroup.");
        this.setResponsePage(this.ERROR_JSP);
      }
    }catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in DeleteAnalysisGroup ", e);
      throw new RollBackCommandException(e.getMessage());

    }
    return this;
  }






}
