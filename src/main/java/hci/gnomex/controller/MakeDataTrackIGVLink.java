package hci.gnomex.controller;

import hci.framework.control.RollBackCommandException;
import hci.gnomex.constants.Constants;
import hci.gnomex.model.*;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.DataTrackUtil;
import hci.gnomex.utility.HibernateSession;
import hci.gnomex.utility.PropertyDictionaryHelper;
import hci.gnomex.utility.Util;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.query.Query;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonWriter;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Edited 1/15/2013 Mosbruger
 *
 *
 * /**Used for making html url links formatted for IGV and softlinked to GNomEx files.
 */
public class MakeDataTrackIGVLink extends HttpServlet {
private static final long serialVersionUID = 1L;
private static Logger LOG = Logger.getLogger(MakeDataTrackIGVLink.class);

public static final Pattern TO_STRIP = Pattern.compile("\\n");

public void validate() {
}

protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
	LOG.error("Post not implemented");
}

protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {

	String serverName = req.getServerName();
	Session sess = null;
	String username = "";
	try {
		sess = HibernateSession.currentSession((req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest"));

		// Get the dictionary helper
		// DictionaryHelper dh = DictionaryHelper.getInstance(sess);

		username = (req.getUserPrincipal() != null ? req.getUserPrincipal().getName() : "guest");

		// Get security advisor
		SecurityAdvisor secAdvisor = (SecurityAdvisor) req.getSession().getAttribute(SecurityAdvisor.SECURITY_ADVISOR_SESSION_KEY);
		if (secAdvisor == null) {
			System.out
					.println("MakeDataTrackIGVLink:  Warning - unable to find existing session. Creating security advisor.");
			secAdvisor = SecurityAdvisor.create(sess, username);
		}

		execute(res, serverName, secAdvisor, sess, username);
	} catch (Exception ex) {
		String errorMessage = Util.GNLOG(LOG,"MakeDataTrackIGVLink -- Unhandled exception ", ex);
		StringBuilder requestDump = Util.printRequest(req);

		PropertyDictionaryHelper propertyHelper = PropertyDictionaryHelper.getInstance(HibernateSession.currentSession());
		String gnomex_tester_email = propertyHelper.getProperty(PropertyDictionary.CONTACT_EMAIL_SOFTWARE_TESTER);

		Util.sendErrorReport(HibernateSession.currentSession(),gnomex_tester_email, "DoNotReply@hci.utah.edu", username, errorMessage, requestDump);

		HibernateSession.rollback();
	} finally {
		if (sess != null) {
			try {
				HibernateSession.closeSession();
			} catch (Exception ex1) {
			}
		}
	}
}

private String linkContents(String path, DataTrackFolder folder, int depth, Session sess, String baseDir, String baseURL, String analysisBaseDir, SecurityAdvisor secAdvisor, ArrayList<String[]> linksToMake) throws Exception {
	// Create prefix for indentation
	StringBuilder prefix = new StringBuilder("");
	for (int i = 0; i < depth; i++) {
		prefix.append("\t");
	}

	path += Constants.FILE_SEPARATOR + DataTrackUtil.stripBadURLChars(folder.getName(), "_");

	// Create StringBuilder
	StringBuilder xmlResult = new StringBuilder("");

	boolean toWrite = false;

	// Print out data within the folder
	StringBuilder dataTrackResult = new StringBuilder("");
	List<String> dtr = new ArrayList<String>();

	ArrayList<DataTrack> dts = new ArrayList<DataTrack>(folder.getDataTracks());
	for (DataTrack dt : dts) {
		// If one of the datatracks is readable by the user, create folder and links

		if (secAdvisor.canRead(dt)) {
			File dir = new File(path);
			dir.mkdirs();

			String trackResults = makeIGVLink(sess, dt, path, prefix, baseDir, baseURL, analysisBaseDir, linksToMake);
			if (!trackResults.equals("")) {
				dtr.add(trackResults);
				// dataTrackResult.append(trackResults);
				toWrite = true;
			}
		}

	}

	// sort it
	if (toWrite) {
		Collections.sort(dtr, new MyComp());
		for (String s : dtr) {
			dataTrackResult.append(s);
		}
	}

	// Recursively call printContents in subfolders
	ArrayList<DataTrackFolder> dtfs = new ArrayList<DataTrackFolder>(folder.getFolders());
	StringBuilder dataFolderResult = new StringBuilder("");
	for (DataTrackFolder dtf : dtfs) {
		String result = linkContents(path, dtf, depth + 1, sess, baseDir, baseURL, analysisBaseDir, secAdvisor, linksToMake);
		if (!result.equals("")) {
			dataFolderResult.append(result);
			toWrite = true;
		}
	}

	if (toWrite) {
		xmlResult.append(prefix + "<Category name=\"" + folder.getName() + "\">\n");
		xmlResult.append(dataTrackResult);
		xmlResult.append(dataFolderResult);
		xmlResult.append(prefix + "</Category>\n");
	}

	return xmlResult.toString();

}

public void execute(HttpServletResponse res, String serverName, SecurityAdvisor secAdvisor, Session sess, String username) throws RollBackCommandException, IOException {
	try {
		String baseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null,
				PropertyDictionaryHelper.PROPERTY_DATATRACK_DIRECTORY);
		System.out.println ("[MakeDataTrackIGVLink] (1) baseDir: " + baseDir);
		String analysisBaseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null,
				PropertyDictionaryHelper.PROPERTY_ANALYSIS_DIRECTORY);
		System.out.println ("[MakeDataTrackIGVLink] analysisBaseDir: " + analysisBaseDir);
		String use_altstr = PropertyDictionaryHelper.getInstance(sess).getProperty(PropertyDictionary.USE_ALT_REPOSITORY);
		if (use_altstr != null && use_altstr.equalsIgnoreCase("yes")) {
			analysisBaseDir = PropertyDictionaryHelper.getInstance(sess).getDirectory(serverName, null,
					PropertyDictionaryHelper.ANALYSIS_DIRECTORY_ALT,username);
			System.out.println ("[MakeDataTrackIGVLink] ALTERNATE analysisBaseDir: " + analysisBaseDir);
		}

		String dataTrackFileServerURL = PropertyDictionaryHelper.getInstance(sess).getProperty(
				PropertyDictionary.DATATRACK_FILESERVER_URL);
		System.out.println ("[MakeDataTrackIGVLink] dataTrackFileServerURL: " + dataTrackFileServerURL);
		String dataTrackFileServerWebContext = PropertyDictionaryHelper.getInstance(sess).getProperty(
				PropertyDictionary.DATATRACK_FILESERVER_WEB_CONTEXT);
		System.out.println ("[MakeDataTrackIGVLink] dataTrackFileServerWebContext: " + dataTrackFileServerWebContext);

		// We have to serve files from Tomcat, so use das2 base url
		String baseURL = dataTrackFileServerURL + Constants.FILE_SEPARATOR;
		System.out.println ("[MakeDataTrackIGVLink] baseURL: " + baseURL);
		// If the user already has a directory, get the existing name and destroy everything beneath it. This way,
		// existing path still work. This will be nice if we set up a cron job that automatically populates these directories
		// If the user doesn't have a directory, a new random string will be created.
		File linkDir = checkIGVLinkDirectory(baseDir, dataTrackFileServerWebContext);
		String linkPath = this.checkForIGVUserFolderExistence(linkDir, username);
//		System.out.println ("[MakeDataTrackIGVLink] linkPath: " + linkPath);
		if (linkPath == null) {
			linkPath = UUID.randomUUID().toString() + username;
//			System.out.println ("[MakeDataTrackIGVLink] (2) linkPath: " + linkPath);
		}

		// Create the users' data directory
		File dir = new File(linkDir.getAbsoluteFile(), linkPath);
		dir.mkdir();
		String rootPath = dir.getAbsolutePath().replace("\\", Constants.FILE_SEPARATOR); // Path via server
		System.out.println ("[MakeDataTrackIGVLink] rootPath: " + rootPath);
		String htmlPath = dataTrackFileServerURL + Constants.IGV_LINK_DIR_NAME + Constants.FILE_SEPARATOR + linkPath + Constants.FILE_SEPARATOR; // Path wia web
		System.out.println ("[MakeDataTrackIGVLink] htmlPath: " + htmlPath);
		// Clear out links to make
		ArrayList<String[]> linksToMake = new ArrayList<String[]>();

		/*****************************************************************
		 * Grab the list of available genomes. Check if the user has data for the genome and if the genome is supported by IGV.
		 * If so, create a repository for
		 * the local data and add to Broad repository
		 */

		// Grab the list of available GNomEx genomes
		boolean permissionForAny = false; // If the user own something, report IGV Link
		String queryString = "SELECT idGenomeBuild from GenomeBuild where igvName is not null";
		Query query = sess.createQuery(queryString);
		List<Integer> genomeIndexList = query.list();

		for (Iterator<Integer> i = genomeIndexList.iterator(); i.hasNext();) {
			// Grab genome build, check if data exists and if IGV supports it. If no data or no IGV support, skip to next genome
			Integer gnIdx = i.next();
			GenomeBuild gb = GenomeBuild.class.cast(sess.load(GenomeBuild.class, gnIdx));
			String igvGenomeBuildName = gb.getIgvName();
			ArrayList<DataTrackFolder> dataTrackFolders = new ArrayList<DataTrackFolder>(gb.getDataTrackFolders());
			if (dataTrackFolders.size() == 0 || igvGenomeBuildName == null) {
				continue;
			}

			// Find the root folder of Genome. Should be the one with the UCSC identifier.
			DataTrackFolder rootFolder = null;
			boolean found = false;
			for (DataTrackFolder folder : dataTrackFolders) {
				if (folder.getIdParentDataTrackFolder() == null) {
					if (found) {
						LOG.error("MakeDataTrackIGVLink -- Found two parental folders???? " + gb.getGenomeBuildName());
					} else {
						rootFolder = folder;
						found = true;
					}
				}
			}
			if (!found) {
				LOG.error("MakeDataTrackIGVLink -- Found no parental folders???? " + gb.getGenomeBuildName());
			} else {

				// Create data repository
				String result = this.linkContents(rootPath, rootFolder, 1, sess, baseURL, baseDir, analysisBaseDir, secAdvisor, linksToMake);
				String shortresult = result;
				if (shortresult.length() > 600) {
					shortresult = shortresult.substring(0,600);
				}
//				System.out.println ("[MakeDataTrackIGVLink] result(short): " + shortresult);

				// If there was a result, create the repository file and add to registry.
				if (!result.equals("")) {
					// Write registry file
					File registry = new File(dir, "igv_registry_" + igvGenomeBuildName + ".txt");

					// add any data sets available from the broad institute to our local registry
					StringBuilder broadAnnData = new StringBuilder("");
					String theURL = "http://data.broadinstitute.org/igvdata/" + igvGenomeBuildName
							+ "_dataServerRegistry.txt";
					URL broad = new URL(theURL);
					try {
						BufferedReader br2 = new BufferedReader(new InputStreamReader(broad.openStream()));
						String line2;
						while ((line2 = br2.readLine()) != null) {
							if (line2.startsWith("http")) {
								broadAnnData.append(line2 + "\n");
							}
						}
						br2.close();

						if (broadAnnData.length() > 0) {
							BufferedWriter bw2 = new BufferedWriter(new FileWriter(registry));
							bw2.write(broadAnnData.toString());
							bw2.close();
						}
					} catch (IOException ex) {
						LOG.error("MakeDataTrackIGVLink -- Could not read from the Broad repository file: " + theURL);
					}

					BufferedWriter br = new BufferedWriter(new FileWriter(registry, true));
					br.write(htmlPath + igvGenomeBuildName + "_dataset.xml\n");
					br.close();

					// Create repository
					StringBuilder dataSetContents = new StringBuilder("");
					dataSetContents.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
					dataSetContents.append("<Global name=\"" + username + "\" version=\"1\">\n");
					dataSetContents.append(result);
					dataSetContents.append("</Global>\n");
					File xmlFile = new File(dir, igvGenomeBuildName + "_dataset.xml");
					br = new BufferedWriter(new FileWriter(xmlFile));
					br.write(dataSetContents.toString());
					br.close();

					// signal results
					permissionForAny = true;
				} // end if results
			} // end if_else data tracks found
		} // end for each genome

		secAdvisor.closeHibernateSession();

		// If the user has permission for any data track, give the the repository link
		if (permissionForAny) {
			boolean success = this.makeSoftLink(dir.toString(), linksToMake); // deal with embedded spaces

//			boolean success = this.makeSoftLinkViaUNIXCommandLine(dir.toString(), linksToMake); // deal with embedded spaces

			if (success) {
				String preamble = new String(
						"Launch IGV and replace the default Data Registry URL (View->Preferences->Advanced) with the following link: \n\n");

				StringBuilder sbo = new StringBuilder(preamble + htmlPath + "igv_registry_$$.txt");
				JsonObject value = Json.createObjectBuilder()
						.add("result", "SUCCESS")
						.add("igvURL", sbo.toString())
						.build();
				JsonWriter jsonWriter = Json.createWriter(res.getOutputStream());

				res.setContentType("application/json; charset=UTF-8");
				jsonWriter.writeObject(value);
				jsonWriter.close();

			} else {

				throw new Exception("Could not create IGV Links");
			}
		} else {
			throw new Exception("No data tracks associated with this user!");
		}

	} catch (Exception e) {
		LOG.error("An exception has occurred in MakeDataTrackIGVLinks ", e);

		JsonObject value = Json.createObjectBuilder()
				.add("result", "INVALID")
				.add("message", e.getMessage())
				.build();

		JsonWriter jsonWriter = Json.createWriter(res.getOutputStream());

		res.setContentType("application/json; charset=UTF-8");
		jsonWriter.writeObject(value);
		jsonWriter.close();




		throw new RollBackCommandException(e.getMessage());
	}
}

