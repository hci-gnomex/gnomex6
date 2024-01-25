package hci.gnomex.controller;

import com.itextpdf.text.Element;
import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.*;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.*;
import hci.report.constants.ReportFormats;
import hci.report.model.ReportTray;
import hci.report.utility.ReportCommand;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.json.JsonValue;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.io.StringReader;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;
@SuppressWarnings("serial")
public class ShowRequestForm extends ReportCommand implements Serializable {

    private static Logger LOG = Logger.getLogger(ShowRequestForm.class);

    public String SUCCESS_JSP = "/form_pdf.jsp";

    private SecurityAdvisor		secAdvisor;

    private Integer          	idRequest;
    private Request          	request;

    private String           	amendState;

    private Boolean				comingFromEmail = false;

    private AppUser          	appUser;
    private BillingAccount   	billingAccount;

    private DictionaryHelper 	dictionaryHelper;

    private String				serverName;

    // Used if the command is being called on an unsubmitted experiment.
    private boolean isGeneratingQuote = false;

    private String requestJSONString;

    @Override
    public void validate() {
    }

    @Override
    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
        if (request.getParameter("idRequest") != null) {
            idRequest = Integer.valueOf(request.getParameter("idRequest"));
        } else if (request.getParameter("requestJSONString") != null) {
            isGeneratingQuote = true;
            requestJSONString = request.getParameter("requestJSONString").toString();
        } else {
            this.addInvalidField("idRequest", "Either idRequest or requestJSONString is required but neither was found");
            this.addInvalidField("requestJSONString", "Either idRequest or requestJSONString is required but neither was found");
        }

        amendState = "";
        if (request.getParameter("amendState") != null && !request.getParameter("amendState").equals("")) {
            amendState = request.getParameter("amendState");
        }

        if(request.getParameter("comingFromEmail") != null && !request.getParameter("comingFromEmail").equals("")){
            comingFromEmail = request.getParameter("comingFromEmail").equals("Y");
        }

