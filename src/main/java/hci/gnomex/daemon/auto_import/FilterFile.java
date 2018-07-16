package hci.gnomex.daemon.auto_import;


import java.io.File;
import java.io.FileNotFoundException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class FilterFile {

	public static void main(String[] args) {

		String inFile = "";
		String remoteChecksumFile = ""; // the checksums on where generated before files where uploaded to our disk
		String localChecksumFile = ""; // the checksums where generated by us on the file list
		String remoteFileList = ""; // the list of only xml and pdf files (small files)
		String credFile ="";


		List<String> smallFilesList = new ArrayList<String>();


		if(args.length == 5) {
			inFile = args[0];
			remoteChecksumFile = args[1]; // output
			localChecksumFile = args[2]; // output
			remoteFileList = args[3]; //output: pdf and xml files
			credFile=args[4];
			System.out.println("credFile: " + credFile);


		}else {
			System.out.println("Please provide the name of input file and the name of remote checksum out file. Then the local checksum out file");
			System.exit(1);
		}



		FoundationContainer fContainer = new FoundationContainer();
		PeekableScanner scan = null;
		try {
			scan = new PeekableScanner(new File(inFile));


		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		String currentLine = "";
		String regex = "^(.*)((T|C)RF[a-zA-Z0-9]+_?[a-zA-Z]*)\\.(.*)$";
		Pattern r = Pattern.compile(regex);
		Query query = new Query(credFile);

		String newGroup = "";


		while(scan.hasNext()) {
			currentLine = scan.next();

			Matcher m = r.matcher(currentLine);

			String path = "";
			String fileName = "";
			String extension ="";
			String fullFileName = "";

			if(m.matches()) {
				path = m.group(1);
				fileName = m.group(2);
				extension= m.group(4);
				fullFileName =  fileName+"."+extension;
			}


			String[] splitExtension = null;
			splitExtension = extension.split("\\.");

			if(extension.equals("xml")){
				boolean processed  = hasXMLBeenProcessed(fullFileName,query, currentLine);
				if(!processed){
					continue;
				}else{
					// this creates a new de-identified file based off the given xml file
					DeIdentifier.removePHI(currentLine);
					smallFilesList.add(fileName + ".deident.xml"); // don't need full path. It will get added back before being moved
				}
			}




			if(extension.equals("pdf") || extension.equals("xml"))  { // for xml and pdf files
				smallFilesList.add(fullFileName);
			}else if(splitExtension[splitExtension.length - 1 ].equals("md5")) {

				String[] excludeEndList = Arrays.copyOfRange(splitExtension, 0, splitExtension.length - 1);
				String excludeEnd =  String.join(".", excludeEndList);

				String key = "";
				if(path.equals("")) {
					key = path + fileName + "." + excludeEnd;
				}else {
					key = path  + fileName + "." + excludeEnd;
				}



				String value = fContainer.getLargeFileValue(key);
				if(value != null) {

					fContainer.addLargeFile(key, currentLine);
					try {
						String checksum = fContainer.loadCheckSum( currentLine);
						String sumWithFile = checksum + "  "+ key;
						fContainer.writeCheckSumList(remoteChecksumFile, sumWithFile);


					} catch (Exception e) {
						e.printStackTrace();
					}

				}


			}else { // bam and bia files
				fContainer.addLargeFile(currentLine,"");

			}

		} // end of while

		query.closeConnection();
		fContainer.writeSmallFilesList(remoteFileList, smallFilesList );
		fContainer.makeLocalCheckSums(localChecksumFile);


	}

	private static boolean hasXMLBeenProcessed(String fileName,Query q, String pathWithName) {
		boolean processed = false;

		File file = new File(pathWithName);
		System.out.println(pathWithName);
		if(!file.exists()){
			System.out.println("The file doesn't exist");
			return processed;
		}

		Date d = new Date(file.lastModified());
		Instant instDate =d.toInstant();


		List xmlStatusList =  q.getXMLFileStatus(fileName);
		for(int i = 0; i < xmlStatusList.size(); i++){
			ArrayList row = (ArrayList)xmlStatusList.get(i);

			Timestamp timestamp = ((java.sql.Timestamp)row.get(1));
			Instant instTimeStamp = timestamp.toInstant();
			if(instTimeStamp.equals(instDate)){
				processed = true;
				System.out.println("This file has been processed :) ");
				break;
			}else{
				System.out.println("The file hasn't been processed  ");
				System.out.println("On disk the time is: " + d.toString() + " in DB " + timestamp.toString());

			}


		}


		return processed;

	}



}
