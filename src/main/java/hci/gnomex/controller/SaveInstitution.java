package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.Institution;
import hci.gnomex.utility.HibernateSession;

import java.io.Serializable;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.servlet.http.HttpSession;

import org.hibernate.Session;
import org.apache.log4j.Logger;

public class SaveInstitution extends GNomExCommand implements Serializable {

    // the static field for logging in Log4J
    private static Logger LOG = org.apache.log4j.Logger.getLogger(SaveInstitution.class);

    private JsonArray institutionsArray;

    public void validate() {
    }

    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
        String institutionsJsonString = request.getParameter("institutions");
        if (Util.isParameterNonEmpty(institutionsJsonString)) {
            try (JsonReader jsonReader = Json.createReader(new StringReader(institutionsJsonString))) {
                this.institutionsArray = jsonReader.readArray();
            } catch (Exception e) {
                this.addInvalidField("institutions", "Invalid institutions");
                this.errorDetails = Util.GNLOG(LOG, "Cannot parse institutions", e);
            }
        } else {
            this.addInvalidField("institutions", "institutions is required");
        }
    }

    public Command execute() throws RollBackCommandException {
        List<Institution> institutionsToDelete = new ArrayList<>();
        StringBuilder unremovableInstitutions = new StringBuilder();
        String unremovableInstitutionsString;

        try {
            if (this.isValid()) {
                Session sess = HibernateSession.currentSession(this.getUsername());

                List institutions = sess.createQuery("SELECT i from Institution i").list();

                for (Institution dbInstitution : (List<Institution>) institutions) {
                    boolean isFound = false;
                    for (int i = 0; i < this.institutionsArray.size(); i++) {
                        JsonObject node = this.institutionsArray.getJsonObject(i);
                        if (!Util.getJsonStringSafeNonNull(node, "idInstitution").equals("") && dbInstitution.getIdInstitution().equals(Integer.parseInt(node.getString("idInstitution")))) {
                            isFound = true;
                            break;
                        }
                    }
                    if (!isFound) {
                        institutionsToDelete.add(dbInstitution);
                    }
                }

                for (int i = 0; i < this.institutionsArray.size(); i++) {
                    Institution inst;
                    JsonObject node = this.institutionsArray.getJsonObject(i);

                    String idInstitution = Util.getJsonStringSafe(node, "idInstitution");
                    if (idInstitution == null || idInstitution.equals("")) {
                        inst = new Institution();
                    } else {
                        inst = sess.load(Institution.class, Integer.valueOf(idInstitution));
                    }

                    inst.setInstitution(Util.getJsonStringSafeNonNull(node, "institution"));
                    inst.setDescription(Util.getJsonStringSafeNonNull(node, "description"));
                    inst.setIsActive(Util.getJsonStringSafeNonNull(node, "isActive"));
                    sess.save(inst);
                }
                sess.flush();

                // Before deleting institutions we need to check if they are associated with data.  If they are don't delete and inform user.
                for (Institution inst : institutionsToDelete) {
                    List results = sess.createQuery("Select req.idRequest from Request req where req.idInstitution =  " + inst.getIdInstitution()).list();
                    if (results.size() > 0) {
                        unremovableInstitutions.append(inst.getInstitution());
                        unremovableInstitutions.append(", ");
                        continue;
                    }

                    results = sess.createQuery("Select a.idAnalysis from Analysis a where a.idInstitution =  " + inst.getIdInstitution()).list();
                    if (results.size() > 0) {
                        unremovableInstitutions.append(inst.getInstitution());
                        unremovableInstitutions.append(", ");
                        continue;
                    }

                    results = sess.createQuery("Select dt.idDataTrack from DataTrack dt where dt.idInstitution =  " + inst.getIdInstitution()).list();
                    if (results.size() > 0) {
                        unremovableInstitutions.append(inst.getInstitution());
                        unremovableInstitutions.append(", ");
                        continue;
                    }

                    results = sess.createQuery("Select t.idTopic from Topic t where t.idInstitution =  " + inst.getIdInstitution()).list();
                    if (results.size() > 0) {
                        unremovableInstitutions.append(inst.getInstitution());
                        unremovableInstitutions.append(", ");
                        continue;
                    }

                    sess.delete(inst);
                }

                unremovableInstitutionsString = unremovableInstitutions.toString();
                if (unremovableInstitutionsString.length() > 0) {
                    unremovableInstitutionsString = unremovableInstitutionsString.substring(0, unremovableInstitutionsString.lastIndexOf(","));
                }
                sess.flush();
            } else {
                throw new RollBackCommandException("Insufficient permission to edit institutions.");
            }
        } catch (Exception e) {
            this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in SaveInstitution ", e);
            throw new RollBackCommandException(e.getMessage());
        }

        this.jsonResult = Json.createObjectBuilder()
                .add("result", "SUCCESS")
                .add("unremovableInstitutions", unremovableInstitutionsString)
                .build().toString();
        setResponsePage(this.SUCCESS_JSP);

        return this;
    }

}
