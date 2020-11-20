package hci.gnomex.daemon.auto_import;

import hci.gnomex.model.Visibility;

import java.sql.SQLException;
import java.util.*;
import java.util.Map.Entry;

public class CollaboratorPermission {
    //there is only one server clingen1 that should every run this job
    private static final String BASE_URL = "https://hci-clingen1.hci.utah.edu/gnomex/";
    private Map<String, List<PersonEntry>> newSampleList;
    private Integer analysisID;
    private static Map<String, List<String>> diseaseAliasMap = new TreeMap();
    private Query query;
    private static Set<String> levelOptions;
    private String level;
    private boolean authRequestCollaborators;
    private static Set<String> dataVendorOptions;
    private List<String> dataVendors = new ArrayList();
    private List<String> excludedVendors = new ArrayList<>();
    private String attributeType;
    private List<Integer> requestIDList;

    private List<String> attributeIDs = new ArrayList();
    public List<String> IRBs = new ArrayList();
    private static int AVATAR_FOLDER_ID = 11;
    private static int FOUNDATION_FOLDER_ID = 14;
    private static int TEMPUS_FOLDER_ID = 22;

    static {
        diseaseAliasMap.put("Abdomen", Arrays.asList("Abdominal wall"));
        diseaseAliasMap.put("Adrenal Gland", Arrays.asList());
        diseaseAliasMap.put("Anus", Arrays.asList());
        diseaseAliasMap.put("Appendix", Arrays.asList());
        diseaseAliasMap.put("Bladder", Arrays.asList());
        diseaseAliasMap.put("Blood", Arrays.asList());
        diseaseAliasMap.put("Bone", Arrays.asList("Bone Marrow", "Iliac crest", "Pelvis"));
        diseaseAliasMap.put("Brain", Arrays.asList("Neurology"));
        diseaseAliasMap.put("Breast", Arrays.asList());
        diseaseAliasMap.put("Cervix", Arrays.asList());
        diseaseAliasMap.put("Chest Wall", Arrays.asList());
        diseaseAliasMap.put("ColoCare", Arrays.asList());
        diseaseAliasMap.put("Colon", Arrays.asList("Colon Bronner"));
        diseaseAliasMap.put("Diaphragm", Arrays.asList());
        diseaseAliasMap.put("Duodenum", Arrays.asList());
        diseaseAliasMap.put("Esophagus", Arrays.asList());
        diseaseAliasMap.put("Gallbladder", Arrays.asList());
        diseaseAliasMap.put("Gastro-esophageal junction", Arrays.asList());
        diseaseAliasMap.put("Gyn", Arrays.asList());
        diseaseAliasMap.put("Head and Neck", Arrays.asList("Head Or Neck", "Eye", "Ear", "Mouth", "Nasal Cavity", "Nasopharynx And Paranasal Sinuses", "Tongue", "Trachea", "Salivary Gland"));
        diseaseAliasMap.put("Heart", Arrays.asList());
        diseaseAliasMap.put("HEM", Arrays.asList("HEM-CLL", "HEM-CML", "HEM-MM"));
        diseaseAliasMap.put("Kidney", Arrays.asList("CG - Kidney", "Ureter"));
        diseaseAliasMap.put("Liver", Arrays.asList());
        diseaseAliasMap.put("Lung", Arrays.asList());
        diseaseAliasMap.put("Lymph Node", Arrays.asList());
        diseaseAliasMap.put("Mediastinum", Arrays.asList());
        diseaseAliasMap.put("Muscle", Arrays.asList());
        diseaseAliasMap.put("Omentum", Arrays.asList());
        diseaseAliasMap.put("Other", Arrays.asList());
        diseaseAliasMap.put("Pancreas", Arrays.asList());
        diseaseAliasMap.put("Parotid Gland", Arrays.asList());
        diseaseAliasMap.put("Penis", Arrays.asList());
        diseaseAliasMap.put("Peritoneum", Arrays.asList("Peritoneal Fluid"));
        diseaseAliasMap.put("Pleura", Arrays.asList("Pleura Fluid"));
        diseaseAliasMap.put("Prostate", Arrays.asList());
        diseaseAliasMap.put("Rectum", Arrays.asList());
        diseaseAliasMap.put("Retroperitoneum", Arrays.asList());
        diseaseAliasMap.put("Skin", Arrays.asList());
        diseaseAliasMap.put("Small Intestine", Arrays.asList());
        diseaseAliasMap.put("Soft Tissue", Arrays.asList());
        diseaseAliasMap.put("Spine", Arrays.asList());
        diseaseAliasMap.put("Stomach", Arrays.asList());
        diseaseAliasMap.put("Testis", Arrays.asList());
        diseaseAliasMap.put("Thymus", Arrays.asList());
        diseaseAliasMap.put("Thyroid", Arrays.asList("Thyroid Gland"));
        diseaseAliasMap.put("Urethra", Arrays.asList());
        diseaseAliasMap.put("Uterus", Arrays.asList());
        diseaseAliasMap.put("Vagina", Arrays.asList());
        diseaseAliasMap.put("Whipple Resection", Arrays.asList());

        levelOptions = new HashSet();
        levelOptions.add("experiment");
        levelOptions.add("experimentproperty");
        levelOptions.add("sampleproperty");
        levelOptions.add("sample");
        levelOptions.add("analysis");

        dataVendorOptions = new HashSet();
        dataVendorOptions.add("avatar");
        dataVendorOptions.add("foundation");
        dataVendorOptions.add("tempus");
        dataVendorOptions.add("all");
    }


