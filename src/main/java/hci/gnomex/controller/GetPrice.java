package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.framework.security.UnknownPermissionException;
import hci.framework.utilities.XMLReflectException;
import hci.gnomex.model.Price;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Hibernate;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.naming.NamingException;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.sql.SQLException;

public class GetPrice extends GNomExCommand implements Serializable {

  private static Logger LOG = Logger.getLogger(GetPrice.class);

  private Integer idPrice;


  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    if (request.getParameter("idPrice") != null) {
      idPrice = Integer.valueOf(request.getParameter("idPrice"));
    } else {
      this.addInvalidField("idPrice", "idPrice is required");
    }
  }

  public Command execute() throws RollBackCommandException {

    try {

      Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());

      if (!this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_BILLING)) {
        this.addInvalidField("permissionerror", "Insufficient permissions to access this price.");
      }

      if (isValid())  {
        Price price = null;
        if (idPrice.intValue() == 0) {
          price = new Price();
          price.setIdPrice(0);
          price.setIsActive("Y");
        } else {
          price = (Price)sess.get(Price.class, idPrice);
          Hibernate.initialize(price.getPriceCriterias());
        }


        Document doc = new Document(new Element("PriceList"));
        Element priceNode = price.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();
        doc.getRootElement().addContent(priceNode);


        XMLOutputter out = new org.jdom.output.XMLOutputter();
        this.xmlResult = out.outputString(doc);
      }

      if (isValid()) {
        setResponsePage(this.SUCCESS_JSP);
      } else {
        setResponsePage(this.ERROR_JSP);
      }

    }catch (UnknownPermissionException e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetPrice ", e);

      throw new RollBackCommandException(e.getMessage());

    }catch (NamingException e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetPrice ", e);

      throw new RollBackCommandException(e.getMessage());
    }catch (SQLException e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetPrice ", e);

      throw new RollBackCommandException(e.getMessage());
    } catch (XMLReflectException e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetPrice ", e);

      throw new RollBackCommandException(e.getMessage());
    } catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetPrice ", e);

      throw new RollBackCommandException(e.getMessage());
    }

    return this;
  }

}
