package hci.gnomex.controller;

import hci.dictionary.utility.DictionaryManager;
import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.AppUser;
import hci.gnomex.model.Lab;
import hci.gnomex.model.PendingSampleFilter;
import hci.gnomex.model.RequestCategory;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.DictionaryHelper;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.query.Query;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.*;

public class GetPendingSampleList extends GNomExCommand implements Serializable {

  private static Logger LOG = Logger.getLogger(GetPendingSampleList.class);

  private PendingSampleFilter  filter;
  private Element              rootNode = null;
  private Element              redoNode = null;
  private Element              pendingNode = null;
  private Element              requestNode = null;
  private Element              plateNode = null;

  private Integer              idPlatePrev = -1;


  TreeMap<Integer, TreeMap<String, List<Object[]>>> requestMap = null;
  TreeMap<String, List<Object[]>>                   assayMap = null;
  HashMap<Integer, Element>                         requestNodeMap = new HashMap<Integer, Element>();


  private static final String DELIM = ",,,";

  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    if (!this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_DNA_SEQ_CORE)) {
      this.addInvalidField("perm", "Insufficient permissions to view pending samples for DNA Seq core");
    }

    filter = new PendingSampleFilter();
    HashMap errors = this.loadDetailObject(request, filter);
    this.addInvalidFields(errors);


  }

  public Command execute() throws RollBackCommandException {
    Document doc = new Document(new Element("SampleList"));
    rootNode = doc.getRootElement();

    redoNode = new Element("Status");
    redoNode.setAttribute("label", "Redos");
    rootNode.addContent(redoNode);

    pendingNode = new Element("Status");
    pendingNode.setAttribute("label", "Pending");
    rootNode.addContent(pendingNode);

    try {
      Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());

      DictionaryHelper dictionaryHelper = DictionaryHelper.getInstance(sess);

      // Get the pending samples that are already on a reaction plate.
      // We hash these so that they will be excluded from the
      // pending sample list
      //
      HashMap<Integer, List<Object[]>> samplesToFilter = new HashMap<Integer, List<Object[]>>();
      StringBuffer buf = filter.getPendingSamplesAlreadyOnPlateQuery();
      LOG.info("Pending samples already on plate GetPendingSampleList: " + buf.toString());
      Query query = sess.createQuery(buf.toString());
      List pendingSamplesAlreadyOnPlate = (List)query.list();
      for (Iterator i = pendingSamplesAlreadyOnPlate.iterator(); i.hasNext();) {
        Object[] row = (Object[])i.next();
        Integer idSample = (Integer)row[0];
        Integer idAssay  = (Integer)row[1];
        Integer idPrimer = (Integer)row[2];

        List<Object[]> theRows = samplesToFilter.get(idSample);
        if (theRows == null) {
          theRows = new ArrayList<Object[]>();
          samplesToFilter.put(idSample, theRows);
        }
        theRows.add(row);
      }

      //
      // Get the 'redo' samples. Organize by primer or assay, then request, then well
      //
      buf = filter.getRedoQuery();
      LOG.info("Redo sample query for GetPendingSampleList: " + buf.toString());
      query = sess.createQuery(buf.toString());
      List redoResults = (List)query.list();
      requestMap = new  TreeMap<Integer, TreeMap<String, List<Object[]>>>();
      hashResults(redoResults, dictionaryHelper, null);
      fillNodes(redoNode, dictionaryHelper);



      //
      // Get the pending samples under a status xml node, and then assay or
      // primer (if applicable), then by request, then well.
      // Tubes have wells that don't belong to a source plate.
      //
      buf = filter.getPendingSamplesQuery();
      LOG.info("Pending tube query for GetPendingSampleList: " + buf.toString());
      query = sess.createQuery(buf.toString());
      List pendingSamples = (List)query.list();

      requestMap = new  TreeMap<Integer, TreeMap<String, List<Object[]>>>();
      hashResults(pendingSamples, dictionaryHelper, samplesToFilter);
      fillNodes(pendingNode, dictionaryHelper);

      XMLOutputter out = new org.jdom.output.XMLOutputter();
      this.xmlResult = out.outputString(doc);

      setResponsePage(this.SUCCESS_JSP);
    }catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetPendingSampleList ", e);
      throw new RollBackCommandException(e.getMessage());
    }

    return this;
  }

  private void hashResults(List rows, DictionaryHelper dictionaryHelper, Map<Integer, List<Object[]>>samplesToFilter) {
    // Hash the pending tubes
    for(Iterator i = rows.iterator(); i.hasNext();) {
      Object[] row = (Object[])i.next();
      Integer idRequest           = (Integer)row[0];
      Integer idAssay             = (Integer)row[13];
      Integer idPrimer            = (Integer)row[14];
      Integer idSample            = (Integer)row[9];

      // Filter out rows for samples already on reaction plate
      if (samplesToFilter != null) {

        if (samplesToFilter.containsKey(idSample)) {
          List<Object[]> theRows = samplesToFilter.get(idSample);

          // Loop through all of the plate wells on reaction plates for this sample.
          // For cap seq, we bypass if the sample is found.  For frag analysis,
          // we bypass if there is a matching sample and assay found on a reaction
          // plate.  For met seq, we bypass if we find a matching sample and
          // primer on the reaction plate.
          boolean found = false;
          for (Object[] theRow : theRows) {
            Integer idAssayOnPlate = (Integer)theRow[1];
            Integer idPrimerOnPlate = (Integer)theRow[2];
            if (idAssay != null) {
              if (idAssayOnPlate != null && idAssay.equals(idAssayOnPlate)) {
                found = true;
                break;
              }
            } else if (idPrimer != null) {
              if (idPrimerOnPlate != null && idPrimer.equals(idPrimerOnPlate)) {
                found = true;
                break;
              }

            } else {
              found = true;
              break;
            }
          }
          if (found) {
            continue;
          }

        }
      }


      String assayKey = " ";
      if (idAssay != null && idAssay.intValue() != -1) {
        assayKey = DictionaryManager.getDisplay("hci.gnomex.model.Assay", idAssay.toString());
      } else if (idPrimer != null && idPrimer.intValue() != -1){
        assayKey = DictionaryManager.getDisplay("hci.gnomex.model.Primer", idPrimer.toString());
      }


      assayMap = requestMap.get(idRequest);
      if (assayMap == null) {
        assayMap = new TreeMap<String, List<Object[]>>();
        requestMap.put(idRequest, assayMap);
        Element requestNode = createRequestNode(row, dictionaryHelper);

        // First time we encounter a request, create a request node
        // from the row and hash it.
        requestNodeMap.put(idRequest, requestNode);
      }


      List<Object[]> results = assayMap.get(assayKey);
      if (results == null) {
        results = new ArrayList<Object[]>();
        assayMap.put(assayKey, results);
      }
      results.add(row);
    }

  }

  private void fillNodes(Element statusNode, DictionaryHelper dictionaryHelper) {
    Element parentNode = null;

    // Now create a request node for each key in the map
    // and create a well node child of the request node
    // for every row associated with the request.
    for(Iterator i = requestMap.keySet().iterator(); i.hasNext();) {
      Integer idRequest = (Integer)i.next();

      assayMap = requestMap.get(idRequest);
      Element requestNode = requestNodeMap.get(idRequest);
      statusNode.addContent(requestNode);

      // Now we will add either assay/primer nodes to this
      // request node or we will add well nodes (in the
      // case of capillary sequencing).
      parentNode = requestNode;


      int totalSampleCount = 0;
      for (Iterator i1 = assayMap.keySet().iterator(); i1.hasNext();) {
        String assayKey = (String)i1.next();
        List<Object[]> results = assayMap.get(assayKey);

        int plateCount = getPlateCount(results);

        idPlatePrev = -1;
        boolean firstTime = true;
        for (Object[]row : results) {
          if (firstTime && !assayKey.equals(" ")) {
            parentNode = createAssayNode(row, dictionaryHelper);
            requestNode.addContent(parentNode);
          }
          if (firstTime) {
            firstTime = false;
            parentNode.setAttribute("sampleCount", Integer.valueOf(results.size()).toString());
          }
          addWellNode(row, dictionaryHelper, parentNode, results, plateCount);
          totalSampleCount++;
        }
      }
      requestNode.setAttribute("sampleCount", Integer.valueOf(totalSampleCount).toString());

    }

  }


  private Element createRequestNode(Object[] row, DictionaryHelper dictionaryHelper) {

    Integer idRequest           = (Integer)row[0];
    String requestNumber        = (String)row[1]  == null ? ""  : (String)row[1];
    java.util.Date createDate   = (java.util.Date)row[4];
    Integer idLab               = (Integer)row[5];
    String labLastName          = (String)row[6]  == null ? ""  : (String)row[6];
    String labFirstName         = (String)row[7]  == null ? ""  : (String)row[7];
    String experimentName       = (String)row[17]  == null ? "" : (String)row[17];
    AppUser submitter           = (AppUser)row[18];

    RequestCategory requestCategory = dictionaryHelper.getRequestCategoryObject(filter.getCodeRequestCategory());

    String labName = Lab.formatLabNameFirstLast(labFirstName, labLastName);


    String shortName = AppUser.formatShortName(submitter.getLastName(), submitter.getFirstName()) + "-" + requestNumber;

    String label = shortName + " " + this.formatDate((java.util.Date)createDate, this.DATE_OUTPUT_DASH);

    requestNode = new Element("Request");
    requestNode.setAttribute("idRequest",              idRequest.toString());
    requestNode.setAttribute("requestNumber",          requestNumber);
    requestNode.setAttribute("label",                  label);
    requestNode.setAttribute("requestSubmitDate",      createDate == null ? ""  : this.formatDate((java.util.Date)createDate, this.DATE_OUTPUT_DASH));
    requestNode.setAttribute("idLab",                  idLab == null ? "" : idLab.toString());
    requestNode.setAttribute("lab",                    labName);
    requestNode.setAttribute("icon",                   requestCategory != null && requestCategory.getIcon() != null ? requestCategory.getIcon() : "");


    return requestNode;

  }
  private Element createAssayNode(Object[] row, DictionaryHelper dictionaryHelper) {

    Integer idAssay             = (Integer)row[13];
    Integer idPrimer            = (Integer)row[14];

    Element n = null;
    String label = "";
    if (idAssay != null && idAssay.intValue() != -1) {
      n = new Element("Assay");
      n.setAttribute( "idAssay", idAssay.toString() );
      label = DictionaryManager.getDisplay("hci.gnomex.model.Assay", idAssay.toString());
    } else if (idPrimer != null && idPrimer.intValue() != -1){
      n = new Element("Primer");
      n.setAttribute( "idPrimer", idPrimer.toString() );
      label = DictionaryManager.getDisplay("hci.gnomex.model.Primer", idPrimer.toString());
    }
    n.setAttribute("label", label);

    return n;
  }

  private void addWellNode(Object[] row, DictionaryHelper dictionaryHelper, Element parentNode, List<Object[]> results, int plateCount) {

    Integer idRequest           = (Integer)row[0];
    String requestNumber        = (String)row[1]  == null ? ""  : (String)row[1];
    String codeRequestStatus    = (String)row[2]  == null ? ""  : (String)row[2];
    String codeRequestCategory  = (String)row[3]  == null ? ""  : (String)row[3];
    java.util.Date createDate   = (java.util.Date)row[4];
    Integer idLab               = (Integer)row[5];
    String labLastName          = (String)row[6]  == null ? ""  : (String)row[6];
    String labFirstName         = (String)row[7]  == null ? ""  : (String)row[7];
    AppUser submitter           = (AppUser)row[8];
    Integer idSample            = (Integer)row[9];
    String wellRow              = (String)row[10]  == null ? ""  : (String)row[10];
    Integer wellCol             = (Integer)row[11];
    Integer wellIndex           = (Integer)row[12];

    Integer idAssay             = (Integer)row[13];
    Integer idPrimer            = (Integer)row[14];
    Integer idPlate             = (Integer)row[15];
    String plateLabel           = (String)row[16]  == null ? ""  : (String)row[16];

    String  sampleName          = (String)row[19];
    String  redoFlag            = (String)row[20];
    Integer  idPlateWell        = (Integer)row[21];


    if (idPlate != null) {
      if (plateLabel == null || plateLabel.trim().equals("")) {
        plateLabel = idPlate.toString();
      }
    }

    Element wellParentNode = parentNode;

    RequestCategory requestCategory = dictionaryHelper.getRequestCategoryObject(codeRequestCategory);
    if (plateCount > 1 && idAssay == null && idPrimer == null && idPlate != null) {
      if (!idPlate.equals(idPlatePrev)) {
        plateNode = new Element("Plate");
        plateNode.setAttribute("label",        plateLabel);
        plateNode.setAttribute("idPlate",      idPlate != null ? idPlate.toString() : "");

        int sampleCount = getSampleCountForPlate(idPlate, results);
        plateNode.setAttribute("sampleCount", Integer.valueOf(sampleCount).toString());

        parentNode.addContent(plateNode);
        wellParentNode = plateNode;
      } else {
        wellParentNode = plateNode;
      }
    }
    Element n = new Element("Well");
    n.setAttribute("sampleName",     sampleName != null ? sampleName : "");
    n.setAttribute("idRequest",      idRequest != null ? idRequest.toString() : "");
    n.setAttribute("requestNumber",  requestNumber != null ? requestNumber : "");
    n.setAttribute("idLab",          idLab != null ? idLab.toString() : "");
    n.setAttribute("idSample",       idSample != null ? idSample.toString() : "");
    n.setAttribute("type",           requestCategory.getRequestCategory());
    n.setAttribute("row",            wellRow != null ? wellRow : "");
    n.setAttribute("col",            wellCol != null ? wellCol.toString() : "");
    n.setAttribute("index",          wellIndex != null ? wellIndex.toString() : "");
    n.setAttribute("idPlate",        idPlate != null ? idPlate.toString() : "");
    n.setAttribute("requestSubmitDate",  createDate == null ? ""  : this.formatDate((java.util.Date)createDate, this.DATE_OUTPUT_DASH));
    n.setAttribute("requestSubmitter",   submitter != null ? Util.getAppUserDisplayName(submitter, this.getUserPreferences()) : "");
    n.setAttribute("redoFlag",       redoFlag != null ? redoFlag : "");
    n.setAttribute("idSourcePlateWell",        idPlateWell != null ? idPlateWell.toString() : "");

    if ( idAssay != null && idAssay.intValue() != -1 ) {
      n.setAttribute( "idAssay", idAssay.toString() );
      String assayLabel = DictionaryManager.getDisplay("hci.gnomex.model.Assay", idAssay.toString());
      n.setAttribute("label", assayLabel);
    }
    if ( idPrimer != null && idPrimer.intValue() != -1 ) {
      n.setAttribute( "idPrimer", idPrimer.toString() );
      String primerLabel = DictionaryManager.getDisplay("hci.gnomex.model.Primer", idPrimer.toString());
      n.setAttribute("label", primerLabel);
    }

    idPlatePrev = idPlate;

    wellParentNode.addContent(n);

  }

  private int getPlateCount(List<Object[]> results) {
    HashMap<Integer, Integer> plateMap = new HashMap<Integer, Integer>();

    for (Object[] row : results) {
      Integer idPlate             = (Integer)row[15];

      if (idPlate != null) {
        plateMap.put(idPlate, idPlate);
      }
    }
    return plateMap.size();
  }


  private int getSampleCountForPlate(Integer theIdPlate, List<Object[]> results) {
    int sampleCount = 0;

    for (Object[] row : results) {
      Integer idPlate             = (Integer)row[15];

      if (idPlate != null) {
        if (idPlate.equals(theIdPlate)) {
          sampleCount++;
        }
      }
    }
    return sampleCount;
  }
}
