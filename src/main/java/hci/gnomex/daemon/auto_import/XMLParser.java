package hci.gnomex.daemon.auto_import;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.Map.Entry;
import java.util.regex.Pattern;

import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.JDOMException;
import org.jdom2.filter.Filters;
import org.jdom2.input.SAXBuilder;
import org.jdom2.output.Format;
import org.jdom2.output.XMLOutputter;
import org.jdom2.xpath.XPathExpression;
import org.jdom2.xpath.XPathFactory;



public class XMLParser {

	private Map<String, TreeMap<String, List<PersonEntry>>> avEntriesMap;
	private String fileName;
	private String initXML;
	private String annotationFileName;
	private String importScript;
	private String outFileName;
	private List<List<PersonEntry>> flaggedAvatarEntries;
	private String importMode;
	private List<String> analysisIDList;
	private String pathOnly;
	private String appendedPathOnly;

	private static final String FOUNDATION_FOLDER="Patients - Foundation - NO PHI";
	private static final String AVATAR_FOLDER="Patients - Avatar - NO PHI";
	private static final String TEMPUS_FOLDER="Patients - Tempus - NO PHI";
	private static final String CARIS_FOLDER= "Patients - Caris - NO PHI";
	private static final String IMPORT_EXPERIMENT_ERROR = "import_experiment_error.log";
	private static final String IMPORT_ANALYSIS_ERROR = "import_analysis_error.log";
	private static final String LINK_EXP_ANAL_ERROR = "link_exp_analysis_error.log";
	private static Scanner scanInput = new Scanner(System.in);





	public XMLParser(String[] args) {
		this.flaggedAvatarEntries = new ArrayList< List<PersonEntry>>();
		this.avEntriesMap = new TreeMap<String, TreeMap<String, List<PersonEntry>>>();
		this.analysisIDList =  new ArrayList<String>();

		for (int i = 0; i < args.length; i++) {
			args[i] =  args[i].toLowerCase();

			if (args[i].equals("-file")) {
				fileName = args[++i];
			} else if (args[i].equals("-annotationxml")) {
				annotationFileName = args[++i];
			} else if (args[i].equals("-importscript")) {
				importScript = args[++i];
			}else if(args[i].equals("-outfile")){
				this.outFileName = args[++i];
			}
			else if(args[i].equals("-importmode")){
				this.importMode = args[++i];
			}else if(args[i].equals("-initxml")){
				this.initXML = args[++i];
			}
			else if (args[i].equals("-help")) {
				//printUsage();
				System.exit(0);
			}
		}

		if(this.fileName != null && !this.fileName.equals("") ){
			pathOnly = XMLParser.getPathWithoutName(this.initXML); // initXML will always be in the same directory, the root
			appendedPathOnly = XMLParser.appendToPathWithoutName(this.fileName, "log");
		}else{
			System.out.println("You need to have the file path for all temp files and cred files");
			System.exit(1);
		}




	}



	public void parseXML() throws Exception {


		Path currentRelativePath = Paths.get("");
		String s = currentRelativePath.toAbsolutePath().toString();
		System.out.println("current relative path is: " + s);
		System.out.println("[XMLParser]->parseXML() intXML: " +  this.initXML);
		System.out.println("[XMLParser]->parseXML() fileName: " + this.fileName );

		File inputFile = new File(this.initXML);
		FileReader reader = null;

		SAXBuilder saxBuilder = new SAXBuilder();
		try {

			reader = new FileReader(inputFile);
			readFile(this.fileName);


			findFlaggedPersonEntries();
			Document doc = saxBuilder.build(reader);
			Element rootElement = doc.getRootElement();



			String query = "//samples/Sample";//[@name='TRF89342']";
			String ReqPropQuery ="//RequestProperties/PropertyEntry";
			String personIDQuery =  "//RequestProperties/PropertyEntry[@name='Person ID']";


			for (Entry<String, TreeMap<String, List<PersonEntry>>> entry : this.avEntriesMap.entrySet())
			{

				String key = entry.getKey();
				TreeMap<String, List<PersonEntry>> personList = entry.getValue(); // all samples for that patient

				//String query = "//book/author";//[@name='TRF89342']";
				List<Element> sampleList = queryXML(query,doc);
				List<Element> rPropertiesList = queryXML(ReqPropQuery,doc);
				List<Element> propEntry = queryXML(personIDQuery, doc);


				setSamples(sampleList,personList);
				setRequestProperties(rPropertiesList,personList);
				String personID = propEntry.get(0).getAttributeValue("value");

				writeXML(doc);

				if(importMode.toLowerCase().equals("avatar")) {
					callXMLImporter(this.AVATAR_FOLDER,personID);
				}
				else if(importMode.toLowerCase().equals("foundation"))  {
					callXMLImporter(this.FOUNDATION_FOLDER,personID);
				}else if (importMode.toLowerCase().equals("tempus")) {
					callXMLImporter(this.TEMPUS_FOLDER, personID);
				}else if (importMode.toLowerCase().equals("caris")) {
					callXMLImporter(this.CARIS_FOLDER, personID);
				}

				reader.close();
				reader = new FileReader(new File(this.initXML));
				doc = saxBuilder.build(reader);

				//use key and value
			}
			reader.close();



		} catch (JDOMException | IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			System.exit(1);
		}catch(Exception e) {
			e.printStackTrace();
			System.exit(1);
		}

	}


