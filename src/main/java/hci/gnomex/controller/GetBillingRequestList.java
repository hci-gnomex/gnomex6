package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.BillingListManager;
import hci.gnomex.utility.GNomExRollbackException;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.output.XMLOutputter;

import javax.servlet.http.HttpSession;
import java.io.Serializable;

public class GetBillingRequestList extends GNomExCommand implements Serializable {
  private static Logger LOG = Logger.getLogger(GetBillingRequestList.class);
  private BillingListManager billingListManager;

  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
    if (!this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_BILLING)) {
      this.addInvalidField("permission", "Insufficient permission to manage billing items");
    }
    billingListManager = new BillingListManager(null, this.getSecAdvisor(), request, this, this.getDateOutputStyle());
    if (!billingListManager.hasSufficientCriteria()) {
      this.addInvalidField("criteria", billingListManager.getInsufficientCriteriaMessage());
    }
  }

  public Command execute() throws GNomExRollbackException {
    try {
      Session session = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());
      billingListManager.setSession(session);
      Element root = billingListManager.buildBillingRequestList(this.getUserPreferences());
      XMLOutputter out = new XMLOutputter();
      this.xmlResult = out.outputString(new Document(root));
      setResponsePage(this.SUCCESS_JSP);
    } catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in GetBillingRequestList", e);
      throw new GNomExRollbackException(e.getMessage(), false, "An error occurred while retrieving request billing information.");
    }
    return this;
  }

}
