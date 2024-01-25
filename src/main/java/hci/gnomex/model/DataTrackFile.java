package hci.gnomex.model;

import hci.gnomex.utility.GnomexFile;

public class DataTrackFile extends GnomexFile {

  private Integer        idDataTrackFile;
  private Integer        idAnalysisFile;
  private AnalysisFile   analysisFile;
  private Integer        idDataTrack;
  
  public Integer getIdAnalysisFile() {
    return idAnalysisFile;
  }
  public void setIdAnalysisFile(Integer idAnalysisFile) {
    this.idAnalysisFile = idAnalysisFile;
  }
  public Integer getIdDataTrackFile() {
    return idDataTrackFile;
  }
  public void setIdDataTrackFile(Integer idDataTrackFile) {
    this.idDataTrackFile = idDataTrackFile;
  }
  public AnalysisFile getAnalysisFile() {
    return analysisFile;
  }
  public void setAnalysisFile(AnalysisFile analysisFile) {
    this.analysisFile = analysisFile;
  }
  
  public String getAssociatedFilePath(String baseDir) {
    String filePath = "";
    if (analysisFile != null && analysisFile.getAnalysis() != null && analysisFile.getAnalysis().getCreateDate() != null) {
      String createYear = Analysis.getCreateYear(analysisFile.getAnalysis().getCreateDate());
      String dirName = baseDir + "/" + createYear + "/" + analysisFile.getAnalysis().getNumber();
      if (analysisFile.getQualifiedFilePath() != null && !analysisFile.getQualifiedFilePath().isEmpty()) {
        dirName += "/" + analysisFile.getQualifiedFilePath();
      }
      filePath = dirName + "/" + analysisFile.getFileName();
    }
    return filePath;
  }
  public Integer getIdDataTrack() {
    return idDataTrack;
  }
  public void setIdDataTrack(Integer idDataTrack) {
    this.idDataTrack = idDataTrack;
  }
 
}