package hci.gnomex.controller;

import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.billing.ProductPlugin;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.*;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.internal.SessionImpl;
import org.hibernate.query.NativeQuery;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonReader;
import jakarta.mail.MessagingException;
import javax.naming.NamingException;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.Serializable;
import java.io.StringReader;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.sql.Connection;
import java.sql.Date;
import java.sql.SQLException;
import java.util.*;

public class SaveProductOrder extends GNomExCommand implements Serializable {

    private static Logger LOG = Logger.getLogger(SaveProductOrder.class);

    private Integer idBillingAccount;
    private Integer idAppUser;
    private Integer idLab;
    private Integer idCoreFacility;
    private String codeProductOrderStatus;
    private JsonArray productArray;
    private JsonObject billingTemplate = null;

    private ProductPlugin productPlugin = new ProductPlugin();

    private String serverName;

    public void loadCommand(HttpServletWrappedRequest request, HttpSession sess) {

        serverName = request.getServerName();

        if (request.getParameter("idBillingAccount") != null && !request.getParameter("idBillingAccount").equals("")) {
            idBillingAccount = Integer.parseInt(request.getParameter("idBillingAccount"));
        } else {
            String billingTemplateJSONString = request.getParameter("billingTemplateJSONString");
            if (Util.isParameterNonEmpty(billingTemplateJSONString)) {
                try (JsonReader jsonReader = Json.createReader(new StringReader(billingTemplateJSONString))) {
                    this.billingTemplate = jsonReader.readObject();
                } catch (Exception e) {
                    this.addInvalidField("billingTemplateJSONString", "Invalid billingTemplateJSONString");
                    this.errorDetails = Util.GNLOG(LOG, "Cannot parse billingTemplateJSONString", e);
                }
            }
        }

        if (idBillingAccount == null && billingTemplate == null) {
            this.addInvalidField("Billing Information", "Missing either idBillingAccount or billingTemplate");
        }

        if (request.getParameter("idAppUser") != null && !request.getParameter("idAppUser").equals("")) {
            idAppUser = Integer.parseInt(request.getParameter("idAppUser"));
        } else {
            this.addInvalidField("idAppUser", "Missing idAppUser");
        }

        if (request.getParameter("idCoreFacility") != null && !request.getParameter("idCoreFacility").equals("")) {
            idCoreFacility = Integer.parseInt(request.getParameter("idCoreFacility"));
        } else {
            this.addInvalidField("idCoreFacility", "Missing idCoreFacility");
        }

        if (request.getParameter("idLab") != null && !request.getParameter("idLab").equals("")) {
            idLab = Integer.parseInt(request.getParameter("idLab"));
        } else {
            this.addInvalidField("idLab", "Missing idLab");
        }

        if (request.getParameter("codeProductOrderStatus") != null
                && !request.getParameter("codeProductOrderStatus").equals("")) {
            codeProductOrderStatus = request.getParameter("codeProductOrderStatus");
        } else {
            this.addInvalidField("codeProductOrderStatus", "Missing codeProductOrderStatus");
        }

        String productListJSONString = request.getParameter("productListJSONString");
        if (Util.isParameterNonEmpty(productListJSONString)) {
            try (JsonReader jsonReader = Json.createReader(new StringReader(productListJSONString))) {
                this.productArray = jsonReader.readArray();
            } catch (Exception e) {
                this.addInvalidField("productListJSONString", "Invalid productListJSONString");
                this.errorDetails = Util.GNLOG(LOG, "Cannot parse productListJSONString", e);
            }
        }

    }