    CollaboratorPermission(String[] args) throws Exception {
        authRequestCollaborators = false;
        for(int i = 0; i < args.length; ++i) {
            args[i] = args[i].toLowerCase();
            if (args[i].equals("-irb")) {
                ++i;
                this.parseArgs(i, this.IRBs, args);
            } else if (args[i].equals("-attributetype")) {
                List<String> tempAtypeList = new ArrayList();
                ++i;
                this.parseArgs(i, tempAtypeList, args);
                this.attributeType = String.join(" ", tempAtypeList);
                if (this.attributeType == null) {
                    throw new Exception("attributeType  is not found, this is the column name in your table ");
                }
            } else if (args[i].equals("-attributeid")) {
                ++i;
                this.parseArgs(i, this.attributeIDs, args);
            } else if (args[i].equals("-level")) {
                ++i;
                boolean isLevel = levelOptions.contains(args[i].toLowerCase());
                if (!isLevel) {
                    throw new Exception("Level is not found, the follow options for it are: experiment, sample or analysis ");
                }

                this.level = args[i].toLowerCase();
            } else if (args[i].equals("-vendor")) {
                ++i;
                this.parseArgs(i, this.dataVendors, args);
                Iterator var3 = this.dataVendors.iterator();

                while(var3.hasNext()) {
                    String v = (String)var3.next();
                    boolean isVendor = dataVendorOptions.contains(v.toLowerCase());
                    if (!isVendor) {
                        throw new Exception("dataVendor is not found, please provide a valid option: Avatar,Foundation,Tempus, or all");
                    }
                }
            }else if(args[i].equals("-excludevendor")){
                ++i;
                this.parseArgs(i, this.excludedVendors, args);
                Iterator var3 = this.excludedVendors.iterator();

                while(var3.hasNext()) {
                    String v = (String)var3.next();
                    boolean isVendor = dataVendorOptions.contains(v.toLowerCase());
                    if (!isVendor) {
                        throw new Exception("excluded vendor is not found, please provide a valid option: Avatar,Foundation,Tempus");
                    }
                }
            }
            else if (args[i].equals("-dbcredentials")) {
                ++i;
                this.query = new Query(args[i]);
            }else if(args[i].equals("-authrequest")){
                this.authRequestCollaborators = true;
                this.requestIDList = new ArrayList<>();
            }
        }

    }

