package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.framework.security.UnknownPermissionException;
import hci.framework.utilities.XMLReflectException;
import hci.gnomex.model.PriceSheet;
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

public class GetPriceSheet extends GNomExCommand implements Serializable {

  private static Logger LOG = Logger.getLogger(GetPriceSheet.class);

  private Integer idPriceSheet;


  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    if (request.getParameter("idPriceSheet") != null) {
      idPriceSheet = Integer.valueOf(request.getParameter("idPriceSheet"));
    } else {
      this.addInvalidField("idPriceSheet", "idPriceSheet is required");
    }
  }

  public Command execute() throws RollBackCommandException {

    try {

      Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());

      if (!this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_BILLING)) {
        this.addInvalidField("permissionerror", "Insufficient permissions to access this priceSheet sheet.");
      }

      if (isValid())  {
        PriceSheet priceSheet = null;
        if (idPriceSheet.intValue() == 0) {
          priceSheet = new PriceSheet();
          priceSheet.setIdPriceSheet(0);
          priceSheet.setIsActive("Y");
        } else {
          priceSheet = (PriceSheet)sess.get(PriceSheet.class, idPriceSheet);
          Hibernate.initialize(priceSheet.getRequestCategories());
        }


        Document doc = new Document(new Element("PriceSheetList"));
        Element priceSheetNode = priceSheet.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();
        doc.getRootElement().addContent(priceSheetNode);


        XMLOutputter out = new org.jdom.output.XMLOutputter();
        this.xmlResult = out.outputString(doc);
      }

      if (isValid()) {
        setResponsePage(this.SUCCESS_JSP);
      } else {
        setResponsePage(this.ERROR_JSP);
      }

    }catch (UnknownPermissionException e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetPriceSheet ", e);

      throw new RollBackCommandException(e.getMessage());

    }catch (NamingException e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetPriceSheet ", e);

      throw new RollBackCommandException(e.getMessage());
    }catch (SQLException e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetPriceSheet ", e);

      throw new RollBackCommandException(e.getMessage());
    } catch (XMLReflectException e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetPriceSheet ", e);

      throw new RollBackCommandException(e.getMessage());
    } catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetPriceSheet ", e);

      throw new RollBackCommandException(e.getMessage());
    }

    return this;
  }

}
