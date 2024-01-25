package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.*;
import hci.gnomex.utility.*;
import org.apache.log4j.Logger;
import org.hibernate.Hibernate;
import org.hibernate.Session;

import javax.json.*;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Serializable;
import java.util.*;

/**
 * Given a list of analysis files, this routine creates data tracks for
 * all of the appropriate files.  The data track folder structure mirrors
 * the analysis folder structure.
 * <p>
 * Most of this code was stolen from CreateDataTracks
 */

public class CreateAllDataTracks extends GNomExCommand implements Serializable {

    // the static field for logging in Log4J
    private static Logger LOG = Logger.getLogger(CreateAllDataTracks.class);

    private Integer idAnalysis;

    private String serverName;

    private Integer idLab;
    private Integer idGenomeBuild;
    private List<Integer> idAnalysisFiles;

    private Session sess;

    public void validate() {
    }

    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
        idAnalysisFiles = new ArrayList<>();

        try(JsonReader reader = Json.createReader(new InputStreamReader(request.getInputStream()))){
            JsonObject  jsonObject = reader.readObject();
            String idAnalysisStr = Util.getJsonStringSafe(jsonObject, "idAnalysis");
            JsonArray idAnalysisFilesJson = jsonObject.get("idAnalysisFileToDistribute") != null ? jsonObject.getJsonArray("idAnalysisFileToDistribute") : null;

            if(idAnalysisStr != null){
                idAnalysis = Integer.valueOf(idAnalysisStr);
            }else{
                this.addInvalidField("idAnalysis", "idAnalysis is required.");
            }


            if(idAnalysisFilesJson != null){
                for(JsonValue idAnalysisFileJson : idAnalysisFilesJson){
                    String idAnalyisFile = ((JsonString)idAnalysisFileJson).getString();
                    idAnalysisFiles.add(Integer.valueOf (idAnalyisFile));
                }

            }else{
                this.addInvalidField("idAnalysisFileToDistribute", "idAnalysisFileToDistribute is required.");
            }


        }catch (IOException e){
            this.addInvalidField("CreateAllDataTracks", "failed to read post body");
        }

