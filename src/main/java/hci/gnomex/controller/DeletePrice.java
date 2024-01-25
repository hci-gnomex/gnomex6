package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.Price;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Hibernate;
import org.hibernate.Session;

import javax.servlet.http.HttpSession;
import java.io.Serializable;

public class DeletePrice extends GNomExCommand implements Serializable {

    // the static field for logging in Log4J
    private static Logger LOG = Logger.getLogger(DeletePrice.class);

    private Integer idPrice = null;

    public void validate() {
    }

    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

        if (request.getParameter("idPrice") != null && !request.getParameter("idPrice").equals("")) {
            idPrice = Integer.valueOf(request.getParameter("idPrice"));
        } else {
            this.addInvalidField("idPrice", "idPrice is required.");
        }

    }

    public Command execute() throws RollBackCommandException {
        try {

            Session sess = HibernateSession.currentSession(this.getUsername());

            Price price = sess.load(Price.class, idPrice);

            if (this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_BILLING)) {
                if (Price.hasBillingItems(sess, idPrice)) {
                    this.addInvalidField("idPrice", "Cannot delete, billing item(s) are  attached to this price.");
                }
                //
                // Initialize the price criteria.  We don't want to orphan them unintentionally.
                // Initialize will explicitly cause the set of PriceCriterias to load, which is lazy.
                Hibernate.initialize(price.getPriceCriterias());

                if (this.isValid()) {

                    //
                    // Delete Price
                    //
                    sess.delete(price);

                    sess.flush();

                    this.xmlResult = "<SUCCESS/>";
                    setResponsePage(this.SUCCESS_JSP);

                } else {
                    this.setResponsePage(this.ERROR_JSP);
                }

            } else {
                this.addInvalidField("Insufficient permissions", "Insufficient permissions to delete price.");
                this.setResponsePage(this.ERROR_JSP);
            }
        } catch (Exception e) {
            this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in DeletePrice ", e);

            throw new RollBackCommandException(e.getMessage());
        }

        return this;
    }

}
