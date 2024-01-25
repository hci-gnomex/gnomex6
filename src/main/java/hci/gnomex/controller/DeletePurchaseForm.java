package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.BillingAccount;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
public class DeletePurchaseForm extends GNomExCommand implements Serializable {

  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(DeletePurchaseForm.class);

  private Integer      idBillingAccount = null;


  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    if (request.getParameter("idBillingAccount") != null && !request.getParameter("idBillingAccount").equals("")) {
      idBillingAccount = Integer.valueOf(request.getParameter("idBillingAccount"));
    } else {
      this.addInvalidField("idBillingAccount", "idBillingAccount is required.");
    }

  }

  public Command execute() throws RollBackCommandException {

    try {
      Session sess = HibernateSession.currentSession(this.getUsername());

      // Check permissions
      if (this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_ADMINISTER_USERS)) {
        BillingAccount ba = (BillingAccount)sess.load(BillingAccount.class, idBillingAccount);

        //
        // Set order form and filetype back to null
        //
        ba.setPurchaseOrderForm(null);
        ba.setOrderFormFileType(null);
        sess.update(ba);
        sess.flush();

        this.xmlResult = "<SUCCESS/>";

        setResponsePage(this.SUCCESS_JSP);

      } else {
        this.addInvalidField("insufficient permission", "Insufficient permissions to delete lab.");
        setResponsePage(this.ERROR_JSP);
      }
    }catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in DeletePurchaseForm ", e);

      throw new RollBackCommandException(e.getMessage());

    }

    return this;
  }






}
