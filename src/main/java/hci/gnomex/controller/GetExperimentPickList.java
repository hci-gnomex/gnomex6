package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.*;
import hci.gnomex.utility.DictionaryHelper;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.PropertyDictionaryHelper;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.json.Json;
import javax.json.JsonArray;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.*;


public class GetExperimentPickList extends GNomExCommand implements Serializable {

  private static Logger LOG = Logger.getLogger(GetExperimentPickList.class);

  private ExperimentPickListFilter       filter;
  private HashMap                        slideDesignMap = new HashMap();
  private HashMap<Integer, String>       numberSequencingCyclesAllowedMap = new HashMap<Integer, String>();
  private HashMap                        sampleTypeMap = new HashMap();

  private HashMap                        requestSampleTypeMap = new HashMap();
  private HashMap<String, Object>        requestNumberSequencingCyclesAllowedMap = new HashMap<String, Object>();

  private Element                        rootNode = null;
  private Element                        projectNode = null;
  private Element                        requestNode = null;
  private Element                        itemNode = null;

  private static final String          KEY_DELIM = "&-&-&";

  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    filter = new ExperimentPickListFilter();
    HashMap errors = this.loadDetailObject(request, filter);
    this.addInvalidFields(errors);

    if  (!filter.hasCriteria()) {
      this.addInvalidField("filterRequired", "Please enter at least one search criterion.");
    }
  }

  public Command execute() throws RollBackCommandException {

    try {


      Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());
      DictionaryHelper dh = DictionaryHelper.getInstance(sess);

      List slideDesigns = sess.createQuery("SELECT sd from SlideDesign sd ").list();
      for(Iterator i = slideDesigns.iterator(); i.hasNext();) {
        SlideDesign sd = (SlideDesign)i.next();
        slideDesignMap.put(sd.getIdSlideDesign(), sd.getName());
      }

      List numberSequencingCyclesAlloweds = sess.createQuery("SELECT ncsa from NumberSequencingCyclesAllowed ncsa ").list();
      for(Iterator i = numberSequencingCyclesAlloweds.iterator(); i.hasNext();) {
        NumberSequencingCyclesAllowed ncsa = (NumberSequencingCyclesAllowed)i.next();
        numberSequencingCyclesAllowedMap.put(ncsa.getIdNumberSequencingCyclesAllowed(), ncsa.getName());
      }
      List sampleTypes = sess.createQuery("SELECT st from SampleType st ").list();
      for(Iterator i = sampleTypes.iterator(); i.hasNext();) {
        SampleType st = (SampleType)i.next();
        sampleTypeMap.put(st.getIdSampleType(), st.getSampleType());
      }

      TreeMap projectMap = new TreeMap();


      StringBuffer buf = filter.getMicroarrayQuery(this.getSecAdvisor(), dh);
      LOG.debug("Query for GetExperimentPickList (1): " + buf.toString());
      List rows1 = (List)sess.createQuery(buf.toString()).list();
      TreeMap rowMap = new TreeMap(new HybLaneComparator());
      for(Iterator i = rows1.iterator(); i.hasNext();) {
        Object[] row = (Object[])i.next();

        String projectName   = (String)row[0];
        String requestNumber = (String)row[3];
        String hybNumber     = row[10] == null || row[10].equals("") ? "" : (String)row[10];

        String createDate    = this.formatDate((java.util.Date)row[2]);
        String tokens[] = createDate.split("/");
        String createMonth = tokens[0];
        String createDay   = tokens[1];
        String createYear  = tokens[2];
        String sortDate = createYear + createMonth + createDay;

        String key = projectName + KEY_DELIM + createYear + KEY_DELIM + sortDate + KEY_DELIM + requestNumber + KEY_DELIM + hybNumber;

        rowMap.put(key, row);
      }

      buf = filter.getNextGenSeqQuery(this.getSecAdvisor(), dh);
      LOG.debug("Query for GetExperimentPickList (2): " + buf.toString());
      List rows2 = (List)sess.createQuery(buf.toString()).list();
      for(Iterator i = rows2.iterator(); i.hasNext();) {
        Object[] row = (Object[])i.next();

        String projectName   = (String)row[0];
        String requestNumber = (String)row[3];
        String laneNumber     = row[10] == null || row[10].equals("") ? "" : (String)row[10];

        String createDate    = this.formatDate((java.util.Date)row[2]);
        String tokens[] = createDate.split("/");
        String createMonth = tokens[0];
        String createDay   = tokens[1];
        String createYear  = tokens[2];
        String sortDate = createYear + createMonth + createDay;

        String key = projectName + KEY_DELIM + createYear + KEY_DELIM + sortDate + KEY_DELIM + requestNumber + KEY_DELIM + laneNumber;

        rowMap.put(key, row);
      }

      buf = filter.getSampleQuery(this.getSecAdvisor(), dh);
      LOG.debug("Query for GetExperimentPickList (3): " + buf.toString());
      List rows3 = (List) sess.createQuery(buf.toString()).list();
      for (Iterator i = rows3.iterator(); i.hasNext();) {
    	  Object[] row = (Object[]) i.next();

          String projectName   = (String) row[0];
          String requestNumber = (String) row[3];
          String sampleNumber  = (row[14] == null || row[14].equals("")) ? "" : (String) row[14];

          String createDate    = this.formatDate((java.util.Date) row[2]);
          String tokens[]      = createDate.split("/");
          String createMonth   = tokens[0];
          String createDay     = tokens[1];
          String createYear    = tokens[2];
          String sortDate      = createYear + createMonth + createDay;

          String key = projectName + KEY_DELIM + createYear + KEY_DELIM + sortDate + KEY_DELIM + requestNumber + KEY_DELIM + sampleNumber;

          rowMap.put(key, row);
      }



      Document doc = new Document(new Element("AnalysisExperimentPickList"));
      String prevProjectName  = "";
      Integer prevIdRequest  = -1;

      rootNode = doc.getRootElement();
      for(Iterator i = rowMap.keySet().iterator(); i.hasNext();) {
        String key = (String)i.next();
        Object[] row = (Object[])rowMap.get(key);


        String  projectName = (String)row[0];
        Integer idRequest = row[1] == null ? -2 : (Integer)row[1];

        Element n = null;
        if (!projectName.equals(prevProjectName)) {
          addProjectNode(row);
          if (idRequest.intValue() != -2) {
            addRequestNode(row, dh);
            addItemNode(row,sess, dh);
          }
        } else if (idRequest.intValue() != prevIdRequest.intValue()) {
          if (idRequest.intValue() != -2) {
            addRequestNode(row, dh);
            addItemNode(row,sess, dh);
          }
        } else {
          if (idRequest.intValue() != -2) {
            addItemNode(row,sess,dh);
          }
        }

        prevIdRequest = idRequest;
        prevProjectName = projectName;
      }

      if(!doc.getRootElement().hasChildren()){
          JsonArray projectList = Json.createArrayBuilder().build();
          this.jsonResult = projectList.toString();
      }else{
          XMLOutputter out = new org.jdom.output.XMLOutputter();
          this.xmlResult = out.outputString(doc);
      }

      setResponsePage(this.SUCCESS_JSP);
    }catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetExperimentPickList ", e);
      throw new RollBackCommandException(e.getMessage());
    }
    return this;
  }

  private void addProjectNode(Object[] row) {
    projectNode = new Element("Project");
    projectNode.setAttribute("projectName",            row[0] == null ? ""  : (String)row[0]);
    projectNode.setAttribute("label",                  row[0] == null ? ""  : (String)row[0]);

    rootNode.addContent(projectNode);
  }

  private void addRequestNode(Object[] row, DictionaryHelper dh) {
    String codeRequestCategory = row[4] == null ? "" : ((String)row[4]).toString();
    RequestCategory requestCategory = dh.getRequestCategoryObject(codeRequestCategory);

    String experimentName = row[25] == null ? "" : (String)row[25];
    String experimentNameLabel = experimentName.equals("") ? "" : (" - " + experimentName);

    requestNode = new Element("Request");
    requestNode.setAttribute("idRequest",              row[1] == null ? ""  : ((Integer)row[1]).toString());
    requestNode.setAttribute("createDate",             row[2] == null ? ""  : this.formatDate((java.util.Date)row[2], this.DATE_OUTPUT_ALTIO));
    requestNode.setAttribute("createDateDisplay",      row[2] == null ? ""  : this.formatDate((java.util.Date)row[2], this.DATE_OUTPUT_SQL));
    requestNode.setAttribute("number",                 row[3] == null ? ""  : (String)row[3]);
    requestNode.setAttribute("codeRequestCategory",    codeRequestCategory);
    requestNode.setAttribute("icon", requestCategory != null && requestCategory.getIcon() != null ? requestCategory.getIcon() : "");
    requestNode.setAttribute("type", requestCategory != null && requestCategory.getType() != null ? requestCategory.getType() : "");
    requestNode.setAttribute("codeApplication", row[5] == null ? "" : ((String)row[5]).toString());
    requestNode.setAttribute("slideProduct",           row[6] == null ? ""  : ((String)row[6]).toString());
    requestNode.setAttribute("isSlideSet",             row[7] == null ? ""  : ((String)row[7]).toString());
    requestNode.setAttribute("ownerFirstName",         row[8] == null ? "" : (String)row[8]);
    requestNode.setAttribute("ownerLastName",          row[9] == null ? "" : (String)row[9]);
    requestNode.setAttribute("name",                   experimentName);

    String label = "";
    if (RequestCategory.isIlluminaRequestCategory(requestNode.getAttributeValue("codeRequestCategory"))) {
      label = requestNode.getAttributeValue("number") +
              experimentNameLabel +
              " - " + requestNode.getAttributeValue("createDateDisplay");
    } else {
      label = requestNode.getAttributeValue("number") + " - " +
          experimentNameLabel +
          requestNode.getAttributeValue("slideProduct");
    }
    requestNode.setAttribute("label", label);

    projectNode.addContent(requestNode);

    this.requestNumberSequencingCyclesAllowedMap = new HashMap<String, Object>();
    this.requestSampleTypeMap = new HashMap();
  }

  private void addItemNode(Object[] row, Session sess, DictionaryHelper dh) {
	  if (row.length < 29) {
		  	itemNode = new Element("Item");
		    itemNode.setAttribute("idRequest",                row[1] == null ? ""  : ((Integer)row[1]).toString());
		    itemNode.setAttribute("itemNumber",               row[10] == null ? ""  : (String)row[10]);
		    itemNode.setAttribute("idSlideDesign",            row[11] == null ? ""  : ((Integer)row[11]).toString());
		    itemNode.setAttribute("idNumberSequencingCycles", row[12] == null ? ""  : ((Integer)row[12]).toString());
		    itemNode.setAttribute("idSeqRunType",             row[13] == null ? ""  : ((Integer)row[13]).toString());
		    itemNode.setAttribute("sampleNumber1",            row[14] == null ? ""  : (String)row[14]);
		    itemNode.setAttribute("sampleName1",              row[15] == null ? ""  : (String)row[15]);
		    itemNode.setAttribute("sampleNumber2",            row[16] == null ? ""  : (String)row[16]);
		    itemNode.setAttribute("sampleName2",              row[17] == null ? ""  : (String)row[17]);
		    itemNode.setAttribute("idGenomeBuildAlignTo",     row[19] == null ? ""  : ((Integer)row[19]).toString());
		    itemNode.setAttribute("analysisInstructions",     row[20] == null ? ""  : (String)row[20]);
		    itemNode.setAttribute("flowCellChannelNumber",    row[21] == null ? ""  : ((Integer)row[21]).toString());
		    itemNode.setAttribute("flowCellNumber",           row[22] == null ? ""  : (String)row[22]);
		    if(row.length > 26){
		      itemNode.setAttribute("sampleBarcodeSequence",    row[26] == null ? ""  : (String)row[26]);
		    }
		    if (row.length > 27) {
		      itemNode.setAttribute("idNumberSequencingCyclesAllowed", row[27] == null ? "" : ((Integer)row[27]).toString());
		    }

		    Integer idNumberSequencingCyclesAllowed = -1;
		    if (row.length > 27) {
		      idNumberSequencingCyclesAllowed = (Integer)row[27];
		    }
		    if (idNumberSequencingCyclesAllowed != null && idNumberSequencingCyclesAllowed.intValue() != -1) {
		      String numberSequencingCyclesAllowed = (String)this.numberSequencingCyclesAllowedMap.get(idNumberSequencingCyclesAllowed);
		      itemNode.setAttribute("numberSequencingCyclesAllowed", numberSequencingCyclesAllowed);
		      this.requestNumberSequencingCyclesAllowedMap.put(numberSequencingCyclesAllowed, null);
		    } else {
		      itemNode.setAttribute("numberSequencingCyclesAllowed", "?");
		    }

		    Integer idSampleType = (Integer)row[18];
		    if (idSampleType != null && idSampleType.intValue() != -1) {
		      String sampleType = (String)this.sampleTypeMap.get(idSampleType);
		      itemNode.setAttribute("sampleType", sampleType);
		      this.requestSampleTypeMap.put(sampleType, null);
		    }


		    StringBuffer label = new StringBuffer(itemNode.getAttributeValue("itemNumber"));

		    if (RequestCategory.isIlluminaRequestCategory(requestNode.getAttributeValue("codeRequestCategory"))) {
		      label.append(" -  ");
		      label.append(itemNode.getAttributeValue("sampleName1"));
		      requestNode.setAttribute("numberSequencingCyclesAllowed", itemNode.getAttributeValue("numberSequencingCyclesAllowed"));
		    } else {
		      label.append(" - ");
		      label.append(itemNode.getAttributeValue("sampleName1"));
		      if (!itemNode.getAttributeValue("sampleName2").equals("")) {
		        label.append(", ");
		        label.append(itemNode.getAttributeValue("sampleName2"));
		        if (requestNode.getAttributeValue("isSlideSet") != null &&
		            requestNode.getAttributeValue("isSlideSet").equals("Y")) {
		          label.append(" - ");
		          label.append(itemNode.getAttributeValue("slideDesign"));
		        }
		      }
		    }
		    itemNode.setAttribute("label", label.toString());

		    // Set the next gen request label to the concatenation of sample types and flow cell types
		    RequestCategory requestCategory = dh.getRequestCategoryObject(requestNode.getAttributeValue("codeRequestCategory"));
		    if (requestCategory.isNextGenSeqRequestCategory()) {
		      StringBuffer buf = new StringBuffer();
		      for (Iterator i = requestNumberSequencingCyclesAllowedMap.keySet().iterator(); i.hasNext();) {
		        buf.append(i.next());
		        if (i.hasNext()) {
		          buf.append(", ");
		        } else {
		          buf.append(" - ");
		        }
		      }
		      for (Iterator i = requestSampleTypeMap.keySet().iterator(); i.hasNext();) {
		        buf.append(i.next());
		        if (i.hasNext()) {
		          buf.append(", ");
		        }
		      }

		      String experimentNameLabel = requestNode.getAttributeValue("name");
		      if (!experimentNameLabel.equals("")) {
		        experimentNameLabel = " - " + experimentNameLabel;
		      }
		      String requestLabel = requestNode.getAttributeValue("number") + experimentNameLabel + " - " + requestNode.getAttributeValue("createDateDisplay");
		      requestNode.setAttribute("label", requestLabel + " - " + buf.toString());
		      itemNode.setAttribute("type", "SequenceLane");
		      itemNode.setAttribute("idSequenceLane", ((Integer)row[23]).toString());

		      SequenceLane sl = (SequenceLane) sess.get(SequenceLane.class, (Integer)row[23]);
		      Integer id = null;
		      if(sl.getIdFlowCellChannel() != null) {
		        id = sl.getIdFlowCellChannel();
		      }
		      itemNode.setAttribute("idFlowCellChannel", id == null ? "" : id.toString());

		    } else {
		      itemNode.setAttribute("type", "Hybridization");
		      itemNode.setAttribute("idHybridization", ((Integer)row[23]).toString());
		      itemNode.setAttribute("slideDesignName", row[24] == null ? ""  : (String)row[24]);
		    }

		    requestNode.addContent(itemNode);

	  } else if (row.length == 29) {
		  // Adding a sample
		  itemNode = new Element("Item");
		  itemNode.setAttribute("itemNumber",               row[14] == null ? ""  : (String) row[14]);
		  itemNode.setAttribute("idRequest",				row[1] == null ? "" : ((Integer) row[1]).toString());
		  itemNode.setAttribute("experimentName",			row[25] == null ? "" : (String) row[25]);
		  itemNode.setAttribute("idSample", 				row[28] == null ? "" : ((Integer) row[28]).toString());
		  itemNode.setAttribute("name", 					row[15] == null ? "" : (String) row[15]);
		  itemNode.setAttribute("sampleNumber",				row[14] == null ? "" : (String) row[14]);

		  StringBuffer label = new StringBuffer(itemNode.getAttributeValue("itemNumber"));
		  label.append(" - ");
		  label.append(itemNode.getAttributeValue("name"));
		  itemNode.setAttribute("label", label.toString());

		  itemNode.setAttribute("type", "Sample");

		  requestNode.addContent(itemNode);

	  }

  }

  public static class  HybLaneComparator implements Comparator, Serializable {
    public int compare(Object o1, Object o2) {
      String key1 = (String)o1;
      String key2 = (String)o2;



      String[] tokens1 = key1.split(KEY_DELIM);
      String[] tokens2 = key2.split(KEY_DELIM);

      String proj1         = tokens1[0];
      String yr1           = tokens1[1];
      String date1         = tokens1[2];
      String reqNumber1    = tokens1[3];
      String hybNumber1    = tokens1[4];


      String proj2         = tokens2[0];
      String yr2           = tokens2[1];
      String date2         = tokens2[2];
      String reqNumber2    = tokens2[3];
      String hybNumber2    = tokens2[4];


      String itemNumber1 = null;
      String seq1 = null;

      String splitLetter = "";

      if (hybNumber1.indexOf(PropertyDictionaryHelper.getInstance(null).getProperty(PropertyDictionary.SEQ_LANE_LETTER)) >= 0) {
        splitLetter = PropertyDictionaryHelper.getInstance(null).getProperty(PropertyDictionary.SEQ_LANE_LETTER);
      } else if (hybNumber1.indexOf("X") >= 0) {
        splitLetter = "X";
      } else if (hybNumber1.indexOf("L") >= 0) {
          splitLetter = "L";
      } else if (hybNumber1.indexOf("E") >= 0) {
          splitLetter = "E";
      }
      String[] hybNumberTokens1 = hybNumber1.split(splitLetter);
      itemNumber1 = hybNumberTokens1[hybNumberTokens1.length - 1];

      if (splitLetter.equals(PropertyDictionaryHelper.getInstance(null).getProperty(PropertyDictionary.SEQ_LANE_LETTER))) {
        String[] numberTokens  = itemNumber1.split(PropertyDictionaryHelper.getInstance(null).getProperty(PropertyDictionary.SEQ_LANE_NUMBER_SEPARATOR));
        itemNumber1            = numberTokens[0];
        seq1                   = numberTokens[1];
      } else {
        seq1 = "0";
      }


      String itemNumber2 = null;
      String seq2 = null;
      splitLetter = "";
        if (hybNumber2.indexOf(PropertyDictionaryHelper.getInstance(null).getProperty(PropertyDictionary.SEQ_LANE_LETTER)) >= 0) {
            splitLetter = PropertyDictionaryHelper.getInstance(null).getProperty(PropertyDictionary.SEQ_LANE_LETTER);
        } else if (hybNumber2.indexOf("X") >= 0) {
            splitLetter = "X";
        } else if (hybNumber2.indexOf("L") >= 0) {
            splitLetter = "L";
        } else if (hybNumber2.indexOf("E") >= 0) {
            splitLetter = "E";
        }

      String[] hybNumberTokens2 = hybNumber2.split(splitLetter);
      itemNumber2 = hybNumberTokens2[hybNumberTokens2.length - 1];
      if (splitLetter.equals(PropertyDictionaryHelper.getInstance(null).getProperty(PropertyDictionary.SEQ_LANE_LETTER))) {
        String[] numberTokens  = itemNumber2.split(PropertyDictionaryHelper.getInstance(null).getProperty(PropertyDictionary.SEQ_LANE_NUMBER_SEPARATOR));
        itemNumber2            = numberTokens[0];
        seq2                   = numberTokens[1];
      } else {
        seq2 = "0";
      }



      if (proj1.equals(proj2)) {
        if (date1.equals(date2)) {
          if (reqNumber1.equals(reqNumber2)) {
            if (itemNumber1.equals(itemNumber2)) {
              return seq1.compareTo(seq2);
            } else {
              return itemNumber1.compareTo(itemNumber2);
            }
          } else {
            return reqNumber2.compareTo(reqNumber1);
          }
        } else {
          return date2.compareTo(date1);
        }
      } else {
        return proj1.compareTo(proj2);
      }



    }
  }


}
