package hci.gnomex.controller;

import hci.framework.control.Command;import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.UserPreferences;
import hci.gnomex.utility.Util;
import hci.framework.control.RollBackCommandException;
import hci.framework.model.DetailObject;
import hci.framework.utilities.Annotations;
import hci.framework.utilities.XMLReflectException;
import hci.gnomex.model.*;
import hci.gnomex.security.SecurityAdvisor;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import javax.naming.NamingException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.sql.SQLException;
import java.util.*;
import org.apache.log4j.Logger;

public class GetLabList extends GNomExCommand implements Serializable {


    // the static field for logging in Log4J
    private static Logger LOG = Logger.getLogger(GetLabList.class);

    private LabFilter labFilter;
    private String    listKind = "LabList";

    public void validate() {
    }

    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

        labFilter = new LabFilter();
        HashMap errors = this.loadDetailObject(request, labFilter);
        this.addInvalidFields(errors);

        if (request.getParameter("listKind") != null && !request.getParameter("listKind").equals("")) {
            listKind = request.getParameter("listKind");

            if (listKind.startsWith("Unbounded")) {
                labFilter.setUnbounded(true);
            }
        }

    }

    public Command execute() throws RollBackCommandException {

        try {
            Document doc = new Document(new Element(listKind));

            // If this is a guest user and the list is bounded, return an empty lab list
            if (this.getSecAdvisor().isGuest()/* && !labFilter.isUnbounded()*/) {

            } else {
                Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());

                // If this is an unbounded list, run a query to find all
                // labs that have public experiments.
                Map otherLabMap = new HashMap();
                if (labFilter.isUnbounded()) {
                    StringBuffer buf = new StringBuffer();
                    buf.append("SELECT distinct p.idLab  ");
                    buf.append(" FROM      Project p ");
                    buf.append(" LEFT JOIN p.requests as req ");
                    buf.append(" LEFT JOIN req.collaborators as collab ");
                    this.getSecAdvisor().buildSecurityCriteria(buf, "req", "collab", true, false, false);
                    List otherLabs = sess.createQuery(buf.toString()).list();
                    for (Iterator i = otherLabs.iterator(); i.hasNext();) {
                        Integer idLabOther = (Integer)i.next();
                        otherLabMap.put(idLabOther, idLabOther);
                    }
                }
                //workaround until NullPointer exception is dealt with
                InternalAccountFieldsConfiguration.getConfiguration(sess);

                // If this is a non-gnomex University-only user, we want to get nothing
                Map activeLabMap = new HashMap();
                if (this.getSecAdvisor().isUniversityOnlyUser()) {
                    }
/*
                    StringBuffer buf = new StringBuffer();
                    buf.append("SELECT l.idLab  ");
                    buf.append(" FROM  Lab l ");
                    buf.append(" WHERE l.isActive = 'Y' ");
                    List allLabs = sess.createQuery(buf.toString()).list();
                    for (Iterator i = allLabs.iterator(); i.hasNext();) {
                        Integer idLab = (Integer)i.next();
                        activeLabMap.put(idLab, idLab);
                    }
                }
*/
                Map labsToSubmitOnBehalfOf = new HashMap();
                if(this.getSecAdvisor().getAppUser().getCoreFacilitiesICanSubmitTo() != null && this.getSecAdvisor().getAppUser().getCoreFacilitiesICanSubmitTo().size() > 0 ) {
                    StringBuffer buf = new StringBuffer();
                    buf.append("SELECT l.idLab  ");
                    buf.append(" FROM  Lab l ");
                    buf.append(" JOIN l.coreFacilities as cf ");
                    buf.append(" WHERE l.isActive = 'Y' ");
                    buf.append(" AND cf.idCoreFacility in (");
                    for(Iterator i = this.getSecAdvisor().getAppUser().getCoreFacilitiesICanSubmitTo().iterator(); i.hasNext();) {
                        CoreFacility cf = (CoreFacility)i.next();
                        buf.append(cf.getIdCoreFacility());
                        if(i.hasNext()) {
                            buf.append(", ");
                        }
                    }
                    buf.append(")");
                    List allLabs = sess.createQuery(buf.toString()).list();
                    for (Iterator i = allLabs.iterator(); i.hasNext();) {
                        Integer idLab = (Integer)i.next();
                        labsToSubmitOnBehalfOf.put(idLab, idLab);
                    }

                }

                /*Collaborating Labs*/
                Map<Integer,Integer> collaboratingLabs = new HashMap<Integer, Integer>();
                for(Iterator i = this.getSecAdvisor().getAppUser().getCollaboratingLabs().iterator(); i.hasNext();){
                    Lab l = (Lab)i.next();
                    collaboratingLabs.put(l.getIdLab(), l.getIdLab());
                }

                StringBuffer queryBuf = labFilter.getQueryWithInstitutionAndCore(this.getSecAdvisor());
                List labs = sess.createQuery(queryBuf.toString()).list();

                for(Object objLab : labs) {
                    Lab lab = (Lab) objLab;

                    setPermissions(lab);

                    if (this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_ADMINISTER_ALL_CORE_FACILITIES)
                            || this.getSecAdvisor().hasPermission(SecurityAdvisor.CAN_ACCESS_ANY_OBJECT)
                            || lab.getIsMyLab().equals("Y")
                            || lab.getCanManage().equals("Y")
                            || lab.getCanSubmitRequests().equals("Y")
                            || otherLabMap.containsKey(lab.getIdLab())
                            || activeLabMap.containsKey(lab.getIdLab())
                            || labsToSubmitOnBehalfOf.containsKey(lab.getIdLab())
                            || collaboratingLabs.containsKey(lab.getIdLab())) {
                        processLab(doc, lab, this.getUserPreferences());
                    }

                }
            }

            XMLOutputter out = new org.jdom.output.XMLOutputter();
            this.xmlResult = out.outputString(doc);

            setResponsePage(this.SUCCESS_JSP);
        }catch (Exception e){
            this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetLabList ", e);

            throw new RollBackCommandException(e.getMessage());
        }

        return this;
    }

    private void updateLists(Institution inst, CoreFacility cf, List<Institution> institutions, List<CoreFacility>coreFacilities) {
        if (inst != null) {
            institutions.add(inst);
        }
        if (cf != null) {
            coreFacilities.add(cf);
        }
    }

    private void setPermissions(Lab lab) {
    /*Members, managers, and collaborators can submit requests for labs*/
        if (this.getSecAdvisor().isGroupIAmMemberOrManagerOf(lab.getIdLab()) || this.getSecAdvisor().isGroupICollaborateWith(lab.getIdLab())) {
            lab.canSubmitRequests(true);
        } else {
            lab.canSubmitRequests(false);
        }

    /*If not one of the above roles maybe this user was given special access to submit on behalf of other users*/
        if(this.getSecAdvisor().isLabICanSubmitTo(lab)) {
            lab.canGuestSubmit(true);
        } else {
            lab.canGuestSubmit(false);
        }

        if (this.getSecAdvisor().isGroupIManage(lab)) {
            lab.canManage(true);
        } else {
            lab.canManage(false);
        }

        if (this.getSecAdvisor().isGroupICollaborateWith(lab.getIdLab()) ||
                this.getSecAdvisor().isGroupIAmMemberOf(lab.getIdLab())) {
            lab.isMyLab(true);
        } else {
            lab.isMyLab(false);
        }

    }

    private void processLab(Document doc, Lab lab, UserPreferences userPreferences) throws XMLReflectException {
        addExclusions(lab);

        Element labNode = lab.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL, null, Annotations.IGNORE).getRootElement();
        Integer defaultId = lab.getDefaultIdInstitutionForLab();
        labNode.setAttribute("defaultIdInstitutionForLab", defaultId == null ? "" : defaultId.toString());
        labNode.setAttribute("display", Util.getLabDisplayName(lab, userPreferences));

        Element institutionsNode = new Element("institutions");
        for(Object objInst : lab.getInstitutions()) {
            Institution inst = (Institution) objInst;
            Element instNode = inst.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL, null, Annotations.IGNORE).getRootElement();
            institutionsNode.addContent(instNode);
        }
        labNode.addContent(institutionsNode);

        Element coreFacilitiesNode = new Element("coreFacilities");
        for(Object objCf : lab.getCoreFacilities()) {
            CoreFacility cf = (CoreFacility) objCf;
            Element cfNode = cf.toXMLDocument(null, DetailObject.DATE_OUTPUT_SQL, null, Annotations.IGNORE).getRootElement();
            coreFacilitiesNode.addContent(cfNode);
        }
        labNode.addContent(coreFacilitiesNode);

        doc.getRootElement().addContent(labNode);
    }

    private void addExclusions(Lab lab) {
        lab.excludeMethodFromXML("getNotes");
        lab.excludeMethodFromXML("getContactName");
        lab.excludeMethodFromXML("getContactAddress2");
        lab.excludeMethodFromXML("getContactAddress");
        lab.excludeMethodFromXML("getContactCity");
        lab.excludeMethodFromXML("getContactCodeState");
        lab.excludeMethodFromXML("getContactZip");
        lab.excludeMethodFromXML("getContactCountry");
        //lab.excludeMethodFromXML("getContactEmail");
        lab.excludeMethodFromXML("getContactPhone");
        lab.excludeMethodFromXML("getMembers");
        lab.excludeMethodFromXML("getCollaborators");
        lab.excludeMethodFromXML("getManagers");
        lab.excludeMethodFromXML("getBillingAccounts");
        lab.excludeMethodFromXML("getApprovedBillingAccounts");
        lab.excludeMethodFromXML("getInternalBillingAccounts");
        lab.excludeMethodFromXML("getPOBillingAccounts");
        lab.excludeMethodFromXML("getCreditCardBillingAccounts");
        lab.excludeMethodFromXML("getProjects");
        lab.excludeMethodFromXML("getIsCcsgMember");
        lab.excludeMethodFromXML("getInstitutions");
        lab.excludeMethodFromXML("getCoreFacilities");
        lab.excludeMethodFromXML("getDefaultIdInstitutionForLab");
    }
}
