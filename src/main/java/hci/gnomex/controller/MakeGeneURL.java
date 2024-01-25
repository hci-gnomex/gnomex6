package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.Analysis;
import hci.gnomex.model.GenomeBuild;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.servlet.http.HttpSession;
import java.io.*;
import java.util.*;

public class MakeGeneURL extends GNomExCommand implements Serializable {

    private static Logger LOG = Logger.getLogger(MakeGeneURL.class);
    private String serverName;
    private String pedpath;
    private String geneiobioviewerURL;
    private String dataTrackFileServerWebContext;
    private String baseURL;
    private File dir;
    private int idAnalysis;

    private String theProband = null;
    private JsonArray VCFInfoArray;
    private JsonArray BAMInfoArray;
    private JsonArray PEDFileArray;
    private String analysisDirectory = null;
    protected String errorDetails = "";

    public void validate() {
    }

    @Override
    public HttpServletWrappedRequest setRequestState(HttpServletWrappedRequest httpServletRequest) {
        return null;
    }

    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

        if (request.getParameter("idAnalysis") != null) {
            idAnalysis = Integer.valueOf(request.getParameter("idAnalysis"));
            System.out.println("[MakeGeneURL] idAnalysis: " + idAnalysis);
        }

        // the .ped file
        if (request.getParameter("fileName") != null && !request.getParameter("fileName").equals("")) {
            pedpath = request.getParameter("fileName");
            System.out.println("[MakeGeneURL] pedpath: " + pedpath);
        }

        // the proband, needed if .ped file has more than one
        if (request.getParameter("proband") != null && !request.getParameter("proband").equals("")) {
            String theProbandJSON = request.getParameter("proband");
            System.out.println("[MakeGeneURL] theProbandJSON: " + theProbandJSON);
            theProband = getProband(theProbandJSON);
            System.out.println("[MakeGeneURL] theProband: " + theProband);
        }

        // Get the VCFInfo JSON string
        try {
            this.VCFInfoArray = Util.readJSONArray(request, "VCFInfo");
        } catch (Exception e) {
            this.addInvalidField("VCFInfoJSONString", "Invalid VCFInfoJSONString");
            this.errorDetails = Util.GNLOG(LOG, "Cannot parse VCFInfoJSONString", e);
        }

        // Get the BAMInfo JSON string
        try {
            this.BAMInfoArray = Util.readJSONArray(request, "BAMInfo");
        } catch (Exception e) {
            this.addInvalidField("BAMInfoJSONString", "Invalid BAMInfoJSONString");
            this.errorDetails = Util.GNLOG(LOG, "Cannot parse BAMInfoJSONString", e);
        }

        // Get the PedFile JSON string
        try {
            this.PEDFileArray = Util.readJSONArray(request, "PEDFile");
        } catch (Exception e) {
            this.addInvalidField("PEDFileJSONString", "Invalid PEDFileJSONString");
            this.errorDetails = Util.GNLOG(LOG, "Cannot parse PEDFileJSONString", e);
        }

