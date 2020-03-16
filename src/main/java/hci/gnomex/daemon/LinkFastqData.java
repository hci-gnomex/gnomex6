package hci.gnomex.daemon;

// 04/19/2018	tim
// 05/08/2018   tim     add links for xxxx.nophi.xml
// 08/09/2018   tim     add links for xxxx.deident.xml and don't link fastq files to foundation or tempest data
// 01/30/2019   tim     fix hardwired 2018 year


import hci.gnomex.utility.BatchDataSource;
import hci.gnomex.utility.PropertyDictionaryHelper;

import java.io.*;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.text.SimpleDateFormat;
import java.util.*;

import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.internal.SessionImpl;

public class LinkFastqData extends TimerTask {

    private static long fONCE_PER_DAY = 1000 * 60 * 60 * 24; // A day in
    // milliseconds
    private static int fONE_DAY = 1;
    private static int wakeupHour = 2; // Default wakupHour is 2 am
    private static int fZERO_MINUTES = 0;
    private HashMap<String, List<String>> fileExtensionMap;

    private BatchDataSource dataSource;
    private Session sess;

    private static boolean all = false;

    private static Integer daysSince = null;
    private static String serverName = "";
    private static LinkFastqData app = null;

    private boolean runAsDaemon = false;

    private String baseExperimentDir;
    private String baseAnalysisDir;
    private Calendar asOfDate;
    private Calendar runDate; // Date program is being run.

    private Boolean debug = false;
    private Boolean testConnection = false;

    private String dataType = "";
    private int MAXANALYSIS = 5000;
    private String[] analysisList = new String[MAXANALYSIS];
    private int nxtAnalysis = 0;

    private String errorMessageString = "Error in LinkFastqData";
    public int currentYear= 2019;
    private boolean linkFolder = false;

    // NOTE: -analysis must be the last argument
    public LinkFastqData(String[] args) {
        nxtAnalysis = 0;
        int i = -1;
        while (i < args.length) {
            i++;
            if (i >= args.length) {
                break;
            }
            args[i] = args[i].toLowerCase();

            if (args[i].equals("-debug")) {
                debug = true;
            } else if (args[i].equals("-analysis")) {
                // get them all
                while (true) {
                    i++;
                    if (i >= args.length || i >= MAXANALYSIS) {
                        break;
                    }
                    analysisList[nxtAnalysis] = args[i];
                    if (debug)
                        System.out.println("[LinkFastqData] i: " + i + " analysis: " + analysisList[nxtAnalysis]);
                    nxtAnalysis++;
                }

                break;
            }else if(args[i].equals("-linkfolder")){
                linkFolder = true;
            }
        }
        fileExtensionMap = new HashMap<String, List<String>>();
        fileExtensionMap.put("avatar", Arrays.asList("fastq") );
        fileExtensionMap.put("foundation", Arrays.asList("bam", "deident.xml") );
        fileExtensionMap.put("tempus", Arrays.asList("deident.json", "fastq"));

    }

    /**
     * @param args
     */
    public static void main(String[] args) {
        app = new LinkFastqData(args);
        app.run();
    }

    @Override
    public void run() {
        runDate = Calendar.getInstance();
        errorMessageString += " on " + new SimpleDateFormat("MM-dd-yyyy_HH:mm:ss").format(runDate.getTime()) + "\n";

        try {
            Logger LOG = Logger.getLogger("org.hibernate");
            LOG.setLevel(Level.ERROR);

            dataSource = new BatchDataSource();
            app.connect();

            app.initialize();

//            if (dataType == null) {
//                System.out.println("-dataSource is required");
//                System.out.println("Usage: sh ./LinkFastqData.sh -dataSource (either 2R 4R or 10R) -analysis idAnalysis [list as many as you want]");
//                System.exit(1);
//            }

            if (nxtAnalysis == 0) {
                System.out.println("-analysis is required");
                System.out.println("Usage: sh ./LinkFastqData.sh [-debug] -analysis idAnalysis [list as many as you want]");
                System.exit(1);
            }

            // do the work
            app.LinkFastqData();

            app.disconnect();
            System.out.println("Exiting...");
            System.exit(0);

        } catch (Exception e) {

            String msg = "The following error occured: " + e.toString() + "\n";
            System.out.println(msg);

            StackTraceElement[] stack = e.getStackTrace();
            for (StackTraceElement s : stack) {
                msg = msg + s.toString() + "\n\t\t";
            }

            System.out.println(msg);

            if (!errorMessageString.equals("")) {
                errorMessageString += "\n";
            }
            errorMessageString += msg;

            System.err.println(errorMessageString);

        }

        System.out.println("Exiting(2)...");
        System.exit(0);

    }

