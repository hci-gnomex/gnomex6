package hci.gnomex.model;



import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import hci.gnomex.constants.Constants;
import hci.gnomex.utility.GnomexFile;
import hci.gnomex.utility.JsonDetailObject;
import hci.hibernate5utils.HibernateDetailObject;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonValue;
import java.io.File;
import java.math.BigDecimal;
import java.sql.Date;



public class AnalysisFile extends GnomexFile implements JsonDetailObject {

  private Integer        idAnalysisFile;
  private Integer        idAnalysis;
  private Analysis       analysis;
  private String         comments;
  private Date           uploadDate;


  public Integer getIdAnalysis() {
    return idAnalysis;
  }

  public void setIdAnalysis(Integer idAnalysis) {
    this.idAnalysis = idAnalysis;
  }

  public Analysis getAnalysis() {
    return analysis;
  }

  public void setAnalysis(Analysis analysis) {
    this.analysis = analysis;
  }


  public Integer getIdAnalysisFile() {
    return idAnalysisFile;
  }


  public void setIdAnalysisFile(Integer idAnalysisFile) {
    this.idAnalysisFile = idAnalysisFile;
  }


  public String getComments() {
    return comments;
  }


  public void setComments(String comments) {
    this.comments = comments;
  }


  public Date getUploadDate() {
    return uploadDate;
  }


  public void setUploadDate(Date uploadDate) {
    this.uploadDate = uploadDate;
  }


  public void registerMethodsToExcludeFromXML() {
    this.excludeMethodFromXML("getAnalysis");
    this.excludeMethodFromXML("toJsonObject");

  }


  public Date getEffectiveCreateDate() {
    if (uploadDate == null) {
      return createDate;
    } else {
      return uploadDate;
    }
  }

  public File getFile(String baseDir) {
    String filePath = "";
    if (baseFilePath == null || baseFilePath.equals("")) {
      String createYear = Analysis.getCreateYear(this.getAnalysis().getCreateDate());
      filePath = baseDir + Constants.FILE_SEPARATOR + createYear + Constants.FILE_SEPARATOR + this.getAnalysis().getNumber();
    } else {
      filePath = baseFilePath;
    }
    if (this.getQualifiedFilePath() != null && !this.getQualifiedFilePath().equals("")) {
      filePath += Constants.FILE_SEPARATOR + this.getQualifiedFilePath();
    }
    filePath +=  Constants.FILE_SEPARATOR + this.getFileName();

    return new File(filePath);
  }

  @Override
  public String toJsonObject() {
    ObjectMapper mapper = new ObjectMapper();
    ObjectNode node = mapper.createObjectNode();
    node.put("idAnalysisFile", idAnalysisFile.toString()); // expect these not to be null
    node.put("idAnalysis", idAnalysis.toString());
    node.put("comments", comments != null ?  comments : "");
    node.put("fileName",this.fileName != null ?  fileName : "");
    node.put("cloudURL", this.cloudURL != null ?  cloudURL : "");
    node.put("baseFilePath", baseFilePath != null ?  baseFilePath : "" );
    node.put("fileSize",this.fileSize);
    node.put("uploadDate", uploadDate != null ?  uploadDate.toString() : "");
    node.put("createDate", createDate != null ? createDate.toString() : "");
    node.put("qualifiedFilePath", qualifiedFilePath != null ? qualifiedFilePath : "");
    return node.toString();

  }
}