	private void writeXML(Document doc) throws IOException {
		PrintWriter writer = new PrintWriter(this.outFileName);
		XMLOutputter outputter = new XMLOutputter();
		outputter.setFormat(Format.getPrettyFormat());
		outputter.output(doc, writer);
		writer.close();


	}

	private void setRequestProperties(List<Element> rPropertiesList, Map<String, List<PersonEntry>> rANNOTMap) {
		String k = "";
		// Any avatar entry will contain request/patient level annotations
		// grabbing first key will work to get any avatarEntry of that patient
		for (String key: rANNOTMap.keySet()) {
			k = key;
			break;
		}

		for(Element prop : rPropertiesList) {
			if(prop.getAttributeValue("name").equals("MRN")) {
				String mrn = rANNOTMap.get(k).get(0).getMrn();
				prop.getAttribute("value").setValue(mrn);
			}
			else if(prop.getAttributeValue("name").equals("Full Name")) {
				String fullName = rANNOTMap.get(k).get(0).getFullName();
				prop.getAttribute("value").setValue(fullName);
			}
			else if(prop.getAttributeValue("name").equals("Gender")) {
				String gender = rANNOTMap.get(k).get(0).getGender();
				if(gender != null) {
					prop.getAttribute("value").setValue(gender);
				}
			}
			else if(prop.getAttributeValue("name").equals("Shadow ID")) {
				String shadowID = rANNOTMap.get(k).get(0).getShadowId();
				prop.getAttribute("value").setValue(shadowID);
			}
			else if(prop.getAttributeValue("name").equals("Person ID")) {
				String pID = rANNOTMap.get(k).get(0).getPersonId();
				prop.getAttribute("value").setValue(pID);
			}
		}

	}

	public List<Element> queryXML(String query,Document doc){
		XPathExpression<Element> xpe = XPathFactory.instance().compile(query, Filters.element());
		List<Element> elementList = xpe.evaluate(doc);
		return elementList;
	}
	public void setSamples(List<Element> sampleList, Map<String, List<PersonEntry>>sampleAnnotations) {
		// You may have multiple  entries for one person

		int i = 0;
		for(Entry<String, List<PersonEntry>> entry : sampleAnnotations.entrySet()){
			String key = entry.getKey(); //
			List<PersonEntry> entries = entry.getValue(); // only care about first entry shouldn't be more than one

			Element samples = sampleList.get(0).getParentElement();
			//xml always has one sample(the first) defined as the template sample so you don't need to clone it
			if(i == 0 ) {
				sampleList.get(i).getAttribute("ccNumber").setValue(entries.get(0).getCcNumber());
				sampleList.get(i).getAttribute("ANNOT21").setValue(entries.get(0).getTestType());
				sampleList.get(i).getAttribute("name").setValue(entries.get(0).getSlNumber());
				sampleList.get(i).getAttribute("ANNOT27").setValue(entries.get(0).getSubmittedDiagnosis());
				sampleList.get(i).getAttribute("ANNOT66").setValue(entries.get(0).getTissueType());
				sampleList.get(i).getAttribute("ANNOT65").setValue(entries.get(0).getSampleSubtype());
				sampleList.get(i).getAttribute("ANNOT72").setValue(entries.get(0).getCaptureDesign());
				sampleList.get(i).getAttribute("ANNOT73").setValue(entries.get(0).getCaptureTestName());
				sampleList.get(i).getAttribute("ANNOT74").setValue(entries.get(0).getCaptureTestDescription());


			}else {
				Element newSample = sampleList.get(0).clone();
				newSample.getAttribute("ccNumber").setValue(entries.get(0).getCcNumber());
				newSample.getAttribute("ANNOT21").setValue(entries.get(0).getTestType());
				newSample.getAttribute("name").setValue(entries.get(0).getSlNumber());
				newSample.getAttribute("ANNOT27").setValue(entries.get(0).getSubmittedDiagnosis());
				newSample.getAttribute("ANNOT66").setValue(entries.get(0).getTissueType());
				newSample.getAttribute("ANNOT65").setValue(entries.get(0).getSampleSubtype());
				newSample.getAttribute("ANNOT72").setValue(entries.get(0).getCaptureDesign());
				newSample.getAttribute("ANNOT73").setValue(entries.get(0).getCaptureTestName());
				newSample.getAttribute("ANNOT74").setValue(entries.get(0).getCaptureTestDescription());

				samples.addContent(newSample);
			}

			i++;
		}

	}