private String checkForIGVUserFolderExistence(File igvLinkDir, String username) throws Exception {
	File[] directoryList = igvLinkDir.listFiles();

	String desiredDirectory = null;

	if (directoryList != null) {
		for (File directory : directoryList) {
			if (directory.getName().length() > 36) {
				String parsedUsername = directory.getName().substring(36);
				if (parsedUsername.equals(username)) {
					desiredDirectory = directory.getName();
					delete(directory);
				}
			}
		}
	}

	return desiredDirectory;

}

private void delete(File f) throws IOException {
	if (f.isDirectory()) {
		for (File c : f.listFiles())
			delete(c);
	}
	if (!f.delete())
		throw new FileNotFoundException("Failed to delete file: " + f);
}

private File checkIGVLinkDirectory(String baseURL, String webContextPath) throws Exception {
	System.out.println ("[checkIGVLinkDirectory] baserURL " + baseURL + " webConextPath: " + webContextPath );
	File igvLinkDir = new File(webContextPath, Constants.IGV_LINK_DIR_NAME);
	igvLinkDir.mkdirs();
	if (igvLinkDir.exists() == false)
		throw new Exception(
				"\nFailed to find and or make a directory to contain url softlinks for IGV data distribution.\n");

	// add redirect index.html if not present, send them to genopub
	File redirect = new File(igvLinkDir, "index.html");
	if (redirect.exists() == false) {
		String toWrite = "<html> <head> <META HTTP-EQUIV=\"Refresh\" Content=\"0; URL=" + baseURL
				+ "genopub\"> </head> <body>Access denied.</body>";
		PrintWriter out = new PrintWriter(new FileWriter(redirect));
		out.println(toWrite);
		out.close();
	}

	System.out.println ("[checkIGVLinkDirectory] " +igvLinkDir );
	return igvLinkDir;
}

