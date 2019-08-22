package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.ExperimentDesign;
import hci.gnomex.model.ExperimentDesignEntry;
import hci.gnomex.model.ExperimentFactor;
import hci.gnomex.model.ExperimentFactorEntry;
import hci.gnomex.model.Project;
import hci.gnomex.model.QualityControlStepEntry;
import hci.gnomex.utility.HibernateSession;

import java.io.Serializable;
import java.io.StringReader;
import java.util.Set;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.servlet.http.HttpSession;

import org.hibernate.Session;
import org.apache.log4j.Logger;

public class SaveProject extends GNomExCommand implements Serializable {

    // the static field for logging in Log4J
    private static Logger LOG = Logger.getLogger(SaveProject.class);

    private JsonObject projectJson;

    private Project project;
    private boolean isNewProject = false;
    private String parseEntries = "N";

    public void validate() {
    }

    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

        String projectJSONString = request.getParameter("projectJSONString");
        if (Util.isParameterNonEmpty(projectJSONString)) {
            try (JsonReader reader = Json.createReader(new StringReader(projectJSONString))) {
                this.projectJson = reader.readObject();
            }
        } else {
            this.addInvalidField("projectJSONString", "projectJSONString is required.");
        }

        if (Util.getJsonStringSafeNonNull(this.projectJson, "name").equals("")) {
            this.addInvalidField("projectName", "Project name is required.");
        }

