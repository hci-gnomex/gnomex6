package hci.gnomex.daemon.auto_import;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.io.Writer;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.sql.Timestamp;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


public class Downloader {


	private Integer startCaptureGroup;
	private Integer endCaptureGroup;
	private boolean useRemoteFile;
	private HashMap<String, String> aliasMap;
	private String mode;
	private Map<String,List<String>> fileNameMap;
	private String dependentDataPath;
	private String fileOfPaths;

	private String downloadPath;
	private final String rootAvatar = "HCI_Molecular_Data:/";
	private static final String DOWNLOAD_ERROR_PATH = "download-error.log";
	private List<String> flaggedFileList;
	private boolean allowClearFile = false;
	private String filterRegex;
	private boolean deleteRemoteAfterDownload;
	private boolean testRun;

	Downloader(String[] args ){
		this.useRemoteFile = false;
		this.mode = "avatar";
		deleteRemoteAfterDownload = false;
		testRun = false;
		for (int i = 0; i < args.length; i++) {
			args[i] =  args[i].toLowerCase();
			if (args[i].equals("-filelist")) {
				this.fileOfPaths = args[++i];
				String pattern = Pattern.quote(System.getProperty("file.separator"));
				String[] fileChunks = this.fileOfPaths.split(pattern);
				fileChunks = Arrays.copyOfRange(fileChunks,0,fileChunks.length -1 );
				this.dependentDataPath = String.join(File.separator,fileChunks) + File.separator;

			} else if (args[i].equals("-downloadpath")) {
				this.downloadPath = args[++i];
			} else if (args[i].equals("-mode")) {
				this.mode = args[++i];
				if(!(this.mode.contains("tempus") || this.mode.equals("avatar") || this.mode.contains("caris")) ){
					System.out.println("If you specify mode it has to be either tempus, avatar or caris");
					System.exit(1);
				}

			}else if(args[i].equals("-allowclearfile")){
				this.allowClearFile = true;
			}else if(args[i].equals("-filterregex")){
				filterRegex = args[++i];
			}else if(args[i].equals("-cp")){
				try {
					this.startCaptureGroup =  Integer.parseInt(args[i + 1]);
					i++;
					this.endCaptureGroup = Integer.parseInt(args[i + 1]);
					i++;
				}catch(NumberFormatException e){
					if(startCaptureGroup == null){
						System.out.println("Please provide at least a starting a range for the capture group");
						System.exit(1);
					}if(startCaptureGroup != null && endCaptureGroup == null){
						endCaptureGroup = startCaptureGroup;
					}
				}
			}
			else if(args[i].equals("-remotepath")) { // helps to determine which path to use remote or local in flagged filtered outlist
				// default is the flagged(local) path and filename
				useRemoteFile = true;
			}else if (args[i].equals("-alias")){ // allow list of for your capture groups items aka DNA -> DSQ1
				aliasMap = new HashMap<String, String>();
				++i;
				while(true){
					int nextI = i + 1;
					if(nextI >= args.length || (args[i].startsWith("-") || args[nextI].startsWith("-") )){
						break;
					}
					aliasMap.put(args[i], args[nextI]);
					i = i + 2;
				}
				i--;
			}else if(args[i].equals("-rd") ){ // delete remote files after downloading
				deleteRemoteAfterDownload = true;
			}else if(args[i].equals("-t") || args[i].equals("-test")){
				testRun = true;
			} else if (args[i].equals("-help")) {
				//printUsage();
				System.exit(0);
			}
		}
		if(dependentDataPath == null || downloadPath == null){
			System.out.println("Please specify both the log path and the download path");
			System.exit(1);
		}

		this.fileNameMap = new TreeMap<String,List<String>>();
		this.flaggedFileList = new ArrayList<String>();
	}

	public String getMode(){
		return this.mode;
	}



	private boolean hasSubProcessErrors(File errorFile, boolean strictErrorCheck, Process p ) {
		Scanner scan = null;
		boolean hasError = false;
		try{
			scan = new Scanner(errorFile);
			System.out.println("************************************************************");
			System.out.println("Errors will appear below if found, in this file, " + errorFile.getName());
			while(scan.hasNext()){
				String line = scan.nextLine();
				if(line.matches(".*Error.*|.*error.*")){
					hasError = false; // temp fix need to rework
					System.out.println(line);
				}

			}
			System.out.println("************************************************************");
		}catch(FileNotFoundException e){
			if(scan != null){ scan.close(); }
			hasError = false;
		}finally {
			scan.close();
		}
		if(strictErrorCheck){
		  hasError = p.exitValue() > 0 || hasError;
		}

		return hasError;
	}






