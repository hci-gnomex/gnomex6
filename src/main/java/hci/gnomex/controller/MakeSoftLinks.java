package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.json.Json;
import javax.servlet.http.HttpSession;
import java.io.File;
import java.io.IOException;
import java.io.Serializable;
import java.util.List;

public class MakeSoftLinks extends GNomExCommand implements Serializable {

    private static Logger LOG = Logger.getLogger(MakeSoftLinks.class);

    private String directory_bioinformatics_scratch;
    private FileDescriptorParser parser = null;

    protected final static String SESSION_KEY_FILE_DESCRIPTOR_PARSER = "GNomExFileDescriptorParser";

    public void validate() {
    }

    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
        // Get the files JSON string
        try {
            this.parser = new FileDescriptorParser(Util.readJSONArray(request, "fileDescriptorJSONString"));
        } catch (Exception e) {
            this.addInvalidField("fileDescriptorJSONString", "Invalid fileDescriptorJSONString");
            this.errorDetails = Util.GNLOG(LOG, "Cannot parse fileDescriptorJSONString", e);
        }
    }

    public Command execute() throws RollBackCommandException {
        try {
            Session sess = HibernateSession.currentSession(this.getSecAdvisor().getUsername());

            directory_bioinformatics_scratch = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.DIRECTORY_BIOINFORMATICS_SCRATCH);

            String softLinkPath = makeSoftLinks();

            this.jsonResult = Json.createObjectBuilder()
                    .add("result", "SUCCESS")
                    .add("softLinkPath", softLinkPath)
                    .build().toString();
            setResponsePage(this.SUCCESS_JSP);
        } catch (Exception e) {
            this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in MakeSoftLinks ", e);
            throw new RollBackCommandException(e.getMessage());
        }

        return this;
    }
    private String makeSoftLinks() throws Exception {
        // Create the users' soft link directory
        String username1 = username;
        if (username1 == null) {
            username1 = "Guest";
        }
        File dir = new File(directory_bioinformatics_scratch, username1);
        if (!dir.exists())
            dir.mkdir();

        String baseDir = dir.getPath();

        parser.parse();

        String requestNumber = parser.getRequestNumbers().iterator().next();

        // directory for the request
        File rdir = new File(baseDir, requestNumber);
        if (rdir.exists()) {
            destroyFolder(rdir);
        } else {
            rdir.mkdir();
        }

        String softLinkPath = rdir.getPath();

        List<FileDescriptor> fileDescriptors = parser.getFileDescriptors(requestNumber);

        // For each file to create a soft link for
        for (FileDescriptor fd : fileDescriptors) {
            // Ignore md5 files
            if (fd.getType().equals("md5")) {
                continue;
            }

            String targetPath = fd.getFileName();

            // build the soft link path
            String linkPath = softLinkPath + Constants.FILE_SEPARATOR;

            String zipFileName = fd.getZipEntryName();
            String[] pieces = zipFileName.split(Constants.FILE_SEPARATOR);

            // make any directories we need
            int lpieces = pieces.length;
            for (int i = 1; i <= lpieces - 2; i++) {
                File ldir = new File(linkPath, pieces[i]);
                if (!ldir.exists()) {
                    ldir.mkdir();
                }

                linkPath = linkPath + pieces[i] + Constants.FILE_SEPARATOR;
            }

            linkPath = linkPath + pieces[lpieces - 1];

            // make the soft link
            makeSoftLinkViaUNIXCommandLine(targetPath, linkPath);
        }

        return softLinkPath;
    }

    private static void makeSoftLinkViaUNIXCommandLine(String realFile, String link) {
        try {
            String realFile1 = "'" + realFile + "'";
            String link1 = "'" + link + "'";
            String[] cmd = {"ln", "-s", realFile1, link1};
            Runtime.getRuntime().exec(cmd);
        } catch (IOException e) {
            LOG.error("Error in MakeSoftLinks", e);
        }
    }

    private static void destroyFolder(File linkDir) {
        File[] directoryList = linkDir.listFiles();

        for (File directory : directoryList) {
            delete(directory);
        }
    }

    private static void delete(File f) {
        try {
            if (f.isDirectory()) {
                for (File c : f.listFiles()) {
                    delete(c);
                }
            }

            f.delete();
        } catch (Exception e) {
            LOG.error("Error in makeSoftLinks.java", e);
        }
    }

}
