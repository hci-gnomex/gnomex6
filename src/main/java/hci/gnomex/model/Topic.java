package hci.gnomex.model;

import hci.framework.model.DetailObject;
import hci.framework.security.UnknownPermissionException;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.DataTrackUtil;
import hci.gnomex.utility.DictionaryHelper;

import java.io.Serializable;
import java.sql.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import hci.gnomex.utility.Util;
import org.jdom.Document;
import org.jdom.Element;


public class Topic extends DetailObject implements Serializable, VisibilityInterface {

  private Integer            idTopic;
  private String             name;
  private String             description;
  private Integer            idParentTopic;
  private Topic              parentTopic;
  private Set<Topic>         topics;
  private Set<Request>       requests;
  private Set<Analysis>      analyses;
  private Set<DataTrack>     dataTracks;
  private Integer            idLab;
  private Integer            idAppUser;
  private String             createdBy;
  private Date               createDate;
  private Lab                lab;
  private AppUser            appUser;  
  private String             codeVisibility;
  private Integer            idInstitution;
  
  private boolean            canUpdateVisibility;

  
  public String getCanUpdateVisibility() {
    if (this.canUpdateVisibility) {
      return "Y";
    } else {
      return "N";
    }
  }
  
  public void canUpdateVisibility(boolean canDo) {
    canUpdateVisibility = canDo;
  }
  
  public Integer getIdTopic() {
    return idTopic;
  }
  public void setIdTopic(Integer idTopic) {
    this.idTopic = idTopic;
  }
  public String getName() {
    return name;
  }
  public void setName(String name) {
    this.name = name;
  }
  public String getDescription() {
    return description;
  }
  public void setDescription(String description) {
    this.description = description;
  }
  public Integer getIdParentTopic() {
    return idParentTopic;
  }
  public void setIdParentTopic(Integer idParentTopic) {
    this.idParentTopic = idParentTopic;
  }
  public Set getTopics() {
    return topics;
  }
  public void setTopics(Set topics) {
    this.topics = topics;
  }
  public Topic getParentTopic() {
    return parentTopic;
  }
  public void setParentTopic(Topic parentTopic) {
    this.parentTopic = parentTopic;
  }
  public Set getRequests() {
    return requests;
  }
  public void setRequests(Set requests) {
    this.requests = requests;
  }
  public Set getAnalyses() {
    return analyses;
  }
  public void setAnalyses(Set analyses) {
    this.analyses = analyses;
  }
  public Set getDataTracks() {
    return dataTracks;
  }
  public void setDataTracks(Set dataTracks) {
    this.dataTracks = dataTracks;
  }  
  public boolean hasVisibility(String codeVisibility) {
    boolean hasVisibility = false;
    for(Iterator<?> i = this.topics.iterator(); i.hasNext();) {
      Topic a = Topic.class.cast(i.next());
      if (a.getCodeVisibility().equals(codeVisibility)) {
        hasVisibility = true;
        break;
      }
    }
    return hasVisibility;
  }

  public Integer getIdLab() {
    return idLab;
  }
  public void setIdLab(Integer idLab) {
    this.idLab = idLab;
  } 
  public Lab getLab() {
    return lab;
  }
  public void setLab(Lab l) {
    this.lab = l;
  }

   private String recurseGetParentName(String qualifiedName) {
     Topic parent = this.getParentTopic();

     if (parent != null) {
       if (parent.getName() != null) {
         qualifiedName = parent.getName() + "/" + qualifiedName;

         qualifiedName = parent.recurseGetParentName(qualifiedName);
       }
     }
     return qualifiedName;
   }

   private String recurseGetParentNameExcludingRoot(String typeName) {
     Topic parent = this.getParentTopic();


     if (parent != null) {
       if (parent.getName() != null) {
         // Stop before the root dataTrack grouping
         if (parent.getIdParentTopic() != null) {
           typeName = parent.getName() + "/" + typeName;

           typeName = parent.recurseGetParentNameExcludingRoot(typeName);

         }
       }
     }
     return typeName;
   }



