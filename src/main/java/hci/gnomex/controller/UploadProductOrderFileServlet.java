package hci.gnomex.controller;

import hci.gnomex.constants.Constants;
import hci.gnomex.model.ProductOrder;
import hci.gnomex.model.ProductOrderFile;
import hci.gnomex.model.TransferLog;
import hci.gnomex.utility.GnomexFile;
import hci.gnomex.utility.PropertyDictionaryHelper;
import org.apache.log4j.Logger;

import java.io.File;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Set;

public class UploadProductOrderFileServlet extends UploadFileServletBase {

private static final Logger LOG = Logger.getLogger(UploadProductOrderFileServlet.class);

@Override
protected void setParentObjectName(UploadFileServletData data) {
	data.parentObjectName = "product order";
}

@Override
protected void setIdFieldName(UploadFileServletData data) {
	data.idFieldName = "idProductOrder";
}

@Override
protected void setNumberFieldName(UploadFileServletData data) {
	data.numberFieldName = "productOrderNumber";
}

@Override
protected void handleIdParameter(UploadFileServletData data, String value) {
	data.generateOutput = true;
	data.parentObject = data.sess.get(ProductOrder.class, Integer.valueOf(value));
}

@Override
protected void handleNumberParameter(UploadFileServletData data, String value) {
	// number parameter not used for product orders
}

@Override
protected void setBaseDirectory(UploadFileServletData data) {
	ProductOrder productOrder = (ProductOrder) data.parentObject;
	String baseDir = PropertyDictionaryHelper.getInstance(data.sess).getDirectory(data.req.getServerName(),
			productOrder.getIdCoreFacility(), PropertyDictionaryHelper.PROPERTY_PRODUCT_ORDER_DIRECTORY);
	String createYear = new SimpleDateFormat("yyyy").format(productOrder.getSubmitDate());
	data.baseDirectory = FileStringUtil.appendDirectory(baseDir, createYear);
}

@Override
protected void setUploadDirectory(UploadFileServletData data) {
	ProductOrder productOrder = (ProductOrder) data.parentObject;
	data.uploadDirectory = data.baseDirectory;
	data.uploadDirectory = FileStringUtil.appendDirectory(data.uploadDirectory, productOrder.getProductOrderNumber());
	data.uploadDirectory = FileStringUtil.appendDirectory(data.uploadDirectory, Constants.UPLOAD_STAGING_DIR);
}

@Override
protected Set<GnomexFile> getExistingFiles(UploadFileServletData data) {
	ProductOrder productOrder = (ProductOrder) data.parentObject;
	return productOrder.getFiles();
}

@Override
protected void updateTransferLogFromParentObject(UploadFileServletData data, TransferLog transferLog) {
	ProductOrder productOrder = (ProductOrder) data.parentObject;
	transferLog.setIdProductOrder(productOrder.getIdProductOrder());
	transferLog.setIdLab(productOrder.getIdLab());
	transferLog.setFileName(FileStringUtil.appendFile(productOrder.getProductOrderNumber(), data.fileName));
}

@Override
protected void updateExistingFile(UploadFileServletData data, GnomexFile existingFile) {
	ProductOrderFile productOrderFile = (ProductOrderFile) existingFile;
	productOrderFile.setCreateDate(new java.sql.Date(System.currentTimeMillis()));
	productOrderFile.setFileSize(new BigDecimal(new File(data.fileName).length()));
	data.sess.save(productOrderFile);
}

@Override
protected void createNewFile(UploadFileServletData data) {
	ProductOrder productOrder = (ProductOrder) data.parentObject;
	ProductOrderFile productOrderFile = new ProductOrderFile();
	productOrderFile.setCreateDate(new java.sql.Date(System.currentTimeMillis()));
	productOrderFile.setIdProductOrder(productOrder.getIdProductOrder());
	productOrderFile.setProductOrder(productOrder);
	productOrderFile.setFileName(new File(data.fileName).getName());
	String productOrderDirectory = FileStringUtil.appendDirectory(data.baseDirectory, productOrder.getProductOrderNumber());
	productOrderFile.setBaseFilePath(FileStringUtil.ensureTrailingFileSeparator(productOrderDirectory, false));
	productOrderFile.setFileSize(new BigDecimal(data.fileSize));
	productOrderFile.setQualifiedFilePath(Constants.UPLOAD_STAGING_DIR);
	data.sess.save(productOrderFile);
}

@Override
protected void updateParentObject(UploadFileServletData data) {
	// We do not update the product order object after uploading files
}

}
