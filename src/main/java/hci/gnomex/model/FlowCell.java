package hci.gnomex.model;

import hci.gnomex.utility.DictionaryHelper;
import hci.hibernate5utils.HibernateDetailObject;

import java.sql.Date;
import java.text.SimpleDateFormat;
import java.util.HashSet;
import java.util.Set;
import java.util.TreeSet;


public class FlowCell extends HibernateDetailObject {
  
  private String   number;
  private Date     createDate;
  private String   notes;
  private Integer  idFlowCell;
  private Integer  idSeqRunType;
  private Integer  idNumberSequencingCycles;
  private String   barcode;
  private String   codeSequencingPlatform;
  private Integer  runNumber;
  private Integer  idInstrument;
  private String   side;
  private Integer  idCoreFacility;
  private Integer  idNumberSequencingCyclesAllowed;

  private Set<FlowCellChannel> flowCellChannels = new TreeSet<>();
  
  private Instrument instrument;
  
  public Integer getIdFlowCell() {
    return idFlowCell;
  }
  public void setIdFlowCell(Integer idFlowCell) {
    this.idFlowCell = idFlowCell;
  }
  
  public Integer getIdSeqRunType() {
    return idSeqRunType;
  }
  public void setIdSeqRunType(Integer idSeqRunType) {
    this.idSeqRunType = idSeqRunType;
  }
  
  public Integer getIdNumberSequencingCycles() {
    return idNumberSequencingCycles;
  }
  public void setIdNumberSequencingCycles(Integer idNumberSequencingCycles) {
    this.idNumberSequencingCycles = idNumberSequencingCycles;
  }
  
  public String getNumber() {
    return number;
  }
  public void setNumber(String number) {
    this.number = number;
  }

  public Date getCreateDate() {
    return createDate;
  }
  public void setCreateDate(Date createDate) {
    this.createDate = createDate;
  }

  public String getNotes() {
    return notes;
  }
  public void setNotes(String notes) {
    this.notes = notes;
  }

  public String getBarcode() {
    return barcode;
  }
  public void setBarcode(String barcode) {
    this.barcode = barcode;
  }

  public Set<FlowCellChannel> getFlowCellChannels() {
    return flowCellChannels;
  }
  public void setFlowCellChannels(Set<FlowCellChannel> flowCellChannels) {
    this.flowCellChannels = flowCellChannels;
  }

  public String getCodeSequencingPlatform() {
    return codeSequencingPlatform;
  }
  public void setCodeSequencingPlatform(String codeSequencingPlatform) {
    this.codeSequencingPlatform = codeSequencingPlatform;
  }
  
  public Integer getRunNumber() {
    return runNumber;
  }
  public void setRunNumber(Integer rn) {
    runNumber = rn;
  }

  public Integer getIdInstrument() {
    return idInstrument;
  }
  public void setIdInstrument(Integer id) {
    idInstrument = id;
  }
  
  public String getSide() {
    return side;
  }
  public void setSide(String s) {
    side = s;
  }

  public Integer getIdCoreFacility() {
    return this.idCoreFacility;
  }
  public void setIdCoreFacility(Integer idCoreFacility) {
    this.idCoreFacility = idCoreFacility;
  }

  public Instrument getInstrument() {
    return instrument;
  }
  public void setInstrument(Instrument instrument) {
    this.instrument = instrument;
  }

  public Integer getIdNumberSequencingCyclesAllowed() {
    return idNumberSequencingCyclesAllowed;
  }
  public void setIdNumberSequencingCyclesAllowed(Integer idNumberSequencingCyclesAllowed) {
    this.idNumberSequencingCyclesAllowed = idNumberSequencingCyclesAllowed;
  }
  
  public String getCreateYear() {
    String createDate = this.formatDate(this.getCreateDate());
    return createDate.split("/")[2];
  }
  
  public String getRunFolderName(DictionaryHelper dh) {
    // Only allowed for certain types
    Set<String> allowedSequencingPlatforms = new HashSet<>();

    allowedSequencingPlatforms.add(SequencingPlatform.ILLUMINA_HISEQ_2000_SEQUENCING_PLATFORM);
    allowedSequencingPlatforms.add(SequencingPlatform.ILLUMINA_MISEQ_SEQUENCING_PLATFORM);
    allowedSequencingPlatforms.add(SequencingPlatform.ILLUMINA_NOSEQ_SEQUENCING_PLATFORM);
    allowedSequencingPlatforms.add(SequencingPlatform.ILLUMINA_ILLSEQ_SEQUENCING_PLATFORM);

    if (!allowedSequencingPlatforms.contains(this.getCodeSequencingPlatform())) {
      return null;
    }

    // If any piece of the folder is null we return the folder name as
    // null in order to flag that it should not be updated.  This is
    // really an interim issue for legacy data before we were building
    // the folder name automatically.
    if (this.getCreateDate() == null
        || this.getIdInstrument() == null
        || this.getRunNumber() == null
        || this.getBarcode() == null
        || this.getBarcode().length() <= 0) {

      return null;
    }

    SimpleDateFormat dateFormat = new SimpleDateFormat("yyMMdd");

    String runFolder = "";

    runFolder += dateFormat.format(this.getCreateDate());
    runFolder += "_";
    runFolder += dh.getInstrument(this.getIdInstrument());
    runFolder += "_";
    runFolder += ((Integer) (this.getRunNumber() + 10000)).toString().substring(1,5);
    runFolder += "_";

    if (this.getSide() != null && this.getSide().length() > 0) {
      runFolder += this.getSide();
    }

    runFolder += this.getBarcode();

    return runFolder;
  }
}