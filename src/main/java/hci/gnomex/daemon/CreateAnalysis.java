package hci.gnomex.daemon;

// 04/22/2020	tim		SaveAnalysis run as a daemon

import hci.gnomex.constants.Constants;
import hci.gnomex.model.*;
import hci.gnomex.utility.FileDescriptor;
import hci.gnomex.utility.*;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.internal.SessionImpl;
import org.jdom.Document;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;
import org.xml.sax.EntityResolver;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import javax.json.JsonArray;
import java.io.*;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.text.SimpleDateFormat;
import java.util.*;

import static java.lang.System.*;

// bash httpclient_create_analysis.sh -lab Bioinformatics -name 1123342 -organism human -genomeBuild hg19 -analysisType Alignment -isBatchMode Y -folderName "Patients - Tempus - NO PHI" -experiment 3799R -server hci-clingen1.hci.utah.edu -serverURL https://hci-clingen1.hci.utah.edu -linkBySample -analysisIDFile /home/u0566434/parser_data/tempAnalysisList.out


public class CreateAnalysis extends TimerTask {

	private static long fONCE_PER_DAY = 1000 * 60 * 60 * 24; // A day imilliseconds

	public BatchDataSource dataSource;
	public Session sess;

	private static boolean all = false;
	private static Integer daysSince = null;
	private static String serverName = "";
	private static CreateAnalysis app = null;

	private Calendar runDate; // Date program is being run.

	private Transaction tx;

	private String orionPath = "";

	private Boolean sendMail = true;
	private Boolean testingSendMail = false;
	private Boolean debug = false;
	private Boolean testConnection = false;

	private String errorMessageString = "Error in CreateAnalysis";

	private String gnomexSupportEmail = "GNomEx.Support@hci.utah.edu";
	private String fromEmailAddress = "DoNotReply@hci.utah.edu";

	private String currentEntityString;

	private Boolean justOne = false;
	private Boolean onlyAnalysis = false;
	private Boolean onlyExperiment = false;
	private String analysisId = null;
	private String requestId = null;
	private Boolean removeLinks = false;
	private Boolean analysisWarnings = false;
	private Boolean experimentWarnings = false;

	private String dataTrackFileServerWebContext;

	private String lab;
	private String organism;
	private String genomeBuild;
	private String analysisType;
	private String  name;
	private String description;
	private String folderName;
	private String folderDescription;
	private List<String> seqLaneNumbers = new ArrayList<String>();
	private List<String> sampleNumbers = new ArrayList<String>();
	private List<String> experimentNumbers = new ArrayList<String>();
	private String lanesXMLString = null;
	private String samplesXMLString = null;
	private String experimentsXMLString = null;
	private String linkBySample = "N";
	private String analysisIDFile = "";

//	protected String userName;
	protected String server;
	protected String serverURL;
	public String labName = "";
	private Analysis analysisScreen;
	public boolean isNewAnalysis = false;

	private AnalysisGroupParser analysisGroupParser;

	private AnalysisFileParser analysisFileParser;

	private Integer originalIdLab = null;

	private JsonArray hybsArray;
	private AnalysisHybParser hybParser;

	private JsonArray lanesArray;
	private Document lanesDoc;
	private AnalysisLaneParser laneParser;

	private JsonArray samplesArray;
	private AnalysisSampleParser sampleParser;

	private JsonArray collaboratorsArray;
	private AnalysisCollaboratorParser collaboratorParser;

	private JsonArray genomeBuildsArray;
	private AnalysisGenomeBuildParser genomeBuildParser;

	private boolean isNewAnalysisGroup = false;

	private String newAnalysisGroupName;
	private String newAnalysisGroupDescription;
	private Integer newAnalysisGroupId = -1;

	protected String propertiesFileName = "/properties/gnomex_httpclient.properties";
	protected String xmlResult = "";
	protected String jsonResult = null;
	protected String errorDetails = "";

	private String visibility = "MEM";
	private Integer idInstitution = 1;

	public boolean isBatchMode = true;
	public boolean isLinkBySample = false;

	public String username = "adminBatch";
	public int idAppUser = -1;

	private UserPreferences userPreferences;
	private AnalysisGroup existingAnalysisGroup;
	public int theIdLab = -1;
	public int theIdAnalysisGroup = -1;
	public int theIdAnalysis = -1;