        serverName = request.getServerName();
    }

    public Command execute() throws RollBackCommandException {

        try {

            Session sess = HibernateSession.currentSession(this.getSecAdvisor().getUsername());

            geneiobioviewerURL = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.GENE_IOBIO_VIEWER_URL);
            dataTrackFileServerWebContext = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.DATATRACK_FILESERVER_WEB_CONTEXT);
            baseURL = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.DATATRACK_FILESERVER_URL);

            String baseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null, PropertyDictionaryHelper.PROPERTY_ANALYSIS_DIRECTORY);
            String use_altstr = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.USE_ALT_REPOSITORY);
            if (use_altstr != null && use_altstr.equalsIgnoreCase("yes")) {
                baseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null, PropertyDictionaryHelper.ANALYSIS_DIRECTORY_ALT, this.getUsername());
            }

            Map<Integer, String> headerMap = new HashMap<>();
            Map<String, String[]> peopleMap = new HashMap<>();

            Map<String, String> vcfMap = new HashMap<>();
            ArrayList<String> bamList = new ArrayList<>();

            Analysis a = sess.get(Analysis.class, idAnalysis);
            analysisDirectory = Util.getAnalysisDirectory(baseDir, a);
            System.out.println("[MakeGeneURL] baseDir: " + baseDir + " analysisDirectory: " + analysisDirectory);

            // genome build
            String gBN = null;
            if (a != null) {
                Set<GenomeBuild> gbs = a.getGenomeBuilds();
                if (gbs != null && gbs.iterator().hasNext()) {
                    GenomeBuild gb = gbs.iterator().next();
                    if (gb != null) {
                        String genomeBuildName = gb.getGenomeBuildName(); //Just pull the first one, should only be one.

                        gBN = Util.getGRCName(genomeBuildName);
                    }
                }
            }
            String[] theProbands;

            String status;
            if (theProband != null && !theProband.equals("")) {
                // process the ped file xml
                status = setupPedFileFromJSON(PEDFileArray, headerMap, peopleMap);
                System.out.println("[MakeGeneURL] after launch setupPedFileFromJSON status: " + status);

                // get the vcf info so we can validate
                vcfInfoParser(VCFInfoArray, analysisDirectory, vcfMap);

                // validate the pedfile
                status = validatePedFile(theProband, headerMap, peopleMap, vcfMap);
                System.out.println("[MakeGeneURL] after validatePedFile status: -->" + status + "<---");

                // are we ok?
                if (status == null) {
                    // yes, construct the URL
                    ArrayList<String> urlsToLink = processTrio(theProband, headerMap, peopleMap, gBN);
                    System.out.println("[MakeGeneURL] the url: " + urlsToLink.get(0));

                    this.jsonResult = Json.createObjectBuilder()
                            .add("result", "SUCCESS")
                            .add("urlsToLink", urlsToLink.get(0))
                            .build().toString();
                } else {
                    // nope, something is not right
                    this.jsonResult = Json.createObjectBuilder()
                            .add("result", "ERROR")
                            .add("status", status)
                            .build().toString();

                    setResponsePage(this.SUCCESS_JSP);
                }
                setResponsePage(this.SUCCESS_JSP);
            } else {
                // parse the .ped file
                // adds empty bam and vcf columns if needed
                status = setupPedFile(pedpath, headerMap, peopleMap);
                System.out.println("[MakeGeneURL] after setupPedFile status: " + status);
                if (status != null && status.equals("extend")) {

                    // get the vcf info
                    vcfInfoParser(VCFInfoArray, analysisDirectory, vcfMap);
                    System.out.println("[MakeGeneURL] vcfMap.size: " + vcfMap.size());

                    // get the bam info
                    bamInfoParser(BAMInfoArray, bamList);
                    System.out.println("[MakeGeneURL] bamList.size: " + bamList.size());

                    // add bam and vcf information to everyone we can
                    status = augmentPedFile(headerMap, peopleMap, vcfMap, bamList);

                    if (status == null) {
                        // find the first person in a trio
                        theProbands = findTrio(headerMap, peopleMap);
                        if (theProbands != null) {
                            System.out.println("[MakeGeneURL] (1) theProbands[0]: " + theProbands[0] + "theProbands.length: "
                                    + theProbands.length);
                        }
                        if (theProbands == null) {
                            status = "parent save choose";
                        } else if (theProbands.length > 1) {
                            status = "save choose";
                        } else {
                            theProband = theProbands[0];
                            status = null;
                        }
                    }
                }

                if (status == null) {
                    // if no proband specified, find the 1st trio
                    if (theProband == null) {
                        theProbands = findTrio(headerMap, peopleMap);
                        if (theProbands != null) {
                            System.out.println("[MakeGeneURL] (2) theProbands[0]: " + theProbands[0]
                                    + "theProbands.length: " + theProbands.length);
                        }

                        if (theProbands == null) {
                            status = "parent save choose";
                        } else if (theProbands.length > 1) {
                            status = "choose";
                        } else {
                            theProband = theProbands[0];
                            status = null;
                        }
                    }
                }

                System.out.println("[MakeGeneURL] before final processTrio status: " + status + " theProband: " + theProband);

                if (status == null) {
                    // construct the URL
                    ArrayList<String> urlsToLink = processTrio(theProband, headerMap, peopleMap, gBN);
                    System.out.println("[MakeGeneURL] the url: " + urlsToLink.get(0));

                    this.jsonResult = Json.createObjectBuilder()
                            .add("result", "SUCCESS")
                            .add("urlsToLink", urlsToLink.get(0))
                            .build().toString();
                } else {
                    // build the xml needed for the UI to call ManagePedFile
                    Document ManagePedFile = buildManagePedFileXML(pedpath, null, VCFInfoArray, BAMInfoArray, headerMap, peopleMap, status);

                    this.jsonResult = Util.convertXMLDocumentToJSONString(ManagePedFile);
                }
                setResponsePage(this.SUCCESS_JSP);
            }
        } catch (Exception e) {
            this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in MakeGeneURL ", e);
            throw new RollBackCommandException(e.getMessage());
        }

        return this;
    }

    private String getProband(String probandJSON) {
        int spos = probandJSON.indexOf("sample_id=\"");
        System.out.println("[getProband] spos: " + spos);
        if (spos == -1) {
            return null;
        }

        int epos = probandJSON.indexOf("\"", spos + 11);
        System.out.println("[getProband] epos: " + epos);
        if (epos == -1) {
            return null;
        }

        return probandJSON.substring(spos + 11, epos);
    }

    /*
     * Process PEDFileArray and setup headerMap and peopleMap
     */
    private String setupPedFileFromJSON(JsonArray pedFileArray, Map<Integer, String> headerMap, Map<String, String[]> peopleMap) {
        String status = null;
        ArrayList<String> columnNames = new ArrayList<>();

        int sample_id = -1;
        int numnames = 0;
        for (int index = 0; index < pedFileArray.size(); index++) {
            JsonObject node = pedFileArray.getJsonObject(index);
            if (node.get("pedFileType") == null || !node.getString("pedFileType").equals("header")) {
                continue;
            }

            if (node.get("name") == null) {
                status = "Error: ped file has incorrect format.";
                return status;
            }
            String columnName = node.getString("name");

            if (columnName.toLowerCase().equals("sample_id")) {
                sample_id = numnames;
            }

            columnNames.add(columnName);

            headerMap.put(numnames, columnName);
            numnames++;
        }

        String[] theEntry;
        int numcols;
        int numentry = 0;

        for (int index = 0; index < pedFileArray.size(); index++) {
            JsonObject node = pedFileArray.getJsonObject(index);
            if (node.get("pedFileType") == null || !node.getString("pedFileType").equals("entry")) {
                continue;
            }

            theEntry = new String[numnames];
            numcols = 0;
            for (String theColumn : columnNames) {
                String value = node.getString(theColumn);
                theEntry[numcols] = value;
                numcols++;
            }

            peopleMap.put(theEntry[sample_id], theEntry);
            System.out.println("[setupPedFileFromJSON] numentry: " + numentry + " sample_id: " + sample_id + " theEntry[sample_id]: " + theEntry[sample_id] + " theEntry: " + theEntry[1] + " " + theEntry[2] + " " + theEntry[3]);
            numentry++;
        }

        return status;
    }

    static String setupPedFile(String pedpath, Map<Integer, String> headerMap, Map<String, String[]> peopleMap) {
        String status = null;
        boolean sawOne = false;

        System.out.println("[setupPedFile] pedpath: " + pedpath);

        if (pedpath == null) {
            return null;
        }

        try {
            BufferedReader br = new BufferedReader(new FileReader(pedpath));

            String line;
            boolean sawHeader = false;
            boolean sawbam = false;
            boolean sawvcf = false;
            boolean sawsex = false;
            boolean sawaffected = false;
            int addedColumns = 0;
            int sampleId = -1;

            while ((line = br.readLine()) != null) {
                if (line.equals("")) {
                    continue;
                }

                if (!sawHeader) {
                    if (!line.startsWith("#")) {
                        status = "Error: Header line missing in ped file.";
                        break;
                    }
                    sawHeader = true;

                    line = line.toLowerCase();
                    if (line.contains("\tbam")) {
                        sawbam = true;
                    }
                    if (line.contains("\tvcf")) {
                        sawvcf = true;
                    }
                    if (line.contains("\tsex")) {
                        sawsex = true;
                    }
                    if (line.contains("\taffect")) {
                        sawaffected = true;
                    }

                    if (!sawsex) {
                        line += "\tsex";
                        addedColumns++;
                        status = "extend";
                    }

                    if (!sawaffected) {
                        line += "\taffection_status";
                        addedColumns++;
                        status = "extend";
                    }

                    if (!sawbam) {
                        line += "\tbam";
                        addedColumns++;
                        status = "extend";
                    }

                    if (!sawvcf) {
                        line += "\tvcf";
                        addedColumns++;
                        status = "extend";
                    }

                    String[] header = line.split("\t");

                    for (int ii = 0; ii < header.length; ii++) {
                        System.out.println("[setupPedFile] column: " + ii + " name: " + header[ii]);
                        if (ii == 0) {
                            headerMap.put(ii, header[ii].substring(1));
                        } else {
                            headerMap.put(ii, header[ii]);
                        }
                    }

                    // which column is the sample_id
                    sampleId = mapColumn("sample_id", headerMap);
                    if (sampleId == -1) {
                        // no sample_id is fatal
                        status = "Error: No sample id's found in ped file.";
                        break;
                    }

                    continue;
                } // end of if !sawHeader

                String[] person = line.split("\t");
                int realLength = person.length + addedColumns;
                String[] thePerson = new String[realLength];

                System.arraycopy(person, 0, thePerson, 0, person.length);

                String sampleid = thePerson[sampleId];

                // debug
                if (!sawOne) {
                    System.out.println("[setupPedFile] sampleid: " + sampleid + " thePerson.length: " + thePerson.length + " headerMap.size: " + headerMap.size());
                    for (int ii = 0; ii < thePerson.length; ii++) {
                        System.out.println("[setupPedFile] thePerson ii: " + ii + " value: " + thePerson[ii]);
                    }
                    sawOne = true;
                }

                peopleMap.put(sampleid, thePerson);
            }

            br.close();
        } catch (IOException e) {
            status = "Error: Unable to read ped file.";
        }

        System.out.println("[setupPedFile] returning status: " + status);
        return status;
    }

    private static int mapColumn(String colName, Map<Integer, String> headerMap) {
        int column = -1;

        for (Map.Entry<Integer, String> entry : headerMap.entrySet()) {
            int key = entry.getKey();
            String value = entry.getValue();
            if (colName.equals(value)) {
                return key;
            }
        }

        return column;
    }

    /*
     * Add bam and vcf file information to everyone we can
     */
    static String augmentPedFile(Map<Integer, String> headerMap, Map<String, String[]> peopleMap, Map<String, String> vcfMap, ArrayList<String> bamList) {

        String status = null;

        if (vcfMap.size() == 0) {
            status = "Error: No .vcf.gz files found in analysis.";
            return status;
        }

        if (bamList.size() == 0) {
            status = "Error: No .bam files found in analysis.";
            return status;
        }

        // column numbers
        int BAM = mapColumn("bam", headerMap);
        int VCF = mapColumn("vcf", headerMap);

        int numsaw = 0;
        int numvcf = 0;
        int numbam = 0;
        int numboth = 0;

        for (Map.Entry<String, String[]> entry : peopleMap.entrySet()) {
            String key = entry.getKey();
            String[] value = entry.getValue();
            numsaw++;

            // add VCF file if needed and we can find it
            if (value[VCF] == null || value[VCF].equals("")) {
                value[VCF] = vcfMap.get(key);
                if (value[VCF] != null) {
                    // System.out.println("[augmentPedFile] cant find vcf, key: " + key);
                    numvcf++;
                }
            }

            // same for the BAM file
            if (value[BAM] == null || value[BAM].equals("")) {
                value[BAM] = findBAM(key, bamList);
                if (value[BAM] != null) {
                    numbam++;
                }
            }

            if (value[BAM] != null && value[VCF] != null) {
                numboth++;
            }

            // save it
            peopleMap.put(key, value);
        }

        System.out.println("[augmentPedFile] numsaw: " + numsaw + " numvcf: " + numvcf + " numbam: " + numbam + " numboth: " + numboth);

        if (numboth == 0) {
            status = "Error: no overlapping bam/cram and vcf files.";
        }

        return status;
    }

    static String findBAM(String sampleId, ArrayList<String> bamList) {
        String theBamFile = null;

        for (String aBamFile : bamList) {
            if (aBamFile.contains(sampleId)) {
                theBamFile = aBamFile;
                break;
            }
        }

        return theBamFile;
    }

    private ArrayList<String> processTrio(String theProband, Map<Integer, String> headerMap, Map<String, String[]> peopleMap, String gBN) {
        ArrayList<String> theURLS = new ArrayList<>();

        System.out.println("[processTrio] theProband: " + theProband);

        // note the gene name is always set to BRCA1 because that information is not in the ped file
        String genename = "BRCA1";

        // column numbers
        int SAMPLEID = mapColumn("sample_id", headerMap);
        int FATHER = mapColumn("paternal_id", headerMap);
        int MOTHER = mapColumn("maternal_id", headerMap);
        int BAM = mapColumn("bam", headerMap);
        int VCF = mapColumn("vcf", headerMap);

        String url = geneiobioviewerURL + "/?rel0=proband";

        dir = setupDirectories();

        // get the proband
        String[] proband = peopleMap.get(theProband);
        if (proband == null) {
            return null;
        }

        String sample0 = proband[SAMPLEID];
        String motherId = proband[MOTHER];
        String fatherId = proband[FATHER];
        System.out.println("[processTrio] sample0: " + sample0 + " motherId: " + motherId + " fatherId: " + fatherId);

        String theMother = "mother";
        String[] mother = peopleMap.get(motherId);
        if (mother == null) {
            System.out.println("[processTrio] no mother, motherId: " + motherId);
            theMother = "";
        }

        String theFather = "father";
        String[] father = peopleMap.get(fatherId);
        if (father == null) {
            System.out.println("[processTrio] no father, fatherId: " + fatherId);
            theFather = "";
        }

        String bam1 = "";
        String vcf1 = "";
        String sample1 = "";

        if (!theMother.equals("")) {
            bam1 = makeURLLink(mother[BAM]);
            vcf1 = makeURLLink(mother[VCF]);
            sample1 = motherId;
        }

        String bam2 = "";
        String vcf2 = "";
        String sample2 = "";

        if (!theFather.equals("")) {
            bam2 = makeURLLink(father[BAM]);
            vcf2 = makeURLLink(father[VCF]);
            sample2 = fatherId;
        }

        String bam0 = makeURLLink(proband[BAM]);
        String vcf0 = makeURLLink(proband[VCF]);

        url = url + "&rel1=" + theMother + "&rel2=" + theFather + "&gene=" + genename + "&name0=proband" + "&bam0=" + bam0;
        url = url + "&name1=" + theMother + "&bam1=" + bam1;
        url = url + "&name2=" + theFather + "&bam2=" + bam2;
        url = url + "&vcf0=" + vcf0 + "&sample0=" + sample0;
        url = url + "&vcf1=" + vcf1 + "&sample1=" + sample1;
        url = url + "&vcf2=" + vcf2 + "&sample2=" + sample2;

        if (gBN != null) {
            url = url + "&build=" + gBN;
        }

        url = url.replace("\\", "/");

        theURLS.add(url);

        return theURLS;
    }

    // validate the pedfile, vcf.gz must exist and contain sample id
    // bam file must exist

    private String validatePedFile(String theProband, Map<Integer, String> headerMap, Map<String, String[]> peopleMap, Map<String, String> vcfMap) {
        String status = null;
        String statusStart = "Error: wrong vcf file or vcf file not found: ";
        boolean firstError = true;

        String bstatus = null;
        String bstatusStart = "Error: bam file not found: ";
        boolean bfirstError = true;

        System.out.println("[validatePedFile] theProband: " + theProband);

        // column numbers
        int SAMPLEID = mapColumn("sample_id", headerMap);
        int FATHER = mapColumn("paternal_id", headerMap);
        int MOTHER = mapColumn("maternal_id", headerMap);
        int BAM = mapColumn("bam", headerMap);
        int VCF = mapColumn("vcf", headerMap);

        // get the proband
        String[] proband = peopleMap.get(theProband);
        if (proband == null) {
            return "Unable to find proband";
        }

        String sample0 = proband[SAMPLEID];
        String motherId = proband[MOTHER];
        String fatherId = proband[FATHER];
        System.out.println("[validatePedFile] sample0: " + sample0 + " motherId: " + motherId + " fatherId: " + fatherId);

        // does the vcf file contain the sampleId?
        String vcfPath = vcfMap.get(sample0);
        File vcfFile = null;
        if (vcfPath != null && !vcfPath.equals("")) {
            vcfFile = new File(analysisDirectory + "/" + vcfPath);
        }

        if (vcfPath == null || !vcfPath.equals(proband[VCF]) || !vcfFile.exists()) {
            if (firstError) {
                status = statusStart + "proband";
                firstError = false;
            } else {
                status += "proband";
            }
        } // check proband vcf file

        String bamPath = proband[BAM];

        File bamFile = null;
        if (bamPath != null && !bamPath.equals("")) {
            bamFile = new File(analysisDirectory + "/" + bamPath);
        }
        if (bamPath == null || bamFile == null || !bamFile.exists()) {
            if (bfirstError) {
                bstatus = bstatusStart + "proband";
                bfirstError = false;
            } else {
                bstatus += "proband";
            }

        }

        String theMother = "mother";
        String[] mother = peopleMap.get(motherId);
        if (mother == null) {
            System.out.println("[validatePedFile] no mother, motherId: " + motherId);
            theMother = "";
        }

        if (!theMother.equals("")) {
            // Mothers vcf file ok?
            vcfPath = vcfMap.get(motherId);

            vcfFile = null;
            if (vcfPath != null && !vcfPath.equals("")) {
                vcfFile = new File(analysisDirectory + "/" + vcfPath);
            }

            if (vcfPath == null || !vcfPath.equals(mother[VCF]) || !vcfFile.exists()) {
                if (firstError) {
                    status = statusStart + "mother";
                    firstError = false;
                } else {
                    status += ", mother";
                }
            } // check mother vcf file

            bamPath = mother[BAM];
            bamFile = null;
            if (bamPath != null && !bamPath.equals("")) {
                bamFile = new File(analysisDirectory + "/" + bamPath);
            }

            if (bamPath == null || !bamFile.exists()) {
                if (bfirstError) {
                    bstatus = bstatusStart + "mother";
                    bfirstError = false;
                } else {
                    bstatus += ", mother";
                }

            }

        } // theMother is not ""

        String theFather = "father";
        String[] father = peopleMap.get(fatherId);
        if (father == null) {
            System.out.println("[validatePedFile] no father, fatherId: " + fatherId);
            theFather = "";
        }

        if (!theFather.equals("")) {
            // Fathers vcf file ok?
            vcfPath = vcfMap.get(fatherId);
            vcfFile = null;
            if (vcfPath != null && !vcfPath.equals("")) {
                vcfFile = new File(analysisDirectory + "/" + vcfPath);
            }


            if (vcfPath == null || !vcfPath.equals(father[VCF]) || !vcfFile.exists()) {
                if (firstError) {
                    status = statusStart + "father";
                    firstError = false;
                } else {
                    status += ", father";
                }
            } // check father vcf file

            bamPath = father[BAM];

            bamFile = null;
            if (bamPath != null && !bamPath.equals("")) {
                bamFile = new File(analysisDirectory + "/" + bamPath);
            }

            if (bamPath == null || !bamFile.exists()) {
                if (bfirstError) {
                    bstatus = bstatusStart + "father";
                    bfirstError = false;
                } else {
                    bstatus += ", father";
                }

            }

        } // theFather is not ""

        String theStatus = "";
        if (status != null) {
            theStatus += status + "\n";
        }
        if (bstatus != null) {
            theStatus += bstatus + "\n";
        }

        System.out.println("[validatePedFile] returning theStatus: " + theStatus);

        if (theStatus.equals("")) {
            theStatus = null;
        }
        return theStatus;
    }

    /*
     * Returns the sample_id of everyone with a mother, father, bam and vcf info for them and their parents
     */
    static String[] findTrio(Map<Integer, String> headerMap, Map<String, String[]> peopleMap) {
        String[] theProbands;
        ArrayList<String> probands = new ArrayList<>();

        // column numbers
        int FATHER = mapColumn("paternal_id", headerMap);
        int MOTHER = mapColumn("maternal_id", headerMap);
        if (FATHER == -1 || MOTHER == -1) {
            return null;
        }

        int BAM = mapColumn("bam", headerMap);
        int VCF = mapColumn("vcf", headerMap);

        // go thru the people
        for (Map.Entry<String, String[]> entry : peopleMap.entrySet()) {
            String key = entry.getKey();
            String[] value = entry.getValue();

            // must have a father
            if (value[FATHER] == null || value[FATHER].equals("")) {
                continue;
            }

            // must have a mother
            if (value[MOTHER] == null || value[MOTHER].equals("")) {
                continue;
            }

            // must have a bam file
            if (value.length < BAM + 1 || value[BAM] == null || value[BAM].equals("")) {
                continue;
            }

            // must have a vcf file
            if (value.length < VCF + 1 || value[VCF] == null || value[VCF].equals("")) {
                continue;
            }

            // father must have a bam and vcf file
            if (!hasBAMVCF(BAM, VCF, value[FATHER], peopleMap)) {
                continue;
            }

            // mother must have a bam and vcf file
            if (!hasBAMVCF(BAM, VCF, value[MOTHER], peopleMap)) {
                continue;
            }

            // we found one!
            probands.add(key);
            System.out.println("[findTrio] key: " + key + " probands.size(): " + probands.size());
            // theProband = key;
            // break;
        }

        if (probands.size() == 0) {
            return null;
        }

        theProbands = new String[probands.size()];
        int nump = 0;
        for (String aProband : probands) {
            theProbands[nump] = aProband;
            nump++;
        }

        return theProbands;
    }

    private static boolean hasBAMVCF(int BAM, int VCF, String sampleId, Map<String, String[]> peopleMap) {
        boolean hasBAMVCF = false;

        String[] value = peopleMap.get(sampleId);

        if (value == null || value.length < BAM + 1 || value.length < VCF + 1) {
            return false;
        }

        if (value[BAM] != null && !value[BAM].equals("") && value[VCF] != null && !value[VCF].equals("")) {
            hasBAMVCF = true;
        }

        return hasBAMVCF;
    }

    static void vcfInfoParser(JsonArray vcfInfoArray, String analysisDirectory, Map<String, String> vcfMap) {

        if (vcfInfoArray == null || vcfInfoArray.size() == 0) {
            return;
        }

        // prefer vcf.gz files in /VCF/Complete/
        for (int arrayIndex = 0; arrayIndex < vcfInfoArray.size(); arrayIndex++) {
            JsonObject node = vcfInfoArray.getJsonObject(arrayIndex);

//			String pathName = analysisDirectory + "/" + node.getAttributeValue("path");
            String pathName = node.getString("path");
            pathName = pathName.replace("\\", "/");

            if (pathName.contains("/VCF/Complete/")) {
                addVCFIds(pathName, analysisDirectory, vcfMap);
            }
        }

        // now do everyone else
        for (int arrayIndex = 0; arrayIndex < vcfInfoArray.size(); arrayIndex++) {
            JsonObject node = vcfInfoArray.getJsonObject(arrayIndex);

            String pathName = node.getString("path");
            pathName = pathName.replace("\\", "/");

            if (!pathName.contains("/VCF/Complete/")) {
                addVCFIds(pathName, analysisDirectory, vcfMap);
            }
        }
    }

    static void bamInfoParser(JsonArray bamInfoArray, ArrayList<String> bamList) {
        if (bamInfoArray == null || bamInfoArray.size() == 0) {
            return;
        }

        for (int arrayIndex = 0; arrayIndex < bamInfoArray.size(); arrayIndex++) {
            JsonObject node = bamInfoArray.getJsonObject(arrayIndex);

            String pathName = node.getString("path");
            pathName = pathName.replace("\\", "/");

            bamList.add(pathName);
        }
    }

    private static void addVCFIds(String VCFpathName, String analysisDirectory, Map<String, String> vcfMap) {
        if (VCFpathName == null) {
            return;
        }

        VCFpathName = VCFpathName.replace("\\", "/");

        // if windows we have to fix the path
        String VCFpathName1 = analysisDirectory + "/" + VCFpathName;
        if (!File.separator.equals("/")) {
            VCFpathName1 = VCFpathName1.replace("/", "\\");
        }

        String lastline = Util.getVCFHeader(VCFpathName1);
/*
        String[] cmd = {"tabix", "-H", ""};
        cmd[2] = VCFpathName1;

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
            LOG.error("MakeGeneURL error procing tabix", e);
            System.out.println("[addVCFIds] tabix proc error: " + e);
        }
*/
        // parse the ids out of the last line
        String[] pieces = lastline.split("\t");
        int numids = 0;

        boolean sawFormat = false;
        for (String s : pieces) {
            if (sawFormat) {
                numids++;

                // only add it if it's not present
                vcfMap.putIfAbsent(s, VCFpathName);
                continue;
            }

            if (s.equals("FORMAT")) {
                sawFormat = true;
            }
        }

        System.out.println("[MakeGeneURL:addVCFIds] numids: " + numids);
    }

    static Document buildManagePedFileXML(String pedpath, JsonArray pedInfoArray, JsonArray vcfInfoArray, JsonArray bamInfoArray, Map<Integer, String> headerMap, Map<String, String[]> peopleMap, String status) {
        Document ManagePedFile;

        ManagePedFile = new Document(new Element("ManagePedFile"));

        Element vcfInfo = new Element("VCFInfo");
        Element bamInfo = new Element("BAMInfo");
        Element pedInfo = new Element("PEDInfo");
        Element pedFile;
        Element pedAction = new Element("PEDAction");

        int numPedFiles = 0;

        if (pedInfoArray != null) {
            for (int arrayIndex = 0; arrayIndex < pedInfoArray.size(); arrayIndex++) {
                JsonObject node = pedInfoArray.getJsonObject(arrayIndex);
                Element pedInfoNode = new Element("PEDPath");
                pedInfoNode.setAttribute("path", node.getString("path"));
                pedInfo.addContent(pedInfoNode);
                numPedFiles++;
            }
        }

        if (vcfInfoArray != null) {
            for (int arrayIndex = 0; arrayIndex < vcfInfoArray.size(); arrayIndex++) {
                JsonObject node = vcfInfoArray.getJsonObject(arrayIndex);
                Element vcfInfoNode = new Element("VCFPath");
                vcfInfoNode.setAttribute("path", node.getString("path"));
                vcfInfo.addContent(vcfInfoNode);
            }
        }

        if (bamInfoArray != null) {
            for (int arrayIndex = 0; arrayIndex < bamInfoArray.size(); arrayIndex++) {
                JsonObject node = bamInfoArray.getJsonObject(arrayIndex);
                Element bamInfoNode = new Element("BAMPath");
                bamInfoNode.setAttribute("path", node.getString("path"));
                bamInfo.addContent(bamInfoNode);
            }
        }

        if (pedpath != null && (pedInfoArray == null || numPedFiles == 0)) {
            Element piPath = new Element("PEDPath");
            pedpath = pedpath.replace("\\", "/");
            piPath.setAttribute("path", pedpath);
            pedInfo.addContent(piPath);
        }

        Element paDescription = new Element("ActionDescription");

        // this shouldn't happen, but just in case...
        if (status == null) {
            status = "choose";
        }
        paDescription.setAttribute("reason", status);
        pedAction.addContent(paDescription);

        pedFile = buildPedFileXML(headerMap, peopleMap);

        ManagePedFile.getRootElement().addContent(vcfInfo);
        ManagePedFile.getRootElement().addContent(bamInfo);
        ManagePedFile.getRootElement().addContent(pedInfo);
        ManagePedFile.getRootElement().addContent(pedFile);
        ManagePedFile.getRootElement().addContent(pedAction);

        return ManagePedFile;
    }

    private static Element buildPedFileXML(Map<Integer, String> headerMap, Map<String, String[]> peopleMap) {
        Element pedFile = new Element("PEDFile");

        // get the column names
        String[] columnNames = new String[headerMap.size()];

        for (Map.Entry<Integer, String> entry : headerMap.entrySet()) {
            int key = entry.getKey();
            String value = entry.getValue();
            columnNames[key] = value;

            Element pedHeader = new Element("PEDHeader");
            pedHeader.setAttribute("name", value);
            pedHeader.setAttribute("pedFileType", "header");
            pedFile.addContent(pedHeader);
        }

        for (Map.Entry<String, String[]> entry : peopleMap.entrySet()) {
            String[] value = entry.getValue();

            Element pedEntry = new Element("PEDEntry");
            for (int ii = 0; ii < value.length; ii++) {
                String pvalue = value[ii];
                if (pvalue == null) {
                    pvalue = "";
                }

                // map sex and affection_status to something nice looking
                if (ii < columnNames.length) {
                    if (columnNames[ii].equals("sex")) {
                        pvalue = mapSex(1, pvalue);
                    }
                    if (columnNames[ii].equals("affection_status")) {
                        pvalue = mapAffected(1, pvalue);
                    }

                    pedEntry.setAttribute(columnNames[ii], pvalue);
                }
            }
            pedEntry.setAttribute("pedFileType", "entry");
            pedFile.addContent(pedEntry);
        }

        return pedFile;
    }

    static String mapSex(int mode, String value) {
        String sex;
        if (mode == 1) {
            sex = "Unknown";
            if (value.equals("1")) {
                sex = "Male";
            } else if (value.equals("2")) {
                sex = "Female";
            }

            return sex;
        }

        if (mode == 2) {
            sex = "0";
            if (value.equals("Male")) {
                sex = "1";
            } else if (value.equals("Female")) {
                sex = "2";
            }

            return sex;
        }

        return null;
    }

    static String mapAffected(int mode, String value) {
        String affected;
        if (mode == 1) {
            affected = "Unknown";
            if (value.equals("1")) {
                affected = "No";
            } else if (value.equals("2")) {
                affected = "Yes";
            }

            return affected;
        }

        if (mode == 2) {
            affected = "-9";
            if (value.equals("No")) {
                affected = "1";
            } else if (value.equals("Yes")) {
                affected = "2";
            }

            return affected;
        }

        return null;
    }

    /*
    private ArrayList<String> processTrioFile(String pedpath) {

        ArrayList<String> theURL = new ArrayList<String>();
        String error = null;

        String genename = "";
        HashMap<String, String[]> samples = new HashMap<String, String[]>();

        try {
            BufferedReader br = new BufferedReader(new FileReader(pedpath));

            String line = null;
            StringBuffer lines = new StringBuffer();

            while ((line = br.readLine()) != null) {
                lines.append(line);
            }

            br.close();

            String text = lines.toString();

            // get rid of leading { and trailing } if present
            text = text.trim();
            if (text.substring(0, 1).equals("{")) {
                text = text.substring(1, text.length() - 1);
            }

            int ipos = text.indexOf(",");
            if (ipos == -1) {
                // incorrect format
                error = "Incorrect format for definition.";
            } else {
                // get the gene name
                String gene = text.substring(0, ipos);
                text = text.substring(ipos + 1);

                String[] geneinfo = parseElement(gene);

                if (geneinfo[0].equals("gene")) {
                    genename = geneinfo[1];

                    // split into samples
                    String[] theSamples = text.split("}");

                    for (int i = 0; i < theSamples.length; i++) {
                        int jpos = theSamples[i].indexOf("{");
                        if (jpos == -1) {
                            error = "Incorrect format for definition.";
                            break;
                        }

                        // make sure we get rid of any extra comma's
                        String theSample1 = theSamples[i].substring(0, jpos + 1).replace(",", ""); // note we include the {
                        String[] sampleinfo = parseElement(theSample1); // note we include the {
                        if (sampleinfo == null) {
                            error = "Incorrect format for sample definition";
                            break;
                        }

                        // get the values for this sample
                        String[] aSample = parseSample(theSamples[i].substring(jpos + 1));

                        if (aSample == null) {
                            error = "Incorrect format for sample definition";
                            break;
                        }

                        samples.put(sampleinfo[0], aSample);
                    } // end of for

                    if (error == null) {
                        // build the url
                        String url = buildURL(genename, samples);
                        if (url != null) {
                            theURL.add(url);
                        } else {
                            error = "Definition file is missing required information";
                        }
                    }

                } else {
                    error = "Gene name not found";
                }
            }

            // did we have problems?
            if (error != null) {
                theURL.add("error");
                theURL.add(error);
            }

        } catch (IOException e) {
            theURL.add("error");
            theURL.add(e.toString());
        }

        return theURL;

    }
    */

    /*
    private String buildURL(String genename, HashMap<String, String[]> samples) {
        String url = geneiobioviewerURL + "/?rel0=proband";

        dir = setupDirectories();

        // get the proband
        String[] proband = samples.get("sample0");
        if (proband == null) {
            return null;
        }

        String theMother = "mother";
        if (proband[2].equals("")) {
            theMother = "";
        }

        String theFather = "father";
        if (proband[3].equals("")) {
            theFather = "";
        }

        String bam1 = "";
        String vcf1 = "";
        String sample1 = "";

        if (!theMother.equals("")) {
            String[] mother = samples.get(proband[2]);
            if (mother != null) {
                bam1 = makeURLLink(mother[5]);
                vcf1 = makeURLLink(mother[6]);
                sample1 = mother[0];
            }
        }

        String bam2 = "";
        String vcf2 = "";
        String sample2 = "";

        if (!theFather.equals("")) {
            String[] father = samples.get(proband[3]);
            if (father != null) {
                bam2 = makeURLLink(father[5]);
                vcf2 = makeURLLink(father[6]);
                sample2 = father[0];
            }
        }

        String bam0 = makeURLLink(proband[5]);
        String vcf0 = makeURLLink(proband[6]);

        url = url + "&rel1=" + theMother + "&rel2=" + theFather + "&gene=" + genename + "&name0=proband" + "&bam0=" + bam0;
        url = url + "&name1=" + theMother + "&bam1=" + bam1;
        url = url + "&name2=" + theFather + "&bam2=" + bam2;
        url = url + "&vcf0=" + vcf0 + "&sample0=" + proband[0];
        url = url + "&vcf1=" + vcf1 + "&sample1=" + sample1;
        url = url + "&vcf2=" + vcf2 + "&sample2=" + sample2;

        return url;
    }
    */

    /*
    private String[] parseElement(String element) {
        String[] result = new String[2];

        String[] pieces = element.split(":");
        if (pieces.length < 2 || pieces.length > 3) {
            return null;
        }

        if (pieces.length == 3) {
            // must be a : in a url, fix it
            pieces[1] = pieces[1] + ":" + pieces[2];
        }

        for (int i = 0; i < 2; i++) {
            result[i] = pieces[i].replace('"', ' ').trim();
        } // end of for

        return result;
    }
    */

    /*
    private String[] parseSample(String sample) {
        // System.out.println ("[parseSample] sample: " + sample);

        String[] result = new String[8];
        String[] name = {"id", "name", "mother id", "father id", "affected", "bam", "vcf", "gender"};
        int[] required = {1, 0, 0, 0, 1, 0, 1, 0};

        String[] pieces = sample.split(",");

        for (int i = 0; i < pieces.length; i++) {
            String[] attrvalue = parseElement(pieces[i]);
            // System.out.println ("[parseSample] i: " + i + " attrvalue[0]: " + attrvalue[0] + " attrvalue[1]: " + attrvalue[1]);

            if (attrvalue == null) {
                return null;
            }

            boolean foundit = false;
            for (int j = 0; j < name.length; j++) {
                // find the attribute name
                if (attrvalue[0].equalsIgnoreCase(name[j])) {
                    required[j] = 0;
                    result[j] = attrvalue[1];
                    foundit = true;
                    break;
                }
            }
            if (!foundit) {
                System.out.println("[parseSample] did not find attribute name: " + attrvalue[0]);
            }

        } // end of for i

        // get rid of any nulls
        for (int j = 0; j < result.length; j++) {
            if (result[j] == null) {
                result[j] = "";
            }
        }

        // did we miss any required ones?
        for (int j = 0; j < required.length; j++) {
            if (required[j] == 0) {
                continue;
            }

            result = null;
            break;
        }

        return result;
    }
    */

    private String makeURLLink(String pathName) {
        String theLink = "";
        ArrayList<String> urlsToLoad = new ArrayList<>();

        String cpath = pathName.replace("\\", "/").toLowerCase();
        String canaldir = analysisDirectory.replace("\\", "/").toLowerCase();

        if (!cpath.startsWith(canaldir)) {
            pathName = analysisDirectory + "/" + pathName;
        }

        // the file we want to link to
        File[] filesToLink = new File[2];
        filesToLink[0] = new File(pathName);

        // add the correct index file
        if (pathName.endsWith(".vcf.gz")) {
            filesToLink[1] = new File(pathName + ".tbi");
        } else if (pathName.endsWith(".bam")) {
            // figure out whether the .bam.bai or the .bai file exists
            File bambai = new File(pathName + ".bai");
            if (bambai.exists()) {
                filesToLink[1] = new File(pathName + ".bai");
            } else {
                // we will assume the index file ends in .bai (without the .bam)
                // we don't check or complain if it doesn't because the user can't do anything anyway
                filesToLink[1] = new File(pathName.substring(0, pathName.length() - 4) + ".bai");
            }

        } else if (pathName.endsWith(".cram")) {
           // figure out whether the .cram.crai or the .crai file exists
           File cramcrai = new File(pathName + ".crai");
           if (cramcrai.exists()) {
               filesToLink[1] = new File(pathName + ".crai");
           } else {
               // we will assume the index file ends in .bai (without the .bam)
               // we don't check or complain if it doesn't because the user can't do anything anyway
               filesToLink[1] = new File(pathName.substring(0, pathName.length() - 5) + ".crai");
           }
       }

        // System.out.println ("[MakeURLLink] dir.getName(): " + dir.getName());
        for (File f : filesToLink) {
            File annoFile = new File(dir, DataTrackUtil.stripBadURLChars(f.getName(), "_"));
            String dataTrackString = annoFile.toString().replace("\\", Constants.FILE_SEPARATOR);

            // System.out.println ("[makeURLLink] f.getName(): " + f.getName());
            // System.out.println ("[makeURLLink] dataTrackString: " + dataTrackString);

            // make soft link
            DataTrackUtil.makeSoftLinkViaUNIXCommandLine(f, annoFile);

            // is it a bam index xxx.bai? If so then skip after making soft link.
            if (dataTrackString.endsWith(".bam.bai") || dataTrackString.endsWith(".cram.crai") ||dataTrackString.endsWith(".vcf.gz.tbi"))
                continue;

            // if it's just a .bai, make a .bam.bai link so IOBIO will work
            if (!dataTrackString.endsWith(".bam.bai") && dataTrackString.endsWith(".bai")) {
                // fix the name
                dataTrackString = dataTrackString.substring(0, dataTrackString.length() - 4) + ".bam.bai";

                // make the soft link
                // System.out.println ("[makeURLLink] index f.getName(): " + f.getName());
                // System.out.println ("[makeURLLink] index dataTrackString: " + dataTrackString);

                DataTrackUtil.makeSoftLinkViaUNIXCommandLine(f, dataTrackString);

                continue;
            }


            // if it's just a .crai, make a .cram.crai link so IOBIO will work
            if (!dataTrackString.endsWith(".cram.crai") && dataTrackString.endsWith(".crai")) {
                // fix the name
                dataTrackString = dataTrackString.substring(0, dataTrackString.length() - 5) + ".cram.crai";

                // make the soft link
                // System.out.println ("[makeURLLink] index f.getName(): " + f.getName());
                // System.out.println ("[makeURLLink] index dataTrackString: " + dataTrackString);

                DataTrackUtil.makeSoftLinkViaUNIXCommandLine(f, dataTrackString);

                continue;
            }

            // make URL to link
            String dataTrackPartialPath = dataTrackString;
            int index = dataTrackString.indexOf(Constants.URL_LINK_DIR_NAME);
            if (index != -1) {
                dataTrackPartialPath = dataTrackString.substring(index);
            }

            urlsToLoad.add(baseURL + dataTrackPartialPath);
        }

        // get the non-index file
        if (urlsToLoad.size() > 0) {
            theLink = urlsToLoad.get(0);
        }

        return theLink;
    }

    private File setupDirectories() {
        File dir = null;

        try {
            // look and or make directory to hold soft links to data
            File urlLinkDir = DataTrackUtil.checkUCSCLinkDirectory(baseURL, dataTrackFileServerWebContext);

            String linkPath = this.checkForUserFolderExistence(urlLinkDir, username);

            if (linkPath == null) {
                linkPath = UUID.randomUUID().toString() + username;
            }

            // Create the users' data directory
            dir = new File(urlLinkDir.getAbsoluteFile(), linkPath);

            if (!dir.exists())
                dir.mkdir();
        } catch (Exception e) {
            System.out.println("[MakeGeneURL] Error in setupDirectories: " + e);
        }

        return dir;
    }

    private String checkForUserFolderExistence(File igvLinkDir, String username) throws Exception {
        File[] directoryList = igvLinkDir.listFiles();

        String desiredDirectory = null;

        for (File directory : directoryList) {
            if (directory.getName().length() > 36) {
                String parsedUsername = directory.getName().substring(36);
                if (parsedUsername.equals(username)) {
                    desiredDirectory = directory.getName();
                }
            }
        }

        return desiredDirectory;
    }

    /*
    private String getGRCName(String genomeBuildName) {
        String theName = null;

        if (genomeBuildName == null || genomeBuildName.equals("")) {
            return theName;
        }

        String[] name = genomeBuildName.split(";");

        for (int ii = 0; ii < name.length; ii++) {
            System.out.println("[getGRCName] ii: " + ii + " name: " + name[ii]);
            String thename = name[ii].trim();
            if (thename.startsWith("GRC")) {
                theName = thename;
                break;
            }
        }

        return theName;
    }
    */
}
