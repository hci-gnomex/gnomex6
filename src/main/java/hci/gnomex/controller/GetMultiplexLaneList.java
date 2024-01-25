package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.utilities.XMLReflectException;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.*;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.DictionaryHelper;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.RequestParser;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;
import org.jdom.output.XMLOutputter;

import javax.json.Json;
import javax.json.JsonReader;
import javax.naming.NamingException;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.io.StringReader;
import java.sql.SQLException;
import java.util.Comparator;
import java.util.Iterator;
import java.util.Set;
import java.util.TreeSet;

public class GetMultiplexLaneList extends GNomExCommand implements Serializable {
  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(GetMultiplexLaneList.class);

  private String           requestXMLString;
  private Document         requestDoc;
  private RequestParser    requestParser;

  private boolean          usingJSON;

  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {


    if (request.getParameter("requestXMLString") != null && !request.getParameter("requestXMLString").equals("")) {
      this.usingJSON = false;

      this.requestXMLString = request.getParameter("requestXMLString");
      this.requestXMLString = this.requestXMLString.replaceAll("&", "&amp;");
      StringReader reader = new StringReader(requestXMLString);

      try {
        SAXBuilder sax = new SAXBuilder();
        requestDoc = sax.build(reader);
        requestParser = new RequestParser(requestDoc, this.getSecAdvisor());
      } catch (JDOMException je ) {
        this.addInvalidField( "RequestXMLString", "Invalid request xml");
        this.errorDetails = Util.GNLOG(LOG,"Cannot parse requestXMLString", je);
      }
    } else if (request.getParameter("requestJSONString") != null && !request.getParameter("requestJSONString").equals("")) {
      this.usingJSON = true;

      String requestJSONString = request.getParameter("requestJSONString");
      if (Util.isParameterNonEmpty(requestJSONString)) {
        try (JsonReader jsonReader = Json.createReader(new StringReader(requestJSONString))) {
            requestParser = new RequestParser(jsonReader, this.getSecAdvisor());
        } catch (Exception e) {
          this.addInvalidField( "requestJSONString", "Invalid request json");
          this.errorDetails = Util.GNLOG(LOG,"Cannot parse requestXMLString", e);
        }
      }
    }

    if (isValid()) {
      setResponsePage(this.SUCCESS_JSP);
    } else {
      setResponsePage(this.ERROR_JSP);
    }
  }