	public CreateAnalysis(String[] args) {
//		for (int i = 0; i < args.length; i++) {
//			System.out.println ("i: " + i + " " + args[i]);
//		}
		for (int i = 0; i < args.length; i++) {
			args[i] = args[i].toLowerCase();

			if (args[i].equals("-h")) {
				printUsage();
				return;
			} else if (args[i].equals("-debug")) {
				debug = true;
			} else if (args[i].equals("-linkbysample")) {
				linkBySample = "Y";
				isLinkBySample = true;
			} else if(args[i].equals("-analysisidfile")){
				analysisIDFile = args[++i];
			} else if (args[i].equals("-properties")) {
				propertiesFileName = args[++i];
			} else if (args[i].equals("-server")) {
				server = args[++i];
			} else if (args[i].equals("-serverurl")) {
				serverURL = args[++i];
			} else if (args[i].equals("-lab")) {
				lab = args[++i];
				labName = lab;
			} else if (args[i].equals("-genomebuild")) {
				genomeBuild = args[++i];
			} else if (args[i].equals("-organism")) {
				organism = args[++i];
			} else if (args[i].equals("-analysistype")) {
				analysisType = args[++i];
			} else if (args[i].equals("-name")) {
				name = args[++i];
			} else if (args[i].equals("-description")) {
				description = args[++i];
			} else if (args[i].equals("-foldername")) {
				String gn = args[++i];
				if (gn.indexOf('"') >= 0)
				{
					gn = gn.substring(1) + " ";
					while (true) {
						if (i >= args.length) {
							System.out.println ("Error: foldername does not have closing quote.");
							System.exit(2);
						}
						String gn1 = args[++i];
						if (gn1.indexOf('"') < 0) {
							gn = gn + gn1 + " ";
							continue;
						}
						gn = gn + gn1.substring(0,gn1.length()-1);
						break;
					}  // end of while
				}

				folderName = gn;
				newAnalysisGroupName =  folderName;
			} else if (args[i].equals("-folderdescription")) {
				folderDescription = args[++i];
				newAnalysisGroupDescription = folderDescription;
			} else if (args[i].equals("-seqlane")) {
				String seqLaneNumber = args[++i];
				seqLaneNumbers.add(seqLaneNumber);
			} else if (args[i].equals("-experiment")) {
				String experimentNumber = args[++i];
				experimentNumbers.add(experimentNumber);
			} else if (args[i].equals("-sample")) {
				String sampleNumber = args[++i];
				sampleNumbers.add(sampleNumber);
			}
		}

		if (!seqLaneNumbers.isEmpty()) {
			lanesXMLString = "<lanes>";
			for (Iterator iter = seqLaneNumbers.iterator(); iter.hasNext();) {
				String seqLaneNumber = (String)iter.next();
				lanesXMLString += "<SequenceLane number=\"" + seqLaneNumber + "\"/>";
			}
			lanesXMLString += "</lanes>";
		}

		if (!sampleNumbers.isEmpty()) {
			samplesXMLString = "<samples>";
			for (Iterator iter = sampleNumbers.iterator(); iter.hasNext();) {
				String sampleNumber = (String)iter.next();
				samplesXMLString += "<Sample number=\"" + sampleNumber + "\"/>";
			}
			samplesXMLString += "</samples>";
		}

		if (!experimentNumbers.isEmpty()) {
			experimentsXMLString = "<experiments>";
			for (Iterator iter = experimentNumbers.iterator(); iter.hasNext();) {
				String experimentNumber = (String)iter.next();
				experimentsXMLString += "<Experiment number=\"" + experimentNumber + "\"/>";
			}
			experimentsXMLString += "</experiments>";
		}

		idAppUser = getIdAppUser(username);
	}

	protected void printUsage() {
		out.println("java hci/gnomex/daemon/CreateAnalysis " + "\n" +
				"[-debug] " + "\n" +
				"-properties <propertiesFileName> " + "\n" +
				"-server <serverName>" + "\n" +
				"-name <analysisName>" + "\n" +
				"-lab <lab name>" + "\n" +
				"-folderName <name of folder>" + "\n" +
				"-organism <organism           example: Human,E. coli, etc.>" +  "\n" +
				"-genomeBuild <genome build    example: hg18, hg19, TAIR8, etc.>" + "\n" +
				"-analysisType <analysis type  example: Alignment,SNP/INDEL,ChIP-Seq analysis,etc..>" +  "\n" +
				"[-description <analysisDescription>]" + "\n" +
				"[-folderDescription <description of folder>]" + "\n" +
				"[-seqLane <sequence lane number example: 8432F1_1> [...]]" +
				"[-sample <sample number example: 8432X1> [...]]" +
				"[-experiment <experiment number example: 8432R> [...]] +\n" +
				"[-linkBySample] <Link to experiment link using sample not sequence lanes>] \n" +
				"[-analysisIDFile] < Newly created Analyses ID's will be saved to this file delimited by space"
		);
	}




	/**
	 * @param args
	 */
	public static void main(String[] args) {
		app = new CreateAnalysis(args);
		app.run();
	}

