package hci.gnomex.controller;

import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.*;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Hibernate;
import org.hibernate.Session;
import org.hibernate.query.Query;

import javax.json.Json;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.HashMap;
import java.util.List;
import java.util.Set;

public class SaveTopic extends GNomExCommand implements Serializable {

    // the static field for logging in Log4J
    private static Logger LOG = Logger.getLogger(SaveTopic.class);

    private Topic load;
    private Integer idParentTopic = null;
    private Topic topic;
    private boolean isNewTopic = false;

    public void validate() {
    }

    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

        load = new Topic();
        HashMap errors = this.loadDetailObject(request, load);
        this.addInvalidFields(errors);

        if (request.getParameter("idParentTopic") != null && !request.getParameter("idParentTopic").equals("")) {
            idParentTopic = Integer.valueOf(request.getParameter("idParentTopic"));
        }
    }

    public Command execute() throws RollBackCommandException {

        try {
            Session sess = HibernateSession.currentSession(this.getUsername());

            this.initializeTopic(load, sess);

            if (this.getSecAdvisor().canUpdate(topic)) {

                String topicName = RequestParser.unEscape(topic.getName());

                StringBuilder queryBuf = new StringBuilder("select topic");
                queryBuf.append(" from Topic as topic");
                queryBuf.append(" where topic.name = '");
                queryBuf.append(topicName.replaceAll("'", "''"));
                queryBuf.append("' and");
                if (idParentTopic == null) {
                    queryBuf.append(" topic.idParentTopic is null");
                } else {
                    queryBuf.append(" topic.idParentTopic = ");
                    queryBuf.append(idParentTopic.toString());
                }

                if (isNewTopic) {
                    // If this is a new topic then check for duplicate topic name.
                    Query query = sess.createQuery(queryBuf.toString());
                    List<Object[]> topicRows = (List<Object[]>) query.list();

                    if (topicRows.size() > 0) {
                        this.addInvalidField("Illegal Topic Name", "A duplicate topic already exists at this level of the hierarchy.");
                        setResponsePage(this.ERROR_JSP);
                        return this;
                    }
                }

                this.topic.setName(topicName);
                this.topic.setIdParentTopic(idParentTopic);

                String visibilityMessage = checkAgainstParentVisibility(topic, sess);

                sess.save(topic);
                sess.flush();

                if (isNewTopic) {
                    sendNotification(topic, sess, Notification.NEW_STATE, Notification.SOURCE_TYPE_USER, Notification.TYPE_TOPIC);
                    sendNotification(topic, sess, Notification.NEW_STATE, Notification.SOURCE_TYPE_ADMIN, Notification.TYPE_TOPIC);
                } else {
                    sendNotification(topic, sess, Notification.EXISTING_STATE, Notification.SOURCE_TYPE_USER, Notification.TYPE_TOPIC);
                    sendNotification(topic, sess, Notification.EXISTING_STATE, Notification.SOURCE_TYPE_ADMIN, Notification.TYPE_TOPIC);
                }

                this.jsonResult = Json.createObjectBuilder()
                        .add("result", "SUCCESS")
                        .add("idTopic", topic.getIdTopic().toString())
                        .add("codeVisibility", topic.getCodeVisibility())
                        .add("visibilityMsg", visibilityMessage)
                        .build().toString();

                setResponsePage(this.SUCCESS_JSP);
            } else {
                this.addInvalidField("Insufficient permissions", "Insufficient permission to save topic.");
                setResponsePage(this.ERROR_JSP);
            }
        } catch (Exception e) {
            this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in SaveTopic ", e);
            throw new RollBackCommandException(e.getMessage());
        }

        return this;
    }

    private String checkAgainstParentVisibility(Topic topic, Session sess) {
        Topic parentTopic = null;
        String retValue = "";
        if (topic.getIdParentTopic() != null) {
            parentTopic = sess.load(Topic.class, topic.getIdParentTopic());
            if (parentTopic != null && parentTopic.getCodeVisibility().equals(Visibility.VISIBLE_TO_OWNER)) {
                if (!topic.getCodeVisibility().equals(Visibility.VISIBLE_TO_OWNER)) {
                    retValue = "the owner";
                }
            }
            if (parentTopic != null && parentTopic.getCodeVisibility().equals(Visibility.VISIBLE_TO_GROUP_MEMBERS)) {
                if (topic.getCodeVisibility().equals(Visibility.VISIBLE_TO_INSTITUTION_MEMBERS) || topic.getCodeVisibility().equals(Visibility.VISIBLE_TO_PUBLIC)) {
                    retValue = "group members";
                }
            }
            if (parentTopic != null && parentTopic.getCodeVisibility().equals(Visibility.VISIBLE_TO_INSTITUTION_MEMBERS)) {
                if (topic.getCodeVisibility().equals(Visibility.VISIBLE_TO_PUBLIC)) {
                    retValue = "institution members";
                }
            }
        }

        // If visibility of child less restrictive than parent then set child visibility to same as parent
        if (parentTopic != null && retValue.length() > 0) {
            topic.setCodeVisibility(parentTopic.getCodeVisibility());
            topic.setIdInstitution(parentTopic.getIdInstitution());
        }
        return retValue;
    }

    private void initializeTopic(Topic load, Session sess) throws Exception {

        if (load.getIdTopic() == null || load.getIdTopic() == 0) {
            topic = load;
            topic.setCreatedBy(this.getSecAdvisor().getUID());
            topic.setCreateDate(new java.sql.Date(System.currentTimeMillis()));
            isNewTopic = true;
        } else {
            topic = sess.load(Topic.class, load.getIdTopic());
        }

        topic.setName(RequestParser.unEscape(load.getName()));
        topic.setDescription(load.getDescription());
        topic.setIdLab(load.getIdLab());
        topic.setIdAppUser(load.getIdAppUser());
        topic.setCodeVisibility(load.getCodeVisibility());
        topic.setIdInstitution(load.getIdInstitution());

        if (isNewTopic) {
            PropertyDictionaryHelper propertyHelper = PropertyDictionaryHelper.getInstance(sess);
            String defaultVisibility = propertyHelper.getProperty(PropertyDictionary.DEFAULT_VISIBILITY_TOPIC);
            if (defaultVisibility != null && defaultVisibility.length() > 0) {
                topic.setCodeVisibility(defaultVisibility);
                if (defaultVisibility.compareTo(hci.gnomex.model.Visibility.VISIBLE_TO_INSTITUTION_MEMBERS) == 0) {
                    boolean institutionSet = false;
                    if (topic.getIdLab() != null) {
                        Lab lab = sess.load(Lab.class, topic.getIdLab());
                        Hibernate.initialize(lab.getInstitutions());
                        for (Institution thisInst : (Set<Institution>) lab.getInstitutions()) {
                            if (thisInst.getIsDefault().compareTo("Y") == 0) {
                                topic.setIdInstitution(thisInst.getIdInstitution());
                                institutionSet = true;
                            }
                        }
                    }
                    if (!institutionSet) {
                        // If default visibility is VISIBLE_TO_INSTITUTION_MEMBERS but this lab
                        // is not a member of the institution then set default to VISIBLE_TO_GROUP_MEMBERS
                        topic.setCodeVisibility(hci.gnomex.model.Visibility.VISIBLE_TO_GROUP_MEMBERS);
                    }
                }
            }
        } else {
            if (load.getIdLab() == null) {
                throw new Exception("Please assign this topic to a lab.");
            }
            Lab lab = sess.load(Lab.class, topic.getIdLab());
            if (!lab.validateVisibilityInLab(topic)) {
                throw new Exception("You must choose an institution when Institution visibility is chosen.");
            }
        }
    }
}
