package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.ProductOrderFileDescriptorParser;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.jdom.Document;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;

import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.io.StringReader;
import java.sql.SQLException;


public class CacheProductOrderFileDownloadList extends GNomExCommand implements Serializable {

  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(CacheProductOrderFileDownloadList.class);
  
  public String SUCCESS_JSP = "/getXML.jsp";
  

  private ProductOrderFileDescriptorParser parser = null;

  
  protected final static String   SESSION_KEY_FILE_DESCRIPTOR_PARSER = "GNomExProductOrderFileDescriptorParser";
  

  /**
   *  The method in which you can do any final validation and add any additional
   *  validation entries into the invalidField hashmap, this should be called in
   *  the loadCommand prior to setting the response jsp
   */
  public void validate() {
  }

  /**
   *  The callback method in which any pre-processing of the command takes place
   *  before the execute method is called. This method is where you would want
   *  to load objects from the HttpServletRequest (passed in), do form
   *  validation, etc. The HttpSession is also available in this method in case
   *  any session data is necessary.
   *
   *@param  request  The HttpServletRequest object
   *@param  session  The HttpSession object
   */
  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
    this.validate();

    // Get the files XML string
    if (request.getParameter("fileDescriptorXMLString") != null && !request.getParameter("fileDescriptorXMLString").isEmpty()) {
      String fileDescriptorXMLString = "<FileDescriptorList>" + request.getParameter("fileDescriptorXMLString") + "</FileDescriptorList>";
      
      StringReader reader = new StringReader(fileDescriptorXMLString);
      try {
        SAXBuilder sax = new SAXBuilder();
        Document doc = sax.build(reader);
        parser = new ProductOrderFileDescriptorParser(doc);
      } catch (JDOMException je ) {
        this.errorDetails = Util.GNLOG(LOG,"Cannot parse fileDescriptorXMLString", je);
      
      }
    }

    
    
    // see if we have a valid form
    if (isValid()) {
      setResponsePage(this.SUCCESS_JSP);
    } else {
      setResponsePage(this.ERROR_JSP);
    }
  }

  /**
   *  The callback method where your business logic should be placed. This
   *  method is either called from the FrontController servlet or from the
   *  RequestProcessor Session Bean (if EJB is used). Any data resulting from
   *  the execution of this method should be put into instance variables in this
   *  class.
   *
   *@return                               Returns this command with the results
   *      of the execute method
   *@exception  RollBackCommandException  Description of the Exception
   */
  public Command execute() throws RollBackCommandException {
    
    if (isValid()) {
      this.xmlResult = "<SUCCESS/>";
      setResponsePage(this.SUCCESS_JSP);
    } else {
      setResponsePage(this.ERROR_JSP);
    }
    
    
    return this;
  }
  

  /* (non-Javadoc)
   * @see hci.framework.control.Command#setRequestState(javax.servlet.http.HttpServletRequest)
   */
  public HttpServletWrappedRequest setRequestState(HttpServletWrappedRequest request) {
    request.setAttribute("xmlResult",this.xmlResult);
    return request;
  }

  /* (non-Javadoc)
   * @see hci.framework.control.Command#setResponseState(javax.servlet.http.HttpServletResponse)
   */
  public HttpServletResponse setResponseState(HttpServletResponse response) {
    // TODO Auto-generated method stub
    return response;
  }

  /* (non-Javadoc)
   * @see hci.framework.control.Command#setSessionState(javax.servlet.http.HttpSession)
   */
  public HttpSession setSessionState(HttpSession session) {
    session.setAttribute(this.SESSION_KEY_FILE_DESCRIPTOR_PARSER, this.parser);
    return session;
  }

  /* (non-Javadoc)
   * @see hci.report.utility.ReportCommand#loadContextPermissions()
   */
  public void loadContextPermissions(){
    
  }
  public void loadContextPermissions(String userName) throws SQLException {
    
  }

}