    public static void main(String[] args) {
        CollaboratorPermission cp = null;

        try {
            cp = new CollaboratorPermission(args);
            List<Integer> analysisList = cp.getAnalysesWithCriteria();
            IRBContainer irbAnalysisContainer = new IRBContainer();
            IRBContainer irbRequestContainer = new IRBContainer();

            String query = "SELECT * from AnalysisCollaborator ac  WHERE ac.idAnalysis = ? AND ac.idAppUser = ?";
            Map<Integer, List<Integer>> analysisForCollabs = cp.query.getCollaboratorsForIRB(cp.IRBs, analysisList, irbAnalysisContainer, query, "idAnalysis");
            cp.assignAnalysisToCollabs(analysisForCollabs, true);
            cp.sendNotificationToIRB(irbAnalysisContainer);

            if(cp.isRequestAuthed()){
                query = "SELECT * from RequestCollaborator rc  WHERE rc.idRequest = ? AND rc.idAppUser = ?";
                Map<Integer, List<Integer>> requestForCollabs = cp.query.getCollaboratorsForIRB(cp.IRBs, cp.requestIDList, irbRequestContainer, query, "idRequest");
                cp.assignAnalysisToCollabs(requestForCollabs,false);
                cp.sendNotificationToIRB(irbAnalysisContainer);
            }

        } catch (Exception e) {
            e.printStackTrace();
            cp.query.closeConnection();
            System.exit(1);
        } finally {
            if (cp.query != null) {
                cp.query.closeConnection();
            }

        }

    }

    private void sendNotificationToIRB(IRBContainer irbContainer) {
        StringBuilder body = new StringBuilder();
        Map<String,List<Integer>> personOrderMap = irbContainer.getIrbOrders();
        String subject = "New Analyses in Translation GNomEx PHI";

        body.append("<html><head>");
        body.append("<meta http-equiv='content-style-type' content='text/css'></head>");
        body.append("<body leftmargin='0' marginwidth='0' topmargin='0' marginheight='0' offset='0' bgcolor='#FFFFFF'>");
        body.append("<style>.fontClass{font-size:11px;color:#000000;font-family:verdana;text-decoration:none;}");
        body.append(" .fontClassBold{font-size:11px;font-weight:bold;color:#000000;font-family:verdana;text-decoration:none;}");
        body.append(" .fontClassLgeBold{font-size:12px;line-height:22px;font-weight:bold;color:#000000;font-family:verdana;text-decoration:none;}</style>");
        body.append("<div style=\"display: flex; flex-direction: column; padding: 0.5em; \">");
        body.append("<h2 style=\"text-align: center;\"> New Raw Fastq files assigned for the following IRB: " );
        body.append(irbContainer.getIrbName());
        body.append("</h2>");

        for(Entry<String, List<Integer>> entry : personOrderMap.entrySet()){
            String personId = entry.getKey();
            List<Integer> orders = entry.getValue();

            body.append("<div style=\"text-align: center;\">");
            body.append("For ");
            body.append("<strong> HCI Person ID " );
            body.append("" + personId);
            body.append("</strong> new fastq files assigned, find here: ");
            body.append(" ( ");
            for(int i = 0; i < orders.size(); i++){
                body.append("<a href=\"");
                body.append(BASE_URL);
                body.append("?analysisNumber=");
                body.append("A");
                body.append(orders.get(i));
                body.append("\" >");
                if(i == (orders.size() - 1)){
                    body.append("A");
                    body.append(orders.get(i));
                    body.append("</a>");
                    body.append(" )</div>");
                } else {
                    body.append("A");
                    body.append(orders.get(i));
                    body.append("</a>");
                    body.append(", ");
                }

            }
        }
        body.append("</div>");
        body.append("</body></html>");
        System.out.println("to: " + irbContainer.getIrbEmail());
        System.out.println(body.toString());
        if(irbContainer.getIrbOrders().size() > 0){
            DirectoryBuilder.sendImportedIDReport("DoNotReply@hci.utah.edu",
                    irbContainer.getIrbEmail(), subject, body.toString(), "", true);
        } else {
            System.out.println("No new analyses for this IRB " + irbContainer.getIrbName() + ". Email not sent");
        }


    }

