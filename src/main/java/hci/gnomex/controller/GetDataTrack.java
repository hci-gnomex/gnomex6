package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.*;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.DictionaryHelper;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.PropertyDictionaryHelper;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.List;
import java.util.Set;
import java.util.TreeMap;



public class GetDataTrack extends GNomExCommand implements Serializable {

  private static Logger LOG = Logger.getLogger(GetDataTrack.class);

  private Integer idDataTrack;
  private String dataTrackNumber;
  private String serverName;
  private String baseDir;
  private String analysisBaseDir;

  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
    if (request.getParameter("idDataTrack") != null && !request.getParameter("idDataTrack").equals("")) {
      idDataTrack = Integer.valueOf(request.getParameter("idDataTrack"));
    } else if ( request.getParameter( "dataTrackNumber" ) != null && !request.getParameter("dataTrackNumber").equals("")) {
      dataTrackNumber = request.getParameter( "dataTrackNumber" );
    } else {
      this.addInvalidField("Missing parameters", "idDataTrack or dataTrackNumber required");
    }
    serverName = request.getServerName();
  }

  public Command execute() throws RollBackCommandException {

    try {


      Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());
      baseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null, PropertyDictionaryHelper.PROPERTY_DATATRACK_DIRECTORY);
      analysisBaseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null, PropertyDictionaryHelper.PROPERTY_ANALYSIS_DIRECTORY);
      String use_altstr = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.USE_ALT_REPOSITORY);
      if (use_altstr != null && use_altstr.equalsIgnoreCase("yes")) {
        analysisBaseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null,
                PropertyDictionaryHelper.ANALYSIS_DIRECTORY_ALT,this.getUsername());
      }

      DataTrack dataTrack;
      if ( idDataTrack != null && !idDataTrack.equals( "" )) {
        dataTrack = DataTrack.class.cast(sess.load(DataTrack.class, idDataTrack));
      } else {
        dataTrack = this.getDataTrackFromDataTrackNumber( sess, dataTrackNumber );
      }


      // TODO: GENOPUB Need to send in analysis file data path?
      if(dataTrack != null) {
        if (this.getSecAdvisor().canRead(dataTrack)) {
          Document doc = dataTrack.getXML(this.getSecAdvisor(), DictionaryHelper.getInstance(sess), baseDir, analysisBaseDir);
          this.appendRelatedNodes(this.getSecAdvisor(), sess, dataTrack, doc.getRootElement());
          org.jdom.output.XMLOutputter out = new org.jdom.output.XMLOutputter();
          this.xmlResult = out.outputString(doc);
          setResponsePage(this.SUCCESS_JSP);

        } else {
          this.addInvalidField("insufficient permission", "Insufficient permission to access data track");
        }
      } else {
        this.addInvalidField("Data Track does not exist", "Data Track does not exist");
      }

    } catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetDataTrack ", e);
      throw new RollBackCommandException(e.getMessage());
    }
    return this;
  }

  public static DataTrack getDataTrackFromDataTrackNumber(Session sess, String  dataTrackNumber) {
    DataTrack dt = null;

    StringBuffer buf = new StringBuffer("SELECT dt from DataTrack as dt where dt.fileName = '" + dataTrackNumber.toUpperCase() + "'");
    List datatracks = sess.createQuery(buf.toString()).list();
    if (datatracks.size() > 0) {
      dt = (DataTrack)datatracks.get(0);
    }
    return dt;
  }

  /*
   * Append related analysis and experiments.  Append parent topics (and contents).
   */
  @SuppressWarnings("unchecked")
  private static void appendRelatedNodes(SecurityAdvisor secAdvisor, Session sess, DataTrack dataTrack, Element node) throws Exception {
    Element relatedNode = new Element("relatedObjects");
    relatedNode.setAttribute("label", "Related Items");
    node.addContent(relatedNode);

    // Hash analysis and experiments
    TreeMap<Integer, Analysis> analysisMap = new TreeMap<Integer, Analysis>();
    TreeMap<Integer, TreeMap<Integer, Request>> analysisToRequestMap = new TreeMap<Integer, TreeMap<Integer, Request>>();
    for (DataTrackFile dtFile : (Set<DataTrackFile>)dataTrack.getDataTrackFiles()) {

      Analysis a = dtFile.getAnalysisFile().getAnalysis();
      analysisMap.put(a.getIdAnalysis(), a);

      TreeMap<Integer, Request> requestMap = analysisToRequestMap.get(a.getIdAnalysis());
      if (requestMap == null) {
        requestMap = new TreeMap<Integer, Request>();
        analysisToRequestMap.put(a.getIdAnalysis(), requestMap);
      }

      for (AnalysisExperimentItem x : (Set<AnalysisExperimentItem>)a.getExperimentItems()) {
        Request request = null;
        if (x.getSequenceLane() != null) {
          request = x.getSequenceLane().getRequest();
        } else if( x.getHybridization() != null) {
          request = x.getHybridization().getLabeledSampleChannel1().getRequest();
        }

        // request will be null if AnalysisExperimentItem contains rows with only idSample present
        if (request != null) {
        	requestMap.put(request.getIdRequest(), request);
        }
      }

    }

    // Create analysis and experiment nodes.
    for (Integer idAnalysis : analysisMap.keySet()) {
      Analysis analysis  = analysisMap.get(idAnalysis);

      Element analysisNode = analysis.appendBasicXML(secAdvisor, relatedNode);

      TreeMap<Integer, Request> requestMap = analysisToRequestMap.get(idAnalysis);
      for (Integer idRequest : requestMap.keySet()) {
        Request request = requestMap.get(idRequest);
        request.appendBasicXML(secAdvisor, analysisNode);
      }
    }

    // Append the parent topics (and the contents of the topic) XML
    Element relatedTopicNode = new Element("relatedTopics");
    relatedTopicNode.setAttribute("label", "Related Topics");
    node.addContent(relatedTopicNode);

    Topic.appendParentTopicsXML(secAdvisor, relatedTopicNode, dataTrack.getTopics());
  }


}
