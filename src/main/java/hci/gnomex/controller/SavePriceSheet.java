package hci.gnomex.controller;

import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.CoreFacility;
import hci.gnomex.model.PriceSheet;
import hci.gnomex.model.RequestCategory;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.json.Json;
import javax.json.JsonReader;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.io.StringReader;
import java.util.*;

public class SavePriceSheet extends GNomExCommand implements Serializable {

    // the static field for logging in Log4J
    private static Logger LOG = Logger.getLogger(SavePriceSheet.class);

    private PriceSheetCategoryParser requestCategoryParser;

    private PriceSheet priceSheetScreen;
    private boolean isNewPriceSheet = false;

    public void validate() {
    }

    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

        priceSheetScreen = new PriceSheet();
        HashMap errors = this.loadDetailObject(request, priceSheetScreen);
        this.addInvalidFields(errors);
        if (priceSheetScreen.getIdPriceSheet() == null || priceSheetScreen.getIdPriceSheet() == 0) {
            isNewPriceSheet = true;
        }

        String requestCategoriesJSONString = request.getParameter("requestCategoriesJSONString");
        if (Util.isParameterNonEmpty(requestCategoriesJSONString)) {
            try (JsonReader jsonReader = Json.createReader(new StringReader(requestCategoriesJSONString))) {
                requestCategoryParser = new PriceSheetCategoryParser(jsonReader.readArray());
            } catch (Exception e) {
                this.addInvalidField("requestCategoriesJSONString", "Invalid requestCategoriesJSONString");
                this.errorDetails = Util.GNLOG(LOG, "Cannot parse requestCategoriesJSONString", e);
            }
        }

    }

    public Command execute() throws RollBackCommandException {

        try {
            Session sess = HibernateSession.currentSession(this.getUsername());
            DictionaryHelper dh = DictionaryHelper.getInstance(sess);

            if (this.getSecurityAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_BILLING)) {
                requestCategoryParser.parse();

                PriceSheet priceSheet;

                if (isNewPriceSheet) {
                    priceSheet = priceSheetScreen;
                    sess.save(priceSheet);
                } else {
                    priceSheet = sess.load(PriceSheet.class, priceSheetScreen.getIdPriceSheet());

                    initializePriceSheet(priceSheet);
                }

                //
                // Save priceSheet requestCategory
                //
                TreeSet requestCategories = new TreeSet();
                for (String codeRequestCategory : requestCategoryParser.getCodeRequestCategories()) {
                    RequestCategory requestCategory = dh.getRequestCategoryObject(codeRequestCategory);
                    requestCategories.add(requestCategory);
                    Map<String, String> priceRequestCategories = getAllRequestCategories(priceSheet.getIdPriceSheet(), sess, requestCategory.getIdCoreFacility());
                    if (priceRequestCategories.containsKey(requestCategory.getCodeRequestCategory())) {
                        CoreFacility facility = sess.get(CoreFacility.class, requestCategory.getIdCoreFacility());
                        this.addInvalidField("Invalid Request Category", "Request category " + requestCategory.getRequestCategory() + " already set on price sheet " + priceRequestCategories.get(requestCategory.getCodeRequestCategory()) + " in " + facility.getFacilityName());
                        setResponsePage(this.ERROR_JSP);
                        return this;
                    }
                }

                priceSheet.setRequestCategories(requestCategories);

                sess.flush();

                this.jsonResult = Json.createObjectBuilder()
                        .add("result", "SUCCESS")
                        .add("idPriceSheet", priceSheet.getIdPriceSheet().toString())
                        .build().toString();

                setResponsePage(this.SUCCESS_JSP);
            } else {
                this.addInvalidField("Insufficient permissions", "Insufficient permission to save price sheet.");
                setResponsePage(this.ERROR_JSP);
            }

        } catch (Exception e) {
            this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in SavePriceSheet ", e);
            throw new RollBackCommandException(e.getMessage());

        }

        return this;
    }

    /**
     * @param sess Current hibernate session
     * @return priceRequestCategories All of the request categories for this core facility except
     *                                  those on the given price sheet
     */
    private Map<String, String> getAllRequestCategories(Integer idPriceSheet, Session sess, Integer idCoreFacility) {
        Map<String, String> priceRequestCategories = new HashMap<>();

        StringBuffer buf = new StringBuffer();

        buf.append("SELECT distinct p from PriceSheet p ");
        buf.append("JOIN p.requestCategories rc ");
        buf.append("WHERE ");
        if (idCoreFacility > 0) {
            buf.append("(rc.idCoreFacility = ").append(idCoreFacility).append(")");
        } else {
            this.getSecAdvisor().appendCoreFacilityCriteria(buf, "rc");
        }
        buf.append(" AND p.idPriceSheet != ").append(idPriceSheet);
        buf.append(" ");
        buf.append("order by p.name");
        List priceSheets = sess.createQuery(buf.toString()).list();
        for (Object obj : priceSheets) {
            PriceSheet sheet = (PriceSheet) obj;
            Set requestCategories = sheet.getRequestCategories();
            for (Object reqObject : requestCategories) {
                RequestCategory requestCategory = (RequestCategory) reqObject;
                String stringRequestCategory = requestCategory.getCodeRequestCategory();
                priceRequestCategories.put(stringRequestCategory, sheet.getName());
            }
        }
        return priceRequestCategories;
    }

    private void initializePriceSheet(PriceSheet priceSheet) {
        priceSheet.setName(priceSheetScreen.getName());
        priceSheet.setDescription(priceSheetScreen.getDescription());
        priceSheet.setIsActive(priceSheetScreen.getIsActive());
    }

}
