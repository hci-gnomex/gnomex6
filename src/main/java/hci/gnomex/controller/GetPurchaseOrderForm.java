package hci.gnomex.controller;

import hci.gnomex.model.BillingAccount;
import hci.gnomex.utility.HibernateSession;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayInputStream;
import java.io.IOException;

public class GetPurchaseOrderForm extends HttpServlet {
private static Logger LOG = Logger.getLogger(GetPurchaseOrderForm.class);
private Integer idBillingAccount;

protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
	doPost(req, res);
}

protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
	try {
		Session sess = HibernateSession.currentSession(req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest");

		byte[] output = new byte[8000];
		String fileType = "";

		if (req.getParameter("idBillingAccount") != null) {
			idBillingAccount = Integer.parseInt(req.getParameter("idBillingAccount"));
		}

		res.setHeader("Content-Disposition", "inline; filename=BillingAccount" + idBillingAccount);

		BillingAccount ba = (BillingAccount) sess.load(BillingAccount.class, idBillingAccount);

		ByteArrayInputStream in = new ByteArrayInputStream(ba.getPurchaseOrderForm());
		ServletOutputStream out = res.getOutputStream();
		fileType = ba.getOrderFormFileType();

		if (fileType.equals(".pdf")) {
			res.setHeader("Content-Type", "application/pdf; charset=UTF-8");
			res.setHeader("Content-Disposition", "inline; filename=BillingAccount" + idBillingAccount + fileType);
		} else if (fileType.equals(".doc")) {
			res.setHeader("Content-Type", "application/msword; charset=UTF-8");
			res.setHeader("Content-Disposition", "inline; filename=BillingAccount" + idBillingAccount + fileType);
		} else if (fileType.equals(".docx")) {
			res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document; charset=UTF-8");
			res.setHeader("Content-Disposition", "inline; filename=BillingAccount" + idBillingAccount + fileType);
		} else if (fileType.equals(".txt")) {
			res.setHeader("Content-Type", "text/plain; charset=UTF-8");
		} else if (fileType.equals(".html")) {
			res.setHeader("Content-Type", "text/html; charset=UTF-8");
		} else if (fileType.equals(".zip")) {
			res.setHeader("Content-Type", "application/zip; charset=UTF-8");
			res.setHeader("Content-Disposition", "inline; filename=BillingAccount" + idBillingAccount + fileType);
		} else if (fileType.equals(".xls")) {
			res.setHeader("Content-Type", "application/msexcel; charset=UTF-8");
			res.setHeader("Content-Disposition", "inline; filename=BillingAccount" + idBillingAccount + fileType);
		}

		long totalRead = 0;
		while (totalRead != ba.getOrderFormFileSize()) {
			int amountRead = in.read(output, 0, 1024);
			if (amountRead != -1) {
				out.write(output, 0, amountRead);
			}
			totalRead += amountRead;
		}

		res.setContentLength((int) output.length);
		out.flush();
		out.close();

		return;
	} catch (Exception e) {
		LOG.error("Error in get purchase order form", e);
		HibernateSession.rollback();

	} finally {
		try {
			HibernateSession.closeSession();
		} catch (Exception e) {
			LOG.error("Error in get purchase order form", e);
		}
	}
}
}