	public void	findFlaggedPersonEntries() throws Exception{
		List<List<String>> flaggedKeys = new ArrayList<List<String>>();
		StringBuilder strBuildBody = new StringBuilder();

		for(Entry<String, TreeMap<String, List<PersonEntry>>> entry : this.avEntriesMap.entrySet()) {
			String key = entry.getKey();
			TreeMap<String,List<PersonEntry>> slMap = this.avEntriesMap.get(key);
			for(Entry<String, List<PersonEntry>> e : slMap.entrySet()) {
				List<PersonEntry> personList = e.getValue();
				if(e.getKey().equals("")){
					flaggedKeys.add(Arrays.asList(key,e.getKey()));
					this.flaggedAvatarEntries.add(personList);
					continue;
				}
				if(personList.size() > 1) {
					flaggedKeys.add(Arrays.asList(key,e.getKey()));
					this.flaggedAvatarEntries.add(personList);
				}else if(personList.size() == 1) {
					if(	personList.get(0).getPersonId().equals("")
							|| personList.get(0).getFullName().equals("")
							|| personList.get(0).getGender().equals("")
					) {
						flaggedKeys.add(Arrays.asList(key,e.getKey()));
						this.flaggedAvatarEntries.add(personList);
					}
				}
				else { // there should always be atleast one entry in the list
					throw new Exception("Error: at least one person entry should be associated with it's id number");
				}
			}

		}


		for(List<String> flag : flaggedKeys) {
			if(flag.get(0).equals("")) {
				this.avEntriesMap.remove("");
			}else { // if you need to remove both patient id and sample id
				TreeMap<String, List<PersonEntry>> slMap = this.avEntriesMap.get(flag.get(0));
				if(slMap != null){
					slMap.remove(flag.get(1));
					if(slMap.size() == 0) {
						this.avEntriesMap.remove(flag.get(0));
					}
				}
			}
		}
		// prepare flagged entries for email and file
		strBuildBody.append("The following sample records have be flagged. They need to be verified and reimported\n\n");
		for( List<PersonEntry>sampRecord :flaggedAvatarEntries){
			for(PersonEntry person : sampRecord){
				strBuildBody.append(person.toString(importMode));
			}
		}

		System.out.println("File path used for majority of input and output files : " + pathOnly);

		//flaggedIDs.out file is used for the FileMover to determine which samples need to be moved to the flagged folder
		outFile(pathOnly , "flaggedIDs.out" , flaggedKeys );

		System.out.println("File path used for flagged log file  : " + appendedPathOnly);
		saveflaggedLog(appendedPathOnly,strBuildBody);
		sendFlaggedIDEmail(strBuildBody);


	}

	private void sendFlaggedIDEmail(StringBuilder strBuildBody){

		String to = "erik.rasmussen@hci.utah.edu";
		String from = "erik.rasmussen@hci.utah.edu";
		String subject = "Flagged Sample ID Report PHI";

		try {
			if(flaggedAvatarEntries.size() > 0  ) {
				DirectoryBuilder.sendImportedIDReport(from, to, subject, strBuildBody.toString(), "",false);
			}else{
				System.out.println("There are no flagged files. Email will not be sent.");
			}
		} catch (Exception e) {
			e.printStackTrace();
			System.exit(1);
		}
	}


	private String cleanData(String value){
		if(value != null) {
			String v = value.toUpperCase();
			if(v.equals("NULL")) {
				return "";
			}
		}else {
			return "";
		}

		return value;
	}

