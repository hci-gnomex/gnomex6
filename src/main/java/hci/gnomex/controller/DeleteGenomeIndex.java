package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.GenomeIndex;
import hci.gnomex.utility.DictionaryHelper;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.exception.ConstraintViolationException;

import javax.servlet.http.HttpSession;
import java.io.Serializable;



public class DeleteGenomeIndex extends GNomExCommand implements Serializable {



  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(DeleteGenomeIndex.class);


  private Integer      idGenomeIndex = null;

  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

   if (request.getParameter("idGenomeIndex") != null && !request.getParameter("idGenomeIndex").equals("")) {
     idGenomeIndex = Integer.valueOf(request.getParameter("idGenomeIndex"));
   } else {
     this.addInvalidField("idGenomeIndex", "idGenomeIndex is required.");
   }

  }

  public Command execute() throws RollBackCommandException {
    Session sess = null;
    GenomeIndex gnIdx = null;

    try {
      sess = HibernateSession.currentSession(this.getUsername());
      gnIdx = (GenomeIndex)sess.load(GenomeIndex.class, idGenomeIndex);

      // Check permissions
      if (this.getSecAdvisor().canDelete(gnIdx)) {

        //
        // Delete property
        //
        sess.delete(gnIdx);


        sess.flush();


        DictionaryHelper.reload(sess);

        this.xmlResult = "<SUCCESS/>";

        setResponsePage(this.SUCCESS_JSP);

      } else {
        this.addInvalidField("insufficient permission", "Insufficient permissions to delete property.");
        setResponsePage(this.ERROR_JSP);
      }
    } catch (ConstraintViolationException ce) {
      this.addInvalidField("constraint", "GenomeIndex set to inactive.  Unable to delete because of existing records.");

      try {
        sess.clear();
        gnIdx = (GenomeIndex)sess.load(GenomeIndex.class, idGenomeIndex);
        gnIdx.setIsActive("N");
        sess.flush();
      } catch(Exception e) {
        this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in DeleteGenomeIndex when trying to inactivate property ", e);

        throw new RollBackCommandException(e.getMessage());

      }

    } catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in DeleteGenomeIndex ", e);

      throw new RollBackCommandException(e.getMessage());

    }

    return this;
  }






}
