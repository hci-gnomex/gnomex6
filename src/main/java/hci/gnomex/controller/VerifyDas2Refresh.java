package hci.gnomex.controller;

import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.*;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Session;

import javax.json.Json;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.List;

public class VerifyDas2Refresh extends GNomExCommand implements Serializable {

    private static Logger LOG = Logger.getLogger(VerifyDas2Refresh.class);

    private String serverName;

    public void validate() {
    }

    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
        serverName = request.getServerName();
    }

    public Command execute() throws RollBackCommandException {
        StringBuilder invalidGenomeBuilds = new StringBuilder();
        StringBuilder emptyDataTracks = new StringBuilder();
        int loadCount = 0;
        int unloadCount = 0;

        try {
            Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());

            String analysisBaseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null, PropertyDictionaryHelper.PROPERTY_ANALYSIS_DIRECTORY);
            String use_altstr = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.USE_ALT_REPOSITORY);
            if (use_altstr != null && use_altstr.equalsIgnoreCase("yes")) {
                analysisBaseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null, PropertyDictionaryHelper.ANALYSIS_DIRECTORY_ALT, this.getUsername());
            }

            String dataTrackBaseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null, PropertyDictionaryHelper.PROPERTY_DATATRACK_DIRECTORY);

            DataTrackQuery DataTrackQueryObject = new DataTrackQuery();
            DataTrackQueryObject.runDataTrackQuery(sess, this.getSecAdvisor(), true);
            for (Organism organism : DataTrackQueryObject.getOrganisms()) {
                for (String GenomeBuildName : DataTrackQueryObject.getGenomeBuildNames(organism)) {

                    GenomeBuild gv = DataTrackQueryObject.getGenomeBuild(GenomeBuildName);

                    List<Segment> segments = DataTrackQueryObject.getSegments(organism, GenomeBuildName);
                    // Make sure that genome versions with DataTracks or sequence have at least
                    // one segment.
                    if (DataTrackQueryObject.getQualifiedDataTracks(organism, GenomeBuildName).size() > 0 || gv.hasSequence(dataTrackBaseDir)) {
                        if (segments == null || segments.size() == 0) {
                            if (invalidGenomeBuilds.length() > 0) {
                                invalidGenomeBuilds.append(", ");
                            }
                            invalidGenomeBuilds.append(GenomeBuildName);
                        }
                    }
                    // Keep track of how many DataTracks have missing files
                    for (QualifiedDataTrack qa : DataTrackQueryObject.getQualifiedDataTracks(organism, GenomeBuildName)) {

                        if (qa.getDataTrack().getFileCount(dataTrackBaseDir, analysisBaseDir) == 0) {
                            if (emptyDataTracks.length() > 0) {
                                emptyDataTracks.append("\n");
                            }
                            emptyDataTracks.append(gv.getDas2Name());
                            emptyDataTracks.append(":  ");
                            break;
                        }
                    }
                    boolean firstAnnot = true;
                    for (QualifiedDataTrack qa : DataTrackQueryObject.getQualifiedDataTracks(organism, GenomeBuildName)) {
                        if (qa.getDataTrack().getFileCount(dataTrackBaseDir, analysisBaseDir) == 0) {
                            if (firstAnnot) {
                                firstAnnot = false;
                            } else {
                                if (emptyDataTracks.length() > 0) {
                                    emptyDataTracks.append(", ");
                                }
                            }
                            emptyDataTracks.append(qa.getDataTrack().getName());
                        } else {
                            loadCount++;
                        }
                    }
                    List<UnloadDataTrack> unloadDataTracks = DataTrackQuery.getUnloadedDataTracks(sess, this.getSecAdvisor(), gv);
                    unloadCount = unloadCount + unloadDataTracks.size();
                }
            }

            StringBuilder confirmMessage = new StringBuilder();

            if (loadCount > 0 || unloadCount > 0) {
                if (loadCount > 0) {
                    confirmMessage.append(loadCount);
                    confirmMessage.append(" DataTrack(s) and ready to load to DAS/2.\n\n");
                }
                if (unloadCount > 0) {
                    confirmMessage.append(unloadCount);
                    confirmMessage.append(" DataTrack(s) ready to unload from DAS/2.\n\n");
                }
                confirmMessage.append("Do you wish to continue?\n\n");
            } else {
                confirmMessage.append("No DataTracks are queued for reload.  Do you wish to continue?\n\n");
            }

            StringBuilder message = new StringBuilder();
            if (invalidGenomeBuilds.length() > 0 || emptyDataTracks.length() > 0) {

                if (invalidGenomeBuilds.length() > 0) {
                    message.append("DataTracks and sequence for the following genome versions will be bypassed due to missing segment information:\n");
                    message.append(invalidGenomeBuilds.toString());
                    message.append(".\n\n");
                }
                if (emptyDataTracks.length() > 0) {
                    message.append("The following empty DataTracks will be bypassed:\n");
                    message.append(emptyDataTracks.toString());
                    message.append(".\n\n");
                }
                message.append(confirmMessage.toString());
                this.addInvalidField("invalid", message.toString());
                setResponsePage(this.ERROR_JSP);
            }
            this.jsonResult = Json.createObjectBuilder()
                    .add("result", "SUCCESS")
                    .add("message", confirmMessage.toString())
                    .build().toString();
            setResponsePage(this.SUCCESS_JSP);
        } catch (Exception e) {
            this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in VerifyDas2Refresh ", e);
            throw new RollBackCommandException(e.getMessage());
        }

        return this;
    }
}
