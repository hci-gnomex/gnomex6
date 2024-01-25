package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.security.UnknownPermissionException;
import hci.gnomex.model.BillingItemFilter;
import hci.gnomex.model.BillingPeriod;
import hci.gnomex.model.Lab;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.DictionaryHelper;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.naming.NamingException;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;


public class GetCoreCommentsForBillingPeriod extends GNomExCommand implements Serializable {

  private static Logger LOG = Logger.getLogger(GetCoreCommentsForBillingPeriod.class);

  private BillingItemFilter billingItemFilter;

  private Integer                  idBillingPeriod;
  private Integer                  idCoreFacility;

  private SecurityAdvisor          secAdvisor;



  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    billingItemFilter = new BillingItemFilter(this.getSecAdvisor());
    HashMap errors = this.loadDetailObject(request, billingItemFilter);
    this.addInvalidFields(errors);

  }

  public Command execute() throws RollBackCommandException {

    try {

      Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());


      DictionaryHelper dh = DictionaryHelper.getInstance(sess);
      BillingPeriod billingPeriod = dh.getBillingPeriod(idBillingPeriod);



      // Get all requests with non-blank core comments from the current billing period
      StringBuffer queryBuf = billingItemFilter.getCoreCommentsQuery();

      List rows = sess.createQuery(queryBuf.toString()).list();

      Document doc = new Document(new Element("RequestList"));
      for(Iterator i = rows.iterator(); i.hasNext();) {
        Object[] row = (Object[])i.next();

        String number                   = (String)row[0];
        String name                     = (String)row[1];
        String codeBillingStatus        = (String)row[2];
        String corePrepInstructions     = (String)row[3];
        String labLastName              = (String)row[4];
        String labFirstName             = (String)row[5];

        String labName = Lab.formatLabNameFirstLast(toString(labFirstName), toString(labLastName));

        Element node = new Element("Request");

        node.setAttribute("name", toString(name));
        node.setAttribute("number", toString(number));
        node.setAttribute("corePrepInstructions", toString(corePrepInstructions));
        node.setAttribute("billingPeriod", toString(billingPeriod));
        node.setAttribute("billingStatus", dh.getBillingStatus(codeBillingStatus));
        node.setAttribute("lab", labName);

        doc.getRootElement().addContent(node);

      }

      XMLOutputter out = new org.jdom.output.XMLOutputter();
      this.xmlResult = out.outputString(doc);

      setResponsePage(this.SUCCESS_JSP);

    }catch (UnknownPermissionException e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetCoreCommentsForBillingPeriod ", e);

      throw new RollBackCommandException(e.getMessage());

    }catch (NamingException e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetCoreCommentsForBillingPeriod ", e);

      throw new RollBackCommandException(e.getMessage());

    }catch (SQLException e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetCoreCommentsForBillingPeriod ", e);

      throw new RollBackCommandException(e.getMessage());

    } catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetCoreCommentsForBillingPeriod ", e);

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

  private String toString(Object theValue) {
    if (theValue != null) {
      return theValue.toString();
    }
    return "";
  }

}