private String makeIGVLink(Session sess, DataTrack dataTrack, String directory, StringBuilder prefix, String baseDir, String baseURL, String analysisBaseDir, ArrayList<String[]> linksToMake) throws Exception {
	StringBuilder sb = new StringBuilder("");
	try {

		List<File> dataTrackFiles = dataTrack.getFiles(baseDir, analysisBaseDir);

		// disallow AUTOCONVERT!!!!
		UCSCLinkFiles link;
		link = DataTrackUtil.fetchUCSCLinkFiles(dataTrackFiles, GNomExFrontController.getWebContextPath(), false);

		// 'link' will be null if the user can read the track, doesn't own the track and the bw has not yet been created.
		if (link != null) {
			// check if dataTrack has exportable file type (xxx.bam, xxx.bai, xxx.bw, xxx.bb, xxx.vcf.gz, xxx.vcf.gz.tbi, xxx.useq (will be converted if
			// autoConvert is true))
			// UCSCLinkFiles link = DataTrackUtil.fetchUCSCLinkFiles(dataTrackFiles, GNomExFrontController.getWebContextPath());
			File[] filesToLink = link.getFilesToLink();
			if (filesToLink == null)
				throw new Exception("No files to link?!");

			// When new .bw/.bb files are created, add analysis files and then link via data
			// track file to the data track.
			MakeDataTrackUCSCLinks.registerDataTrackFiles(sess, analysisBaseDir, dataTrack, filesToLink);

			// for each file, there might be two for xxx.bam and xxx.bai files, vcf files, possibly two for converted useq files, plus/minus strands,
			// otherwise just one.
			ArrayList<String> names = new ArrayList<String>();
			ArrayList<String> fileURLs = new ArrayList<String>();
			for (File f : filesToLink) {

				File annoFile = new File(directory, DataTrackUtil.stripBadURLChars(f.getName(), "_"));
				String annoString = annoFile.toString().replace("\\", Constants.FILE_SEPARATOR);

				// We are now storing the links and creating them in a batch.
				String[] links = { f.toString(), annoString };
				linksToMake.add(links);

				// is it a bam index xxx.bai? If so then skip AFTER making soft link.
				if (annoString.endsWith(".bai") || annoString.endsWith(".vcf.gz.tbi"))
					continue;

				// stranded?
				String strand = "";
				if (link.isStranded()) {
					if (annoString.endsWith("_Plus.bw"))
						strand = " + ";
					else if (annoString.endsWith("_Minus.bw"))
						strand = " - ";
					else
						throw new Exception("\nCan't determine strand of bw file? " + annoString);
				}

				// dataset name
				String datasetName = dataTrack.getName() + strand + " " + dataTrack.getFileName();
				names.add(datasetName);

				// make bigData URL e.g. bigDataUrl=http://genome.ucsc.edu/goldenPath/help/examples/bigBedExample.bb
				int index = annoString.indexOf(Constants.IGV_LINK_DIR_NAME);
				String annoPartialPath = annoString.substring(index);
				String bigDataUrl = baseURL + annoPartialPath;
				fileURLs.add(bigDataUrl);

				sb.append(prefix + "\t<Resource name=\"" + dataTrack.getName() + "\" path=\"" + bigDataUrl + "\"/>\n");
			}
		}

	} catch (Exception e) {
		LOG.error("Error in MakeDataTrackIGVLink", e);
		throw e;
	}

	return sb.toString();

}

