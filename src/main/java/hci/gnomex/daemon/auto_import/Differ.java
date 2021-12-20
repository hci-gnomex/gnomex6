package hci.gnomex.daemon.auto_import;

import javax.json.JsonObjectBuilder;
import java.io.*;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Differ {


	private String remote;
	private String local;
	private String outputPath;
	private String matchByName;
	private Map<String, Set<String>> fileMap;
	private List<String> uniqueByName;
	private List<String> uniqueByChecksum;
	private String onlyMatchOn; // for regex to match on either local or remote or both
	private Integer startCaptureGroup;
	private Integer endCaptureGroup;
	private Map<String, String> aliasMap;
	private Set<String> localFilesExist;
	private String localExistPath;



	public Differ(String[] args) {
		this.outputPath = outputPath;
		this.fileMap = new TreeMap<String, Set<String>>();
		this.uniqueByName = new ArrayList<String>();
		this.uniqueByChecksum = new ArrayList<String>();
		this.onlyMatchOn = "all";
		this.localFilesExist = new HashSet<>();

		for (int i = 0; i < args.length; i++) {
			args[i] = args[i].toLowerCase();

			if (args[i].equals("-remote")) {
				remote = args[++i];
			} else if (args[i].equals("-local")) {
				local = args[++i];
			} else if (args[i].equals("-outputPath")) {
				outputPath = args[++i];
			} else if (args[i].equals("-matchbyname")) {
				String command = args[i+1].toLowerCase();
				if(command.equals("-l") || command.equals("-r")){
					onlyMatchOn = args[++i];
				}
				this.matchByName = args[++i];
			}else if(args[i].equals("-cp")){
				try {
					startCaptureGroup =  Integer.parseInt(args[i + 1]);
					i++;
					endCaptureGroup = Integer.parseInt(args[i + 1]);
					i++;
				}catch(NumberFormatException e){
					if(startCaptureGroup == null){
						System.out.println("Please provide at least a starting a range for the capture group");
						System.exit(1);
					}if(startCaptureGroup != null && endCaptureGroup == null){
						endCaptureGroup = startCaptureGroup;
					}
				}

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
			} else if(args[i].equals("-le")){
				localExistPath = args[++i];
			}else if (args[i].equals("-help")) {
				printUsage();
				System.exit(0);
			}

		}
	}

	public void printUsage() {
		System.out.println("-remote:  remote location (sftp server or aws) that is being compared against");
		System.out.println("-local:  local location (example: clingen1)  that is being compared against");
		System.out.println("-outputPath:   output path and filename  will write a file to this location ");
		System.out.println("-matchByName: \n" +
				"\t\tHas sub args of l for local and r for remote. This allows you to apply \n" +
				"\t\tregex only file name one location in case the format is different between local and remote.\n" +
				"\t\tUse this in conjunction with " + " -cp command break the filename in capture groups.\n" +
				"\t\tWhen Omitted the filenames will be compared directly as they are stored on remote and local");
		System.out.println("-cp:  This is the range with start and end for the capture groups for given regex ");
		System.out.println("-alias: \n" +
				"\t\tYou can pass key value pairs delimited by space to be replace in the capture group.\n" +
				"For example if you have RSQ1 or RSQ2 in the capture group of the regex you could have back the map back to RNA.");
		System.out.println("-le: print out local files that exist already in the diff you need provide a filename for the output");
	}



	public void findDifference(){
		List<String> uniqueFiles = new ArrayList<String>();
		BufferedReader buffReader = null;
		boolean simpleDiff = true;

		try {
			FileReader reader = new FileReader(new File(local));
			buffReader = new BufferedReader(reader);
			int BUFFER_SIZE = 1000;

			buffReader.mark(BUFFER_SIZE);
			String sampleLine = buffReader.readLine();
			buffReader.reset();

			simpleDiff = deterimineFileType(sampleLine);
			diffFile(buffReader,simpleDiff);

			writeDiffToFile(this.uniqueByName);


		} catch (IOException e) {
			e.printStackTrace();
		}catch (Exception e1) {
			System.out.print("The file name in the file list may not be different in the other file list. the file lists should not differ.\n "
					+ "The only exception is the checksums can differ " );
			System.out.println(e1.getMessage());
			System.exit(1);
		}
		finally {
			try {
				buffReader.close();
			} catch (IOException e) {
				System.out.println("Error: Unable to close file reading");
				e.printStackTrace();
			}
		}




	}

	private boolean deterimineFileType(String sampleLine) throws Exception{

		int len = (sampleLine.split("  ")).length;
		if(len == 1) {
			return true;
		}else if(len == 2) {
			return false;
		}else {
			throw new Exception("Can't determine file type in diffParser " + sampleLine );
		}


	}
	private void addToIDMap(String aliasKey, String fullPathFileVal, Map<String, Set<String>> idMap){
		if(idMap.get(aliasKey) != null){
			idMap.get(aliasKey).add(fullPathFileVal);
		}else{
			idMap.put(aliasKey, new HashSet<>(Arrays.asList(fullPathFileVal)));
		}
	}

	private void diffFile(BufferedReader buff, boolean simpleFileType) throws IOException {
		String[]  filePath = null;
		String[] fileAndChecksum = null;
		Pattern p  = null;
		if(matchByName != null){
			p = Pattern.compile(matchByName);
		}
		StringBuilder renameBuildStr = new StringBuilder();



		String line = "";
		String line1 = "";

		while((line = buff.readLine()) != null) { // 1st file local 'put' into map

			if(matchByName != null && !onlyMatchOn.equals("-r")){
				Matcher m = p.matcher(line);
				if(m.matches()){
					//this gets either the string id or the ascii depending if compare by id is on
					String id = constructMatchedFileName(startCaptureGroup, endCaptureGroup, m,renameBuildStr, aliasMap);
					addToIDMap(id,  line, fileMap);
				}else{ // doesn't have to match name so get file plus extension

					//System.out.println("Warning: Can't match " + line + " with this regex " + p.pattern());
//					System.out.println("This will result in  a re-download since it can't be filtered out. Do you want to continue? ");
//					BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
//
//					String response = (reader.readLine()).toLowerCase().trim();
//					if(!response.equals("y") || !response.equals("yes")){
//						reader.close();
//						System.out.println("GoodBye");
//						System.exit(1);
//					}
//					reader.close();

				}
			}else{
				this.addToLocalMap(line);
			}

		}
		buff.close();


		buff = new BufferedReader(new FileReader(remote));


		while((line1 = buff.readLine()) != null) { // second file 'get' remote file
			String fileName = "";
			String remoteCheckSum = "";

			if(matchByName != null && !onlyMatchOn.equals("-l")){
				Matcher m = p.matcher(line1);
				if(m.matches()){
					fileName = constructMatchedFileName(startCaptureGroup, endCaptureGroup, m,renameBuildStr, aliasMap);
					Set<String> filePaths = fileMap.get(fileName);
					if(filePaths == null ){
						uniqueByName.add(line1);
					}else {
						//files already exist on local;
						localFilesExist.addAll(filePaths);
					}
				}
				else{
					System.out.println("No match for regex " + matchByName +".\n" + "Ignoring " + line1 +  " cause we can't determine if it is truly unique");
					//addUniqueName(line1);
				}
			}else{
				addUniqueName(line1);
			}

		}
	}

	private void  addToLocalMap(String line){
		String[] pathWithFile = line.split("/");
		String fileName = pathWithFile[pathWithFile.length -1];
		fileMap.put(fileName, new HashSet<String>(Arrays.asList(line)));
	}

	private void addUniqueName(String line){
		String[] pathWithFile = line.split("/");
		String fileName = pathWithFile[pathWithFile.length -1];

		Set<String> filePaths = fileMap.get(fileName);

		if(filePaths == null) { // diff
			uniqueByName.add(line);
		}else { // local files that already exist
			localFilesExist.addAll(filePaths);
		}
	}



	public List<String> getInclusionList(){

		List<String>excludeByNameOrchecksumList = new ArrayList<String>();
		excludeByNameOrchecksumList.addAll(this.uniqueByName);
		excludeByNameOrchecksumList.addAll(this.uniqueByChecksum);
		List<String>inclusionList = new ArrayList<String>();


		for(int i=0; i < excludeByNameOrchecksumList.size(); i++) {
			this.fileMap.remove(excludeByNameOrchecksumList.get(i));
		}


		for( String key: this.fileMap.keySet()) {
			inclusionList.add(key);
		}
		return inclusionList;


	}
	public static String  constructIDbySubGrouping(List<Integer> groupRange, Matcher m,Set<String> subGroups, int primaryGroupIndex ){
		StringBuilder renameBuildStr = new StringBuilder();

		for(int i = 0 ; i < groupRange.size(); i++ ){
			int groupIndex = groupRange.get(i);
			if (m.group(groupIndex) == null) {
				continue;
			}
			if(groupIndex != primaryGroupIndex){
				subGroups.add(m.group(groupIndex));
			}

			if(i < m.groupCount()){
				renameBuildStr.append(m.group(groupIndex));
				renameBuildStr.append("-");
			}else {
				renameBuildStr.append(m.group(groupIndex));
			}

		}


		String rename = renameBuildStr.toString();
		if(rename.endsWith("-")){
			renameBuildStr.deleteCharAt(renameBuildStr.length() - 1);
			rename = renameBuildStr.toString();
		}

		//System.out.println(String.join(",",sortID));
		return rename;

	}


	public static String  constructMatchedFileName(Integer startCaptureGroup, Integer endCaptureGroup, Matcher m, StringBuilder renameBuildStr,
												   Map<String,String> aliasMap){
		int endRange =  0;
		//TL-19-015AFE
		// don't allow duplicates to appear in name
		Set<String> sortID = new TreeSet<>();

		if(startCaptureGroup == null ){ // if cp wasn't specified in args default to capture all groups
			startCaptureGroup = 1;
			endCaptureGroup = m.groupCount();
		}

		if ( m.groupCount() < endCaptureGroup){
			System.out.println("End Capture Group  cannot greater than actual capture groups length: " +  m.groupCount());
			System.exit(1);
		}


		for(int i = startCaptureGroup ; i <= endCaptureGroup; i++ ){
			if (m.group(i) == null) {
				continue;
			}

			if(aliasMap != null){
				String alias = aliasMap.get(m.group(i));
				if(alias != null){
					sortID.add(alias);
				}else{
					sortID.add(m.group(i));
				}
			}else{
				sortID.add(m.group(i));
			}


		}


		//System.out.println(String.join(",",sortID));
		renameBuildStr.setLength(0);
		return String.join(",",sortID);

	}

	public static String  constructMatchedFileName(Integer startCaptureGroup, Integer endCaptureGroup, Matcher m, StringBuilder renameBuildStr){
		int endRange =  0;

		if(startCaptureGroup == null ){ // if cp wasn't specified in args default to capture all groups
			startCaptureGroup = 0;
			endCaptureGroup = m.groupCount();
		}

		if ( m.groupCount() < endCaptureGroup){
			System.out.println("End Capture Group  cannot greater than actual capture groups length: " +  m.groupCount());
			System.exit(1);
		}


		for(int i = startCaptureGroup ; i <= endCaptureGroup; i++ ){
			if (m.group(i) == null) {
				continue;
			}
			renameBuildStr.append(m.group(i));
			if(i < m.groupCount()){
				renameBuildStr.append("-");
			}
		}


		String rename = renameBuildStr.toString();
		renameBuildStr.setLength(0);
		return rename;
	}

	public static String getNameByExistingCaptureGroup( List<Integer> captureGroups, Matcher m, boolean optionalMatches){
		String matchedName = "";
		if(!m.matches() && !optionalMatches){
			System.out.println("With your given pattern: " + m.pattern() + " no match is found please check pattern");
		}
		//allow optional matching otherwise script will abort without it when no match found
		if(optionalMatches && !m.matches()){
			return "";
		}

		for(Integer cp : captureGroups){
			if(m.groupCount() < cp){
				System.out.println("Error: End Capture Group  cannot greater than actual capture groups length: " +  m.groupCount());
				System.exit(1);
			}

			String name  = m.group(cp);
			if(name != null ){
				matchedName = name;
				break;
			}

		}
		if(matchedName.equals("")){
			System.out.println("Error: With the given Capture Groups, no match was found");
			System.exit(1);
		}
		return matchedName;
	}

	public static String getNameByExistingCaptureGroup( Matcher m ){
		String matchedName = "";

		List<Integer> captureGroups = new ArrayList<>();
		//starting at one because I want match only the match not the full string
		// this assumes you don't want to specify the capture groups just want them starting from 1 to groupCount
		for(int i = 1;  i  <= m.groupCount(); i++ ){
			captureGroups.add(i);
		}

		for(Integer cp : captureGroups){
			if(m.groupCount() < cp){
				System.out.println("Error: End Capture Group  cannot greater than actual capture groups length: " +  m.groupCount());
				System.exit(1);
			}
			String name  = m.group(cp);
			if(name != null && !name.equals("")){
				matchedName = name;
				break;
			}

		}
		if(matchedName.equals("")){
			System.out.println("Error: With the given Capture Groups, no match was found");
			System.exit(1);
		}
		return matchedName;
	}




	public void writeDiffToFile(List<String> uniqueFiles) throws FileNotFoundException { // use if you want to do std.out
		PrintWriter writer = null;
		writer = new PrintWriter(System.out);

		for(String file: uniqueFiles) {
			writer.println(file);
		}

		writer.close();
	}

	public void writeDiffToFile(Set<String> uniqueFiles,String fileName){
		PrintWriter writer = null;
		List<String> ufiles =  new ArrayList<String>(uniqueFiles);
		Collections.sort(ufiles);

		try {
			writer = new PrintWriter( fileName);
			for(String file: ufiles) {
				writer.println(file);
			}

		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}finally {
			writer.close();
		}

	}

	public void writeDiffToFile(List<String> uniqueFiles,String fileName){
		PrintWriter writer = null;

		try {
			writer = new PrintWriter( fileName);
			for(String file: uniqueFiles) {
				writer.println(file);
			}

		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}finally {
			writer.close();
		}

	}


	public Set<String> getLocalFilesExist() {
		return localFilesExist;
	}
	public String getLocalExistPath() {
		return localExistPath;
	}






}