        if (request.getParameter("parseEntries") != null && !request.getParameter("parseEntries").equals("")) {
            parseEntries = request.getParameter("parseEntries");
        }

    }

    public Command execute() throws RollBackCommandException {

        try {
            Session sess = HibernateSession.currentSession(this.getUsername());
            initializeProject(this.projectJson, sess);

            if (this.isValid() && this.getSecAdvisor().canUpdate(project)) {

                sess.save(project);
                sess.flush();

                if (parseEntries.equals("Y")) {
                    initializeExperimentFactorEntries(this.projectJson.getJsonArray("ExperimentFactorEntries"), sess);
                    initializeExperimentDesignEntries(this.projectJson.getJsonArray("ExperimentDesignEntries"), sess);
                } else {
                    initializeExperimentFactors(this.projectJson.getJsonObject("ExperimentFactor"), sess);
                    initializeExperimentDesigns(this.projectJson.getJsonObject("ExperimentDesign"), sess);
                    initializeExperimentQuality(this.projectJson.getJsonObject("ExperimentQuality"), sess);
                }

                sess.flush();

                this.jsonResult = Json.createObjectBuilder()
                        .add("result", "SUCCESS")
                        .add("idProject", this.project.getIdProject().toString())
                        .build()
                        .toString();

                setResponsePage(this.SUCCESS_JSP);

            } else {
                this.addInvalidField("Insufficient permissions", "Insufficient permission to save project.");
                setResponsePage(this.ERROR_JSP);
            }

        } catch (Exception e) {
            this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in SaveProject ", e);
            throw new RollBackCommandException(e.getMessage());
        }

        return this;
    }

    private void initializeProject(JsonObject n, Session sess) {
        int idProject = Integer.parseInt(Util.getJsonStringSafeNonNull(n, "idProject"));
        if (idProject == 0) {
            project = new Project();
            isNewProject = true;
        } else {
            project = sess.load(Project.class, idProject);
        }

        project.setName(Util.getJsonStringSafeNonNull(n, "name"));
        project.setDescription(Util.getJsonStringSafeNonNull(n, "description"));
        project.setIdAppUser(Integer.parseInt(Util.getJsonStringSafeNonNull(n, "idAppUser")));
        project.setIdLab(Integer.parseInt(Util.getJsonStringSafeNonNull(n, "idLab")));
    }

    private void initializeExperimentFactors(JsonObject n, Session sess) {
        // Delete the existing experiment design entries
        if (!isNewProject) {
            for (ExperimentFactorEntry entry : (Set<ExperimentFactorEntry>) project.getExperimentFactorEntries()) {
                sess.delete(entry);
            }
        }

        String otherLabel = Util.getJsonStringSafeNonNull(n, ExperimentFactorEntry.OTHER_LABEL);

        for (String code : n.keySet()) {

            String value = Util.getJsonStringSafeNonNull(n, code);

            if (code.equals(ExperimentFactorEntry.OTHER_LABEL)) {
                continue;
            }

            if (code.equals(ExperimentFactor.OTHER) && !otherLabel.equals("")) {
                ExperimentFactorEntry entry = new ExperimentFactorEntry();

                entry.setIdProject(project.getIdProject());
                entry.setCodeExperimentFactor(code);
                entry.setValue("Y");
                entry.setOtherLabel(otherLabel);

                sess.save(entry);
            } else if (value.equalsIgnoreCase("Y")) {
                ExperimentFactorEntry entry = new ExperimentFactorEntry();

                entry.setIdProject(project.getIdProject());
                entry.setCodeExperimentFactor(code);
                entry.setValue("Y");

                sess.save(entry);
            }
        }

        sess.flush();
    }

    private void initializeExperimentDesigns(JsonObject n, Session sess) {
        // Delete the existing experiment design entries
        if (!isNewProject) {
            for (ExperimentDesignEntry entry : (Set<ExperimentDesignEntry>)project.getExperimentDesignEntries()) {
                sess.delete(entry);
            }
        }

        String otherLabel = Util.getJsonStringSafeNonNull(n, ExperimentDesignEntry.OTHER_LABEL);

        for (String code : n.keySet()) {

            String value = Util.getJsonStringSafeNonNull(n, code);

            if (code.equals(ExperimentDesignEntry.OTHER_LABEL)) {
                continue;
            }

            if (code.equals(ExperimentDesign.OTHER) && !otherLabel.equals("")) {
                ExperimentDesignEntry entry = new ExperimentDesignEntry();
                entry.setIdProject(project.getIdProject());
                entry.setCodeExperimentDesign(code);
                entry.setValue("Y");
                entry.setOtherLabel(otherLabel);
                sess.save(entry);
            } else if (value.equalsIgnoreCase("Y")) {
                ExperimentDesignEntry entry = new ExperimentDesignEntry();
                entry.setIdProject(project.getIdProject());
                entry.setCodeExperimentDesign(code);
                entry.setValue("Y");
                sess.save(entry);
            }

        }

        sess.flush();
    }

    private void initializeExperimentQuality(JsonObject n, Session sess) {
        // Delete existing quality control step entries
        if (!isNewProject) {
            for (QualityControlStepEntry entry : (Set<QualityControlStepEntry>) project.getQualityControlStepEntries()) {
                sess.delete(entry);
            }
        }

        String otherLabel = Util.getJsonStringSafeNonNull(n, QualityControlStepEntry.OTHER_LABEL);
        String otherValidationLabel = Util.getJsonStringSafeNonNull(n, QualityControlStepEntry.OTHER_VALIDATION_LABEL);

        for (String code : n.keySet()) {

            String value = Util.getJsonStringSafeNonNull(n, code);

            if (code.equals(QualityControlStepEntry.OTHER_LABEL) || code.equals(QualityControlStepEntry.OTHER_VALIDATION_LABEL)) {
                continue;
            }

            if (code.equals(ExperimentDesign.OTHER) && !otherLabel.equals("")) {
                QualityControlStepEntry entry = new QualityControlStepEntry();

                entry.setIdProject(project.getIdProject());
                entry.setCodeQualityControlStep(code);
                entry.setValue("Y");
                entry.setOtherLabel(otherLabel);
                sess.save(entry);
            } else if (code.equals(ExperimentDesign.OTHER_VALIDATION) && !otherValidationLabel.equals("")) {
                QualityControlStepEntry entry = new QualityControlStepEntry();

                entry.setIdProject(project.getIdProject());
                entry.setCodeQualityControlStep(code);
                entry.setValue("Y");
                entry.setOtherLabel(otherValidationLabel);
                sess.save(entry);
            } else if (value.equalsIgnoreCase("Y")) {
                QualityControlStepEntry entry = new QualityControlStepEntry();

                entry.setIdProject(project.getIdProject());
                entry.setCodeQualityControlStep(code);
                entry.setValue("Y");
                sess.save(entry);
            }
        }

        sess.flush();
    }

    private void initializeExperimentFactorEntries(JsonArray arr, Session sess) {
        // Delete the existing experiment factor entries
        if (!isNewProject) {
            for (ExperimentFactorEntry entry : (Set<ExperimentFactorEntry>) project.getExperimentFactorEntries()) {
                sess.delete(entry);
            }
        }

        // Add experiment factor entry for each one marked as 'isSelected'.
        for (int i = 0; i < arr.size(); i++) {

            JsonObject node = arr.getJsonObject(i);

            String code = Util.getJsonStringSafeNonNull(node, "codeExperimentFactor");
            String isSelected = Util.getJsonStringSafeNonNull(node, "isSelected");
            String otherLabel = Util.getJsonStringSafeNonNull(node, "otherLabel");

            if (isSelected.equals("true")) {
                ExperimentFactorEntry entry = new ExperimentFactorEntry();
                entry.setIdProject(project.getIdProject());
                entry.setCodeExperimentFactor(code);
                entry.setValue("Y");
                if (!otherLabel.equals("")) {
                    entry.setOtherLabel(otherLabel);
                }

                sess.save(entry);
            }
        }

        sess.flush();
    }

    private void initializeExperimentDesignEntries(JsonArray arr, Session sess) {
        // Delete the existing experiment design entries
        if (!isNewProject) {
            for (ExperimentDesignEntry entry : (Set<ExperimentDesignEntry>) project.getExperimentDesignEntries()) {
                sess.delete(entry);
            }
        }

        // Add experiment design entry for each one marked as 'isSelected'.
        for (int i = 0; i < arr.size(); i++) {

            JsonObject node = arr.getJsonObject(i);

            String code = Util.getJsonStringSafeNonNull(node, "codeExperimentDesign");
            String isSelected = Util.getJsonStringSafeNonNull(node, "isSelected");
            String otherLabel = Util.getJsonStringSafeNonNull(node, "otherLabel");

            if (isSelected.equals("true")) {
                ExperimentDesignEntry entry = new ExperimentDesignEntry();
                entry.setIdProject(project.getIdProject());
                entry.setCodeExperimentDesign(code);
                entry.setValue("Y");
                if (!otherLabel.equals("")) {
                    entry.setOtherLabel(otherLabel);
                }

                sess.save(entry);
            }
        }

        sess.flush();
    }

}
