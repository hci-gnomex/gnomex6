package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.DataTrack;
import hci.gnomex.model.DataTrackFolder;
import hci.gnomex.model.GenomeBuild;
import hci.gnomex.model.UnloadDataTrack;
import hci.gnomex.utility.DataTrackComparator;
import hci.gnomex.utility.HibernateSession;
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
import java.util.Set;
import java.util.TreeSet;


public class UnlinkDataTrack extends GNomExCommand implements Serializable {



  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(UnlinkDataTrack.class);


  private Integer idDataTrack = null;
  private Integer idGenomeBuild = null;
  private Integer idDataTrackFolder = null;



  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    if (request.getParameter("idDataTrack") != null && !request.getParameter("idDataTrack").equals("")) {
      idDataTrack = Integer.valueOf(request.getParameter("idDataTrack"));
    } else {
      this.addInvalidField("idDataTrack", "idDataTrack is required.");
    }
    if (request.getParameter("idGenomeBuild") != null && !request.getParameter("idGenomeBuild").equals("")) {
      idGenomeBuild = Integer.valueOf(request.getParameter("idGenomeBuild"));
    } else {
      this.addInvalidField("idGenomeBuild", "idGenomeBuild is required.");
    }

    //It isn't a deal breaker if we don't have an idDataTrackFolder because the data track could be nested under the genome build
    if (request.getParameter("idDataTrackFolder") != null && !request.getParameter("idDataTrackFolder").equals("")) {
      idDataTrackFolder = Integer.valueOf(request.getParameter("idDataTrackFolder"));
    }
  }

  public Command execute() throws RollBackCommandException {
    Session sess = null;
    DataTrack dataTrack = null;

    try {
      sess = HibernateSession.currentSession(this.getUsername());
      dataTrack = (DataTrack)sess.load(DataTrack.class, idDataTrack);



      dataTrack = DataTrack.class.cast(sess.load(DataTrack.class, idDataTrack));
      GenomeBuild genomeBuild = GenomeBuild.class.cast(sess.load(GenomeBuild.class, idGenomeBuild));

      if(this.idDataTrackFolder == null) {
        DataTrackFolder parentDataTrackFolder = genomeBuild.getRootDataTrackFolder();
        if (parentDataTrackFolder == null) {
          throw new Exception("Cannot find root data track folder for " + genomeBuild.getGenomeBuildName());
        }
        this.idDataTrackFolder = parentDataTrackFolder.getIdDataTrackFolder();
      }

      // Make sure the user can write this dataTrack 
      if (this.getSecAdvisor().canUpdate(dataTrack)) {


        // Get the dataTrack grouping this dataTrack should be removed from.
        DataTrackFolder dataTrackGrouping = null;
        if (idDataTrackFolder == null) {
          // If this is a root dataTrack, find the default root dataTrack
          // grouping for the genome build.
          dataTrackGrouping = genomeBuild.getRootDataTrackFolder();
          if (dataTrackGrouping == null) {
            throw new Exception("Cannot find root dataTrack grouping for " + genomeBuild.getGenomeBuildName());
          }
        } else {
          // Otherwise, find the dataTrack grouping passed in as a request parameter.
          dataTrackGrouping = DataTrackFolder.class.cast(sess.load(DataTrackFolder.class, idDataTrackFolder));
        }

        // Create a pending unload of the dataTrack
        String typeName = dataTrackGrouping.getQualifiedTypeName() + Constants.FILE_SEPARATOR + dataTrack.getName();
        UnloadDataTrack unload = new UnloadDataTrack();
        unload.setTypeName(typeName);
        unload.setIdAppUser(this.getSecAdvisor().getIdAppUser());
        unload.setIdGenomeBuild(dataTrack.getIdGenomeBuild());
        sess.save(unload);


        // Remove the dataTrack grouping the dataTrack was in
        // by adding back the dataTracks to the dataTrack grouping, 
        // excluding the dataTrack to be removed
        Set<DataTrack> dataTracksToKeep = new TreeSet<DataTrack>(new DataTrackComparator());
        for(Iterator<?>i = dataTrackGrouping.getDataTracks().iterator(); i.hasNext();) {
          DataTrack a = DataTrack.class.cast(i.next());
          if (a.getIdDataTrack().equals(dataTrack.getIdDataTrack())) {
            continue;
          }
          dataTracksToKeep.add(a);

        }
        dataTrackGrouping.setDataTracks(dataTracksToKeep);

        sess.flush();

        // Send back XML attributes showing remaining references to dataTrack groupings
        sess.refresh(dataTrack);
        StringBuffer remainingDataTrackFolders = new StringBuffer();
        int folderCount = 0;
        for (Iterator<?> i1 = dataTrack.getFolders().iterator(); i1.hasNext();) {
          DataTrackFolder folder = DataTrackFolder.class.cast(i1.next());
          if (remainingDataTrackFolders.length() > 0) {
            remainingDataTrackFolders.append(",\n");         
          }
          remainingDataTrackFolders.append("    '" + folder.getName() + "'");
          folderCount++;

        }

        Element root = new Element("SUCCESS");
        Document doc = new Document(root);
        root.setAttribute("idDataTrack", dataTrack.getIdDataTrack().toString());
        root.setAttribute("name", dataTrack.getName());
        root.setAttribute("numberRemainingDataTrackFolders", Integer.valueOf(folderCount).toString());
        root.setAttribute("remainingDataTrackFolders", remainingDataTrackFolders.toString());
        XMLOutputter out = new org.jdom.output.XMLOutputter();
        out.setOmitEncoding(true);
        this.xmlResult = out.outputString(doc);
        this.setResponsePage(SUCCESS_JSP);

      } else {
        this.addInvalidField("insufficient permission", "Insufficient permissions to unlink data track.");
        setResponsePage(this.ERROR_JSP);
      }
    } catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in UnlinkDataTrack ", e);

      throw new RollBackCommandException(e.getMessage());

    }

    return this;
  }
}
