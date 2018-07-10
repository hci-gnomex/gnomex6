package hci.gnomex.controller;

import hci.gnomex.constants.Constants;
import hci.gnomex.model.Analysis;
import hci.gnomex.model.DataTrack;
import hci.gnomex.model.Request;
import hci.gnomex.model.Topic;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.query.Query;

import javax.json.*;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

public class GetGNomExOrderFromNumberServlet extends HttpServlet {
    private static Logger LOG = Logger.getLogger(GetGNomExOrderFromNumberServlet.class);

    private String requestNumber;
    private String dataTrackNumber;
    private String topicNumber;
    private String analysisNumber;
    private String hasID;
    private static String webContextPath;



    protected static void initLog4j() {
        String configFile = "";
        configFile = webContextPath + "/WEB-INF/classes/" + Constants.LOGGING_PROPERTIES;
        org.apache.log4j.PropertyConfigurator.configure(configFile);
        if (configFile == null) {
            System.err.println("[GNomExFrontController] No configuration file specified for log4j!");
        }
        org.apache.log4j.PropertyConfigurator.configure(configFile);
    }

    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        webContextPath = config.getServletContext().getRealPath(Constants.FILE_SEPARATOR);

        initLog4j();

        // we should only do this once
    } // end of init


    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        Session sess = null;
        try {
            JsonObject value = null;
            requestNumber = req.getParameter("requestNumber");
            analysisNumber = req.getParameter("analysisNumber");
            dataTrackNumber = req.getParameter("dataTrackNumber");
            topicNumber = req.getParameter("topicNumber");
            hasID = req.getParameter("hasID");

            Integer idRequest = -1;
            Integer idAnalysis = -1;
            Integer idDataTrack = -1;


            if(hasID == null){
                hasID = "N";
            }

            sess = HibernateSession.currentReadOnlySession("guest");
            PropertyDictionaryHelper.getInstance(sess);


            if(requestNumber != null){
                String requestNumberBase = Request.getBaseRequestNumber(requestNumber);
                String  queryStr ="";
                System.out.println("requestNumber: " + requestNumberBase);
                Query query = null;


                if(hasID.equals("N")){
                    queryStr = "SELECT req from Request as req where req.number like ? OR req.number = ?";
                    query = sess.createQuery(queryStr).setParameter(0 , requestNumberBase + "%" )
                            .setParameter(1, requestNumberBase );
                }else{
                    idRequest = new Integer(this.requestNumber);
                    queryStr = "SELECT req from Request as req where req.idRequest = :idRequest";
                    query = sess.createQuery(queryStr).setParameter("idRequest", idRequest );
                }

                List reqRow = query.list();

                if(reqRow.size() ==  0){
                    throw new Exception("Request number " + requestNumber + " does not exists" );
                }

                Request r = (Request)reqRow.get(0);
                value = Json.createObjectBuilder()
                        .add("result", "SUCCESS")
                        .add("requestNumber", r.getNumber())
                        .add("codeVisbility", r.getCodeVisibility())
                        .add("idRequest", r.getIdRequest())
                        .add("idProject", r.getIdProject())
                        .add("idLab", r.getIdLab())
                        .build();


            }else if(analysisNumber != null){
                analysisNumber = analysisNumber.replaceAll("#", "");
                System.out.println("analysisNumber: " + analysisNumber );
                String queryStr = "";
                Query query = null;


                if(hasID.equals("N")){
                    queryStr ="SELECT a from Analysis as a where a.number = :analysisNumber" ;
                    query = sess.createQuery(queryStr).setParameter("analysisNumber", analysisNumber );
                }else{
                    idAnalysis = new Integer(this.analysisNumber);
                    queryStr ="SELECT a from Analysis as a where a.idAnalysis = :idAnalysis" ;
                    query = sess.createQuery(queryStr).setParameter("idAnalysis", idAnalysis );
                }

                List analysisRow = query.list();
                if(analysisRow.size() == 0){
                    throw new Exception("Analysis number " + analysisNumber + " does not exists" );
                }

                Analysis a = (Analysis)analysisRow.get(0);
                value = Json.createObjectBuilder()
                        .add("result", "SUCCESS")
                        .add("analysisNumber", a.getNumber())
                        .add("codeVisbility", a.getCodeVisibility())
                        .add("idAnalysis", a.getIdAnalysis())
                        .add("idLab", a.getIdLab())
                        .build();


            }else if(dataTrackNumber != null){
                dataTrackNumber = dataTrackNumber.replaceAll("#", "");
                dataTrackNumber.toUpperCase();
                System.out.println("dataTrackNumber: " + dataTrackNumber );
                String queryStr = "";
                Query query = null;


                if(hasID.equals("N")) {
                    queryStr = "SELECT dt.fileName, dt.codeVisibility, dt.idDataTrack, dt.idLab,dt.idGenomeBuild, gb.idOrganism " +
                            "FROM DataTrack as dt JOIN dt.folders as dtfold JOIN dtfold.genomeBuild as gb " +
                            "WHERE dt.fileName = :dataTrackNumber";
                    query = sess.createQuery(queryStr).setParameter("dataTrackNumber" , dataTrackNumber );
                }else{
                    idDataTrack = new Integer(this.dataTrackNumber);
                    queryStr = "SELECT dt.fileName, dt.codeVisibility, dt.idDataTrack, dt.idLab,dt.idGenomeBuild, gb.idOrganism " +
                            "FROM DataTrack as dt JOIN dt.folders as dtfold JOIN dtfold.genomeBuild as gb " +
                            "WHERE dt.idDataTrack = :idDataTrack";
                    query = sess.createQuery(queryStr).setParameter("idDataTrack" , idDataTrack );
                }

                List<Object[]> dtResults = query.list();
                if(dtResults.size() ==  0){
                    throw new Exception("Datatrack number " + requestNumber + " does not exists" );
                }



                Object[] dtRow = dtResults.get(0);

                JsonObject idLabVal = null;
                if(dtRow[3] != null){
                    idLabVal = Json.createObjectBuilder().add("idLab", (Integer)dtRow[3]).build();
                }else{
                    idLabVal = Json.createObjectBuilder().add("idLab", JsonValue.NULL).build();
                }

                value = Json.createObjectBuilder()
                        .add("result", "SUCCESS")
                        .add("dataTrackNumber", (String)dtRow[0])
                        .add("codeVisibility", (String)dtRow[1])
                        .add("idDataTrack", (Integer)dtRow[2])
                        .add("idLab", idLabVal.get("idLab"))
                        .add("idGenomeBuild",(Integer)dtRow[4])
                        .add("idOrganism",(Integer)dtRow[5])
                        .build();

            }else if(topicNumber != null){
                topicNumber = topicNumber.replaceAll("[A-Za-z#]*", "");
                Integer idTopic = new Integer(topicNumber);

                System.out.println("topicNumber: " + topicNumber ); // not actually a topic number based off of idTopic

                String  queryStr = "SELECT t from Topic as t where t.idTopic = :idTopic";

                Query query = sess.createQuery(queryStr).setParameter("idTopic" ,idTopic);
                List topicRow = query.list();

                if(topicRow.size() ==  0){
                    throw new Exception("Topic number " + topicNumber + " does not exists" );
                }

                Topic t = (Topic)topicRow.get(0);
                value = Json.createObjectBuilder()
                        .add("result", "SUCCESS")
                        .add("topicNumber", t.getNumber())
                        .add("codeVisbility", t.getCodeVisibility())
                        .add("idTopic", t.getIdTopic())
                        .add("idLab", t.getIdLab())
                        .build();

            }

            JsonWriter jsonWriter = Json.createWriter(res.getOutputStream());
            res.setContentType("application/json");
            jsonWriter.writeObject(value);
            jsonWriter.close();




        } catch (Exception e) {
            LOG.error("An error occurred in GetGNomExOrderFromNumberServlet", e);
            res.addHeader("message", e.getMessage());

            JsonObject value = Json.createObjectBuilder()
                    .add("ERROR", e.getMessage())
                    .build();
            JsonWriter jsonWriter = Json.createWriter(res.getOutputStream());

            res.setContentType("application/json");
            jsonWriter.writeObject(value);
            jsonWriter.close();

        }finally {
            if (sess != null) {
                try {
                    HibernateSession.closeSession();
                } catch (Exception e) {
                    LOG.error("An error occurred in GetGNomExOrderFromNumberServlet", e);
                }
            }
            res.setHeader("Cache-Control", "max-age=0, must-revalidate");

        }

    }

    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {

    }



}
