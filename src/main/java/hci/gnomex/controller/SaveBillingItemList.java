package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.*;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.*;
import hci.gnomex.utility.LogLongExecutionTimes.LogItem;
import org.apache.commons.lang.builder.EqualsBuilder;
import org.apache.commons.lang.builder.HashCodeBuilder;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.query.Query;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.servlet.http.HttpSession;
import java.io.File;
import java.io.Serializable;
import java.io.StringReader;
import java.sql.Date;
import java.util.*;


public class SaveBillingItemList extends GNomExCommand implements Serializable {

    private class LabAccountBillingPeriod implements Serializable {
        public Lab getLab() {
            return lab;
        }

        public Integer getIdBillingPeriod() {
            return idBillingPeriod;
        }

        public BillingAccount getBillingAccount() {
            return billingAccount;
        }

        public Integer getIdCoreFacility() {
            return idCoreFacility;
        }

        public LabAccountBillingPeriod(Lab lab, Integer idBillingPeriod,
                                       BillingAccount billingAccount, Integer idCoreFacility) {
            super();
            this.lab = lab;
            this.idBillingPeriod = idBillingPeriod;
            this.billingAccount = billingAccount;
            this.idCoreFacility = idCoreFacility;
        }

        private Lab lab;
        private Integer idBillingPeriod;
        private BillingAccount billingAccount;
        private Integer idCoreFacility;

        public int hashCode() {
            return new HashCodeBuilder()
                    .append(getLab().getIdLab())
                    .append(getIdBillingPeriod())
                    .append(getBillingAccount().getIdBillingAccount())
                    .append(getIdCoreFacility())
                    .toHashCode();
        }

        public boolean equals(Object other) {
            if (!(other instanceof LabAccountBillingPeriod)) return false;
            LabAccountBillingPeriod castOther = (LabAccountBillingPeriod) other;
            return new EqualsBuilder()
                    .append(this.getLab().getIdLab(), castOther.getLab().getIdLab())
                    .append(this.getIdBillingPeriod(), castOther.getIdBillingPeriod())
                    .append(this.getBillingAccount().getIdBillingAccount(), castOther.getBillingAccount().getIdBillingAccount())
                    .append(this.getIdCoreFacility(), castOther.getIdCoreFacility())
                    .isEquals();
        }

    }

    // the static field for logging in Log4J
    private static Logger LOG = Logger.getLogger(SaveBillingItemList.class);

    private JsonObject billingItemObject = null;
    private BillingItemParser parser;

    private String serverName;

    private Map<LabAccountBillingPeriod, Object[]> labAccountBillingPeriodMap = new HashMap<>();

    private transient LogLongExecutionTimes executionLogger = null;

    public void validate() {
    }

    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

        String billingItemJSONString = request.getParameter("billingItemJSONString");
        if (Util.isParameterNonEmpty(billingItemJSONString)) {
            try (JsonReader jsonReader = Json.createReader(new StringReader(billingItemJSONString))) {
                this.billingItemObject = jsonReader.readObject();
                this.parser = new BillingItemParser(this.billingItemObject);
            } catch (Exception e) {
                this.addInvalidField("billingItemJSONString", "Invalid billingItemJSONString");
                this.errorDetails = Util.GNLOG(LOG, "Cannot parse billingItemJSONString", e);
            }
        }

