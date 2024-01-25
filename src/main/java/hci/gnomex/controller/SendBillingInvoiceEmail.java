package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.*;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.query.Query;

import javax.json.Json;
import javax.servlet.http.HttpSession;
import java.io.File;
import java.io.Serializable;
import java.util.Map;
import java.util.TreeMap;

@SuppressWarnings("serial")
public class SendBillingInvoiceEmail extends GNomExCommand implements Serializable {

    private static Logger LOG = Logger.getLogger(SendBillingInvoiceEmail.class);

    private Integer idLab;
    private Integer idBillingAccount;
    private Integer idBillingPeriod;
    private Integer idCoreFacility;

    private SecurityAdvisor secAdvisor;
    private DictionaryHelper dh;

    private String emailAddress;
    private String serverName;

    public void validate() {
    }

    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
        if (request.getParameter("idLab") != null) {
            idLab = Integer.valueOf(request.getParameter("idLab"));
        } else {
            this.addInvalidField("idLab", "idLab is required");
        }

        if (request.getParameter("idBillingAccount") != null && request.getParameter("idBillingAccount").length() > 0) {
            idBillingAccount = Integer.valueOf(request.getParameter("idBillingAccount"));
        } else {
            this.addInvalidField("idBillingAccount", "idBillingAccount is required");
        }

        if (request.getParameter("idBillingPeriod") != null) {
            idBillingPeriod = Integer.valueOf(request.getParameter("idBillingPeriod"));
        } else {
            this.addInvalidField("idBillingPeriod", "idBillingPeriod is required");
        }

        if (request.getParameter("idCoreFacility") != null) {
            idCoreFacility = Integer.valueOf(request.getParameter("idCoreFacility"));
        } else {
            this.addInvalidField("idCoreFacility", "idCoreFacility is required");
        }

        if (request.getParameter("emailAddress") != null && !request.getParameter("emailAddress").equals("")) {
            emailAddress = request.getParameter("emailAddress");
        }

        secAdvisor = (SecurityAdvisor) session.getAttribute(SecurityAdvisor.SECURITY_ADVISOR_SESSION_KEY);
        serverName = request.getServerName();
    }

    public Command execute() throws RollBackCommandException {
        try {

            if (isValid()) {

                if (secAdvisor.hasPermission(SecurityAdvisor.CAN_MANAGE_BILLING)) {

                    Session sess = secAdvisor.getHibernateSession(this.getUsername());
                    dh = DictionaryHelper.getInstance(sess);
                    BillingPeriod billingPeriod = dh.getBillingPeriod(idBillingPeriod);
                    CoreFacility coreFacility = sess.get(CoreFacility.class, idCoreFacility);
                    Lab lab = sess.get(Lab.class, idLab);
                    BillingAccount billingAccount = sess.get(BillingAccount.class, idBillingAccount);
                    TreeMap requestMap = new TreeMap();
                    TreeMap billingItemMap = new TreeMap();
                    TreeMap relatedBillingItemMap = new TreeMap();
                    ShowBillingInvoiceForm.cacheBillingItemMaps(sess, secAdvisor, idBillingPeriod, idLab, idBillingAccount,
                            idCoreFacility, billingItemMap, relatedBillingItemMap, requestMap);
                    String contactEmail = this.emailAddress;
                    if (contactEmail == null) {
                        contactEmail = lab.getBillingNotificationEmail();
                    }
                    this.sendInvoiceEmail(sess, contactEmail, coreFacility, billingPeriod, lab, billingAccount,
                            billingItemMap, relatedBillingItemMap, requestMap);
                }

            }

            if (isValid()) {
                setResponsePage(this.SUCCESS_JSP);
            } else {
                setResponsePage(this.ERROR_JSP);
            }

        } catch (Exception e) {
            this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in SendBillingInvoiceEmail ", e);

            throw new RollBackCommandException(e.getMessage());
        }

        return this;
    }

    private void sendInvoiceEmail(Session sess, String emailRecipients, CoreFacility coreFacility,
                                  BillingPeriod billingPeriod, Lab lab, BillingAccount billingAccount, Map billingItemMap,
                                  Map relatedBillingItemMap, Map requestMap) throws Exception {

        Query query = sess
                .createQuery("from Invoice where idCoreFacility=:idCoreFacility and idBillingPeriod=:idBillingPeriod and idBillingAccount=:idBillingAccount");
        query.setParameter("idCoreFacility", idCoreFacility);
        query.setParameter("idBillingPeriod", idBillingPeriod);
        query.setParameter("idBillingAccount", idBillingAccount);
        Invoice invoice = (Invoice) query.uniqueResult();
        BillingInvoiceEmailFormatter emailFormatter = new BillingInvoiceEmailFormatter(sess, coreFacility, billingPeriod,
                lab, billingAccount, invoice, billingItemMap, relatedBillingItemMap, requestMap);
        String subject = emailFormatter.getSubject();
        String body = emailFormatter.format(this.getUserPreferences());

        String note;
        String ccList = emailFormatter.getCCList(sess);
        String fromAddress = coreFacility.getContactEmail();
        for (String email : emailRecipients.split(",")) {
            if (!MailUtil.isValidEmail(email.trim())) {
                LOG.error("Invalid email address " + email);
            }
        }

        if (!emailRecipients.equals("")) {
            Map[] billingItemMaps = {billingItemMap};
            Map[] relatedBillingItemMaps = {relatedBillingItemMap};
            Map[] requestMaps = {requestMap};
            if (!MailUtil.isValidEmail(fromAddress)) {
                fromAddress = dh.getPropertyDictionary(PropertyDictionary.GENERIC_NO_REPLY_EMAIL);
            }
            try {
                File billingInvoice = ShowBillingInvoiceForm.makePDFBillingInvoice(
                        sess,
                        serverName,
                        billingPeriod,
                        coreFacility,
                        false,
                        lab,
                        new Lab[0],
                        billingAccount,
                        new BillingAccount[0],
                        PropertyDictionaryHelper.getInstance(sess).getCoreFacilityProperty(
                                coreFacility.getIdCoreFacility(), PropertyDictionary.CONTACT_ADDRESS_CORE_FACILITY),
                        PropertyDictionaryHelper.getInstance(sess).getCoreFacilityProperty(
                                coreFacility.getIdCoreFacility(), PropertyDictionary.CONTACT_REMIT_ADDRESS_CORE_FACILITY),
                        billingItemMaps, relatedBillingItemMaps, requestMaps,
                        this.getUserPreferences());

                MailUtilHelper helper = new MailUtilHelper(emailRecipients, ccList, null, fromAddress, subject, body,
                        billingInvoice, true, dh, serverName);
                MailUtil.validateAndSendEmail(helper);

                billingInvoice.delete();

                note = "Billing invoice emailed to " + emailRecipients + ".";

                // Set last email date
                if (invoice != null) {
                    invoice.setLastEmailDate(new java.sql.Date(System.currentTimeMillis()));
                    sess.save(invoice);
                    sess.flush();
                }
            } catch (Exception e) {
                LOG.error("Unable to send invoice email to " + emailRecipients, e);
                note = "Unable to email invoice to " + emailRecipients + " due to the following error: " + e.toString();
            }
        } else {
            note = "Unable to email billing invoice. Billing contact email is blank for " + Util.getLabDisplayName(lab, this.getUserPreferences());
        }

        this.jsonResult = Json.createObjectBuilder()
                .add("note", note)
                .add("title", "Email Billing Invoice - " + Util.getLabDisplayName(lab, this.getUserPreferences()) + " " + billingAccount.getAccountName())
                .build().toString();
    }

}
