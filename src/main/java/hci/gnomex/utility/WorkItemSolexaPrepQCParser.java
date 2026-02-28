package hci.gnomex.utility;

import hci.gnomex.model.Sample;
import hci.gnomex.model.WorkItem;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.Element;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.*;

/**
 * Created by u0395021 on 6/2/2016.
 */
public class WorkItemSolexaPrepQCParser implements Serializable {
    private Document doc;
    private Map sampleMap = new HashMap();
    private List workItems = new ArrayList();


    public WorkItemSolexaPrepQCParser(Document doc) {
        this.doc = doc;
    }

    public void parse(Session sess) throws Exception{

        Element workItemListNode = this.doc.getRootElement();


        for(Iterator i = workItemListNode.getChildren("WorkItem").iterator(); i.hasNext();) {
            Element workItemNode = (Element)i.next();

            String idSampleString   = workItemNode.getAttributeValue("idSample");
            String idWorkItemString = workItemNode.getAttributeValue("idWorkItem");

            Sample sample = (Sample)sess.load(Sample.class, Integer.valueOf(idSampleString));
            WorkItem workItem = (WorkItem)sess.load(WorkItem.class, Integer.valueOf(idWorkItemString));


            if (workItemNode.getAttributeValue("seqPrepQCStatus") != null && !workItemNode.getAttributeValue("seqPrepQCStatus").equals("")) {
                workItem.setStatus(workItemNode.getAttributeValue("seqPrepQCStatus"));
            } else {
                workItem.setStatus(null);
            }

            this.initializeSample(workItemNode, sample);

            sampleMap.put(workItem.getIdWorkItem(), sample);
            workItems.add(workItem);
        }


    }

    private void initializeSample(Element n, Sample sample) throws Exception {
        if (n.getAttributeValue("idLibPrepQCProtocol") != null && !n.getAttributeValue("idLibPrepQCProtocol").equals("")) {
            sample.setIdLibPrepQCProtocol(Integer.valueOf(n.getAttributeValue("idLibPrepQCProtocol")));
        } else {
            sample.setIdLibPrepQCProtocol(null);
        }

        if (n.getAttributeValue("qcLibConcentration") != null && !n.getAttributeValue("qcLibConcentration").equals("")) {
            sample.setQcLibConcentration(new BigDecimal(n.getAttributeValue("qcLibConcentration")));
        } else {
            sample.setQcLibConcentration(null);
        }
    }

    public Sample getSample(Integer idWorkItem) {
        return (Sample)sampleMap.get(idWorkItem);
    }

    public List getWorkItems() {
        return workItems;
    }

    public void resetIsDirty() {
        Element workItemListNode = this.doc.getRootElement();

        for(Iterator i = workItemListNode.getChildren("WorkItem").iterator(); i.hasNext();) {
            Element workItemNode = (Element)i.next();
            workItemNode.setAttribute("isDirty", "N");
        }
    }
}