    public Command execute() throws RollBackCommandException {
        Session sess;
        try {
            if (this.isValid()) {
                sess = HibernateSession.currentSession(this.getUsername());

                BillingPeriod billingPeriod = DictionaryHelper.getInstance(sess).getCurrentBillingPeriod();
                Lab lab = DictionaryHelper.getInstance(sess).getLabObject(idLab);
                HashMap<Integer, ArrayList<JsonObject>> productTypes = new HashMap<>();

                for (int i = 0; i < this.productArray.size(); i++) {
                    JsonObject n = this.productArray.getJsonObject(i);
                    if (n.get("quantity") == null || n.getInt("quantity") <= 0) {
                        continue;
                    }
                    if (!productTypes.containsKey(Integer.parseInt(n.getString("idProductType")))) {
                        ArrayList<JsonObject> products = new ArrayList<>();
                        products.add(n);
                        productTypes.put(Integer.parseInt(n.getString("idProductType")), products);
                    } else {
                        ArrayList<JsonObject> existingList = productTypes.get(Integer.parseInt(n.getString("idProductType")));
                        existingList.add(n);
                        productTypes.put(Integer.parseInt(n.getString("idProductType")), existingList);
                    }
                }

                for (Integer idProductTypeKey : productTypes.keySet()) {
                    ProductType productType = sess.load(ProductType.class, idProductTypeKey);
                    PriceCategory priceCategory = sess.load(PriceCategory.class, productType.getIdPriceCategory());
                    ArrayList<JsonObject> products = productTypes.get(idProductTypeKey);
                    Set<ProductLineItem> productLineItems = new TreeSet<>(new ProductLineItemComparator());

                    if (products.size() > 0) {
                        // Set up product order
                        ProductOrder po = new ProductOrder();
                        initializeProductOrder(po, idProductTypeKey);
                        sess.save(po);
                        po.setProductOrderNumber(getNextPONumber(po, sess));
                        sess.save(po);

                        // Set up billing template
                        BillingTemplate billingTemplate;
                        if (idBillingAccount != null) {
                            billingTemplate = new BillingTemplate();
                            billingTemplate.setOrder(po);
                            billingTemplate.updateSingleBillingAccount(idBillingAccount);
                            sess.save(billingTemplate);
                            for (BillingTemplateItem item : billingTemplate.getItems()) {
                                item.setIdBillingTemplate(billingTemplate.getIdBillingTemplate());
                                sess.save(item);
                            }
                            sess.flush();
                        } else {
                            BillingTemplateParser btParser = new BillingTemplateParser(this.billingTemplate);
                            btParser.parse(sess);
                            billingTemplate = btParser.getBillingTemplate();
                            billingTemplate.setOrder(po);
                            sess.save(billingTemplate);
                            sess.flush();

                            // Get new template items from parser and save to billing template
                            TreeSet<BillingTemplateItem> btiSet = btParser.getBillingTemplateItems();
                            for (BillingTemplateItem newlyCreatedItem : btiSet) {
                                newlyCreatedItem.setIdBillingTemplate(billingTemplate.getIdBillingTemplate());
                                billingTemplate.getItems().add(newlyCreatedItem);
                                sess.save(newlyCreatedItem);
                            }
                            sess.flush();
                        }

                        po.setIdBillingAccount(billingTemplate.getAcceptingBalanceItem().getIdBillingAccount());
                        sess.save(po);

                        for (JsonObject n : products) {
                            if (n.getBoolean("isSelected") && n.getInt("quantity") > 0) {
                                ProductLineItem pi = new ProductLineItem();
                                Price p = sess.load(Price.class, Integer.parseInt(n.getString("idPrice")));
                                initializeProductLineItem(pi, po.getIdProductOrder(), n, p.getEffectiveUnitPrice(lab));
                                productLineItems.add(pi);
                                sess.save(pi);
                            }
                        }
                        po.setProductLineItems(productLineItems);
                        sess.save(po);

                        sess.flush();
                        sess.refresh(po);

                        List<BillingItem> billingItems = productPlugin.constructBillingItems(sess, billingPeriod,
                                priceCategory, po, productLineItems, billingTemplate);

                        for (MasterBillingItem masterBillingItem : billingTemplate.getMasterBillingItems()) {
                            sess.save(masterBillingItem);
                            for (BillingItem billingItem : masterBillingItem.getBillingItems()) {
                                billingItem.setIdMasterBillingItem(masterBillingItem.getIdMasterBillingItem());
                            }
                        }

                        for (BillingItem bi : billingItems) {
                            sess.save(bi);
                        }

                        sendConfirmationEmail(sess, po, ProductOrderStatus.NEW, serverName, this.getUserPreferences());

                    }
                }

                sess.flush();

                this.setResponsePage(SUCCESS_JSP);

            } else {
                this.addInvalidField("Insufficient permissions", "Insufficient permission to create product orders.");
                setResponsePage(this.ERROR_JSP);
            }

        } catch (Exception e) {
            this.errorDetails = Util.GNLOG(LOG, "An exception has occurred while emailing in SaveProductOrder ", e);
            throw new RollBackCommandException(e.toString());
        }
        return this;
    }

