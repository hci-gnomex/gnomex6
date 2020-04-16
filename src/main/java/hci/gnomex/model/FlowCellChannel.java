package hci.gnomex.model;

import hci.gnomex.constants.Constants;
import hci.gnomex.utility.FlowCellChannelComparator;
import hci.hibernate5utils.HibernateDetailObject;

import java.math.BigDecimal;
import java.sql.Date;
import java.util.Iterator;
import java.util.Set;


public class FlowCellChannel extends HibernateDetailObject implements Comparable<FlowCellChannel> {

  private Integer           idFlowCellChannel;
  private Integer           number;
  private FlowCell          flowCell;
  private Integer           idFlowCell;
  private SequencingControl sequencingControl;
  private Integer           idSequencingControl;
  private Date              startDate;
  private Date              firstCycleDate;
  private String            firstCycleFailed;
  private Date              lastCycleDate;
  private String            lastCycleFailed;
  private Integer           clustersPerTile;
  private String            fileName;
  private BigDecimal        sampleConcentrationpM;
  private Integer           numberSequencingCyclesActual;
  private Date              pipelineDate;
  private String            pipelineFailed;
  private String            isControl;
  private BigDecimal        phiXErrorRate;
  private BigDecimal        read1ClustersPassedFilterM;
  private BigDecimal        q30Percent;
  private Integer           idPipelineProtocol;

  private Set<SequenceLane> sequenceLanes;


  public Integer getIdFlowCellChannel() {
    return idFlowCellChannel;
  }
  public void setIdFlowCellChannel(Integer idFlowCellChannel) {
    this.idFlowCellChannel = idFlowCellChannel;
  }

  public Integer getIdFlowCell() {
    return idFlowCell;
  }
  public void setIdFlowCell(Integer idFlowCell) {
    this.idFlowCell = idFlowCell;
  }

  public Integer getIdSequencingControl() {
    return idSequencingControl;
  }
  public void setIdSequencingControl(Integer idSequencingControl) {
    this.idSequencingControl = idSequencingControl;
  }
  
  public Date getStartDate() {
    return startDate;
  }
  public void setStartDate(Date startDate) {
    this.startDate = startDate;
  }
  
  public Date getFirstCycleDate() {
    return firstCycleDate;
  }
  public void setFirstCycleDate(Date firstCycleDate) {
    this.firstCycleDate = firstCycleDate;
  }
  
  public String getFirstCycleFailed() {
    return firstCycleFailed;
  }
  public void setFirstCycleFailed(String firstCycleFailed) {
    this.firstCycleFailed = firstCycleFailed;
  }
  
  public Date getLastCycleDate() {
    return lastCycleDate;
  }
  public void setLastCycleDate(Date lastCycleDate) {
    this.lastCycleDate = lastCycleDate;
  }
  
  public String getLastCycleFailed() {
    return lastCycleFailed;
  }
  public void setLastCycleFailed(String lastCycleFailed) {
    this.lastCycleFailed = lastCycleFailed;
  }

  public Integer getClustersPerTile() {
    return clustersPerTile;
  }
  public void setClustersPerTile(Integer clustersPerTile) {
    this.clustersPerTile = clustersPerTile;
  }

  public String getFileName() {
    return fileName;
  }
  public void setFileName(String fileName) {
    this.fileName = fileName;
  }

  public Integer getNumberSequencingCyclesActual() {
    return numberSequencingCyclesActual;
  }
  public void setNumberSequencingCyclesActual(Integer numberSequencingCyclesActual) {
    this.numberSequencingCyclesActual = numberSequencingCyclesActual;
  }

  public Integer getNumber() {
    return number;
  }
  public void setNumber(Integer number) {
    this.number = number;
  }

  public SequencingControl getSequencingControl() {
    return sequencingControl;
  }
  public void setSequencingControl(SequencingControl sequencingControl) {
    this.sequencingControl = sequencingControl;
  }
  
