package hci.gnomex.utility;

import hci.framework.model.DetailObject;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.*;
import org.hibernate.Hibernate;
import org.hibernate.Session;

import javax.json.JsonArray;
import javax.json.JsonObject;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class BillingItemParser extends DetailObject implements Serializable {

    private static final long serialVersionUID = 1L;
    private JsonObject obj;
    private List<BillingItem> billingItems = new ArrayList<>();
    private List<BillingItem> billingItemsToRemove = new ArrayList<>();
    private List<Invoice> invoices = new ArrayList<>();

    public BillingItemParser(JsonObject object) {
        this.obj = object;
    }

    public void parse(Session sess) throws Exception {
        JsonArray saveList = this.obj.getJsonArray("saveList");
        for (int i = 0; i < saveList.size(); i++) {
            JsonObject node = saveList.getJsonObject(i);
            String idBillingItemString = null;
            if (node.get("idBillingItem") != null) {
                idBillingItemString = node.getString("idBillingItem");
            }

            BillingItem billingItem;
            MasterBillingItem masterBillingItem;
            BigDecimal originalUnitPrice = new BigDecimal(0);
            Integer originalQty = 0;
            if (idBillingItemString == null || idBillingItemString.equals("") || idBillingItemString.startsWith("BillingItem")) {
                billingItem = new BillingItem();
                masterBillingItem = new MasterBillingItem();
            } else {
                billingItem = sess.load(BillingItem.class, Integer.valueOf(idBillingItemString));
                if (billingItem.getIdMasterBillingItem() != null) {
                    masterBillingItem = sess.load(MasterBillingItem.class, billingItem.getIdMasterBillingItem());
                } else {
                    masterBillingItem = new MasterBillingItem();
                }
                originalUnitPrice = billingItem.getUnitPrice();
                originalQty = billingItem.getQty();
            }

            billingItem.setMasterBillingItem(masterBillingItem);

            masterBillingItem.setCategory(node.getString("category"));
            billingItem.setCategory(node.getString("category"));
            masterBillingItem.setCodeBillingChargeKind(node.getString("codeBillingChargeKind"));
            billingItem.setCodeBillingChargeKind(node.getString("codeBillingChargeKind"));
            masterBillingItem.setDescription(node.getString("description"));
            billingItem.setDescription(node.getString("description"));
            masterBillingItem.setIdPriceCategory(!node.getString("idPriceCategory").equals("") ? Integer.valueOf(node.getString("idPriceCategory")) : null);
            billingItem.setIdPriceCategory(!node.getString("idPriceCategory").equals("") ? Integer.valueOf(node.getString("idPriceCategory")) : null);
            masterBillingItem.setIdBillingPeriod(!node.getString("idBillingPeriod").equals("") ? Integer.valueOf(node.getString("idBillingPeriod")) : null);
            billingItem.setIdBillingPeriod(!node.getString("idBillingPeriod").equals("") ? Integer.valueOf(node.getString("idBillingPeriod")) : null);
            masterBillingItem.setIdPrice(!node.getString("idPrice").equals("") ? Integer.valueOf(node.getString("idPrice")) : null);
            billingItem.setIdPrice(!node.getString("idPrice").equals("") ? Integer.valueOf(node.getString("idPrice")) : null);
            if (node.get("idDiskUsageByMonth") != null) {
                billingItem.setIdDiskUsageByMonth(!node.getString("idDiskUsageByMonth").equals("") ? Integer.valueOf(node.getString("idDiskUsageByMonth")) : null);
            }
            BillingTemplate billingTemplate = new BillingTemplate();
            if (node.get("idRequest") != null && !node.getString("idRequest").equals("")) {
                Request request = sess.load(Request.class, Integer.valueOf(node.getString("idRequest")));
                billingTemplate = BillingTemplateQueryManager.retrieveBillingTemplate(sess, request);
                if (billingTemplate == null) {
                    throw new Error("No billing template for request: " + request.getIdRequest());
                }
                billingItem.setIdRequest(!node.getString("idRequest").equals("") ? Integer.valueOf(node.getString("idRequest")) : null);
                masterBillingItem.setIdBillingTemplate(billingTemplate.getIdBillingTemplate());
            }
            if (node.get("idProductOrder") != null && !node.getString("idProductOrder").equals("")) {
                ProductOrder productOrder = sess.load(ProductOrder.class, Integer.valueOf(node.getString("idProductOrder")));
                billingTemplate = BillingTemplateQueryManager.retrieveBillingTemplate(sess, productOrder);
                if (billingTemplate == null) {
                    throw new Error("No billing template for product order: " + productOrder.getIdProductOrder());
                }
                billingItem.setIdProductOrder((node.get("idProductOrder") != null && !node.getString("idProductOrder").equals("")) ? Integer.valueOf(node.getString("idProductOrder")) : null);
                masterBillingItem.setIdBillingTemplate(billingTemplate.getIdBillingTemplate());
            }

            // Set the billing account for the billing item
            boolean billingAccountSet = false;
            if (!node.getString("idBillingAccount").equals("")) {
                // Use billing account from the request node if there is one
                billingItem.setIdBillingAccount(Integer.valueOf(node.getString("idBillingAccount")));
                billingAccountSet = true;
            } else {
                // Look up the 'accepting balance' account from the billing template
                int idBillingAccount = -1;
                Hibernate.initialize(billingTemplate.getItems());
                for (BillingTemplateItem billingTemplateItem : billingTemplate.getItems()) {
                    if (billingTemplateItem.isAcceptingBalance()) {
                        idBillingAccount = billingTemplateItem.getIdBillingAccount();
                        break;
                    }
                }
                if (idBillingAccount != -1) {
                    billingAccountSet = true;
                }
                billingItem.setIdBillingAccount(idBillingAccount);
            }
            if (!billingAccountSet) {
                throw new Error("No billing account found");
            }

            billingItem.setIdLab(!node.getString("idLab").equals("") ? Integer.valueOf(node.getString("idLab")) : null);
            masterBillingItem.setQty(!node.getString("qty").equals("") ? Integer.valueOf(node.getString("qty")) : null);
            billingItem.setQty(!node.getString("qty").equals("") ? Integer.valueOf(node.getString("qty")) : null);
            masterBillingItem.setIdCoreFacility(node.get("idCoreFacility") != null && !node.getString("idCoreFacility").equals("") ? Integer.valueOf(node.getString("idCoreFacility")) : null);
            billingItem.setIdCoreFacility(node.get("idCoreFacility") != null && !node.getString("idCoreFacility").equals("") ? Integer.valueOf(node.getString("idCoreFacility")) : null);

            if (node.get("completeDate") != null && !node.getString("completeDate").equals("")) {
                billingItem.setCompleteDate(this.parseDate(node.getString("completeDate")));
            } else {
                billingItem.setCompleteDate(null);
            }

            String unitPrice = node.getString("unitPrice");
            unitPrice = unitPrice.replaceAll("\\$", "");
            unitPrice = unitPrice.replaceAll(",", "");
            masterBillingItem.setUnitPrice(!unitPrice.equals("") ? new BigDecimal(unitPrice) : null);
            billingItem.setUnitPrice(!unitPrice.equals("") ? new BigDecimal(unitPrice) : null);

            billingItem.setNotes(node.getString("notes"));

            String percentageDisplay = node.get("percentageDisplay") != null ? node.getString("percentageDisplay") : "";
            percentageDisplay = percentageDisplay.replaceAll("\\%", "");
            billingItem.setPercentagePrice(percentageDisplay.length() != 0 ? new BigDecimal(percentageDisplay).movePointLeft(2) : null);

            if (billingItem.getQty() != null && billingItem.getUnitPrice() != null) {
                if (billingItem.getSplitType() == null || billingItem.getSplitType().equals("")) {
                    billingItem.setSplitType(Constants.BILLING_SPLIT_TYPE_PERCENT_CODE);
                }
                if (billingItem.getSplitType().equals(Constants.BILLING_SPLIT_TYPE_PERCENT_CODE)) {
                    billingItem.setInvoicePrice(billingItem.getUnitPrice().multiply(new BigDecimal(billingItem.getQty()).multiply(billingItem.getPercentagePrice())));
                } else {
                    if (!billingItem.getUnitPrice().equals(originalUnitPrice) || !billingItem.getQty().equals(originalQty)) {
                        BigDecimal originalTotalPrice = originalUnitPrice.multiply(new BigDecimal(originalQty));
                        BigDecimal newTotalPrice = billingItem.getUnitPrice().multiply(new BigDecimal(billingItem.getQty()));
                        billingItem.setInvoicePrice(billingItem.getInvoicePrice().add(newTotalPrice.subtract(originalTotalPrice)));
                    }
                }
            }

            if (node.get("codeBillingStatus") != null && !node.getString("codeBillingStatus").equals("")) {
                String codeBillingStatus = node.getString("codeBillingStatus");

                // If we have toggled from not complete to complete, set complete date
                if (codeBillingStatus.equals(BillingStatus.COMPLETED) && billingItem.getIdBillingItem() != null) {
                    if (billingItem.getCodeBillingStatus() == null ||
                            billingItem.getCodeBillingStatus().equals("") ||
                            !billingItem.getCodeBillingStatus().equals(BillingStatus.COMPLETED)) {
                        billingItem.setCompleteDate(new java.sql.Date(System.currentTimeMillis()));
                    }
                }
                billingItem.setCodeBillingStatus(codeBillingStatus);
            }

            // Set the billing status
            String codeBillingStatus = node.getString("codeBillingStatus");
            billingItem.setCodeBillingStatus(codeBillingStatus);

            // Set the billing status
            String currentCodeBillingStatus = node.get("currentCodeBillingStatus") != null ? node.getString("currentCodeBillingStatus") : "";
            billingItem.setCurrentCodeBillingStatus(currentCodeBillingStatus);

            billingItems.add(billingItem);
        }

        JsonArray removeList = this.obj.getJsonArray("removeList");
        for (int i = 0; i < removeList.size(); i++) {
            JsonObject node = removeList.getJsonObject(i);

            if (node.get("idBillingItem") == null) {
                continue;
            }
            String idBillingItemString = node.getString("idBillingItem");

            BillingItem billingItem;
            if (idBillingItemString.equals("") || idBillingItemString.startsWith("BillingItem")) {
                continue;
            }
            billingItem = sess.load(BillingItem.class, Integer.valueOf(idBillingItemString));
            billingItemsToRemove.add(billingItem);
        }

        JsonArray invoiceList = this.obj.getJsonArray("invoiceList");
        for (int i = 0; i < invoiceList.size(); i++) {
            JsonObject node = invoiceList.getJsonObject(i);

            Invoice invoice;
            if (node.get("idInvoice") == null || node.getString("idInvoice").equals("")) {
                continue;
            }
            invoice = sess.load(Invoice.class, Integer.valueOf(node.getString("idInvoice")));
            if (invoice.getInvoiceNumber() == null || !invoice.getInvoiceNumber().equals(node.getString("invoiceNumber"))) {
                invoice.setInvoiceNumber(node.getString("invoiceNumber"));
                invoices.add(invoice);

            }
        }
    }

    public List<BillingItem> getBillingItems() {
        return billingItems;
    }

    public List<BillingItem> getBillingItemsToRemove() {
        return billingItemsToRemove;
    }

    public List<Invoice> getInvoices() {
        return invoices;
    }

}