    public static void sendConfirmationEmail(Session sess, ProductOrder po, String orderStatus, String serverName, UserPreferences userPreferences)
            throws NamingException, MessagingException, IOException {

        DictionaryHelper dictionaryHelper = DictionaryHelper.getInstance(sess);
        CoreFacility cf = sess.load(CoreFacility.class, po.getIdCoreFacility());

        String subject = "";
        if (orderStatus.equals(ProductOrderStatus.NEW)) {
            subject = "Product Order " + po.getProductOrderNumber() + " has been submitted.";
        } else if (orderStatus.equals(ProductOrderStatus.COMPLETED)) {
            subject = "Product Order " + po.getProductOrderNumber() + " has been completed.";
        }
        String contactEmailCoreFacility = cf.getContactEmail() != null ? cf.getContactEmail() : "";
        String contactEmailAppUser = po.getSubmitter().getEmail() != null ? po.getSubmitter().getEmail() : "";
        String fromAddress = dictionaryHelper.getPropertyDictionary(PropertyDictionary.GENERIC_NO_REPLY_EMAIL);
        String noAppUserEmailMsg = "";

        String toAddress = contactEmailCoreFacility + "," + contactEmailAppUser;

        BillingAccount ba = sess.load(BillingAccount.class, po.getAcceptingBalanceAccountId(sess));
        ProductType pt = sess.load(ProductType.class, po.getIdProductType());

        if (!MailUtil.isValidEmail(contactEmailAppUser)) {
            noAppUserEmailMsg = "The user who submitted this product order did not receive a copy of this confirmation because they do not have a valid email on file.\n";
        }

        // If no valid to address then send to gnomex support team
        if (!MailUtil.isValidEmail(toAddress)) {
            toAddress = dictionaryHelper.getPropertyDictionary(PropertyDictionary.CONTACT_EMAIL_SOFTWARE_TESTER);
        }

        StringBuilder body = new StringBuilder();
        body.append("  <STYLE TYPE=\"text/css\">");
        body.append("TD{font-family: Arial; font-size: 9pt;}");
        body.append("</STYLE><FONT face=\"arial\" size=\"9pt\">");
        if (orderStatus.equals(ProductOrderStatus.NEW)) {
            body.append("Product Order ");
            body.append(po.getProductOrderNumber());
            body.append(" has been submitted to the ");
            body.append(cf.getFacilityName());
            body.append(".<br>");
        } else if (orderStatus.equals(ProductOrderStatus.COMPLETED)) {
            body.append("Product Order ");
            body.append(po.getProductOrderNumber());
            body.append(" has been completed and the products are ready for your use.<br>");
        }

        body.append("<br><table border='0' width='400'>");
        body.append("<tr><td>Submit Date:</td><td>");
        body.append(po.getSubmitDate());
        body.append("</td></tr>");
        body.append("<tr><td>Submitted By:</td><td>");
        body.append(po.getSubmitter().getDisplayName());
        body.append("</td></tr>");
        body.append("<tr><td>Lab:</td><td>");
        body.append(Util.getLabDisplayName(po.getLab(), userPreferences));
        body.append("</td></tr>");
        body.append("<tr><td>Billing Acct:</td><td>");
        body.append(ba.getAccountNameAndNumber());
        body.append("</td></tr>");
        body.append("<tr><td>Product Type:</td><td>");
        body.append(pt.getDisplay());
        body.append("</td></tr>");
        body.append("</table><br>Products Ordered:<br>");

        body.append(getProductLineItemTable(po, sess));

        body.append("<br><br><FONT COLOR=\"#ff0000\">");
        body.append(noAppUserEmailMsg);
        body.append("</FONT></FONT>");

        MailUtilHelper mailHelper = new MailUtilHelper(toAddress, fromAddress, subject, body.toString(), null, true,
                dictionaryHelper, serverName);

        MailUtil.validateAndSendEmail(mailHelper);

    }

