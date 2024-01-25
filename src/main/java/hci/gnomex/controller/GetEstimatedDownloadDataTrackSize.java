package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.DataTrack;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.utility.DictionaryHelper;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.PropertyDictionaryHelper;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.servlet.http.HttpSession;
import java.io.File;
import java.io.Serializable;
import java.math.BigDecimal;



public class GetEstimatedDownloadDataTrackSize extends GNomExCommand implements Serializable {

  private static Logger LOG = Logger.getLogger(GetEstimatedDownloadDataTrackSize.class);

  private String    keysString = null;

  private String    serverName;
  private String    baseDir;
  private String    analysisBaseDir;

  protected final static String   SESSION_DATATRACK_KEYS = "GNomExDataTrackKeys";

  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    // Get input parameters
    keysString = request.getParameter("keys");

    // Store download keys in session b/c Flex FileReference cannnot
    // handle long request parameter
    request.getSession().setAttribute(SESSION_DATATRACK_KEYS, keysString);

    serverName = request.getServerName();

  }

  public Command execute() throws RollBackCommandException {

    Session sess = null;
    try {
      sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());
      DictionaryHelper dh = DictionaryHelper.getInstance(sess);

      baseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null, PropertyDictionaryHelper.PROPERTY_DATATRACK_DIRECTORY);
      analysisBaseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null, PropertyDictionaryHelper.PROPERTY_ANALYSIS_DIRECTORY);
      String use_altstr = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.USE_ALT_REPOSITORY);
      if (use_altstr != null && use_altstr.equalsIgnoreCase("yes")) {
        analysisBaseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null,
                PropertyDictionaryHelper.ANALYSIS_DIRECTORY_ALT,this.getUsername());
      }

      long estimatedDownloadSize = 0;
      long uncompressedDownloadSize = 0;

      String[] keyTokens = keysString.split(":");
      for(int x = 0; x < keyTokens.length; x++) {
        String key = keyTokens[x];

        String[] idTokens = key.split(",");
        if (idTokens.length != 2) {
          throw new Exception("Invalid parameter format " + key + " encountered. Expected 99,99 for idDataTrack and idDataTrackGrouping");
        }
        Integer idDataTrack = Integer.valueOf(idTokens[0]);

        DataTrack dataTrack = DataTrack.class.cast(sess.load(DataTrack.class, idDataTrack));
        for (File file : dataTrack.getFiles(this.baseDir, this.analysisBaseDir)) {
          double compressionRatio = 1;
          if (file.getName().toUpperCase().endsWith("BAR")) {
            compressionRatio = 3;
          } else if (file.getName().toUpperCase().endsWith("BED")) {
            compressionRatio = 2.5;
          } else if (file.getName().toUpperCase().endsWith("GFF")) {
            compressionRatio = 3;
          } else if (file.getName().toUpperCase().endsWith("BRS")) {
            compressionRatio = 4;
          } else if (file.getName().toUpperCase().endsWith("BGN")) {
            compressionRatio = 3;
          } else if (file.getName().toUpperCase().endsWith("BGR")) {
            compressionRatio = 3;
          } else if (file.getName().toUpperCase().endsWith("BP1")) {
            compressionRatio = 3;
          } else if (file.getName().toUpperCase().endsWith("BP2")) {
            compressionRatio = 3;
          } else if (file.getName().toUpperCase().endsWith("CYT")) {
            compressionRatio = 3;
          } else if (file.getName().toUpperCase().endsWith("GTF")) {
            compressionRatio = 3;
          } else if (file.getName().toUpperCase().endsWith("PSL")) {
            compressionRatio = 3;
          } else if (file.getName().toUpperCase().endsWith("USEQ")) {
            compressionRatio = 1;
          } else if (file.getName().toUpperCase().endsWith("BNIB")) {
            compressionRatio = 2;
          }  else if (file.getName().toUpperCase().endsWith("FASTA")) {
            compressionRatio = 2;
          }
          estimatedDownloadSize += new BigDecimal(file.length() / compressionRatio).longValue();
          uncompressedDownloadSize += file.length();
        }
      }

      this.xmlResult = "<SUCCESS size=\"" +  Long.valueOf(estimatedDownloadSize).toString() + "\" uncompressedSize=\"" + Long.valueOf(uncompressedDownloadSize) + "\"" + "/>";
      this.setResponsePage(SUCCESS_JSP);

    } catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception occurred in GetEstimatedDownloadDataTrackSize ", e);
      throw new RollBackCommandException(e.getMessage());
    }
    return this;
  }
}
