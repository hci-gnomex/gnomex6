package hci.gnomex.daemon.auto_import;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.*;

public class Query {
    private String username;
    private String password;
    private String connectionStr;
    private String className;
    private Connection conn;

    Query(String creds) {
        readInCreds(creds);
        initalizeConnection();
    }

    public static void main(String[] args) {
        new Query("C:\\Users\\u0566434\\Desktop\\ORIEN\\Java\\AvatarWrangler\\");
    }

    private void readInCreds(String Creds) {
        String fileName = Creds;
        FileReader fr = null;
        BufferedReader bf = null;

        try {
            fr = new FileReader(fileName);
            bf = new BufferedReader(fr);
            String line = "";

            while ((line = bf.readLine()) != null) {
                String[] credArray = line.split(" ");
                if (credArray[0].equals("username")) {
                    this.username = credArray[1];
                } else if (credArray[0].equals("password")) {
                    this.password = credArray[1];
                } else if (credArray[0].equals("connectionStr")) {
                    this.connectionStr = credArray[1];
                } else {
                    if (!credArray[0].equals("className")) {
                        throw new Exception("Missing Credentials");
                    }

                    this.className = credArray[1];
                }
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                if (fr != null) {
                    fr.close();
                }

                if (bf != null) {
                    bf.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }

        }

    }

    public void initalizeConnection() {
        try {
            Class.forName(className);
            conn = DriverManager.getConnection(connectionStr, username, password);
        } catch (SQLException e) {
            if (conn != null) {
                try {
                    conn.close();
                } catch (Exception ex) { /* ignored */ }
            }
            e.printStackTrace();
            System.exit(1);
        } catch (ClassNotFoundException e) {
            if (conn != null) {
                try {
                    conn.close();
                } catch (Exception ex) { /* ignored */ }
            }

            e.printStackTrace();
            System.exit(1);
        }

    }

    public String getIdAnalysisFromPropertyEntry(String pe) {
        String query = "SELECT a.idAnalysis,a.name FROM Analysis a JOIN PropertyEntry pe ON pe.valueString = a.name";
        Integer idAnalysis = null;
        Statement stmt = null;

        try {
            stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(query);

            while (rs.next()) {
                String personId = rs.getString("name");
                if (personId.equals(pe)) {
                    idAnalysis = rs.getInt("idAnalysis");
                    break;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            try {
                stmt.close();
            } catch (Exception e) {
            }
        }

        return idAnalysis != null ? "" + idAnalysis : null;
    }

    public List getXMLFileStatus(String fileName) {
        List xmlStatusRow = new ArrayList();
        List<List> xmlStatus = new ArrayList<List>();
        StringBuilder strBuild = new StringBuilder();


        String sqlStmt = "SELECT srcFileName, srcFileModDtTm, processedYN "
                + "FROM MolecularProfiling.dbo.XmlFileData xData " +
                "WHERE xData.srcFileName =? "
                + "ORDER BY xData.srcFileName";


        PreparedStatement prepStmt = null;
        try {
            prepStmt = conn.prepareStatement(sqlStmt);
            prepStmt.setString(1, fileName);
            ResultSet rs = prepStmt.executeQuery();

            while (rs.next()) {
                xmlStatusRow.add(rs.getString("srcFileName"));
                xmlStatusRow.add(rs.getTimestamp("srcFileModDtTm"));
                xmlStatusRow.add(rs.getString("processedYN"));
                xmlStatus.add(xmlStatusRow);
            }


        } catch (SQLException e) {
            return xmlStatus;
        } finally {
            try {
                prepStmt.close();
            } catch (Exception e) {
            }

        }

        return xmlStatus;
    }

    public boolean isExistingExperiment(String mrn) {
        String sqlStmt = "SELECT rq.idRequest, rq.number " +
                " FROM Request rq" +
                " WHERE rq.idRequest IN (SELECT pe.idRequest  FROM PropertyEntry as pe" +
                " JOIN Property as p  ON p.idProperty = pe.idProperty" +
                " WHERE pe.valueString = ?)";

        PreparedStatement prepStmt = null;
        int count = 0;

        try {
            prepStmt = conn.prepareStatement(sqlStmt);
            prepStmt.setString(1, mrn);


            ResultSet rs = prepStmt.executeQuery();

            while (rs.next()) {
                rs.getString("idRequest");
                rs.getString("number");
                count++;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            try {
                prepStmt.close();
            } catch (Exception e) {
            }

        }

        return count > 0;
    }

    public Integer getAnalysisID(String name, String folderName) {
        String query = "SELECT a.idAnalysis " +
                " FROM Analysis a " +
                " JOIN AnalysisGroupItem ai ON ai.idAnalysis = a.idAnalysis " +
                " JOIN AnalysisGroup ag ON ag.idAnalysisGroup = ai.idAnalysisGroup" +
                " WHERE a.name = ? AND ag.name = ?";
        PreparedStatement pStmnt = null;
        Integer analysisID = -1;
        List<Integer> analysisDupicates = new ArrayList<Integer>();

        try {
            pStmnt = conn.prepareStatement(query);
            pStmnt.setString(1, name);
            pStmnt.setString(2, folderName);
            ResultSet rs = pStmnt.executeQuery();

            while (rs.next()) {
                System.out.println("Analysis:  " + rs.getInt("idAnalysis") + " is already created");
                analysisID = rs.getInt("idAnalysis");
                analysisDupicates.add(analysisID);
            }

            if (analysisDupicates.size() > 1) {
                String strDups = "";
                for (Integer dup : analysisDupicates) { // if dups never expect to be that many so string cat is fine
                    strDups += dup + ", ";
                }


                throw new Exception("There are duplicate analyses: " + strDups + " in Analysis Group " + folderName);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } catch (Exception e) {
            System.out.println(e.getMessage());
            e.getStackTrace();
        } finally {
            try {
                pStmnt.close();
            } catch (Exception var20) {
            }

        }

        return analysisID;
    }

    public Connection getConnection() {
        return this.conn;
    }

    public void closeConnection() { // call after every set of sql queries
        if (conn != null) {
            try {
                conn.close();
            } catch (Exception e) { /* ignored */ }
        }
    }

    public List<String> getImportedIDReport(List<String> sampleIDList, Integer idAnalysisGroup) {
        List<String> importedReport = new ArrayList();
        String strIDList = buildINstr(sampleIDList);
        if (sampleIDList.size() > 0) {
            String sampleName = "";

            if (idAnalysisGroup == 11) { //avatar project
                sampleName = "(s.name LIKE \'SL%\' OR s.name REGEXP \'^[0-9]{2}-[A-Za-z0-9\\.]+.*$\')";

            } else if (idAnalysisGroup == 14) {// foundation project{
                sampleName = "(s.name LIKE \'%RF%\' OR s.name LIKE \'ORD%\' );";
            }else if(idAnalysisGroup == 22){ //tempus project
                sampleName = "(s.name LIKE \'TL%\')";
            }

            String query = "SELECT r.idRequest, a.idAnalysis, s.name, a.name FROM Sample s \n" +
                    "JOIN Request r ON s.idRequest = r.idRequest \n" +
                    "JOIN Analysis a ON a.name = r.name \n" +
                    "JOIN AnalysisGroupItem agi ON agi.idAnalysis = a.idAnalysis AND agi.idAnalysisGroup = " + idAnalysisGroup + "\n" +
                    "WHERE s.name IN " + strIDList + " AND " + sampleName;
            System.out.println("The report query: " + query);
            Statement stat = null;

            try {
                StringBuilder strBuild = new StringBuilder();
                stat = conn.createStatement();
                ResultSet rs = stat.executeQuery(query);
                while (rs.next()) {
                    strBuild.append(rs.getInt(1));
                    strBuild.append("\t");
                    strBuild.append(rs.getInt(2));
                    strBuild.append("\t");
                    strBuild.append(rs.getString(3));
                    strBuild.append("\t");
                    strBuild.append(rs.getString(4));
                    strBuild.append("\n");
                    importedReport.add(strBuild.toString());
                    strBuild = new StringBuilder();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            } finally {
                if (stat != null) {
                    try {
                        stat.close();
                    } catch (SQLException e) {
                        e.printStackTrace();
                        System.exit(1);
                    }
                }

            }
        }

        return importedReport;
    }

    public boolean hasLinkAnalysisExperiment(int analysisID, int requestID) {
        boolean hasLink = false;
        StringBuilder strBuild = new StringBuilder();
        strBuild.append("SELECT * ");
        strBuild.append("FROM AnalysisExperimentItem aei ");
        strBuild.append("WHERE aei.idRequest = ? AND aei.idAnalysis = ? ");
        PreparedStatement pStmnt = null;
        int count = 0;

        try {
            pStmnt = conn.prepareStatement(strBuild.toString());
            pStmnt.setInt(1, requestID);
            pStmnt.setInt(2, analysisID);
            ResultSet rs = pStmnt.executeQuery();
            if (rs.next()) {
                System.out.print("Has a link ");
                System.out.println("On idAnalysisExperimentItem: " + rs.getInt("idAnalysisExperimentItem"));
                ++count;
            }

            if (count > 0) {
                hasLink = true;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } catch (Exception e) {
            System.out.println(e.getMessage());
            e.getStackTrace();
        } finally {
            try {
                pStmnt.close();
            } catch (Exception e) {
            }
        }
        return hasLink;
    }

    public Map<Integer, List<Integer>> getCollaboratorsForIRB(List<String> irbNames, List<Integer> analysisRequestIDs, IRBContainer irbContainer, String collabToAnalysisRequestQuery, String orderType) {
        Statement statement = null;
        PreparedStatement pStatement = null;
        ArrayList<Integer> collabIDsInLab = new ArrayList();
        Map<Integer, List<Integer>> collabsToAddForAnalysis = new HashMap();
        String theIRB = irbNames.size() > 0 ? irbNames.get(0) : null;
        irbContainer.setIrbName(theIRB);
        irbContainer.setIrbOrders(new HashMap<>());

        try {

            String collabToAnalysisQuery = "SELECT * from Lab l JOIN LabUser lu ON lu.idLab = l.idLab WHERE l.lastName LIKE ?";
            //todo having multiple irbs doesn't make sense because you can't tell which analysis goes with which IRB
            //todo need to determine a way in which analyses can be associated with a IRB programmatically, right now its a manual process.
            //todo this code below will need to be changed to something like a map to group the lab Members into irb groups.
            //todo for now assume that only one IRB is for all analyses listed
            if(theIRB != null && !theIRB.equals("")) {

                pStatement = conn.prepareStatement(collabToAnalysisQuery);
                pStatement.setString(1, "%" + theIRB + "%");
                ResultSet rs = pStatement.executeQuery();

                int labID = -1;
                String labContactEmail = "";
                while (rs.next()) {
                    labContactEmail = rs.getString("contactEmail");
                    collabIDsInLab.add(rs.getInt("idAppUser"));
                    Integer currentLabID = rs.getInt("idLab");
                    if (currentLabID != labID && labID != -1) {
                        throw new Exception("Error more than one IRB found Please be more specific with the IRB name, it should be unique " + theIRB);
                    }
                    labID = currentLabID;
                }
                labID = -1;
                pStatement.clearParameters();
                irbContainer.setIrbEmail(labContactEmail);
            }


            for (Integer arID : analysisRequestIDs) {
                collabsToAddForAnalysis.put(arID, new ArrayList());
                System.out.println("-------------------------------------------------------------------");


                for (Integer collabID : collabIDsInLab) {

                    pStatement = conn.prepareStatement(collabToAnalysisRequestQuery);
                    pStatement.setInt(1, arID);
                    pStatement.setInt(2, collabID);

                    String[] queryArray = collabToAnalysisRequestQuery.split("\\?");
                    System.out.print(queryArray[0] + arID + queryArray[1] + collabID);
                    //System.out.print("SELECT * from AnalysisCollaborator ac \nWhere ac.idAnalysis = " + arID + " AND ac.idAppUser = " + collabID);
                    ResultSet rs = pStatement.executeQuery();
                    if (rs.next()) {
                        System.out.println( " collab: "+ collabID + "  already added. skipping.... ");
                    }else{
                        ((List) collabsToAddForAnalysis.get(arID)).add(collabID);

                        System.out.println("   actual collabs added " + collabID);
                    }
                }

                // now get only new analyses and group them by HCI Person ID
                pStatement.clearParameters();
                List<Integer> newOrdersToAssign = new ArrayList();
                List<Integer> collabs = collabsToAddForAnalysis.get(arID);
                if(collabs != null && collabs.size() > 0){
                    newOrdersToAssign.add(arID);
                }
                String queryPersonID = "";
                if(orderType.equals("idAnalysis")){
                    queryPersonID = "Select a.name from Analysis a WHERE a.idAnalysis = ?";
                } else {
                    queryPersonID = "Select a.name from Request r WHERE r.idRequest = ?";
                }
                for(Integer order : newOrdersToAssign) {
                    pStatement = conn.prepareStatement(queryPersonID);
                    pStatement.setInt(1, order);

                    ResultSet rs = pStatement.executeQuery();

                    if (rs.next()) {
                        String personID = rs.getString("name");
                        List<Integer> orders =  irbContainer.getIrbOrders().get(personID);
                        if(orders != null){
                            orders.add(order);
                        }else {
                            irbContainer.getIrbOrders().put(personID, new ArrayList<Integer>(Arrays.asList(order)));
                        }

                    }
                }




                System.out.println("-------------------------------------------------------------------");
            }
        } catch (SQLException e) {
            e.printStackTrace();
            System.exit(1);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println(e.getMessage());

            try {
                pStatement.close();
            } catch (SQLException se) {
                System.out.println("can't close prepared statement");
            }

            System.exit(1);
        } finally {
            try {
                pStatement.close();
            } catch (SQLException se) {
                System.out.println("can't close prepared statement");
            }

        }

        return collabsToAddForAnalysis;
    }

    String buildINstr(List<String> ids) {
        StringBuilder strIDList = new StringBuilder();
        strIDList.append("(");

        for (int i = 0; i < ids.size(); ++i) {
            if (i < ids.size() - 1) {
                strIDList.append("'");
                strIDList.append((String) ids.get(i));
                strIDList.append("', ");
            } else {
                strIDList.append("'");
                strIDList.append((String) ids.get(i));
                strIDList.append("'");
            }
        }

        strIDList.append(")");
        return strIDList.toString();
    }

    public void assignPermissions(List<Integer> collabsToAddToAnalysis, Integer analysisID, String assignPermissionsQuery)  {
        PreparedStatement ps = null;
        if(collabsToAddToAnalysis.size() == 0){
            return;
        }
        try {
            ps = this.conn.prepareStatement(assignPermissionsQuery);
            this.conn.setAutoCommit(false);

            for (Integer collabID : collabsToAddToAnalysis) {
                ps.setInt(1, analysisID);
                ps.setInt(2, collabID);
                ps.setString(3, "Y");
                ps.setString(4, "Y");
                ps.addBatch();
            }

            ps.executeBatch();
            this.conn.commit();


        } catch (SQLException sqle) {
            try {
                this.conn.rollback();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }finally {
            try {
                if(ps != null)  ps.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }

    }

    public Set<String> executeAnalysisWithCriteriaQuery(String query,
                                                        Set<String> personIDList) throws Exception {
        Statement stmnt = null;

        try {
            stmnt = this.conn.createStatement();

            ResultSet rs = stmnt.executeQuery(query);

            while (rs.next()) {
                personIDList.add(rs.getString("personID"));
            }

        } catch (SQLException sqlException) {
            sqlException.printStackTrace();
            throw new Exception(sqlException.getMessage() + " : Could not execute query to find Analysis With Criteria");
        }

        return personIDList;
    }

    public List<Integer> getAnalysisRequestIdFromPersonID(String baseQuery, Set<String> personIDList, String inStatement) throws Exception {
        Statement stmnt = null;
        //analysis or request ids can be
        List<Integer> analysisRequestIDs = new ArrayList<>();
        boolean forAnalysis = baseQuery.contains("Analysis");


        try {
            stmnt = this.conn.createStatement();
            String query = baseQuery + inStatement;


            ResultSet rs = stmnt.executeQuery(query);

            while (rs.next()) {
                if(forAnalysis){
                    analysisRequestIDs.add(rs.getInt("idAnalysis"));
                }else{
                    analysisRequestIDs.add(rs.getInt("idRequest"));
                }


            }

        } catch (SQLException sqlException) {
            sqlException.printStackTrace();
            throw new Exception(sqlException.getMessage() + " : Could not execute query to find Analysis With Criteria");
        }
        return analysisRequestIDs;
    }

    public void filterPersonIDList(String filterQuery, Set<String> personIDList) throws Exception {
        Statement stmnt = null;

        try {
            stmnt = this.conn.createStatement();

            ResultSet rs = stmnt.executeQuery(filterQuery);

            while (rs.next()) {
                personIDList.remove(rs.getString("personID"));
            }

        } catch (SQLException sqlException) {
            sqlException.printStackTrace();
            throw new Exception(sqlException.getMessage() + " : Could not execute query fo ");
        }

    }

    public String getPersonIDFromSample(String fileName) throws Exception {
        Statement stmnt = null;
        String personID = "";
        List<String> countList = new ArrayList<>();

        String query = "Select DISTINCT r.name as personID FROM Request r JOIN Sample s ON s.idRequest = r.idRequest WHERE s.name LIKE \'%"
                + fileName + "%'";
        stmnt = this.conn.createStatement();
        ResultSet rs = stmnt.executeQuery(query);
        while (rs.next()) {
            personID = rs.getString("personID");
            countList.add(personID);
        }
        if(countList.size() > 1){
            throw new Exception("In trying to retrieve Person ID there has been id collision for  "
                    + fileName +  ". Here are the Person IDs: " + String.join(", ",countList));
        }
        if (personID.equals("")) {
            throw new Exception("Person ID can't be found from filename: " + fileName);
        }
        return personID;

    }
}
