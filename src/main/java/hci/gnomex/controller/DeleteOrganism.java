package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.GenomeBuild;
import hci.gnomex.model.Organism;
import hci.gnomex.utility.DictionaryHelper;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Element;

import javax.json.Json;
import javax.persistence.PersistenceException;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.Iterator;
import java.util.List;



public class DeleteOrganism extends GNomExCommand implements Serializable {



  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(DeleteOrganism.class);


  private Integer      idOrganism = null;




  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

   if (request.getParameter("idOrganism") != null && !request.getParameter("idOrganism").equals("")) {
     idOrganism = Integer.valueOf(request.getParameter("idOrganism"));
   } else {
     this.addInvalidField("idOrganism", "idOrganism is required.");
   }

  }

  public Command execute() throws RollBackCommandException {
    Session sess = null;
    Organism organism = null;

    try {
      sess = HibernateSession.currentSession(this.getUsername());
      organism = (Organism)sess.load(Organism.class, idOrganism);

      // Check permissions
      if (this.getSecAdvisor().canDelete(organism)) {



        //
        // First delete associated genome builds
        //
        StringBuilder query = new StringBuilder("SELECT gb from GenomeBuild gb");
        query.append(" where gb.idOrganism=");
        query.append(organism.getIdOrganism());
        query.append(" order by gb.genomeBuildName");
        List genomeBuilds = sess.createQuery(query.toString()).list();

        if (!genomeBuilds.isEmpty()) {
          Element gbEle = new Element("genomeBuilds");
          for(Iterator j = genomeBuilds.iterator(); j.hasNext();) {
            GenomeBuild gb = (GenomeBuild)j.next();
            sess.delete(gb);
          }
        }

        sess.flush();


        //
        // Delete organism
        //
        sess.delete(organism);


        sess.flush();


        DictionaryHelper.reload(sess);

        this.jsonResult = Json.createObjectBuilder().add("result", "SUCCESS").build().toString();

        setResponsePage(this.SUCCESS_JSP);

      } else {
        this.addInvalidField("insufficient permission", "Insufficient permissions to delete organism.");
        setResponsePage(this.ERROR_JSP);
      }
    } catch (PersistenceException ce) {
      //this.addInvalidField("constraint", "Organism set to inactive.  Unable to delete because organism is referenced on existing db objects.");

      try {
        sess.clear();
        organism = sess.load(Organism.class, idOrganism);
        organism.setIsActive("N");
        sess.flush();
      } catch(Exception e) {
        this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in DeleteOrganism when trying to inactivate organism ", e);

        throw new RollBackCommandException(e.getMessage());

      }

      this.jsonResult = Json.createObjectBuilder()
              .add("result", "INVALID")
              .add("message", "Organism is referenced on existing db objects so it was inactivated")
              .build().toString();
      setResponsePage(this.SUCCESS_JSP);

    } catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in DeleteOrganism ", e);

      throw new RollBackCommandException(e.getMessage());

    }

    return this;
  }






}
