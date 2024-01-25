package hci.gnomex.controller;

import hci.gnomex.constants.Constants;
import hci.gnomex.model.Analysis;
import hci.gnomex.model.AnalysisFile;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.model.TransferLog;
import hci.gnomex.utility.GnomexFile;
import hci.gnomex.utility.PropertyDictionaryHelper;
import hci.hibernate5utils.HibernateDetailObject;
import org.apache.log4j.Logger;

import java.io.File;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Set;

public class UploadAnalysisFileServlet extends UploadFileServletBase {

private static final Logger LOG = Logger.getLogger(UploadAnalysisFileServlet.class);

@Override
protected void setParentObjectName(UploadFileServletData data) {
	data.parentObjectName = "analysis";
}

@Override
protected void setIdFieldName(UploadFileServletData data) {
	data.idFieldName = "idAnalysis";
}

@Override
protected void setNumberFieldName(UploadFileServletData data) {
		data.numberFieldName = "analysisNumber";
	}

@Override
protected void handleIdParameter(UploadFileServletData data, String value) {
	data.parentObject = data.sess.get(Analysis.class, Integer.valueOf(value));
}

@Override
protected void handleNumberParameter(UploadFileServletData data, String value) {
	data.generateOutput = true;
	List objects = data.sess.createQuery("SELECT a from Analysis a WHERE a.number = '" + value + "'").list();
	if (objects.size() == 1) {
		data.parentObject = (HibernateDetailObject)objects.get(0);
	} else {
		data.parentObject = null;
	}
}

@Override
protected void setBaseDirectory(UploadFileServletData data) {
	Analysis analysis = (Analysis) data.parentObject;
	String baseDir = PropertyDictionaryHelper.getInstance(data.sess).getDirectory(data.req.getServerName(), null,
			PropertyDictionaryHelper.PROPERTY_ANALYSIS_DIRECTORY);
	String use_altstr = PropertyDictionaryHelper.getInstance(data.sess).getProperty(PropertyDictionary.USE_ALT_REPOSITORY);
	if (use_altstr != null && use_altstr.equalsIgnoreCase("yes")) {
		baseDir = PropertyDictionaryHelper.getInstance(data.sess).getDirectory(data.req.getServerName(), null,
				PropertyDictionaryHelper.ANALYSIS_DIRECTORY_ALT,data.req.getRemoteUser());
	}

	String createYear = new SimpleDateFormat("yyyy").format(analysis.getCreateDate());
	data.baseDirectory = FileStringUtil.appendDirectory(baseDir, createYear);
}

@Override
protected void setUploadDirectory(UploadFileServletData data) {
	Analysis analysis = (Analysis) data.parentObject;
	data.uploadDirectory = data.baseDirectory;
	data.uploadDirectory = FileStringUtil.appendDirectory(data.uploadDirectory, analysis.getNumber());
	data.uploadDirectory = FileStringUtil.appendDirectory(data.uploadDirectory, Constants.UPLOAD_STAGING_DIR);
}

@Override
protected Set<GnomexFile> getExistingFiles(UploadFileServletData data) {
	Analysis analysis = (Analysis) data.parentObject;
	return analysis.getFiles();
}

@Override
protected void updateTransferLogFromParentObject(UploadFileServletData data, TransferLog transferLog) {
	Analysis analysis = (Analysis) data.parentObject;
	transferLog.setIdAnalysis(analysis.getIdAnalysis());
	transferLog.setIdLab(analysis.getIdLab());
	transferLog.setFileName(FileStringUtil.appendFile(analysis.getNumber(), data.fileName));
}

@Override
protected void updateExistingFile(UploadFileServletData data, GnomexFile existingFile) {
	AnalysisFile analysisFile = (AnalysisFile) existingFile;
	analysisFile.setUploadDate(new java.sql.Date(System.currentTimeMillis()));
	analysisFile.setCreateDate(new java.sql.Date(System.currentTimeMillis()));
	analysisFile.setFileSize(new BigDecimal(new File(data.fileName).length()));
	data.sess.save(analysisFile);
}

@Override
protected void createNewFile(UploadFileServletData data) {
	Analysis analysis = (Analysis) data.parentObject;
	AnalysisFile af = new AnalysisFile();
	af.setUploadDate(new java.sql.Date(System.currentTimeMillis()));
	af.setCreateDate(new java.sql.Date(System.currentTimeMillis()));
	af.setIdAnalysis(Integer.valueOf(analysis.getIdAnalysis()));
	af.setAnalysis(analysis);
	af.setFileName(new File(data.fileName).getName());
	String analysisDirectory = FileStringUtil.appendDirectory(data.baseDirectory, analysis.getNumber());
	af.setBaseFilePath(FileStringUtil.ensureTrailingFileSeparator(analysisDirectory, false));
	af.setFileSize(new BigDecimal(data.fileSize));
	af.setQualifiedFilePath(Constants.UPLOAD_STAGING_DIR);
	data.sess.save(af);
}

@Override
protected void updateParentObject(UploadFileServletData data) {
	// We do not update the analysis object after uploading files
}

}
