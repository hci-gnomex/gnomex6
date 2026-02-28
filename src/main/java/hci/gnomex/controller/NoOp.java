package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.utility.HttpServletWrappedRequest;
import org.apache.log4j.Logger;

import javax.servlet.http.HttpSession;
import java.io.Serializable;

public class NoOp extends GNomExCommand implements Serializable {

  private static Logger LOG = Logger.getLogger(NoOp.class);
  
  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

  }

  public Command execute() throws RollBackCommandException {
    LOG.debug("executing NoOp.execute");
    this.xmlResult = "<NoOp/>";
    return this;
  }
}