	public void readFile(String fileName) throws IOException{


		PeekableScanner scan = null;


		try {
			//bf = new BufferedReader(new FileReader(fileName));
			scan = new PeekableScanner(new File(fileName));
			String line = "";


			while(scan.hasNext() ) {//(line= bf.readLine()) != null){
				line= scan.next();
				String[] aEntries= line.split("\t");
				PersonEntry entry = new PersonEntry();
				// duplicate code
				if(importMode.toLowerCase().equals("avatar")) { // avatar
					entry.setMrn(cleanData(aEntries[0]));
					entry.setPersonId(cleanData(aEntries[1]));
					entry.setFullName(cleanData(aEntries[2]));
					entry.setGender(cleanData(aEntries[3]));
					entry.setCcNumber(cleanData(aEntries[4]));
					entry.setShadowId(cleanData(aEntries[5]));
					entry.setTestType(cleanData(aEntries[6]));
					entry.setSlNumber(cleanData(aEntries[7]));
					entry.setTissueType(cleanData(aEntries[8]));
					entry.setSampleSubtype(cleanData(aEntries[9]));
					entry.setSubmittedDiagnosis(cleanData(aEntries[10]));
					//todo avatar not bringing in these columns yet, making placholder
					entry.setCaptureTestName(cleanData("null"));
					entry.setCaptureDesign(cleanData("null"));
					entry.setCaptureTestDescription(cleanData("null"));

				}else if (importMode.toLowerCase().equals("foundation")) { // Foundation has less items per entry
					entry.setMrn(cleanData(aEntries[0]));
					entry.setPersonId(cleanData(aEntries[1]));
					entry.setFullName(cleanData(aEntries[2]));
					entry.setGender(cleanData(aEntries[3]));
					entry.setShadowId(cleanData(aEntries[4]));
					entry.setTestType(cleanData(aEntries[5]));
					entry.setSlNumber(cleanData(aEntries[6]));
					entry.setSampleSubtype(cleanData(aEntries[7]));
					entry.setTissueType(cleanData(aEntries[8]));
					entry.setSubmittedDiagnosis(cleanData(aEntries[9]));
					entry.setCaptureTestName(cleanData(aEntries[10]));
					entry.setCaptureDesign(cleanData(aEntries[11]));
					entry.setCaptureTestDescription(cleanData(aEntries[12]));

					entry.setCcNumber("");

				}else if(importMode.toLowerCase().equals("tempus")){
					entry.setMrn(cleanData(aEntries[0]));
					entry.setPersonId(cleanData(aEntries[1]));
					entry.setFullName(cleanData(aEntries[2]));
					entry.setGender(cleanData(aEntries[3]));
					entry.setShadowId(cleanData(aEntries[4]));
					entry.setTestType(cleanData(aEntries[5]));
					entry.setSlNumber(cleanData(aEntries[6]));
					entry.setSampleSubtype(cleanData(aEntries[7]));
					entry.setTissueType(cleanData(aEntries[8]));
					entry.setSubmittedDiagnosis(cleanData(aEntries[9]));
					entry.setCaptureTestName(cleanData(aEntries[10]));
					entry.setCaptureDesign(cleanData(aEntries[11]));
					entry.setCaptureTestDescription(cleanData(aEntries[12]));
					entry.setCcNumber("");
				} else if (importMode.toLowerCase().equals("caris")){ //order matters!!
					//todo once we determine db output, import the file here
				}



				if(this.avEntriesMap.get(entry.getPersonId()) != null) {
					TreeMap<String,List<PersonEntry>> existingSLMap = this.avEntriesMap.get(entry.getPersonId());
					if(existingSLMap.get(entry.getSlNumber()) != null) {
						existingSLMap.get(entry.getSlNumber()).add(entry);

					}else {
						existingSLMap.put(entry.getSlNumber(), new ArrayList<PersonEntry>(Arrays.asList(entry)));
					}
					//this.avEntriesMap.get(entry.getMrn()).add(entry);
				}else {
					List<PersonEntry> avEnteries = new ArrayList<PersonEntry>();
					avEnteries.add(entry);
					TreeMap<String,List<PersonEntry>> slMap = new TreeMap<String, List<PersonEntry>>();
					slMap.put(entry.getSlNumber(),avEnteries);
					this.avEntriesMap.put(entry.getPersonId(), slMap);

				}


			}

		} catch (FileNotFoundException e) {
			e.printStackTrace();
			scan.close();
			System.exit(1); //
		}
		finally {
			scan.close();
		}

	}






