package hci.gnomex.controller;

import hci.dictionary.utility.DictionaryManager;
import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.Lab;
import hci.gnomex.model.Property;
import hci.gnomex.model.Sample;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.*;
import hci.report.constants.ReportFormats;
import hci.report.model.Column;
import hci.report.model.ReportRow;
import hci.report.model.ReportTray;
import hci.report.utility.ReportCommand;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;

import javax.json.Json;
import javax.json.JsonReader;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.io.StringReader;
import java.lang.reflect.Method;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.*;

public class DownloadSampleSheet extends ReportCommand implements Serializable {
  
  private static Logger LOG = Logger.getLogger(DownloadSampleSheet.class);
  
  
  private SecurityAdvisor               secAdvisor;
  private String                        today;
  private SampleSheetColumnNamesParser  parser = null;
  private RequestParser                 requestParser = null;
  private String                        labName = "";
  protected String errorDetails = "";

  private boolean usingJSON = false;

  public void validate() {
  }
  
  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
    secAdvisor = (SecurityAdvisor)session.getAttribute(SecurityAdvisor.SECURITY_ADVISOR_SESSION_KEY);
    if (secAdvisor == null) {
      this.addInvalidField("secAdvisor", "A security advisor must be created before this command can be executed.");
    }
    
    String columnString = request.getParameter("names");
    StringReader reader = new StringReader(columnString);
    try {
      SAXBuilder sax = new SAXBuilder();
      Document doc = sax.build(reader);
      parser = new SampleSheetColumnNamesParser(doc);
    } catch (JDOMException je ) {
      LOG.error( "Cannot parse names", je );
      this.addInvalidField( "names", "Invalid sample name xml");
      this.errorDetails = Util.GNLOG(LOG,"1Cannot parse names", je);
    }

    if (request.getParameter("requestJSONString") != null && !request.getParameter("requestJSONString").equals("")) {
      this.usingJSON = true;
    }

    if (!this.usingJSON) {
      String       requestXMLString = request.getParameter("requestXMLString");

      System.out.println ("[downloadsamplesheet] requestXMLString: " + requestXMLString);
      StringReader requestReader    = new StringReader(requestXMLString);
      try {
        SAXBuilder sax = new SAXBuilder();
        Document   doc = sax.build(requestReader);
        requestParser = new RequestParser(doc, secAdvisor, true);
      }
      catch (JDOMException je) {
        this.addInvalidField("requestXMLString", "Invalid request xml");
        this.errorDetails = Util.GNLOG(LOG, "2Cannot parse requestXMLString", je);
      }
    } else {
      try (JsonReader jsonReader = Json.createReader(new StringReader(request.getParameter("requestJSONString")))) {
//        String rjstring = request.getParameter("requestJSONString");
//        System.out.println ("[downloadsamplesheet] rjstring: \n" + rjstring);
        requestParser = new RequestParser(jsonReader, this.secAdvisor, true);
      } catch (Exception e) {
        this.addInvalidField( "requestJSONString", "Invalid request json");
        this.errorDetails = Util.GNLOG(LOG,"3Cannot parse requestJSONString", e);
      }
    }