  public Command execute() throws RollBackCommandException {

    try {

      Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());
      DictionaryHelper dh = DictionaryHelper.getInstance(sess);

      // Read the experiment
      Request request = null;
      Set samples = null;
      Set lanes = null;
      int x = 0;

      requestParser.parse(sess);
      request = requestParser.getRequest();

      // Admins and users authorized to submit requests can view estimated
      // charges
      if (!this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_ACCESS_ANY_OBJECT) &&
          !this.getSecAdvisor().isGroupIAmMemberOrManagerOf(request.getIdLab()) &&
          !this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_SUBMIT_FOR_OTHER_CORES) &&
          !this.getSecAdvisor().isGroupICollaborateWith(request.getIdLab())) {
        throw new RollBackCommandException("Insufficient permission to view estimated charges");
      }

      if (request.getIdRequest() == null) {
        request.setIdRequest(0);
        request.setNumber("");
      }

      samples = new TreeSet(new SampleComparator());
      lanes = new TreeSet(new LaneComparator());

      // Parse the samples.
      // Consider samples for billing if this is a new request or a qc request being converted to a
      // microarray or next gen sequencing request
      x = 0;
      if (!requestParser.isAmendRequest() || requestParser.getAmendState().equals(Constants.AMEND_QC_TO_SEQ)) {
        for(Iterator i = requestParser.getSampleIds().iterator(); i.hasNext();) {
          String idSampleString = (String)i.next();
          Sample sample = (Sample)requestParser.getSampleMap().get(idSampleString);
          if (sample.getIdSample() == null) {
            sample.setIdSample(x++);
          }
          samples.add(sample);
        }
      }

      // Parse the sequence lanes
      x = 0;
      for(Iterator i = requestParser.getSequenceLaneInfos().iterator(); i.hasNext();) {
        RequestParser.SequenceLaneInfo laneInfo = (RequestParser.SequenceLaneInfo)i.next();
        SequenceLane lane = new SequenceLane();

        boolean isNewLane = requestParser.isNewRequest() || laneInfo.getIdSequenceLane() == null || laneInfo.getIdSequenceLane().startsWith("SequenceLane");

        if (isNewLane) {
          if (lane.getIdSequenceLane() == null) {
            lane.setIdSequenceLane(x++);
            lane.setIdNumberSequencingCycles(laneInfo.getIdNumberSequencingCycles());
            lane.setIdNumberSequencingCyclesAllowed(laneInfo.getIdNumberSequencingCyclesAllowed());
            lane.setIdGenomeBuildAlignTo(laneInfo.getIdGenomeBuildAlignTo());
          }
          lane.setIdSeqRunType(laneInfo.getIdSeqRunType());
          Sample sample = (Sample)requestParser.getSampleMap().get(laneInfo.getIdSampleString());
          lane.setSample(sample);

          lanes.add(lane);

        }
      }

      for(Iterator i = requestParser.getSampleIds().iterator(); i.hasNext();) {
        String idSampleString = (String)i.next();
        boolean isNewSample = requestParser.isNewRequest() || idSampleString == null || idSampleString.equals("") || idSampleString.startsWith("Sample");
        Sample sample = (Sample)requestParser.getSampleMap().get(idSampleString);
        if (sample.getIdOligoBarcode() != null) {
          sample.setBarcodeSequence(dh.getBarcodeSequence(sample.getIdOligoBarcode()));
        }

        // Set the barcodeSequenceB if  idOligoBarcodeB is filled in
        if(sample.getIdOligoBarcodeB() != null){
          sample.setBarcodeSequenceB(dh.getBarcodeSequence(sample.getIdOligoBarcodeB()));
        }
      }
      Document doc = new Document(new Element("MultiplexLaneList"));
      SequenceLane.addMultiplexLaneNodes(doc.getRootElement(), lanes, null);


      XMLOutputter out = new org.jdom.output.XMLOutputter();
      this.xmlResult = out.outputString(doc);

      setResponsePage(this.SUCCESS_JSP);

      // We don't want to save anything;
      sess.clear();

    }catch (NamingException e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetMultiplexLaneList ", e);

      throw new RollBackCommandException(e.getMessage());

    }catch (SQLException e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetMultiplexLaneList ", e);

      throw new RollBackCommandException(e.getMessage());
    } catch (XMLReflectException e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetMultiplexLaneList ", e);

      throw new RollBackCommandException(e.getMessage());
    } catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetMultiplexLaneList ", e);

      throw new RollBackCommandException(e.getMessage());
    }
    if (isValid()) {
      setResponsePage(this.SUCCESS_JSP);
    } else {
      setResponsePage(this.ERROR_JSP);
    }

    return this;
  }

  public class SampleComparator implements Comparator, Serializable {
    public int compare(Object o1, Object o2) {
      Sample s1 = (Sample)o1;
      Sample s2 = (Sample)o2;
      return s1.getIdSample().compareTo(s2.getIdSample());

    }
  }
  public class LabeledSampleComparator implements Comparator, Serializable {
    public int compare(Object o1, Object o2) {
      LabeledSample ls1 = (LabeledSample)o1;
      LabeledSample ls2 = (LabeledSample)o2;
      return ls1.getIdLabeledSample().compareTo(ls2.getIdLabeledSample());

    }
  }
  public class HybComparator implements Comparator, Serializable {
    public int compare(Object o1, Object o2) {
      Hybridization h1 = (Hybridization)o1;
      Hybridization h2 = (Hybridization)o2;
      return h1.getIdHybridization().compareTo(h2.getIdHybridization());

    }
  }
  public class LaneComparator implements Comparator, Serializable {
    public int compare(Object o1, Object o2) {
      SequenceLane l1 = (SequenceLane)o1;
      SequenceLane l2 = (SequenceLane)o2;
      return l1.getIdSequenceLane().compareTo(l2.getIdSequenceLane());

    }
  }
}
