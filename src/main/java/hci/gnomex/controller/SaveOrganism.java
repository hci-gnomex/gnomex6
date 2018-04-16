package hci.gnomex.controller;

import hci.framework.control.Command;import hci.gnomex.utility.HttpServletWrappedRequest;import hci.gnomex.utility.Util;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.DataTrackFolder;
import hci.gnomex.model.GenomeBuild;
import hci.gnomex.model.Organism;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.DataTrackFolderComparator;
import hci.gnomex.utility.DictionaryHelper;
import hci.gnomex.utility.HibernateSession;

import java.io.Serializable;
import java.io.StringReader;
import java.sql.Date;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.json.*;
import javax.servlet.http.HttpSession;

import org.hibernate.Session;
import org.apache.log4j.Logger;
public class SaveOrganism extends GNomExCommand implements Serializable {

  // the static field for logging in Log4J
  private static Logger LOG = Logger.getLogger(SaveOrganism.class);

  private JsonArray genomeBuildsArray = null;

  private Organism organismScreen;
  private boolean isNewOrganism = false;

  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    organismScreen = new Organism();
    HashMap errors = this.loadDetailObject(request, organismScreen);
    this.addInvalidFields(errors);
    if (organismScreen.getIdOrganism() == null || organismScreen.getIdOrganism() == 0) {
      isNewOrganism = true;
    }

    // Make sure that the DAS2 name has no spaces or special characters
    if (isValid() && organismScreen.getDas2Name() != null && organismScreen.getDas2Name() != null) {
      if (organismScreen.getDas2Name().contains(" ")) {
        addInvalidField("namespaces", "The DAS2 name cannot have spaces.");
      }
      Pattern pattern = Pattern.compile("\\W");
      Matcher matcher = pattern.matcher(organismScreen.getDas2Name());
      if (matcher.find()) {
        this.addInvalidField("specialc", "The DAS2 name cannot have special characters.");
      }
    }

