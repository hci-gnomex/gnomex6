package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.DataTrackFolder;
import hci.gnomex.model.GenomeBuild;
import hci.gnomex.model.GenomeBuildAlias;
import hci.gnomex.model.Segment;
import hci.gnomex.utility.DictionaryHelper;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.exception.ConstraintViolationException;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.Iterator;


public class DeleteGenomeBuild extends GNomExCommand implements Serializable {



  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(DeleteGenomeBuild.class);


  private Integer      idGenomeBuild = null;




  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

   if (request.getParameter("idGenomeBuild") != null && !request.getParameter("idGenomeBuild").equals("")) {
     idGenomeBuild = Integer.valueOf(request.getParameter("idGenomeBuild"));
   } else {
     this.addInvalidField("idGenomeBuild", "idGenomeBuild is required.");
   }

  }

  public Command execute() throws RollBackCommandException {
    Session sess = null;
    GenomeBuild genomeBuild = null;

    try {
      sess = HibernateSession.currentSession(this.getUsername());
      genomeBuild = (GenomeBuild)sess.load(GenomeBuild.class, idGenomeBuild);

      // Check permissions
      if (this.getSecAdvisor().canDelete(genomeBuild)) {

        // Delete the root annotation grouping
        DataTrackFolder dtFolder = genomeBuild.getRootDataTrackFolder();
        if (dtFolder != null) {
          // Make sure the root annotation grouping has no children
          if (dtFolder.getFolders().size() > 0 || dtFolder.getDataTracks().size() > 0) {
            throw new Exception("The data tracks for" + genomeBuild.getGenomeBuildName() + " must be deleted first.");
          }
          sess.delete(dtFolder);
        }

        // Delete segments
        for (Iterator<?> i = genomeBuild.getSegments().iterator(); i.hasNext();) {
          Segment segment = Segment.class.cast(i.next());
          sess.delete(segment);
        }

        // Delete aliases
        for (Iterator<?> i = genomeBuild.getAliases().iterator(); i.hasNext();) {
          GenomeBuildAlias alias = GenomeBuildAlias.class.cast(i.next());
          sess.delete(alias);
        }


        //
        // Delete genomeBuild
        //
        sess.delete(genomeBuild);


        sess.flush();


        DictionaryHelper.reload(sess);

        this.xmlResult = "<SUCCESS/>";

        setResponsePage(this.SUCCESS_JSP);

      } else {
        this.addInvalidField("insufficient permission", "Insufficient permissions to delete genome build.");
        setResponsePage(this.ERROR_JSP);
      }
    } catch (ConstraintViolationException ce) {
      this.addInvalidField("constraint", "Unable to delete because genome build is associated with other objects in the database.");

      try {
        sess.clear();
        genomeBuild = (GenomeBuild)sess.load(GenomeBuild.class, idGenomeBuild);
        genomeBuild.setIsActive("N");
        sess.flush();
      } catch(Exception e) {
        this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in DeleteGenomeBuild when trying to inactivate genome build ", e);

        throw new RollBackCommandException(e.getMessage());

      }

    } catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in DeleteGenomeBuild ", e);

      throw new RollBackCommandException(e.getMessage());

    }

    return this;
  }






}
