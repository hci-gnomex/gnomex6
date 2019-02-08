package hci.gnomex.utility;

import java.math.BigDecimal;
import java.util.TreeSet;

import org.hibernate.Session;
import org.jdom.Element;

import hci.gnomex.model.BillingTemplate;
import hci.gnomex.model.BillingTemplateItem;

import javax.json.JsonArray;
import javax.json.JsonObject;

public class BillingTemplateParser {

    private BillingTemplate billingTemplate;
    private JsonObject billingTemplateJSON = null;
    private Element billingTemplateNode;

    public BillingTemplateParser(JsonObject template) {
        this.billingTemplateJSON = template;
    }

    public BillingTemplateParser(Element node) {
        this.billingTemplateNode = node;
    }

    public BillingTemplate getBillingTemplate() {
        return billingTemplate;
    }

    public void parse(Session sess) throws Exception {
        // Get billing template or create new one
        Integer idBillingTemplate;
        if (this.billingTemplateJSON != null) {
            idBillingTemplate = Integer.parseInt(this.billingTemplateJSON.getString("idBillingTemplate"));
        } else {
            idBillingTemplate = Integer.parseInt(billingTemplateNode.getAttributeValue("idBillingTemplate"));
        }

        if (idBillingTemplate == null || idBillingTemplate == 0) {
            billingTemplate = new BillingTemplate();
        } else {
            billingTemplate = sess.load(BillingTemplate.class, idBillingTemplate);

            // Populate fields
            String fullTargetClassName;
            String targetClassIdentifier;
            if (this.billingTemplateJSON != null) {
                fullTargetClassName = QueryManager.convertToFullTargetClassName(billingTemplateJSON.getString("targetClassName"));
                targetClassIdentifier = billingTemplateJSON.getString("targetClassIdentifier");
            } else {
                fullTargetClassName = QueryManager.convertToFullTargetClassName(billingTemplateNode.getAttributeValue("targetClassName"));
                targetClassIdentifier = billingTemplateNode.getAttributeValue("targetClassIdentifier");
            }

            if (!QueryManager.isValidTargetClass(targetClassIdentifier, fullTargetClassName, sess)) {
                throw new ParserException("The specified target class identifier and class name are not valid");
            }
            billingTemplate.setTargetClassIdentifier(Integer.parseInt(targetClassIdentifier));
            billingTemplate.setTargetClassName(fullTargetClassName);
        }
    }

    public TreeSet<BillingTemplateItem> getBillingTemplateItems() throws Exception {
        TreeSet<BillingTemplateItem> billingTemplateItems = new TreeSet<>();

        boolean hasItemAcceptingBalance = false;
        String usingPercentSplitString;
        if (this.billingTemplateJSON != null) {
            usingPercentSplitString = this.billingTemplateJSON.getString("usingPercentSplit");
        } else {
            usingPercentSplitString = billingTemplateNode.getAttributeValue("usingPercentSplit");
        }
        boolean usingPercentSplit = Util.isParameterTrue(usingPercentSplitString);
        BigDecimal percentTotal = BigDecimal.valueOf(0);

        if (this.billingTemplateJSON != null) {
            JsonArray itemArray = this.billingTemplateJSON.getJsonArray("items");
            for (int i = 0; i < itemArray.size(); i++) {
                JsonObject node = itemArray.getJsonObject(i);
                BillingTemplateItem item = parseBillingTemplateItem(
                        hasItemAcceptingBalance, usingPercentSplit, node.getString("idBillingAccount"),
                        node.getString("acceptBalance"), "" + node.getInt("percentSplit"),
                        node.getString("dollarAmount").replace("$", "").replace(",", "")
                );
                if (item.isAcceptingBalance()) {
                    hasItemAcceptingBalance = true;
                }
                if (usingPercentSplit) {
                    percentTotal = percentTotal.add(item.getPercentSplit());
                    if (percentTotal.compareTo(BigDecimal.valueOf(100)) >= 0) {
                        throw new ParserException("Total percentage of all billing accounts cannot exceed 100%");
                    }
                }
                billingTemplateItems.add(item);
            }
        } else {
            for (Object child : billingTemplateNode.getChildren("BillingTemplateItem")) {
                Element node = (Element) child;
                BillingTemplateItem item = parseBillingTemplateItem(
                        hasItemAcceptingBalance, usingPercentSplit, node.getAttributeValue("idBillingAccount"),
                        node.getAttributeValue("acceptBalance"), node.getAttributeValue("percentSplit").replace("%", ""),
                        node.getAttributeValue("dollarAmount").replace("$", "").replace(",", "")
                );
                if (item.isAcceptingBalance()) {
                    hasItemAcceptingBalance = true;
                }
                if (usingPercentSplit) {
                    percentTotal = percentTotal.add(item.getPercentSplit());
                    if (percentTotal.compareTo(BigDecimal.valueOf(100)) >= 0) {
                        throw new ParserException("Total percentage of all billing accounts cannot exceed 100%");
                    }
                }
                billingTemplateItems.add(item);
            }
        }

        if (!hasItemAcceptingBalance) {
            throw new ParserException("The billing template must have an account accepting the remaining balance.");
        }

        return billingTemplateItems;
    }

    private static BillingTemplateItem parseBillingTemplateItem(
            boolean hasItemAcceptingBalance, boolean usingPercentSplit, String idBillingAccount,
            String acceptBalance, String percentSplitString, String dollarAmountString
    ) throws ParserException {
        BillingTemplateItem parsedBillingTemplateItem = new BillingTemplateItem();
        parsedBillingTemplateItem.setIdBillingAccount(Integer.parseInt(idBillingAccount));

        boolean acceptingBalance = Util.isParameterTrue(acceptBalance);

        if (acceptingBalance) {
            if (hasItemAcceptingBalance) {
                throw new ParserException("Only one account on a billing template may accept remaining balance");
            }

            if (usingPercentSplit) {
                parsedBillingTemplateItem.setPercentSplit(BillingTemplateItem.WILL_TAKE_REMAINING_BALANCE);
            } else {
                parsedBillingTemplateItem.setDollarAmount(BillingTemplateItem.WILL_TAKE_REMAINING_BALANCE);
                parsedBillingTemplateItem.setDollarAmountBalance(BillingTemplateItem.WILL_TAKE_REMAINING_BALANCE);
            }
        } else {
            if (usingPercentSplit) {
                BigDecimal percentSplit = new BigDecimal(percentSplitString).setScale(2);
                if (percentSplit.compareTo(BigDecimal.valueOf(0)) <= 0) {
                    throw new ParserException("All billing accounts must accept a percentage greater than 0%");
                }
                parsedBillingTemplateItem.setPercentSplit(percentSplit.divide(new BigDecimal(100), BigDecimal.ROUND_UNNECESSARY));
            } else {
                BigDecimal dollarAmount = new BigDecimal(dollarAmountString);
                if (dollarAmount.compareTo(BigDecimal.valueOf(0)) <= 0) {
                    throw new ParserException("All billing accounts must accept a dollar amount greater than $0");
                }
                parsedBillingTemplateItem.setDollarAmount(dollarAmount);
                parsedBillingTemplateItem.setDollarAmountBalance(dollarAmount);
            }
        }
        return parsedBillingTemplateItem;
    }

}
