package hci.gnomex.controller;

import hci.framework.control.Command;import hci.gnomex.utility.HttpServletWrappedRequest;import hci.gnomex.utility.Util;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.RequestCategory;
import hci.gnomex.model.SampleType;
import hci.gnomex.utility.HibernateSession;import hci.gnomex.utility.HttpServletWrappedRequest;

import java.io.Serializable;
import java.io.StringReader;
import java.util.Iterator;
import java.util.List;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.hibernate.query.Query;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;
import org.apache.log4j.Logger;
public class SaveExperimentPlatformSortOrderList extends GNomExCommand implements Serializable {
  
  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(SaveExperimentPlatformSortOrderList.class);

  private JsonArray categoriesList;
  
  public void validate() {
    for(int i= 0; i < categoriesList.size(); i++) {
      JsonObject node = categoriesList.getJsonObject(i);
      if (node.get("codeRequestCategory") == null || node.getString("codeRequestCategory").toString().length() == 0) {
        this.addInvalidField("codeRequestCategory", "each entry in requestCategoriesJSONString must have codeRequestCategory");
        break;
      }
      String codeRequestCategory = node.getString("codeRequestCategory");
      if (node.get("sortOrder") == null || node.getString("sortOrder").toString().length() == 0) {
        this.addInvalidField("sortOrder", "entry in requestCategoriesJSONString for " + codeRequestCategory + " does not have sortOrder");
        break;
      }
      try {
        Integer sortOrder = Integer.parseInt(node.getString("sortOrder"));
      } catch(NumberFormatException ex) {
        this.addInvalidField("sortOrder", "Sort order for " + codeRequestCategory + " is not numberic.");
      }
    }
  }
  
  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    if (request.getParameter("requestCategoriesJSONString") != null && !request.getParameter("requestCategoriesJSONString").equals("")) {
      String requestCategoriesJSONString = request.getParameter("requestCategoriesJSONString");
      if(Util.isParameterNonEmpty(requestCategoriesJSONString)){
        try(JsonReader jsonReader = Json.createReader(new StringReader(requestCategoriesJSONString))) {
          categoriesList = jsonReader.readArray();
        } catch (Exception e ) {
          this.addInvalidField( "requestCategoriesJSONString", "Invalid requestCategoriesJSONString");
          this.errorDetails = Util.GNLOG(LOG,"Cannot parse requestCategoriesJSONString", e);
        }

      }

    } else {
      this.addInvalidField("requestCategoriesJSONString", "requestCategoriesJSONString is required");
    }

    validate();
    
    if (isValid()) {
      setResponsePage(this.SUCCESS_JSP);
    } else {
      setResponsePage(this.ERROR_JSP);
    }

  }

  public Command execute() throws RollBackCommandException {
    try {
      Session sess = HibernateSession.currentSession(this.getUsername());

      Boolean modified = false;
      for(int i = 0; i < categoriesList.size(); i++) {
        JsonObject node = categoriesList.getJsonObject(i);
        RequestCategory cat = sess.load(RequestCategory.class, node.getString("codeRequestCategory"));
        Integer sortOrder = Integer.parseInt(node.getString("sortOrder"));
        if (!sortOrder.equals(cat.getSortOrder())) {
          modified = true;
          cat.setSortOrder(sortOrder);
          sess.save(cat);
        }
      }
      
      if (modified) {
        sess.flush();
      }

      this.xmlResult = "<SUCCESS/>";

    }catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in SaveExperimentPlatformSortOrderList ", e);
      throw new RollBackCommandException(e.getMessage());
        
    }

    return this;
  }
}