        serverName = request.getServerName();
    }

    public Command execute() throws RollBackCommandException {

        try {
            sess = HibernateSession.currentSession(this.getUsername());


            Analysis analysis = sess.load(Analysis.class, idAnalysis);
            ArrayList<AnalysisFile> fileList = new ArrayList<>();
            for(Integer idAnalysisFile : idAnalysisFiles){
                fileList.add( sess.load(AnalysisFile.class, idAnalysisFile));
            }


            // get what we need from the database
            String analysisName = analysis.getName();

            //lab
            idLab = analysis.getIdLab();
            Lab lab = analysis.getLab();
            String labName = lab.getName();

            //genome build
            Set<GenomeBuild> gbs = analysis.getGenomeBuilds();
            GenomeBuild gb = gbs.iterator().next();
            idGenomeBuild = gb.getIdGenomeBuild(); //Just pull the first one, should only be one.


            ArrayList<AnalysisFile> bamFiles = new ArrayList<>();
            ArrayList<AnalysisFile> covFiles = new ArrayList<>();
            ArrayList<AnalysisFile> vcfFiles = new ArrayList<>();
            ArrayList<AnalysisFile> dtExists = new ArrayList<>();

            //folderNames
            for (AnalysisFile af : fileList) {
                String afFileNameUpperCase = af.getFileName().toUpperCase();
                if (afFileNameUpperCase.endsWith(".BAM")) {
                    // is it already a data track?
                    if (getidDataTrack(af.getIdAnalysisFile(), sess) == -1) {
                        bamFiles.add(af);
                    } else {
                        dtExists.add(af);
                    }
                } else if (afFileNameUpperCase.endsWith(".USEQ") || afFileNameUpperCase.endsWith(".BB") || afFileNameUpperCase.endsWith(".BW")) {
                    // is it already a data track?
                    if (getidDataTrack(af.getIdAnalysisFile(), sess) == -1) {
                        covFiles.add(af);
                    } else {
                        dtExists.add(af);
                    }
                } else if (afFileNameUpperCase.endsWith(".VCF.GZ")) {
                    // is it already a data track?
                    if (getidDataTrack(af.getIdAnalysisFile(), sess) == -1) {
                        vcfFiles.add(af);
                    } else {
                        dtExists.add(af);
                    }
                }
            }

            // for all the datatracks that exist, make sure the index is associated with it
            if (dtExists.size() > 0) {
                checkDataTrackIndex(dtExists);
            }
            // if we found any files to make data tracks for, do the work
            if (bamFiles.size() > 0 || covFiles.size() > 0 || vcfFiles.size() > 0) {

                /*************************************
                 * Create Subfolder structure
                 **************************************/
                DataTrackFolder rootFolder = gb.getRootDataTrackFolder();

                if (rootFolder == null) {
                    System.out.println("Warning: Could not find the root data track folder for genome: " + gb.getGenomeBuildName());
                }

                ArrayList<DataTrackFolder> existingFolders = new ArrayList<DataTrackFolder>(rootFolder.getFolders());

                // Setup directory structure
                ArrayList<String> toCreate = new ArrayList<>();

                toCreate.add(labName);
                toCreate.add(analysisName);

                // Create Directories if they don't already exist
                Integer parentId = rootFolder.getIdDataTrackFolder();
                boolean isNew = false;
                for (String dir : toCreate) {
                    if (!isNew) { // If we might find an existing folder

                        boolean exists = false;
                        for (DataTrackFolder dtf : existingFolders) {
                            if (dtf.getName().equals(dir)) {
                                exists = true;

                                // get the folders it contains and check the next one
                                existingFolders = new ArrayList<DataTrackFolder>(dtf.getFolders());
                                parentId = dtf.getIdDataTrackFolder();
                                break;
                            }
                        } // end of for

                        if (!exists) {

                            parentId = this.createDataTrackFolder(dir, parentId);
                            isNew = true;
                        }

                    } else { // We are in new folder territory.
                        parentId = this.createDataTrackFolder(dir, parentId);
                        isNew = true;
                    }
                } // end of outer for

                /*************************************
                 * Create DataTracks
                 **************************************/
                //Create directory and datatracks for each type
                if (bamFiles.size() > 0) {
                    this.createDataTrackDriver("bam", parentId, bamFiles);
                }

                if (covFiles.size() > 0) {
                    this.createDataTrackDriver("useq", parentId, covFiles);
                }

                if (vcfFiles.size() > 0) {
                    this.createDataTrackDriver("vcf", parentId, vcfFiles);
                }

                this.jsonResult = Json.createObjectBuilder()
                        .add("result", "SUCCESS")
                        .add("idAnalysis", "" + analysis.getIdAnalysis())
                        .add("idAnalysisGroup", "")
                        .build().toString();

                setResponsePage(this.SUCCESS_JSP);

            } // end of if we had some files of interest
        } catch (Exception e) {
            this.errorDetails = Util.GNLOG(LOG, "An exception has occurred in CreateAllDataTracks ", e);
            throw new RollBackCommandException(e.getMessage());
        }

        return this;
    }

    /******************************
     * Create enclosing folder
     ****************************/
    private void createDataTrackDriver(String folderName, Integer parentId, ArrayList<AnalysisFile> filesToLink) {

        // get the existing data track folders
        DataTrackFolder parentFolder = DataTrackFolder.class.cast(sess.load(DataTrackFolder.class, parentId));

        // create the folder if needed
        Integer subId = null;
        boolean exists = false;

        if (parentFolder.getFolders() != null) {
            ArrayList<DataTrackFolder> existing = new ArrayList<DataTrackFolder>(parentFolder.getFolders());
            for (DataTrackFolder dtf : existing) {
                if (dtf.getName().equals(folderName)) {
                    exists = true;
                    subId = dtf.getIdDataTrackFolder();
                    break;
                }
            } // end of for
        }

        if (!exists) {
            subId = this.createDataTrackFolder(folderName, parentId);
        }

        for (AnalysisFile af : filesToLink) {
            this.createDataTrack(af.getIdAnalysisFile(), subId);
        }
    }

    /*******************************
     * Stolen from linkDataTrackFiles.
     *********************************/
    private void createDataTrack(Integer idAnalysisFile, Integer idDataTrackFolder) {
        DataTrack dataTrack;
        AnalysisFile analysisFile;

        try {
            PropertyDictionaryHelper propertyHelper = PropertyDictionaryHelper.getInstance(sess);
            String baseDirDataTrack = propertyHelper.getDirectory(serverName, null, propertyHelper.getProperty(PropertyDictionaryHelper.PROPERTY_DATATRACK_DIRECTORY));

            analysisFile = sess.load(AnalysisFile.class, idAnalysisFile);
            Analysis analysis = sess.load(Analysis.class, analysisFile.getIdAnalysis());

            dataTrack = new DataTrack();

            dataTrack.setName(analysisFile.getAnalysis().getNumber() + "_" + analysisFile.getFileName());
            dataTrack.setIdLab(idLab);
            dataTrack.setIdGenomeBuild(idGenomeBuild);

            //
            // Clone the collaborators
            //
            if (analysis.getCollaborators() != null) {
                TreeSet<AppUser> collaborators = new TreeSet<>(new AppUserComparator());
                Iterator<?> cIt = analysis.getCollaborators().iterator();
                while (cIt.hasNext()) {
                    AnalysisCollaborator ac = (AnalysisCollaborator) cIt.next();
                    AppUser au = sess.load(AppUser.class, ac.getIdAppUser());

                    collaborators.add(au);
                    dataTrack.setCollaborators(collaborators);
                }
            }

            String defaultVisibility = propertyHelper.getProperty(PropertyDictionary.DEFAULT_VISIBILITY_DATATRACK);
            if (defaultVisibility != null && defaultVisibility.length() > 0) {
                dataTrack.setCodeVisibility(defaultVisibility);
                if (defaultVisibility.compareTo(hci.gnomex.model.Visibility.VISIBLE_TO_INSTITUTION_MEMBERS) == 0) {
                    if (dataTrack.getIdLab() != null) {
                        Lab lab = sess.load(Lab.class, dataTrack.getIdLab());
                        Hibernate.initialize(lab.getInstitutions());
                        Iterator it = lab.getInstitutions().iterator();
                        while (it.hasNext()) {
                            Institution thisInst = (Institution) it.next();
                            if (thisInst.getIsDefault().compareTo("Y") == 0) {
                                dataTrack.setIdInstitution(thisInst.getIdInstitution());
                            }
                        }
                    }
                }
            } else {
                dataTrack.setCodeVisibility(hci.gnomex.model.Visibility.VISIBLE_TO_GROUP_MEMBERS);
            }

            dataTrack.setIdAppUser(analysis.getIdAppUser());

            dataTrack.setDataPath(baseDirDataTrack);
            dataTrack.setCreatedBy(this.getUsername());
            dataTrack.setCreateDate(new java.sql.Date(System.currentTimeMillis()));
            dataTrack.setIsLoaded("N");

            sess.save(dataTrack);

            dataTrack.setFileName("DT" + dataTrack.getIdDataTrack());
            sess.flush();

            // Create the datatrackfile
            DataTrackFile dtFile = new DataTrackFile();
            dtFile.setIdAnalysisFile(idAnalysisFile);
            dtFile.setIdDataTrack(dataTrack.getIdDataTrack());
            sess.save(dtFile);
            sess.flush();

            // deal with the index file if needed
            Integer idAnalysisFileOther = null;

            boolean lookForBai = false;
            boolean lookForVCFTBI = false;

            String baseFileName = fetchBaseName(analysisFile.getQualifiedFileName(), Constants.DATATRACK_FILE_EXTENSIONS);

            String fileName = analysisFile.getFileName().toUpperCase();
            if (fileName.endsWith(".BAM")) lookForBai = true;
            else if (fileName.endsWith(".VCF.GZ")) lookForVCFTBI = true;

            // look thru all the files in this analysis
            for (Iterator i = analysisFile.getAnalysis().getFiles().iterator(); i.hasNext(); ) {
                AnalysisFile af = (AnalysisFile) i.next();
                String afBaseFileName = fetchBaseName(af.getQualifiedFileName(), Constants.DATATRACK_FILE_EXTENSIONS);


                //do the baseNames match?
                String afFileNameUpperCase = af.getFileName().toUpperCase();
                if (baseFileName.toUpperCase().equals(afBaseFileName.toUpperCase())) {
                    if (lookForBai && afFileNameUpperCase.endsWith(".BAI")) {
                        idAnalysisFileOther = af.getIdAnalysisFile();
                    } else if (lookForVCFTBI && afFileNameUpperCase.endsWith(".VCF.GZ.TBI")) {
                        idAnalysisFileOther = af.getIdAnalysisFile();
                    }
                }
            } // end of for

            // If we found an index, create a datatrackfile entry for it (can't already be there)
            if (idAnalysisFileOther != null) {
                DataTrackFile dtFileOther = new DataTrackFile();
                dtFileOther.setIdAnalysisFile(idAnalysisFileOther);
                dtFileOther.setIdDataTrack(dataTrack.getIdDataTrack());
                sess.save(dtFileOther);
                sess.flush();
            }

            // *************************************************************
            //  add the data track to the folder (it can't already be there)
            // *************************************************************
            DataTrackFolder folderNew = DataTrackFolder.class.cast(sess.load(DataTrackFolder.class, idDataTrackFolder));

            // Add the dataTrack to the dataTrack folder
            Set<DataTrack> newDataTracks = new TreeSet<>(new DataTrackComparator());
            if (folderNew.getDataTracks() != null) {
                for (Iterator<?> i = folderNew.getDataTracks().iterator(); i.hasNext(); ) {
                    DataTrack a = DataTrack.class.cast(i.next());
                    newDataTracks.add(a);
                }
            }

            newDataTracks.add(dataTrack);
            folderNew.setDataTracks(newDataTracks);
            sess.flush();

        } catch (Exception e) {
            LOG.error("An exception has occurred in CreateAllDataTracks: " + e.getMessage(), e);
        }
    }


    /**********************************************
     * Stolen from SaveDataTrackFolder
     *********************************************/

    private Integer createDataTrackFolder(String folderName, Integer idParentDataTrackFolder) {

        DataTrackFolder dataTrackFolder = new DataTrackFolder();

        dataTrackFolder.setCreatedBy(this.getUsername());
        dataTrackFolder.setCreateDate(new java.sql.Date(System.currentTimeMillis()));
        dataTrackFolder.setName(RequestParser.unEscape(folderName));
        dataTrackFolder.setIdLab(idLab);
        dataTrackFolder.setIdGenomeBuild(idGenomeBuild);
        dataTrackFolder.setIdParentDataTrackFolder(idParentDataTrackFolder);

        try {
            sess.save(dataTrackFolder);
            sess.flush();
        } catch (Exception ex) {
            LOG.error("Could not save datatrackfolder: " + ex.getMessage(), ex);
        }

        return dataTrackFolder.getIdDataTrackFolder();
    }

    // if there is an index file, make sure it is associated with the data track
    private void checkDataTrackIndex(ArrayList<AnalysisFile> filesToCheck) {
        return;
    }

    /**
     * Removes the extension and its period.  Thus alta.is.great.bam.bai -> alta.is.great.bam .
     */
    private String fetchBaseName(String fileName, String[] lowerCaseExtensions) {
        int extLength = 0;
        String lower = fileName.toLowerCase();
        for (String ext : lowerCaseExtensions) {
            if (lower.endsWith(ext)) {
                extLength = ext.length();
                break;
            }
        }
        return fileName.substring(0, fileName.length() - extLength);
    }

    private static int getidDataTrack(int idAnalysisFile, Session sess) {
        int idDataTrack = -1;

        String buf = "SELECT idDataTrack from DataTrackFile where idAnalysisFile = " + idAnalysisFile;
        List results = sess.createQuery(buf).list();

        if (results.size() > 0) {
            idDataTrack = (Integer) results.get(0);
        }

        return idDataTrack;
    }

}
