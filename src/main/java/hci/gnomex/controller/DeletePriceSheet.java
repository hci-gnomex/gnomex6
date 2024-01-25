package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.PriceSheet;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Hibernate;
import org.hibernate.Session;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.TreeSet;

public class DeletePriceSheet extends GNomExCommand implements Serializable {

    // the static field for logging in Log4J
    private static Logger LOG = Logger.getLogger(DeletePriceSheet.class);

    private Integer idPriceSheet = null;

    public void validate() {
    }

    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

        if (request.getParameter("idPriceSheet") != null && !request.getParameter("idPriceSheet").equals("")) {
            idPriceSheet = Integer.valueOf(request.getParameter("idPriceSheet"));
        } else {
            this.addInvalidField("idPriceSheet", "idPriceSheet is required.");
        }

    }

    public Command execute() throws RollBackCommandException {
        try {

            Session sess = HibernateSession.currentSession(this.getUsername());

            PriceSheet priceSheet = sess.load(PriceSheet.class, idPriceSheet);

            if (this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_BILLING)) {

                //
                // Only allow price sheet to be deleted if there are no
                // price categories attached.
                //
                Hibernate.initialize(priceSheet.getPriceCategories());
                if (priceSheet.getPriceCategories().size() > 0) {
                    this.addInvalidField("Non-empty categories", "Please remove all price categories from price sheet first.");
                }

                if (this.isValid()) {
                    // First, empty out the request categories
                    priceSheet.setRequestCategories(new TreeSet());
                    sess.flush();

                    //
                    // Delete PriceSheet
                    //
                    sess.delete(priceSheet);

                    sess.flush();

                    this.xmlResult = "<SUCCESS/>";
                    setResponsePage(this.SUCCESS_JSP);

                } else {
                    this.setResponsePage(this.ERROR_JSP);
                }

            } else {
                this.addInvalidField("Insufficient permissions", "Insufficient permissions to delete priceSheet sheet.");
                this.setResponsePage(this.ERROR_JSP);
            }
        } catch (Exception e) {
            this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in DeletePriceSheet ", e);

            throw new RollBackCommandException(e.getMessage());
        }

        return this;
    }

}
