package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.utility.HttpServletWrappedRequest;

import javax.servlet.http.HttpSession;
import java.io.Serializable;


public class GetSessionTimeout extends GNomExCommand implements Serializable {
  
 
  
  /**
   * 
   */
  private static final long serialVersionUID = 1L;
  
  int maxInactive;
  
  
  
  
  public void validate() {
  }
  
  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
    maxInactive = session.getMaxInactiveInterval();
  }

  public Command execute() throws RollBackCommandException {
    this.xmlResult = "<SUCCESS maxInactiveTime=\"" + maxInactive + "\"/>";
    setResponsePage(this.SUCCESS_JSP);
    return this;

  }

}
