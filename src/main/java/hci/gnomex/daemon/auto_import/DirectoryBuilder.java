package hci.gnomex.daemon.auto_import;

import com.github.fracpete.processoutput4j.output.CollectingProcessOutput;
import com.github.fracpete.rsync4j.RSync;
import hci.gnomex.utility.*;

import javax.mail.MessagingException;
import javax.naming.NamingException;
import java.io.*;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class DirectoryBuilder {



	private String inFileName;
	private String root;
	private String currentDownloadLocation;
	private boolean skip = false;
	private String flaggedIDFileName;
	private String mode;
	private String accountForFilesMoved;
	private Set<String> fileTypeCategorySet;
	private Set<String> optionalFileTypeCategorySet;
	private boolean addWrapperFolder = false;
	private String remotePath;
	private boolean loadAccountFile = false;
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
	private static final int TEST_TYPE_PROPERTY_ID = 21;
	private boolean isWindows;
	private List<Integer> captureGroupIndexes;
	private String sampleIdRegex;
	private String logPath;


	public DirectoryBuilder(String[] args) {
		captureGroupIndexes = new ArrayList<Integer>();
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
				this.mode = args[++i];
			}else if(args[i].equals("-linkfolder")){
				addWrapperFolder = true;
			}else if(args[i].equals("-log")){
				this.logPath = args[++i];
			}else if(args[i].equals("-remotepath")){ // accountfilesmoved is considered path to local files
				// need remote if you want to compare
				if(accountForFilesMoved != null){
					this.remotePath = args[++i];
				}
			} else if(args[i].equals("-accountload")){ // load file for accounting don't look at disk
				if(accountForFilesMoved != null){     // the loaded file will follow accountForFilesMoved param
					this.loadAccountFile = true;
				}
			}else if(args[i].equals("-accountoutfile")){
				if(accountForFilesMoved != null){
					this.outputAccountFile = args[++i];
				}
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
			}  else if (args[i].equals("-help")) {
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
						System.out.print("Couldn't find  file ID that should have all its file extension set " + foundFileID + " from all files list " );
						break;
					}
				}

			} catch (IOException e) {
				e.printStackTrace();
			}finally {
				if(pw != null){pw.close();}
			}
		}


	}

	public void makeAccountingForFiles(){
		this.fileTypeCategorySet = new HashSet<String>();
		String regex = ".*((?:TRF|CRF|QRF|ORD)[A-Za-z0-9-]+_?[A-Za-z]*)(\\..+)";

		Map<String,List<String>> missingMap = new TreeMap<String,List<String>>();
		//deident.xml removed as it should be optional
		fileTypeCategorySet = new HashSet<>(Arrays.asList(".pdf", ".xml", ".bam.bai",".bam",".bam.bai.md5",".bam.md5" ));
		optionalFileTypeCategorySet = new HashSet<String>(Arrays.asList(".bam.bai.S3.txt", ".bam.S3.txt" ));


		File root = new File(this.accountForFilesMoved);
		Map<String, Set<String>> localFileTypeMap= null;
		Map<String, List<String>> localFileMap = new HashMap<>(); // keeps track of all files and their paths with the key being the ID
		List<String> foundFileIDList = new ArrayList<>();


		if(this.loadAccountFile){
			localFileTypeMap = this.loadFilesToAccount(accountForFilesMoved ,localFileMap, regex);
			System.out.println("file map size: " + localFileMap.size());
			System.out.println("This is the out file " + outputAccountFile);
		}else{
			if(root.exists() && root.isDirectory()){
				localFileTypeMap = this.findAllFiles(root,regex);
			}else{
				System.out.println("Path " + accountForFilesMoved +  " is invalid for accounting");
				System.exit(1);
			}

		}

		// prints out the missing file type sets like for example ID has except missing its xml
		findMissingFiles(localFileTypeMap,missingMap,foundFileIDList);
		System.out.println("found File ID List size: " + foundFileIDList.size());
		if(remotePath != null ){
			// we don't want to report files yet if checking remote drive
			foundFileIDList.clear();
		}
		printAccoutedForFiles(missingMap,foundFileIDList,localFileMap);

		missingMap.clear();


		if(this.remotePath != null ){
			System.out.println("Files still missing after checking what is stored remotely");
			Map<String, Set<String>> remoteFileTypeMap = this.findAllFiles(new File(this.remotePath), regex);
			System.out.println("This the remote key TRF097883_DNA:  " + remoteFileTypeMap.get("TRF103536_DNA").toString());
			System.out.println("This the local key TRF097883:  " + localFileTypeMap.get("TRF103536").toString());
			// we want a full picture(remote and local) if the file is on the disk or not
			addRemoteFromLocalFiles(localFileTypeMap,remoteFileTypeMap);
			findMissingFiles(localFileTypeMap,missingMap, foundFileIDList);
			printAccoutedForFiles(missingMap,foundFileIDList,localFileMap);
		}


	}

	private void findMissingFiles(Map<String,Set<String>> fileTypeMap, Map<String,List<String>> missingMap, List<String> foundFileIDList){
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
			int i = rKey.indexOf("_");
			if(i != -1 ){
				subID = rKey.substring(0, i);
			}

			if(!localFileTypeMap.containsKey(rKey) && !localFileTypeMap.containsKey(subID)){
				Set<String> remoteExtensionSet = remoteFileTypeMap.get(rKey);
				localFileTypeMap.put(rKey, remoteExtensionSet);
			}
		}

	}


	private Map<String, Set<String>> loadFilesToAccount(String accountFileName, Map<String, List<String>> fileMap,String regex) {
		BufferedReader bf = null;
		Map<String, Set<String>> fileTypeMap = new HashMap<>();
		List<String> deferredFileList = new ArrayList<>();


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
					if(extension.equals(".deident.xml") && extension.equals(".xml") || extension.equals(".pdf")){
						deferredFileList.add(id);
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
			addDeferredFiles(deferredFileList,fileTypeMap,regex);


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

	private Map<String, Set<String>> findAllFiles(File root,String regex){
		Map<String, Set<String>> fileTypeMap = new TreeMap<String, Set<String> >();
		List<String> deferredFilesList = new ArrayList<>();
		findAllFilesRecursively(root, fileTypeMap,deferredFilesList,regex);
		addDeferredFiles(deferredFilesList,fileTypeMap,regex);
		return fileTypeMap;
	}

	private void addDeferredFiles(List<String> deferredFilesList, Map<String, Set<String>> fileTypeMap, String regex) {
		Pattern r = Pattern.compile(regex);


		for(String dFileName : deferredFilesList){
			Matcher m = r.matcher(dFileName);
			String id ="";
			String extension ="";

			if(m.matches()) {
				id = m.group(1);
				extension = m.group(2);
				if(dFileName.contains("TRF103536")){
					System.out.println("fullName: " + dFileName);
					System.out.println("id: " + id);
					System.out.println("extension: " + extension);
				}

				if(fileTypeMap.containsKey(id)){
					fileTypeMap.get(id).add(extension);
					if(dFileName.contains("TRF103536")){
						System.out.println("this is extension that will be without DNA/RNA"  );
					}
				}else {


					String idDNA = id + "_DNA";
					String idRNA = id + "_RNA";
					Set<String> valDNA = fileTypeMap.get(idDNA);
					Set<String> valRNA = fileTypeMap.get(idRNA);

					if(valDNA != null){
						valDNA.add(extension);
					}else{
						fileTypeMap.put(idDNA, new HashSet<String>(Arrays.asList(extension)));
					}
					if(valRNA != null){ // not adding if not found because rna is optional for foundation, may need to reevaluate
						valRNA.add(extension);
					}

					if(dFileName.contains("TRF103536")){
						System.out.println("this is the extension add to DNA"  );
					}


				}

			}

		}
	}

	private void findAllFilesRecursively(File file, Map<String, Set<String>> fileTypeMap, List<String> deferredFilesList, String regex){

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
					deferredFilesList.add(name);
					return;
				}

				if(name.contains("TRF103536")){
					System.out.println("fullName of bam: " + name);
					System.out.println("id of bam: " + id);
					System.out.println("extension of bam: " + extension);
				}

				if (fileTypeMap.get(id) != null) {
					fileTypeMap.get(id).add(extension);
				} else {
					HashSet<String> extensionList = new HashSet<String>();
					extensionList.add(extension);
					fileTypeMap.put(id, extensionList);
				}

			}else{
				System.out.println("didn't match " + name);
			}


		}else{
			File[] fileList =  file.listFiles();
			for(File f : fileList){
				findAllFilesRecursively(f,fileTypeMap, deferredFilesList,regex);
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
		List<String> localFiles = new ArrayList<String>();
		Map<String,String> fromToMap = new TreeMap<>();
		Map<String,String> fromToFilteredMap = new TreeMap<>();
		List<String> flaggedIDList = readSampleIDs(flaggedIDFileName);

		try {

			localFiles = this.readFile(this.inFileName);
			File flaggedDir = new File(this.currentDownloadLocation + "Flagged");
			if(!flaggedDir.exists()){
				flaggedDir.mkdir();
			}

			preparePath(flaggedIDList,fromToFilteredMap, localFiles,fromToMap );
			this.moveTheFiles(fromToFilteredMap, new ArrayList<>()); // These files we want to move into the flagged folder

			this.moveTheFiles(fromToMap,makeFileImmutableCmd(fromToMap));



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


	private void preparePath(List<String> flaggedFiles,Map<String,String> fromToFilteredMap, List<String> paths, Map<String,String> fromToMap) throws Exception{
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


			//todo verify this approach works for tempus. I think that tempus hands file of real relative paths not s3 path
			File stageFile =  new File(this.currentDownloadLocation + File.separator + p);


			String pattern = Pattern.quote(System.getProperty("file.separator"));
			String[] pathChunks = p.split(pattern);


			String file = pathChunks[pathChunks.length - 1];
			String[] fileChunks = file.split("\\.");
			String fileName = fileChunks[0].split("_")[0];
			if(sampleIdRegex != null){ // if regex override default split by '_'
				Pattern samplePattern = Pattern.compile(sampleIdRegex);
				Matcher m = samplePattern.matcher(fileChunks[0]);
				fileName = Differ.getNameByExistingCaptureGroup(captureGroupIndexes,m);
			}

			String staged = "";
			//sometimes the file in read in has the relative path on the stage folder others it is the remote path
			// need to determine if path is sudo or real but just relative to stage directory
			if(stageFile.exists()){
				staged = stageFile.getCanonicalPath();
			}else{
				staged = currentDownloadLocation +File.separator + file;
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
				fromToFilteredMap.put(staged, strBuild.toString());
				System.out.println("Flagged " + strBuild.toString());
				continue;
			}

			String finalPath = strBuild.toString();

			if(new File(finalPath).exists() && !finalPath.equals(root)) {
				if(addWrapperFolder &&  appendDirPersonID(fileName,strBuild)){
					fromToMap.put(staged, strBuild.append(File.separator).append(file).toString());
				}else if(!addWrapperFolder){
					fromToMap.put(staged, strBuild.append(File.separator).append(file).toString());
				}
			}else {
				throw new Exception("The path does not exist: " + finalPath +  "\n your directory structure isn't correct");
			}

		}



	}

	private boolean appendDirPersonID(String fileName, StringBuilder strBuild) {
		Query q = null;
		File personIDDir =  null;
		try{
			String path = XMLParser.getPathWithoutName(this.inFileName);
			q =  new Query(path+"gnomex-creds.properties");
			String personID = q.getPersonIDFromSample(fileName);
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
			e.printStackTrace();
			q.closeConnection();
			System.exit(1);
		}finally {
			q.closeConnection();
		}
		return true;
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


	public void moveTheFiles(Map<String,String> filesMap, List<String> extraCommands) throws Exception {
		StringBuilder strBuild = new StringBuilder();
		List<String> commands = new ArrayList<String>();
		//			strBuild.append("mv -vn");
//			strBuild.append(" ");
//			strBuild.append(fileKey);
//			strBuild.append(" ");
//			strBuild.append(filesMap.get(fileKey));
//			commands.add(strBuild.toString());
//			System.out.println(strBuild.toString());
//			strBuild = new StringBuilder();


		for(String fileKey: filesMap.keySet()) {
			CollectingProcessOutput output = null;
			try {

				RSync rsync = new RSync()
						.source(fileKey)
						.destination(filesMap.get(fileKey))
						.recursive(true);
				output = rsync.execute();
				logMoveDetails(output,filesMap,fileKey);
			} catch(Exception e){
				logMoveDetails(output,filesMap,fileKey);
			}
		}

		for(String c : extraCommands){
			commands.add(c);
		}
		if(this.logPath != null){
			XMLParser.executeCommands(commands,logPath+ File.separator + "subProccesError.log");
		}else{
			XMLParser.executeCommands(commands,currentDownloadLocation+"subProccesError.log");
		}


	}

	private void logMoveDetails(CollectingProcessOutput output, Map<String, String> filesMap, String fileKey) throws Exception {
		String logDetailsName = "moveDetails.log";
		String errorMessage = "";

		if(logPath != null){
			try(PrintWriter pw  = new PrintWriter(new FileWriter(logPath + File.separator + logDetailsName, true));) {
				if(output != null){
					if(output.getExitCode() == 0 ){
						pw.println(fileKey + "\t" + filesMap.get(fileKey));
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
		}else{
			sampleIDList = readSampleIDs(path + "importedTLList.out");
			reportIDList =  q.getImportedIDReport(sampleIDList, DirectoryBuilder.TEMPUS_GROUP_ID);
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
				sendImportedIDReport(from,to,subject,strBuild.toString(),"");
			}
			catch(Exception e){
				e.printStackTrace();
				System.exit(1);
			}

		}

	}
	public static void sendImportedIDReport(String from,String to, String subject,String body, String testEmail) {
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
					false,
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