        serverName = request.getServerName();
        secAdvisor = (SecurityAdvisor) session.getAttribute(SecurityAdvisor.SECURITY_ADVISOR_SESSION_KEY);
    }

    @SuppressWarnings("unchecked")
    @Override
    public Command execute() throws RollBackCommandException {
        try {

            Session sess = secAdvisor.getReadOnlyHibernateSession(this.getUsername());

            dictionaryHelper = DictionaryHelper.getInstance(sess);

            if (isGeneratingQuote) {
                try (JsonReader jsonReader = Json.createReader(new StringReader(this.requestJSONString))) {
                    RequestParser requestParser = new RequestParser(jsonReader, secAdvisor);

                    requestParser.parse(sess);

                    request = requestParser.getRequest();

                    if (request.getRequestCategory() == null && request.getCodeRequestCategory() != null) {
                        request.setRequestCategory ((RequestCategory) sess.get(RequestCategory.class, request.getCodeRequestCategory()));
                    }

                    if (request.getNumber() == null || request.getNumber().equals("")) {
                        request.setNumber("Predicted Prices for : ");
                    }

                    if (request.getIdLab() != null) {
                        request.setLab((Lab) sess.get(Lab.class, request.getIdLab()));
                    }

                    this.request.setBillingItems(this.parseBillingItems());

                    HashSet<Sample> samples = new HashSet(requestParser.getSampleMap().values());

                    for (Object keyObj : requestParser.getSampleMap().keySet()) {
                        String key = "0";

                        if (keyObj instanceof String) {
                            key = keyObj.toString();
                        }

                        Object sampleObj = requestParser.getSampleMap().get(key);

                        if (sampleObj instanceof Sample) {
                            Sample sample = (Sample) sampleObj;
                            sample.setIdSample((Integer.parseInt(key.substring(6)) + 1));
                            sample.setDescription(key.substring(6));
                        }
                    }

                    request.setSamples(samples);

                    HashMap<Integer, ArrayList<RequestParser.SequenceLaneInfo>> multiplexGroupMap = new HashMap<>();

                    for (Object sequenceLaneInfo : requestParser.getSequenceLaneInfos()) {
                        if (sequenceLaneInfo instanceof RequestParser.SequenceLaneInfo) {
                            RequestParser.SequenceLaneInfo temp = (RequestParser.SequenceLaneInfo) sequenceLaneInfo;

                            if (temp.getSample() != null && temp.getSample().getMultiplexGroupNumber() != null) {
                                if (!multiplexGroupMap.containsKey(temp.getSample().getMultiplexGroupNumber())) {
                                    multiplexGroupMap.put(temp.getSample().getMultiplexGroupNumber(), new ArrayList<>());
                                }

                                multiplexGroupMap.get(temp.getSample().getMultiplexGroupNumber()).add(temp);
                            }
                        }
                    }

                    HashSet<SequenceLane> spoofedSequenceLanes = new HashSet<>();

                    int fakeIdSequenceLanes = 1;
                    int maxIdSequenceLanes = 1;

                    ArrayList<Integer> sortedMultiplexGroupNumbers = new ArrayList<>(multiplexGroupMap.keySet());
                    sortedMultiplexGroupNumbers.sort(Integer::compareTo);

                    int previousIdSample = -1;
                    int number = 0;

                    for (Integer multiplexGroupNumber : sortedMultiplexGroupNumbers) {
                        multiplexGroupMap.get(multiplexGroupNumber).sort(RequestParser.SequenceLaneInfo::compareTo);

                        for (RequestParser.SequenceLaneInfo sequenceLaneInfo : multiplexGroupMap.get(multiplexGroupNumber)) {
                            if (sequenceLaneInfo.getSample() != null && sequenceLaneInfo.getSample().getIdSample() != null) {

                                if (sequenceLaneInfo.getSample().getIdSample() != previousIdSample) {
                                    number = 1;
                                    previousIdSample = sequenceLaneInfo.getSample().getIdSample();
                                }

                                SequenceLane lane = new SequenceLane();

                                sequenceLaneInfo.setIdSampleString(sequenceLaneInfo.getSample().getIdSampleString());

                                lane.setSample(sequenceLaneInfo.getSample());
                                lane.setIdSample(sequenceLaneInfo.getSample().getIdSample());
                                lane.getSample().setNumber("#####X" + sequenceLaneInfo.getSample().getIdSample());
                                lane.setCreateDate(new java.util.Date(System.currentTimeMillis()));

                                lane.setIdSequenceLane(fakeIdSequenceLanes + number - 1);
                                lane.setNumber("#####F" + sequenceLaneInfo.getSample().getIdSample() + "_" + number);

                                lane.setIdSeqRunType(sequenceLaneInfo.getIdSeqRunType());
                                lane.setIdNumberSequencingCycles(sequenceLaneInfo.getIdNumberSequencingCycles());

                                spoofedSequenceLanes.add(lane);

                                maxIdSequenceLanes = Math.max(maxIdSequenceLanes, fakeIdSequenceLanes + number);
                                number++;
                            }
                        }

                        fakeIdSequenceLanes = maxIdSequenceLanes;
                    }

                    request.setSequenceLanes(spoofedSequenceLanes);
                } catch (Exception e) {
                    this.addInvalidField( "requestJSONString", "Invalid request JSON");
                }
            } else {
                request = (Request) sess.get(Request.class, idRequest);
            }

            if (request == null) {
                this.addInvalidField("no request", "Request not found");
            }

            if (isValid()) {

                if (secAdvisor.canRead(request)) {

                    if (request.getIdAppUser() != null) {
                        appUser = (AppUser) sess.get(AppUser.class, request.getIdAppUser());
                    }

                    if (isGeneratingQuote) {
                        if (request.getIdBillingAccount() != null) {
                            billingAccount = (BillingAccount) sess.get(BillingAccount.class, request.getIdBillingAccount());
                        }
                    } else {
                        if (request.getAcceptingBalanceAccountId(sess) != null) {
                            billingAccount = (BillingAccount) sess.get(BillingAccount.class, request.getAcceptingBalanceAccountId(sess));
                        }
                    }


                    // Set up the ReportTray
                    String title = dictionaryHelper.getRequestCategory(request.getCodeRequestCategory()) + " Request " + request.getNumber();
                    String fileName = "";

                    if (isGeneratingQuote) {
                        fileName = "gnomex_price_quote_" + request.getLabName().toLowerCase();
                    } else {
                        fileName = "gnomex_request_report_" + request.getNumber().toLowerCase();
                    }

                    tray = new ReportTray();
                    tray.setReportDate(new java.util.Date(System.currentTimeMillis()));
                    tray.setReportTitle(title);
                    tray.setReportDescription(title);
                    tray.setFileName(fileName);
                    tray.setFormat(ReportFormats.PDF);

                    @SuppressWarnings("rawtypes")
                    java.util.List rows = new ArrayList();

                    // Build PDF elements
                    RequestPDFFormatter formatter = new RequestPDFFormatter(secAdvisor, request, appUser, billingAccount, dictionaryHelper, sess, amendState);
                    ArrayList<Element> content = formatter.makeContent();
                    for (Element e : content) {
                        rows.add(e);
                    }

                    tray.setRows(rows);

                    if(comingFromEmail) {
                        sendAcknowledgementEmail(sess);
                    }
                }
            }

            if (isValid()) {
                setResponsePage(this.SUCCESS_JSP);
            } else {
                setResponsePage(this.ERROR_JSP);
            }

        } catch (Exception e) {
            LOG.error("An exception has occurred in ShowRequestForm ", e);

            throw new RollBackCommandException(e.getMessage());
        } finally {
            try {
                secAdvisor.closeReadOnlyHibernateSession();
            } catch(Exception e){
                LOG.error("Error", e);
            }
        }

        return this;
    }


    private void sendAcknowledgementEmail(Session sess){

        CoreFacility cf = sess.load(CoreFacility.class, request.getIdCoreFacility());
        // get core facility email
        String toAddress = cf.getContactEmail();

        String fromAddress = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.GENERIC_NO_REPLY_EMAIL);

        // new property for additional people who should get this email
        String ccAddress = "";
        if(request.getSubmitterEmail() != null && !request.getSubmitterEmail().equals("")){
            ccAddress += request.getSubmitterEmail() + ",";
        }
        if(request.getLab().getContactEmail() != null && !request.getLab().getContactEmail().equals("")){
            ccAddress += request.getLab().getContactEmail();
        }

        String subject = "Request " + request.getNumber() + " has been acknowledged by the " + cf.getFacilityName() + " core.";

        StringBuffer emailBody = new StringBuffer();

        emailBody.append("The request to add services to existing experiment " + request.getNumber() + " has been acknowledged by the " + cf.getFacilityName() + " core.\n");

        emailBody.append("The request will enter the workflow shortly.\n");

        try {
            MailUtilHelper helper = new MailUtilHelper(toAddress, ccAddress, null, fromAddress, subject, emailBody.toString(), null, true, DictionaryHelper.getInstance(sess), serverName);
            MailUtil.validateAndSendEmail(helper);
        } catch(Exception e){
            LOG.error("Error in ShowRequestForm", e);

        }

    }
    /* (non-Javadoc)
     * @see hci.framework.control.Command#setRequestState(javax.servlet.http.HttpServletRequest)
     */
    @Override
    public HttpServletWrappedRequest setRequestState(HttpServletWrappedRequest request) {
        request.setAttribute("tray", this.tray);
        return request;
    }

    /**
     *  The callback method called after the loadCommand, and execute methods,
     *  this method allows you to manipulate the HttpServletResponse object prior
     *  to forwarding to the result JSP (add a cookie, etc.)
     *
     *@param  response  The HttpServletResponse for the command
     *@return          The processed response
     */
    @Override
    public HttpServletResponse setResponseState(HttpServletResponse response) {
        return response;
    }

    /* (non-Javadoc)
     * @see hci.framework.control.Command#setSessionState(javax.servlet.http.HttpSession)
     */
    @Override
    public HttpSession setSessionState(HttpSession session) {
        return session;
    }

    /* (non-Javadoc)
     * @see hci.report.utility.ReportCommand#loadContextPermissions()
     */
    @Override
    public void loadContextPermissions() {
    }

    public void loadContextPermissions(String userName) throws SQLException {
    }


    /* (non-Javadoc)
     * This code is specifically excluded from the RequestParser, because we should never be
     * importing billing items directly from the front end.  This is only used for creating
     * price estimates, which is the purview of this class.
     */
    private Set parseBillingItems() {

        HashSet<BillingItem> billingItems = new HashSet<>();

        try (JsonReader jsonReader2 = Json.createReader(new StringReader(this.requestJSONString))) {
            JsonObject requestObject = jsonReader2.readObject();

            if (requestObject.getJsonArray("billingItems") != null) {
                for (JsonValue val: requestObject.getJsonArray("billingItems")) {
                    JsonObject obj = val.asJsonObject();

                    BillingItem temp = new BillingItem();

                    if (obj.getString("description") != null && !obj.getString("description").equals("")) {
                        temp.setDescription(obj.getString("description"));
                    } else {
                        temp.setDescription("");
                    }

                    if (obj.getString("idPrice") != null && !obj.getString("idPrice").equals("")) {
                        temp.setIdPrice(Integer.parseInt(obj.getString("idPrice")));
                    }
                    if (obj.getString("qty") != null && !obj.getString("qty").equals("")) {
                        temp.setQty(Integer.parseInt(obj.getString("qty")));
                    }
                    if (obj.getString("idBillingAccount") != null && !obj.getString("idBillingAccount").equals("")) {
                        temp.setIdBillingAccount(Integer.parseInt(obj.getString("idBillingAccount")));
                    }
                    if (obj.getString("category") != null && !obj.getString("category").equals("")) {
                        temp.setCategory(obj.getString("category"));
                    }
                    if (obj.getString("idLab") != null && !obj.getString("idLab").equals("")) {
                        temp.setIdLab(Integer.parseInt(obj.getString("idLab")));
                    }
                    if (obj.getString("idPriceCategory") != null && !obj.getString("idPriceCategory").equals("")) {
                        temp.setIdPriceCategory(Integer.parseInt(obj.getString("idPriceCategory")));
                    }
                    if (obj.getString("idBillingPeriod") != null && !obj.getString("idBillingPeriod").equals("")) {
                        temp.setIdBillingPeriod(Integer.parseInt(obj.getString("idBillingPeriod")));
                    }
                    if (obj.getString("idMasterBillingItem") != null && !obj.getString("idMasterBillingItem").equals("")) {
                        temp.setIdMasterBillingItem(Integer.parseInt(obj.getString("idMasterBillingItem")));
                    }
                    if (obj.getString("percentagePrice") != null && !obj.getString("percentagePrice").equals("")) {
                        temp.setPercentagePrice(new BigDecimal(obj.getString("percentagePrice")));
                    }
                    if (obj.getString("unitPrice") != null && !obj.getString("unitPrice").equals("")) {
                        temp.setUnitPrice(new BigDecimal(obj.getString("unitPrice")));
                    }
                    if (obj.getString("totalPrice") != null && !obj.getString("totalPrice").equals("")) {
                        temp.setTotalPrice(new BigDecimal(obj.getString("totalPrice")));
                    }
                    if (obj.getString("invoicePrice") != null && !obj.getString("invoicePrice").equals("")) {
                        temp.setInvoicePrice(new BigDecimal(obj.getString("invoicePrice").replace("$", "").replace(",","")));
                    }
                    if (obj.getString("splitType") != null && !obj.getString("splitType").equals("")) {
                        temp.setSplitType(obj.getString("splitType"));
                    }

                    billingItems.add(temp);
                }
            }
        } catch (Exception e) {
            // Do nothing - continue without billing item.
        }

        return billingItems;
    }
}