	private void callXMLImporter(String folderName,String name) throws Exception {


		List<String> importRequestCommands = new ArrayList<String>();
		List<String> importAnalysisCommands = new ArrayList<String>();
		List<String> linkExperimentToAnalysis = new ArrayList<String>();
		List<String> cmdCommands = new ArrayList<String>();

		Query q = new Query(pathOnly + "gnomex-creds.properties");

		importRequestCommands.add("bash " + importScript + " -login adminBatch -file " + outFileName +
				" -annotationFile " + this.annotationFileName + " -isExternal Y"+ " -requestIDList " + pathOnly + "tempRequestList.out" );

		System.out.println(importRequestCommands.get(0));

		String osName = System.getProperty("os.name");
		if(osName.equals("Windows 10")) { //osName.equals("Windows 7")
			//executeCMDCommands(cmdCommands);
		}else {
			executeCommands(importRequestCommands, appendedPathOnly + IMPORT_EXPERIMENT_ERROR);
			String requestID = readInLastEntry(pathOnly + "tempRequestList.out" );
			System.out.print("This is the request Id I retrieved from the file " + requestID);


			Integer analysisID = q.getAnalysisID(name,folderName);
			if(analysisID == -1) { // new Analysis
				String experimentNumber = getCurrentRequestId(pathOnly + "tempRequestList.out") + "R";
				importAnalysisCommands.add("bash create-analysis.sh " + "-lab Bioinformatics "+  "-name " + name +  " -organism human -genomeBuild hg19 -analysisType Alignment -isBatchMode Y "
						+ "-folderName " + "\""+ folderName +"\" " + "-experiment " + experimentNumber + " -server localhost -linkBySample -analysisIDFile " + pathOnly + "tempAnalysisList.out" );

				System.out.println(importAnalysisCommands.get(0));
				executeCommands(importAnalysisCommands,appendedPathOnly  + IMPORT_ANALYSIS_ERROR);
				analysisID = new Integer(readInLastEntry(pathOnly + "tempAnalysisList.out" ));

			}else{ // existing analysis
				if(analysisID != null && !requestID.equals("")){

					if(!q.hasLinkAnalysisExperiment( analysisID, new Integer(requestID))){
						linkExperimentToAnalysis.add("bash LinkExpToAnal.sh -request " + requestID + " -analysis " + analysisID + " -add");
						System.out.println(linkExperimentToAnalysis.get(0));
						executeCommands(linkExperimentToAnalysis,appendedPathOnly  + LINK_EXP_ANAL_ERROR);

					}

				}

				saveAnalysisID(pathOnly + "tempAnalysisList.out",analysisID);
			}

			/*CollaboratorPermission cp = new CollaboratorPermission(this.avEntriesMap.get(name),analysisID,q);
			List<String> irbAssocationList = cp.getIRAAssociation();
			cp.assignAnalysisPermissionToCollabs(irbAssocationList);*/

		}

		q.closeConnection();

	}

	private String readInLastEntry(String fileName) {
		BufferedReader bf = null;
		String id = "";

		try {
			bf = new BufferedReader(new FileReader(fileName));
			String line = "";

			while((line= bf.readLine()) != null){
				String[] idList  = line.split(" ");
				if(idList.length > 0){
					id = idList[idList.length - 1];
				}
			}
		} catch (FileNotFoundException e) {
			e.printStackTrace();
			try { bf.close(); } catch (IOException e1) {
				e1.printStackTrace();
			}
			System.exit(1); //
		}catch (IOException e){
			e.printStackTrace();
			try { bf.close(); } catch (IOException e1) {
				e1.printStackTrace();
			}
		}
		finally {
			try { bf.close(); } catch (IOException e) {
				e.printStackTrace();
			}
		}

		return id;

	}


	private static File createTempScript(List<String> commands) throws IOException {
		File tempScript = File.createTempFile("script", null);

		Writer streamWriter = new OutputStreamWriter(new FileOutputStream(tempScript));
		PrintWriter printWriter = new PrintWriter(streamWriter);


		for(int i =0; i < commands.size(); i++) {
			printWriter.println(commands.get(i));
		}

		printWriter.close();

		return tempScript;
	}

	public static List<String> readFileToList(String fileName){
		List<String> fileContentList = new ArrayList<>();
		try (BufferedReader bf = new BufferedReader(new FileReader(fileName))) {
			String line = "";
			while((line= bf.readLine()) != null){
				fileContentList.add(line);
			}
		} catch (FileNotFoundException e) {
			e.printStackTrace();
			System.exit(1); //
		}catch (IOException e){
			e.printStackTrace();
		}
		return fileContentList;
	}