  public String getContentNumbers() {
    if (sequencingControl != null){
      String sc =  sequencingControl.getSequencingControl();
      return sc;
    } else if (getSequenceLanes() != null) {
      String sampleNumbers = "";
      for (Iterator i = getSequenceLanes().iterator(); i.hasNext();) {
        SequenceLane sequenceLane = (SequenceLane)i.next();
        sampleNumbers += sequenceLane.getNumber();
        if (i.hasNext()) {
          sampleNumbers += ", ";
        }
      }
      return sampleNumbers;
    } else {
      return "";
    }
  }

  public String getWorkflowStatus() {
    if (getPipelineDate() != null) {
      return "Sequenced";
    } else if (this.getPipelineFailed() != null && this.getPipelineFailed().equals("Y")) {
      return "Failed GA pipeline";
    } else if (getLastCycleDate() != null) {
      return "Completed seq run";
    } else if (this.getLastCycleFailed() != null && this.getLastCycleFailed().equals("Y")) {
      return "Failed seq run";
    } else if (this.getFirstCycleFailed() != null && this.getFirstCycleFailed().equals("Y")) {
      return "Failed 1st cycle seq run";
    } else if (getFirstCycleDate() != null) {
      return "1st cycle done";
    } else {
      return "Ready for seq run";
    }
  }

  public FlowCell getFlowCell() {
    return flowCell;
  }
  public void setFlowCell(FlowCell flowCell) {
    this.flowCell = flowCell;
  }

  public BigDecimal getSampleConcentrationpM() {
    return sampleConcentrationpM;
  }
  public void setSampleConcentrationpM(BigDecimal sampleConcentrationpM) {
    this.sampleConcentrationpM = sampleConcentrationpM;
  }

  public String getSampleConcentrationpMDisplay() {
    if (sampleConcentrationpM != null) {
      return Constants.concentrationFormatter.format(sampleConcentrationpM);      
    } else {
      return "";
    }
  }

  public Date getPipelineDate() {
    return pipelineDate;
  }
  public void setPipelineDate(Date pipelineDate) {
    this.pipelineDate = pipelineDate;
  }

  public String getPipelineFailed() {
    return pipelineFailed;
  }
  public void setPipelineFailed(String pipelineFailed) {
    this.pipelineFailed = pipelineFailed;
  }

  public Set<SequenceLane> getSequenceLanes() {
    return sequenceLanes;
  }
  public void setSequenceLanes(Set<SequenceLane> sequenceLanes) {
    this.sequenceLanes = sequenceLanes;
  }

  public String getIsControl() {
    return isControl;
  }
  public void setIsControl(String isControl) {
    this.isControl = isControl;
  }

  public BigDecimal getPhiXErrorRate() {
    return phiXErrorRate;
  }
  public void setPhiXErrorRate(BigDecimal phiXErrorRate) {
    this.phiXErrorRate = phiXErrorRate;
  }

  public BigDecimal getRead1ClustersPassedFilterM() {
    return read1ClustersPassedFilterM;
  }
  public void setRead1ClustersPassedFilterM(BigDecimal read1ClustersPassedFilterM) {
    this.read1ClustersPassedFilterM = read1ClustersPassedFilterM;
  }

  public BigDecimal getQ30Percent() {
    return q30Percent;
  }
  public void setQ30Percent(BigDecimal q30Percent) {
    this.q30Percent = q30Percent;
  }
  
  public String getQ30PercentForDisplay() {
    if (q30Percent != null) {
      return q30Percent.movePointRight(2).toString();
    } else {
      return "";
    }
  }

  public Integer getIdPipelineProtocol() {
    return idPipelineProtocol;
  }
  public void setIdPipelineProtocol(Integer idPipelineProtocol) {
    this.idPipelineProtocol = idPipelineProtocol;
  }

  public int compareTo(FlowCellChannel that) {
    FlowCellChannelComparator temp = new FlowCellChannelComparator();
    return temp.compare(this, that);
  }
}