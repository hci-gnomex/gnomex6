package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.ProductLedger;
import hci.gnomex.utility.GNomExRollbackException;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.io.StringReader;

@SuppressWarnings("serial")
public class SaveProductLedgerEntryList extends GNomExCommand implements Serializable {

    private static Logger LOG = Logger.getLogger(SaveProductLedgerEntryList.class);
    private JsonArray productLedgerEntryList;

    @Override
    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
        String productLedgerEntryListJSONString = request.getParameter("productLedgerEntryListJSONString");
        if (Util.isParameterNonEmpty(productLedgerEntryListJSONString)) {
            try (JsonReader jsonReader = Json.createReader(new StringReader(productLedgerEntryListJSONString))) {
                this.productLedgerEntryList = jsonReader.readArray();
            } catch (Exception e) {
                this.addInvalidField("productLedgerEntryListJSONString", "Invalid productLedgerEntryListJSONString");
                this.errorDetails = Util.GNLOG(LOG, "Cannot parse productLedgerEntryListJSONString", e);
            }
        }
    }

    @SuppressWarnings("unchecked")
    @Override
    public Command execute() throws RollBackCommandException {

        try {
            if (this.isValid()) {
                Session sess = this.getSecAdvisor().getHibernateSession(this.username);

                for (int i = 0; i < this.productLedgerEntryList.size(); i++) {
                    JsonObject entry = this.productLedgerEntryList.getJsonObject(i);
                    ProductLedger productLedger = sess.load(ProductLedger.class, Integer.parseInt(entry.getString("idProductLedger")));
                    productLedger.setNotes(entry.getString("notes"));
                    sess.save(productLedger);
                }

                this.setResponsePage(this.SUCCESS_JSP);
            } else {
                this.setResponsePage(this.ERROR_JSP);
            }
        } catch (Exception e) {
            this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in SaveProductLedgerEntryList ", e);
            throw new GNomExRollbackException(e.getMessage(), true, "An error occurred saving the product ledger entry list");
        }

        return this;
    }

    @Override
    public void validate() {
    }

}
