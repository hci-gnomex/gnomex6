package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.FlowCell;
import hci.gnomex.model.FlowCellChannel;
import hci.gnomex.model.SequenceLane;
import hci.gnomex.model.WorkItem;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;

import javax.json.Json;
import javax.json.JsonObject;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.sql.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

public class DeleteFlowCell extends GNomExCommand implements Serializable {


	// the static field for logging in Log4J
	private static Logger LOG = Logger.getLogger(DeleteFlowCell.class);

	private String						channelsXMLString;
	private Document					channelsDoc;
	private FlowCellChannelParser		channelParser;
	private FlowCell					fc;
	private boolean						isNewFlowCell = false;
	private String						serverName;
	private String						launchAppURL;
	private String            lastCycleDateStr;
	private String            numberSequencingCyclesActualStr;

	public void validate() {}

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session)
  {
    fc = new FlowCell();
    HashMap errors = this.loadDetailObject(request, fc);
    this.addInvalidFields(errors);
  }

  public Command execute() throws RollBackCommandException {
    try {
      Session sess = HibernateSession.currentSession(this.getUsername());
      DictionaryHelper dh = DictionaryHelper.getInstance(sess);

      if (this.getSecurityAdvisor().canUpdate(fc)) {
    	     FlowCell flowCell = null;
             flowCell = (FlowCell) sess.get(FlowCell.class, fc.getIdFlowCell());
             //initializeFlowCell(flowCell);

             for(Iterator i1 = flowCell.getFlowCellChannels().iterator(); i1.hasNext();) {
                 FlowCellChannel channel = (FlowCellChannel)i1.next();
                 // Move all SequenceLanes in this FlowCellChannel back to HSEQASSEM
                 for(Iterator i2 = channel.getSequenceLanes().iterator(); i2.hasNext();) {
                	 SequenceLane sl = (SequenceLane)i2.next();
                	 sl.setIdFlowCellChannel(null);
                	 sess.save(sl);
                	 WorkItem wi = new WorkItem();
					wi.setIdRequest(sl.getIdRequest());
					wi.setSequenceLane(sl);
					wi.setCreateDate(new Date(System.currentTimeMillis()));
					wi.setIdCoreFacility(flowCell.getIdCoreFacility());

                     if(flowCell.getCodeSequencingPlatform().equals("NOSEQ")) {
                         wi.setCodeStepNext("NOSEQASSEM");
                     } else if(flowCell.getCodeSequencingPlatform().equals("HISEQ")) {
						wi.setCodeStepNext("HSEQASSEM");
					} else if(flowCell.getCodeSequencingPlatform().equals("MISEQ")) {
						wi.setCodeStepNext("MISEQASSEM");
					} else if(flowCell.getCodeSequencingPlatform().equals("ILLSEQ")) {
						wi.setCodeStepNext("ILLSEQASSEM");
					} else {
						throw new RollBackCommandException();
					}
					sess.save(wi);
					sess.flush();
                 }
                 // Delete the previous WorkItem for this FlowCellChannel (Should only be one)
                 List workItems = sess.createQuery("SELECT x from WorkItem x where idFlowCellChannel = " + channel.getIdFlowCellChannel()).list();
                 for (Iterator i3 = workItems.iterator(); i3.hasNext();) {
                     WorkItem x = (WorkItem)i3.next();
                     sess.delete(x);
                     sess.flush();
                 }
                 i1.remove();
                 sess.delete(channel);
                 sess.flush();
                 sess.save(flowCell);
                 sess.flush();
             }
             sess.delete(flowCell);
        sess.flush();

        this.xmlResult = "<SUCCESS idFlowCell=\"" + flowCell.getIdFlowCell() + "\" flowCellNumber=\"" + flowCell.getNumber() + "\"/>";
        JsonObject value = Json.createObjectBuilder()
              .add("result", "SUCCESS")
              .add("flowCellNumber", flowCell.getNumber())
              .build();
        this.jsonResult = value.toString();

        setResponsePage(this.SUCCESS_JSP);
      } else {
        this.addInvalidField("Insufficient permissions",
            "Insufficient permission to save flowCell.");
        setResponsePage(this.ERROR_JSP);
      }

    }
    catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in SaveFlowCell ", e);

      throw new RollBackCommandException(e.getMessage());
    }
    return this;
  }

//  private void initializeFlowCell(FlowCell flowCell) {
//    flowCell.setNumber(fc.getNumber());
//    flowCell.setCreateDate(fc.getCreateDate());
//    flowCell.setNotes(fc.getNotes());
//    flowCell.setIdSeqRunType(fc.getIdSeqRunType());
//    flowCell.setIdNumberSequencingCycles(fc.getIdNumberSequencingCycles());
//    flowCell.setBarcode(fc.getBarcode());
//    flowCell.setCodeSequencingPlatform(fc.getCodeSequencingPlatform());
//    flowCell.setRunNumber(fc.getRunNumber());
//    flowCell.setIdInstrument(fc.getIdInstrument());
//    flowCell.setSide(fc.getSide());
//    flowCell.setIdCoreFacility(fc.getIdCoreFacility());
//  }
}
