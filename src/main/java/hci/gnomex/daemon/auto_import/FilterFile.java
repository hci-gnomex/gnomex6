package hci.gnomex.daemon.auto_import;


import java.io.*;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class FilterFile {

	public static void main(String[] args) {
		/* filter file was written for filtering out files that don't have their associated checksum and vice versa.
		 *  It also serves to write all non filter files and put the checksums into one file so the next script can ingest it
		 *  Update we no longer enforce there to be a checksum with the file because we don't run the checksum against */

		String inFile = "";
		String remoteChecksumFile = ""; // the checksums on where generated before files where uploaded to our disk
		String localChecksumFile = ""; // the checksums where generated by us on the file list
		String remoteFileList = ""; // the list of only xml and pdf files (small files)
		String credFile ="";
		String filteredFile = "";
		String filterRegex = "";
		String dataPath = "";


		List<String> fileList = new ArrayList<String>();
		List<String> filterOutList = new ArrayList<String>();


		if(args.length == 6) {
			inFile = args[0];
			remoteFileList = args[1]; //output: pdf and xml files
			credFile=args[2];
			filteredFile=args[3]; // output: The files that were filtered out
			System.out.println("credFile: " + credFile);
			filterRegex=args[4];
			dataPath=args[5];


		}else {
			System.out.println("Usage: ./FilterFile.java \n"+
					"arg0 inFile [Input: the main input source file for the script it is the list of file to be filtered ]\n" +
					"arg1 fileList [Output: The list of files that weren't filtered out ]\n " +
					"arg2 credFile [Input: credentials to make database connection for xml file]\n " +
					"arg3 FilteredFileList [Output: Files that were filtered out because they hadn't been processed or were missing their file pair ie. bam without bam checksum ]\n " +
					"args4 filterRegex [Input: The regex that can be used get segements of file name, extension and  path ]\n"+
					"args5 dataPath [Input: The path to where the files reside, used if the inFile list doesn't provide paths ]\n") ;
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

		Pattern r = Pattern.compile(filterRegex);
		Query query = new Query(credFile);
		System.out.println(r.toString());

		String newGroup = "";


		while(scan.hasNext()) {
			currentLine = scan.next();

			Matcher m = r.matcher(currentLine);

			String path = "";
			String fileID = "";
			String nucType = "";
			String fileName = "";
			String extension ="";
			String fullFileName = "";

			if(m.matches()) {
				path = m.group(1);
				fileID = m.group(2);
				nucType= m.group(3);
				fileName = nucType.equals("") ? fileID : fileID + nucType;
				extension = m.group(4);

//				System.out.println("path: " + path);
//				System.out.println("filename: " + fileName);
//				System.out.println("extension: " + extension);

				fullFileName =  fileName+"."+extension;
			}else{
				System.out.println();
				System.out.println("The current path doesn't match anything: ");
				System.out.println(currentLine);
				continue;
			}


			String[] splitExtension = null;
			splitExtension = extension.split("\\.");
			List<String> extList = new ArrayList<>(Arrays.asList( splitExtension));


			if(extension.equals("xml")){
				//todo issue if no path is just filename. tried to have way fix but currentline is pass by value, its a rare case
				boolean processed  = hasXMLBeenProcessed(fullFileName,query, currentLine,dataPath);
				if(!processed){
					// unprocessed list
					filterOutList.add(currentLine);
					continue;
				}else{
					// this creates a new de-identified file based off the given xml file
					DeIdentifier.removePHI(currentLine);
					fileList.add(currentLine);
					fileList.add( path + fileName + ".deident.xml");
				}
			}else if(extension.equals("pdf")){
				fileList.add(currentLine);
			}else if (extList.contains("bam")) {

				int extLength = extList.size() - 1;
				String md5 = "";
				String bamOrBia = "";
				File md5File = null;
				File bamOrBiaFile = null;

				if(extList.get(extLength).equals("md5")){
					extList.remove(extLength);
					String excludeMD5 =  String.join(".", extList);
					bamOrBia = path  + fileName + "." + excludeMD5;
					md5File = new File(currentLine);
					bamOrBiaFile = new File(bamOrBia);
				}else{
					extList.add("md5");
					String addMD5 = String.join(".",extList);
					md5 = path  + fileName + "." + addMD5;
					md5File = new File(md5);
					bamOrBiaFile = new File(currentLine);
				}
				if(currentLine.contains("ORD-0700198-01_DNA")){
					System.out.print("found ");
					System.out.println(currentLine);
				}


				if(bamOrBiaFile.exists() && md5File.exists()){
					try {
						String checksum = fContainer.loadCheckSum(md5File);
						fContainer.addLargeFile(bamOrBiaFile.getCanonicalPath(), checksum);
					} catch (Exception e) {
						e.printStackTrace();
					}
				}else{
					filterOutList.add(currentLine);
				}
			}

		} // end of while

		query.closeConnection();
		System.out.print("key  /mnt/win/Results/ORD-0700198-01_DNA.bam  value:  ");
		System.out.print(fContainer.getLargeFileValue("/mnt/win/Results/ORD-0700198-01_DNA.bam") );
		System.out.println();

		fContainer.makeLocalCheckSums(filterOutList,fileList);
		fContainer.writeFilesList(remoteFileList, fileList );
		outFile(filteredFile, filterOutList);

	}

	private static boolean hasXMLBeenProcessed(String fileName,Query q, String pathWithName,String localDataPath) {
		boolean processed = false;

		File file = new File(pathWithName.toString());

		if(!file.exists()){
			pathWithName = localDataPath + File.separator + pathWithName;
			file = new File(pathWithName.toString());
			if(!file.exists()){
				System.out.println(pathWithName);
				System.out.println("The file doesn't exist");
				return processed;
			}

		}

		Date d = new Date(file.lastModified());
		Instant instDate =d.toInstant();


		List xmlStatusList =  q.getXMLFileStatus(fileName);
		for(int i = 0; i < xmlStatusList.size(); i++){
			ArrayList row = (ArrayList)xmlStatusList.get(i);

			Timestamp timestamp = ((java.sql.Timestamp)row.get(1));
			Instant instTimeStamp = timestamp.toInstant();
			System.out.println(pathWithName);
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

	private static void outFile(String fileName, List<String> filteredList ) {
		PrintWriter pw = null;

		try {
			pw = new PrintWriter(new FileWriter(fileName));

			for( String corrupt : filteredList){
				pw.write(corrupt + "\n");
			}

		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			pw.close();
			System.exit(1);
		}finally {
			pw.close();
		}
	}




}
