package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.Analysis;
import hci.gnomex.model.AnalysisGroup;
import hci.gnomex.utility.HibernateSession;

import java.io.Serializable;
import java.util.*;

import javax.json.Json;
import javax.servlet.http.HttpSession;

import org.hibernate.Session;
import org.apache.log4j.Logger;

public class MoveAnalysis extends GNomExCommand implements Serializable {

    private static Logger LOG = Logger.getLogger(MoveAnalysis.class);

    private Integer idLab;
    private Integer idAnalysisGroup;
    private String idAnalysisString;
    private boolean isCopyMode;

    @Override
    public void loadCommand(HttpServletWrappedRequest request, HttpSession sess) {
        String idLabString = request.getParameter("idLab");
        if (Util.isParameterNonEmpty(idLabString)) {
            this.idLab = Integer.parseInt(idLabString);
        } else {
            this.addInvalidField("missing idlab", "Please provide idLab");
        }

        String idAnalysisGroupString = request.getParameter("idAnalysisGroup");
        if (Util.isParameterNonEmpty(idAnalysisGroupString)) {
            this.idAnalysisGroup = Integer.parseInt(idAnalysisGroupString);
        } else {
            this.addInvalidField("missing idAnalysisGroup", "Please provide idAnalysisGroup");
        }

        String idAnalysisStringParameter = request.getParameter("idAnalysisString");
        if (Util.isParameterNonEmpty(idAnalysisStringParameter)) {
            this.idAnalysisString = idAnalysisStringParameter;
        } else {
            this.addInvalidField("missing idAnalysisString", "Please provide idAnalysisString");
        }

        this.isCopyMode = Util.isParameterTrue(request.getParameter("isCopyMode"));
    }

    @Override
    public Command execute() throws RollBackCommandException {
        try {
            Session sess = HibernateSession.currentSession(this.getUsername());
            Set<String> idAnalyses = new HashSet<>(Arrays.asList(idAnalysisString.split(",")));
            List<String> invalidPermissions = new ArrayList<>();

            for (String idAnalysisString : idAnalyses) {
                Integer idAnalysis = Integer.parseInt(idAnalysisString);
                Analysis a = sess.load(Analysis.class, idAnalysis);
                if (!this.getSecurityAdvisor().canUpdate(a)) {
                    invalidPermissions.add(a.getNumber());
                    continue;
                }

                a.setIdLab(this.idLab);
                TreeSet<AnalysisGroup> analysisGroups = new TreeSet<>(new AnalysisGroupComparator());
                if (this.isCopyMode) {
                    analysisGroups.addAll(a.getAnalysisGroups());
                }
                AnalysisGroup newGroup = sess.load(AnalysisGroup.class, this.idAnalysisGroup);
                analysisGroups.add(newGroup);
                a.setAnalysisGroups(analysisGroups);

                sess.save(a);
            }

            sess.flush();

            StringBuilder badAnalysisBuilder = new StringBuilder();
            if (!invalidPermissions.isEmpty()) {
                badAnalysisBuilder.append("The following analyses could not be moved due to invalid permissions: ");
                for (Iterator<String> i = invalidPermissions.iterator(); i.hasNext();) {
                    badAnalysisBuilder.append(i.next());
                    if (i.hasNext()) {
                        badAnalysisBuilder.append(", ");
                    }
                }
            }

            this.jsonResult = Json.createObjectBuilder()
                    .add("result", "SUCCESS")
                    .add("invalidPermission", badAnalysisBuilder.toString())
                    .build().toString();
            setResponsePage(this.SUCCESS_JSP);
        } catch (Exception e) {
            this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in MoveAnalysis ", e);
            throw new RollBackCommandException(e.getMessage());
        }
        return this;
    }

    private class AnalysisGroupComparator implements Comparator<AnalysisGroup>, Serializable {
        public int compare(AnalysisGroup ag1, AnalysisGroup ag2) {
            return ag1.getIdAnalysisGroup().compareTo(ag2.getIdAnalysisGroup());
        }
    }

    @Override
    public void validate() {
    }

}
