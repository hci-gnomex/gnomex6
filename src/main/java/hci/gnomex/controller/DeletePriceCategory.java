package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.Price;
import hci.gnomex.model.PriceCategory;
import hci.gnomex.model.PriceSheet;
import hci.gnomex.model.PriceSheetPriceCategory;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Hibernate;
import org.hibernate.Session;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.Iterator;
import java.util.List;
import java.util.TreeSet;

public class DeletePriceCategory extends GNomExCommand implements Serializable {

    // the static field for logging in Log4J
    private static Logger LOG = Logger.getLogger(DeletePriceCategory.class);

    private Integer idPriceCategory = null;
    private Integer idPriceSheet = null;

    public void validate() {
    }

    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

        if (request.getParameter("idPriceCategory") != null && !request.getParameter("idPriceCategory").equals("")) {
            idPriceCategory = Integer.valueOf(request.getParameter("idPriceCategory"));
        } else {
            this.addInvalidField("idPriceCategory", "idPriceCategory is required.");
        }
        if (request.getParameter("idPriceSheet") != null && !request.getParameter("idPriceSheet").equals("")) {
            idPriceSheet = Integer.valueOf(request.getParameter("idPriceSheet"));
        } else {
            this.addInvalidField("idPriceSheet", "idPriceSheet is required.");
        }
    }

    public Command execute() throws RollBackCommandException {
        try {

            Session sess = HibernateSession.currentSession(this.getUsername());

            PriceCategory priceCategory = sess.load(PriceCategory.class, idPriceCategory);
            PriceSheet priceSheet = sess.load(PriceSheet.class, idPriceSheet);

            // Determine if this category is part of other price sheets.
            // If it is, we will unlink the category from the price sheet,
            // but refrain from deleting it.
            StringBuilder buf = new StringBuilder();
            buf.append("SELECT ps from PriceSheet ps ");
            buf.append("JOIN   ps.priceCategories x ");
            buf.append("WHERE  x.priceCategory.idPriceCategory = ");
            buf.append(priceCategory.getIdPriceCategory().toString());
            List priceSheets = sess.createQuery(buf.toString()).list();
            boolean otherPriceSheets = false;
            for (Iterator i = priceSheets.iterator(); i.hasNext(); ) {
                PriceSheet ps = (PriceSheet) i.next();
                if (!ps.getIdPriceSheet().equals(idPriceSheet)) {
                    otherPriceSheets = true;
                    break;
                }
            }

            // Determine if this category is already referenced on any billing items
            boolean existingBillingItems = hasBillingItems(priceCategory, sess);

            if (this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_BILLING)) {

                //
                // Initialize the prices.  We don't want to orphan them unintentionally.
                //
                Hibernate.initialize(priceCategory.getPrices());
                for (Iterator i = priceCategory.getPrices().iterator(); i.hasNext(); ) {
                    Price price = (Price) i.next();
                    Hibernate.initialize(price.getPriceCriterias());
                }

                if (this.isValid()) {

                    // Unlink the category from the price sheet
                    for (Iterator i = priceSheet.getPriceCategories().iterator(); i.hasNext(); ) {
                        PriceSheetPriceCategory x = (PriceSheetPriceCategory) i.next();
                        PriceCategory pc = x.getPriceCategory();

                        if (pc.getIdPriceCategory().equals(priceCategory.getIdPriceCategory())) {
                            priceSheet.getPriceCategories().remove(x);
                            break;
                        }
                    }
                    sess.flush();

                    // Only delete the price category if
                    // it doesn't belong to other price sheets
                    // and there are not any billing items
                    // associated with the price category.
                    if (!otherPriceSheets) {

                        // Delete the price category if
                        // no fk violations will occur.
                        if (!existingBillingItems) {
                            // Remove any workflow steps before deletion
                            priceCategory.setSteps(new TreeSet());
                            sess.flush();

                            sess.delete(priceCategory);
                        } else {
                            priceCategory.setIsActive("N");
                        }
                    }

                    sess.flush();

                    this.xmlResult = "<SUCCESS/>";
                    setResponsePage(this.SUCCESS_JSP);

                } else {
                    this.setResponsePage(this.ERROR_JSP);
                }

            } else {
                this.addInvalidField("Insufficient permissions", "Insufficient permissions to delete price category.");
                this.setResponsePage(this.ERROR_JSP);
            }
        } catch (Exception e) {
            this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in DeletePriceCategory ", e);

            throw new RollBackCommandException(e.getMessage());

        }
        return this;
    }

    public static boolean hasBillingItems(PriceCategory priceCategory, Session sess) {
        // Determine if this category is already referenced on any billing items
        boolean existingBillingItems = false;
        StringBuilder buf = new StringBuilder();
        buf.append("SELECT bi from BillingItem bi ");
        buf.append("WHERE  bi.idPriceCategory = ");
        buf.append(priceCategory.getIdPriceCategory().toString());
        List billingItems = sess.createQuery(buf.toString()).list();
        if (billingItems.size() > 0) {
            existingBillingItems = true;
        }
        return existingBillingItems;
    }

}