	private void executeCommands(List<String> commands, boolean strictErrorCheck) {

		File tempScript = null;

		try {
			System.out.println("started executing command");
			tempScript = createTempScript(commands);
			ProcessBuilder pb = new ProcessBuilder("bash", tempScript.toString());
			pb.inheritIO();
			Process process;
			File errorFile = new File( dependentDataPath +"download-error.log");
			pb.redirectError(errorFile);

			process = pb.start();
			process.waitFor();
			if(hasSubProcessErrors(errorFile,strictErrorCheck,process)){
				System.out.println("Error detected exiting script");
				System.exit(1);
			}


			System.out.println("finished executing command");
		}

		catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
		finally {
			tempScript.delete();
		}
	}




	private File createTempScript(List<String> commands) throws IOException {
		File tempScript = File.createTempFile("script", null);

		Writer streamWriter = new OutputStreamWriter(new FileOutputStream(tempScript));
		PrintWriter printWriter = new PrintWriter(streamWriter);


		for(int i =0; i < commands.size(); i++) {
			printWriter.println(commands.get(i));
		}

		printWriter.close();

		return tempScript;
	}

	public void executeAvatarDownload() {

		List<String> commands = new ArrayList<String>();

		String parsedDownloadList = prepDownloadString(this.rootAvatar);

		if(parsedDownloadList.equals("unsafe")) { // downloading is in progress, no need to continue
			System.out.println("The process has been aborted because files are already downloading" );
			System.exit(3);
		}



		//["Downloading in Progress..."]
		List<String> status = Arrays.asList("Downloading in progress...");
		writeToFile(this.dependentDataPath + "download.log",status); // /home/u0566434/parser_data/download.log


		// Execute download actually
		String downloadCommand = "dx download " + parsedDownloadList;

		//dx download "project-xxxx:/my_folder/example.bam"
		System.out.println("These command for files to be downloaded: " + downloadCommand);
		commands.add("#!/bin/bash");
		commands.add("cd " + this.downloadPath);
		commands.add("mv -t ." + File.separator + " " +  this.downloadPath + File.separator +"Flagged" + File.separator +  "*" );
		if(!parsedDownloadList.equals("")){
			commands.add(downloadCommand);
		}else{
			System.out.println("No files will be downloaded because there are only flagged files at this time ");
		}


		executeCommands(commands, false);

		System.out.println("The download finished");
		ArrayList<String> downloadedList = new ArrayList<String>();
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());


		downloadedList.add("Downloaded successfully, " + timestamp );
		downloadedList.add(this.createFormattedPath("", true, true).replace("\"", ""));

