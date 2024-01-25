package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.Analysis;
import hci.gnomex.model.DataTrack;
import hci.gnomex.model.Request;
import hci.gnomex.model.Topic;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.Iterator;
import java.util.Set;
import java.util.TreeSet;


public class MoveOrCopyTopic extends GNomExCommand implements Serializable {



  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(MoveOrCopyTopic.class);

  private Integer idTopic = null;
  private Integer idParentTopicNew = null;

  private boolean isMove = false;

  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    if (request.getParameter("idTopic") != null && !request.getParameter("idTopic").equals("")) {
      idTopic = Integer.valueOf(request.getParameter("idTopic"));
    } else {
      this.addInvalidField("Missing idTopic", "idTopic is required.");
    }

    if (request.getParameter("idParentTopicNew") != null && !request.getParameter("idParentTopicNew").equals("")) {
      idParentTopicNew = Integer.valueOf(request.getParameter("idParentTopicNew"));
    }


    if (request.getParameter("isMove") != null && !request.getParameter("isMove").equals("")) {
      // If move or copy make sure idTopicOld present as well
      if(request.getParameter("isMove").compareTo("Y") == 0) {
        isMove = true;
      }
    } else {
      this.addInvalidField("Missing isMove", "isMove is required.");
    }
  }

  public Command execute() throws RollBackCommandException {
    Session sess = null;
    Topic topic = null;
    boolean topicUpdated = false;

    try {
      sess = HibernateSession.currentSession(this.getUsername());

      if (this.isValid()) {
        topic = (Topic)sess.load(Topic.class, idTopic);
        if(isMove) {
          topic.setIdParentTopic(idParentTopicNew);
          sess.save(topic);
          sess.flush();
          topicUpdated = true;
        } else {
          Topic topicCopy = copyTopic(sess, topic, idParentTopicNew);
          if(topicCopy != null) {
            idTopic = topicCopy.getIdTopic();
            topicUpdated = true;
          }
        }
      }
      if (topicUpdated) {
        this.xmlResult = "<SUCCESS idTopic=\"" + idTopic + "\"/>";
        setResponsePage(this.SUCCESS_JSP);
      } else {
        setResponsePage(this.ERROR_JSP);
      }
    } catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in MoveOrCopyTopic ", e);

      throw new RollBackCommandException(e.getMessage());

    }

    return this;
  }

  private Topic copyTopic(Session sess, Topic topic, Integer idParentTopic) throws RollBackCommandException {
    Topic topicCopy = new Topic();
    try {
      topicCopy.setName(topic.getName());
      topicCopy.setDescription(topic.getDescription());
      topicCopy.setIdParentTopic(idParentTopic);
      topicCopy.setIdLab(topic.getIdLab());
      topicCopy.setCreatedBy(this.getSecAdvisor().getUID());
      topicCopy.setCreateDate(new java.sql.Date(System.currentTimeMillis()));
      topicCopy.setIdAppUser(this.getSecAdvisor().getIdAppUser());
      topicCopy.setCodeVisibility(topic.getCodeVisibility());

      // Save copy of requests
      Set<Request> newRequests = new TreeSet<Request>(new RequestComparator());
      for (Iterator<?> i = topic.getRequests().iterator(); i.hasNext(); ) {
        Request r = (Request) i.next();
        newRequests.add(r);
      }
      topicCopy.setRequests(newRequests);

      // Save copy of analyses
      Set<Analysis> newAnalyses = new TreeSet<Analysis>(new AnalysisComparator());
      for (Iterator<?> i = topic.getAnalyses().iterator(); i.hasNext(); ) {
        Analysis a = (Analysis) i.next();
        newAnalyses.add(a);
      }
      topicCopy.setAnalyses(newAnalyses);

      // Save copy of datatracks
      Set<DataTrack> newDataTracks = new TreeSet<DataTrack>(new DataTrackComparator());
      for (Iterator<?> i = topic.getDataTracks().iterator(); i.hasNext(); ) {
        DataTrack dt = (DataTrack) i.next();
        newDataTracks.add(dt);
      }
      topicCopy.setDataTracks(newDataTracks);

      // Create and save any child topics
      Set<Topic> newTopics = new TreeSet<Topic>(new TopicComparator());
      for (Iterator<?> i = topic.getTopics().iterator(); i.hasNext(); ) {
        Topic t = (Topic) i.next();
        Topic newChildTopic = copyTopic(sess, t, null);
        if (newChildTopic != null) {
          newTopics.add(newChildTopic);
        }
      }
      topicCopy.setTopics(newTopics);

      sess.save(topicCopy);
      sess.flush();
    } catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in MoveDataTrack ", e);

      throw new RollBackCommandException(e.getMessage());

    }
    return topicCopy;
  }
}
