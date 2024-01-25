package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.gnomex.model.*;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.Iterator;
import java.util.List;

public class GetProject extends GNomExCommand implements Serializable {

    private static Logger LOG = Logger.getLogger(GetProject.class);

    private Integer idProject;
    private Integer idLab;

    public void validate() {
    }

    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

        if (request.getParameter("idProject") != null) {
            idProject = Integer.valueOf(request.getParameter("idProject"));
        } else {
            this.addInvalidField("idProject", "idProject is required");
        }

        if (request.getParameter("idLab") != null) {
            idLab = Integer.valueOf(request.getParameter("idLab"));
        } else if (idProject == 0) {
            this.addInvalidField("idLab", "idLab is required");
        }
    }

    public Command execute() throws RollBackCommandException {

        try {

            Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());
            Project project;
            if (idProject == 0) {
                project = new Project();
                project.setIdProject(0);
                Lab l = sess.load(Lab.class, idLab);
                project.setIdLab(idLab);
                project.setLab(l);
                project.setIdAppUser(this.getSecAdvisor().getIdAppUser());
            } else {
                project = sess.get(Project.class, idProject);
                if (!this.getSecAdvisor().canRead(project)) {
                    this.addInvalidField("permissionerror", "Insufficient permissions to access this project.");
                } else {
                    this.getSecAdvisor().flagPermissions(project);

                }
            }

            if (isValid()) {
                StringBuffer queryBuf = new StringBuffer();
                queryBuf.append("SELECT ed from ExperimentDesign as ed ");
                List experimentDesigns = sess.createQuery(queryBuf.toString()).list();

                queryBuf = new StringBuffer();
                queryBuf.append("SELECT ef from ExperimentFactor as ef ");
                List experimentFactors = sess.createQuery(queryBuf.toString()).list();

                String showProjectAnnotations = "N";
                for (Iterator i = project.getLab().getCoreFacilities().iterator(); i.hasNext(); ) {
                    CoreFacility facility = (CoreFacility) i.next();
                    if (facility.getShowProjectAnnotations().equals("Y")) {
                        showProjectAnnotations = "Y";
                        break;
                    }
                }

                Document doc = new Document(new Element("OpenProjectList"));
                Element projectNode = project.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL).getRootElement();
                projectNode.setAttribute("showProjectAnnotations", showProjectAnnotations);
                doc.getRootElement().addContent(projectNode);

                // Show list of experiment design entries
                Element edParentNode = new Element("ExperimentDesignEntries");
                projectNode.addContent(edParentNode);
                for (Iterator i = experimentDesigns.iterator(); i.hasNext(); ) {
                    ExperimentDesign ed = (ExperimentDesign) i.next();

                    Element edNode = new Element("ExperimentDesignEntry");
                    ExperimentDesignEntry entry = null;
                    for (Iterator i1 = project.getExperimentDesignEntries().iterator(); i1.hasNext(); ) {
                        ExperimentDesignEntry edEntry = (ExperimentDesignEntry) i1.next();
                        if (edEntry.getCodeExperimentDesign().equals(ed.getCodeExperimentDesign())) {
                            entry = edEntry;
                            break;
                        }
                    }
                    edNode.setAttribute("codeExperimentDesign", ed.getCodeExperimentDesign());
                    edNode.setAttribute("experimentDesign", ed.getExperimentDesign());
                    edNode.setAttribute("otherLabel", entry != null && entry.getOtherLabel() != null ? entry.getOtherLabel() : "");
                    edNode.setAttribute("isSelected", entry != null ? "true" : "false");

                    edParentNode.addContent(edNode);
                }

                // Show list of experiment Factor entries
                Element efParentNode = new Element("ExperimentFactorEntries");
                projectNode.addContent(efParentNode);
                for (Iterator i = experimentFactors.iterator(); i.hasNext(); ) {
                    ExperimentFactor ef = (ExperimentFactor) i.next();

                    Element efNode = new Element("ExperimentFactorEntry");
                    ExperimentFactorEntry entry = null;
                    for (Iterator i1 = project.getExperimentFactorEntries().iterator(); i1.hasNext(); ) {
                        ExperimentFactorEntry efEntry = (ExperimentFactorEntry) i1.next();
                        if (efEntry.getCodeExperimentFactor().equals(ef.getCodeExperimentFactor())) {
                            entry = efEntry;
                            break;
                        }
                    }
                    efNode.setAttribute("codeExperimentFactor", ef.getCodeExperimentFactor());
                    efNode.setAttribute("experimentFactor", ef.getExperimentFactor());
                    efNode.setAttribute("otherLabel", entry != null && entry.getOtherLabel() != null ? entry.getOtherLabel() : "");
                    efNode.setAttribute("isSelected", entry != null ? "true" : "false");

                    efParentNode.addContent(efNode);
                }

                XMLOutputter out = new org.jdom.output.XMLOutputter();
                this.xmlResult = out.outputString(doc);
            }

            if (isValid()) {
                setResponsePage(this.SUCCESS_JSP);
            } else {
                setResponsePage(this.ERROR_JSP);
            }
        } catch (Exception e) {
            this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in GetProject ", e);

            throw new RollBackCommandException(e.getMessage());
        }

        return this;
    }

}