	@Override
	public void run() {
		runDate = Calendar.getInstance();
		errorMessageString += " on " + new SimpleDateFormat("MM-dd-yyyy_HH:mm:ss").format(runDate.getTime()) + "\n";

		try {
			Logger LOG = Logger.getLogger("org.hibernate");
			LOG.setLevel(Level.ERROR);

			dataSource = new BatchDataSource();
			app.connect();

			app.initialize();

			tx = sess.beginTransaction();

			// do the work			******************************************************
			analysisScreen = new Analysis();
			if (analysisScreen.getIdAnalysis() == null || analysisScreen.getIdAnalysis().intValue() == 0) {
				isNewAnalysis = true;
			}


			StringReader reader = null;
			if (experimentsXMLString != null && !experimentsXMLString.equals("")) {
				reader = new StringReader(experimentsXMLString);

				try {
					SAXBuilder sax = new SAXBuilder();
					lanesDoc = sax.build(reader);
					laneParser = new AnalysisLaneParser(lanesDoc);
				} catch (JDOMException je) {
					this.errorDetails = Util.GNLOG(LOG,"Cannot parse lanesXMLString ", je);
				}
			}

			// If the request parameters came from a batch java program
			// (see hci.gnomex.httpclient.CreateAnalysis), then
			// the names of the lab, genome build, organism, and
			// analysis type are passed in. Now lookup the
			// objects to get the ids.

			getLab(sess);
			getAnalysisType(sess);
			getOrganism(sess);
			getGenomeBuilds(sess);
			getExistingAnalysisGroup(sess);

			Analysis analysis = null;
			if (isNewAnalysis) {
				analysis = analysisScreen;
				setVisibility(sess, analysis);
				analysis.setCodeVisibility(visibility);
				analysis.setIdInstitution(idInstitution);
				analysis.setName(name);

				analysis.setDescription(description);
				analysis.setIdAnalysisProtocol(analysisScreen.getIdAnalysisProtocol());


				if (analysisScreen.getIdAppUser() == null) {
					analysis.setIdAppUser(idAppUser);
				} else {
					analysis.setIdAppUser(idAppUser);
				}
				analysis.setIdSubmitter(idAppUser);
				setVisibility(sess, analysis);
			} else {
				out.println ("Not a new analysis. Fatal error");
				exit(2);
			}


			if (analysisGroupParser != null) {
				analysisGroupParser.parse(sess);
			}
			if (analysisFileParser != null) {
				analysisFileParser.parse(sess);
			}
			if (hybParser != null) {
				hybParser.parse(sess);
			}
			if (laneParser != null) {
				laneParser.parse(sess, isBatchMode, isLinkBySample);
			}
			if (sampleParser != null) {
				sampleParser.parse(sess);
			}
			if (collaboratorParser != null) {
				collaboratorParser.parse(sess);
			}
			if (genomeBuildParser != null) {
				genomeBuildParser.parse(sess);
			}

			if (isNewAnalysis) {
				sess.save(analysis);

				if (isNewAnalysisGroup) {
					AnalysisGroup newAnalysisGroup = new AnalysisGroup();
					newAnalysisGroup.setIdLab(analysisScreen.getIdLab());
					newAnalysisGroup.setName(newAnalysisGroupName);
					newAnalysisGroup.setDescription(newAnalysisGroupDescription);
					sess.save(newAnalysisGroup);
					newAnalysisGroupId = newAnalysisGroup.getIdAnalysisGroup();

					TreeSet analysisGroups = new TreeSet(new AnalysisGroupComparator());
					analysisGroups.add(newAnalysisGroup);
					analysis.setAnalysisGroups(analysisGroups);
				}

				theIdAnalysis = analysis.getIdAnalysis();
				analysis.setNumber("A" + analysis.getIdAnalysis().toString());
				analysis.setCreateDate(new java.sql.Date(currentTimeMillis()));
				sess.flush();

			}

			//
			// Save analysis groups
			//
			if (!isNewAnalysisGroup && existingAnalysisGroup != null ) {
				TreeSet analysisGroups = new TreeSet(new AnalysisGroupComparator());
				if (existingAnalysisGroup != null) {
					analysisGroups.add(existingAnalysisGroup);

				}

				else if (analysisGroupParser != null && analysisGroupParser.getAnalysisGroupMap().isEmpty()) {
					// If analysis group wasn't provided, create a default
					// one
					AnalysisGroup defaultAnalysisGroup = new AnalysisGroup();
					defaultAnalysisGroup.setName(analysis.getName());
					defaultAnalysisGroup.setIdLab(analysisScreen.getIdLab());
					defaultAnalysisGroup.setIdAppUser(idAppUser);
					sess.save(defaultAnalysisGroup);

					newAnalysisGroupId = defaultAnalysisGroup.getIdAnalysisGroup();

					analysisGroups.add(defaultAnalysisGroup);
				} else {
					// Relate the analysis to the specified analysis groups
					for (Iterator i = analysisGroupParser.getAnalysisGroupMap().keySet().iterator(); i.hasNext();) {
						String idAnalysisGroupString = (String) i.next();
						AnalysisGroup ag = (AnalysisGroup) analysisGroupParser.getAnalysisGroupMap().get(
								idAnalysisGroupString);
						analysisGroups.add(ag);
					}
				}
				analysis.setAnalysisGroups(analysisGroups);
			}

			sess.flush();

			//
			// Get rid of removed experiment items files
			//
			ArrayList experimentItemsToRemove = new ArrayList();
			if (!isNewAnalysisGroup) {
				for (Iterator i = analysis.getExperimentItems().iterator(); i.hasNext();) {
					AnalysisExperimentItem ex = (AnalysisExperimentItem) i.next();
					boolean found = false;
					if (hybParser != null) {
						for (Iterator i1 = hybParser.getIdHybridizations().iterator(); i1.hasNext();) {
							Integer idHybridization = (Integer) i1.next();
							if (idHybridization.equals(ex.getIdHybridization())) {
								found = true;
								break;
							}
						}

					}
					if (!found) {
						if (laneParser != null) {
							for (Iterator i1 = laneParser.getIdSequenceLanes().iterator(); i1.hasNext();) {
								Integer idSequenceLane = (Integer) i1.next();
								if (idSequenceLane.equals(ex.getIdSequenceLane())) {
									found = true;
									break;
								}
							}
						}

					}
					if (!found) {
						if (sampleParser != null) {
							for (Iterator<Integer> i1 = sampleParser.getIdSamples().iterator(); i1.hasNext();) {
								Integer idSample = i1.next();
								if (idSample.equals(ex.getIdSample())) {
									found = true;
									break;
								}
							}
						}
					}
					if (!found) {
						experimentItemsToRemove.add(ex);
					}
				}
				for (Iterator i = experimentItemsToRemove.iterator(); i.hasNext();) {
					AnalysisExperimentItem ex = (AnalysisExperimentItem) i.next();
					sess.delete(ex);
					analysis.getExperimentItems().remove(ex);
				}
			}

			//
			// Save experiment items
			//
			TreeSet experimentItems = new TreeSet(new AnalysisExperimentItemComparator());
			if (hybParser != null) {
				for (Iterator i = hybParser.getIdHybridizations().iterator(); i.hasNext();) {
					Integer idHybridization = (Integer) i.next();
					AnalysisExperimentItem experimentItem = null;
					// The experiment item may already exist; if so, just
					// save it.
					for (Iterator i1 = analysis.getExperimentItems().iterator(); i1.hasNext();) {
						AnalysisExperimentItem x = (AnalysisExperimentItem) i1.next();
						if (x.getHybridization() != null && x.getIdHybridization().equals(idHybridization)) {
							experimentItem = x;
							break;
						}
					}
					if (experimentItem == null) {
						experimentItem = new AnalysisExperimentItem();
						experimentItem.setIdAnalysis(analysis.getIdAnalysis());
						experimentItem.setIdHybridization(idHybridization);
						experimentItem.setIdRequest(hybParser.getIdRequest(idHybridization));
					}
					experimentItems.add(experimentItem);
				}
			}
			if (laneParser != null) {
				addExperimentItem(laneParser, isLinkBySample,experimentItems,analysis);
			}
			if (sampleParser != null) {
				for (Iterator<Integer> i = sampleParser.getIdSamples().iterator(); i.hasNext();) {
					Integer idSample = i.next();
					AnalysisExperimentItem experimentItem = null;
					// The experiment item may already exist; if so, just
					// save it.
					for (Iterator i1 = analysis.getExperimentItems().iterator(); i1.hasNext();) {
						AnalysisExperimentItem x = (AnalysisExperimentItem) i1.next();
						if (x.getSample() != null && x.getIdSample().equals(idSample)) {
							experimentItem = x;
							break;
						}
					}
					if (experimentItem == null) {
						experimentItem = new AnalysisExperimentItem();
						experimentItem.setIdAnalysis(analysis.getIdAnalysis());
						experimentItem.setIdSample(idSample);
						experimentItem.setIdRequest(sampleParser.getIdRequest(idSample));
					}
					experimentItems.add(experimentItem);
				}
			}
			if (hybParser != null || laneParser != null || sampleParser != null) {
				analysis.setExperimentItems(experimentItems);
			}

			sess.flush();

			//
			// Save analysis files
			//
			if (!isNewAnalysisGroup) {
				if (analysisFileParser != null) {
					for (Iterator i = analysisFileParser.getAnalysisFileMap().keySet().iterator(); i.hasNext();) {
						String idAnalysisFileString = (String) i.next();
						AnalysisFile af = (AnalysisFile) analysisFileParser.getAnalysisFileMap().get(
								idAnalysisFileString);
						sess.save(af);
					}
				}
			}


			// Remove any data track files linked to analysis files
			if (analysisFileParser != null && analysisFileParser.getAnalysisFileToDeleteMap() != null) {
				removeDataTrackFiles(sess, null, analysis,
						analysisFileParser.getAnalysisFileToDeleteMap());
			}

			// Get rid of removed analysis files
			if (analysisFileParser != null) {
				String analysisBaseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null,
						PropertyDictionaryHelper.PROPERTY_ANALYSIS_DIRECTORY);
				String use_altstr = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.USE_ALT_REPOSITORY);
				if (use_altstr != null && use_altstr.equalsIgnoreCase("yes")) {
					analysisBaseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null,
							PropertyDictionaryHelper.ANALYSIS_DIRECTORY_ALT,username);
				}

