package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.ProductLineItem;
import hci.gnomex.model.ProductOrder;
import hci.gnomex.model.ProductOrderStatus;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.ProductLineItemComparator;

import java.io.Serializable;
import java.io.StringReader;
import java.util.Set;
import java.util.TreeSet;

import javax.json.*;
import javax.servlet.http.HttpSession;

import org.hibernate.Session;
import org.apache.log4j.Logger;

public class DeleteProductLineItems extends GNomExCommand implements Serializable {

    // the static field for logging in Log4J
    private static Logger LOG = Logger.getLogger(DeleteProductLineItems.class);

    private JsonArray productOrdersToDeleteArray;
    private JsonArray productLineItemsToDeleteArray;

    private StringBuilder resultMessage = new StringBuilder("");

    public void validate() {
    }

    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

        String productOrdersToDeleteJSONString = request.getParameter("productOrdersToDeleteJSONString");
        String productLineItemsToDeleteJSONString = request.getParameter("productLineItemsToDeleteJSONString");
        if (Util.isParameterNonEmpty(productOrdersToDeleteJSONString)) {
            try (JsonReader jsonReader = Json.createReader(new StringReader(productOrdersToDeleteJSONString))) {
                this.productOrdersToDeleteArray = jsonReader.readArray();
            } catch (Exception e) {
                this.addInvalidField("productOrdersToDeleteJSONString", "Invalid productOrdersToDeleteJSONString");
                this.errorDetails = Util.GNLOG(LOG, "Cannot parse productOrdersToDeleteJSONString", e);
            }
        } else if (Util.isParameterNonEmpty(productLineItemsToDeleteJSONString)) {
            try (JsonReader jsonReader = Json.createReader(new StringReader(productLineItemsToDeleteJSONString))) {
                this.productLineItemsToDeleteArray = jsonReader.readArray();
            } catch (Exception e) {
                this.addInvalidField("productLineItemsToDeleteJSONString", "Invalid productLineItemsToDeleteJSONString");
                this.errorDetails = Util.GNLOG(LOG, "Cannot parse productLineItemsToDeleteJSONString", e);
            }
        } else {
            this.addInvalidField("jsonString", "Missing line items to delete JSON String");
        }

    }

    public Command execute() throws RollBackCommandException {

        try {
            Session sess = HibernateSession.currentSession(this.getUsername());

            if (productOrdersToDeleteArray != null) {
                for (int i = 0; i < productOrdersToDeleteArray.size(); i++) {
                    JsonObject node = productOrdersToDeleteArray.getJsonObject(i);
                    Integer idProductOrder = Integer.parseInt(node.getString("idProductOrder"));
                    ProductOrder po = sess.load(ProductOrder.class, idProductOrder);

                    if (po != null && po.getIdCoreFacility() != null && (this.getSecAdvisor().isCoreFacilityIManage(po.getIdCoreFacility())
                            || this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_ADMINISTER_ALL_CORE_FACILITIES))) {

                        if (po.getProductLineItems() == null || po.getProductLineItems().size() == 0) {
                            resultMessage.append(po.getDisplay());
                            resultMessage.append(" deleted.\r\n");
                            sess.delete(po);
                        } else {
                            Set<ProductLineItem> plis = po.getProductLineItems();
                            // Remove all line items from product order
                            po.setProductLineItems(new TreeSet(new ProductLineItemComparator()));
                            for (ProductLineItem li : plis) {
                                po.getProductLineItems().remove(li);
                                if (!this.deleteProductLineItem(li, sess)) {
                                    // Add line item back to product order if it can't be deleted.
                                    po.getProductLineItems().add(li);
                                }
                            }
                            // Delete product order if all the line items have been deleted.
                            if (po.getProductLineItems().size() == 0) {
                                resultMessage.append(po.getDisplay());
                                resultMessage.append(" deleted.\r\n");
                                sess.delete(po);
                            }
                        }
                    } else {
                        this.addInvalidField("Insufficient permissions", "Insufficient permissions to delete product order id:" + idProductOrder + ".");
                        setResponsePage(this.ERROR_JSP);
                    }
                }
            }
            if (productLineItemsToDeleteArray != null) {
                for (int i = 0; i < productLineItemsToDeleteArray.size(); i++) {
                    JsonObject node = productLineItemsToDeleteArray.getJsonObject(i);
                    Integer idProductLineItem = Integer.parseInt(node.getString("idProductLineItem"));
                    ProductLineItem pli = sess.load(ProductLineItem.class, idProductLineItem);
                    ProductOrder po = sess.load(ProductOrder.class, pli.getIdProductOrder());
                    if (po != null && po.getIdCoreFacility() != null && (this.getSecAdvisor().isCoreFacilityIManage(po.getIdCoreFacility())
                            || this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_ADMINISTER_ALL_CORE_FACILITIES))) {

                        this.deleteProductLineItem(pli, sess);

                        // Delete product order if all the line items have been deleted.
                        if (po.getProductLineItems().size() == 0) {
                            resultMessage.append(po.getDisplay());
                            resultMessage.append(" deleted.\r\n");
                            sess.delete(po);
                        }
                    } else {
                        this.addInvalidField("Insufficient permissions", "Insufficient permissions to delete product line item id:" + idProductLineItem + ".");
                        setResponsePage(this.ERROR_JSP);
                    }
                }
            }

            this.jsonResult = Json.createObjectBuilder().add("result", "SUCCESS").add("message", resultMessage.toString()).build().toString();
            sess.flush();
            setResponsePage(this.SUCCESS_JSP);

        } catch (Exception e) {
            this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in DeleteProductOrders ", e);
            throw new RollBackCommandException(e.getMessage());
        }

        return this;
    }

    private boolean deleteProductLineItem(ProductLineItem pli, Session sess) {

        if (pli.getCodeProductOrderStatus() != null && pli.getCodeProductOrderStatus().equals(ProductOrderStatus.COMPLETED)) {
            resultMessage.append("Cannot delete completed product line item: ");
            resultMessage.append(pli.getDisplay());
            resultMessage.append(".\r\n");
            this.addInvalidField("Cannot delete line item", "Cannot delete completed product line item: " + pli.getDisplay() + ".");
            return false;
        }

        sess.delete(pli);
        resultMessage.append("Product line item: ");
        resultMessage.append(pli.getDisplay());
        resultMessage.append(" deleted.\r\n");

        sess.flush();
        return true;
    }

}
