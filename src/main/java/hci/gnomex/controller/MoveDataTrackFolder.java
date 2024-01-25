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
import java.util.ArrayList;
import java.util.Iterator;
import java.util.Set;
import java.util.TreeSet;


public class MoveDataTrackFolder extends GNomExCommand implements Serializable {



  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(MoveDataTrackFolder.class);


  private Integer idGenomeBuild = null;
  private Integer idDataTrackFolder = null;
  private Integer idParentDataTrackFolder = null;
  private String  isMove = null;



  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    if (request.getParameter("idGenomeBuild") != null && !request.getParameter("idGenomeBuild").equals("")) {
      idGenomeBuild = Integer.valueOf(request.getParameter("idGenomeBuild"));
    } else {
      this.addInvalidField("idGenomeBuild", "idGenomeBuild is required.");
    }
    if (request.getParameter("idDataTrackFolder") != null && !request.getParameter("idDataTrackFolder").equals("")) {
      idDataTrackFolder = Integer.valueOf(request.getParameter("idDataTrackFolder"));
    } else {
      this.addInvalidField("idDataTrackFolder", "idDataTrackFolder is required.");
    }

    //We don't need the idParentDataTrackFolder if the are moving the folder to be a child of the genome build folder
    //Therefore don't make the lack of an idParentDataTrackFolder a deal breaker
    if (request.getParameter("idParentDataTrackFolder") != null && !request.getParameter("idParentDataTrackFolder").equals("")) {
      idParentDataTrackFolder = Integer.valueOf(request.getParameter("idParentDataTrackFolder"));
    }

