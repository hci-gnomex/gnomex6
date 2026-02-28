package hci.gnomex.controller;

import org.apache.log4j.Logger;
public class CreateAnalysisServlet extends HttpClientServletBase {
  private static Logger LOG = Logger.getLogger(CreateAnalysisServlet.class);
  
  protected String getNameOfServlet() {
    return "CreateAnalysisServlet";
  }
  
  protected GNomExCommand getCommand() {
    return new SaveAnalysis();
  }

  protected void logError(String msg, Exception ex) {
    System.err.println(ex.getStackTrace());
    LOG.error(msg, ex);
  }
}
