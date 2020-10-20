package hci.gnomex.utility;

import hci.dictionary.utility.DictionaryManager;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.*;
import hci.gnomex.security.SecurityAdvisor;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;

import org.jdom.Element;


public class RequestHTMLFormatter {

  private SecurityAdvisor  secAdvisor;
  private Request          request;
  private AppUser          appUser;
  private BillingAccount   billingAccount;
  private DictionaryHelper dictionaryHelper;
  private boolean         includeMicroarrayCoreNotes = true;
  private boolean         dnaSamples = false;
  private Map<String, Assay> assays = null; // this is list of all assays for request if fragment analysis request.

  public RequestHTMLFormatter(SecurityAdvisor secAdvisor, Request request, AppUser appUser, BillingAccount billingAccount, DictionaryHelper dictionaryHelper) {
    this.secAdvisor = secAdvisor;
    this.request = request;
    this.appUser = appUser;
    this.billingAccount = billingAccount;
    this.dictionaryHelper = dictionaryHelper;

    // Figure out if all samples are DNA samples.  This will affect what
    // sample quality columns show
    dnaSamples = false;
    int dnaSampleCount = 0;
    for(Iterator i = request.getSamples().iterator(); i.hasNext();) {
      Sample sample = (Sample)i.next();
      if (this.isDNASampleType(sample)) {
        dnaSampleCount++;
      }
    }
    if (dnaSampleCount == request.getSamples().size()) {
      dnaSamples = true;
    }

    if (RequestCategory.isMolecularDiagnoticsRequestCategory(request.getCodeRequestCategory())) {
      includeMicroarrayCoreNotes = false;
    }

  }

  public Element makeIntroNote(String note) {
    Element table = new Element("TABLE");
    Element row = new Element("TR");
    Element cell = new Element("TD");
    cell.setAttribute("CLASS", "noborder");
    cell.setAttribute("ALIGN", "LEFT");
    cell.addContent(note);
    row.addContent(cell);
    table.addContent(row);

    return table;
  }

  public Element makeRequestCategoryImage(String appURL) {
    Element img = new Element("img");

    RequestCategory requestCategory = dictionaryHelper.getRequestCategoryObject(request.getCodeRequestCategory());
    String imageName = requestCategory.getIcon();
    if (imageName == null || imageName.equals("")) {
      imageName = "flask.png";
    } else if (imageName.startsWith("assets/")) {
      // Get rid of the leading assets directory.  We serve images for the html report
      // from the webapp root /images directory.
      imageName = imageName.substring(7);
    }

    img.setAttribute("src", (appURL != null ? appURL + "/images/" : "images/") + imageName);

    return img;
  }
  // Header details
  public Element makeRequestTable() {


    String userName = "";
    String phone = "";
    String email = "";
    if (appUser != null) {
      userName = (appUser.getFirstName() != null ? appUser.getFirstName() : "") + " " + (appUser.getLastName() != null ? appUser.getLastName() : "");
      phone    = appUser.getPhone();
      email    = appUser.getEmail();
    }
    String accountName = "";
    if (billingAccount != null) {
      accountName = billingAccount.getAccountName();
    }
    String accountNumber = "";
    if (billingAccount != null) {
      if (!this.secAdvisor.isGuest()) {
        // Don't show the account number if the user logged in as guest
        accountNumber = billingAccount.getAccountNumber();
        accountNumber = billingAccount.getAccountNumber();
      }
    }
    String labName = "";
    if (request.getLab() != null) {
      labName = request.getLab().getName(false, false);
    }

    Element table = new Element("TABLE");
    table.setAttribute("CELLPADDING", "5");
    //		"Requester" userName	| "Lab" labName
    table.addContent(makeRow("Requester",   userName,
            "Lab",         labName));
    //		"Phone" phone	|	"Date" createDate
    table.addContent(makeRow("Phone",        phone,
            "Date", request.formatDate(request.getCreateDate())
    ));

    if (request.getIsExternal() == null || request.getIsExternal().equals("N")) {
      //	"Email" email	|	"Account"	accountName
      table.addContent(makeRow("Email",        email,
              "Account",     accountName));
      // "Modified" modifiedDate	|	"" accountNumber
      table.addContent(makeRow(
              (request.getLastModifyDate() != null ? "Modified" : "&nbsp;"),  (request.getLastModifyDate() != null ? request.formatDate(request.getLastModifyDate()): "&nbsp;"),
              "", accountNumber
      ));

    } else {
      // "Email"	email	| ""	"" (external so no account name)
      table.addContent(makeRow("Email",        email,
              "&nbsp;",     "&nbsp;"
      ));
      // "Modified"	modifiedDate		|	"" "" (external so no account number)
      table.addContent(makeRow(
              (request.getLastModifyDate() != null ? "Modified" : "&nbsp;"),  (request.getLastModifyDate() != null ? request.formatDate(request.getLastModifyDate()): "&nbsp;"),
              "", "&nbsp;"));

    }


    return table;
  }

  public void addSampleTable(Element parentNode, Set samples) {
    addSampleTable(parentNode, samples, null);
  }

