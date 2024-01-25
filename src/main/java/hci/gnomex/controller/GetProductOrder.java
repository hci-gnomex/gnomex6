package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.BillingAccount;
import hci.gnomex.model.ProductOrder;
import hci.gnomex.model.ProductOrderFile;
import hci.gnomex.utility.DictionaryHelper;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.PropertyDictionaryHelper;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.*;
public class GetProductOrder extends GNomExCommand implements Serializable {

  private static Logger LOG = Logger.getLogger(GetProductOrder.class);

  private Integer idProductOrder;
  private Integer productOrderNumber;
  private String serverName;

  @Override
  public void loadCommand(HttpServletWrappedRequest request, HttpSession sess) {

    if (request.getParameter("idProductOrder") != null && !request.getParameter("idProductOrder").equals("")) {
      idProductOrder = Integer.valueOf(request.getParameter("idProductOrder"));
    }

    if (request.getParameter("productOrderNumber") != null && !request.getParameter("productOrderNumber").equals("")) {
      productOrderNumber = Integer.valueOf(request.getParameter("productOrderNumber"));
    }

    if (idProductOrder == null && productOrderNumber == null) {
      this.addInvalidField("identification", "Please provide either an idProductOrder or a productOrderNumber");
    }

    serverName = request.getServerName();

  }

  @Override
  public Command execute() throws RollBackCommandException {
    try {
      if (this.isValid()) {
        Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.username);
        DictionaryHelper dh = DictionaryHelper.getInstance(sess);

        ProductOrder po;
        try {
          if (idProductOrder != null) {
            po = sess.load(ProductOrder.class, idProductOrder);
          } else {
            po = (ProductOrder) sess.createQuery("FROM ProductOrder po WHERE po.productOrderNumber = \'" + productOrderNumber + "\'").uniqueResult();
          }
        } catch (Exception e) {
          LOG.error(e.getMessage(), e);
          po = null;
        }

        String baseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, po.getIdCoreFacility(), PropertyDictionaryHelper.PROPERTY_PRODUCT_ORDER_DIRECTORY);

        boolean canRead = false;
        if (po != null) {
          canRead = this.getSecAdvisor().canRead(po);
        }

        Element root = new Element("ProductOrder");
        if (po != null) {
          root.setAttribute("productOrderNumber", po.getProductOrderNumber() != null ? po.getProductOrderNumber() : po.getIdProductOrder().toString());
          if (canRead) {
            String billingAccountName = "";

            if (po.getAcceptingBalanceAccountId(sess) != null) {
              BillingAccount ba = sess.load(BillingAccount.class, po.getAcceptingBalanceAccountId(sess));
              billingAccountName = ba.getAccountNameDisplay();
            }
            SimpleDateFormat sdf = new SimpleDateFormat("MM-dd-yyyy");
            String submitDate = po.getSubmitDate() != null ? sdf.format(po.getSubmitDate()) : "";
            root.setAttribute("idProductOrder", po.getIdProductOrder().toString());
            root.setAttribute("submitter", Util.getAppUserDisplayName(po.getSubmitter(), this.getUserPreferences()));
            root.setAttribute("labName", Util.getLabDisplayName(po.getLab(), this.getUserPreferences()));
            root.setAttribute("submitDate", submitDate);
            root.setAttribute("orderStatus", po.getStatus());
            root.setAttribute("quoteNumber", po.getQuoteNumber() != null ? po.getQuoteNumber() : "");
            root.setAttribute("quoteReceivedDate", po.getQuoteReceivedDate() != null ? po.getQuoteReceivedDate().toString() : "");
            root.setAttribute("billingAccount", billingAccountName);
            root.setAttribute("canRead", "Y");
            root.setAttribute("key", po.getKey());
          } else {
            root.setAttribute("canRead", "N");
          }
        }

        // Show files uploads that are in the staging area.
        // Only show these files if user has write permissions.
        // Hash the know analysis files
        Map knownProductOrderFileMap = new HashMap();
        for (Iterator i = po.getFiles().iterator(); i.hasNext();) {
          ProductOrderFile pof = (ProductOrderFile) i.next();
          knownProductOrderFileMap.put(pof.getFileName(), pof);
        }

        // Now add in the files from the upload staging area
        Element filesNode = new Element("ExpandedProductOrderFileList");
        root.addContent(filesNode);

        Map productOrderMap = new TreeMap();
        Map directoryMap = new TreeMap();
        Map fileMap = new HashMap();
        List productOrderNumbers = new ArrayList<String>();
        GetProductOrderDownloadList.getFileNamesToDownload(baseDir, po.getKey(), productOrderNumbers, productOrderMap, directoryMap, false);

        for (Iterator i = productOrderNumbers.iterator(); i.hasNext();) {
          String productOrderNumber = (String) i.next();
          List directoryKeys = (List) productOrderMap.get(productOrderNumber);

          // For each directory of analysis
          for (Iterator i1 = directoryKeys.iterator(); i1.hasNext();) {

            String directoryKey = (String) i1.next();

            String[] dirTokens = directoryKey.split("-");

            String directoryName = "";
            if (dirTokens.length > 1) {
              directoryName = dirTokens[1];
            }

            // Show files uploads that are in the staging area.
            Element productOrderUploadNode = new Element("ProductOrderUpload");
            filesNode.addContent(productOrderUploadNode);
            String key = po.getKey(Constants.UPLOAD_STAGING_DIR);
            GetProductOrderDownloadList.addExpandedFileNodes(baseDir, root, productOrderUploadNode, productOrderNumber, key, dh, knownProductOrderFileMap, fileMap, sess);
          }
        }

        Document doc = new Document(root);
        XMLOutputter out = new org.jdom.output.XMLOutputter();
        this.xmlResult = out.outputString(doc);

        setResponsePage(this.SUCCESS_JSP);

      } else {
        setResponsePage(this.ERROR_JSP);
      }

    } catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetProductOrder ", e);

      throw new RollBackCommandException(e.getMessage());
    }
    return this;
  }

  @Override
  public void validate() {
    // TODO Auto-generated method stub

  }

}