   public void recurseGetChildren(List<Object> descendents) {
     for(Iterator<?> i = this.getTopics().iterator(); i.hasNext();) {        
       Topic ag = Topic.class.cast(i.next());
       descendents.add(ag);
       ag.recurseGetChildren(descendents);
     }
     for(Iterator<?> i = this.getRequests().iterator(); i.hasNext();) {
       Request r = Request.class.cast(i.next());
       descendents.add(r);
     }
     for(Iterator<?> i = this.getAnalyses().iterator(); i.hasNext();) {
       Analysis a = Analysis.class.cast(i.next());
       descendents.add(a);
     }
     for(Iterator<?> i = this.getDataTracks().iterator(); i.hasNext();) {
       DataTrack dt = DataTrack.class.cast(i.next());
       descendents.add(dt);
     }
   }

   public String getCreatedBy() {
     return createdBy;
   }
   
   public void setCreatedBy(String createdBy) {
     this.createdBy = createdBy;
   }
   
   public Date getCreateDate() {
     return createDate;
   }
   
   public void setCreateDate(Date createDate) {
     this.createDate = createDate;
   }
   
   public Integer getIdAppUser() {
     return idAppUser;
   }
 
   public void setIdAppUser(Integer idAppUser) {
     this.idAppUser = idAppUser;
   }

   public AppUser getAppUser() {
     return appUser;
   }

   public void setAppUser(AppUser appUser) {
     this.appUser = appUser;
   }   

   public Document getXML(SecurityAdvisor secAdvisor, DictionaryHelper dictionaryHelper) throws UnknownPermissionException {
     Document doc = new Document(new Element("Topic"));
     Element root = doc.getRootElement();
     
     root.setAttribute("label", this.getName());	
     root.setAttribute("idTopic", this.getIdTopic().toString());
     root.setAttribute("name", this.getName());
     root.setAttribute("idParentTopic",this.getIdParentTopic() != null ? this.getIdParentTopic().toString() : "");
     root.setAttribute("description", this.getDescription() != null ? this.getDescription() : "");	
     root.setAttribute("lab", this.getIdLab() != null ? Util.getLabDisplayName(dictionaryHelper.getLabObject(this.getIdLab()), secAdvisor.getUserPreferences()) : "");
     root.setAttribute("idLab", this.getIdLab() != null ? this.getIdLab().toString() : "");
     root.setAttribute("appUser", this.getIdAppUser() != null ? Util.getAppUserDisplayName(dictionaryHelper.getAppUserObject(this.getIdAppUser()), secAdvisor.getUserPreferences()) : "");
     root.setAttribute("idAppUser", this.getIdAppUser() != null ? this.getIdAppUser().toString() : "");
     root.setAttribute("codeVisibility", this.getNonNullString(this.getCodeVisibility()));
     root.setAttribute("idInstitution", this.getIdInstitution() != null ? this.getIdInstitution().toString() : "");
     root.setAttribute("createdBy", this.getCreatedBy() != null ? this.getCreatedBy() : "");
     root.setAttribute("createDate", this.getCreateDate() != null ? DataTrackUtil.formatDate(this.getCreateDate()) : "");

     root.setAttribute("canWrite",    secAdvisor.canUpdate(this) ? "Y" : "N");
     
     if (root.getAttributeValue("codeVisibility").equals(Visibility.VISIBLE_TO_PUBLIC)) {
       root.setAttribute("topicPublicNote",          "(Public) ");
     } else {
       root.setAttribute("topicPublicNote", "");
     }
     root.setAttribute("canUpdateVisibility", secAdvisor.canUpdateVisibility(idLab, idAppUser) ? "Y" : "N");

     return doc;
   }
   /*
   public boolean hasPublicChildren() {
     boolean hasPublicItems = false;
     
     for(Iterator<?> i = this.getRequests().iterator(); i.hasNext();) {
       Request r = Request.class.cast(i.next());
       if (r.getCodeVisibility().equals(Visibility.VISIBLE_TO_PUBLIC)) {
         hasPublicItems = true;
         break;
       }
     }
     for(Iterator<?> i = this.getAnalyses().iterator(); i.hasNext();) {
       Analysis a = Analysis.class.cast(i.next());
       if (a.getCodeVisibility().equals(Visibility.VISIBLE_TO_PUBLIC)) {
         hasPublicItems = true;
         break;
       }
     }
     for(Iterator<?> i = this.getDataTracks().iterator(); i.hasNext();) {
       DataTrack dt = DataTrack.class.cast(i.next());
       if (dt.getCodeVisibility().equals(Visibility.VISIBLE_TO_PUBLIC)) {
         hasPublicItems = true;
         break;
       }       
     }     
     return hasPublicItems;     
   } 
   */
   public Integer getIdInstitution() {
     return idInstitution;
   }