  public void addSampleTable(Element parentNode, Set samples, String captionStyle) {

    boolean showMultiplexGroup = false;
    for(Iterator i = samples.iterator(); i.hasNext();) {
      Sample s = (Sample)i.next();
      if (s.getMultiplexGroupNumber() != null) {
        showMultiplexGroup = true;
        break;
      }
    }

    // Show 'samples' header
    Element sampleHeader = new Element("H5");
    sampleHeader.addContent("Samples (" + samples.size() + ")");
    parentNode.addContent(sampleHeader);

    Element table = new Element("TABLE");
    table.setAttribute("CLASS", "grid");
    table.setAttribute("CELLPADDING", "5");
    table.setAttribute("CELLSPACING", "5");


    Element rowh = new Element("TR");
    table.addContent(rowh);
    Integer rowSpan = new Integer(1);
    if (includeMicroarrayCoreNotes) {
      rowSpan = new Integer(2);
    }

    boolean showSeqLibProtocol = false;
    boolean showBarcodeTag = false;
    boolean showCcNumber = false;
    String barcodeHeader = "Index Tag Sequence";
    for(Iterator i = samples.iterator(); i.hasNext();) {
      Sample s = (Sample)i.next();
      if (s.getSeqPrepByCore() != null && s.getSeqPrepByCore().equalsIgnoreCase("N")) {
        showSeqLibProtocol = true;
        barcodeHeader = "Index Tag Sequence";
      }
      if (s.getIdOligoBarcode() != null || (s.getBarcodeSequence() != null && !s.getBarcodeSequence().trim().equals(""))) {
        showBarcodeTag = true;
      }
    	/*if (  RequestCategory.isMolecularDiagnoticsRequestCategory(request.getCodeRequestCategory()) && 
    	     (s.getCcNumber() != null && !s.getCcNumber().equals("")) ) {*/
      if (s.getCcNumber() != null && !s.getCcNumber().equals("")) {
        showCcNumber = true;
      }
    }

    if (showMultiplexGroup) {
      this.addHeaderCell(rowh, "Multiplex Group", rowSpan, new Integer(1), "left");
    }
    this.addHeaderCell(rowh, "Sample #", rowSpan, new Integer(1), showMultiplexGroup ? "normal" : "left");
    if (request.getCodeRequestCategory() != null && request.getCodeRequestCategory().equals(RequestCategory.CAPILLARY_SEQUENCING_REQUEST_CATEGORY)) {
      this.addHeaderCell(rowh, "Container", rowSpan, 1);
      if (request.isCapSeqPlate()) {
        this.addHeaderCell(rowh, "Plate", rowSpan, 1);
        this.addHeaderCell(rowh, "Well",rowSpan, 1);
      }
    }
    if (request.getCodeRequestCategory() != null && request.getCodeRequestCategory().equals(RequestCategory.ISCAN_REQUEST_CATEGORY)) {
      this.addHeaderCell(rowh, "Plate", rowSpan, 1);
      this.addHeaderCell(rowh, "Well",rowSpan, 1);
    }
    if (request.getCodeRequestCategory() != null &&
            RequestCategory.isMolecularDiagnoticsRequestCategory(request.getCodeRequestCategory()) &&
            !request.getCodeRequestCategory().equals(RequestCategory.CLINICAL_SEQUENOM_REQUEST_CATEGORY) &&
            !request.getCodeRequestCategory().equals(RequestCategory.ISOLATION_REQUEST_CATEGORY)) {
      this.addHeaderCell(rowh, "Container", rowSpan, 1);
      if (request.isSequenomPlate()) {
        this.addHeaderCell(rowh, "Plate", rowSpan, 1);
        this.addHeaderCell(rowh, "Well",rowSpan, 1);
      }
    }
    if (showCcNumber) {
      this.addHeaderCell( rowh, "CC Number" );
    }
    if (request.getCodeRequestCategory() != null &&
            (request.getCodeRequestCategory().equals(RequestCategory.MITOCHONDRIAL_DLOOP_SEQ_REQUEST_CATEGORY)
                    || request.getCodeRequestCategory().equals(RequestCategory.FRAGMENT_ANALYSIS_REQUEST_CATEGORY))) {
      this.addHeaderCell(rowh, "Well", rowSpan, 1);
    }
    if ( !request.getCodeRequestCategory().equals(RequestCategory.CLINICAL_SEQUENOM_REQUEST_CATEGORY) ) {
      this.addHeaderCell(rowh, "Sample Name", rowSpan, new Integer(1));
    }
    if (!RequestCategory.isDNASeqCoreRequestCategory(request.getCodeRequestCategory())) {
      if (!RequestCategory.isMolecularDiagnoticsRequestCategory(request.getCodeRequestCategory()) ||
              RequestCategory.isSequenomType( request.getCodeRequestCategory() ) ||
              request.getCodeRequestCategory().equals(RequestCategory.CLINICAL_SEQUENOM_REQUEST_CATEGORY)) {
        this.addHeaderCell(rowh, "Sample Type", rowSpan, new Integer(1), new Integer(200));
      }
      if (!RequestCategory.isMolecularDiagnoticsRequestCategory(request.getCodeRequestCategory()) || request.getCodeRequestCategory().equals(RequestCategory.CLINICAL_SEQUENOM_REQUEST_CATEGORY)) {
        this.addHeaderCell(rowh, "Conc.", rowSpan, new Integer(1));
        this.addHeaderCell(rowh, "Nucl. acid Extraction Method", rowSpan, new Integer(1), new Integer(300));
      }
    } else {
      if (request.getCodeRequestCategory() != null &&
              (request.getCodeRequestCategory().equals(RequestCategory.CAPILLARY_SEQUENCING_REQUEST_CATEGORY) )) {
        this.addHeaderCell(rowh, "Sample Type", rowSpan, new Integer(1));
      }
      if (request.getCodeRequestCategory() != null && request.getCodeRequestCategory().equals(RequestCategory.FRAGMENT_ANALYSIS_REQUEST_CATEGORY)) {
        // Add in assay headers.
        this.assays = request.getAssays();
        for(Iterator i=assays.keySet().iterator(); i.hasNext();) {
          this.addHeaderCell(rowh, (String)i.next(), rowSpan, new Integer(1));
        }
      }
      if (request.getCodeRequestCategory() != null && request.getCodeRequestCategory().equals(RequestCategory.CHERRY_PICKING_REQUEST_CATEGORY)) {
        this.addHeaderCell(rowh, "Source Plate", rowSpan, new Integer(1));
        this.addHeaderCell(rowh, "Source Well", rowSpan, new Integer(1));
        this.addHeaderCell(rowh, "Destination Well", rowSpan, new Integer(1));
      }
    }
    if (request.getCodeRequestCategory() != null && RequestCategory.isIlluminaRequestCategory(request.getCodeRequestCategory())) {
      if (showBarcodeTag) {

        this.addHeaderCell(rowh, barcodeHeader, rowSpan, new Integer(1));
      }
      if (showSeqLibProtocol) {
        this.addHeaderCell(rowh, "Seq Lib Protocol", rowSpan, new Integer(1));
      }
    }
    if (request.getCodeRequestCategory() != null && request.getCodeRequestCategory().equals(RequestCategory.QUALITY_CONTROL_REQUEST_CATEGORY)) {

      this.addHeaderCell(rowh, "Chip Type",rowSpan, new Integer(1));
    }
    if (includeMicroarrayCoreNotes ) {
      this.addHeaderCell(rowh, "----------Quality-----------", new Integer(1), new Integer(4),
              "colgroup");
      if (request.getCodeRequestCategory() != null && RequestCategory.isIlluminaRequestCategory(request.getCodeRequestCategory())) {
        this.addHeaderCell(rowh, "---Lib Prep---", new Integer(1), new Integer(2), "colgroup");
      }

      rowh = new Element("TR");
      table.addContent(rowh);
      this.addHeaderCell(rowh, "Conc. ng/uL");
      this.addHeaderCell(rowh, "260/ 230");
      this.addHeaderCell(rowh, "QC meth");
      if (dnaSamples) {
        this.addHeaderCell(rowh, "Frag size");
      } else {
        this.addHeaderCell(rowh, "RIN#");
      }


      if (request.getCodeRequestCategory() != null && RequestCategory.isIlluminaRequestCategory(request.getCodeRequestCategory())) {
        this.addHeaderCell(rowh, "Start templ. qty");
        this.addHeaderCell(rowh, "Gel size rng");
      }


    }

    Integer prevMultiplexGroup = Integer.valueOf(-1);
    Object[] sampleList = samples.toArray();
    for(int x = 0; x < samples.size(); x++) {
      Sample sample = (Sample)sampleList[x];

      Element row = new Element("TR");
      table.addContent(row);


      String concentration = "";
      if (sample.getConcentration() != null) {
        concentration = sample.getConcentration().toString();
        if (sample.getCodeConcentrationUnit() != null && !sample.getCodeConcentrationUnit().equals("")) {
          concentration += " " + sample.getCodeConcentrationUnit();
        }
      }


      String qualFragmentSizeRange = "&nbsp;";
      if (sample.getQualFragmentSizeFrom() != null && !sample.getQualFragmentSizeFrom().equals("")) {
        qualFragmentSizeRange = sample.getQualFragmentSizeFrom() + "-";
      }
      if (sample.getQualFragmentSizeTo() != null && !sample.getQualFragmentSizeTo().equals("")) {
        qualFragmentSizeRange += sample.getQualFragmentSizeTo();
      } else {
        qualFragmentSizeRange += "&nbsp;";
      }

      Integer multiplexGroup = sample.getMultiplexGroupNumber() == null ? Integer.valueOf(-99) : sample.getMultiplexGroupNumber();
      if (showMultiplexGroup) {
        if (!prevMultiplexGroup.equals(multiplexGroup)) {
          this.addBlankCell(row, multiplexGroup.toString());
        } else {
          Sample nextSample = null;
          Integer nextMultiplexGroup = -99;
          int next = x + 1;
          if (next < samples.size()) {
            nextSample = (Sample)sampleList[next];
            nextMultiplexGroup = nextSample.getMultiplexGroupNumber() == null ? Integer.valueOf(-99) : nextSample.getMultiplexGroupNumber();
          }
          if (nextSample == null || !nextMultiplexGroup.equals(multiplexGroup)) {
            this.addBottomBlankCell(row);
          } else {
            this.addBlankCell(row);
          }
        }
      }
      this.addLeftCell(row, sample.getNumber());
      if (request.getCodeRequestCategory() != null && request.getCodeRequestCategory().equals(RequestCategory.CAPILLARY_SEQUENCING_REQUEST_CATEGORY)) {
        if (request.isCapSeqPlate()) {
          this.addCell(row, "PLATE");
          this.addCell(row, sample.getASourceWell().getPlate().getLabel());
          this.addCell(row, sample.getASourceWell().getWellName());
        } else {
          this.addCell(row, "TUBE");
        }
      }
      if (request.getCodeRequestCategory() != null && request.getCodeRequestCategory().equals(RequestCategory.ISCAN_REQUEST_CATEGORY)) {
        this.addCell(row, sample.getASourceWell().getPlate().getLabel());
        this.addCell(row, sample.getASourceWell().getWellName());
      }
      if (request.getCodeRequestCategory() != null && RequestCategory.isSequenomType( request.getCodeRequestCategory() )) {
        if (request.isSequenomPlate()) {
          this.addCell(row, "PLATE");
          this.addCell(row, sample.getASourceWell().getPlate().getLabel());
          this.addCell(row, sample.getASourceWell().getWellName());
        } else {
          this.addCell(row, "TUBE");
        }
      }

      if (showCcNumber) {
        if ( sample.getCcNumber() != null && !sample.getCcNumber().toString().equals( "" ) ) {
          String ccLinkString = "<a href=\"" +
                  dictionaryHelper.getPropertyDictionary(PropertyDictionary.GNOMEX_LINKAGE_CORE_URL) + "#ccNumber=" + sample.getCcNumber() +
                  "\">" + sample.getCcNumber() + "</a>";
          this.addCell( row, ccLinkString );
        } else {
          this.addCell( row, "" );
        }
      }
      if (request.getCodeRequestCategory() != null
              && (request.getCodeRequestCategory().equals(RequestCategory.MITOCHONDRIAL_DLOOP_SEQ_REQUEST_CATEGORY)
              || request.getCodeRequestCategory().equals(RequestCategory.FRAGMENT_ANALYSIS_REQUEST_CATEGORY))) {
        this.addCell(row, sample.getASourceWell().getWellName());
      }
      if ( !request.getCodeRequestCategory().equals(RequestCategory.CLINICAL_SEQUENOM_REQUEST_CATEGORY) ) {
        this.addCell(row, sample.getName());
      }
      if ( !request.getCodeRequestCategory().equals(RequestCategory.ISOLATION_REQUEST_CATEGORY)) {
        if (!RequestCategory.isDNASeqCoreRequestCategory(request.getCodeRequestCategory())) {
          this.addCell(row, sample.getIdSampleType() == null ? "&nbsp;"       : dictionaryHelper.getSampleType(sample));
          if (!RequestCategory.isMolecularDiagnoticsRequestCategory( request.getCodeRequestCategory())) {
            this.addCell(row, sample.getConcentration() == null ? "&nbsp;"      : concentration);
            this.addCell(row, getSamplePrepMethod(sample));
          }
        } else {
          if (request.getCodeRequestCategory() != null && request.getCodeRequestCategory().equals(RequestCategory.CAPILLARY_SEQUENCING_REQUEST_CATEGORY)) {
            this.addCell(row, sample.getIdSampleType() == null ? "&nbsp;"       : dictionaryHelper.getSampleType(sample));
          }
          if (request.getCodeRequestCategory() != null && request.getCodeRequestCategory().equals(RequestCategory.FRAGMENT_ANALYSIS_REQUEST_CATEGORY)) {
            // Add in values.
            this.assays = request.getAssays();
            for(Iterator i=assays.keySet().iterator(); i.hasNext();) {
              String assayFlag = "&nbsp;";
              if (sample.getAssays().containsKey(i.next())) {
                assayFlag = "Y";
              }
              this.addCell(row, assayFlag);
            }
          }
          if (request.getCodeRequestCategory() != null && request.getCodeRequestCategory().equals(RequestCategory.CHERRY_PICKING_REQUEST_CATEGORY)) {
            PlateWell sourceWell = sample.getASourceWell();
            this.addCell(row, sourceWell.getPlate().getLabel());
            this.addCell(row, sourceWell.getWellName());
            this.addCell(row, sample.getADestinationWell().getWellName());
          }
        }
      }
      if (request.getCodeRequestCategory() != null && RequestCategory.isIlluminaRequestCategory(request.getCodeRequestCategory())) {
        if (showBarcodeTag) {
          this.addCell(row, sample.getIdOligoBarcode() != null ? DictionaryManager.getDisplay("hci.gnomex.model.OligoBarcode", sample.getIdOligoBarcode().toString()) : (sample.getBarcodeSequence() != null && !sample.getBarcodeSequence().equals("") ? sample.getBarcodeSequence() : "&nbsp;"));
        }
        if (showSeqLibProtocol) {
          this.addCell(row, sample.getIdSeqLibProtocol() != null ? dictionaryHelper.getSeqLibProtocol(sample.getIdSeqLibProtocol()) : "&nbsp;");
        }
      }
      if (request.getCodeRequestCategory() != null &&  request.getCodeRequestCategory().equals(RequestCategory.QUALITY_CONTROL_REQUEST_CATEGORY)) {
        this.addCell(row, dictionaryHelper.getChipTypeName(sample.getCodeBioanalyzerChipType()) == null || dictionaryHelper.getChipTypeName(sample.getCodeBioanalyzerChipType()).equals("") ? "&nbsp;" :
                dictionaryHelper.getChipTypeName(sample.getCodeBioanalyzerChipType()));
      }
      if (includeMicroarrayCoreNotes) {
        this.addCell(row, sample.getQualCalcConcentration() == null ? "&nbsp;"      : sample.getQualCalcConcentration().toString());
        this.addCell(row, sample.getQual260nmTo230nmRatio() == null ? "&nbsp;"      : sample.getQual260nmTo230nmRatio().toString());

        this.addEmptyCell(row);

        if (dnaSamples) {
          this.addCell(row, qualFragmentSizeRange);

        } else {
          this.addCell(row, sample.getQualRINNumber() == null ? "&nbsp;"              : sample.getQualRINNumber().toString());

        }

      }
      if (includeMicroarrayCoreNotes ) {
        if (request.getCodeRequestCategory() != null && RequestCategory.isIlluminaRequestCategory(request.getCodeRequestCategory())) {
          if (sample.getSeqPrepByCore() == null || sample.getSeqPrepByCore().equals("N")) {
            this.addCell(row, "prepped by lab");
            this.addCell(row, "prepped by lab");
          } else {
            this.addSmallEmptyCell(row);
            this.addSmallEmptyCell(row);
          }
        }
      }

      prevMultiplexGroup =  multiplexGroup;
    }

    parentNode.addContent(table);
  }

