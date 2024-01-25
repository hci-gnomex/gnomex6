package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.gnomex.model.Analysis;
import hci.gnomex.model.DataTrack;
import hci.gnomex.model.Request;
import hci.gnomex.model.Topic;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.*;


public class DeleteTopic extends GNomExCommand implements Serializable {



  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(DeleteTopic.class);


  private Integer      idTopic = null;




  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

   if (request.getParameter("idTopic") != null && !request.getParameter("idTopic").equals("")) {
     idTopic = Integer.valueOf(request.getParameter("idTopic"));
   } else {
     this.addInvalidField("idTopic", "idTopic is required.");
   }

  }

  public Command execute() throws RollBackCommandException {
    Session sess = null;
    Topic topic = null;

    try {
      sess = HibernateSession.currentSession(this.getUsername());
      topic = (Topic)sess.load(Topic.class, idTopic);

      // Check permissions
      if (this.getSecAdvisor().canDelete(topic)) {

        List<Object> descendents = new ArrayList<Object>();
        descendents.add(topic);
        topic.recurseGetChildren(descendents);


        // Make sure the user has permission to delete this topic and all of its
        // descendant topics
        for(Iterator<?> i = descendents.iterator(); i.hasNext();) {
          DetailObject descendent = (DetailObject)i.next();
          if (!this.getSecAdvisor().canDelete(descendent)) {
            if (descendent.equals(topic)) {
              this.addInvalidField("folderp", "Insufficient permision to delete this topic.");
              break;
            } else if (descendent instanceof Topic){
              Topic ct = (Topic)descendent;
              this.addInvalidField("cfolderp", "Insufficent permission to delete child topic '" + ct.getName() + "'.");
              break;
            }
          }
        }


        // Now delete all of the contents of the topics and then the
        // topic folder itself.  By traversing the list from the
        // in reverse, we are sure to delete the children before the parent
        // folder.
        if (this.isValid()) {
          for(int i = descendents.size() - 1; i >= 0; i--) {
            Object descendent = descendents.get(i);
            if (descendent instanceof Topic) {
              // Remove links to all child experiments, analyses, and datatracks
              Topic t = (Topic)descendent;
              Set<Request> emptyRequests = new TreeSet<Request>();
              Set<Analysis> emptyAnalyses = new TreeSet<Analysis>();
              Set<DataTrack> emptyDataTracks = new TreeSet<DataTrack>();
              t.setRequests(emptyRequests);
              t.setAnalyses(emptyAnalyses);
              t.setDataTracks(emptyDataTracks);
              // Delete the topic
              sess.delete(descendent);
            }
          }
        }


        if (this.isValid()) {
          sess.flush();
          this.xmlResult = "<SUCCESS/>";
          setResponsePage(this.SUCCESS_JSP);

        } else {
          setResponsePage(this.ERROR_JSP);
        }

      } else {
        this.addInvalidField("insufficient permission", "Insufficient permissions to delete topic folder.");
        setResponsePage(this.ERROR_JSP);
      }
    } catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in DeleteTopic ", e);

      throw new RollBackCommandException(e.getMessage());

    }

    return this;
  }
}
