package hci.gnomex.model;

import hci.hibernate5utils.HibernateDetailObject;

import java.util.Date;
import java.util.Set;


public class PlateWell extends HibernateDetailObject {
  
  private Integer  idPlateWell;
  private String   row;
  private Integer  col;
  private Integer  position;
  private Integer  idPlate;
  private Plate    plate;
  private Integer  idSample;
  private Sample   sample;
  private Integer  idRequest;
  private Request  request;
  private String   codeReactionType;
  private Date     createDate;
  private String   redoFlag = "N";
  private String   isControl = "N";
  private Integer  idAssay;
  private Integer  idPrimer;
  private Primer   primer;
  private Assay    assay;
  private Set      chromatograms;
  
  public Integer getIdPlateWell() {
    return idPlateWell;
  }
  
  public void setIdPlateWell(Integer idPlateWell) {
    this.idPlateWell = idPlateWell;
  }

  public String getRow()
  {
    return row;
  }

  public void setRow(String row)
  {
    this.row = row;
  }

  public Integer getCol()
  {
    return col;
  }

  public void setCol(Integer col)
  {
    this.col = col;
  }



  public Integer getPosition() {
    return position;
  }

  public void setPosition(Integer position) {
    this.position = position;
  }

  public Integer getIdPlate()
  {
    return idPlate;
  }

  public void setIdPlate(Integer idPlate)
  {
    this.idPlate = idPlate;
  }

  public String getIdPlateWellShort()
  {
    return this.getIdPlateWell().toString().substring( idPlateWell.toString().length() > 6 ? idPlateWell.toString().length() - 5 : 0 );
  }

  
  public Plate getPlate()
  {
    return plate;
  }

  public void setPlate(Plate plate)
  {
    this.plate = plate;
  }

  public Integer getIdSample()
  {
    return idSample;
  }

  public void setIdSample(Integer idSample)
  {
    this.idSample = idSample;
  }

  public Sample getSample()
  {
    return sample;
  }

  public void setSample(Sample sample)
  {
    this.sample = sample;
  }
  
  public String getSampleName()
  {
    if (this.sample!=null) {
      return this.sample.getName();
    }
    return "";
  }
  
  public Integer getIdRequest()
  {
    return idRequest;
  }

  public void setIdRequest(Integer idRequest)
  {
    this.idRequest = idRequest;
  }
  
  
  public Request getRequest() {
    return request;
  }

  
  public void setRequest( Request request ) {
    this.request = request;
  }

  public void registerMethodsToExcludeFromXML() {
    this.excludeMethodFromXML("getPlate");
    this.excludeMethodFromXML("getChromatograms");
    this.excludeMethodFromXML("getRequest");
  }

  public void setCodeReactionType(String codeReactionType)
  {
    this.codeReactionType = codeReactionType;
  }

  public String getCodeReactionType()
  {
    return codeReactionType;
  }

  public void setCreateDate(Date createDate)
  {
    this.createDate = createDate;
  }

  public Date getCreateDate()
  {
    return createDate;
  }

  public String getRedoFlag() {
    return redoFlag;
  }

  
  public String getIsControl() {
    return isControl;
  }

  
  public void setIsControl( String isControl ) {
    this.isControl = isControl;
  }

  public void setRedoFlag(String redoFlag) {
    this.redoFlag = redoFlag;
  }

  public Integer getIdAssay() {
    return idAssay;
  }

  public void setIdAssay(Integer idAssay) {
    this.idAssay = idAssay;
  }

  public Integer getIdPrimer() {
    return idPrimer;
  }

  public void setIdPrimer(Integer idPrimer) {
    this.idPrimer = idPrimer;
  }
  
  public Primer getPrimer() {
    return primer;
  }
  
  public void setPrimer(Primer primer) {
    this.primer = primer;
  }
  
  public Assay getAssay() {
    return assay;
  }
  
  public void setAssay(Assay assay) {
    this.assay = assay;
  }
  
  public Set getChromatograms() {
    return chromatograms;
  }
  public void setChromatograms(Set chromatograms) {
    this.chromatograms = chromatograms;
  }
  
  public String getWellName() {
    if(this.row == null || this.col == null)
      return "";
    
    return this.row + this.col.toString();

  }
}