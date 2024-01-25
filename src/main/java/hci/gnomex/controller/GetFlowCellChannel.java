package hci.gnomex.controller;


import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.gnomex.model.FlowCellChannel;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Hibernate;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.servlet.http.HttpSession;
import java.io.Serializable;


public class GetFlowCellChannel extends GNomExCommand implements Serializable {

	private static Logger LOG = Logger.getLogger(GetFlowCellChannel.class);

	// Parameter:
	private Integer idFlowCellChannel;

	public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
		if (request.getParameter("id") != null) {
			idFlowCellChannel = Integer.valueOf(request.getParameter("id"));
		} else {
			this.addInvalidField("idFlowCellChannel", "idFlowCellChannel is required");
		}
		this.validate();
	}

	public Command execute() throws RollBackCommandException {
		try {

			if (this.getSecurityAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_WORKFLOW)) {

				Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());
				FlowCellChannel fcc = null;

				if (idFlowCellChannel == null || idFlowCellChannel.intValue() == 0) {
					fcc = new FlowCellChannel();
				} else {
					fcc = (FlowCellChannel)sess.get(FlowCellChannel.class, idFlowCellChannel);
				}

				Hibernate.initialize(fcc.getSequenceLanes());

				Document doc = new Document(new Element("FlowCellChannel"));

				Element fccNode = fcc.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();
				doc.getRootElement().addContent(fccNode);

				XMLOutputter out = new org.jdom.output.XMLOutputter();
				this.xmlResult = out.outputString(doc);

			} else {
				this.addInvalidField("Insufficient permissions", "Insufficient permission to manage workflow.");
				setResponsePage(this.ERROR_JSP);
				}

		}catch (Exception e){
			this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetFlowCellChannel ", e);

			throw new RollBackCommandException(e.getMessage());
		}

		return this;
	}

	public void validate() {
		if (isValid()) {
			setResponsePage(this.SUCCESS_JSP);
		} else {
			setResponsePage(this.ERROR_JSP);
		}
	}
}
