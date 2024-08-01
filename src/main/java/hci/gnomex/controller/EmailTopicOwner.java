package hci.gnomex.controller;

import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.AppUser;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
public class EmailTopicOwner extends GNomExCommand implements Serializable {
  private static Logger LOG = Logger.getLogger(EmailTopicOwner.class);

  private Integer idAppUser;
  private String fromAddress;
  private String body;
  private String subject;
  private String serverName;


  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
    if (request.getParameter("idAppUser") != null && !request.getParameter("idAppUser").equals("")) {
      idAppUser = Integer.valueOf(request.getParameter("idAppUser"));
    }
    if (request.getParameter("fromAddress") != null && !request.getParameter("fromAddress").equals("")) {
      fromAddress = request.getParameter("fromAddress");
    }
    if (request.getParameter("body") != null && !request.getParameter("body").equals("")) {
      body = request.getParameter("body");
    }
    if (request.getParameter("subject") != null && !request.getParameter("subject").equals("")) {
      subject = request.getParameter("subject");
    }

    serverName = request.getServerName();

  }

  public Command execute() throws RollBackCommandException {
    try {

      Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());
      DictionaryHelper dh = DictionaryHelper.getInstance(sess);

      AppUser recipient = (AppUser)sess.get(AppUser.class, idAppUser);

      if(recipient.getEmail() == null || recipient.getEmail().equals("")){
        this.addInvalidField("No Email address on file", "There is no email address on file for " + recipient.getFirstLastDisplayName());
      }

      if(this.isValid()){
        String toAddress = recipient.getEmail();

        MailUtilHelper helper = new MailUtilHelper(
        		toAddress,
        		fromAddress,
        		subject,
        		body,
        		null,
        		false,
        	    dh,
      		    serverName 	);
        helper.setRecipientAppUser(recipient);
        MailUtil.validateAndSendEmail(helper);
        this.xmlResult = "<SUCCESS/>";
        this.setResponsePage(SUCCESS_JSP);
      }
      else{
        this.setResponsePage(ERROR_JSP);
      }

    } catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in EmailTopicOwner ", e);

      throw new RollBackCommandException(e.getMessage());
    }
    return this;
  }
}
