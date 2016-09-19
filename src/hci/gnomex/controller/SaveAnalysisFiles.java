package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.Analysis;
import hci.gnomex.model.AnalysisFile;
import hci.gnomex.utility.AnalysisFileParser;
import hci.gnomex.utility.HibernateSession;

import java.io.Serializable;
import java.io.StringReader;
import java.util.Iterator;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;
import org.apache.log4j.Logger;


/**
 * This command will refresh the AnalysisFile objects in the db to match 
 * the files on the file system.  We pass in AnalysisFile XML that contains
 * files present in the db as well as files present on the files system
 * but not yet accounted for in the db.  
 * 
 * @author u0104305
 *
 */
public class SaveAnalysisFiles extends GNomExCommand implements Serializable {
  
 
  
  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(SaveLab.class);
  
  private String                baseDir;
  
  private String                analysisFilesXMLString;
  private Document              analysisFilesDoc;
  private AnalysisFileParser    analysisFileParser;

  private Integer                idAnalysis;
  
  private String                serverName;
  
  
  public void validate() {
  }
  
  public void loadCommand(HttpServletRequest request, HttpSession session) {
    
    if (request.getParameter("idAnalysis") != null && !request.getParameter("idAnalysis").equals("")) {
      idAnalysis = Integer.valueOf(request.getParameter("idAnalysis"));
    } else {
      this.addInvalidField("idAnalysis", "idAnalysis is required.");
    }

    StringReader reader = null;
    if (request.getParameter("analysisFilesXMLString") != null && !request.getParameter("analysisFilesXMLString").equals("")) {
      analysisFilesXMLString = request.getParameter("analysisFilesXMLString");
      
      reader = new StringReader(analysisFilesXMLString);
      try {
        SAXBuilder sax = new SAXBuilder();
        analysisFilesDoc = sax.build(reader);

        analysisFileParser = new AnalysisFileParser(analysisFilesDoc, null);
      } catch (JDOMException je ) {
        LOG.error( "Cannot parse analysisFilesXMLString", je );
        this.addInvalidField( "analysisFilesXMLString", "Invalid analysisFilesXMLString");
      }
    }
    
    serverName = request.getServerName();
    
    
  }

  public Command execute() throws RollBackCommandException {
    
    try {
      Session sess = HibernateSession.currentSession(this.getUsername());
      Analysis analysis = (Analysis)sess.load(Analysis.class, idAnalysis);       
      
      // Normally, we would check to make sure the user has 'write' permissions
      // on the Analysis.  But in this case, we are just inserting AnalysisFile
      // objects into the db for the sole purpose of linking to DataTracks, so
      // we want to allow readers to be able to perform these inserts.
      if (!this.getSecAdvisor().isGuest() && this.getSecurityAdvisor().canRead(analysis)) {
        
        if (analysisFileParser != null) {
          analysisFileParser.parse(sess);          
        }
        
        //
        // Save analysis files
        //
        if (analysisFileParser != null) {
          for(Iterator i = analysisFileParser.getAnalysisFileMap().keySet().iterator(); i.hasNext();) {
            String idAnalysisFileString = (String)i.next();
            AnalysisFile af = (AnalysisFile)analysisFileParser.getAnalysisFileMap().get(idAnalysisFileString);
            sess.save(af);
          }            
        }
        
        sess.flush();
          
        this.xmlResult = "<SUCCESS idAnalysis=\"" + analysis.getIdAnalysis() + "\"" +  " idAnalysisGroup=\"" + "\"" + "/>";
      
        setResponsePage(this.SUCCESS_JSP);
      } else {
        this.addInvalidField("Insufficient permissions", "Insufficient permission to save " + analysis.getNumber() + " analysis.");
        setResponsePage(this.ERROR_JSP);
      }
      
    }catch (Exception e){
      LOG.error("An exception has occurred in SaveAnalysisFiles ", e);

      throw new RollBackCommandException(e.getMessage());
        
    } finally {
      try {
        //closeHibernateSession;        
      } catch(Exception e){
        LOG.error("Error", e);
      }
    }
    
    return this;
  }
  

}