	public static List<String> executeCommands(List<String> commands, String logDetails, boolean useRedirectFile) {
		StringBuilder strBuild = new StringBuilder();
		File tempScript = null;
		DateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy HH:mm:ss");
		List<String> fileContents = new ArrayList<>();
		if(useRedirectFile){
			String redirectStr = logDetails != null ? " 2>&1 | xargs -I {} echo -e {}'\t' `date '+%D %T'` | tee -a temp.txt;"
					+ " if [ ${PIPESTATUS[0]} -ne 0 ]; then exit 1; fi " : " >> temp.txt 2>&1";  //" [[ ${PIPESTATUS[0]} != 0 ]] && exit 1" : " >> temp.txt 2>&1";
			for(int i = 0; i < commands.size(); i++){
				//output commands stdout and stderr to temp.txt then strip last new line of the last line.
				//Then to that same line append a timestamp
				commands.set(i, commands.get(i) + redirectStr);
				//System.out.println( "adding redirect file to command: " + commands.get(i));
			}
		}
		Process process = null;
		try {
			System.out.println("started executing command");
			tempScript = createTempScript(commands);
			ProcessBuilder pb =  new ProcessBuilder("bash", tempScript.toString());
			pb.inheritIO();
			process	= pb.start();
			process.waitFor();

			if(useRedirectFile){
				fileContents = readFileToList("./temp.txt");
				Files.delete(Paths.get("./temp.txt"));
				if(logDetails != null){
					try(PrintWriter pw  = new PrintWriter(new FileWriter(logDetails, true))) {
						for(String fc : fileContents){
							pw.println(fc);
						}
					} catch (IOException e) {
						e.printStackTrace();
						throw e;
					}
				}
			}


			if(process.exitValue() != 0){
				System.out.println("The subprocess threw an exception");
				System.out.print("Continue Any?: ");
				String response = scanInput.nextLine().toLowerCase();
				process.destroy();
				if(response.equals("n") || response.equals("no")){
					System.exit(1);
				}
			}
			System.out.println("finished executing command");
		}catch(NoSuchFileException e){
			e.printStackTrace();
			if(process != null && process.isAlive()) {
				process.destroy();
			}
			System.exit(1);
		} catch (InterruptedException e) {
			e.printStackTrace();
			if(process != null && process.isAlive()) {
				process.destroy();
			}
			System.exit(1);
		} catch (IOException e1) {
			e1.printStackTrace();
			if(process != null && process.isAlive()) {
				process.destroy();
			}
			System.exit(1);
		}
		finally{
			if(tempScript != null){
				tempScript.delete();
			}
			if(process != null && process.isAlive()) {
				process.destroy();
			}
		}


		return fileContents;
	}





//	public static String[] executeCommands(List<String> commands, String logDetails) {
//		StringBuilder strBuild = new StringBuilder();
//		File tempScript = null;
//		PrintWriter pw = null;
//		DateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy HH:mm:ss");
//
//		try {
//			System.out.println("started executing command");
//
//
//			tempScript = createTempScript(commands);
//			ProcessBuilder pb =  new ProcessBuilder("bash", tempScript.toString());
//			pb.inheritIO();
//			pb.redirectErrorStream(true);
//			//pb.redirectOutput(new File(logDetails));
//			//pb.command("bash", "-c", commands);
//			//tempScript = createTempScript(commands);
//
//			Process process	= pb.start();
//			InputStreamReader inputSR = new InputStreamReader(process.getInputStream());
//			BufferedReader br = new BufferedReader(inputSR);
//			String lineRead;
//			while ((lineRead = br.readLine()) != null) {
//				strBuild.append(lineRead);
//				strBuild.append("\n");
//			}
//
//			process.waitFor();
//
//			if(process.exitValue() != 0){
//				System.out.println("sub process threw an exception");
//				process.destroy();
//				System.exit(1);
//			}else{
//				process.destroy();
//			}
//
//			System.out.println("finished executing command");
//		}
//
//		catch (InterruptedException e) {
//			// TODO Auto-generated catch block
//			e.printStackTrace();
//		} catch (IOException e1) {
//			// TODO Auto-generated catch block
//			if(pw != null ){pw.close();}
//			e1.printStackTrace();
//		}
//		finally{
//			if(pw != null){pw.close();}
//			if(tempScript != null){tempScript.delete();}
//		}
//		return strBuild.toString().split("\n");
//	}


