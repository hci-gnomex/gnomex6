package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.BillingAccount;
import hci.gnomex.model.BillingStatus;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.query.Query;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.naming.NamingException;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
public class GetBillingAccountListForPeriodAndCore extends GNomExCommand implements Serializable {

  private static Logger LOG = Logger.getLogger(GetBillingAccountListForPeriodAndCore.class);

  private Integer idBillingPeriod;
  private Integer idCoreFacility;
  private Integer idLab;
  private List<String> accountStatusArray;


  @Override
  public void validate() {
  }

  @Override
  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
    if (request.getParameter("idBillingPeriod") != null && request.getParameter("idBillingPeriod").length() > 0) {
      idBillingPeriod = Integer.valueOf(request.getParameter("idBillingPeriod"));
    } else {
      this.addInvalidField("idBillingPeriod", "idBillingPeriod is required");
    }
    if (request.getParameter("idCoreFacility") != null && request.getParameter("idBillingPeriod").length() > 0) {
      idCoreFacility = Integer.valueOf(request.getParameter("idCoreFacility"));
    } else {
      this.addInvalidField("idCoreFacility", "idCoreFacility is required");
    }
    if (request.getParameter("idLab") != null && request.getParameter("idLab").length() > 0) {
      idLab = Integer.valueOf(request.getParameter("idLab"));
    }

    if (request.getParameter("accountStatusJSONString") != null && request.getParameter("accountStatusJSONString").length() > 0) {
      accountStatusArray =  new ArrayList<String>(Arrays.asList(request.getParameter("accountStatusJSONString").split(",")));
    } else {
      this.addInvalidField("analysisGroupsJSONString", "analysisGroupsJSONString is required");
    }


  }

  @Override
  @SuppressWarnings("unchecked")
  public Command execute() throws RollBackCommandException {

    try {
      Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());

      ArrayList<String> statuses = new ArrayList<String>();
      if(accountStatusArray != null &&  accountStatusArray.size() > 0 ){
        for(String accountStatus : accountStatusArray ){
            statuses.add(accountStatus);
        }
      }else {
        statuses.add(BillingStatus.COMPLETED);
        statuses.add(BillingStatus.APPROVED);
        statuses.add(BillingStatus.APPROVED_CC);
        statuses.add(BillingStatus.APPROVED_PO);
      }


      StringBuilder queryStrBuilder = new StringBuilder("select distinct ba from BillingItem bi join bi.billingAccount ba where bi.idCoreFacility=:idCoreFacility and bi.idBillingPeriod=:idBillingPeriod ");
      if(idLab != null){
        queryStrBuilder.append("and bi.idLab=:idLab ");
      }
      queryStrBuilder.append("and bi.codeBillingStatus in (:statuses) ");


      String queryString = queryStrBuilder.toString();
      Query query = sess.createQuery(queryString);
      query.setParameter("idCoreFacility", idCoreFacility);
      query.setParameter("idBillingPeriod", idBillingPeriod);
      if(idLab != null){
        query.setParameter("idLab", idLab);
      }
      query.setParameterList("statuses", statuses);
      List<BillingAccount> accts = (List<BillingAccount>)query.list();

      Document doc = new Document(new Element("BillingAccountList"));
      for(BillingAccount acct : accts) {
        Element baNode = acct.toXMLDocument(null, GNomExCommand.DATE_OUTPUT_SQL).getRootElement();
        doc.getRootElement().addContent(baNode);
      }

      XMLOutputter out = new org.jdom.output.XMLOutputter();
      this.xmlResult = out.outputString(doc);

      setResponsePage(this.SUCCESS_JSP);
    }catch (NamingException e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetBillingAccountListForPeriodAndCore ", e);

      throw new RollBackCommandException(e.getMessage());
    }catch (SQLException e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetBillingAccountListForPeriodAndCore ", e);

      throw new RollBackCommandException(e.getMessage());
    } catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetBillingAccountListForPeriodAndCore ", e);

      throw new RollBackCommandException(e.getMessage());
    }

    return this;
  }
}
