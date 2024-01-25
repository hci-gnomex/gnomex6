package hci.gnomex.controller;


import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.framework.security.UnknownPermissionException;
import hci.framework.utilities.XMLReflectException;
import hci.gnomex.model.Price;
import hci.gnomex.model.PriceCategory;
import hci.gnomex.model.Property;
import hci.gnomex.model.PropertyOption;
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
import java.util.Iterator;

public class GetProperty extends GNomExCommand implements Serializable {

  private static Logger LOG = Logger.getLogger(GetProperty.class);

  // Parameter:
  private Integer idProperty;

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
    if (request.getParameter("idProperty") != null) {
      idProperty = Integer.valueOf(request.getParameter("idProperty"));
    } else {
      this.addInvalidField("idProperty", "idProperty is required");
    }
    this.validate();
  }

  public Command execute() throws RollBackCommandException {
    try {

      Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());
      Property property = null;

      property = (Property)sess.get(Property.class, idProperty);

      Document doc = new Document(new Element("PropertyList"));

      property.excludeMethodFromXML("getOptions");

      Element node = property.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();

      // Add prices
      if ( property.getIdPriceCategory() != null ) {
        node.setAttribute( "includePricing", "Y" );
        PriceCategory pc = ( PriceCategory ) sess.load( PriceCategory.class, property.getIdPriceCategory() );
        node.setAttribute( "qtyType", getQtyType( pc ) );
        node.setAttribute( "codeBillingChargeKind", pc.getCodeBillingChargeKind() );

        Price price = Property.getPriceForCheckProperty( property, pc );
        if ( price != null ) {
          node.setAttribute( "unitPriceInternal", price.getUnitPrice().toString());
          node.setAttribute( "unitPriceExternalAcademic", price.getUnitPriceExternalAcademic().toString());
          node.setAttribute( "unitPriceExternalCommercial", price.getUnitPriceExternalCommercial().toString());
        }
      }

      // Add options
      Element optionsNode = new Element("options");

      if (property.getOptions() != null) {
        for(Iterator i = property.getOptions().iterator(); i.hasNext();) {
          PropertyOption po = (PropertyOption) i.next();
          Element optionNode = po.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();

          if ( property.getIdPriceCategory() != null ) {
            PriceCategory pc = ( PriceCategory ) sess.load( PriceCategory.class, property.getIdPriceCategory() );
            Price price = PropertyOption.getPriceForPropertyOption( po, pc );
            if ( price != null ) {
              optionNode.setAttribute( "unitPriceInternal", price.getUnitPrice().toString());
              optionNode.setAttribute( "unitPriceExternalAcademic", price.getUnitPriceExternalAcademic().toString());
              optionNode.setAttribute( "unitPriceExternalCommercial", price.getUnitPriceExternalCommercial().toString());
            }
          }

          optionsNode.addContent( optionNode );
        }
      }

      node.addContent( optionsNode );

      doc.getRootElement().addContent(node);

      XMLOutputter out = new org.jdom.output.XMLOutputter();
      this.xmlResult = out.outputString(doc);



    }catch (UnknownPermissionException e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetProperty ", e);

      throw new RollBackCommandException(e.getMessage());
    }catch (NamingException e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetProperty ", e);

      throw new RollBackCommandException(e.getMessage());
    }catch (SQLException e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetProperty ", e);

      throw new RollBackCommandException(e.getMessage());
    } catch (XMLReflectException e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetProperty ", e);

      throw new RollBackCommandException(e.getMessage());
    } catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetProperty ", e);

      throw new RollBackCommandException(e.getMessage());
    }
    return this;
  }

  private String getQtyType(PriceCategory pc) {

    if ( pc!=null && pc.getPluginClassName() != null && pc.getPluginClassName().equals( "hci.gnomex.billing.PropertyPricingNotBySamplePlugin" )) {
      return "NOTBYSAMPLE";
    }
    return "SAMPLE";
  }

  public void validate() {
    if (isValid()) {
      setResponsePage(this.SUCCESS_JSP);
    } else {
      setResponsePage(this.ERROR_JSP);
    }
  }
}