  /*
   * Builds separate table on printable form when Covaris is used.
   */
  public void addCovarisSampleTable(Element parentNode, Set samples) {
    boolean isDNASampleType = false;
    if (samples.size() > 0) {
      Sample s = (Sample) samples.iterator().next();
      if (s.getIdSampleType() != null) {
        String sampleTypeName = dictionaryHelper.getSampleType(s
                .getIdSampleType());
        if (sampleTypeName.indexOf("DNA") >= 0) {
          isDNASampleType = true;
        }
      }
    }

    if(isDNASampleType)
    {
      Element sequenceNote = new Element("H5");
      sequenceNote.addContent("Covaris Information");
      parentNode.addContent(sequenceNote);

      Element table = new Element("TABLE");
      table.setAttribute("CLASS", "grid");
      table.setAttribute("CELLPADDING", "5");
      table.setAttribute("CELLSPACING", "5");

      Element rowh = new Element("TR");


      table.addContent(rowh);
      this.addHeaderCell(rowh, "Sample ID", new Integer(1), new Integer(1), "left");
      this.addHeaderCell(rowh, "Sample Name", new Integer(1), new Integer(1));

      this.addHeaderCell(rowh, "Covaris Vol", new Integer(1), new Integer(1));
      this.addHeaderCell(rowh, "Covaris Qty", new Integer(1), new Integer(1));



      for(Iterator i = samples.iterator(); i.hasNext();) {
        Sample sample = (Sample)i.next();

        Element row = new Element("TR");
        row.setAttribute("CLASS", "forcedRowHeight");
        table.addContent(row);

        // Sample info
        this.addLeftCell(row, sample.getNumber());
        this.addCell(row, sample.getName());

        this.addLeftCell(row, "&nbsp;&nbsp&nbsp;&nbsp&nbsp;&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp&nbsp;&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp&nbsp;&nbsp;&nbsp;&nbsp;/"); // covaris vol
        this.addCell(row, "&nbsp;"); // covaris qty
      }

      parentNode.addContent(table);
    }
  }