   public void setIdInstitution(Integer idInstitution) {
     this.idInstitution = idInstitution;
   }
   
   public String getCodeVisibility() {
     return codeVisibility;
   }

   
   public void setCodeVisibility(String codeVisibility) {
     this.codeVisibility = codeVisibility;
   }
   
   
   public String getIsVisibleToMembers() {
     if (this.codeVisibility != null && this.codeVisibility.equals(Visibility.VISIBLE_TO_GROUP_MEMBERS)) {
       return "Y";
     } else {
       return "N";
     }
   }

   public String getIsVisibleToMembersAndCollaborators() {
     if (this.codeVisibility != null && this.codeVisibility.equals(Visibility.VISIBLE_TO_GROUP_MEMBERS_AND_COLLABORATORS)) {
       return "Y";
     } else {
       return "N";
     }
   }

   public String getIsVisibleToPublic() {
     if (this.codeVisibility != null && this.codeVisibility.equals(Visibility.VISIBLE_TO_PUBLIC)) {
       return "Y";
     } else {
       return "N";
     }
   }
   
   public void registerMethodsToExcludeFromXML() {
     this.excludeMethodFromXML("getTopics");
     this.excludeMethodFromXML("getParentTopic");
     this.excludeMethodFromXML("getTopic");     
     this.excludeMethodFromXML("getExcludedMethodsMap");

   }
   
   public String getNumber(){
     return "T" + idTopic.toString();
   }
   
   /*
    *  An analysis, experiment, or data track can be part of many topics.  This convenience method
    *  allows the caller to send in the list of parent topics and it will generate XML nodes showing the
    *  topic with its contents.  This methods is used the GetAnalysis, GetRequest, and GetDataTrack to
    *  fill in the XML structure for "related" topics.
    */
   public static void appendParentTopicsXML(SecurityAdvisor secAdvisor, Element parentNode, Set topics) throws UnknownPermissionException {
     
     for (Topic topic : (Set<Topic>)topics) {
       Element topicNode = new Element("Topic");
       topicNode.setAttribute("idTopic", topic.getIdTopic().toString());
       topicNode.setAttribute("label", (secAdvisor.canRead(topic) ? (topic.getName() != null ? topic.getName() : "") : "(Not authorized)"));
       topicNode.setAttribute("codeVisibility", topic.getCodeVisibility());
       parentNode.addContent(topicNode);
       
       for (Request r : (Set<Request>)topic.getRequests()) {
         Element rNode = new Element("Request");
         r.appendBasicXML(secAdvisor, topicNode);
       }
       for (Analysis a : (Set<Analysis>)topic.getAnalyses()) {
         Element aNode = new Element("Analysis");
         a.appendBasicXML(secAdvisor, topicNode);
       }
       for (DataTrack dt : (Set<DataTrack>)topic.getDataTracks()) {
         
         Element dtNode = new Element("DataTrack");
         dt.appendBasicXML(secAdvisor, topicNode);
       }
     }     
   }
   

}