    public boolean isRequestAuthed() {
        return  this.authRequestCollaborators;
    }
    private List<Integer> getAnalysesWithCriteria() throws Exception {
        List<Integer> analysisIDList = new ArrayList<>();
        if (this.level.equals("sampleproperty")) {
            analysisIDList = getAnalysisIDsFromProperty();

        }else if(this.level.equals("analysis") && this.attributeType.equals("name")){
            //todo currently only supports getting requestIDList from personID
            analysisIDList = getAnalysisFromPersonID();
        }
        else if (this.level.equals("analysis") && this.attributeType.equals("idanalysis")) {
            List<Integer> tempIntegerList = new ArrayList();
            for(String id: this.attributeIDs) {
                tempIntegerList.add(new Integer(id));
            }

            analysisIDList = tempIntegerList;
            outSummary(new HashSet<>(), analysisIDList);
        }

        return analysisIDList;
    }

    List<Integer> getAnalysisIDsFromProperty() throws Exception {
        Set<String> personIDList = new TreeSet<>();
        List<Integer> analysisIDList = new ArrayList();

        for(int i = 0; i < this.dataVendors.size(); i++){
            StringBuilder strBuilder = new StringBuilder();

            strBuilder.append("SELECT summary.personID \n ");
            strBuilder.append("FROM ( SELECT  s.name, s.idSample, a.name as personID, a.idAnalysis\n ");
            strBuilder.append("FROM Sample s JOIN Request r ON s.idRequest = r.idRequest\n ");
            strBuilder.append("JOIN Analysis a ON a.name = r.name ");
            strBuilder.append(this.makeAnalysisGroupINstatement(this.dataVendors.get(i)));
            strBuilder.append("\n ");
            strBuilder.append(this.makeQueryStatement(this.dataVendors.get(i)));
            strBuilder.append("\n ");
            strBuilder.append(") as summary\n ");
            strBuilder.append("JOIN PropertyEntry pe ON pe.idSample = summary.idSample\n ");
            strBuilder.append("JOIN Property p ON p.idProperty = pe.idProperty\n ");
            strBuilder.append("WHERE p.name = '");
            strBuilder.append(this.attributeType);
            strBuilder.append("' ");
            strBuilder.append(" AND ");
            strBuilder.append("pe.valueString LIKE");
            strBuilder.append(" '%");
            strBuilder.append(attributeIDs.get(0));// only supporting one for now needs to changed for an array
            strBuilder.append("%'");

            if(i > 0  && personIDList.size() > 0){
                strBuilder.append(" AND ");
                strBuilder.append(makePersonIdINstatement(personIDList, "summary.personID"));
                personIDList.clear();
            }

            this.query.executeAnalysisWithCriteriaQuery(strBuilder.toString(), personIDList);
        }

        for(String ev : excludedVendors){
            StringBuilder strBuilder = new StringBuilder();
            strBuilder.append("SELECT a.name as personID \n ");
            strBuilder.append("FROM Analysis a JOIN Request r ON r.name = a.name \n");
            strBuilder.append(this.makeAnalysisGroupINstatement(ev));
            this.query.filterPersonIDList(strBuilder.toString(), personIDList);

        }

        String baseQuery = "SELECT a.idAnalysis FROM Analysis a WHERE ";
        analysisIDList = this.query.getAnalysisRequestIdFromPersonID( baseQuery, personIDList, makePersonIdINstatement(personIDList, "a.name"));
        outSummary(personIDList, analysisIDList);
        return analysisIDList;

    }