    String genomeBuildsJSONString = request.getParameter("genomeBuildsJSONString");
    if (Util.isParameterNonEmpty(genomeBuildsJSONString)) {
      try {
        JsonReader jsonReader = Json.createReader(new StringReader(genomeBuildsJSONString));
        this.genomeBuildsArray = jsonReader.readArray();
        jsonReader.close();
      } catch (Exception e) {
        this.addInvalidField("genomeBuildsJSONString", "Invalid genomeBuildsJSONString");
        this.errorDetails = Util.GNLOG(LOG,"Cannot parse genomeBuildsJSONString", e);
      }
    }

  }

  public Command execute() throws RollBackCommandException {

    try {
      Session sess = HibernateSession.currentSession(this.getUsername());

      if (this.getSecurityAdvisor().hasPermission(SecurityAdvisor.CAN_SUBMIT_REQUESTS)) {

        Organism o;

        if (isNewOrganism) {
          o = organismScreen;

          sess.save(o);
          sess.flush();

        } else {

          o = sess.load(Organism.class, organismScreen.getIdOrganism());

          // Hibernate.initialize(o.getGenomeBuilds());

          initializeOrganism(o);
          sess.save(o);
          sess.flush();
        }

        // Check to make sure genome builds have build dates. Otherwise throws error when saving
        if (genomeBuildsArray != null) {
          for(int i = 0; i < this.genomeBuildsArray.size(); i++) {
            JsonObject node = this.genomeBuildsArray.getJsonObject(i);
            if (node.get("buildDate") == null || node.getString("buildDate").equals("")) {
              this.addInvalidField("invalidBuildDate", "Please specify a build date for each genome build.");
            }
          }
        }

        //
        // Save genome builds
        //
        if (this.isValid()) {
          HashMap genomeBuildMap = new HashMap();
          if (genomeBuildsArray != null) {

            for (int i = 0; i < this.genomeBuildsArray.size(); i++) {
              JsonObject node = this.genomeBuildsArray.getJsonObject(i);
              GenomeBuild genomeBuild;

              String idGenomeBuild = node.getString("idGenomeBuild");
              if (idGenomeBuild.startsWith("GenomeBuild")) {
                genomeBuild = new GenomeBuild();
              } else {
                genomeBuild = sess.load(GenomeBuild.class, Integer.valueOf(idGenomeBuild));
              }

              genomeBuild.setGenomeBuildName(node.getString("genomeBuildName"));
              genomeBuild.setIsLatestBuild(node.getString("isLatestBuild"));
              genomeBuild.setIsActive(node.getString("isActive"));
              genomeBuild.setDas2Name(node.getString("das2Name"));
              // construct date to set the build date. since it takes a date object.

              SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd");

              Date date1 = new Date(df.parse(node.getString("buildDate")).getTime());

              genomeBuild.setBuildDate(date1);
              genomeBuild.setIdOrganism(o.getIdOrganism());

              // The root data track folder will be null if it is a new genome build
              // Create one so that we don't get errors when distributing data tracks to this organism
              if (genomeBuild.getRootDataTrackFolder() == null) {
                // Now add a root folder for a new genome build
                DataTrackFolder folder = new DataTrackFolder();
                folder.setName(genomeBuild.getDas2Name());
                folder.setIdGenomeBuild(genomeBuild.getIdGenomeBuild());
                folder.setIdParentDataTrackFolder(null);
                sess.save(folder);

                Set<DataTrackFolder> foldersToKeep = new TreeSet<>(new DataTrackFolderComparator());
                foldersToKeep.add(folder);
                genomeBuild.setDataTrackFolders(foldersToKeep);
                sess.flush();
              } else {
                DataTrackFolder folder = genomeBuild.getRootDataTrackFolder();
                folder.setName(genomeBuild.getDas2Name());
                folder.setIdGenomeBuild(genomeBuild.getIdGenomeBuild());
                folder.setIdParentDataTrackFolder(null);
                sess.save(folder);
              }

              sess.save(genomeBuild);
              sess.flush();
              genomeBuildMap.put(genomeBuild.getIdGenomeBuild(), null);

            }

            // Delete items no longer present
            StringBuilder query = new StringBuilder("SELECT gb from GenomeBuild gb");
            query.append(" where gb.idOrganism=");
            query.append(o.getIdOrganism());
            query.append(" order by gb.genomeBuildName");
            List genomeBuilds = sess.createQuery(query.toString()).list();

            if (!genomeBuilds.isEmpty()) {
              for (Iterator j = genomeBuilds.iterator(); j.hasNext();) {
                GenomeBuild gb = (GenomeBuild) j.next();
                if (!genomeBuildMap.containsKey(gb.getIdGenomeBuild())) {
                  sess.delete(gb);
                }
              }
            }

          }

          sess.flush();

          DictionaryHelper.reload(sess);

          this.jsonResult = Json.createObjectBuilder()
                  .add("result", "SUCCESS")
                  .add("idOrganism", o.getIdOrganism().toString())
                  .build().toString();

          setResponsePage(this.SUCCESS_JSP);
        } else {
          setResponsePage(this.ERROR_JSP);
        }
      } else {
        this.addInvalidField("Insufficient permissions", "Insufficient permission to save organism.");
        setResponsePage(this.ERROR_JSP);
      }

    } catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in SaveOrganism ", e);
      throw new RollBackCommandException(e.getMessage());

    }

    return this;
  }

  private void initializeOrganism(Organism o) {
    o.setOrganism(organismScreen.getOrganism());
    o.setAbbreviation(organismScreen.getAbbreviation());
    o.setMageOntologyCode(organismScreen.getMageOntologyCode());
    o.setMageOntologyDefinition(organismScreen.getMageOntologyDefinition());
    o.setIsActive(organismScreen.getIsActive());
    o.setIdAppUser(organismScreen.getIdAppUser());

    o.setBinomialName(organismScreen.getBinomialName());
    o.setNcbiTaxID(organismScreen.getNcbiTaxID());
    o.setSortOrder(organismScreen.getSortOrder());
    o.setDas2Name(organismScreen.getDas2Name());

  }

}
