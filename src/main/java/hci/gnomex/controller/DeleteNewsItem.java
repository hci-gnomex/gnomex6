package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.NewsItem;
import hci.gnomex.utility.DictionaryHelper;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.servlet.http.HttpSession;
import java.io.Serializable;

public class DeleteNewsItem extends GNomExCommand implements Serializable {

  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(DeleteNewsItem.class);

  private Integer      idNewsItem = null;

  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

   if (request.getParameter("idNewsItem") != null && !request.getParameter("idNewsItem").equals("")) {
     idNewsItem = Integer.valueOf(request.getParameter("idNewsItem"));
   } else {
     this.addInvalidField("idNewsItem", "idNewsItem is required.");
   }
  }

  public Command execute() throws RollBackCommandException {
    try {

      Session sess = HibernateSession.currentSession(this.getUsername());
      DictionaryHelper dh = DictionaryHelper.getInstance(sess);
      NewsItem newsitem = (NewsItem)sess.load(NewsItem.class, idNewsItem);

      if (this.getSecAdvisor().canDelete(newsitem)) {

        //
        // Delete NewsItem
        //
        sess.delete(newsitem);
        sess.flush();

        this.xmlResult = "<SUCCESS/>";
        setResponsePage(this.SUCCESS_JSP);

      } else {
        this.addInvalidField("Insufficient permissions", "Insufficient permissions to delete this newsitem.");
        setResponsePage(this.ERROR_JSP);
      }
    }catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in DeleteNewsItem", e);

      throw new RollBackCommandException(e.getMessage());

    }

    return this;
  }
}
