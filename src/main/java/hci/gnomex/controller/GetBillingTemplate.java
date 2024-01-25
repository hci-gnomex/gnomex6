package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.BillingTemplate;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.servlet.http.HttpSession;
import java.io.Serializable;

@SuppressWarnings("serial")
public class GetBillingTemplate extends GNomExCommand implements Serializable {

	private static Logger LOG = Logger.getLogger(GetBillingTemplate.class);

	private static final String 			ERROR_MESSAGE = "An error occurred while retrieving the billing template";

	private Integer 	targetClassIdentifier;
	private String 		targetClassName;

//	private BillingTemplateQueryManager 	queryManager;

	@Override
	public void loadCommand(HttpServletWrappedRequest request, HttpSession sess) {
		if (request.getParameter("targetClassIdentifier") != null && !request.getParameter("targetClassIdentifier").equals("")) {
			try {
				targetClassIdentifier = Integer.parseInt(request.getParameter("targetClassIdentifier"));
			} catch (NumberFormatException e) {
				this.addInvalidField("Target Class Identifier", "Target Class Identifier is malformed.");
			}
		} else {
			this.addInvalidField("Target Class Identifier", "Target Class Identifier is required.");
		}

		if (request.getParameter("targetClassName") != null && !request.getParameter("targetClassName").equals("")) {
			targetClassName = request.getParameter("targetClassName");
		} else {
			this.addInvalidField("Target Class Name", "Target Class Name is required.");
		}

		/*queryManager = new BillingTemplateQueryManager(this.getSecAdvisor());
		HashMap<String, String> errors = queryManager.load(request);
		this.addInvalidFields(errors);
		if (!queryManager.hasSufficientCriteria()) {
			this.addInvalidField("Insufficient Criteria", "Insufficient criteria provided.");
		}*/
	}

	@Override
	public Command execute() throws RollBackCommandException {
		try {

			if (this.isValid()) {
				Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());

				//BillingTemplate billingTemplate = queryManager.retrieveBillingTemplate(sess);
				BillingTemplate billingTemplate = BillingTemplateQueryManager.retrieveBillingTemplate(sess, targetClassIdentifier, QueryManager.convertToFullTargetClassName(targetClassName));

				Element billingTemplateNode = billingTemplate.toXML(sess, null, this.getUserPreferences());

				XMLOutputter out = new org.jdom.output.XMLOutputter();
				this.xmlResult = out.outputString(new Document(billingTemplateNode));
			}

			if (isValid()) {
				setResponsePage(this.SUCCESS_JSP);
			} else {
				setResponsePage(this.ERROR_JSP);
			}

		} catch (Exception e) {
			this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetBillingTemplate ", e);

			throw new GNomExRollbackException(e.getMessage() != null ? e.getMessage() : ERROR_MESSAGE, false, ERROR_MESSAGE);
		}

		return this;
	}

	@Override
	public void validate() {
	}

}
