package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.ExperimentFile;
import hci.gnomex.model.Request;
import hci.gnomex.utility.FileDescriptor;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.PropertyDictionaryHelper;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;

import javax.servlet.http.HttpSession;
import java.io.File;
import java.io.Serializable;
import java.util.*;

public class GetLinkedSampleFiles extends GNomExCommand implements Serializable {

  private static Logger LOG = Logger.getLogger(GetLinkedSampleFiles.class);
  private static final String ICON_TEST_TUBE = "assets/test_tube.png";

  private Integer                        idRequest;
  private StringBuffer                   queryBuf = new StringBuffer();
  private String                         serverName;
  private SortedMap<String, TreeMap<String, Element>>     sampleGroups = new TreeMap<String, TreeMap<String, Element>>(new MyComparator());

  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    if (request.getParameter("idRequest") != null && !request.getParameter("idRequest").equals("")) {
      idRequest = Integer.parseInt(request.getParameter("idRequest"));
    }

    serverName = request.getServerName();

  }

  public Command execute() throws RollBackCommandException {

    try {
      Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());
      Request request = (Request) sess.load(Request.class, this.idRequest);

      String baseExperimentDir   = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, request.getIdCoreFacility(), PropertyDictionaryHelper.PROPERTY_EXPERIMENT_DIRECTORY);
      String directoryName = baseExperimentDir + Request.getCreateYear(request.getCreateDate()) + Constants.FILE_SEPARATOR;
      directoryName.replace("\\", Constants.FILE_SEPARATOR);

      queryBuf.append("SELECT s.name, s.number, s.idSample, sef.idExpFileRead1, sef.idExpFileRead2, sef.seqRunNumber, sef.idSampleExperimentFile, s.groupName ");
      queryBuf.append("FROM Sample s LEFT JOIN s.sampleExperimentFiles as sef ");
      queryBuf.append("WHERE s.idRequest =  " + this.idRequest);
      queryBuf.append(" Order by s.groupName ");

      List samples = sess.createQuery(queryBuf.toString()).list();

      Document doc = new Document(new Element("SampleList"));

      Integer previousSampleID = null;
      Element sampleNode = new Element("Sample");
      for(ListIterator i = samples.listIterator(); i.hasNext();) {
        Object[] row = (Object[]) i.next();
        if(previousSampleID != null && !previousSampleID.equals((Integer)row[2])) {
          sampleNode = new Element("Sample");
        }
        Element seqRunNumberNode = new Element("SeqRunNumber");
        seqRunNumberNode.setAttribute("idSampleExperimentFile", row[6] != null ? String.valueOf((Integer)row[6]) : "");
        ExperimentFile ef = null;
        File f = null;
        FileDescriptor fd = null;
        sampleNode.setAttribute("name", row[0] != null ? (String)row[0] : "");
        sampleNode.setAttribute("number", row[1] != null ? (String)row[1] : "");
        sampleNode.setAttribute("idSample", row[2] != null ? String.valueOf((Integer)row[2]) : "");
        sampleNode.setAttribute("icon", ICON_TEST_TUBE);
        previousSampleID = (Integer)row[2];

        if(row[3] != null) {
          ef = (ExperimentFile)sess.load(ExperimentFile.class, (Integer)row[3]);
          Element sefNode = new Element("FileDescriptor");
          f = new File(directoryName + ef.getFileName());
          fd = new FileDescriptor("", ef.getFileName().substring(ef.getFileName().lastIndexOf(Constants.FILE_SEPARATOR) + 1), f, "");
          sefNode.setAttribute("displayName", fd.getDisplayName());
          sefNode.setAttribute("fileSizeText", fd.getFileSizeText());
          sefNode.setAttribute("lastModifyDateDisplay", fd.getLastModifyDateDisplay());
          sefNode.setAttribute("idExperimentFile", String.valueOf((Integer)row[3]));
          sefNode.setAttribute("zipEntryName", ef.getFileName());
          sefNode.setAttribute("readID", "1");
          seqRunNumberNode.addContent(sefNode);
        }

        if(row[4] != null) {
          ef = (ExperimentFile)sess.load(ExperimentFile.class, (Integer)row[4]);
          Element sefNode = new Element("FileDescriptor");
          f = new File(directoryName + ef.getFileName());
          fd = new FileDescriptor("", ef.getFileName().substring(ef.getFileName().lastIndexOf(Constants.FILE_SEPARATOR) + 1), f, "");
          sefNode.setAttribute("displayName", fd.getDisplayName());
          sefNode.setAttribute("fileSizeText", fd.getFileSizeText());
          sefNode.setAttribute("lastModifyDateDisplay", fd.getLastModifyDateDisplay());
          sefNode.setAttribute("idExperimentFile", String.valueOf((Integer)row[4]));
          sefNode.setAttribute("zipEntryName", ef.getFileName());
          sefNode.setAttribute("readID", "2");
          seqRunNumberNode.addContent(sefNode);
        }
        if(seqRunNumberNode.hasChildren()) {
          sampleNode.addContent(seqRunNumberNode);
        }


        String groupName = row[7] != null ? (String)row[7] : "*||*"; //Needed some obscure string to signify no sample group
        groupName = groupName.equals("") ? "*||*" : groupName;
        sampleNode.setAttribute("groupName", groupName);
        for(Iterator j = sampleGroups.keySet().iterator(); j.hasNext();) {
          String displayName = (String)j.next();
          if(groupName.equals(displayName)) {
            TreeMap<String, Element> temp = sampleGroups.get(displayName);
            temp.put(sampleNode.getAttributeValue("number"), sampleNode);
            sampleGroups.put(groupName, temp);
            break;
          } else if(groupName.contains(displayName)) {
            TreeMap<String, Element> temp = sampleGroups.get(displayName);
            temp.put(sampleNode.getAttributeValue("number"), sampleNode);
            sampleGroups.put(groupName, temp);
            sampleGroups.remove(displayName);
            break;
          }
        }

        if(!sampleGroups.containsKey(groupName)){
          TreeMap<String, Element> temp = new TreeMap<String, Element>(new MyComparator());
          temp.put(sampleNode.getAttributeValue("number"), sampleNode);
          sampleGroups.put(groupName, temp);
        }
      }

      HashMap<String,Element> alreadyCreated = new HashMap<String,Element>();
      for(Iterator i = sampleGroups.keySet().iterator(); i.hasNext();) {
        String groupName = (String)i.next();
        String[] group = groupName.split(Constants.FILE_SEPARATOR);
        Element e = new Element("SampleGroup");
        e.setAttribute("displayName", group[0]);
        for(int j = 1; j < group.length; j++) {
          Element e1 = new Element("SampleGroup");
          e1.setAttribute("displayName", group[j]);
          if(e.hasChildren()) {
            Element child = (Element)(e.getChildren().get(e.getChildren().size() - 1));
            child.addContent(e1);
          } else {
            e.addContent(e1);
          }
        }
        alreadyCreated.put(group[0], e);
      }

      HashMap<String, Element> groups = new HashMap<String, Element>();
      doc.getRootElement().addContent(new Element("SampleRoot"));
      Element sampleRoot = doc.getRootElement().getChild("SampleRoot");


      for(Iterator i = sampleGroups.keySet().iterator(); i.hasNext();) {
        String groupName = (String)i.next();
        String restingNode = "";
        TreeMap<String, Element> sampleNodes = sampleGroups.get(groupName);
        if(groupName.equals("*||*")) {
          for(String sampleNumber : sampleNodes.keySet()) {
            sampleRoot.addContent(sampleNodes.get(sampleNumber));
          }
          continue;
        }
        String[] nameArray = groupName.split(Constants.FILE_SEPARATOR);
        Element group = alreadyCreated.get(nameArray[0]);
        for(String sampleNumber : sampleNodes.keySet()) {
          Element samp = sampleNodes.get(sampleNumber);
          String sampGroup = samp.getAttributeValue("groupName");
          restingNode = sampGroup.substring(sampGroup.lastIndexOf(Constants.FILE_SEPARATOR) + 1);
          recurseAddChildren(restingNode, group, samp);
        }

        sampleRoot.addContent(group);
      }
      List<Element> sampList  = sampleRoot.getChildren();

      for(Element samp : sampList){
        Util.preserveXMLNodeName(samp);
      }

      Util.setIcons(doc);
      this.jsonResult =  Util.convertXMLDocumentToJSONString(doc);

      /*XMLOutputter out = new org.jdom.output.XMLOutputter();
      this.xmlResult = out.outputString(doc);*/

      setResponsePage(this.SUCCESS_JSP);

    } catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in GetLinkedSampleFiles ", e);
      throw new RollBackCommandException(e.getMessage());
    }

    return this;
  }

  private void recurseAddChildren(String restingNode, Element group, Element sample) {
    if(group.getAttributeValue("displayName").equals(restingNode)) {
      group.addContent(sample);
      return;
    }
    for(Iterator j = group.getChildren().iterator(); j.hasNext();) {
      Element groupChild = (Element)j.next();
      if(groupChild.getName().equals("SampleGroup") && groupChild.getAttributeValue("displayName").equals(restingNode)) {
        groupChild.addContent(sample);
        return;
      } else if(groupChild.getName().equals("SampleGroup") && groupChild.hasChildren()) {
        recurseAddChildren(restingNode, groupChild, sample);
      }
    }

  }

}

class MyComparator implements Comparator<String>{
  @Override
  public int compare(String o1, String o2) {
    if (o1.length() > o2.length()) {
      return 1;
    } else if (o1.length() < o2.length()) {
      return -1;
    }
    return o1.compareTo(o2);
  }
}
