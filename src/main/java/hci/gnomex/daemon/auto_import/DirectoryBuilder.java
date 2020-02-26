package hci.gnomex.daemon.auto_import;

import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.utility.*;
import org.hibernate.Session;
import org.omg.PortableInterceptor.SYSTEM_EXCEPTION;

import javax.mail.MessagingException;
import javax.naming.NamingException;
import javax.persistence.criteria.CriteriaBuilder;
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
	private boolean addWrapperFolder = false;



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




	public DirectoryBuilder(String[] args) {
		captureGroupIndexes = new ArrayList<Integer>();
		for (int i = 0; i < args.length; i++) {
			args[i] =  args[i].toLowerCase();

			if(args[i].equals("-accountfilesmoved"))
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
			}else if(args[i].equals("-cp")){
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

	public void printAccoutedForFiles(Map<String, List<String>> missingMap) {
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
	}

	public void makeAccountingForFiles(){
		this.fileTypeCategorySet = new HashSet<String>();
		Map<String,List<String>> missingMap = new TreeMap<String,List<String>>();
		fileTypeCategorySet = new HashSet<>(Arrays.asList(".pdf", ".xml",".deident.xml", ".bam.bai",".bam",".bam.bai.md5",".bam.md5",".json" ));



		File root = new File(this.accountForFilesMoved);
		if(root.exists() && root.isDirectory()){
			Map<String, Set<String>> fileMap = this.findAllFiles(root);
			for(String key : fileMap.keySet()) {

				Set<String> fileTypes = fileMap.get(key);
				for(String type : fileTypeCategorySet ) {
					if(!fileTypes.contains(type)) {
						if(missingMap.get(key) != null ) {
							missingMap.get(key).add(type);
						}else {
							missingMap.put(key, new ArrayList<String>(Arrays.asList(type)));
						}
					}
				}

			}
			// prints out the missing file type sets like for example ID has except missing its xml
			printAccoutedForFiles(missingMap);



		}else{
			System.out.println("This path is invalid");
			System.exit(1);
		}
	}


	private Map<String, Set<String>> findAllFiles(File root){
		Map<String, Set<String>> fileMap = new TreeMap<String, Set<String> >();
		findAllFilesRecursively(root, fileMap);
		return fileMap;
	}

	private void findAllFilesRecursively(File file, Map<String, Set<String>> fileMap){

		if(!file.isDirectory()){
			String name  = file.getName();
			//int startIndx = name.indexOf(".");
			//String extension =  name.substring(startIndx + 1 , name.length());


			String regex = "^([a-zA-Z0-9]+)_?[a-zA-Z]*(\\..+)$";
			Pattern r = Pattern.compile(regex);

			Matcher m = r.matcher(name);
			String id ="";
			String extension ="";

			if(m.matches()) {
				id = m.group(1);
				extension= m.group(2);
			}else{
				System.out.println("didn't match " + name);
			}

			if(fileMap.get(id) != null) {
				fileMap.get(id).add(extension);
			}else{
				HashSet<String> extensionList = new HashSet<String>();
				extensionList.add(extension);
				fileMap.put(id, extensionList);
			}

		}else{
			File[] fileList =  file.listFiles();
			for(File f : fileList){
				findAllFilesRecursively(f,fileMap);
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


	public void moveTheFiles(Map<String,String> filesMap, List<String> extraCommands) throws Exception{
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

		XMLParser.executeCommands(commands,currentDownloadLocation+"tempError.log");

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