    today = new SimpleDateFormat("yyyy-MM-dd").format(System.currentTimeMillis());
  }

  @SuppressWarnings("unchecked")
  public Command execute() throws RollBackCommandException {
    
    this.SUCCESS_JSP_HTML = "/report.jsp";
    this.SUCCESS_JSP_CSV = "/report_csv.jsp";
    this.SUCCESS_JSP_PDF = "/report_pdf.jsp";
    this.SUCCESS_JSP_XLS = "/report_xls.jsp";
    this.SUCCESS_JSP_TSV = "/report_tsv.jsp";
    this.ERROR_JSP = "/message.jsp";
    
    
    try {
         
      Session sess = secAdvisor.getReadOnlyHibernateSession(this.getUsername());
      DictionaryHelper dh = DictionaryHelper.getInstance(sess);

      parser.parse(sess);
      requestParser.parse(sess);
      if(requestParser.getRequest().getIdLab() != null && !requestParser.getRequest().getIdLab().equals("")){
        Lab l = (Lab)sess.get(Lab.class, requestParser.getRequest().getIdLab());
        labName = l.getName();
      }
      createReportTray();
      
      if (this.isValid()) {
        SimpleDateFormat dateFormat = new SimpleDateFormat();
        if (requestParser.getSampleIds().size() == 0) {
          ReportRow reportRow = makeReportRow(new Sample(), "", sess);
          tray.addRow(reportRow);
        } else {
          for(Iterator i = requestParser.getSampleIds().iterator(); i.hasNext();) {
            String idSampleString = (String)i.next();
            Sample sample = (Sample)requestParser.getSampleMap().get(idSampleString);
            ReportRow reportRow = makeReportRow(sample, idSampleString, sess);
            tray.addRow(reportRow);
          }
        }
      }
      
      if (isValid()) {
        this.setSuccessJsp(this, tray.getFormat());
      } else {
        setResponsePage(this.ERROR_JSP);
      }
    
    } catch (Exception e) {
      LOG.error("An exception has occurred in DownloadSampleSheet ", e);
      this.errorDetails = Util.GNLOG(LOG,"4An exception has occurred in DownloadSampleSheet ", e);
    
      throw new RollBackCommandException(e.getMessage());
    } finally {
      try {
        secAdvisor.closeReadOnlyHibernateSession();    
      } catch(Exception e) {
      }
    }
    
    return this;
  }
  
  private void createReportTray() {
    String title = "GNomEx Sample Sheet";
    String fileName = "";
    
    if(requestParser.getRequest().getNumber() != null){
      fileName = requestParser.getRequest().getNumber() + "_" + today;
    } else{
      fileName = labName + "_new_" + today;
      fileName = fileName.replace(",", "").replace(" ","-");
    }
    
    // set up the ReportTray
    tray = new ReportTray();
    tray.setReportDate(new java.util.Date(System.currentTimeMillis()));
    tray.setReportTitle(title);
    tray.setReportDescription(title);
    tray.setFileName(fileName);
    tray.setFormat(ReportFormats.TSV);
    
    Set columns = new TreeSet();
    Integer columnCount = 0;
    
    for(String[] names : parser.getColumnList()) {
      String propertyName = names[SampleSheetColumnNamesParser.PROPERTY_NAME_IDX];
      String gridLabel = names[SampleSheetColumnNamesParser.GRID_LABEL_IDX];
      columns.add(makeReportColumn(propertyName, gridLabel, columnCount));
      columnCount++;
    }

    tray.setColumns(columns);
  }
  
  private Column makeReportColumn(String name, String caption, int colNumber) {
    Column reportCol = new Column();
    reportCol.setName(name);
    reportCol.setCaption(caption);
    reportCol.setDisplayOrder(Integer.valueOf(colNumber));
    return reportCol;
  }

  private ReportRow makeReportRow(Sample sample, String idSampleString, Session sess) {
    ReportRow reportRow = new ReportRow();
    List values = new ArrayList();
    for(String[] names : parser.getColumnList()) {
      String propertyName = names[SampleSheetColumnNamesParser.PROPERTY_NAME_IDX];
      String gridLabel = names[SampleSheetColumnNamesParser.GRID_LABEL_IDX];
      String value = getSpecialValue(sample, propertyName);
      
      if (value == null) {
        value = getAssayValue(sample, propertyName);
      }
      if (value == null) {
        value = getPropertyValue(idSampleString, gridLabel, sess);
      }
      if (value == null) {
        value = getValueByReflection(sample, propertyName);
      }
      if (value == null) {
        // hmmm... hopefully won't happen.  If it does we have problems.
        value = "";
      }
      
      values.add(value);
    }
    
    reportRow.setValues(values);
    return reportRow;
  }
  
  private String getSpecialValue(Sample sample, String column) {
    String retVal = null;
    if (column.equals("idSampleType")) {
      retVal = getDictionaryValue(sample.getIdSampleType(), "hci.gnomex.model.SampleType");
    } else if (column.equals("idOrganism")) {
      retVal = getDictionaryValue(sample.getIdOrganism(), "hci.gnomex.model.OrganismLite");
    } else if (column.equals("idOligoBarcode")) {
      retVal = getDictionaryValue(sample.getIdOligoBarcode(), "hci.gnomex.model.OligoBarcode");
    } else if (column.equals("idOligoBarcodeB")) {
      retVal = getDictionaryValue(sample.getIdOligoBarcodeB(), "hci.gnomex.model.OligoBarcode");
    } else if (column.equals("idSampleSource")) {
      retVal = getDictionaryValue(sample.getIdSampleSource(), "hci.gnomex.model.SampleSource");
    } else if (column.equals("idSeqLibProtocol")) {
      retVal = getDictionaryValue(sample.getIdSeqLibProtocol(), "hci.gnomex.model.SeqLibProtocol");
    } else if (column.equals("codeBioanalyzerChipType")) {
      retVal = getDictionaryValue(sample.getCodeBioanalyzerChipType(), "hci.gnomex.model.BioanalyzerChipType");
    }
    
    return retVal;
  }
  
  private String getAssayValue(Sample sample, String propertyName) {
    String value = null;
    if (propertyName.startsWith("hasAssay")) {
      value = "N";
      String assayName = propertyName.substring(8);
      ArrayList<String> assays = requestParser.getAssays(sample.getIdSampleString());
      for(String a : assays) {
        if (a.equals(assayName)) {
          value = "Y";
          break;
        }
      }
    } 
    
    return value;
  }
  
  private String getDictionaryValue(Integer id, String cls) {
    if (id != null) {
      return DictionaryManager.getDisplay(cls, id.toString());
    } else {
      return "";
    }
  }
  
  private String getDictionaryValue(String code, String cls) {
    if (code != null) {
      return DictionaryManager.getDisplay(cls, code);
    } else {
      return "";
    }
  }
  
  private String getPropertyValue(String idSampleString, String name, Session sess) {
    // The idSample field in the XML we receive is set to "Sample1", "Sample2" etc. for samples in new experiments
    // When converting the XML to Sample objects (in which idSample is an Integer), this id is lost
    // We need the id when retrieving annotation fields values, so it has to be explicitly passed in here
    Map sampleAnnotations = (Map)requestParser.getSampleAnnotationMap().get(idSampleString);
    if (sampleAnnotations != null) {
      for(Object key : sampleAnnotations.keySet()) {
        Integer idProperty = (Integer) key;
        Property property = sess.get(Property.class, idProperty);
        if (property != null && name.equals(property.getName())) {
          return (String) sampleAnnotations.get(key);
        }
      }
    }
    
    return null;
  }
  
  private String getValueByReflection(Sample sample, String column) {
    String retVal = null;
    String methodName = "get" + column.substring(0, 1).toUpperCase() + column.substring(1);
    try {
      Method m = sample.getClass().getMethod(methodName, new Class[] {});
      Object ret = m.invoke(sample, new Object[] {});
      if (ret != null) {
        retVal = ret.toString();
      }
    } catch(Exception ex) {
    }
    
    return retVal;
  }
  
  /* (non-Javadoc)
   * @see hci.framework.control.Command#setRequestState(javax.servlet.http.HttpServletRequest)
   */
  public HttpServletWrappedRequest setRequestState(HttpServletWrappedRequest request) {
    request.setAttribute("tray", this.tray);
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
    // TODO Auto-generated method stub
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