				for (Iterator i = analysisFileParser.getAnalysisFileToDeleteMap().keySet().iterator(); i.hasNext();) {
					String idAnalysisFileString = (String) i.next();
					AnalysisFile af = (AnalysisFile) analysisFileParser.getAnalysisFileToDeleteMap().get(
							idAnalysisFileString);

					// Only delete from db if it was already present.
					if (!idAnalysisFileString.startsWith("AnalysisFile") && !idAnalysisFileString.equals("")) {
						analysis.getFiles().remove(af);
					}

					sess.flush();

				}
				sess.flush();
			}

			// Delete any collaborators that were removed
			if (collaboratorParser != null) {
				for (Iterator i1 = analysis.getCollaborators().iterator(); i1.hasNext();) {
					AnalysisCollaborator ac = (AnalysisCollaborator) i1.next();
					if (!collaboratorParser.getCollaboratorUploadMap().containsKey(ac.getIdAppUser())) {
						sess.delete(ac);
					}
				}
			}

			// Add/update collaborators
			if (collaboratorParser != null) {
				for (Iterator i = collaboratorParser.getCollaboratorUploadMap().keySet().iterator(); i.hasNext();) {
					Integer idAppUser = (Integer) i.next();
					String canUploadData = (String) collaboratorParser.getCollaboratorUploadMap().get(idAppUser);
					String canUpdate = (String) collaboratorParser.getCollaboratorUpdateMap().get(idAppUser);

					// TODO (performance): Would be better if app user was
					// cached.
					AnalysisCollaborator collaborator = (AnalysisCollaborator) sess.createQuery(
							"SELECT ac from AnalysisCollaborator ac where idAnalysis = " + analysis.getIdAnalysis() + " and idAppUser = " + idAppUser).uniqueResult();

					// If the collaborator doesn't exist, create it.
					if (collaborator == null) {
						collaborator = new AnalysisCollaborator();
						collaborator.setIdAppUser(idAppUser);
						collaborator.setIdAnalysis(analysis.getIdAnalysis());
						collaborator.setCanUploadData(canUploadData);
						collaborator.setCanUpdate(canUpdate);
						sess.save(collaborator);
					} else {
						// If the collaborator does exist, just update the
						// upload permission flag.
						collaborator.setCanUploadData(canUploadData);
						collaborator.setCanUpdate(canUpdate);
					}
				}
				sess.flush();
			}

			//
			// Save genomeBuilds
			//
			if (genomeBuildParser != null) {
				Set genomeBuilds = new TreeSet();
				for (Iterator i = genomeBuildParser.getIdGenomeBuildList().iterator(); i.hasNext();) {
					Integer idGenomeBuild = (Integer) i.next();

					GenomeBuild genomeBuild = (GenomeBuild) sess.load(GenomeBuild.class, idGenomeBuild);
					genomeBuilds.add(genomeBuild);
				}
				analysis.setGenomeBuilds(genomeBuilds);
			}

			sess.flush();

			//
			// Save properties
			//