        serverName = request.getServerName();
    }

    public Command execute() throws RollBackCommandException {

        if (billingItemObject != null) {
            try {
                Session sess = HibernateSession.currentSession(this.getUsername());

                executionLogger = new LogLongExecutionTimes(LOG, PropertyDictionaryHelper.getInstance(sess), "SaveBillingItemList");
                LogItem li;

                if (this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_BILLING)) {
                    li = executionLogger.startLogItem("Parse");
                    parser.parse(sess);
                    executionLogger.endLogItem(li);

                    li = executionLogger.startLogItem("Validation");
                    for (BillingItem billingItem : parser.getBillingItems()) {
                        if (billingItem.getIdRequest() != null) {
                            Request req = sess.load(Request.class, billingItem.getIdRequest());
                            BillingTemplate billingTemplate = req.getBillingTemplate(sess);
                            if (!billingTemplate.hasBillingAccount(billingItem.getIdBillingAccount())) {
                                throw new GNomExRollbackException("Billing account is not on active billing template.", true, "Billing account is not active on request.");
                            }
                        }
                    }
                    executionLogger.endLogItem(li);

                    li = executionLogger.startLogItem("Initial Save");
                    List<BillingItem> billingItems = new ArrayList<>();
                    HashSet<Integer> idRequests = new HashSet<>();
                    for (BillingItem billingItem : parser.getBillingItems()) {
                        MasterBillingItem masterBillingItem = billingItem.getMasterBillingItem();
                        sess.save(masterBillingItem);
                        billingItem.setIdMasterBillingItem(masterBillingItem.getIdMasterBillingItem());

                        if (billingItem.getIdRequest() != null) {
                            idRequests.add(billingItem.getIdRequest());
                        }
                        if (billingItem.getIdCoreFacility() == null) {
                            if (billingItem.getIdRequest() != null) {
                                Request req = sess.load(Request.class, billingItem.getIdRequest());
                                billingItem.setIdCoreFacility(req.getIdCoreFacility());
                            }
                            if (billingItem.getIdProductOrder() != null) {
                                ProductOrder po = sess.load(ProductOrder.class, billingItem.getIdProductOrder());
                                billingItem.setIdCoreFacility(po.getIdCoreFacility());
                            }
                            if (billingItem.getIdDiskUsageByMonth() != null) {
                                DiskUsageByMonth dsk = sess.load(DiskUsageByMonth.class, billingItem.getIdDiskUsageByMonth());
                                billingItem.setIdCoreFacility(dsk.getIdCoreFacility());
                            }
                        }
                        billingItem.resetInvoiceForBillingItem(sess);
                        sess.save(billingItem);
                        billingItems.add(billingItem);

                    }

                    sess.flush();
                    executionLogger.endLogItem(li);

                    li = executionLogger.startLogItem("Set PO Status");
                    for (BillingItem billingItem : billingItems) {
                        sess.refresh(billingItem);

                        // For PO Billing account, approved status is changed to
                        // 'Approved External' so that it shows under a different
                        // folder in the billing tree.
                        if (billingItem.getCodeBillingStatus().equals(BillingStatus.APPROVED)) {
                            if (billingItem.getBillingAccount().getIsPO() != null && billingItem.getBillingAccount().getIsPO().equals("Y")) {
                                billingItem.setCodeBillingStatus(BillingStatus.APPROVED_PO);
                            }
                            if (billingItem.getBillingAccount().getIsCreditCard() != null && billingItem.getBillingAccount().getIsCreditCard().equals("Y")) {
                                billingItem.setCodeBillingStatus(BillingStatus.APPROVED_CC);
                            }
                        }
                    }

                    sess.flush();
                    executionLogger.endLogItem(li);

                    li = executionLogger.startLogItem("Check Approved");
                    for (BillingItem bi : parser.getBillingItems()) {
                        sess.refresh(bi);
                        // This item should not contribute to decision to send billing statement if previously approved
                        if (!(bi.getCodeBillingStatus().equals(BillingStatus.APPROVED) && (bi.getCurrentCodeBillingStatus().equals(BillingStatus.APPROVED)))) {
                            LabAccountBillingPeriod labp = new LabAccountBillingPeriod(bi.getLab(), bi.getBillingPeriod().getIdBillingPeriod(), bi.getBillingAccount(), bi.getIdCoreFacility());
                            labAccountBillingPeriodMap.put(labp, null);
                        }

                    }
                    executionLogger.endLogItem(li);

                    li = executionLogger.startLogItem("Delete Items");
                    for (BillingItem bi : parser.getBillingItemsToRemove()) {
                        // Check to see if the master billing item only has this billing item
                        Boolean deleteMaster = false;
                        MasterBillingItem masterBillingItem = bi.getMasterBillingItem();
                        if (masterBillingItem != null && (masterBillingItem.getBillingItems() == null || masterBillingItem.getBillingItems().size() == 1)) {
                            deleteMaster = true;
                        }

                        sess.delete(bi);
                        if (deleteMaster) {
                            sess.delete(masterBillingItem);
                        }
                    }
                    sess.flush();
                    executionLogger.endLogItem(li);

                    li = executionLogger.startLogItem("Save Invoices");
                    for (Invoice invoice : parser.getInvoices()) {
                        sess.save(invoice);
                    }
                    sess.flush();
                    executionLogger.endLogItem(li);

                    for (LabAccountBillingPeriod labp : labAccountBillingPeriodMap.keySet()) {
                        this.checkToSendInvoiceEmail(sess, labp.getLab(), labp.getIdBillingPeriod(), labp.getBillingAccount(), labp.getIdCoreFacility());
                    }

                    //Check if all billing Items are complete.  If so mark the request as complete and capture date
                    for (Integer id : idRequests) {
                        Request r = sess.load(Request.class, id);
                        Boolean allComplete = true;
                        for (BillingItem bi : r.getBillingItemList(sess)) {
                            if (!bi.getCodeBillingStatus().equals(BillingStatus.COMPLETED) && !bi.getCodeBillingStatus().equals(BillingStatus.APPROVED)
                                    && !bi.getCodeBillingStatus().equals(BillingStatus.APPROVED_CC) && !bi.getCodeBillingStatus().equals(BillingStatus.APPROVED_PO)) {
                                allComplete = false;
                                break;
                            }
                        }

                        if (allComplete) {
                            ProductUtil.updateLedgerOnRequestStatusChange(sess, r, r.getCodeRequestStatus(), RequestStatus.COMPLETED);
                            r.setCodeRequestStatus(RequestStatus.COMPLETED);
                            r.setCompletedDate(new Date(System.currentTimeMillis()));
                            sess.save(r);
                        }
                    }

                    sess.flush();

                    this.xmlResult = "<SUCCESS/>";

                    setResponsePage(this.SUCCESS_JSP);
                } else {
                    this.addInvalidField("Insufficient permissions", "Insufficient permission to manage workflow");
                    setResponsePage(this.ERROR_JSP);
                }

                this.executionLogger.LogTimes();
            } catch (GNomExRollbackException e) {
                LOG.error("An exception has occurred in SaveBillingItemList ", e);
                throw new GNomExRollbackException(e.getMessage(), true, e.getDisplayFriendlyMessage());
            } catch (Exception e) {
                this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in SaveBillingItemList ", e);
                throw new GNomExRollbackException(e.getMessage(), true, "An error occurred saving the billing item list.");
            }
        } else {
            this.xmlResult = "<SUCCESS/>";
            setResponsePage(this.SUCCESS_JSP);
        }

        return this;
    }

    private void checkToSendInvoiceEmail(Session sess, Lab lab, Integer idBillingPeriod, BillingAccount billingAccount, Integer idCoreFacility) {
        if ((lab != null && lab.getContactEmail() != null && !lab.getContactEmail().equals("")) || (lab != null && lab.getBillingContactEmail() != null && !lab.getBillingContactEmail().equals(""))) {
            if (this.readyToInvoice(sess, idBillingPeriod, lab, billingAccount.getIdBillingAccount(), idCoreFacility)) {
                try {
                    sendInvoiceEmail(sess, idBillingPeriod, lab, billingAccount, idCoreFacility, true);
                } catch (Exception e) {
                    LOG.error("Unable to send invoice email to billing contact " + lab.getContactEmail() + " for lab " + lab.getName(false, true) + ".", e);
                }

            }
        } else if (this.readyToInvoice(sess, idBillingPeriod, lab, billingAccount.getIdBillingAccount(), idCoreFacility)) {
            try {
                sendInvoiceEmail(sess, idBillingPeriod, lab, billingAccount, idCoreFacility, false);
            } catch (Exception e) {
                LOG.error("Unable to send invoice email to billing contact " + lab.getContactEmail() + " for lab " + lab.getName(false, true) + ".", e);
            }
            //LOG.error("Unable to send invoice email to billing contact for lab " + lab.getName());
        }
    }

    private void sendInvoiceEmail(Session sess, Integer idBillingPeriod, Lab lab, BillingAccount billingAccount, Integer idCoreFacility, Boolean labEmailPresent) throws Exception {
        LogItem li = this.executionLogger.startLogItem("Format Email");
        DictionaryHelper dictionaryHelper = DictionaryHelper.getInstance(sess);

        BillingPeriod billingPeriod = dictionaryHelper.getBillingPeriod(idBillingPeriod);
        CoreFacility coreFacility = sess.get(CoreFacility.class, idCoreFacility);

        TreeMap requestMap = new TreeMap();
        TreeMap billingItemMap = new TreeMap();
        TreeMap relatedBillingItemMap = new TreeMap();
        String queryString = "from Invoice where idCoreFacility=:idCoreFacility and idBillingPeriod=:idBillingPeriod and idBillingAccount=:idBillingAccount";
        Query query = sess.createQuery(queryString);
        query.setParameter("idCoreFacility", idCoreFacility);
        query.setParameter("idBillingPeriod", idBillingPeriod);
        query.setParameter("idBillingAccount", billingAccount.getIdBillingAccount());
        Invoice invoice = (Invoice) query.uniqueResult();
        ShowBillingInvoiceForm.cacheBillingItemMaps(sess, this.getSecAdvisor(), idBillingPeriod, lab.getIdLab(), billingAccount.getIdBillingAccount(), idCoreFacility, billingItemMap, relatedBillingItemMap, requestMap);

        BillingInvoiceEmailFormatter emailFormatter = new BillingInvoiceEmailFormatter(sess, coreFacility, billingPeriod, lab, billingAccount, invoice, billingItemMap, relatedBillingItemMap, requestMap);
        String subject = emailFormatter.getSubject();

        boolean notifyCoreFacilityOfEmptyBillingEmail = false;
        String missingBillingEmailNote = "";
        String emailRecipients = "";

        if (labEmailPresent) {
            if (lab.getBillingContactEmail() != null && !lab.getBillingContactEmail().equals("")) {
                emailRecipients = lab.getBillingContactEmail();
            } else if (lab.getContactEmail() != null && !lab.getContactEmail().equals("")) {
                emailRecipients = lab.getContactEmail();
            }
            if (billingAccount.getLab() != null && !lab.getIdLab().equals(billingAccount.getLab().getIdLab())) {
                emailRecipients = appendBillingAccountLabEmail(emailRecipients, billingAccount);
            }
        } else {
            emailRecipients = coreFacility.getContactEmail();
            notifyCoreFacilityOfEmptyBillingEmail = true;
            //emailInfo += "Please note that we could not send the following invoice to the lab specified because the lab has no email address on file.  Please update the lab's information.<br><br>";
            missingBillingEmailNote = "Please note that the invoice for the account " + billingAccount.getAccountNameDisplay() +
                    ", assigned to the " + Util.getLabDisplayName(lab, this.getUserPreferences()) + ", under the billing period " +
                    billingPeriod.getDisplay() +
                    " has not been delivered because no billing contact email or P.I. email was on file for the lab.  Please update the lab's billing contact information for the future.<br><br>";

        }

        String ccList = emailFormatter.getCCList(sess);
        String fromAddress = coreFacility.getContactEmail();
        if (emailRecipients.contains(",")) {
            for (String e : emailRecipients.split(",")) {
                if (!MailUtil.isValidEmail(e.trim())) {
                    LOG.error("Invalid email address " + e);
                }
            }
        } else if (!MailUtil.isValidEmail(emailRecipients)) {
            LOG.error("Invalid email address " + emailRecipients);
        }
        this.executionLogger.endLogItem(li);

        li = this.executionLogger.startLogItem("Send email");

        if (!MailUtil.isValidEmail(fromAddress)) {
            fromAddress = DictionaryHelper.getInstance(sess).getPropertyDictionary(PropertyDictionary.GENERIC_NO_REPLY_EMAIL);
        }

        if (notifyCoreFacilityOfEmptyBillingEmail) {
            MailUtilHelper helper = new MailUtilHelper(
                    emailRecipients,
                    DictionaryHelper.getInstance(sess).getPropertyDictionary(PropertyDictionary.GENERIC_NO_REPLY_EMAIL),
                    "Unable to send billing invoice",
                    missingBillingEmailNote,
                    null,
                    true,
                    dictionaryHelper,
                    serverName);
            MailUtil.validateAndSendEmail(helper);
        }

        Map[] billingItemMaps = {billingItemMap};
        Map[] relatedBillingItemMaps = {relatedBillingItemMap};
        Map[] requestMaps = {requestMap};
        try {
            File billingInvoice = ShowBillingInvoiceForm.makePDFBillingInvoice(sess, serverName, billingPeriod, coreFacility, false, lab,
                    new Lab[0], billingAccount, new BillingAccount[0],
                    PropertyDictionaryHelper.getInstance(sess).getCoreFacilityProperty(coreFacility.getIdCoreFacility(), PropertyDictionary.CONTACT_ADDRESS_CORE_FACILITY),
                    PropertyDictionaryHelper.getInstance(sess).getCoreFacilityProperty(coreFacility.getIdCoreFacility(), PropertyDictionary.CONTACT_REMIT_ADDRESS_CORE_FACILITY),
                    billingItemMaps, relatedBillingItemMaps, requestMaps, this.getUserPreferences());

            MailUtilHelper helper = new MailUtilHelper(emailRecipients, ccList, null, fromAddress, subject, "" + emailFormatter.format(this.getUserPreferences()), billingInvoice, true, dictionaryHelper, serverName);
            MailUtil.validateAndSendEmail(helper);

            billingInvoice.delete();
        } catch (Exception e) {
            LOG.error("Unable to send invoice email to " + emailRecipients, e);
        }

        // Set last email date
        if (invoice != null) {
            invoice.setLastEmailDate(new java.sql.Date(System.currentTimeMillis()));
            sess.save(invoice);

            sendNotification(invoice, sess, Notification.NEW_STATE, Notification.SOURCE_TYPE_BILLING, Notification.TYPE_INVOICE);

            sess.flush();
        }

        this.executionLogger.endLogItem(li);
    }

    private String appendBillingAccountLabEmail(String recipients, BillingAccount billingAccount) {
        StringBuilder allRecipients = new StringBuilder(recipients);

        if (allRecipients.length() > 0) {
            allRecipients.append(",");
        }

        Lab lab = billingAccount.getLab();
        if (lab.getBillingContactEmail() != null && !lab.getBillingContactEmail().equals("")) {
            allRecipients.append(lab.getBillingContactEmail());
        } else if (lab.getContactEmail() != null && !lab.getContactEmail().equals("")) {
            allRecipients.append(lab.getContactEmail());
        }

        return allRecipients.toString();
    }

    private boolean readyToInvoice(Session sess, Integer idBillingPeriod, Lab lab, Integer idBillingAccount, Integer idCoreFacility) {
        LogItem li = this.executionLogger.startLogItem("readyToInvoice");
        boolean readyToInvoice = false;

        if (lab != null && idBillingAccount != null) {
            // Find out if this is all billing items for this lab and billing period
            // are approved.  If so, send out a billing invoice to the
            // lab's billing contact.
            StringBuilder buf = new StringBuilder();
            buf.append("SELECT DISTINCT bi.codeBillingStatus, count(*) ");
            buf.append("FROM   Request req ");
            buf.append("JOIN   req.billingItems bi ");
            buf.append("WHERE  bi.idBillingPeriod = ");
            buf.append(idBillingPeriod);
            buf.append(" ");
            buf.append("AND    bi.idLab = ");
            buf.append(lab.getIdLab());
            buf.append("AND    bi.idBillingAccount = ");
            buf.append(idBillingAccount);
            buf.append("AND    bi.idCoreFacility = ");
            buf.append(idCoreFacility);
            buf.append("GROUP BY bi.codeBillingStatus ");

            List countList = sess.createQuery(buf.toString()).list();
            int approvedCount = 0;
            int otherCount = 0;
            for (Iterator i = countList.iterator(); i.hasNext(); ) {
                Object[] countRow = (Object[]) i.next();
                String codeBillingStatus = (String) countRow[0];
                Integer count = (int) (long) countRow[1];

                if (codeBillingStatus.equals(BillingStatus.APPROVED) || codeBillingStatus.equals(BillingStatus.APPROVED_PO) || codeBillingStatus.equals(BillingStatus.APPROVED_CC)) {
                    approvedCount = count;
                } else {
                    otherCount += count;
                }

            }
            if (approvedCount > 0 && otherCount == 0) {
                readyToInvoice = true;
            }

        }
        this.executionLogger.endLogItem(li);
        return readyToInvoice;

    }


}
