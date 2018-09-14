package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.gnomex.utility.*;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.Price;
import hci.gnomex.model.PriceCriteria;
import hci.gnomex.security.SecurityAdvisor;

import java.io.Serializable;
import java.io.StringReader;
import java.util.*;

import javax.json.Json;
import javax.json.JsonReader;
import javax.servlet.http.HttpSession;

import org.hibernate.Session;
import org.apache.log4j.Logger;

public class SavePrice extends GNomExCommand implements Serializable {

    // the static field for logging in Log4J
    private static Logger LOG = Logger.getLogger(SavePrice.class);

    private PriceCriteriaParser criteriaParser;

    private Price priceScreen;
    private boolean isNewPrice = false;

    public void validate() {
    }

    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
        priceScreen = new Price();
        HashMap errors = this.loadDetailObject(request, priceScreen);
        this.addInvalidFields(errors);
        if (priceScreen.getIdPrice() == null || priceScreen.getIdPrice() == 0) {
            isNewPrice = true;
        }

        String priceCriteriasJSONString = request.getParameter("priceCriteriasJSONString");
        if (Util.isParameterNonEmpty(priceCriteriasJSONString)) {
            try (JsonReader jsonReader = Json.createReader(new StringReader(priceCriteriasJSONString))) {
                this.criteriaParser = new PriceCriteriaParser(jsonReader.readArray());
            } catch (Exception e) {
                this.addInvalidField("priceCriteriasJSONString", "Invalid priceCriteriasJSONString");
                this.errorDetails = Util.GNLOG(LOG, "Cannot parse priceCriteriasJSONString", e);
            }
        }
    }

    public Command execute() throws RollBackCommandException {
        try {
            Session sess = HibernateSession.currentSession(this.getUsername());

            if (this.getSecurityAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_BILLING)) {
                criteriaParser.parse(sess);

                Price price;
                if (isNewPrice) {
                    price = priceScreen;
                    sess.save(price);
                } else {
                    price = sess.load(Price.class, priceScreen.getIdPrice());
                    initializePrice(price);
                }
                sess.flush();

                //
                // Save price criteria
                //
                Set<Integer> criteriaJustAdded = new HashSet<>();
                for (String idPriceCriteria : this.criteriaParser.getPriceCriteriaMap().keySet()) {
                    PriceCriteria criteria = criteriaParser.getPriceCriteriaMap().get(idPriceCriteria);
                    criteria.setIdPrice(price.getIdPrice());

                    // We don't want to save price criteria if filter1 and filter2 are null
                    if (criteria.getFilter1() == null) {
                        continue;
                    }

                    if (criteria.getIdPriceCriteria() == null) {
                        sess.save(criteria);
                        criteriaJustAdded.add(criteria.getIdPriceCriteria());
                    }
                }
                sess.flush();

                // Remove price criteria no longer in the criteria list
                List<PriceCriteria> criteriaToRemove = new ArrayList<>();
                if (price.getPriceCriterias() != null) {
                    for (Iterator i = price.getPriceCriterias().iterator(); i.hasNext();) {
                        PriceCriteria c = (PriceCriteria) i.next();
                        // If the existing criteria is not in the XML, then it might
                        // be a criteria that was removed.
                        if (!criteriaParser.getPriceCriteriaMap().containsKey(c.getIdPriceCriteria().toString())) {
                            // Don't remove the criteria that was just inserted.
                            if (!criteriaJustAdded.contains(c.getIdPriceCriteria())) {
                                criteriaToRemove.add(c);
                            }
                        }
                    }
                    for (PriceCriteria c : criteriaToRemove) {
                        sess.delete(c);
                    }
                }

                sess.flush();

                this.jsonResult = Json.createObjectBuilder()
                        .add("result", "SUCCESS")
                        .add("idPrice", price.getIdPrice().toString())
                        .build().toString();

                setResponsePage(this.SUCCESS_JSP);
            } else {
                this.addInvalidField("Insufficient permissions", "Insufficient permission to save price.");
                setResponsePage(this.ERROR_JSP);
            }

        } catch (Exception e) {
            this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in SavePrice ", e);
            throw new RollBackCommandException(e.getMessage());
        }

        return this;
    }

    private void initializePrice(Price price) {
        price.setName(priceScreen.getName());
        price.setDescription(priceScreen.getDescription());
        price.setUnitPrice(priceScreen.getUnitPrice());
        price.setUnitPriceExternalAcademic(priceScreen.getUnitPriceExternalAcademic());
        price.setUnitPriceExternalCommercial(priceScreen.getUnitPriceExternalCommercial());
        price.setIdPriceCategory(priceScreen.getIdPriceCategory());
        price.setIsActive(priceScreen.getIsActive());
    }

}
