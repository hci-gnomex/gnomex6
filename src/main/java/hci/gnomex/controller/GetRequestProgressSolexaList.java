package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.RequestCategory;
import hci.gnomex.model.RequestProgressSolexaFilter;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.DictionaryHelper;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.*;

public class GetRequestProgressSolexaList extends GNomExCommand implements Serializable {

  private static Logger LOG = Logger.getLogger(GetRequestProgressSolexaList.class);

  private RequestProgressSolexaFilter filter;

  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    filter = new RequestProgressSolexaFilter();
    HashMap errors = this.loadDetailObject(request, filter);
    this.addInvalidFields(errors);


    if (this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_ACCESS_ANY_OBJECT) && !filter.hasCriteria()) {
      this.addInvalidField("filterRequired", "Please enter at least one search criterion");
    }
  }

  public Command execute() throws RollBackCommandException {

    try {


      Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());
      DictionaryHelper dictionaryHelper = DictionaryHelper.getInstance(sess);

      StringBuffer buf = filter.getSolexaQuery(this.getSecAdvisor(), dictionaryHelper);
      LOG.info(buf.toString());
      List rows1 = (List)sess.createQuery(buf.toString()).list();
      TreeMap rowMap = new TreeMap(new SampleComparator());
      for(Iterator i = rows1.iterator(); i.hasNext();) {
        Object[] row = (Object[])i.next();

        String requestNumber = (String)row[2];
        String sampleNumber     = row[4] == null || row[3].equals("") ? "" : (String)row[4];
        String key = requestNumber + "," + sampleNumber;

        rowMap.put(key, row);
      }


      boolean alt = false;
      String prevRequestNumber = "";

      // Get sequenced lane count by sample
      buf = filter.getSolexaLaneSeqStatusQuery(this.getSecAdvisor(), dictionaryHelper);
      LOG.info(buf.toString());
      List sequencedLaneRows = (List)sess.createQuery(buf.toString()).list();
      HashMap laneSeqStatusMap = new HashMap();
      for(Iterator i = sequencedLaneRows.iterator(); i.hasNext();) {
        Object[] row = (Object[])i.next();

        String sampleNumber          = (String)row[0];
        java.sql.Date lastCycleDate  = (java.sql.Date)row[1];
        Integer laneCount            = (int) (long)row[2];

        laneSeqStatusMap.put(sampleNumber, laneCount);
      }

      // Get processed (gone through pipeline) lane count by sample
      buf = filter.getSolexaLanePipelineStatusQuery(this.getSecAdvisor());
      LOG.info(buf.toString());
      List processedLanes = (List)sess.createQuery(buf.toString()).list();
      HashMap lanePipelineStatusMap = new HashMap();
      for(Iterator i = processedLanes.iterator(); i.hasNext();) {
        Object[] row = (Object[])i.next();

        String sampleNumber          = (String)row[0];
        java.sql.Date pipelineDate   = (java.sql.Date)row[1];
        Integer laneCount            = (int) (long)row[2];

        lanePipelineStatusMap.put(sampleNumber, laneCount);
      }

      // Get requested lane count by sample
      buf = filter.getSolexaLaneStatusQuery(this.getSecAdvisor(), dictionaryHelper);
      LOG.info(buf.toString());
      List laneRows = (List)sess.createQuery(buf.toString()).list();
      HashMap laneStatusMap = new HashMap();
      for(Iterator i = laneRows.iterator(); i.hasNext();) {
        Object[] row = (Object[])i.next();

        String sampleNumber          = (String)row[0];
        Integer laneCount            = (int) (long)row[1];

        laneStatusMap.put(sampleNumber, laneCount);
      }

      Document doc = new Document(new Element("RequestProgressList"));
      for(Iterator i = rowMap.keySet().iterator(); i.hasNext();) {
        String key = (String)i.next();
        Object[] row = (Object[])rowMap.get(key);

        String requestNumber = (String)row[2];
        if (!requestNumber.equals(prevRequestNumber)) {
          alt = !alt;
        }

        String codeRequestCategory = row[12] == null ? "" : (String)row[12];
        RequestCategory requestCategory = dictionaryHelper.getRequestCategoryObject(codeRequestCategory);


        Element n = new Element("RequestProgress");
        n.setAttribute("key", key);
        n.setAttribute("isSelected",      "N");
        n.setAttribute("altColor",        Boolean.toString(alt));
        n.setAttribute("showRequestNumber", !requestNumber.equals(prevRequestNumber) ? "Y" : "N");
        n.setAttribute("idRequest",       row[0].toString());
        n.setAttribute("createDate",      this.formatDate((java.util.Date)row[1]));
        n.setAttribute("requestNumber",  (String)row[2]);
        n.setAttribute("idAppUser",       row[3] == null ? "" : ((Integer)row[3]).toString());
        n.setAttribute("sampleNumber",    row[4] == null ? "" : (String)row[4]);
        n.setAttribute("sampleName",      row[5] == null ? "" :  (String)row[5]);
        n.setAttribute("qualDate",        row[6] == null || row[6].equals("")? "" : this.formatDate((java.sql.Date)row[6]));
        n.setAttribute("seqPrepDate",     row[7] == null || row[7].equals("")? "" : this.formatDate((java.sql.Date)row[7]));
        n.setAttribute("seqPrepByCore",   row[8] == null ? "N" :  (String)row[8]);
        n.setAttribute("idLab",           row[9] == null ? "" : ((Integer)row[9]).toString());
        n.setAttribute("ownerFirstName",  row[10] == null ? "" : (String)row[10]);
        n.setAttribute("ownerLastName",   row[11] == null ? "" : (String)row[11]);
        n.setAttribute("codeRequestCategory", codeRequestCategory);
        n.setAttribute("icon",            requestCategory != null && requestCategory.getIcon() != null ? requestCategory.getIcon() : "");
        n.setAttribute("type",            requestCategory != null && requestCategory.getType() != null ? requestCategory.getType() : "");

        String sampleNumber = (String)row[4];
        Integer sequencedLaneCount = (Integer)laneSeqStatusMap.get(sampleNumber);
        if (sequencedLaneCount == null) {
          sequencedLaneCount = 0;
        }
        n.setAttribute("numberLanesSequenced", sequencedLaneCount != null ? sequencedLaneCount.toString() : "0");

        Integer processedLaneCount = (Integer)lanePipelineStatusMap.get(sampleNumber);
        if (processedLaneCount == null) {
          processedLaneCount = 0;
        }
        n.setAttribute("numberLanesProcessed", processedLaneCount != null ? processedLaneCount.toString() : "0");


        Integer laneCount = (Integer)laneStatusMap.get(sampleNumber);
        n.setAttribute("numberLanes", laneCount != null ? laneCount.toString() : "0");
        if (laneCount == null) {
          laneCount = 0;
        }




        String seqStatus = "";
        if (laneCount.intValue() > 0) {
          if (laneCount.intValue() == processedLaneCount.intValue()) {
            seqStatus = "Done - All lanes sequenced.";
          } else if (laneCount.intValue() == sequencedLaneCount.intValue()) {
            seqStatus = "In progress - All lanes sequenced, ready for pipeline.";
          } else if (sequencedLaneCount.intValue() > 0
              && laneCount.intValue() > 0
              && laneCount.intValue() > sequencedLaneCount.intValue()) {
            seqStatus = "In progress - " + sequencedLaneCount + " lanes sequenced";
          } else if (sequencedLaneCount.intValue() == 0) {
            seqStatus = "Pending - No lanes sequenced.";
          }
        } else {
          seqStatus = "(n/a - No lanes requested)";
        }
        n.setAttribute("seqStatus", seqStatus);

        doc.getRootElement().addContent(n);

        prevRequestNumber = requestNumber;

      }

      XMLOutputter out = new org.jdom.output.XMLOutputter();
      this.xmlResult = out.outputString(doc);

      setResponsePage(this.SUCCESS_JSP);
    } catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetRequestProgressList ", e);
      throw new RollBackCommandException(e.getMessage());
    }

    return this;
  }

  public static class  SampleComparator implements Comparator, Serializable {
    public int compare(Object o1, Object o2) {
      String key1 = (String)o1;
      String key2 = (String)o2;



      String[] tokens1 = key1.split(",");
      String[] tokens2 = key2.split(",");

      String reqNumber1       = tokens1[0];
      String itemNumber1      = tokens1[1];

      String reqNumber2       = tokens2[0];
      String itemNumber2      = tokens2[1];

      String number1 = null;

      String[] itemNumberTokens1 = itemNumber1.split("X");
      number1 = itemNumberTokens1[itemNumberTokens1.length - 1];


      String number2 = null;


      String[] itemNumberTokens2 = itemNumber2.split("X");
      number2 = itemNumberTokens2[itemNumberTokens2.length - 1];



      if (reqNumber1.equals(reqNumber2)) {
        return Integer.valueOf(number1).compareTo(Integer.valueOf(number2));
      } else {
        return reqNumber1.compareTo(reqNumber2);
      }

    }
  }


}
