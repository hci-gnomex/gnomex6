package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.TopicQuery;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;

import javax.servlet.http.HttpSession;
import java.io.Serializable;

public class GetTopicList extends GNomExCommand implements Serializable {

  private static Logger LOG = Logger.getLogger(GetTopicList.class);

  private TopicQuery topicQuery;

  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
    topicQuery = new TopicQuery(request);
    if (isValid()) {
      setResponsePage(this.SUCCESS_JSP);
    } else {
      setResponsePage(this.ERROR_JSP);
    }
  }

  public Command execute() throws RollBackCommandException {
    try {
      Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());

      Document doc = topicQuery.getTopicDocument(sess, this.getSecAdvisor());

      org.jdom.output.XMLOutputter out = new org.jdom.output.XMLOutputter();
      this.xmlResult = out.outputString(doc);

      setResponsePage(this.SUCCESS_JSP);

    }catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetTopicList ", e);
      throw new RollBackCommandException(e.getMessage());
    }
    return this;
  }
}