    private void initialize() throws Exception {
        PropertyDictionaryHelper ph = PropertyDictionaryHelper.getInstance(sess);
        baseExperimentDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null,
                PropertyDictionaryHelper.PROPERTY_EXPERIMENT_DIRECTORY);
        baseAnalysisDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null,
                PropertyDictionaryHelper.PROPERTY_ANALYSIS_DIRECTORY);

    }

    private String getCurrentDateString() {
        runDate = Calendar.getInstance();
        return new SimpleDateFormat("MM-dd-yyyy_HH:mm:ss").format(runDate.getTime());

    }

    private void LinkFastqData() throws Exception {

        currentYear = Calendar.getInstance().get(Calendar.YEAR);

        String startPath = "/Repository/AnalysisData/";
        String startAvatarPath = "/Repository/PersonData/2018";
        String startRequestPath = "/Repository/PersonData/";
        boolean assumeMYSQL = true;

        StringBuilder buf = new StringBuilder();

        // deal with each analysis
        int nxtOne = -1;
        String idAnalysis = null;

        while (nxtOne + 1 < nxtAnalysis) {                                                                                // top (idAnalysis) while
            nxtOne++;

            idAnalysis = analysisList[nxtOne];
            System.out.println("[LinkFastqData] processing analysis: " + idAnalysis + " nxtOne: " + nxtOne);

            List<String> names = getAnalysisName(idAnalysis, sess);
            if (debug) System.out.println("size of names: " + names.size());

            // if we got none
            if (names == null || names.size() == 0) {
                System.out.println("WARNING: analysis has no name: " + idAnalysis);
                continue;
            }

            // now using the 'name' get the request
            Iterator it = names.iterator();

            while (it.hasNext()) {                                                                                      // names while
                String theName = (String) it.next();

                if (debug) {
                    System.out.println("-----> Processing name: " + theName + "<-----");
                }

                // get the top level directory because we want to be right under it
                String[] theDirectories = new String[2];
                if (theName == null) {
                    System.out.println("ERROR: aName is null, idAnalysis: " + idAnalysis);
                    continue;
                }

                // **************************************************************************
                theDirectories = getTopDirectory(idAnalysis, theName, sess);
                int analysisYear = getACreatedYear(idAnalysis,sess);
                if (theDirectories == null) {
                    // we have no files in the analysis so there is nothing to do
                    if (debug) System.out.println("WARNING: analysis has NO files: " + idAnalysis);
                    continue;
                }

                String topDirectoryData = "";
                String theDirectory = theDirectories[1];
                if (debug) System.out.println ("theDirectories[1]: " + theDirectories[1]);
                if (theDirectory == null) {
                    System.out.println("ERROR: getTopDirectory returned null for directory name!");
                    continue;
                }
                String vendorType = "";
                if(theDirectories[1].split("_").length > 1){
                    vendorType = theDirectories[1].split("_")[1].toLowerCase();
                }else{
                    throw new Exception("can't find the vendor type");
                }


                String baseFilePath = theDirectories[0];
                if (baseFilePath == null) {
                    System.out.println("ERROR: getTopDirectory returned null for baseFilePath name!");
                    continue;
                }
                int endtop = theDirectory.indexOf('/');
                String topDirectory = "";
                if (endtop == -1) {
                    topDirectory = theDirectory;
                    topDirectoryData = theDirectory + "/RawData";
                } else {
                    topDirectory = theDirectory.substring(0, endtop);
                    topDirectoryData = theDirectory.substring(0, endtop) + "/RawData";
                }
                if (debug) {
                    System.out.println("theDirectory: " + theDirectory);
                    System.out.println("topDirectory: " + topDirectory);
                    System.out.println("topDirectoryData: " + topDirectoryData);
                    System.out.println("baseFilePath: " + baseFilePath);
                }
                //xxxxxxxxxxxxxxxxx

                List<String> idRequests = getIdRequest(theName, sess);
                if (debug) System.out.println("size of idRequests: " + idRequests.size());

                // now using the idRequest see if we can find any experiment files for that request that contain %fastq%
                List<String> fileNames = null;

                Iterator itpr = idRequests.iterator();
                while (itpr.hasNext()) {                                                                                // idRequest while
                    String idRequest = (String) itpr.next();

                    String createYear = "" + getRCreatedYear(idRequest,sess);

                    fileNames = getExperimentFilename(idRequest, sess,vendorType);

                    if (debug) System.out.println("size of fileNames: " + fileNames.size());

                    if (fileNames == null || fileNames.size() == 0) {
                        // no fastq files
                        continue;
                    }

                    //  create the directory where we are going to make the links
                    String dirPath = baseFilePath + "/" + topDirectoryData + "/";
                    if (debug) System.out.println("dirPath: " + dirPath);

                    File f = new File(dirPath);
                    if (!f.exists()) {
                        f.mkdirs();
                    }

                    // process the fastq files we found
                    Iterator itpn = fileNames.iterator();

                    while (itpn.hasNext()) {                                                                            // fileNames while
                        String thePath = (String) itpn.next();        // for example: 129R/Avatar/DNA/Fastq/SL283716_2.fastq.gz
                        // 2R/Foundation/Reports/TRF218551.xml

                        if (debug) System.out.println("thePath: " + thePath );

                        int ipos = thePath.indexOf("/");
                        if (ipos == -1) {
                            // some kind of bad path?
                            System.out.println("WARNING: unexpected directory structure: " + thePath + " it will be ignored.");
                            continue;
                        }

                        int epos = thePath.indexOf("/", ipos + 1);
                        if (epos == -1) {
                            // some kind of bad path?
                            System.out.println("WARNING: unexpected directory structure: " + thePath + " it will be ignored.");
                            continue;
                        }

                        ipos = epos + 1;

                        epos = thePath.lastIndexOf("/");
                        if (epos <= ipos) {
                            System.out.println("WARNING: unexpected directory structure: " + thePath + " it will be ignored. ipos: " + ipos + " epos: " + epos);
                            continue;
                        }

                        String middleOfPath = "";
                        String filename = "";
                        String subCommand = "";

                        String pathToRealData = startRequestPath + "/" + createYear + "/" + thePath;
                        middleOfPath = thePath.substring(ipos, epos);        // for example: DNA/Fastq



                        if(!linkFolder){
                            filename = thePath.substring(epos + 1);
                            if (debug) System.out.println("filename: " + filename);
                        }else{
                            epos = middleOfPath.lastIndexOf("/");


                            File dummyFile = new File(pathToRealData);
                            filename = dummyFile.getParentFile().getName();
                            try{
                                int personID = Integer.parseInt(filename);
                                pathToRealData = dummyFile.getParentFile().getCanonicalPath();
                                middleOfPath = middleOfPath.substring(0,epos);
                            }catch(NumberFormatException nfe){
                                System.out.println("skipping... experiment file doesn't have wrapping folder");
                                continue;
                            }
                            // need to make sure if you try to run making a symlink more than once it doesn't
                            // stick a symlink inside the src dir pointing to soft link
                            // the T stops it from drilling into the 'pointer' that points to src dir if it already exists
                            subCommand = "-sTf";

                        }
                        //  make the soft link
                        if (debug) System.out.println("middleOfPath: " + middleOfPath);

                        String myPath = dirPath + middleOfPath;
                        if (debug) System.out.println("myPath: " + myPath);
                        File f1 = new File(myPath);
                        if (!f1.exists()) {
                            f1.mkdirs();
                        }

                        //  make the soft link
                        myPath =  myPath + "/" + filename;


                        // 05/10/2019 tim -- now we get the canonical path so we link to the the actual file not a link to a link to the actual file
                        // this is still getting the path to the linked data from the person not the overall pot
                        File ttarget = new File(pathToRealData);
                        File  target = ttarget.getCanonicalFile();
                        File linkName = new File(myPath);
                        if (debug)
                            System.out.println("[LinkFastqData] right before makeSoftLinks, target: " + target.getCanonicalPath() + "\n\t\t\t\t linkName: " + linkName);

                        boolean ok = makeSoftLinks(target, linkName, subCommand);
                        if (!ok) {
                            System.out.println("makeSoftLinks failed!");
                            System.exit(2);
                        }
                    } // end of inner while  (paths)                                                                    // end of fileNames while

                } // end of while for requests                                                                          // end of idrequest while

            } // end of names while                                                                                     // end of name while

        } // end of idAnalysis (TOP) while                                                                                  // end of top (idAnalysis) while
        System.out.println("normal exit -- no problems!");
        System.exit(0);
    }

    public String[] getTopDirectory(String idAnalysis, String theName, Session sess) {
        if (debug) System.out.println("[getTopDirectory] idAnalysis: " + idAnalysis + " theName: " + theName);

        String[] theDirectories = new String[2];

        // don't try to process bad data
        if (idAnalysis == null) {
            return null;
        }
        boolean assumeMYSQL = true;
        int numbad = 0;

        int theYear = getCreatedYear (idAnalysis,sess);

        theDirectories[0] = "/Repository/AnalysisData/" + theYear + "/A" + idAnalysis;
        theDirectories[1] = theName + "_" + "Avatar";

        String analysisGroupName = "";

        while (true) {
            try {
                SessionImpl sessionImpl = (SessionImpl) sess;


                // figure out what type of analysis this is
                String analysis_type = getAnalysisType (idAnalysis,sess);
                if (debug) System.out.println("[getTopDirectory] analysis_type: " + analysis_type);
                if (analysis_type == null || analysis_type.equals("")) {
                    analysis_type = "Avatar";
                }

                theDirectories[1] = theName + "_" + analysis_type;
                if (debug) {
                    System.out.println("[getTopDirectory]  analysis_type: " + analysis_type + " theDirectories[1]: " + theDirectories[1]);
                }


                break;

            } catch (Exception ee) {
                if (debug) {
                    System.out.println("[getTopDirectory] exception: " + ee.toString());
                }
                numbad++;
                // if this is the first failure assume we are really dealing with MSSQL and MYSQL
                if (numbad == 1) {
                    assumeMYSQL = false;
                    continue;           // try it again
                }
                // we lose
            }
        } // end of while

        if (debug)
            System.out.println("[getTopDirectory] ** returning ** theDirectories[0]: " + idAnalysis + " [1]: " + theDirectories[1]);
        return theDirectories;
    }

    public List<String> getAnalysisName(String idAnalysis, Session sess) {
        List<String> names = new ArrayList<String>();

        try {
            SessionImpl sessionImpl = (SessionImpl) sess;

            ResultSet rs = null;
            Connection con = sessionImpl.connection();
            Statement stmt = con.createStatement();

            StringBuilder buf3 = null;

            buf3 = new StringBuilder();
            buf3.append("select name from Analysis where idAnalysis = " + idAnalysis + ";");
            if (debug) System.out.println("Analysis getAnalysis query: " + buf3.toString());

            rs = stmt.executeQuery(buf3.toString());
            while (rs.next()) {
                names.add(rs.getString(1));
            }
            rs.close();
            stmt.close();

        } catch (Exception ee) {
            System.out.println("ERROR: in getAnalysisName: " + ee);
            // we lose
            return null;
        }


        return names;
    }

    public String getAnalysisType(String idAnalysis, Session sess) {

        String analysisGroupName = "unknown";
        String analysisType = "";

        String[] theAGTypes = {"Avatar", "Foundation", "Tempest"};
        if (idAnalysis == null) {
            System.out.println("[getAnalysisType] WARNING: idAnalysis is null!");
            return null;
        }

        try {
            SessionImpl sessionImpl = (SessionImpl) sess;

            ResultSet rs1 = null;
            Connection con1 = sessionImpl.connection();
            Statement stmt1 = con1.createStatement();

            StringBuilder buf1 = new StringBuilder("select ag.name from AnalysisGroup ag, AnalysisGroupItem agi where agi.idAnalysis = " + idAnalysis +
                    " and agi.idAnalysisGroup = ag.idAnalysisGroup;");
            if (debug) System.out.println("getAnalysisType query: " + buf1.toString());

            rs1 = stmt1.executeQuery(buf1.toString());
            while (rs1.next()) {
                analysisGroupName = rs1.getString(1);
                break;
            }
            rs1.close();
            stmt1.close();

            if (debug) System.out.println("AnalysisGroup name: " + analysisGroupName);

        } catch (Exception ee) {
            System.out.println("ERROR: in getAnalysisType: " + ee);
            // we lose
            return null;
        }

        // Map it to our standard names
        for (int ii = 0; ii < theAGTypes.length; ii++) {
            if (analysisGroupName.indexOf(theAGTypes[ii]) >= 0) {
                // found it
                analysisType = theAGTypes[ii];
                break;
            }
        }

        return analysisType;


    }

    public List<String> getIdRequest(String theName, Session sess) {
        List<String> idRequests = new ArrayList<String>();

        if (theName == null) {
            return null;
        }

        try {
            SessionImpl sessionImpl = (SessionImpl) sess;

            ResultSet rs = null;
            Connection con = sessionImpl.connection();
            Statement stmt = con.createStatement();

            StringBuilder buf1 = new StringBuilder("select idRequest from Request where name = '" + theName + "';");
            if (debug) System.out.println("Request query: " + buf1.toString());

            rs = stmt.executeQuery(buf1.toString());
            while (rs.next()) {
                idRequests.add(rs.getString(1));
            }
            rs.close();
            stmt.close();

        } catch (Exception ee) {
            System.out.println("ERROR: in getIdRequest: " + ee);
            // we lose
            return null;
        }


        return idRequests;
    }


    public int getCreatedYear(String idAnalysis, Session sess) {

        int theYear = 0;

        try {
            SessionImpl sessionImpl = (SessionImpl) sess;

            ResultSet rs = null;
            Connection con = sessionImpl.connection();
            Statement stmt = con.createStatement();

            StringBuilder buf = new StringBuilder ("select YEAR(createdate) from Analysis where idAnalysis = " + idAnalysis);
            if (debug) System.out.println("Analysis get year created query: " + buf.toString());
            rs = stmt.executeQuery(buf.toString());
            while (rs.next()) {
                theYear = rs.getInt(1);
            }
            rs.close();
            stmt.close();

        } catch (Exception ee) {
            System.out.println("ERROR: in getIdRequest: " + ee);
            // we lose
            return -1;
        }


        return theYear;
    }

    public int getRCreatedYear(String idRequest, Session sess) {

        int theYear = 0;

        try {
            SessionImpl sessionImpl = (SessionImpl) sess;

            ResultSet rs = null;
            Connection con = sessionImpl.connection();
            Statement stmt = con.createStatement();

            StringBuilder buf = new StringBuilder ("select YEAR(createdate) from Request where idRequest = " + idRequest);
            if (debug) System.out.println("Request get year created query: " + buf.toString());
            rs = stmt.executeQuery(buf.toString());
            while (rs.next()) {
                theYear = rs.getInt(1);
            }
            rs.close();
            stmt.close();

            if (debug) System.out.println("Request get year created query: " + theYear);

        } catch (Exception ee) {
            System.out.println("ERROR: in getRCreatedYear: " + ee);
            // we lose
            return -1;
        }


        return theYear;
    }

    public int getACreatedYear(String idAnalysis, Session sess) {

        int theYear = 0;

        try {
            SessionImpl sessionImpl = (SessionImpl) sess;

            ResultSet rs = null;
            Connection con = sessionImpl.connection();
            Statement stmt = con.createStatement();

            StringBuilder buf = new StringBuilder ("select YEAR(createdate) from Analysis where idAnalysis = " + idAnalysis);
            if (debug) System.out.println("Analysis get year created query: " + buf.toString());
            rs = stmt.executeQuery(buf.toString());
            while (rs.next()) {
                theYear = rs.getInt(1);
            }
            rs.close();
            stmt.close();

            if (debug) System.out.println("Analysis get year created query: " + theYear);

        } catch (Exception ee) {
            System.out.println("ERROR: in getACreatedYear: " + ee);
            // we lose
            return -1;
        }


        return theYear;
    }


    public List<String> getExperimentFilename(String idRequest, Session sess, String vendorType) {
        List<String> fileNames = new ArrayList<String>();
        System.out.println("[getExperimentFilename]");

        if (idRequest == null) {
            return null;
        }

        try {
            SessionImpl sessionImpl = (SessionImpl) sess;

            ResultSet rs = null;
            Connection con = sessionImpl.connection();
            Statement stmt = con.createStatement();

            String buf2 = "";
            if(fileExtensionMap != null){
                for(Map.Entry<String,List<String>> entry : fileExtensionMap.entrySet() ){
                    System.out.print(entry.getKey());
                    System.out.print(" : ");
                    System.out.println(entry.getValue());
                }
            }


            List<String> fileExtensions = fileExtensionMap.get(vendorType);
            if(fileExtensions == null){
                throw new Exception("Can't find vendor type.");
            }
            System.out.println("[getExperimentFilename]: fileExtensions length  " + fileExtensions.size() );
            String vendorFilterStr =  makeVendorFilterStr(fileExtensions);
            StringBuilder strBuild = new StringBuilder();
            strBuild.append("SELECT fileName FROM ExperimentFile WHERE idRequest = ");
            strBuild.append(idRequest);
            strBuild.append(" AND (");
            strBuild.append(vendorFilterStr);
            strBuild.append(");");

            buf2 = strBuild.toString();



//            StringBuilder buf2 = new StringBuilder("select fileName from ExperimentFile where idRequest = " + idRequest + " and (fileName like '%fastq%' or fileName like '%.deident.xml');");
            if (debug) System.out.println("mode: " + vendorType + " Get file query: " + buf2);

            rs = stmt.executeQuery(buf2);
            while (rs.next()) {
                fileNames.add(rs.getString(1));
            }
            rs.close();
            stmt.close();


        } catch (Exception ee) {
            System.out.println("ERROR: in getExperimentFilename: " + ee);
            // we lose
            return null;
        }


        return fileNames;
    }

    private String makeVendorFilterStr(List<String> extensions) {
        StringBuilder strBuilder = new StringBuilder();
        for(int i = 0; i <  extensions.size(); i++){
            strBuilder.append("fileName LIKE ");
            strBuilder.append("\'%");
            strBuilder.append(extensions.get(i));
            strBuilder.append("%\'");

            if(i  < extensions.size() - 1 ){
                strBuilder.append(" OR ");
            }
        }
        return strBuilder.toString();
    }

    /**
     * Makes a soft link between the realFile and the linked File using the linux 'ln -s' command.
     */
    public static boolean makeSoftLinks(File realFile, File link, String subCommand) {
        try {
//			String[] cmd1 = { "rm", "-f", link.toString() };
//			Runtime.getRuntime().exec(cmd1);

            String realFile1 = "'" + realFile.getAbsolutePath() + "'";
            String link1 = "'" + link.toString() + "'";
            String[] cmd = {"ln", subCommand, realFile1, link1};

            Runtime.getRuntime().exec(cmd);
            return true;
        } catch (IOException e) {

        }
        return false;
    }

    private static Date getWakeupTime() {
        Calendar tomorrow = new GregorianCalendar();
        tomorrow.add(Calendar.DATE, fONE_DAY);
        Calendar result = new GregorianCalendar(tomorrow.get(Calendar.YEAR), tomorrow.get(Calendar.MONTH),
                tomorrow.get(Calendar.DATE), wakeupHour, fZERO_MINUTES);
        return result.getTime();
    }

    private void connect() throws Exception {
        sess = dataSource.connect();
        if (sess == null) {
            System.out.println("[LinkFastqData] ERROR: Unable to acquire session. Exiting...");
            System.exit(1);
        }
    }

    private void disconnect() throws Exception {
        if (sess == null) {
            return;
        }

        sess.close();
    }
}
