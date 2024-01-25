package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.Analysis;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.PropertyDictionaryHelper;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.servlet.http.HttpSession;
import java.io.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class ManagePedFile extends GNomExCommand implements Serializable {

    private static Logger LOG = Logger.getLogger(ManagePedFile.class);

    private String serverName;

    private Integer idAnalysis;
    private String VCFpathName;
    private JsonArray PEDFileArray;
    private JsonArray PEDInfoArray;
    private JsonArray BAMInfoArray;
    private JsonArray VCFInfoArray;
    private String action = null;
    private int currentFile;

    public void validate() {
    }

    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

        // idAnalysis is required to save a .ped file
        idAnalysis = null;
        if (request.getParameter("idAnalysis") != null && !request.getParameter("idAnalysis").equals("")) {
            idAnalysis = Integer.valueOf(request.getParameter("idAnalysis"));
        }
        System.out.println("[ManagePedFile] idAnalysis: " + idAnalysis);

        action = null;
        if (request.getParameter("action") != null && !request.getParameter("action").equals("")) {
            action = request.getParameter("action");
        }
        System.out.println("[ManagePedFile] action: " + action);

        currentFile = 0;
        if (request.getParameter("fileOffset") != null && !request.getParameter("fileOffset").equals("")) {
            currentFile = Integer.valueOf(request.getParameter("fileOffset"));
        }
        System.out.println("[ManagePedFile] currentFile: " + currentFile);

        String theProband;
        if (request.getParameter("proband") != null && !request.getParameter("proband").equals("")) {
            theProband = request.getParameter("proband");
            System.out.println("[ManagePedFile] proband: " + theProband);
        }

        // getIds requires pathname of .vcf.gz file
        VCFpathName = null;
        if (request.getParameter("getIds") != null && !request.getParameter("getIds").equals("")) {
            VCFpathName = request.getParameter("getIds");
        }

        try {
            this.PEDFileArray = Util.readJSONArray(request, "PEDFile");
        } catch (Exception e) {
            this.addInvalidField("pedFileJSONString", "Invalid pedFileJSONString");
            this.errorDetails = Util.GNLOG(LOG, "Cannot parse pedFileJSONString", e);
        }

        try {
            this.PEDInfoArray = Util.readJSONArray(request, "PEDInfo");
        } catch (Exception e) {
            this.addInvalidField("pedInfoJSONString", "Invalid pedInfoJSONString");
            this.errorDetails = Util.GNLOG(LOG, "Cannot parse pedInfoJSONString", e);
        }

        try {
            this.BAMInfoArray = Util.readJSONArray(request, "BAMInfo");
        } catch (Exception e) {
            this.addInvalidField("BAMInfoJSONString", "Invalid BAMInfoJSONString");
            this.errorDetails = Util.GNLOG(LOG, "Cannot parse BAMInfoJSONString", e);
        }

        try {
            this.VCFInfoArray = Util.readJSONArray(request, "VCFInfo");
        } catch (Exception e) {
            this.addInvalidField("VCFInfoJSONString", "Invalid VCFInfoJSONString");
            this.errorDetails = Util.GNLOG(LOG, "Cannot parse VCFInfoJSONString", e);
        }

        serverName = request.getServerName();
    }

    public Command execute() throws RollBackCommandException {

        try {

            Session sess = HibernateSession.currentSession(this.getSecAdvisor().getUsername());
            String analysisBaseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null, PropertyDictionaryHelper.PROPERTY_ANALYSIS_DIRECTORY);
            System.out.println("[ManagePedFile] (1) analysisBaseDir:  " + analysisBaseDir);
            String use_altstr = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.USE_ALT_REPOSITORY);
            System.out.println("[ManagePedFile] use_altstr:  " + use_altstr);
            if (use_altstr != null && use_altstr.equalsIgnoreCase("yes")) {
                System.out.println("[ManagePedFile] username:  " + this.getSecAdvisor().getUsername());
                analysisBaseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null, PropertyDictionaryHelper.ANALYSIS_DIRECTORY_ALT, this.getUsername());
                System.out.println("[ManagePedFile] (2) analysisBaseDir:  " + analysisBaseDir);
            }

            Analysis a = sess.get(Analysis.class, idAnalysis);
            String analysisDirectory = Util.getAnalysisDirectory(analysisBaseDir, a);

            System.out.println("[ManagePedFile] analysisDirectory:  " + analysisDirectory + "analysisBaseDir: " + analysisBaseDir);
            if (VCFpathName != null) {
                // parse the header and get the sample id's into XML
                Document vcfIds = getVCFIds(VCFpathName);

                this.jsonResult = Util.convertXMLDocumentToJSONString(vcfIds);
                setResponsePage(this.SUCCESS_JSP);
            }

            // save the ped file renaming the old one to .bak
            if (action != null && action.equals("save")) {
                String pedpath = getPedFilePathname(currentFile, PEDInfoArray, analysisDirectory);

                String status = savePedFile(pedpath, PEDFileArray);
                if (status == null) {
                    JsonObject result = Json.createObjectBuilder()
                            .add("result", "SUCCESS")
                            .add("pedpath", pedpath)
                            .build();
                    this.jsonResult = result.toString();
                    setResponsePage(this.SUCCESS_JSP);
                } else {
                    // return the error
                    this.addInvalidField("Error saving ped file:", status);
                    JsonObject result = Json.createObjectBuilder()
                            .add("result", "ERROR")
                            .add("message", "Unable to save ped file")
                            .build();
                    this.jsonResult = result.toString();
                }
            }

            Map<Integer, String> headerMap = new HashMap<>();
            Map<String, String[]> peopleMap = new HashMap<>();

            Map<String, String> vcfMap = new HashMap<>();
            ArrayList<String> bamList = new ArrayList<>();

            String[] theProbands;

            // if action is create and there is no PEDInfoArray set action = create
            if (action != null && action.equals("setup")) {
                if (PEDInfoArray.size() == 0) {
                    action = "create";
                } else {
                    String pedpath = getPedFilePathname(currentFile, PEDInfoArray, analysisDirectory);
                    if (pedpath == null) {
                        action = "create";
                    }
                }
            }

            System.out.println("[ManagePedFile] (2) action: " + action);

            // action = setup; read the pedfile and augment it if needed then return the XML
            if (action != null && action.equals("setup")) {
                String pedpath = getPedFilePathname(currentFile, PEDInfoArray, analysisDirectory);

                String status = MakeGeneURL.setupPedFile(pedpath, headerMap, peopleMap);
                System.out.println("[ManagePedFile] after setupPedFile status: " + status);
                if (status != null && status.equals("extend")) {

                    // get the vcf info
                    MakeGeneURL.vcfInfoParser(VCFInfoArray, analysisDirectory, vcfMap);
                    System.out.println("[ManagePedFile] vcfMap.size: " + vcfMap.size());

                    // get the bam info
                    MakeGeneURL.bamInfoParser(BAMInfoArray, bamList);
                    System.out.println("[ManagePedFile] bamList.size: " + bamList.size());

                    // add bam and vcf information to everyone we can
                    status = MakeGeneURL.augmentPedFile(headerMap, peopleMap, vcfMap, bamList);
                    if (status == null) {
                        // are there any trio's?
                        theProbands = MakeGeneURL.findTrio(headerMap, peopleMap);
                        if (theProbands != null) {
                            status = "save choose";
                            System.out.println("[ManagePedFile] theProbands[0]: " + theProbands[0] + "theProbands.length: "
                                    + theProbands.length);
                        } else {
                            status = "parent save choose";
                        }
                    }
                } else if (status == null) {
                    // are there any trio's?
                    theProbands = MakeGeneURL.findTrio(headerMap, peopleMap);
                    if (theProbands != null) {
                        status = "choose";
                        System.out.println("[ManagePedFile] action = setup theProbands[0]: " + theProbands[0] + "theProbands.length: "
                                + theProbands.length);
                    } else {
                        status = "parent save choose";
                    }
                }

                System.out.println("[ManagePedFile] final status: " + status);

                // build the xml needed for the UI to call ManagePedFile
                Document ManagePedFile = MakeGeneURL.buildManagePedFileXML(pedpath, PEDInfoArray, VCFInfoArray, BAMInfoArray, headerMap, peopleMap, status);

                this.jsonResult = Util.convertXMLDocumentToJSONString(ManagePedFile);

                //System.out.println("[ManagePedFile] xmlResult:\n" + this.xmlResult);
                setResponsePage(this.SUCCESS_JSP);

            }

            // NOTE: action = launch is done in MakeGeneURL

            // action = create; setup pedpath, PEDInfoArray and create pedfile based on bam and vcf info
            if (action != null && action.equals("create")) {
                String pedpath = makePedFilePathname(idAnalysis, analysisDirectory);

                // get the vcf info
                MakeGeneURL.vcfInfoParser(VCFInfoArray, analysisDirectory, vcfMap);
                System.out.println("[ManagePedFile] vcfMap.size: " + vcfMap.size());

                // get the bam info
                MakeGeneURL.bamInfoParser(BAMInfoArray, bamList);
                System.out.println("[ManagePedFile] bamList.size: " + bamList.size());

                // create whatever ped file we can from the bam and vcf information
                String status = createPedFile(headerMap, peopleMap, vcfMap, bamList);
                if (status == null) {
                    status = "save";
                }
                // build the xml needed for the UI to call ManagePedFile
                Document ManagePedFile = MakeGeneURL.buildManagePedFileXML(pedpath, PEDInfoArray, VCFInfoArray, BAMInfoArray, headerMap, peopleMap, status);

                this.jsonResult = Util.convertXMLDocumentToJSONString(ManagePedFile);

                //System.out.println("[ManagePedFile] xmlResult:\n" + this.xmlResult);
                setResponsePage(this.SUCCESS_JSP);
            }

        } catch (Exception e) {
            this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in ManagePedFile ", e);
            throw new RollBackCommandException(e.getMessage());
        }

        return this;
    }

    private String createPedFile(Map<Integer, String> headerMap, Map<String, String[]> peopleMap, Map<String, String> vcfMap,
                                 ArrayList<String> bamList) {
        String[] columnNames = {"kindred_id", "sample_id", "paternal_id", "maternal_id", "sex", "affection_status", "bam", "vcf"};

        String status = null;

        if (vcfMap.size() == 0) {
            status = "Error: No .vcf.gz files found in analysis.";
            return status;
        }

    if (bamList.size() == 0) {
        status = "Error: No .bam or .cram files found in analysis.";
        return status;
    }

        // build headerMap
        int numcol = 0;
        for (String acolname : columnNames) {
            headerMap.put(numcol, acolname);
            numcol++;
        }

        // add every sample_id we got from the vcf.gz header as person if they have a bam file
        int numoverlap = 0;
        for (Map.Entry<String, String> entry : vcfMap.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();

            // is there a bam file?
            String bamfile = MakeGeneURL.findBAM(key, bamList);
            if (bamfile != null) {
                // add the person
                String[] pedentry = makePedEntry(key, bamfile, value);
                peopleMap.put(key, pedentry);
                numoverlap++;
            }
        } // end of for

    // any overlap?
    if (numoverlap == 0) {
        status = "Error: no overlapping bam/cram and vcf files.";
    }

        return status;
    }

    private String[] makePedEntry(String sample_id, String bamfile, String vcffile) {
        String[] pedEntry = new String[9];

        // since we are making the pedentry we already know the order of the column
        pedEntry[0] = "";
        pedEntry[1] = sample_id;
        pedEntry[2] = "0";
        pedEntry[3] = "0";
        pedEntry[4] = "U";
        pedEntry[5] = "-9";
        pedEntry[6] = "";
        pedEntry[7] = bamfile;
        pedEntry[8] = vcffile;
        return pedEntry;
    }

    private String makePedFilePathname(int idAnalysis, String analysisDirectory) {
        String pedpath;

        System.out.println("[makePedFilePathname] idAnalysis: " + idAnalysis + " analysisDirectory: " + analysisDirectory);

        pedpath = analysisDirectory + "/A" + idAnalysis + ".ped";
        System.out.println("[makePedFilePathname] pedpath: " + pedpath);

        return pedpath;
    }

    private String getPedFilePathname(int currentFile, JsonArray pedInfoArray, String analysisDirectory) {

        String pedpath = null;

        if (pedInfoArray.size() == 0) {
            return null;
        }

        int numFiles = -1;
        for (int arrayIndex = 0; arrayIndex < pedInfoArray.size(); arrayIndex++) {
            JsonObject node = pedInfoArray.getJsonObject(arrayIndex);
            numFiles++;

            if (numFiles != currentFile) {
                continue;
            }

            String path = node.getString("path");
            pedpath = path;
            String cpath = path.replace("\\", "/").toLowerCase();
            String canaldir = analysisDirectory.replace("\\", "/").toLowerCase();

            if (!cpath.startsWith(canaldir)) {
                pedpath = analysisDirectory + "/" + path;
            }
            break;
        }

        return pedpath;
    }

    private String savePedFile(String pedpath, JsonArray pedFileArray) {
        String separator = "";
        ArrayList<String> columnNames = new ArrayList<>();

        try {
            StringBuilder theHeader = new StringBuilder("#");
            int numnames = 0;
            for (int pedFileIndex = 0; pedFileIndex < pedFileArray.size(); pedFileIndex++) {
                JsonObject node = pedFileArray.getJsonObject(pedFileIndex);
                if (node.get("pedFileType") == null || !node.getString("pedFileType").equals("header")) {
                    continue;
                }

                if (numnames > 0) {
                    separator = "\t";
                }
                String columnName = node.getString("name");
                theHeader.append(separator);
                theHeader.append(columnName);
                columnNames.add(columnName);
                numnames++;
            }
            theHeader.append("\n");
            System.out.println("[savePedFile] theHeader: " + theHeader);

            backupPedFile(pedpath);

            BufferedWriter pout = new BufferedWriter(new FileWriter(pedpath));
            pout.write(theHeader.toString());

            StringBuilder theEntry;
            int numcols;
            int numentry = 0;
            for (int pedFileIndex = 0; pedFileIndex < pedFileArray.size(); pedFileIndex++) {
                JsonObject node = pedFileArray.getJsonObject(pedFileIndex);
                if (node.get("pedFileType") == null || !node.getString("pedFileType").equals("entry")) {
                    continue;
                }

                theEntry = new StringBuilder();
                numcols = 0;
                separator = "";
                for (String theColumn : columnNames) {
                    if (numcols > 0) {
                        separator = "\t";
                    }

                    String value = node.getString(theColumn);

                    // map sex and affection_status
                    if (theColumn.equals("sex")) {
                        value = MakeGeneURL.mapSex(2, value);
                    }
                    if (theColumn.equals("affection_status")) {
                        value = MakeGeneURL.mapAffected(2, value);
                    }

                    theEntry.append(separator);
                    theEntry.append(value);
                    numcols++;
                }
                theEntry.append("\n");
                System.out.println("[savePedFile] numentry: " + numentry + " theEntry: " + theEntry.toString());

                pout.write(theEntry.toString());
                numentry++;
            }

            pout.flush();
            pout.close();

        } catch (IOException e) {
            LOG.error("Error writing ped file ", e);
            this.addInvalidField("ManagePedFile", "Error writing ped file");
        }

        return null;
    }

    private void backupPedFile(String pedpath) {

        File backup = new File(pedpath + ".bak");
        if (backup.exists()) {
            backup.delete();
        }

        File pedFile = new File(pedpath);
        pedFile.renameTo(backup);
    }

    private static Document getVCFIds(String VCFpathName) {

        System.out.println("[getVCFIds] VCFpathName: " + VCFpathName);

        Document vcfIds;

/*
	String[] cmd = { "tabix", "-H", "" };
	cmd[2] = VCFpathName;

	// run tabix to get the header
	try {
		ProcessBuilder pb = new ProcessBuilder(cmd);

		Process p = pb.start();

		BufferedReader bri = new BufferedReader(new InputStreamReader(p.getInputStream()));

		String line = "";
		while ((line = bri.readLine()) != null) {
			lastline = line;
		}

		// System.out.println("[getVCFIds] linelast: " + lastline);
	} catch (Exception e) {
		LOG.error("ManagePedFile error procing tabix", e);
		System.out.println("[getVCFIds] tabix proc error: " + e);
	}
*/
        String lastline = Util.getVCFHeader(VCFpathName);
        vcfIds = new Document(new Element("VCFIdList"));

        // parse the ids out of the last line
        String[] pieces = lastline.split("\t");
        int numids = 0;

        boolean sawFormat = false;
        for (String piecesString : pieces) {
            if (sawFormat) {
                numids++;
                Element viNode = new Element("VCFId");
                viNode.setAttribute("id", piecesString);
                vcfIds.getRootElement().addContent(viNode);
                continue;
            }

            if (piecesString.equals("FORMAT")) {
                sawFormat = true;
            }
        }

        System.out.println("[getVCFIds] numids: " + numids);

        return vcfIds;
    }

}