  public void addIlluminaSampleTable(Element parentNode, Set samples) {

    boolean isDNASampleType = false;
    if (samples.size() > 0) {
      Sample s = (Sample) samples.iterator().next();
      if (s.getIdSampleType() != null) {
        String sampleTypeName = dictionaryHelper.getSampleType(s
                .getIdSampleType());
        if (sampleTypeName.indexOf("DNA") >= 0) {
          isDNASampleType = true;
        }
      }
    }

    // Show 'samples' header
    Element sampleHeader = new Element("H5");
    sampleHeader.addContent("Samples (" + samples.size() + ")");
    parentNode.addContent(sampleHeader);

    Element table = new Element("TABLE");
    table.setAttribute("CLASS", "grid");
    table.setAttribute("CELLPADDING", "5");
    table.setAttribute("CELLSPACING", "5");

    Element rowh = new Element("TR");


    table.addContent(rowh);
    this.addHeaderCell(rowh, "Sample ID", new Integer(2), new Integer(1), "left");
    this.addHeaderCell(rowh, "Sample Name", new Integer(2), new Integer(1));
    this.addHeaderCell(rowh, "Sample Conc.", new Integer(2), new Integer(1));

    if (isDNASampleType) {
      this.addHeaderCell(rowh, "-------------------------- Lib Info --------------------------------",
              new Integer(1), new Integer(5), "colgroup");
    } else {
      this.addHeaderCell(rowh, "--------------------------- Lib Info ---------------------------------",
              new Integer(1), new Integer(6), "colgroup");
    }
    this.addHeaderCell(rowh, "----- Seq Info -----", new Integer(1), new Integer(2), "colgroup");


    rowh = new Element("TR");


    table.addContent(rowh);
    if (isDNASampleType) {
      // JFK    this.addHeaderCell(rowh, "Covaris Qty");
      // JFK    this.addHeaderCell(rowh, "Covaris Vol");
    } else {
      this.addHeaderCell(rowh, "RIN #");
    }

    this.addHeaderCell(rowh, "Multiplex Group #");
    this.addHeaderCell(rowh, "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Index&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
    this.addHeaderCell(rowh, "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Index&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;B&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
    this.addHeaderCell(rowh, "Lib Conc.");
    this.addHeaderCell(rowh, "Lib Size");

    this.addHeaderCell(rowh, "# Lanes");
    this.addHeaderCell(rowh, "Sequence Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");



    for(Iterator i = samples.iterator(); i.hasNext();) {
      Sample sample = (Sample)i.next();


      Element row = new Element("TR");
      row.setAttribute("CLASS", "forcedRowHeight");
      table.addContent(row);


      String concentration = "";
      if (sample.getConcentration() != null) {
        concentration = sample.getConcentration().toString();

      }

      int numberOfLanes = 0;
      for (SequenceLane lane : (Set<SequenceLane>)request.getSequenceLanes()) {
        if (lane.getIdSample().equals(sample.getIdSample())) {
          numberOfLanes++;
        }
      }

      String barcodeA = "&nbsp;";
      if (sample.getIdOligoBarcode() != null ) {
        barcodeA = DictionaryManager.getDisplay("hci.gnomex.model.OligoBarcode", sample.getIdOligoBarcode().toString());
      } else if (sample.getBarcodeSequence() != null && !sample.getBarcodeSequence().trim().equals("")) {
        barcodeA = sample.getBarcodeSequence();
      }

      String barcodeB = "&nbsp;";
      if (sample.getIdOligoBarcodeB() != null ) {
        barcodeB = DictionaryManager.getDisplay("hci.gnomex.model.OligoBarcode", sample.getIdOligoBarcodeB().toString());
      }  else if (sample.getBarcodeSequenceB() != null && !sample.getBarcodeSequenceB().trim().equals("")) {
        barcodeB = sample.getBarcodeSequenceB();
      }

      String indexGroup = "&nbsp;";
      if (sample.getMultiplexGroupNumber() != null && sample.getMultiplexGroupNumber().intValue() > 0 ) {
        indexGroup = sample.getMultiplexGroupNumber().toString();
      }


      //
      // Sample info
      this.addLeftCell(row, sample.getNumber());
      this.addCell(row, sample.getName());
      this.addCell(row, concentration + "&nbsp;/"); // sample conc (client) plush a / to split the cell ***************************************************************************************

      //
      // Library info
      //
      if (isDNASampleType) {
// JFK       this.addLeftCell(row, "&nbsp;"); // covaris qty
// JFK       this.addCell(row, "&nbsp;&nbsp&nbsp;&nbsp&nbsp;&nbsp;&nbsp;&nbsp;/"); // covaris vol        
      } else {
        this.addLeftCell(row, "&nbsp"); // RIN #
      }

      // Index Group
      this.addCell(row, indexGroup);
      // Index A
      this.addCell(row, barcodeA);
      // Index B
      this.addCell(row, barcodeB);
      this.addCell(row, "&nbsp;"); // lib conc.
      this.addCell(row, "&nbsp;"); // ave lib size

      //
      // Seq Info
      //
      // # of Lanes
      this.addLeftCell(row, numberOfLanes == 0 ? "&nbsp;" : new Integer(numberOfLanes).toString());
      // Seq Date
      this.addCell(row, "&nbsp;");

    }
    parentNode.addContent(table);

  }

  public void addSimpleSampleTable(Element parentNode, Set samples) {

    boolean showCcNumber = false;
    for(Iterator i = samples.iterator(); i.hasNext();) {
      Sample s = (Sample)i.next();
      /*if ( (RequestCategory.isSequenomType( request.getCodeRequestCategory() ) || 
            request.getCodeRequestCategory().equals(RequestCategory.CLINICAL_SEQUENOM_REQUEST_CATEGORY)) && 
           (s.getCcNumber() != null && !s.getCcNumber().equals("")) ) {*/
      if (s.getCcNumber() != null && !s.getCcNumber().equals("")) {
        showCcNumber = true;
        break;
      }
    }

    // Show 'samples' header
    Element sampleHeader = new Element("H5");
    sampleHeader.addContent("Samples (" + samples.size() + ")");
    parentNode.addContent(sampleHeader);

    Element table = new Element("TABLE");
    table.setAttribute("CLASS", "grid");
    table.setAttribute("CELLPADDING", "5");
    table.setAttribute("CELLSPACING", "5");

    Element rowh = new Element("TR");
    table.addContent(rowh);
    this.addHeaderCell(rowh, "Sample ID");
    if ( !request.getCodeRequestCategory().equals(RequestCategory.CLINICAL_SEQUENOM_REQUEST_CATEGORY) ) {
      this.addHeaderCell(rowh, "Sample Name");
    }
    if (showCcNumber) {
      this.addHeaderCell(rowh, "CC Number");
    }
    this.addHeaderCell(rowh, "Sample Conc. (ng/ul)");

    if (RequestCategory.isIlluminaRequestCategory(request.getCodeRequestCategory())) {
      this.addHeaderCell(rowh, "Index A");
      this.addHeaderCell(rowh, "Index B");
      this.addHeaderCell(rowh, "Index Group");
      this.addHeaderCell(rowh, "# Lanes");
    }


    for(Iterator i = samples.iterator(); i.hasNext();) {
      Sample sample = (Sample)i.next();

      Element row = new Element("TR");
      table.addContent(row);


      String concentration = "";
      if (sample.getConcentration() != null) {
        concentration = sample.getConcentration().toString();
        if (sample.getCodeConcentrationUnit() != null && !sample.getCodeConcentrationUnit().equals("")) {
          concentration += " " + sample.getCodeConcentrationUnit();
        }
      }

      int numberOfLanes = 0;
      for (SequenceLane lane : (Set<SequenceLane>)request.getSequenceLanes()) {
        if (lane.getIdSample().equals(sample.getIdSample())) {
          numberOfLanes++;
        }
      }

      //
      // Sample info
      this.addLeftCell(row, sample.getNumber());
      if ( !request.getCodeRequestCategory().equals(RequestCategory.CLINICAL_SEQUENOM_REQUEST_CATEGORY) ) {
        this.addCell(row, sample.getName());
      }
      if (showCcNumber) {
        String ccLinkString = "&nbsp;";
        if (sample.getCcNumber() != null && !sample.getCcNumber().equals("")) {
          ccLinkString = "<a href=\"" +
                  dictionaryHelper.getPropertyDictionary(PropertyDictionary.GNOMEX_LINKAGE_CORE_URL) + "#ccNumber=" + sample.getCcNumber() +
                  "\">" + sample.getCcNumber() + "</a>";
        }

        this.addCell(row, ccLinkString);
      }
      this.addCell(row, concentration);


      if (RequestCategory.isIlluminaRequestCategory(request.getCodeRequestCategory())) {

        // Index A
        this.addCell(row, sample.getIdOligoBarcode() != null ?
                DictionaryManager.getDisplay("hci.gnomex.model.OligoBarcode", sample.getIdOligoBarcode().toString())
                : (sample.getBarcodeSequence() != null && !sample.getBarcodeSequence().equals("") ? sample.getBarcodeSequence() : "&nbsp;"));
        // Index B
        // TODO:  Need to use a sample.getBarcodeSequenceB for the IndexB in the case where
        // a custom barcode was used for Index B
        this.addCell(row, sample.getIdOligoBarcodeB() != null ?
                DictionaryManager.getDisplay("hci.gnomex.model.OligoBarcode", sample.getIdOligoBarcodeB().toString())
                : "&nbsp;");

        // Index Group
        this.addCell(row,
                sample.getMultiplexGroupNumber() != null && sample.getMultiplexGroupNumber().intValue() > 0 ?
                        sample.getMultiplexGroupNumber().toString()
                        : "&nbsp;");

        // # of Lanes
        this.addCell(row, numberOfLanes == 0 ? "&nbsp;" : new Integer(numberOfLanes).toString());

      }
    }

    parentNode.addContent(table);
  }

  public Element makeSampleQualityTable(Set samples) {
    return makeSampleQualityTable(samples, null);
  }

  public Element makeSampleQualityTable(Set samples, String captionStyle) {
    Element table = new Element("TABLE");
    table.setAttribute("CLASS", "grid");
    table.setAttribute("CELLPADDING", "5");
    table.setAttribute("CELLSPACING", "5");

    Element caption = new Element("CAPTION");
    if (captionStyle != null) {
      caption.setAttribute("style", captionStyle);
    }
    caption.addContent("Samples");
    caption.setAttribute("ALIGN", "LEFT");
    table.addContent(caption);



    Element rowh = new Element("TR");
    table.addContent(rowh);
    this.addHeaderCell(rowh, "Sample #", new Integer(2), new Integer(1), "left");
    this.addHeaderCell(rowh, "Sample Name", new Integer(2), new Integer(1));;
    this.addHeaderCell(rowh, "Sample Type", new Integer(2), new Integer(1));;
    this.addHeaderCell(rowh, "Nucl. acid Extraction Method", new Integer(2), new Integer(1));;
    this.addHeaderCell(rowh, "Conc.", new Integer(2), new Integer(1));;
    if (request.getCodeRequestCategory() != null && request.getCodeRequestCategory().equals(RequestCategory.QUALITY_CONTROL_REQUEST_CATEGORY)) {
      this.addHeaderCell(rowh, "Chip Type", new Integer(2), new Integer(1));;
    }
    this.addHeaderCell(rowh, "Quality", new Integer(1), new Integer(4), "colgroup");

    rowh = new Element("TR");
    table.addContent(rowh);
    this.addHeaderCell(rowh, "Conc. ng/uL");
    this.addHeaderCell(rowh, "260/230");
    this.addHeaderCell(rowh, "QC meth");
    if (this.dnaSamples) {
      this.addHeaderCell(rowh, "Size range");
    } else {
      this.addHeaderCell(rowh, "RIN#");
    }



    for(Iterator i = samples.iterator(); i.hasNext();) {
      Sample sample = (Sample)i.next();

      Element row = new Element("TR");
      table.addContent(row);


      String qualFragmentSizeRange = "";
      if (sample.getQualFragmentSizeFrom() != null && !sample.getQualFragmentSizeFrom().equals("")) {
        qualFragmentSizeRange = sample.getQualFragmentSizeFrom() + "-";
      }
      if (sample.getQualFragmentSizeTo() != null && !sample.getQualFragmentSizeTo().equals("")) {
        qualFragmentSizeRange += sample.getQualFragmentSizeTo();
      } else {
        qualFragmentSizeRange += "?";
      }

      String concentration = "";
      if (sample.getConcentration() != null) {
        concentration = sample.getConcentration().toString();
        if (sample.getCodeConcentrationUnit() != null && !sample.getCodeConcentrationUnit().equals("")) {
          concentration += " " + sample.getCodeConcentrationUnit();
        }
      }

      this.addLeftCell(row, sample.getNumber());
      this.addCell(row, sample.getName());
      this.addCell(row, sample.getIdSampleType() == null ? "&nbsp;"       : dictionaryHelper.getSampleType(sample));
      this.addCell(row, getSamplePrepMethod(sample));
      this.addCell(row, sample.getConcentration() == null ? "&nbsp;"      : concentration);
      if (request.getCodeRequestCategory() != null && request.getCodeRequestCategory().equals(RequestCategory.QUALITY_CONTROL_REQUEST_CATEGORY)) {
        this.addCell(row, dictionaryHelper.getChipTypeName(sample.getCodeBioanalyzerChipType()) == null || dictionaryHelper.getChipTypeName(sample.getCodeBioanalyzerChipType()).equals("") ? "&nbsp;" :
                dictionaryHelper.getChipTypeName(sample.getCodeBioanalyzerChipType()));
      }

      this.addCell(row, sample.getQualCalcConcentration() == null ? "&nbsp;"      : sample.getQualCalcConcentration().toString());
      this.addCell(row, sample.getQual260nmTo230nmRatio() == null ? "&nbsp;"      : sample.getQual260nmTo230nmRatio().toString());
      this.addCell(row, dictionaryHelper.getChipTypeName(sample.getCodeBioanalyzerChipType()) == null || dictionaryHelper.getChipTypeName(sample.getCodeBioanalyzerChipType()).equals("") ? "&nbsp;" :
              dictionaryHelper.getChipTypeName(sample.getCodeBioanalyzerChipType()));
      if (this.dnaSamples) {
        this.addCell(row, qualFragmentSizeRange);
      } else {
        this.addCell(row, sample.getQualRINNumber() == null ? "&nbsp;"              : sample.getQualRINNumber().toString());
      }

    }

    return table;
  }


  private String getSamplePrepMethod(Sample sample) {

    String spm = null;
    spm = sample.getOtherSamplePrepMethod();
    return spm != null && !spm.trim().equals("") ? spm : "&nbsp;";
  }

  /*private String getOrganism(Sample sample) {
    
    String org = null;
    if (dictionaryHelper.getOrganism(sample).equals("Other")) {
      org = sample.getOtherOrganism();
    } else {
      org = dictionaryHelper.getOrganism(sample); 
    }
    return org != null && !org.trim().equals("") ? org : "&nbsp;";
  }*/

  public Element makeLabeledSampleTable(Element container, Set labeledSamples) {


    Element col1 = new Element("DIV");
    col1.setAttribute("id", "col1");
    container.addContent(col1);

    col1.addContent(makeLabelSampleTable(labeledSamples, "Cy3"));


    // Do we have some Cy5 samples?
    boolean hasCy5Samples = false;
    for(Iterator i = labeledSamples.iterator(); i.hasNext();) {
      LabeledSample labeledSample = (LabeledSample)i.next();

      if (this.dictionaryHelper.getLabel(labeledSample.getIdLabel()).equals("Cy5")) {
        hasCy5Samples = true;
        break;
      }
    }

    // Only show Cy5 labeled sample table if we have some.
    if (hasCy5Samples) {
      Element col2 = new Element("DIV");
      col2.setAttribute("id", "col2");
      container.addContent(col2);

      col2.addContent(makeLabelSampleTable(labeledSamples, "Cy5"));
    }

    Element ftr = new Element("DIV");
    ftr.setAttribute("id", "footer");
    container.addContent(ftr);

    return container;
  }

  public Element makeLabelSampleTable(Set labeledSamples, String label) {


    Element table = new Element("TABLE");
    table.setAttribute("CLASS", "gridHalf");

    Element caption = new Element("CAPTION");
    caption.addContent(label + " Samples");
    table.addContent(caption);


    Element rowh = new Element("TR");
    table.addContent(rowh);

    Integer rowSpan = new Integer(1);


    this.addHeaderCell(rowh, "Sample #", rowSpan, new Integer(1), "left");
    this.addHeaderCell(rowh, "Conc.", rowSpan, new Integer(1));
    this.addHeaderCell(rowh, "Volume", rowSpan, new Integer(1));

    for(Iterator i = labeledSamples.iterator(); i.hasNext();) {
      LabeledSample labeledSample = (LabeledSample)i.next();

      if (this.dictionaryHelper.getLabel(labeledSample.getIdLabel()).equals(label)) {
        Sample sample = labeledSample.getSample();

        Element row = new Element("TR");
        row.setAttribute("CLASS", "forcedRowHeight");
        table.addContent(row);


        this.addLeftCell(row, sample.getNumber());
        this.addEmptyCell(row);
        this.addEmptyCell(row);

      }

    }

    return table;
  }

  public Element makeHybTable(Set hybridizations) {
    return makeHybTable(hybridizations, null);
  }

  public Element makeHybTable(Set hybridizations, String captionStyle) {
    Element table = new Element("TABLE");
    table.setAttribute("CLASS",       "grid");
    table.setAttribute("CELLPADDING", "5");
    table.setAttribute("CELLSPACING", "5");

    Element caption = new Element("CAPTION");
    if (captionStyle != null) {
      caption.setAttribute("style", captionStyle);
    }
    caption.addContent("Hybridizations");
    table.addContent(caption);


    Element rowh = new Element("TR");
    table.addContent(rowh);
    this.addHeaderCell(rowh, "Hyb #", "left");
    this.addHeaderCell(rowh, "Cy3 Sample #"    );
    if (request.getCodeRequestCategory() == null ||
            (dictionaryHelper.getRequestCategoryObject(request.getCodeRequestCategory()).getNumberOfChannels() != null &&
                    dictionaryHelper.getRequestCategoryObject(request.getCodeRequestCategory()).getNumberOfChannels().intValue() == 2)) {
      this.addHeaderCell(rowh, "Cy5 Sample #"    );
    }
    this.addHeaderCell(rowh, "Slide", "normal", new Integer(200));
    this.addHeaderCell(rowh, "Array ID");
    this.addHeaderCell(rowh, "Slide Source");
    if (includeMicroarrayCoreNotes) {
      this.addHeaderCell(rowh, "Barcode", "normal", new Integer(130));
      this.addHeaderCell(rowh, "Row-col", "normal", new Integer(40));
    }






    for(Iterator i = hybridizations.iterator(); i.hasNext();) {
      Hybridization hyb = (Hybridization)i.next();

      Element row = new Element("TR");
      table.addContent(row);


      String slideSource = null;
      if (hyb.getCodeSlideSource() != null && !hyb.getCodeSlideSource().equals("")) {
        slideSource = dictionaryHelper.getSlideSource(hyb.getCodeSlideSource());
      }


      String slideDesignProtocolName = dictionaryHelper.getSlideDesignProtocolName(hyb.getIdSlideDesign());


      this.addLeftCell(row, hyb.getNumber());
      this.addCell(row, hyb.getLabeledSampleChannel1() != null ? hyb.getLabeledSampleChannel1().getSample().getNumber() : "&nbsp;");
      if (request.getCodeRequestCategory() == null ||
              (dictionaryHelper.getRequestCategoryObject(request.getCodeRequestCategory()).getNumberOfChannels() != null &&
                      dictionaryHelper.getRequestCategoryObject(request.getCodeRequestCategory()).getNumberOfChannels().intValue() == 2)) {
        this.addCell(row, hyb.getLabeledSampleChannel2() != null ? hyb.getLabeledSampleChannel2().getSample().getNumber() : "&nbsp;");
      }
      this.addCell(row, hyb.getIdSlideDesign() != null         ? dictionaryHelper.getSlideDesignName(hyb.getIdSlideDesign()) : "&nbsp;");
      this.addCell(row, slideDesignProtocolName != null        ? slideDesignProtocolName                                : "&nbsp;");
      if (hyb.getCodeSlideSource() != null && hyb.getCodeSlideSource().equals(SlideSource.STRIPPED)) {
        this.addHighlightedCell(row, slideSource != null ? slideSource : "&nbsp;");

      } else {
        this.addCell(row, slideSource != null ? slideSource : "&nbsp;");
      }
      if (includeMicroarrayCoreNotes) {
        this.addEmptyCell(row);
        this.addSmallEmptyCell(row);
      }

    }

    return table;
  }

  public void addSequenceLaneTable(Element parentNode, Set lanes, String amendState) {
    addSequenceLaneTable(parentNode, lanes, amendState, null);
  }

  public void addSequenceLaneTable(Element parentNode, Set lanes, String amendState, String captionStyle) {


    // Group lanes by create Date
    TreeMap<Date, List<SequenceLane>> laneDateMap = new TreeMap<Date, List<SequenceLane>>(new DescendingDateComparator()); //***********

    // for each lane, add to Map's List for this lane's date if one exists or create a new List for this lane's date.
    for(Iterator i = lanes.iterator(); i.hasNext();) {
      SequenceLane lane = (SequenceLane)i.next();
      List<SequenceLane> theLanes = laneDateMap.get(lane.getCreateDate());
      if (theLanes == null) {
        theLanes = new ArrayList<SequenceLane>();
        laneDateMap.put(lane.getCreateDate(), theLanes);
      }
      theLanes.add(lane);
    }

    //Now show a lane table for each create date, most recent date first

    for(Iterator i = laneDateMap.keySet().iterator(); i.hasNext();) {
      Date createDate = (Date)i.next();
      List<SequenceLane> theLanes = laneDateMap.get(createDate);
      String caption = "Sequence Lanes added on " + request.formatDate(createDate);
      if (amendState != null && amendState.equals(Constants.AMEND_ADD_SEQ_LANES)) {
        addSequenceLaneTableSection(parentNode, caption, theLanes, captionStyle);
        break;	// if we are adding lanes, only add the most recent entries, otherwise print all
      }
      addSequenceLaneTableSection(parentNode, caption, theLanes, captionStyle);

      if (i.hasNext()) { // New date section
        makePageBreak(parentNode);
      }
    }


  }


  private void addSequenceLaneTableSection(Element parentNode, String caption, List lanes, String captionStyle) {

    // If all of the analysis instructions for the lanes are the
    // same, print instructions before the lanes grid.
    // Otherwise, we will show the instructions on each sample.
    String analysisInstructions = null;
    boolean uniqueInstructions = false;
    boolean showColInstructions = true;
    for(Iterator i = lanes.iterator(); i.hasNext();) { // have to group by lane
      SequenceLane l = (SequenceLane)i.next();
      if (analysisInstructions != null && l.getAnalysisInstructions() != null && !l.getAnalysisInstructions().equals(analysisInstructions)) {
        uniqueInstructions = true;
        break;
      }
      analysisInstructions = l.getAnalysisInstructions();
    }

    // Show 'Sequence Lanes' header
    Element lanesHeader = new Element("H5");
    lanesHeader.addContent(caption);
    parentNode.addContent(lanesHeader);

    // Show global instructions
    if (!uniqueInstructions && analysisInstructions != null && !analysisInstructions.equals("")) {
      Element prepHeader = new Element("H6");
      prepHeader.addContent(analysisInstructions);
      parentNode.addContent(prepHeader);
      showColInstructions = false;
    }


    Element table = new Element("TABLE");
    table.setAttribute("CLASS",       "grid");
    table.setAttribute("CELLPADDING", "5");
    table.setAttribute("CELLSPACING", "5");

    Element rowh = new Element("TR");
    table.addContent(rowh);
    this.addHeaderCell(rowh, "Lane", "left");
    this.addHeaderCell(rowh, "#" );
    this.addHeaderCell(rowh, "Sample name"    );
    this.addHeaderCell(rowh, "Status"    );
    this.addHeaderCell(rowh, "Seq Protocol");
    this.addHeaderCell(rowh, "Genome Build (align to)");
    if (showColInstructions) {
      this.addHeaderCell(rowh, "Analysis instructions");
    }

    SortedMap multiplexLaneMap = SequenceLane.getMultiplexLaneMap(lanes, null);


    int nonMulitplexedLaneCount = 1;
    for(Iterator i = multiplexLaneMap.keySet().iterator(); i.hasNext();) {
      String key = (String)i.next();
      Collection theLanes = (Collection)multiplexLaneMap.get(key);



      // Print a row for each sequence lane in multiplex lane
      boolean firstLaneInMultiplex = true;
      for(Iterator i1 = theLanes.iterator(); i1.hasNext();) {
        SequenceLane lane = (SequenceLane)i1.next();

        Element row = new Element("TR");
        table.addContent(row);

        String multiplexGroupID = "";
        if (!key.equals("")) {
          // The multiplex group identifier will be either the flow cell number and channel number
          // if the lane has been sequenced or the mutiplex group number.  This identifier is
          // in the third token of the key, separated by a dash.  
          //String[] tokens = key.split("-");
          //mutiplexGroupID = tokens[2];
          multiplexGroupID = key;
        }


        // If this is the last lane in the multiplex lane, show a bottom border
        if (key.equals("")) {
          this.addLeftCell(row, Integer.valueOf(nonMulitplexedLaneCount++).toString());
          this.addCell(row, lane.getNumber());
        } else if (i1.hasNext()) {
          this.addBlankCell(row, firstLaneInMultiplex ? multiplexGroupID : "&nbsp;");
          this.addLeftCell(row, lane.getNumber());
        } else {
          this.addBottomBlankCell(row, firstLaneInMultiplex ? multiplexGroupID : "&nbsp;");
          this.addLeftCell(row, lane.getNumber());
        }


        this.addCell(row, lane.getSample() != null ? lane.getSample().getName() : "&nbsp;");
        this.addCell(row, lane.getWorkflowStatusAbbreviated().equals("") ? "&nbsp;" : lane.getWorkflowStatusAbbreviated());
        this.addCell(row, lane.getIdNumberSequencingCyclesAllowed() != null ? dictionaryHelper.getNumberSequencingCyclesAllowed(lane.getIdNumberSequencingCyclesAllowed()) : "&nbsp;");
        this.addSmallCell(row, lane.getIdGenomeBuildAlignTo() != null  ? dictionaryHelper.getGenomeBuild(lane.getIdGenomeBuildAlignTo()) : "&nbsp;");
        if (showColInstructions) {
          this.addInstructionsCell(row, lane.getAnalysisInstructions() != null && !lane.getAnalysisInstructions().equals("") ? lane.getAnalysisInstructions() : "&nbsp;");
        }

        firstLaneInMultiplex = false;
      }




    }



    parentNode.addContent(table);
  }



  public Element makeChannelTable(Set flowCellChannels) {
    Element table = new Element("TABLE");
    table.setAttribute("CLASS",       "grid");
    table.setAttribute("CELLPADDING", "0");
    table.setAttribute("CELLSPACING", "0");

    Element caption = new Element("CAPTION");
    caption.addContent("Flow Cell Channels");
    table.addContent(caption);


    Element rowh = new Element("TR");
    table.addContent(rowh);
    this.addHeaderCell(rowh, "#", "left");
    this.addHeaderCell(rowh, "Sample name"    );
    this.addHeaderCell(rowh, "Seq Protocol");
    this.addHeaderCell(rowh, "Genome Build (align to)");
    this.addHeaderCell(rowh, "Analysis instructions");






    for(Iterator i = flowCellChannels.iterator(); i.hasNext();) {
      FlowCellChannel channel = (FlowCellChannel)i.next();

      Element row = new Element("TR");
      table.addContent(row);
      this.addLeftCell(row, channel.getNumber().toString());

      if (channel.getSequenceLanes() != null) {
        for (Iterator i1 = channel.getSequenceLanes().iterator(); i1.hasNext();) {
          SequenceLane lane = (SequenceLane)i1.next();

          this.addCell(row, lane.getSample() != null ? lane.getSample().getName() : "&nbsp;");
          this.addCell(row, lane.getIdNumberSequencingCyclesAllowed() != null  ? dictionaryHelper.getNumberSequencingCyclesAllowed(lane.getIdNumberSequencingCyclesAllowed()) : "&nbsp;");
          this.addCell(row, lane.getIdGenomeBuildAlignTo() != null  ? dictionaryHelper.getGenomeBuild(lane.getIdGenomeBuildAlignTo()) : "&nbsp;");
          this.addCell(row, lane.getAnalysisInstructions() != null && !lane.getAnalysisInstructions().equals("") ? lane.getAnalysisInstructions() : "&nbsp;");

        }

      } else if (channel.getSequencingControl() != null) {
        SequencingControl control = channel.getSequencingControl();
        this.addCell(row, control.getDisplay());
        this.addSmallCell(row, "&nbsp;");
        this.addSmallCell(row, "&nbsp;");
        this.addCell(row, "&nbsp;");
      } else {
        this.addCell(row, "&nbsp;");
        this.addSmallCell(row, "&nbsp;");
        this.addSmallCell(row, "&nbsp;");
        this.addCell(row, "&nbsp;");
      }

    }

    return table;
  }


  private Element makeRow(String header1, String value1, String header2, String value2) {
    Element row = new Element("TR");
    Element cell = new Element("TD");
    cell.setAttribute("CLASS", "label");
    cell.setAttribute("ALIGN", "RIGHT");
    cell.addContent(header1);
    row.addContent(cell);

    cell = new Element("TD");
    cell.setAttribute("CLASS", "value");
    cell.setAttribute("ALIGN", "LEFT");
    cell.addContent(value1);
    row.addContent(cell);

    cell = new Element("TD");
    cell.setAttribute("CLASS", "value");
    row.addContent(cell);

    cell = new Element("TD");
    cell.setAttribute("CLASS", "label");
    cell.setAttribute("ALIGN", "RIGHT");
    cell.addContent(header2);
    row.addContent(cell);

    cell = new Element("TD");
    cell.setAttribute("CLASS", "value");
    cell.setAttribute("ALIGN", "LEFT");
    cell.addContent(value2);
    row.addContent(cell);

    return row;
  }

  private void addLeftCell(Element row, String value) {
    Element cell = new Element("TD");
    cell.setAttribute("CLASS", "gridleft");
    cell.addContent(value);
    row.addContent(cell);
  }
  private void addInstructionsCell(Element row, String value) {
    Element cell = new Element("TD");
    cell.setAttribute("CLASS", "gridinstructions");
    cell.addContent(value);
    row.addContent(cell);
  }

  private void addCell(Element row, String value) {
    Element cell = new Element("TD");
    cell.setAttribute("CLASS", "grid");
    cell.addContent(value);
    row.addContent(cell);
  }


  private void addSmallCell(Element row, String value) {
    Element cell = new Element("TD");
    cell.setAttribute("CLASS", "gridSmall");
    cell.addContent(value);
    row.addContent(cell);
  }


  private void addHighlightedCell(Element row, String value) {
    Element cell = new Element("TD");
    cell.setAttribute("CLASS", "gridreverse");
    cell.addContent(value);
    row.addContent(cell);
  }

  private void addEmptyCell(Element row) {
    Element cell = new Element("TD");
    cell.setAttribute("class", "gridempty");
    cell.addContent("&nbsp;");
    row.addContent(cell);
  }

  private void addBlankCell(Element row) {
    Element cell = new Element("TD");
    cell.setAttribute("class", "gridblank");
    cell.addContent("&nbsp;");
    row.addContent(cell);
  }

  private void addBottomBlankCell(Element row) {
    Element cell = new Element("TD");
    cell.setAttribute("class", "gridbottomblank");
    cell.addContent("&nbsp;");
    row.addContent(cell);
  }


  private void addBottomBlankCell(Element row, String value) {
    Element cell = new Element("TD");
    cell.setAttribute("class", "gridbottomblank");
    cell.addContent(value);
    row.addContent(cell);
  }

  private void addBlankCell(Element row, String value) {
    Element cell = new Element("TD");
    cell.setAttribute("class", "gridblank");
    cell.addContent(value);
    row.addContent(cell);
  }


  private void addSmallEmptyCell(Element row) {
    Element cell = new Element("TD");
    cell.setAttribute("class", "gridemptysmall");
    cell.addContent("&nbsp;");
    row.addContent(cell);
  }

  private void addHeaderCell(Element row, String header) {
    addHeaderCell(row, header, "normal");
  }

  private void addHeaderCell(Element row, String header, String clazzName) {
    addHeaderCell(row, header, clazzName, null);
  }


  private void addHeaderCell(Element row, String header, String clazzName, Integer width) {
    Element cell = new Element("TH");
    if (clazzName != null) {
      cell.setAttribute("CLASS", clazzName);
    }
    if (width != null) {
      cell.setAttribute("WIDTH", width.toString());
    }
    cell.addContent(header);
    row.addContent(cell);
  }

  private void addHeaderCell(Element row, String header, Integer rowSpan, Integer colSpan) {
    addHeaderCell(row, header, rowSpan, colSpan, "normal", null);
  }
  private void addHeaderCell(Element row, String header, Integer rowSpan, Integer colSpan, Integer width) {
    addHeaderCell(row, header, rowSpan, colSpan, "normal", width);
  }
  private void addHeaderCell(Element row, String header, Integer rowSpan, Integer colSpan, String clazzName) {
    addHeaderCell(row, header, rowSpan, colSpan, clazzName, null);
  }

  private void addHeaderCell(Element row, String header, Integer rowSpan, Integer colSpan, String clazzName, Integer width) {
    Element cell = new Element("TH");
    if (clazzName != null) {
      cell.setAttribute("CLASS", clazzName);
    }
    cell.addContent(header);
    if (colSpan != null) {
      cell.setAttribute("COLSPAN", colSpan.toString());
    }
    if (rowSpan != null) {
      cell.setAttribute("ROWSPAN", rowSpan.toString());
    }
    if (width != null) {
      cell.setAttribute("WIDTH", width.toString());
    }
    row.addContent(cell);
  }


  public boolean isIncludeMicroarrayCoreNotes() {
    return includeMicroarrayCoreNotes;
  }


  public void setIncludeMicroarrayCoreNotes(boolean includeMicroarrayCoreNotes) {
    this.includeMicroarrayCoreNotes = includeMicroarrayCoreNotes;
  }


  private boolean isDNASampleType(Sample sample) {
    String sampleType = this.dictionaryHelper.getSampleType(sample.getIdSampleType());
    if (sampleType != null && sampleType.matches(".*DNA.*")) {
      return true;
    }
    return false;

  }

  public static void makePageBreak(Element maindiv) {
    Element pb = new Element("P");
    pb.setAttribute("CLASS", "break");
    maindiv.addContent(pb);
    maindiv.addContent(new Element("BR"));
  }

}