//			this.saveAnalysisProperties(sess, analysis);

			String state = Notification.EXISTING_STATE;
			if (isNewAnalysis) {
				state = Notification.NEW_STATE;
			}

			// Create the analysis directory
			String baseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null,
					PropertyDictionaryHelper.PROPERTY_ANALYSIS_DIRECTORY);

			String use_altstr = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.USE_ALT_REPOSITORY);
			if (use_altstr != null && use_altstr.equalsIgnoreCase("yes")) {
				baseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null,
						PropertyDictionaryHelper.ANALYSIS_DIRECTORY_ALT,username);
			}
			String analysisDir = getAnalysisDirectory(baseDir, analysis);
			File ad = new File(analysisDir);
			if (!ad.exists()) {
				ad.mkdirs();
				FileUtil.chmod ("770",analysisDir);
			}

			String filePathInfo = "";
			if (isBatchMode) {
				filePathInfo = " filePath=\"" + analysisDir + "\"";
			}

			fixAnalysisGroupItem (theIdAnalysis,theIdAnalysisGroup);
			this.xmlResult = "<SUCCESS idAnalysis=\"" + analysis.getIdAnalysis() + "\"" + " idAnalysisGroup=\""
					+ theIdAnalysisGroup + "\"" + filePathInfo + "/>";

			out.println (xmlResult);

		if(isLinkBySample){
//			System.out.print("[SaveAnalysis]: The newly save analysis id: " + analysis.getIdAnalysis());
			saveAnalyisIDToFile(analysisIDFile,analysis);
		}

		app.disconnect();
		exit(0);

	} catch (Exception e) {

		String msg = "Could not create analysis, error:  " + e.toString() + "\n";
		out.println(msg);

		StackTraceElement[] stack = e.getStackTrace();
		for (StackTraceElement s : stack) {
			msg = msg + s.toString() + "\n\t\t";
		}

		out.println(msg);

	}

	out.println("Exiting with errors...");
	exit(2);

}  // end of run

	private void initialize() throws Exception {
		PropertyDictionaryHelper ph = PropertyDictionaryHelper.getInstance(sess);

		gnomexSupportEmail = ph.getQualifiedProperty(PropertyDictionary.GNOMEX_SUPPORT_EMAIL, serverName);
		if (gnomexSupportEmail == null) {
			gnomexSupportEmail = ph.getQualifiedProperty(PropertyDictionary.CONTACT_EMAIL_SOFTWARE_TESTER, serverName);
		}
		this.fromEmailAddress = ph.getProperty(PropertyDictionary.GENERIC_NO_REPLY_EMAIL);

	}


	public void fixAnalysisGroupItem (int idAnalysis, int idAnalysisGroup) {
		try {

			Statement stmt = null;
			ResultSet rs = null;

			SessionImpl sessionImpl = (SessionImpl) sess;
			Connection con = sessionImpl.connection();

			stmt = con.createStatement();

			StringBuffer buf = new StringBuffer("insert into AnalysisGroupItem values (" + idAnalysisGroup + "," + idAnalysis + ")" );
//			System.out.println("fixAnalysisGroupItem: " + buf.toString());
			int ok = stmt.executeUpdate(buf.toString());
			stmt.close();
		} catch (Exception ex) {
//            LOG.error("Error querying associate table.", ex);
//            System.out.println("Error querying associate table. " + ex);
		}


	}
	private class AnalysisGroupComparator implements Comparator, Serializable {
		public int compare(Object o1, Object o2) {
			AnalysisGroup ag1 = (AnalysisGroup) o1;
			AnalysisGroup ag2 = (AnalysisGroup) o2;

			return ag1.getIdAnalysisGroup().compareTo(ag2.getIdAnalysisGroup());

		}
	}

	private class AnalysisExperimentItemComparator implements Comparator, Serializable {
		public int compare(Object o1, Object o2) {
			AnalysisExperimentItem e1 = (AnalysisExperimentItem) o1;
			AnalysisExperimentItem e2 = (AnalysisExperimentItem) o2;

			String key1 = determineKey(e1);
			String key2 = determineKey(e2);

			return key1.compareTo(key2);
		}
		private String determineKey(AnalysisExperimentItem item) {
			if (item.getIdHybridization() != null) {
				return "hyb" + item.getIdHybridization();
			} else if (item.getIdSequenceLane() != null) {
				return "lane" + item.getIdSequenceLane();
			} else if (item.getIdSample() != null) {
				return "sample" + item.getIdSample();
			} else {
				return "";
			}
		}
	}

	private void saveAnalyisIDToFile(String analysisIDFile, Analysis a) {
		PrintWriter pw = null;
		try {

			pw = new PrintWriter(new FileOutputStream(new File(analysisIDFile), true));
			pw.write( a.getIdAnalysis() + " ");


		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} finally {
			pw.close();
		}

	}

	private void addExperimentItem(AnalysisLaneParser laneParser, boolean isLinkBySample, TreeSet experimentItems, Analysis analysis) {
		List linkerList = null;

		if(isLinkBySample){
			linkerList = laneParser.getIdSamples();
		}else{
			linkerList = laneParser.getIdSequenceLanes();
		}

		for (Iterator i = linkerList.iterator(); i.hasNext();) {
			Integer id = (Integer) i.next();
			AnalysisExperimentItem experimentItem = null;
			// The experiment item may already exist; if so, just
			// save it.
			for (Iterator i1 = analysis.getExperimentItems().iterator(); i1.hasNext();) {
				AnalysisExperimentItem x = (AnalysisExperimentItem) i1.next();
				if(isLinkBySample){
					if (x.getIdSample() != null && x.getIdSample().equals(id)) {
						experimentItem = x;
						break;
					}
				}else{
					if (x.getIdSequenceLane() != null && x.getIdSequenceLane().equals(id)) {
						experimentItem = x;
						break;
					}
				}

			}
			if (experimentItem == null) {
				experimentItem = new AnalysisExperimentItem();
				if(isLinkBySample){
					experimentItem.setIdAnalysis(analysis.getIdAnalysis());
					experimentItem.setIdSample(id);
					experimentItem.setIdRequest(laneParser.getIdRequest(id));
				}else{
					experimentItem.setIdAnalysis(analysis.getIdAnalysis());
					experimentItem.setIdSequenceLane(id);
					experimentItem.setIdRequest(laneParser.getIdRequest(id));

				}
			}
			experimentItems.add(experimentItem);
		}

	}

	public void setVisibility(Session sess, Analysis analysis) {
		if (visibility != null && visibility.length() > 0) {
			analysis.setCodeVisibility(visibility);
			analysis.setIdInstitution(idInstitution);

			if (visibility.compareTo(Visibility.VISIBLE_TO_INSTITUTION_MEMBERS) == 0) {
				if (analysis.getIdLab() != null) {
					Lab lab = (Lab) sess.load(Lab.class, analysis.getIdLab());
					if (!lab.validateVisibilityInLab(analysis)) {
						out.println ("You must select an institution when visiblity is Institution");
						exit(2);
					}
				} else {
					out.println ("Analysis must be associated with a lab");
					exit(2);
				}
			}
		} else {
			analysis.setCodeVisibility(Visibility.VISIBLE_TO_GROUP_MEMBERS);
		}
	}

	public String removeDataTrackFiles(Session sess, String whatever, Analysis a, Map filesToDeleteMap) {

		// No analysis files to delete
		if (filesToDeleteMap != null) {
			if (filesToDeleteMap.size() == 0) {
				return null;
			}
		} else {
			if (a.getFiles().size() == 0) {
				return null;
			}
		}

		// DataTrack and DataTrackFile query
		StringBuffer queryBuf = new StringBuffer();
		int inCount = 0;
		queryBuf.append("SELECT distinct dt FROM DataTrack dt ");
		queryBuf.append("JOIN dt.dataTrackFiles dtf ");
		queryBuf.append("WHERE dtf.idAnalysisFile IN (");
		boolean firstTime = true;

		// Get all the AnalysisFile id's from the filesToDeleteMap
		if (filesToDeleteMap != null) {
			for (Iterator i1 = filesToDeleteMap.keySet().iterator(); i1.hasNext();) {
				String idAnalysisFile = (String) i1.next();
				// Analysis files that are on the file system but not yet saved
				// should
				// be ignored.
				if (idAnalysisFile == null ||  idAnalysisFile.startsWith("AnalysisFile") || idAnalysisFile.equals("0")) {
					continue;
				}else if(idAnalysisFile.equals("")){
					continue;
				}

				inCount++;
				if (!firstTime) {
					queryBuf.append(",");
				}
				queryBuf.append(idAnalysisFile);
				firstTime = false;
			}
			if (inCount == 0) {
				return null;
			}
			queryBuf.append(")");
		} else {
			for (Iterator i = a.getFiles().iterator(); i.hasNext();) {
				AnalysisFile af = (AnalysisFile) i.next();
				queryBuf.append(af.getIdAnalysisFile());
				inCount++;
				if (i.hasNext()) {
					queryBuf.append(",");
				}
			}
			queryBuf.append(")");
		}

		// Run the Query
		List dataTracksToUnlink = sess.createQuery(queryBuf.toString()).list();

		// Delete the DataTrackFiles and DataTracks
		for (Iterator i = dataTracksToUnlink.iterator(); i.hasNext();) {
			DataTrack dt = (DataTrack) i.next();

			for (DataTrackFolder folder : (Set<DataTrackFolder>) dt.getFolders()) {
				String path = folder.getQualifiedTypeName();
				if (path.length() > 0) {
					path += Constants.FILE_SEPARATOR;
				}
				String typeName = path + dt.getName();

				UnloadDataTrack unload = new UnloadDataTrack();
				unload.setTypeName(typeName);
				unload.setIdAppUser(this.getIdAppUser(username));
				unload.setIdGenomeBuild(dt.getIdGenomeBuild());

				sess.save(unload);
			}

			//
			// Delete the files
			//
			for (DataTrackFile dtFile : (Set<DataTrackFile>) dt.getDataTrackFiles()) {
				sess.delete(dtFile);
			}
			sess.flush();
			dt.setDataTrackFiles(null);

			sess.flush();

			//
			// Delete (unlink) collaborators
			//
			dt.setCollaborators(null);

			//
			// Remove all data track files from Data Track
			//
			dt.setDataPath(null);

			sess.flush();

			// delete database object
			sess.delete(dt);

			sess.flush();
		}
		return "All data track files associated with this analysis have been deleted.";
	}

	public int getIdAppUser (String user) {
		return 18;
/*
		StringBuffer buf = new StringBuffer("SELECT ap from AppUser ap where ap.lastName = 'batch' and ap.firstname = 'admin'");
		AppUser appuser = (AppUser) sess.createQuery(buf.toString()).uniqueResult();
		if (appuser == null) {
			out.println ("Lab " + labName + " not found in gnomex db");
			exit(2);
		}

		return appuser.getIdAppUser();
*/
	}

	private void getLab(Session sess) throws Exception {
		String lastName = null;
		String firstName = null;
		String[] tokens = labName.split(", ");
		if (tokens != null && tokens.length == 2) {
			lastName = tokens[0];
			firstName = tokens[1];
		} else {
			tokens = labName.split(" ");
			if (tokens != null && tokens.length == 2) {
				firstName = tokens[0];
				lastName = tokens[1];
			} else if (tokens != null && tokens.length == 1) {
				lastName = tokens[0];
			} else {
				lastName = labName;
			}
		}

		if (firstName == null && lastName == null) {
			out.println ("Lab name not provided or does not parse correctly: " + labName);
			exit(2);
		}

		StringBuffer buf = new StringBuffer("SELECT l from Lab l where l.lastName = '" + lastName + "'");
		if (firstName != null) {
			buf.append(" AND l.firstName = '" + firstName + "'");
		}
		Lab lab = (Lab) sess.createQuery(buf.toString()).uniqueResult();
		if (lab == null) {
			out.println ("Lab " + labName + " not found in gnomex db");
			exit(2);
		}
		analysisScreen.setIdLab(lab.getIdLab());
		theIdLab = lab.getIdLab();

	}

	private void getAnalysisType(Session sess) throws Exception {
		if (analysisType == null || analysisType.equals("")) {
			out.println ("Analysis type not provided");
			exit(2);
		}

		StringBuffer buf = new StringBuffer("SELECT at from AnalysisType at where at.analysisType = '" + analysisType + "'");
		AnalysisType at = (AnalysisType) sess.createQuery(buf.toString()).uniqueResult();
		if (at == null) {
			out.println ("Analysis type " + analysisType + " not found in gnomex db");
			exit(2);
		}
		analysisScreen.setIdAnalysisType(at.getIdAnalysisType());

	}

	private void getGenomeBuilds(Session sess) throws Exception {
		if (this.isBatchMode) {
			if (genomeBuild == null || genomeBuild.equals("")) {
				out.println ("genomeBuild not provided");
				exit(2);
			}

			StringBuffer buf = new StringBuffer("SELECT gb from GenomeBuild gb where gb.genomeBuildName like '%"
					+ genomeBuild + "%'");
			GenomeBuild gb = (GenomeBuild) sess.createQuery(buf.toString()).uniqueResult();
			if (gb == null) {
				out.println ("Genome build " + genomeBuild + " not found in gnomex db");
				exit(2);
			}
			Set genomeBuilds = new TreeSet();
			genomeBuilds.add(gb);
			analysisScreen.setGenomeBuilds(genomeBuilds);
		}
	}

	private void getOrganism(Session sess) throws Exception {
		if (organism == null || organism.equals("")) {
			out.println ("organism not provided");
			exit(2);
		}

		StringBuffer buf = new StringBuffer("SELECT o from Organism o where o.organism = '" + organism + "'");
		Organism o = (Organism) sess.createQuery(buf.toString()).uniqueResult();
		if (o == null) {
			out.println ("Organism " + organism + " not found in gnomex db");
			exit(2);
		}
		analysisScreen.setIdOrganism(o.getIdOrganism());
	}

	private void getExistingAnalysisGroup(Session sess) throws Exception {
		if (newAnalysisGroupName == null || newAnalysisGroupName.equals("")) {
			out.println ("analysis group name not provided");
			exit(2);
		}

		StringBuffer buf = new StringBuffer("SELECT ag from AnalysisGroup ag where ag.name = '" + newAnalysisGroupName
				+ "' and ag.idLab = " + theIdLab);
//		System.out.println ("buf: " + buf.toString());

		List results = sess.createQuery(buf.toString()).list();
		if (results.size() > 0) {
			existingAnalysisGroup = (AnalysisGroup) results.get(0);
//			System.out.println ("existingAnalysisGroup " + existingAnalysisGroup.getName());
			isNewAnalysisGroup = false;
			theIdAnalysisGroup = existingAnalysisGroup.getIdAnalysisGroup();
		} else {
			existingAnalysisGroup = null;
		}
	}

	private void initializeAnalysis(Session sess, Analysis analysis) throws Exception {
		analysis.setName(RequestParser.unEscape(analysisScreen.getName()));
		analysis.setDescription(analysisScreen.getDescription());
		analysis.setIdLab(analysisScreen.getIdLab());
		analysis.setIdAnalysisProtocol(analysisScreen.getIdAnalysisProtocol());
		analysis.setIdAnalysisType(analysisScreen.getIdAnalysisType());
		analysis.setIdOrganism(analysisScreen.getIdOrganism());
		// Note visibility and institution set earlier.
		analysis.setPrivacyExpirationDate(analysisScreen.getPrivacyExpirationDate());
		analysis.setIdAppUser(analysisScreen.getIdAppUser());
	}

	public String getAnalysisDirectory(String baseDir, Analysis analysis) {
		SimpleDateFormat formatter = new SimpleDateFormat("yyyy");
		String createYear = formatter.format(analysis.getCreateDate());

		if (!baseDir.endsWith(Constants.FILE_SEPARATOR) && !baseDir.endsWith("\\")) {
			baseDir += Constants.FILE_SEPARATOR;
		}

		String directoryName = baseDir + createYear + Constants.FILE_SEPARATOR + analysis.getNumber();
		return directoryName;
	}


	private String getCurrentDateString() {
		runDate = Calendar.getInstance();
		return new SimpleDateFormat("MM-dd-yyyy_HH:mm:ss").format(runDate.getTime());

	}

	private java.sql.Date getEffectiveAnalysisFileCreateDate(FileDescriptor fd, java.util.Date analysisCreateDate) {
		java.sql.Date createDate = new java.sql.Date(runDate.getTime().getTime());

		return createDate;
	}



	private void printDebugStatement(String message) {
		if (debug) {
			out.println(message);
		}
	}


	private void connect() throws Exception {
		sess = dataSource.connect();
		if (sess == null) {
			out.println("[CreateAnalysis] ERROR: Unable to acquire session. Exiting...");
			exit(1);
		}
	}

	private void disconnect() throws Exception {
		if (sess == null) {
			return;
		}

		sess.close();
	}

// Bypassed dtd validation when reading data sources.
public class DummyEntityRes implements EntityResolver {
	public InputSource resolveEntity(String publicId, String systemId) throws SAXException, IOException {
		return new InputSource(new StringReader(" "));
	}

}


public class AnalysisFileInfo {
	public String analysisNumber;
	public String analysisFileName;
	public String dataTrackNumber;
	public String comment;

	public AnalysisFileInfo(String analysisNumber, String analysisFileName, DataTrack dataTrack, String comment) {
		super();
		this.analysisNumber = analysisNumber;
		this.analysisFileName = analysisFileName;
		this.dataTrackNumber = dataTrack != null ? dataTrack.getNumber() : "";
		this.comment = comment;
	}

}

	private void destroyFolder(File igvLinkDir) throws Exception {
		File[] directoryList = igvLinkDir.listFiles();

		for (File directory : directoryList) {
			delete(directory);
		}
	}

	private void delete(File f) throws IOException {
		if (f.isDirectory()) {
			for (File c : f.listFiles())
				delete(c);
		}
		if (!f.delete())
			throw new FileNotFoundException("Failed to delete file: " + f);
	}

}