    if (request.getParameter("isMove") != null && !request.getParameter("isMove").equals("")) {
      isMove = request.getParameter("isMove");
    } else {
      this.addInvalidField("isMove", "isMove is required.");
    }
  }

  public Command execute() throws RollBackCommandException {
    Session sess = null;
    DataTrackFolder dataTrackFolder = null;

    try {
      sess = HibernateSession.currentSession(this.getUsername());
      dataTrackFolder = (DataTrackFolder)sess.load(DataTrackFolder.class, idDataTrackFolder);

      if(this.idParentDataTrackFolder == null) {
        GenomeBuild gb = GenomeBuild.class.cast(sess.load(GenomeBuild.class, this.idGenomeBuild));
        DataTrackFolder parentDataTrackFolder = gb.getRootDataTrackFolder();
        if (parentDataTrackFolder == null) {
          throw new Exception("Cannot find root data track folder for " + gb.getGenomeBuildName());
        }
        this.idParentDataTrackFolder = parentDataTrackFolder.getIdDataTrackFolder();
      }

      // Get all descendant data tracks of the data track folder to move
      ArrayList movedChildren = new ArrayList<DataTrack>();
      recurseAddChildren(dataTrackFolder, movedChildren);
      DataTrackFolder parentFolderOld = dataTrackFolder.getParentFolder();


      GenomeBuild genomeBuild = GenomeBuild.class.cast(sess.load(GenomeBuild.class, idGenomeBuild));

      // Make sure the user can write this dataTrack folder
      if (isMove.equals("Y")) {
        if (!this.getSecAdvisor().canUpdate(dataTrackFolder)) {
          addInvalidField("writep", "Insufficient permision to move dataTrack folder.");
        }
      }

      if (this.isValid()) {
        // Reset the load flag on all of the children so that next das2 refresh
        // refreshes the path to the data track
        // Add unload datatrack rows for older parent folder so that this old
        // path for data tracks is removed
        for (Iterator i = movedChildren.iterator(); i.hasNext();) {
          DataTrack dt = (DataTrack)i.next();
          dt.setIsLoaded("N");

          if (isMove.equals("Y")) {


            for (Iterator i1 = dt.getFolders().iterator(); i1.hasNext();) {
              DataTrackFolder parentFolder = (DataTrackFolder)i1.next();
              String path = parentFolder.getQualifiedTypeName();
              if (path.length() > 0) {
                path += Constants.FILE_SEPARATOR;
              }
              String typeName = path + dt.getName();

              UnloadDataTrack unload = new UnloadDataTrack();
              unload.setTypeName(typeName);
              unload.setIdAppUser(this.getSecAdvisor().getIdAppUser());
              unload.setIdGenomeBuild(dt.getIdGenomeBuild());

              sess.save(unload);
            }
          }

        }
        sess.flush();


        // Get the dataTrack grouping this dataTrack grouping should be moved to.
        DataTrackFolder parentDataTrackFolder = null;
        if (idParentDataTrackFolder == null) {
          // If this is a root dataTrack, find the default root dataTrack
          // grouping for the genome build.
          parentDataTrackFolder = genomeBuild.getRootDataTrackFolder();
          if (parentDataTrackFolder == null) {
            throw new Exception("Cannot find root dataTrack grouping for " + genomeBuild.getGenomeBuildName());
          }
        } else {
          // Otherwise, find the dataTrack grouping passed in as a request parameter.
          parentDataTrackFolder = DataTrackFolder.class.cast(sess.load(DataTrackFolder.class, idParentDataTrackFolder));
        }





        // If this is a copy instead of a move,
        // clone the dataTrack grouping, leaving the existing one as-is.
        if (isMove.equals("Y")) {
          dataTrackFolder = DataTrackFolder.class.cast(sess.load(DataTrackFolder.class, idDataTrackFolder));

        } else {
          DataTrackFolder folder = DataTrackFolder.class.cast(sess.load(DataTrackFolder.class, idDataTrackFolder));
          dataTrackFolder = new DataTrackFolder();
          dataTrackFolder.setName(folder.getName());
          dataTrackFolder.setDescription(folder.getDescription());
          dataTrackFolder.setIdGenomeBuild(folder.getIdGenomeBuild());
          dataTrackFolder.setIdLab(folder.getIdLab());

          Set<DataTrack> dataTracksToKeep = new TreeSet<DataTrack>(new DataTrackComparator());
          for(Iterator<?> i = folder.getDataTracks().iterator(); i.hasNext();) {
            DataTrack a = DataTrack.class.cast(i.next());
            dataTracksToKeep.add(a);
          }
          dataTrackFolder.setDataTracks(dataTracksToKeep);
          sess.save(dataTrackFolder);
        }

        // The move/copy is disallowed if the parent dataTrack grouping belongs to a
        // different genome build
        if (!parentDataTrackFolder.getIdGenomeBuild().equals(dataTrackFolder.getIdGenomeBuild())) {
          throw new Exception("DataTrack folder '" + dataTrackFolder.getName() +
          "' cannot be moved to a different genome version");
        }

        // The move/copy is disallowed if the from and to dataTrack grouping are the
        // same
        if (parentDataTrackFolder.getIdDataTrackFolder().equals(idDataTrackFolder)) {
          throw new Exception("Move/copy operation to same dataTrack folder is not allowed.");
        }

        // Set the parent dataTrack grouping
        dataTrackFolder.setIdParentDataTrackFolder(parentDataTrackFolder.getIdDataTrackFolder());

        sess.flush();

        Element root = new Element("SUCCESS");
        Document doc = new Document(root);
        root.setAttribute("idDataTrack", dataTrackFolder.getIdDataTrackFolder().toString());
        XMLOutputter out = new org.jdom.output.XMLOutputter();
        out.setOmitEncoding(true);
        this.xmlResult = out.outputString(doc);
        this.setResponsePage(SUCCESS_JSP);

      } else {
        setResponsePage(this.ERROR_JSP);
      }
    } catch (Exception e){
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in MoveDataTrackFolder ", e);

      throw new RollBackCommandException(e.getMessage());

    }

    return this;
  }

  private void recurseAddChildren(DataTrackFolder folder, ArrayList children) {
    for (Iterator i = folder.getDataTracks().iterator(); i.hasNext();) {
      DataTrack dt = (DataTrack)i.next();
      children.add(dt);
    }
    for (Iterator i = folder.getFolders().iterator(); i.hasNext();) {
      DataTrackFolder childFolder = (DataTrackFolder)i.next();
      recurseAddChildren(childFolder, children);
    }
  }
}
