package hci.gnomex.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.Analysis;
import hci.gnomex.model.AnalysisFile;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class GetAnalysisFilesToDistribute extends GNomExCommand implements Serializable {


    // the static field for logging in Log4J
    private static Logger LOG = Logger.getLogger(GetAnalysisFilesToDistribute.class);

    private Integer idAnalysis;
    private Session sess;

    public void validate() {
    }

    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

        if (request.getParameter("idAnalysis") != null && !request.getParameter("idAnalysis").equals("")) {
            idAnalysis = Integer.valueOf(request.getParameter("idAnalysis"));
        } else {
            this.addInvalidField("idAnalysis", "idAnalysis is required.");
        }

    }

    public Command execute() throws RollBackCommandException {

        try {
            sess = HibernateSession.currentSession(this.getUsername());
            Analysis analysis = sess.load(Analysis.class, idAnalysis);

            ArrayList<AnalysisFile> fileList = new ArrayList<>(analysis.getFiles());


            ObjectMapper mapper = new ObjectMapper();
            ArrayNode jsonAnalysisFiles = mapper.createArrayNode();
            for(AnalysisFile af : fileList ){
                ObjectNode obj = (ObjectNode)mapper.readTree(af.toJsonObject());
                String afFileNameUpperCase = af.getFileName().toUpperCase();
                if (afFileNameUpperCase.endsWith(".BAM")) {
                    // is it already a data track?
                    addAnalysisFile(af,  obj, jsonAnalysisFiles);
                } else if (afFileNameUpperCase.endsWith(".USEQ") || afFileNameUpperCase.endsWith(".BB") || afFileNameUpperCase.endsWith(".BW")) {
                    // is it already a data track?
                    addAnalysisFile(af,  obj, jsonAnalysisFiles);
                } else if (afFileNameUpperCase.endsWith(".VCF.GZ")) {
                    // is it already a data track?
                    addAnalysisFile(af,  obj, jsonAnalysisFiles);
                }

            }

            ObjectNode obj = new ObjectMapper().createObjectNode();
            obj.put("result", "SUCCESS");
            obj.put("idAnalysis", "" + analysis.getIdAnalysis());
            obj.set("AnalysisFiles", jsonAnalysisFiles );
            this.jsonResult = mapper.writeValueAsString(obj);



            setResponsePage(this.SUCCESS_JSP);
        } catch (Exception e) {
            this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in GetAnalysisFilesToDistribute ", e);
            throw new RollBackCommandException(e.getMessage());
        }

        return this;
    }

    private static int getidDataTrack(int idAnalysisFile, Session sess) {
        int idDataTrack = -1;

        String buf = "SELECT idDataTrack from DataTrackFile where idAnalysisFile = " + idAnalysisFile;
        List results = sess.createQuery(buf).list();

        if (results.size() > 0) {
            idDataTrack = (Integer) results.get(0);
        }

        return idDataTrack;
    }

    private void addAnalysisFile(AnalysisFile af,  ObjectNode obj, ArrayNode arrayNode){
        if (getidDataTrack(af.getIdAnalysisFile(), sess) == -1) {
            obj.put("hasDataTrack", "N");
        }else{
            obj.put("hasDataTrack", "Y");
        }
        arrayNode.add(obj);
    }





}