	public static void executeCommands(List<String> commands,String outError) throws Exception {

		File tempScript = null;

		try {
			System.out.println("started executing command");
			tempScript = createTempScript(commands);
			System.out.println("from this temp file " + tempScript.getCanonicalPath() );
			ProcessBuilder pb = new ProcessBuilder("bash", tempScript.toString());
			pb.inheritIO();
			Process process;
			File errorFile = null;

			if(outError != null){
				errorFile = new File(outError);
				pb.redirectError(errorFile);
			}

			process = pb.start();
			process.waitFor();

			if(outError != null){
				if(hasSubProccessErrors(errorFile,process.exitValue())){
					System.out.println("Error detected exiting script");
					throw new Exception("Error detected in executing subprocess");
				}
			}

			System.out.println("finished executing command");
		}

		catch (InterruptedException e) {
			// TODO Auto-generated catch block
			throw new Exception(e);
		} catch (IOException e1) {
			// TODO Auto-generated catch block
			throw new Exception(e1);
		}
		finally {
			tempScript.delete();
		}
	}

	private static boolean hasSubProccessErrors(File errorFile, int exitCode) {
		Scanner scan = null;
		boolean hasError = false;
		try{
			scan = new Scanner(errorFile);
			System.out.println("************************************************************");
			System.out.println("Errors will appear below if found, in this file, " + errorFile.getName());
			while(scan.hasNext()){
				String line = scan.nextLine();
				if((line != null && !line.equals(""))){
					hasError = true;
					System.out.println(line);
				}

			}
			System.out.println("************************************************************");
			if(exitCode != 0){
				hasError = true;
			}
		}catch(FileNotFoundException e){
			if(scan != null){ scan.close(); }
			hasError = false;
		}finally {
			scan.close();
		}
		return hasError;
	}

	private void executeCMDCommands(List<String> commands) {

		File tempScript = null;

		try {
			System.out.println("started executing command");
			tempScript = createTempScript(commands);
			ProcessBuilder pb = new ProcessBuilder("CMD", "/C");
			pb.command(tempScript.toString());
			pb.inheritIO();
			Process process;
			process = pb.start();
			process.waitFor();
			System.out.println("finished executing command");
		}

		catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
		finally

		{
			tempScript.delete();
		}
	}

	private void saveflaggedLog(String path,  StringBuilder report){ // This file is so the person entries can easily be modified and used to reimport flagged data.
		boolean madeDir = new File(path).mkdir();
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		String time = timestamp.toLocalDateTime().toString().replace(" ", "-");
		PrintWriter pw = null;
		try {
			String flaggedEnteriesFile = "flaggedEntries_" + time + ".log";
			pw = new PrintWriter(new FileWriter(path + flaggedEnteriesFile ));
			pw.write(report.toString());

		} catch (IOException e) {
			e.printStackTrace();
			pw.close();
			System.exit(1);
		}finally {
			pw.close();
		}




	}

	private void outFile(String path,String fileName, List<List<String>> flaggedIDs) {
		PrintWriter pw = null;
		Set<String> dupIDSet = new HashSet<>();

		try {
			pw = new PrintWriter(new FileWriter(path + fileName));

			for(int i = 0; i < flaggedIDs.size(); i++) {
				List<String> slIDs = flaggedIDs.get(i);
				if(slIDs.get(1) != null && !slIDs.get(1).equals("")){
					// only true for tempus else no split and index 0 will be the original string
					String sampleID =  slIDs.get(1); // importMode.equals("tempus") && !slIDs.get(1).startsWith("result") ?  slIDs.get(1).split("_")[0] : slIDs.get(1);
					if(dupIDSet.add(sampleID)) {
						if (i < flaggedIDs.size() - 1) {
							pw.write(sampleID + "\n");
						} else {
							pw.write(sampleID);
						}
					}
				}

			}
			pw.close();
			// This the sl or trf list after flagged id's have been removed out
			String name = "";
			// this file is for the FileMover to make the email report of new samples
			if(this.importMode.equals("avatar")){
				name = "importedSLList.out";
			}else if (importMode.equals("foundation")){
				name = "importedTRFList.out";
			}else if (importMode.equals("tempus")){
				name = "importedTLList.out";
			}else {
				name = "importedTNList.out";
			}
			pw = new PrintWriter(new FileWriter(path + name));

			dupIDSet.clear();

			for( String experimentID : this.avEntriesMap.keySet()){
				Map<String, List<PersonEntry>> personInfo = this.avEntriesMap.get(experimentID);
				for(String sampleName : personInfo.keySet()){
					if(sampleName != null && !sampleName.equals("")){
						String sampleID =  sampleName; //importMode.equals("tempus") ?  sampleName.split("_")[0] : sampleName;
						if(dupIDSet.add(sampleID)){
							pw.write(sampleID + "\n");
						}

					}
				}
			}

		} catch (IOException e) {
			e.printStackTrace();
			pw.close();
			System.exit(1);
		}finally {
			pw.close();
		}
	}

