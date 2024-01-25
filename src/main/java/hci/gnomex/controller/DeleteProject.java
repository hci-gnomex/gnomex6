package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.Project;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Hibernate;
import org.hibernate.Session;

import javax.servlet.http.HttpSession;
import java.io.Serializable;



public class DeleteProject extends GNomExCommand implements Serializable {



  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(DeleteProject.class);


  private Integer      idProject = null;




  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

   if (request.getParameter("idProject") != null && !request.getParameter("idProject").equals("")) {
     idProject = Integer.valueOf(request.getParameter("idProject"));
   } else {
     this.addInvalidField("idProject", "idProject is required.");
   }

  }

  public Command execute() throws RollBackCommandException {
    try {

      Session sess = HibernateSession.currentSession(this.getUsername());

      Project project = (Project)sess.load(Project.class, idProject);

      if (this.getSecAdvisor().canDelete(project)) {

        //
        // Initialize the requests.  We don't want to orphan them unintentionally.
        //
        Hibernate.initialize(project.getRequests());
        if (project.getRequests().size() > 0) {
          this.addInvalidField("project with requests",
              "Project cannot be deleted because it has experiments.  Please reassign experiments to another project before deleting.");
        }

        if (this.isValid()) {

          //
          // Delete Project
          //
          sess.delete(project);

          sess.flush();



          this.xmlResult = "<SUCCESS/>";
          setResponsePage(this.SUCCESS_JSP);

        } else {
          this.setResponsePage(this.ERROR_JSP);
        }




      } else {
        this.addInvalidField("Insufficient permissions", "Insufficient permissions to delete project.");
        this.setResponsePage(this.ERROR_JSP);
      }
    }catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in DeleteProject ", e);

      throw new RollBackCommandException(e.getMessage());

    }

    return this;
  }






}
