package hci.gnomex.daemon.auto_import;

import com.github.fracpete.processoutput4j.output.CollectingProcessOutput;
import com.github.fracpete.rsync4j.RSync;
import hci.gnomex.utility.BatchMailer;
import hci.gnomex.utility.MailUtil;
import hci.gnomex.utility.MailUtilHelper;

import jakarta.mail.MessagingException;
import javax.naming.NamingException;
import javax.persistence.criteria.CriteriaBuilder;
import java.io.*;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class DirectoryBuilder {



	private String stagePath;
	private String inFileName;
	private String root;
	private String currentDownloadLocation;
	private boolean skip = false;
	private String flaggedIDFileName;
	private String mode;
	private String accountForFilesMoved;
	private boolean accountFilesFlag = false;
	private Set<String> fileTypeCategorySet;
	private Set<String> optionalFileTypeCategorySet;
	private boolean addWrapperFolder = false;
	private String remotePath;
	private String outputAccountFile;



	private static final String RNAseq = "rnaseq";
	private static final String WHOLE_EXOME= "whole_exome";
	private static final String FASTQ="fastq";
	private static final String DNA_ALIAS="DNA";
	private static final String RNA_ALIAS="RNA";
	private static final String FASTQ_ALIAS="Fastq";
	private static final Integer AVATAR_GROUP_ID = 11;
	private static final Integer FOUNDATION_GROUP_ID = 14;
	private static final Integer TEMPUS_GROUP_ID = 22;
	private static final Integer CARIS_GROUP_ID = 30;
	private static final int TEST_TYPE_PROPERTY_ID = 21;
	private boolean isWindows;
	private boolean debug = false;
	private List<Integer> captureGroupIndexes;
	private String sampleIdRegex;
	private String logPath;
	private Map<String,String> personIDMap;


	public DirectoryBuilder(String[] args) {
		captureGroupIndexes = new ArrayList<Integer>();
		personIDMap = new HashMap<>();
		for (int i = 0; i < args.length; i++) {
			args[i] =  args[i].toLowerCase();

			if(args[i].equals("-accountfilesmoved")) // this switches the FileMover to a mode to reports about files moved
				accountForFilesMoved = args[++i];

			if (args[i].equals("-file")) {
				this.inFileName = args[++i];
			} else if (args[i].equals("-root")) {
				this.root = args[++i];
			} else if (args[i].equals("-downloadpath")) {
				this.currentDownloadLocation = args[++i];
			} else if(args[i].equals("-flaggedfile")){
				flaggedIDFileName = args[++i];
			}else if(args[i].equals("-skipfirst")){
				this.skip = true;
			}else if(args[i].equals("-mode")) {
				this.mode = args[++i].toLowerCase();
			}else if(args[i].equals("-linkfolder")){
				addWrapperFolder = true;
			}else if(args[i].equals("-log")){
				this.logPath = args[++i];
			}else if(args[i].equals("-remotepath")){ // accountfilesmoved is considered path to local files
				// need remote if you want to compare for account files mode
				this.remotePath = args[++i];
			}else if(args[i].equals("-accountfilesflag")){ // only care for found full set "accountfiles"
				this.accountFilesFlag = true;
			}else if(args[i].equals("-accountoutfile")){
				this.outputAccountFile = args[++i];
			} else if( args[i].equals("-debug") ){
				debug = true;
			} else if(args[i].equals("-cp")){
				i++;
				while(i < args.length && args[i].charAt(0) != '-' ){
					captureGroupIndexes.add(Integer.parseInt(args[i]));
					i++;
				}
				if(captureGroupIndexes.size() == 0){
					System.out.println("If you want to specify which capture groups. You need to provide atleast one index");
					System.exit(1);
				}

			}else if(args[i].equals("-regex")){
				// this regex is to help match sample id so you can determine it's request and get the HCI Person ID off it
				sampleIdRegex = args[++i];
			}else if(args[i].equals("-stagepath")){
				// optional
				stagePath = args[++i];
			} else if (args[i].equals("-help")) {
				//printUsage();
				System.exit(0);
			}
		}
		if(sampleIdRegex != null && captureGroupIndexes.size() == 0){
			captureGroupIndexes.add(1);
		}

		if(System.getProperty("os.name").startsWith("Windows")){
			isWindows = true;
		}else{
			isWindows = false;
		}
	}


	public boolean isAccountedMode(){
		return (this.accountForFilesMoved != null);
	}

	public void printAccoutedForFiles(Map<String, List<String>> missingMap, List<String> foundfileIDList, Map<String, List<String>> fileMap)  {
		Set<String> stopDuplicateSet = new HashSet<>();
		for(String key : missingMap.keySet() ) {
			List<String> missingList =  missingMap.get(key);
			System.out.print( key + ": ");
			for(int i = 0; i <  missingList.size(); i++ ) {
				String comma =  ", ";
				if(i == missingList.size() - 1) {
					comma = "";
				}
				System.out.print(missingList.get(i) + comma);
			}
			System.out.println();
		}
		if(outputAccountFile != null){
			PrintWriter pw = null;
			System.out.println("Making output accounting file "+ outputAccountFile);
			try {
				pw = new PrintWriter(new FileWriter(outputAccountFile));
				for(String foundFileID : foundfileIDList){
					List<String> foundFileList = fileMap.get(foundFileID);
					if(foundFileList != null){
						for(String foundFile : foundFileList ){
							if(stopDuplicateSet.add(foundFile)){
								pw.println(foundFile);
							}
						}
					}else{
						if(!accountFilesFlag){
							System.out.print("Couldn't find  file ID that should have all its file extension set " + foundFileID + " from all files list " );
							break;
						}else {
							if(debug)
								System.out.println("All files in this set can be accounted for but no files will be moved for " + foundFileID + " because they already reside here: " + remotePath );
						}

					}
				}

			} catch (IOException e) {
				e.printStackTrace();
			}finally {
				if(pw != null){pw.close();}
			}
		}


	}

	public Map<String, List<String>> copyFoundFileMap(Map<String, List<String>> fileMap ){
		Map cpFileMap = new HashMap();
		for(Map.Entry<String,List<String>> entry : fileMap.entrySet()){
			String key = entry.getKey();
			List<String> val = entry.getValue();
			cpFileMap.put(key, new ArrayList(val));
		}
		return cpFileMap;
	}

	public void makeAccountingForFiles(){
		this.fileTypeCategorySet = new HashSet<String>();
		String regex = ".*((?:TRF|CRF|QRF|ORD)[A-Za-z0-9-]+_?[A-Za-z]*)(\\..+)";

		Map<String,List<String>> missingMap = new TreeMap<String,List<String>>();
		//deident.xml removed as it should be optional
		fileTypeCategorySet = new HashSet<>(Arrays.asList(".pdf", ".xml", ".bam" ));
		optionalFileTypeCategorySet = new HashSet<String>(Arrays.asList(".bam.bai.S3.txt", ".bam.S3.txt" ));


		File root = new File(this.accountForFilesMoved);
		Map<String, Set<String>> fileTypeMap= null;
		Map<String, List<String>> fileMap = new HashMap<>(); // keeps track of all files and their paths with the key being the ID
		List<String> foundFileIDList = new ArrayList<>();
		Map<String,List<String>> localOnlyFileMap = new HashMap<>();


		if(root.isFile()){
			fileTypeMap = this.loadFilesToAccount(accountForFilesMoved ,fileMap, regex);
			System.out.println("file map size: " + fileMap.size());
			System.out.println("This is the out file " + outputAccountFile);
		}else{
			if(root.exists() && root.isDirectory()){
				fileTypeMap = this.findAllFiles(root,fileMap,regex);
			}else{
				System.out.println("Path " + accountForFilesMoved +  " is invalid for accounting");
				System.exit(1);
			}

		}

		// prints out the missing file type sets like for example ID has except missing its xml
		findMissingFiles(fileTypeMap,missingMap,foundFileIDList);
		System.out.println("found File ID List size: " + foundFileIDList.size());
		if(remotePath != null ){
			// we don't want to report files yet if checking remote drive
			localOnlyFileMap = copyFoundFileMap(fileMap);
			foundFileIDList.clear();
		}
		printAccoutedForFiles(missingMap,foundFileIDList,fileMap);

		missingMap.clear();


		if(this.remotePath != null ){
			System.out.println("Files still missing after checking what is stored remotely");
			this.findAllFiles(fileTypeMap, new File(this.remotePath),fileMap, regex);

			// we want a full picture(remote and local) if the file is on the disk or not
			//addRemoteFromLocalFiles(localFileTypeMap,remoteFileTypeMap);
			findMissingFiles(fileTypeMap,missingMap, foundFileIDList);
			if(accountFilesFlag){
				printAccoutedForFiles(missingMap,foundFileIDList,localOnlyFileMap);
			}else{
				printAccoutedForFiles(missingMap,foundFileIDList,fileMap);
			}

		}


	}

	private void findMissingFiles(Map<String,Set<String>> fileTypeMap, Map<String,List<String>> missingMap, List<String> foundFileIDList){
		/* fileTypeMap has the key: fileNameId, value: set of extensions found for that id.
		* missingMap as it sounds holds the key: fileNameId, value list of missing extensions for that id
		* foundFileIDList holds all file ids that have full  extension set, nothing is missing
		*  */
		for(String key : fileTypeMap.keySet()) {
			Set<String> fileTypes = fileTypeMap.get(key);
			for(String type : fileTypeCategorySet ) {
				if(!fileTypes.contains(type)) {
					if(fileTypes.contains(type + ".S3.txt")){
						continue;
					}
					if(missingMap.get(key) != null ) {
						missingMap.get(key).add(type);
					}else {
						missingMap.put(key, new ArrayList<String>(Arrays.asList(type)));
					}
				}
			}
			if(missingMap.get(key) == null){// nothing was missing
				foundFileIDList.add(key);
			}

		}

	}


	private void addRemoteFromLocalFiles(Map<String, Set<String>> localFileTypeMap, Map<String, Set<String>> remoteFileTypeMap) {
		// add additional found remote files types that have an entry to localFileMap
		for(String lKey : localFileTypeMap.keySet()){
			if(remoteFileTypeMap.containsKey(lKey)){
				Set<String> remoteExtensionSet = remoteFileTypeMap.get(lKey);
				localFileTypeMap.get(lKey).addAll(remoteExtensionSet);
			}
		}
		// if remote has entry(keys) that local doesn't have, add new entry to local as well
		for(String rKey : remoteFileTypeMap.keySet()){
			String subID = "";
			// temp code
//			int i = rKey.indexOf("_");
//			if(i != -1 ){
//				subID = rKey.substring(0, i);
//			}

			if(!localFileTypeMap.containsKey(rKey)){
				Set<String> remoteExtensionSet = remoteFileTypeMap.get(rKey);
				localFileTypeMap.put(rKey, remoteExtensionSet);
			}
		}

	}


	private Map<String, Set<String>> loadFilesToAccount(String accountFileName, Map<String, List<String>> fileMap,String regex) {
		BufferedReader bf = null;
		Map<String, Set<String>> fileTypeMap = new HashMap<>();
		List<File> deferredFileList = new ArrayList<>();


		try {
			bf = new BufferedReader(new FileReader(accountFileName));


			String line = "";
			while ((line = bf.readLine()) != null) {
				Pattern r = Pattern.compile(regex);

				Matcher m = r.matcher(line);
				String id ="";
				String extension ="";

				if(m.matches()) {
					id = m.group(1);
					extension = m.group(2);
					// these files need to be represented in both file sets, so need to put in both sets even though only one file
					if(extension.equals(".deident.xml") || extension.equals(".xml") || extension.equals(".pdf")){
						deferredFileList.add(new File(line));
						continue;
					}

					if(fileTypeMap.get(id) != null) {
						fileTypeMap.get(id).add(extension);
						fileMap.get(id).add(line);

					}else{
						HashSet<String> extensionList = new HashSet<String>();
						List<String> fullPathFileList = new ArrayList<>();
						extensionList.add(extension);
						fullPathFileList.add(line);
						fileTypeMap.put(id, extensionList);
						fileMap.put(id,fullPathFileList );
					}

				}
			}
			//todo need to add ids and full path to file to fileMap
			addDeferredFiles(deferredFileList,fileTypeMap,fileMap,regex);


		}
		catch (FileNotFoundException e) {
			e.printStackTrace();
		}catch(IOException e){
			e.printStackTrace();
		}finally {
			if(bf != null) {
				try {
					bf.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
		return fileTypeMap;
	}

	private Map<String, Set<String>> findAllFiles(File root, Map<String, List<String>> fileMap, String regex){
		Map<String, Set<String>> fileTypeMap = new TreeMap<String, Set<String> >();
		List<File> deferredFilesList = new ArrayList<>();
		findAllFilesRecursively(root, fileTypeMap,deferredFilesList,fileMap,regex);
		addDeferredFiles(deferredFilesList,fileTypeMap,fileMap,regex);
		return fileTypeMap;
	}


	private void findAllFiles(Map<String, Set<String>> fileTypeMap, File root,Map<String, List<String>> fileMap,String regex){
		List<File> deferredFilesList = new ArrayList<>();
		findAllFilesRecursively(root, fileTypeMap,deferredFilesList,fileMap,regex);
		addDeferredFiles(deferredFilesList,fileTypeMap,fileMap,regex);
	}



	private void addDeferredFiles(List<File> deferredFilesList, Map<String, Set<String>> fileTypeMap, Map<String, List<String>> fileMap, String regex) {
		Pattern r = Pattern.compile(regex);


		for(File dFile : deferredFilesList){
			String fullPathFileName = dFile.getAbsolutePath();
			Matcher m = r.matcher(fullPathFileName);
			String id ="";
			String extension ="";

			if(m.matches()) {
				id = m.group(1);
				extension = m.group(2);

				if(fileTypeMap.containsKey(id)){
					fileTypeMap.get(id).add(extension);
				}else {
					String idDNA = id + "_DNA";
					String idRNA = id + "_RNA";
					Set<String> valDNA = fileTypeMap.get(idDNA);
					Set<String> valRNA = fileTypeMap.get(idRNA);

					if(valDNA != null){
						valDNA.add(extension);
						fileMap.get(idDNA).add(fullPathFileName);
					}else{
						fileTypeMap.put(idDNA, new HashSet<String>(Arrays.asList(extension)));
						fileMap.put(idDNA, new ArrayList<String>(Arrays.asList(fullPathFileName)));
					}
					if(valRNA != null){ // not adding if not found because rna is optional for foundation, may need to reevaluate
						valRNA.add(extension);
						fileMap.get(idRNA).add(fullPathFileName);
					}

				}

			}

		}
	}

	private void findAllFilesRecursively(File file, Map<String, Set<String>> fileTypeMap,
										 List<File> deferredFilesList, Map<String, List<String>> fileMap,String regex){
		if(!file.isDirectory()){
			String name  = file.getName();

			//int startIndx = name.indexOf(".");
			//String extension =  name.substring(startIndx + 1 , name.length());

			Pattern r = Pattern.compile(regex);

			Matcher m = r.matcher(name);
			String id ="";
			String extension ="";

			if(m.matches()) {
				id = m.group(1);
				extension= m.group(2);
				if(extension.equals(".deident.xml") || extension.equals(".xml") || extension.equals(".pdf")){
					deferredFilesList.add(file);
					return;
				}

				if (fileTypeMap.get(id) != null) {
					fileTypeMap.get(id).add(extension);
					fileMap.get(id).add(file.getAbsolutePath());
				} else {
					HashSet<String> extensionList = new HashSet<String>();
					extensionList.add(extension);
					fileTypeMap.put(id, extensionList);
					fileMap.put(id,new ArrayList<>(Arrays.asList(file.getAbsolutePath())));
				}

			}else{
				System.out.println("didn't match " + name);
			}


		}else{
			File[] fileList =  file.listFiles();
			for(File f : fileList){
				findAllFilesRecursively(f,fileTypeMap, deferredFilesList,fileMap,regex);
			}
		}


	}




	public List<String> readPathInfo(String fileName) throws IOException{
		BufferedReader bf = null;
		List<String> dataFromFileList = new ArrayList();

		try {
			bf = new BufferedReader(new FileReader(fileName));
			String line = "";
			int count = 0;
			while((line= bf.readLine()) != null) {

				if(count % 7 == 2 && count != 0) {
					dataFromFileList.add(line);
				}
				count++;
			}

		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}
		finally {
			bf.close();
		}
		return dataFromFileList;
	}


	public List<String> readFile(String fileName) throws IOException{
		BufferedReader bf = null;
		List<String> dataFromFileList = new ArrayList();

		try {
			bf = new BufferedReader(new FileReader(fileName));
			String line = "";
			int count = 0;
			while((line= bf.readLine()) != null) {
				if(!skip || count > 0) {
					dataFromFileList.add(line);
				}
				count++;
			}

		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}
		finally {
			bf.close();
		}
		return dataFromFileList;
	}

	List<String> makeFileImmutableCmd(Map<String,String> fromToMap){
		List<String> iCmdList = new ArrayList<>();
		for(Map.Entry<String,String> entry : fromToMap.entrySet()){
			String toFile = entry.getValue();
			iCmdList.add("chattr +i " + toFile);
		}
		return iCmdList;
	}


	public void preparePath() {
		String logFileName = logPath != null ? logPath + File.separator + "moveDetails.log" : currentDownloadLocation +File.separator + "moveDetails.log";
		List<String> localFiles = new ArrayList<String>();
		Map<String,String> fromToMap = new TreeMap<>();
		Map<String,String> fromToFilteredMap = new TreeMap<>();
		Map<String, String> startStageMap = new HashMap<>();
		List<String> flaggedIDList = readSampleIDs(flaggedIDFileName);


		try {

			localFiles = this.readFile(this.inFileName);
			File flaggedDir = new File(this.currentDownloadLocation + "Flagged");

			if(!flaggedDir.exists()){
				flaggedDir.mkdir();
			}

			preparePath(flaggedIDList,fromToFilteredMap, localFiles,fromToMap,startStageMap);
			System.out.println("Files to be moved to flagged folder: " + fromToMap.size());
			moveTheFiles(fromToFilteredMap, new ArrayList<>(),logFileName); // These files we want to move into the flagged folder
			if(stagePath != null) {
				//all for copying and moving files depending on file type
				rsyncFiles(startStageMap, logFileName, false);
			}
			System.out.println("Files to be moved to final destination: " + fromToMap.size());
			moveTheFiles(fromToMap,makeFileImmutableCmd(fromToMap),logFileName);



		} catch (Exception e) {
			// TODO Auto-generated catch block
			System.out.println(e.getMessage());
			e.printStackTrace();
			System.exit(1);

		}

	}

	StringBuilder getMatchingDirName(String[] chunks, StringBuilder strBuild, Map<String,String> dirMap, Set<String> dupDirSet ){
		String[] onlyFileExtList = Arrays.copyOfRange(chunks,1,chunks.length);

		String wholeExt  = String.join(".",onlyFileExtList);
		String correctDirName= dirMap.get(wholeExt.toLowerCase());

		if(correctDirName  != null ){
			strBuild.append(File.separator);
			strBuild.append(correctDirName);
		}else{
			for(String chunk:chunks){

				correctDirName = dirMap.get( chunk.toLowerCase());
				//System.out.println("chunk in: " + chunk + " chunk out " + corretCaseDirName );
				if(correctDirName != null && dupDirSet.add(chunk.toLowerCase())){
					strBuild.append(File.separator);
					strBuild.append(correctDirName);
				}
			}

		}


		return strBuild;
	}


	private String getIDByRegex(String fileName,  boolean suppressPatWarning){
		String fileID = null;
		if(sampleIdRegex != null){ // if regex override default split by '_'
			System.out.println("Segment of text regex is matching against: " +fileName);
			Pattern samplePattern = Pattern.compile(sampleIdRegex);

			Matcher m = samplePattern.matcher(fileName);
			fileID = Differ.getNameByExistingCaptureGroup(captureGroupIndexes,m, suppressPatWarning);
		}
		return fileID;
	}


	private void preparePath(List<String> flaggedFiles,Map<String,String> fromToFilteredMap,
							 List<String> paths, Map<String,String> fromToMap, Map<String, String> startStageMap) throws Exception{
		File finalDestinationPath = new File(this.root);
		Map<String,String> dirMap = new HashMap<>();
		dirMap.put("xml","Reports");
		dirMap.put("pdf","Reports");
		dirMap.put("json","Reports");
		dirMap.put("deident.xml","Deident_Reports");
		dirMap.put("deident.json","Deident_Reports");
		dirMap.put(WHOLE_EXOME, DNA_ALIAS);
		dirMap.put(RNAseq, RNA_ALIAS);

		getAllDirs(finalDestinationPath.listFiles(), dirMap);



		for(String p: paths) {
			StringBuilder strBuild = new StringBuilder(root);
			System.out.println("-------------------------------------------------------------------------------");
			System.out.println("Path being processed: " + p );
			if(p.equals("")) { // ignore white space
				continue;
			}


			//todo verify this approach works for tempus. I think that tempus hands file of real relative paths not s3 path
			File startFile =  new File(this.currentDownloadLocation + File.separator + p);


			String pattern = Pattern.quote(System.getProperty("file.separator"));
			String[] pathChunks = p.split(pattern);


			String file = pathChunks[pathChunks.length - 1];
			String[] fileChunks = file.split("\\.");
			String fileNameWOExt = fileChunks[0]; // just excludes the extension
			String fileID = fileNameWOExt.split("_")[0];
			String tempFileID = getIDByRegex(fileNameWOExt, false);
			fileID = tempFileID != null ? tempFileID : fileID;


			String start = "";
			//sometimes the file in read in has the relative path on the start folder others it is the remote path
			// need to determine if path is sudo or real but just relative to start directory
			if(startFile.exists()){
				start = startFile.getCanonicalPath();
			}else{
				start = currentDownloadLocation +File.separator + file;
			}


			if(!filterOutFlaggedIDs(file, flaggedFiles)){
				Set<String> dupDirSet = new HashSet<>();
				getMatchingDirName(pathChunks,strBuild,dirMap,dupDirSet);
				getMatchingDirName(fileChunks,strBuild,dirMap,dupDirSet);
			}else{
				strBuild.setLength(0);
				strBuild.append(this.currentDownloadLocation);
				strBuild.append(File.separator);
				strBuild.append("Flagged");
				strBuild.append(File.separator);
				strBuild.append(file);
				fromToFilteredMap.put(start, strBuild.toString());
				System.out.println("Flagged " + strBuild.toString());
				continue;
			}

			String finalPath = strBuild.toString();

			if(new File(finalPath).exists() && !finalPath.equals(root)) {
				String pathWithFile = "";
				if(addWrapperFolder &&  appendDirPersonID(fileID,file, strBuild)){
					if(this.stagePath != null){
						String stagePathFile = this.stagePath + File.separator + file;
						startStageMap.put(start, stagePathFile);
						pathWithFile = strBuild.append(File.separator).append(file).toString();
						fromToMap.put(stagePathFile, pathWithFile);
					}else{
						pathWithFile = strBuild.append(File.separator).append(file).toString();
						//System.out.println("look: " + start + " " + pathWithFile);
						fromToMap.put(start, pathWithFile);
					}

				}else if(!addWrapperFolder){
					if(this.stagePath != null){
						String stagePathFile = this.stagePath + File.separator + file;
						startStageMap.put(start, stagePathFile);
						pathWithFile = strBuild.append(File.separator).append(file).toString();
						fromToMap.put(stagePathFile, pathWithFile);
					}else{
						pathWithFile = strBuild.append(File.separator).append(file).toString();
						fromToMap.put(start, pathWithFile);
					}

				}
				System.out.println(pathWithFile);
			}else {
				throw new Exception("The path does not exist: " + finalPath +  "\n your directory structure isn't correct");
			}

		}



	}

	private boolean appendDirPersonID(String fileID,String fullFileName, StringBuilder strBuild) {
		Query q = null;
		File personIDDir =  null;
		String path = XMLParser.getPathWithoutName(this.inFileName);
		try{

			q =  new Query(path+"gnomex-creds.properties");
			//todo this is last resort to avoid id collision need generic way
			if(mode.equals("tempus") && !fileID.startsWith("TL-")){
				fileID = "TL-%"+ fileID;
			}
			String personID = q.getPersonIDFromSample(fileID);
			strBuild.append(File.separator);
			strBuild.append(personID);
			System.out.println("Full path with PersonID to create " +  strBuild.toString());
			personIDDir = new File(strBuild.toString());
			if(!personIDDir.exists()){
				boolean successDir = personIDDir.mkdir();
				if(!successDir)
					System.out.println("The directory was NOT CREATED... something went wrong");
			}

		}catch(Exception e){
			//this catch block is for tempus because...  they do everything different!
			//we need to read the json file in to get the correct accession id then we can search and get the PersonID
			// pdf also has same file name but of course we can't look inside for the accession id so personIDMap holds
			// person id from parsing the json so the pdf can reuse it. There will always be a json parsed before pdf
			// because if there is no json everything else is flagged thus never getting to this step in the code
			System.out.println("reattempting " + fullFileName + " after failing to get person id from sample");
			String fileNameWOExt = fullFileName.split("\\.")[0];
			String personID = personIDMap.get(fileNameWOExt);
			String interID = null;
			if(personID == null){
				interID = getIntermediatoryIDFromFile(currentDownloadLocation + fullFileName);
				System.out.println("parsed out of file the accession id " + interID );
			}
			if ((interID != null && !interID.equals("")) || (personID != null && !personID.equals(""))) {
				try {
					personID = personID != null ? personID : getPersonIDFromFile(path + "tlInfo.out", interID);

					if(personID == null || personID.equals("")){
						throw new Exception("hci person id not found for file: " + fullFileName);
					}
					Integer.parseInt(personID); // making sure truly a person id if not it will throw exception

					System.out.println("found person id " + personID);
					personIDMap.put(fileNameWOExt, personID);
					strBuild.append(File.separator);
					strBuild.append(personID);
					System.out.println("Full path with PersonID to create " + strBuild.toString());
					personIDDir = new File(strBuild.toString());
					if (!personIDDir.exists()) {
						boolean successDir = personIDDir.mkdir();
						if (!successDir)
							System.out.println("The directory was NOT CREATED... something went wrong");
					}
				} catch (Exception ex) {
					e.printStackTrace();
					ex.printStackTrace();
					q.closeConnection();
					System.exit(1);
				}
			} else {
				e.printStackTrace();
				q.closeConnection();
				System.exit(1);
			}
		}finally {
			q.closeConnection();
		}
		return true;
	}

	private String getPersonIDFromFile(String lookupFile, String lookup) {

		String line = "";
		String id = "";

		try(BufferedReader sampleBuffer = new BufferedReader(new FileReader(lookupFile))) {
			while ((line = sampleBuffer.readLine()) != null) {
				if(line.contains(lookup)) {
					id = line.split("\t")[1];
				}
				if(id != null && !id.equals("")){
					break;
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return id;
	}

	private String getIntermediatoryIDFromFile(String lookupFile) {

		String line = "";
		String id = "";

		try(BufferedReader sampleBuffer = new BufferedReader(new FileReader(lookupFile))) {
			while ((line = sampleBuffer.readLine()) != null) {

				id = getIDByRegex(line,true);
				if(id != null && !id.equals("")){
					break;
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return id;
	}

	private void getAllDirs(File[] fList, Map<String,String> dirMap) {

		for(File file : fList){
			if(file.isDirectory() ){
				dirMap.put(file.getName().toLowerCase(), file.getName());
				getAllDirs(file.listFiles(), dirMap);
			}else{
				continue;
			}

		}
	}


	private boolean filterOutFlaggedIDs(String idToCheck, List<String> flaggedIDList) {
		boolean filterID = false;
		// this assumes that flagged ID will be a subset of the full filename
		for(int i=0; i < flaggedIDList.size(); i++) {
			String flaggedID = flaggedIDList.get(i);
			int index = idToCheck.indexOf(flaggedID);
			if(index > -1) {
				int end = index + flaggedID.length();
				if(idToCheck.charAt(end) == '.' || idToCheck.charAt(end) ==  '_') {
					filterID = true;
					break;
				}

			}

		}

		return filterID ;
	}


	public String excludedString(String matchStr) {
		StringBuilder pathBuilder =  new StringBuilder();

		//String regex = "^(?:(\\w+) )?((?:[\\w \\.]+/)*[\\w \\.]+)$";
		String regex = "(\\/\\w+_\\d+_\\d+)";
		Pattern r = Pattern.compile(regex);
		StringBuffer strBuild = new StringBuffer();

		// Now create matcher object.
		Matcher m = r.matcher(matchStr);
		if (m.find( )) {
			System.out.println("Found value: " + m.group(0) );
			m.appendReplacement(strBuild, "");

		}
		m.appendTail(strBuild);
		String excludedString = strBuild.toString();
		String[] pathChunks = excludedString.split("/");
		int len = pathChunks.length;
		for(int i= 0; i < len; i++) {
			if(i == 0) {
				continue;
			}
			if(i == len - 1) {
				continue;
			}
			pathBuilder.append(pathChunks[i]);
			pathBuilder.append("/");

		}


		return pathBuilder.toString();

	}

	public void rsyncFiles(Map<String,String> filesMap,String logFileName, boolean moveOnly) throws Exception{
		CollectingProcessOutput output = null;
		System.out.println("Starting rsync");

		for (String fileKey : filesMap.keySet()) {
			try {
				// this is not generic very foundation specific
				if(moveOnly ||  (!fileKey.endsWith(".xml") && !fileKey.endsWith(".pdf"))){
					System.out.println("Moving file from: " +  fileKey + " to " + filesMap.get(fileKey));
					RSync rsync = new RSync()
							.source(fileKey)
							.destination(filesMap.get(fileKey))
							.ignoreExisting(true)
							.recursive(true)
							.removeSourceFiles(true);
					output = rsync.execute();

				}else{ // xml or pdf need to be copied not moved
					System.out.println("Copying file " +  fileKey);
					RSync rsync = new RSync()
							.source(fileKey)
							.destination(filesMap.get(fileKey))
							.ignoreExisting(true)
							.recursive(true);
					output = rsync.execute();
				}
				logMoveDetails(output, filesMap, fileKey,logFileName);
			} catch (Exception e) {
				logMoveDetails(output, filesMap, fileKey,logFileName);
			}
		}
		System.out.println("Ending rsync");

	}



	public void moveTheFiles(Map<String,String> filesMap, List<String> extraCommands, String logFileName) throws Exception {
		StringBuilder strBuild = new StringBuilder();
		List<String> commands = new ArrayList<String>();

		for(String fileKey: filesMap.keySet()) {
			strBuild.append("mv -vn");
			strBuild.append(" ");
			strBuild.append(fileKey);
			strBuild.append(" ");
			strBuild.append(filesMap.get(fileKey));
			commands.add(strBuild.toString());
			System.out.println(strBuild.toString());
			strBuild = new StringBuilder();
		}

		for(String c : extraCommands){
			commands.add(c);
		}
		if(filesMap.size() > 0){
			XMLParser.executeCommands(commands,logFileName,true);
		}
	}

	private void logMoveDetails(CollectingProcessOutput output, Map<String, String> filesMap, String fileKey,String logFile) throws Exception {
		String errorMessage = "";
		DateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy HH:mm:ss");

		if(logPath != null){
			try(PrintWriter pw  = new PrintWriter(new FileWriter(logFile, true));) {
				if(output != null){
					if(output.getExitCode() == 0 ){
						pw.println(fileKey + "\t" + filesMap.get(fileKey) + "\t" + dateFormat.format(new Date()));
					}else{
						errorMessage= "Error: sync failed  for " + fileKey + "  to  " + filesMap.get(fileKey);
						pw.println(output.getStdErr());
						pw.println(errorMessage);
					}

				}else{ // if output null we assume error log
					errorMessage= "Error: sync failed  for " + fileKey + "  to  " + filesMap.get(fileKey);
					pw.println(errorMessage);
				}
			} catch (IOException e) {
				e.printStackTrace();
				throw e;
			}
		}
		if(!errorMessage.equals("")){
			throw new Exception(errorMessage);
		}

	}


	private  List<String> readSampleIDs(String fileName){
		BufferedReader bf = null;
		List<String> idList = new ArrayList<String>();

		try {
			bf = new BufferedReader(new FileReader(new File(fileName)));
			String line = "";
			while((line = bf.readLine()) != null) {
				idList.add(line);
			}


		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}catch (IOException e) {
			e.printStackTrace();
		}finally {
			try {
				bf.close();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}

		return idList;

	}



	public void reportWorkSummary() {
		System.out.println("[FileMover:DirectoryBuilder->reportWorkSummary] MAKING FINAL REPORT");

		String path = XMLParser.getPathWithoutName(this.inFileName);
		List<String> sampleIDList = new ArrayList<String>();
		StringBuilder strBuild = new StringBuilder();
		String from = "DoNotReply@hci.utah.edu";
		String to = "erik.rasmussen@hci.utah.edu"; //, dalton.wilson@hci.utah.edu, david.nix@hci.utah.edu, qing.li@hci.utah.edu, aaron.atkinson@hci.utah.edu";
		String subject = "GNomEx Importer Automated Email - Patient ID Report";
		Query q =  new Query(path+"gnomex-creds.properties");
		List<String> reportIDList = new ArrayList<String>();


		if(mode.equals("avatar")){
			sampleIDList =  readSampleIDs(path +"importedSLList.out");
			reportIDList =  q.getImportedIDReport(sampleIDList,DirectoryBuilder.AVATAR_GROUP_ID);

		}else if(mode.equals("foundation")){
			sampleIDList = readSampleIDs(path + "importedTRFList.out");
			reportIDList =  q.getImportedIDReport(sampleIDList, DirectoryBuilder.FOUNDATION_GROUP_ID);
		}else if(mode.equals("tempus")){
			sampleIDList = readSampleIDs(path + "importedTLList.out");
			reportIDList =  q.getImportedIDReport(sampleIDList, DirectoryBuilder.TEMPUS_GROUP_ID);
		}else if(mode.equals("caris")){
			sampleIDList = readSampleIDs(path + "importedTNList.out");
			reportIDList =  q.getImportedIDReport(sampleIDList, DirectoryBuilder.CARIS_GROUP_ID);
		}

		//Map<String, HashMap<String,Long>> personMap = q.countPropertyByPerson(TEST_TYPE_PROPERTY_ID);


		q.closeConnection();

		strBuild.append("The following records have been successfully been imported into Translational GNomEx\n\n");
		strBuild.append("Exp ID\tAnalysis ID\tSample Name\tPerson ID\n");
		for(String id : reportIDList){
			strBuild.append(id);
		}

		if(reportIDList.size() > 0 ){
			try{
				sendImportedIDReport(from,to,subject,strBuild.toString(),"",false);
			}
			catch(Exception e){
				e.printStackTrace();
				System.exit(1);
			}

		}

	}
	public static void sendImportedIDReport(String from,String to, String subject,String body, String testEmail, boolean formatHTML) {
		//PropertyDictionaryHelper ph = PropertyDictionaryHelper.getInstance(sess);
		//String gnomexSupportEmail = ph.getProperty(PropertyDictionary.GNOMEX_SUPPORT_EMAIL);

		try {
			Properties mailProps = new BatchMailer("").getMailProperties();
			System.out.println("The mailProps have been saved");
			System.out.println(mailProps.toString());

			boolean sendTestEmail = false;
			if (testEmail != null) {
				if (testEmail.length() > 0) {
					sendTestEmail = true;
				}
			}

			MailUtilHelper helper = new MailUtilHelper(
					mailProps,
					to,
					null,
					null,
					from,
					subject,
					body,
					null,
					formatHTML,
					sendTestEmail,
					testEmail
			);

			MailUtil.validateAndSendEmail(helper);
		} catch (NamingException e) {
			e.printStackTrace();
		} catch (MessagingException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}catch(Exception e) {
			e.printStackTrace();
		}
		System.out.println("Email has been sent!");


	}

}