    List<Integer> getAnalysisFromPersonID() throws Exception{
        Set<String> personIDList = new TreeSet<>();
        List<Integer> analysisIDList = new ArrayList();
        if(attributeIDs.size() > 0 ){
            for(String attrID : attributeIDs){
                personIDList.add(attrID);
            }
        }else{
            String allPatientQuery = "SELECT a.name as PersonID FROM Analysis a";
            this.query.executeAnalysisWithCriteriaQuery(allPatientQuery,personIDList);
        }


        for(int i = 0; i < this.dataVendors.size(); i++){
            StringBuilder strBuilder = new StringBuilder();
            strBuilder.append("SELECT a.name as personID ");
            strBuilder.append("FROM Analysis a JOIN Request r ON r.name = a.name ");
            strBuilder.append(this.makeAnalysisGroupINstatement(this.dataVendors.get(i)));
            strBuilder.append(" WHERE ");
            strBuilder.append(makePersonIdINstatement(personIDList, "a.name"));
            personIDList.clear();
            System.out.println("determine if hci person ids are found within db");
            System.out.println(strBuilder.toString());

            this.query.executeAnalysisWithCriteriaQuery(strBuilder.toString(), personIDList);

        }

        for(String ev : excludedVendors){
            StringBuilder strBuilder = new StringBuilder();
            strBuilder.append("SELECT a.name as personID \n ");
            strBuilder.append("FROM Analysis a JOIN Request r ON r.name = a.name \n");
            strBuilder.append(this.makeAnalysisGroupINstatement(ev));
            this.query.filterPersonIDList(strBuilder.toString(), personIDList);

        }
        String baseQuery = "SELECT a.idAnalysis FROM Analysis a WHERE ";
        analysisIDList = this.query.getAnalysisRequestIdFromPersonID(baseQuery, personIDList, makePersonIdINstatement(personIDList, "a.name"));
        if(isRequestAuthed()){
            baseQuery = "SELECT r.idRequest FROM Request r WHERE ";
            requestIDList = this.query.getAnalysisRequestIdFromPersonID(baseQuery, personIDList, makePersonIdINstatement(personIDList, "r.name"));
        }

        outSummary(personIDList, analysisIDList);
        return analysisIDList;
    }



    private String makeQueryStatement(String dataVendor) {
        StringBuilder strBuild = new StringBuilder("WHERE ");

  //.*A[A-Za-z0-9]{6}

        //m2gen looks like this SL423827 tgen looks like this '16-0063480a_C046_0018_010951_LN_Whole_T1_K1ID2_A61708_R1'
        // which we've simplified to A61708
        if (dataVendor.equals("avatar")) {
            strBuild.append(" s.name LIKE \'SL%\' OR s.name REGEXP \'^[0-9]{2}-[A-Za-z0-9\\.]+.*$\'" +
                    " OR s.name REGEXP \'.*A[0-9]{5,6}\' ");
        } else if (dataVendor.equals("foundation")) {
            strBuild.append(" ( s.name  REGEXP \'^T?C?Q?RF[0-9]+\' ");
            strBuild.append(" OR s.name LIKE \'ORD%\' ) ");
        } else if (dataVendor.equals("tempus")){
            strBuild.append(" s.name LIKE \'TL%\' ");
        }else if(dataVendor.equals("all")) {
            return " ";
        }

        return strBuild.toString();
    }


    private String makePersonIdINstatement(Set<String> personIDList, String idType ) {
        StringBuilder strBuild = new StringBuilder();
        strBuild.append(idType);
        strBuild.append(" IN ( '");

        strBuild.append(String.join("', '",personIDList));
        strBuild.append("' );");
        return strBuild.toString();
    }

    private String makeAnalysisGroupINstatement(String dataVendor) {
        StringBuilder strBuild = new StringBuilder("JOIN AnalysisGroupItem agi ON agi.idAnalysis = a.idAnalysis AND agi.idAnalysisGroup IN ( ");


        if (dataVendor.equals("avatar")) {
            strBuild.append(AVATAR_FOLDER_ID);
        } else if (dataVendor.equals("foundation")) {
            strBuild.append(FOUNDATION_FOLDER_ID);
        } else if (dataVendor.equals("tempus") ) {
            strBuild.append(TEMPUS_FOLDER_ID);
        }else if(dataVendor.equals("all")){
            return "";
        }

        strBuild.append(" )");
        return strBuild.toString();
    }