    private static StringBuffer getProductLineItemTable(ProductOrder po, Session sess) {
        StringBuffer productTableString = new StringBuffer();
        productTableString.append("<table border='0' width = '300'>");
        productTableString.append("<tr><th>Name</th><th>Qty</th><th>Cost</th></tr>");

        BigDecimal grandTotal = new BigDecimal(BigInteger.ZERO, 2);
        for (ProductLineItem pli : po.getProductLineItems()) {
            Product p = sess.load(Product.class, pli.getIdProduct());
            BigDecimal estimatedCost = pli.getUnitPrice().multiply(new BigDecimal(pli.getQty()));
            grandTotal = grandTotal.add(estimatedCost);

            productTableString.append("<tr><td>");
            productTableString.append(p.getDisplay());
            productTableString.append("</td><td align=\"center\">");
            productTableString.append(pli.getQty());
            productTableString.append("</td><td align=\"right\">$");
            productTableString.append(estimatedCost);
            productTableString.append("</td></tr>");
        }

        productTableString.append("</table>");
        productTableString.append("<br>Grand Total:  $");
        productTableString.append(grandTotal);

        return productTableString;
    }

    private static String getNextPONumber(ProductOrder po, Session sess) throws SQLException {
        String poNumber = null;
        String procedure = PropertyDictionaryHelper.getInstance(sess).getCoreFacilityProperty(po.getIdCoreFacility(),
                PropertyDictionary.GET_PO_NUMBER_PROCEDURE);
        if (procedure != null && procedure.length() > 0) {
            SessionImpl sessionImpl = (SessionImpl) sess;
            Connection con = sessionImpl.connection();
            String queryString;
            if (con.getMetaData().getDatabaseProductName().toUpperCase().contains(Constants.SQL_SERVER)) {
                queryString = "exec " + procedure;
            } else {
                queryString = "call " + procedure;
            }
            NativeQuery query = sess.createNativeQuery(queryString);
            List l = query.list();
            if (l.size() != 0) {
                Object o = l.get(0);
                if (o.getClass().equals(String.class)) {
                    poNumber = (String) o;
                    poNumber = poNumber.toUpperCase();
                }
            }
        }
        if (poNumber == null || poNumber.length() == 0) {
            poNumber = po.getIdProductOrder().toString();
        }

        return poNumber;
    }

    private void initializeProductOrder(ProductOrder po, Integer idProductType) {
        po.setSubmitDate(new Date(System.currentTimeMillis()));
        po.setIdProductType(idProductType);
        po.setQuoteNumber("");
        po.setIdAppUser(idAppUser);
        po.setIdCoreFacility(idCoreFacility);
        po.setIdLab(idLab);
    }

    private void initializeProductLineItem(ProductLineItem pi, Integer idProductOrder, JsonObject n, BigDecimal unitPrice) {
        pi.setIdProductOrder(idProductOrder);
        pi.setIdProduct(Integer.parseInt(n.getString("idProduct")));
        pi.setQty(n.getInt("quantity"));
        pi.setUnitPrice(unitPrice);
        pi.setCodeProductOrderStatus(codeProductOrderStatus);
    }

    public class ProductLineItemComparator implements Comparator<ProductLineItem>, Serializable {
        public int compare(ProductLineItem li1, ProductLineItem li2) {
            return li1.getIdProduct().compareTo(li2.getIdProduct());
        }
    }

    public void validate() {
    }

}
