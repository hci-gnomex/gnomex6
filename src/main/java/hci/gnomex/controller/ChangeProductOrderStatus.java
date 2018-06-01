package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.BillingItem;
import hci.gnomex.model.BillingStatus;
import hci.gnomex.model.Product;
import hci.gnomex.model.ProductLineItem;
import hci.gnomex.model.ProductOrder;
import hci.gnomex.model.ProductOrderStatus;
import hci.gnomex.utility.ProductUtil;

import java.io.Serializable;
import java.io.StringReader;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.hibernate.Session;

public class ChangeProductOrderStatus extends GNomExCommand implements Serializable {
    private static Logger LOG = Logger.getLogger(SaveProductOrder.class);

    private JsonArray selectedOrdersArray;
    private JsonArray selectedLineItemsArray;
    private String codeProductOrderStatus;
    private StringBuffer resultMessage = new StringBuffer("");
    private String serverName;

    public void loadCommand(HttpServletWrappedRequest request, HttpSession sess) {

        String selectedLineItems = request.getParameter("selectedLineItems");
        String selectedOrders = request.getParameter("selectedOrders");
        if (Util.isParameterNonEmpty(selectedLineItems)) {
            try (JsonReader jsonReader = Json.createReader(new StringReader(selectedLineItems))) {
                this.selectedLineItemsArray = jsonReader.readArray();
            } catch (Exception e) {
                this.addInvalidField("selectedLineItems", "Invalid selectedLineItems");
                this.errorDetails = Util.GNLOG(LOG, "Cannot parse selectedLineItems", e);
            }
        } else if (Util.isParameterNonEmpty(selectedOrders)) {
            try (JsonReader jsonReader = Json.createReader(new StringReader(selectedOrders))) {
                this.selectedOrdersArray = jsonReader.readArray();
            } catch (Exception e) {
                this.addInvalidField("selectedOrders", "Invalid selectedOrders");
                this.errorDetails = Util.GNLOG(LOG, "Cannot parse selectedOrders", e);
            }
        } else {
            this.addInvalidField("jsonString", "Missing line item list");
        }

        if (Util.isParameterNonEmpty(request.getParameter("codeProductOrderStatus"))) {
            codeProductOrderStatus = request.getParameter("codeProductOrderStatus");
        } else {
            this.addInvalidField("codeProductOrderStatus", "Missing codeProductOrderStatus");
        }

        serverName = request.getServerName();
    }

    public Command execute() throws RollBackCommandException {
        try {
            if (this.isValid()) {
                Session sess = this.getSecAdvisor().getHibernateSession(this.getUsername());

                if (selectedOrdersArray != null) {
                    for (int i = 0; i < selectedOrdersArray.size(); i++) {
                        JsonObject n = selectedOrdersArray.getJsonObject(i);
                        Integer idProductOrder = Integer.valueOf(n.getString("idProductOrder"));
                        ProductOrder po = sess.load(ProductOrder.class, idProductOrder);
                        for (ProductLineItem li : po.getProductLineItems()) {
                            String oldStatus = li.getCodeProductOrderStatus();
                            if (ProductUtil.updateLedgerOnProductOrderStatusChange(li, po, oldStatus,
                                    codeProductOrderStatus, sess, resultMessage)) {
                                li.setCodeProductOrderStatus(codeProductOrderStatus);
                                updateBillingStatus(li, po, oldStatus, codeProductOrderStatus, sess);
                                sess.save(li);
                            }
                        }

                        sess.refresh(po);
                        if (codeProductOrderStatus.equals(ProductOrderStatus.COMPLETED)) {
                            SaveProductOrder.sendConfirmationEmail(sess, po, ProductOrderStatus.COMPLETED, serverName);
                        }
                    }
                }
                if (selectedLineItemsArray != null) {
                    for (int i = 0; i < selectedLineItemsArray.size(); i++) {
                        JsonObject n = selectedLineItemsArray.getJsonObject(i);
                        Integer idProductLineItem = Integer.valueOf(n.getString("idProductLineItem"));
                        ProductLineItem pli = sess.load(ProductLineItem.class, idProductLineItem);
                        ProductOrder po = sess.load(ProductOrder.class, pli.getIdProductOrder());
                        String oldStatus = pli.getCodeProductOrderStatus();
                        if (ProductUtil.updateLedgerOnProductOrderStatusChange(pli, po, oldStatus, codeProductOrderStatus,
                                sess, resultMessage)) {
                            pli.setCodeProductOrderStatus(codeProductOrderStatus);
                            updateBillingStatus(pli, po, oldStatus, codeProductOrderStatus, sess);
                            sess.save(pli);
                        }

                        sess.refresh(po);
                        Boolean allItemsComplete = true;
                        for (ProductLineItem item : po.getProductLineItems()) {
                            if (!item.getCodeProductOrderStatus().equals(ProductOrderStatus.COMPLETED)) {
                                allItemsComplete = false;
                                break;
                            }
                        }

                        if (allItemsComplete) {
                            SaveProductOrder.sendConfirmationEmail(sess, po, ProductOrderStatus.COMPLETED, serverName);
                        }
                    }
                }

                sess.flush();
                this.jsonResult = Json.createObjectBuilder().add("result", "SUCCESS").add("message", resultMessage.toString()).build().toString();
                this.setResponsePage(this.SUCCESS_JSP);
            } else {
                this.setResponsePage(this.ERROR_JSP);
            }
        } catch (Exception e) {
            this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in ChangeProductOrderStatus ", e);
            throw new RollBackCommandException(e.getMessage());
        }

        return this;
    }

    private void updateBillingStatus(ProductLineItem pli, ProductOrder po, String oldCodePOStatus, String newPOStatus,
                                       Session sess) {
        BillingItem billingItem;
        Product product = pli.getProduct();
        int idPrice = product.getIdPrice();

        // Find the billing item(s) that corresponds to the line item
        for (BillingItem bi : po.getBillingItemList(sess)) {
            if (bi.getIdPrice().equals(idPrice)) {
                billingItem = bi;

                // Update billing item to complete -- only if it is pending, not already approved
                if ((oldCodePOStatus == null || !oldCodePOStatus.equals(ProductOrderStatus.COMPLETED))
                        && newPOStatus.equals(ProductOrderStatus.COMPLETED)) {
                    if (billingItem.getCodeBillingStatus().equals(BillingStatus.PENDING)) {
                        billingItem.setCodeBillingStatus(BillingStatus.COMPLETED);
                        billingItem.setCompleteDate(new java.sql.Date(System.currentTimeMillis()));
                    }
                }
                // Revert to pending -- only if it is completed but not approved
                else if ((oldCodePOStatus != null && oldCodePOStatus.equals(ProductOrderStatus.COMPLETED))
                        && !newPOStatus.equals(ProductOrderStatus.COMPLETED)) {
                    if (billingItem.getCodeBillingStatus().equals(BillingStatus.COMPLETED)) {
                        billingItem.setCodeBillingStatus(BillingStatus.PENDING);
                        billingItem.setCompleteDate(null);
                    }
                }
            }
        }
    }

    public void validate() {
    }

}