		writeToFile(this.dependentDataPath + "download.log", downloadedList);


	}

	public void executeTempusDownload() {
		List<String> commands = new ArrayList<String>();

		List<String> status = Arrays.asList("Downloading in progress...");
		writeToFile(this.dependentDataPath + "download.log",status); // /home/u0566434/parser_data/download.log
		String tempFile = writeToAWSFile(fileOfPaths,this.fileNameMap, false);

		String serialFileName = dependentDataPath + mode+ "-mfa-arn.txt";
		String dryRun = testRun ? " --dryrun " : " ";

		String mfaProfile = null;
		if(Files.exists(Paths.get(serialFileName))){
			mfaProfile = mode + "_mfa";
		}


		// this is reading in tempFile line by line delimiting that line by space hence ' ' allowing only 2 arguments at a time
		// it is making  shell script for just that one line and running it and substituting where $ is shown arguments
		String downloadCommand = "cat " + tempFile + " |  xargs -n2 sh -c 'aws --profile " + (mfaProfile != null ? mfaProfile : mode)
				+ " s3 cp" + dryRun + "$1 $2' sh" ;
		// old approach
		//xargs -P10 -I {} aws --profile tempus s3 cp {} " + this.downloadPath;
		if(fileNameMap.size() > 0){
			commands.add(downloadCommand);
		}
		//sending mv  stderror to the abyss with the command  '2>/dev/null' or aka ignore errors for this  command
		//why? because it might fail if there are no flagged files in the folder causing the script to crash
		//commands.add("mv -t " + this.downloadPath + " " + this.downloadPath + File.separator +  "Flagged" +File.separator +  "*" + " 2>/dev/null");
		commands.add("mv -t " + this.downloadPath + " " + this.downloadPath + File.separator +  "Flagged" +File.separator +  "*" );
		System.out.println("calling out to subshell with these commands:");
		System.out.println(commands.toString());
		executeCommands(commands, true);

		System.out.println("Finished downloading");
		if(deleteRemoteAfterDownload){
			commands.clear();
			tempFile = writeToAWSFile(fileOfPaths,this.fileNameMap, true);
			String workingPath = Paths.get(tempFile).getParent().toString();
			String finalRemoveFile = workingPath + File.separator + tempFile.substring(tempFile.length() - 17 , tempFile.length());

			String cpRemoveLog = "aws --profile " + (mfaProfile != null ? mfaProfile : mode) + " s3 cp s3://hci-" +mode + "/"+ Paths.get(finalRemoveFile).getFileName()
					+ " "  + workingPath + File.separator;
			String appendRmDate  = "echo -e `date +\"%D %T\"`"  + " >> " + finalRemoveFile;
			String rmCommand = "cat " + tempFile + " |  xargs -P10 -I {}  aws --profile " + (mfaProfile != null ? mfaProfile : mode)
					+ " s3 rm" + dryRun + "{}"  +" >> " + finalRemoveFile;

			commands.add("set -e");
			commands.add("echo this is going to cp the file from s3 to " + workingPath + " command:  " + cpRemoveLog);
			commands.add(cpRemoveLog);
			commands.add("echo  >> " +  finalRemoveFile );
			//commands.add("echo this is running the remove command and prepending current date and time  cmd: " + appendRmDate);
			commands.add( appendRmDate );
			commands.add(rmCommand);
			commands.add("echo now uploading remove list log backup to aws command:" + "aws s3 cp "+ finalRemoveFile  + " s3://hci-" + mode   + "/"+ Paths.get(finalRemoveFile).getFileName() );
			commands.add("aws s3 cp "+ finalRemoveFile  + " s3://hci-" + mode   + "/" + Paths.get(finalRemoveFile).getFileName());


			executeCommands(commands, true);
		}


//		try {
//			Files.deleteIfExists(Paths.get(tempFile));
//		} catch (IOException e) {
//			e.printStackTrace();
//		}

		ArrayList<String> downloadedList = new ArrayList<String>();
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		downloadedList.add("Dowloaded successfully, " + timestamp );
		downloadedList.add(this.createFormattedPath("", true, true).replace("\"", ""));

		writeToFile(this.dependentDataPath + "download.log", downloadedList);

	}


	private void addToIDMap(String aliasKey, String fullPathFileVal, Map<String, List<String>> idMap){
		if(idMap.get(aliasKey) != null){
			idMap.get(aliasKey).add(fullPathFileVal);
		}else{
			idMap.put(aliasKey, new ArrayList<>(Arrays.asList(fullPathFileVal)));
		}
	}

	public void loadFileNames(){

		FileReader reader = null;
		try {
			reader = new FileReader(new File(this.fileOfPaths));
			BufferedReader buffReader = new BufferedReader(reader);
			Pattern pattern = null;
			Set<String> removedFlaggedSet = new TreeSet<String>();
			Map<String,List<String>> flaggedIDMap = new HashMap<>();

			if(filterRegex != null){
				pattern = Pattern.compile(filterRegex);
			}


			String line = "";
			while((line = buffReader.readLine()) != null) {
				if(!line.trim().equals("")){
					String[] fullPath = line.split("/");
					String fileName = fullPath[fullPath.length - 1];

					if(filterRegex != null){
						Matcher m = pattern.matcher(line);
						if(m.matches()){
							String matchedFileName = Differ.constructMatchedFileName(startCaptureGroup,endCaptureGroup,m, new StringBuilder(), aliasMap );
							addToIDMap(matchedFileName, line, fileNameMap);
						}else{
							System.out.println("Could not match pattern " + pattern.pattern() + " ON text " + fileName );
						}
					}else{
						addToIDMap(fileName, line, fileNameMap);
					}
				}

			}

			this.loadFlaggedFiles(pattern,flaggedIDMap);
			System.out.println("Total files to download: " + fileNameMap.size());
			if(fileNameMap.size() == 0 && flaggedIDMap.size() == 0 ) {
				throw new Exception("Appears to be no new files to download or flagged files to reattempt");
			}


			for(Map.Entry<String,List<String>> e : flaggedIDMap.entrySet()){
				String flaggedIDName = e.getKey();
				// only need to remove once
				if(!removedFlaggedSet.add(flaggedIDName)){
					continue;
				}
				List<String> fileNames = null;
				List removedIDs = this.fileNameMap.remove(flaggedIDName);
				if(useRemoteFile){
					fileNames = removedIDs;
				}else{
					fileNames = flaggedIDMap.get(flaggedIDName);
				}

				///todo probably remove since it's not generic only helpful for tempus
				// this is here mitigate issues if process is aborted and files don't get renamed to
				// proper format
				if(removedIDs == null){
					StringBuilder sb = new StringBuilder(flaggedIDName).insert(0,"DNA,");
					removedIDs = this.fileNameMap.remove(sb.toString());

					sb = new StringBuilder(flaggedIDName).insert(0,"RNA,");
					this.fileNameMap.remove(sb.toString());

				}


				if(fileNames != null){
					for(String fileName : fileNames){
						if(removedIDs != null ){
							System.out.println("Filtering out: " + fileName);
						}
						this.flaggedFileList.add(fileName);
					}
				}

			}
			System.out.println("Files to download after excluding already downloaded Flagged Files: " + fileNameMap.size());


			if(this.allowClearFile){
				writeToFile(this.fileOfPaths, new ArrayList<String>());
			}

		}
		catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}catch (Exception e) {
			System.out.println(e.getMessage());
			try{ reader.close(); } catch(IOException ioExcept){
				System.out.print("Couldn't close the file reader");
			}
			System.exit(2);
		}
		finally{
			try{ reader.close(); }catch(IOException ioExcept){
				System.out.print("Couldn't close the file reader");
			}
		}

	}


	private void loadFlaggedFiles(Pattern pattern, Map<String, List<String>> flaggedIDMap){
		File flaggedFolder = new File(this.downloadPath + "/Flagged/");
		for(File file: flaggedFolder.listFiles()) {
			if (!file.isDirectory()) {
				String flaggedFileName = "";
				if (filterRegex != null) {
					Matcher m = pattern.matcher(file.getName());
					if (m.matches()) {
						flaggedFileName = Differ.constructMatchedFileName(startCaptureGroup, endCaptureGroup, m, new StringBuilder(), aliasMap);
						addToIDMap(flaggedFileName, file.getName(), flaggedIDMap);
					} else {
						System.out.println("Could not match pattern " + pattern.pattern() + " ON text " + file.getName());
					}

				} else {
					flaggedFileName = file.getName();
					addToIDMap(flaggedFileName, file.getName(), flaggedIDMap);
				}

				if(mode.equals("avatar")){
					List<String> fileNames = this.fileNameMap.remove(flaggedFileName);

					if (fileNames != null) {
						for (String fileName : fileNames) {
							System.out.println("Filtering out: " + fileName);
							this.flaggedFileList.add(fileName);
						}
					}
				}

			}
		}
	}



	public String prepDownloadString(String root) {
		String strPaths = "unsafe";
		boolean hasNewLines = false;
		boolean safe = downloadSafe();

		if (safe) {
			strPaths = createFormattedPath(root, hasNewLines, false);
		}

		// String fileNameArray = fileNameList.toString().replaceAll("[\\[,\\]]+", "");
		return strPaths;

	}

	private boolean downloadSafe() {
		boolean safe = false;
		PrintWriter writer = null;

		try {
			BufferedReader bf = new BufferedReader(new FileReader(this.dependentDataPath + "download.log")); /// home/u0566434/parser_data/download.log
			String line = bf.readLine();

			if (!line.equals("Downloading in progress...")) { // If downloading in progress it is not 'safe' to continue
				safe = true;
			}

		} catch (FileNotFoundException e) { // File hasn't been created so lets make it
			// TODO Auto-generated catch block
			try {
				writer = new PrintWriter(this.dependentDataPath +"download.log"); // /home/u0566434/parser_data/download.log
				writer.println("Initalized");
				safe = true;

			} catch (FileNotFoundException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}

		} catch (IOException e) {
			e.printStackTrace();
		}finally {
			if(writer != null) {
				writer.close();
			}

		}
		return safe;

	}

	public Map<String,List<String>> getFileNameMap() {
		return fileNameMap;
	}

	public String createFormattedPath(String root, boolean hasNewLine, boolean afterDownload) {
		StringBuilder strBuild = new StringBuilder();
		int count = 0;

		for (Map.Entry<String, List<String>> entry : fileNameMap.entrySet()) {
			List<String> fullPathFileList = entry.getValue();
			for(int i = 0; i <  fullPathFileList.size(); i++){
				String pathFile = fullPathFileList.get(i);

				if(mode.equals("avatar")){
					strBuild.append("\"");
				}

				strBuild.append(root);
				String safeFileName = pathFile.replaceAll(" ", "\\\\");
				strBuild.append(safeFileName);

				if(mode.equals("avatar")){
					strBuild.append("\"");
				}

				if(hasNewLine) {
					strBuild.append("\n");
				} else {
					strBuild.append(" ");
				}
			}
		}

		// flagged files added now, even though they weren't downloaded this attempt. Since they were in the past
		// The flagged files need to be check in db everytime to see if person data was updated  and can now be imported
		if(afterDownload){
			Collections.sort(this.flaggedFileList);
			for( int i = 0; i <  this.flaggedFileList.size(); i++){
				String flaggedFileName =  this.flaggedFileList.get(i);
				String safeFileName = flaggedFileName.replaceAll(" ", "\\\\ ");

				strBuild.append(safeFileName);
				if(i == (flaggedFileList.size() - 1) ){
					continue;
				}
				if(hasNewLine) {
					strBuild.append("\n");
				}
				else {
					strBuild.append(" ");
				}

			}

		}


		return strBuild.toString();
	}



	public List<String> readFile(String fileName) throws IOException{
		BufferedReader bf = null;
		List<String> dataFromFileList = new ArrayList();

		try {
			bf = new BufferedReader(new FileReader(fileName));
			String line = "";
			while((line= bf.readLine()) != null) {
				dataFromFileList.add(line);
			}

		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}
		finally {
			bf.close();
		}
		return dataFromFileList;
	}
	/* This method produces a file for the arguments to be passed into the aws s3 subprocess */
	public String writeToAWSFile(String fileName, Map<String, List<String>> dataToWrite, boolean isSingleArg) {

		PrintWriter writer = null;
		String pattern = Pattern.quote(System.getProperty("file.separator"));
		String[] chunks = fileName.split(pattern);
		String tempFile = String.join(System.getProperty("file.separator"), Arrays.copyOfRange(chunks,0, chunks.length - 1))
				+ System.getProperty("file.separator")  + (  isSingleArg  ? "tempAWSRemoveList.txt" : "tempAWSDownloadList.txt");


		try {
			writer = new PrintWriter(tempFile);
			for (Map.Entry<String,List<String>> entry : dataToWrite.entrySet()) {
				String[] keyChunks = entry.getKey().split(",");

				if(keyChunks.length == 3 && mode.equals("tempus")){
					String destPath = downloadPath +  keyChunks[0];
					for(String val : entry.getValue()){
						if(isSingleArg){
							if(val.endsWith("fastq.gz")){
								writer.println(val);
							}
						}else {
							writer.println(val + " " + destPath);
						}
					}
				}else{
					for(String val : entry.getValue()){
						if(isSingleArg){
							if(val.endsWith("fastq.gz")){
								writer.println(val);
							}
						}else {
							writer.println(val + " " + downloadPath);

						}
					}
				}


			}


		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}finally {
			writer.close();
		}
		return tempFile;
	}

	public void writeToFile(String fileName, List<String> dataToWrite) {
		PrintWriter writer = null;
		try {
			writer = new PrintWriter(fileName);
			for (int i = 0; i < dataToWrite.size(); i++) {
				writer.println(dataToWrite.get(i));
			}


		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}finally {
			writer.close();
		}

	}



}