// 01/04/2020 timM   make the soft links directly rather than using bash
private boolean makeSoftLink(String path, ArrayList<String[]> linksToMake) {
	System.out.println ("[makeSoftLink] path: " + path + " linksToMake.size: " + linksToMake.size());
	try {
	for (String[] links : linksToMake) {

		Path theTarget = Paths.get(links[0]);
//		System.out.println ("[makeDTIGVLink] thetarget: " + theTarget.toString());
		if (Files.exists(theTarget)) {
			Path theLink = Paths.get(links[1]);
//			System.out.println ("[makeDTIGVLink]  theLink: " + theLink.toString());
			if (Files.exists(theLink)) {
				Files.delete(theLink);
			}

//			System.out.println ("[makeDTIGVLink] thetarget: " + theTarget.toString() + " theLink: " + theLink.toString());
			Files.createSymbolicLink(theLink, theTarget);
		}
	} // end of for

	} catch (Exception e) {
		LOG.error("Error in MakeDataTrackIGVLink 2", e);
	}

	return true;
}
private boolean makeSoftLinkViaUNIXCommandLine(String path, ArrayList<String[]> linksToMake) {
	try {
		// we split the file into 3000 line pieces so makeLinks.sh doesn't get too large
		System.out.println ("[makeSoftLinkViaUNIXCommandLine] path: " + path + " linksToMake.size: " + linksToMake.size());
		File script = new File(path, "makeLinks.sh");
		script.createNewFile();
		BufferedWriter bw = new BufferedWriter(new FileWriter(script));
		int numprocessed = 0;
		int nxtfile = 0;
		for (String[] links : linksToMake) {

			File testit = new File(links[0]);
			if (testit.exists()) {
				bw.write("ln -s '" + links[0] + "' '" + links[1] + "'\n");
			} else
			{
				continue;
			}

			testit = null;
				numprocessed++;
			if (numprocessed >= 3000) {
				numprocessed = 0;
				bw.write("exit\n");
				bw.close();

				String[] cmd = { "sh", script.toString() };
				Process p = Runtime.getRuntime().exec(cmd);

				nxtfile++;
				script = new File(path, "makeLinks" + nxtfile + ".sh");
				bw = new BufferedWriter(new FileWriter(script));
			}
		}

		if (numprocessed > 0) {
			// process the last file of links
			bw.write("exit\n");
			bw.close();

			String[] cmd = {"sh", script.toString()};
			Process p = Runtime.getRuntime().exec(cmd);
		}
		// script.delete();

		return true;

	} catch (IOException e) {
		LOG.error("Error in MakeDataTrackIGVLink", e);
	}
	return false;
}

private static String stripBadNameCharacters(String name) {
	name = name.trim();
	name.replaceAll(",", "_");
	return name;
}
}

class MyComp implements Comparator<String> {

@Override
public int compare(String str1, String str2) {
	return str1.compareTo(str2);
}

}