    private String makeAnalysisGroupINstatement(List<String> vList) {
        StringBuilder strBuild = new StringBuilder("JOIN AnalysisGroupItem agi ON agi.idAnalysis = a.idAnalysis AND agi.idAnalysisGroup IN (");

        for(int i = 0; i < vList.size(); ++i) {
            if ((vList.get(i)).equals("avatar")) {
                strBuild.append(AVATAR_FOLDER_ID);
            } else if ((vList.get(i)).equals("foundation")) {
                strBuild.append(FOUNDATION_FOLDER_ID);
            } else if (vList.get(i).equals("tempus")) {
                strBuild.append(TEMPUS_FOLDER_ID);
            }else if(vList.get(i).equals("all")){
                return "";
            }

            if (i < dataVendors.size() - 1) {
                strBuild.append(", ");
            }
        }

        strBuild.append(")");
        return strBuild.toString();
    }





    public List<String> getIRAAssociation() throws Exception {
        ArrayList<String> associations = new ArrayList<>();

        for(String pKey : this.newSampleList.keySet()){
            List<PersonEntry> pEntries = this.newSampleList.get(pKey);
            for(PersonEntry pEntry : pEntries){
                // determine if avatar or foundation,  method name lies it could be either
                String queryStr = "";
                String targetStr = "";
                if (pEntry.getSlNumber().contains("SL")) {
                    queryStr = pEntry.getSubmittedDiagnosis();
                } else {
                    queryStr = pEntry.getTissueType();
                }

                System.out.println("Query String is: " + queryStr);
                if (diseaseAliasMap.get(queryStr) != null) {
                    targetStr = queryStr;
                } else {
                    String startWord = queryStr.split(" ")[0];
                    if (diseaseAliasMap.get(startWord) != null) {
                        targetStr = startWord;
                    } else {
                        targetStr = searchAllAliases(queryStr);
                    }
                }

                if (targetStr.equals("")) {
                    throw new Exception("The disease group could not be found with the query string: " + queryStr);
                }

                associations.add(targetStr);
                System.out.println("The target string is: " + targetStr);
            }
        }

        return associations;
    }

    private String searchAllAliases(String queryStr) {
        String targetStr = "";
        String lowerQueryStr = queryStr.toLowerCase();
        boolean found = false;

        for(String key : diseaseAliasMap.keySet()){
            List<String> aliasGroup = diseaseAliasMap.get(key);
            for(String alias :  aliasGroup){
                if (alias.toLowerCase().equals(lowerQueryStr)) {
                    targetStr = key;
                    found = true;
                    break;
                }
            }

            if (found) {
                break;
            }
        }

        return targetStr;
    }

    public void assignAnalysisToCollabs(Map<Integer, List<Integer>> collabsForAnalysis, boolean forAnalysis) {
        Iterator it = collabsForAnalysis.entrySet().iterator();

        while(it.hasNext()) {
            Entry<Integer, List<Integer>> entry = (Entry)it.next();
            Integer aKey = (Integer)entry.getKey();
            List<Integer> collabs = (List)collabsForAnalysis.get(aKey);
            if(forAnalysis){
                this.query.assignPermissions(collabs, aKey, "INSERT INTO AnalysisCollaborator VALUES (?,?,?,?)");
            }else{
                this.query.assignPermissions(collabs, aKey, "INSERT INTO RequestCollaborator VALUES (?,?,?,?)");
            }

        }

    }

    void outSummary(Set<String> personIDs, List<Integer> analysisIDs){
        System.out.println("There are " + personIDs.size() +  " patients that meet your criteria specified ");
        System.out.println("There are also " + analysisIDs.size() + " analyses for those patients" );
        System.out.println("Patient IDs below");
        for(String p : personIDs){
            System.out.println(p);
        }
        System.out.println("Analysis IDs Below");
        for(Integer a : analysisIDs){
            System.out.println("" + a);
        }

    }


    void parseArgs(int startIndex, List<String> itemList, String[] args) {
        for(int i = startIndex; i < args.length; ++i) {
            String item = args[i];
            if (item.charAt(0) == '-') {
                break;
            }

            itemList.add(item.toLowerCase());
        }

    }


}