	public static String getPathWithoutName(String fullPathWithFile) {
		File file = new File(fullPathWithFile);
		String filePath  = file.getParent();
		return filePath + File.separator;

	}
	public static String appendToPathWithoutName(String fullPathWithFileName, String appendedPath) {

		String pattern = Pattern.quote(System.getProperty("file.separator"));
		String[] splitPath = fullPathWithFileName.split(pattern);
		String filePath = "";
		int index = -1;
		for(int i = 0; i < splitPath.length; i++){
			if(splitPath[i].equals(appendedPath)){
				index = i;
				break;
			}
		}
		if(index != -1){ // if found don't need to append Path
			filePath = String.join(pattern, Arrays.copyOfRange(splitPath, 0 , index + 1));
		}else{// if not found add another subdirectory to path
			List<String> paths = Arrays.asList( Arrays.copyOfRange(splitPath, 0,splitPath.length - 1));
			ArrayList<String> p =  new ArrayList<String>(paths);
			p.add(appendedPath);
			filePath = String.join(File.separator, p);
		}

		return filePath + File.separator;

	}

	public static String getCurrentRequestId(String fileName){
		BufferedReader bf = null;
		String currentId = "";

		try {
			bf = new BufferedReader(new FileReader(fileName));
			String idStr = bf.readLine();
			String[] idArray = idStr.split(" ");
			currentId = idArray[idArray.length - 1];
			System.out.println("Current requestID:  " + currentId );


		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}catch(IOException e){
			e.printStackTrace();
		}
		finally {
			try {
				bf.close();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		return currentId;
	}


	private void saveAnalysisID(String fileName,Integer existingAnalysisID ){

		PrintWriter pw = null;
		try {

			pw = new PrintWriter(new FileOutputStream(new File(fileName), true));
			pw.write(" " + existingAnalysisID + " ");


		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} finally {
			pw.close();
		}

	}



}









/*xpe = XPathFactory.instance().compile("//book[@type='horror']/author", Filters.element());
authList = xpe.evaluate(doc);

for (Element auth : authList) {
	System.out.println(auth.getText().toString());
}*/


// Element auth = rootElement.getChild("book").getChild("author");



/*for (Element el : rootElement.getDescendants(Filters.element())) {
	if(el.getName().equals("samples")) {
		System.out.println(el.getAttributes().toString());
		List<Element> sampleChildren = el.getChildren();
		System.out.println(sampleChildren.toString());
	}
	
}*/
//IteratorIterable<Element> descendantIter = doc.getRootElement().getDescendants(Filters.element());


/*List<Element> childrenNodes = doc.getRootElement().getChildren();
for (Element node : childrenNodes ) {
	
	System.out.println(node.toString());
	if(node.getName().equals("samples")){
		List<Element> sampleList = node.getChildren();
		
		for(Element sample : sampleList ) {
			Attribute fullName = sample.getAttribute("ANNOT26").setValue("Peter");
			System.out.println(fullName.getValue());
			
		}
		
	}
	

	//Content c = descendantIter.next();
	//if (c.getCType() == Content.CType.Element) {
		
		/*if(childNode.getName().equals("samples")) {
			ArrayList<Element> sampleNodes =  child
		}*
		//Attribute id = childNode.getAttribute("id");
		if (id != null && id.getName().equals("bk102")) {
			System.out.println(childNode.getName() + " " + id.toString());
		}
	if(false) {
		
	} else if (c.getCType() == Content.CType.Text) {
		Text t = (Text) c;
		System.out.println(t.getText());
	} else if (c.getCType() == Content.CType.EntityRef) {
		EntityRef ef = (EntityRef) c;
		System.out.println(ef.getName());
	} else if (c.getCType() == Content.CType.Comment) {
		Comment comment = (Comment) c;
		System.out.println(comment.getText());
	}

}*/




