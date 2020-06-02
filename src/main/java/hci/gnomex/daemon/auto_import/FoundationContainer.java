package hci.gnomex.daemon.auto_import;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

public class FoundationContainer {

	private List<String> smallFilesList;
	private Map<String,String> largeFilesMap;

	public FoundationContainer() {
		smallFilesList = new ArrayList<String>();
		largeFilesMap = new HashMap<String,String>();
	}


	public List<String> getSmallFilesList() {
		return smallFilesList;
	}

	public String getLargeFileValue(String key) {
		return largeFilesMap.get(key);
	}





	public void addSmallFile(String smallFile){
		this.smallFilesList.add(smallFile);
	}
	public void addLargeFile(String key, String value) {
		largeFilesMap.put(key, value);

	}



	public String loadCheckSum(File sumFile) throws Exception{


		FileReader reader = null;
		String line ="";

		try {
			reader = new FileReader(sumFile);
			BufferedReader buffReader = new BufferedReader(reader);
			line = buffReader.readLine();

		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();

		}
		finally{
			reader.close();
		}
		return line;

	}

	public void  writeCheckSumList(String fileName, String fileContent) {
		PrintWriter pw = null;
		try {
			pw = new PrintWriter(new FileOutputStream(new File(fileName), true));
			pw.println(fileContent);
			pw.close();

		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}finally {
			pw.close();
		}

	}

	public void  writeFilesList(String fileName, List<String> fileContent) {
		PrintWriter pw = null;

		try {
			pw = new PrintWriter(fileName);
			for(String content : fileContent) {
				pw.println(content);
			}

		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}finally {
			pw.close();
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




	public void makeLocalCheckSums( List<String> filterOutList, List<String> fileList) {
		StringBuilder strBuild = new StringBuilder();
		int count = 0;
		System.out.println("Building local checksum files list");

		System.out.println("Bam set Map size: " + largeFilesMap.size());
		for (Map.Entry<String, String> entry : largeFilesMap.entrySet()) {
			String bamFile = entry.getKey();
			String fileChecksum = entry.getValue();

			if(!isCompletelyWritten(new File(bamFile))){
				filterOutList.add(bamFile);
				filterOutList.add(bamFile+".md5");
				continue;
			}

			strBuild.append("md5sum ");
			strBuild.append(bamFile);
			System.out.println(strBuild.toString());

			List<String> localChecksumOutput = XMLParser.executeCommands(new ArrayList(Arrays.asList(strBuild.toString())),null,true);
			String localChecksumWithBam =  localChecksumOutput.size() > 0 ? localChecksumOutput.get(0) : null;
			System.out.println("This is the local checksum: " + localChecksumWithBam);
			String localChecksum = localChecksumWithBam != null ?  localChecksumWithBam.split(" ")[0] : "";
			strBuild.setLength(0);

			
			// file is corrupt need to filter it out and move it
			if(!localChecksum.equals(fileChecksum)){
				System.out.println(bamFile);
				System.out.println("no match: " + localChecksum + "  " + fileChecksum );
				//moveCorruptedFile(bamFile, filterOutList);
				//moveCorruptedFile(bamFile + ".md5", filterOutList);
			}else{
				// we finally know its safe to add md5 and its bam
				if(!bamFile.endsWith("bai")){ // don't check bai since it is not valid check for samtools
					List<String> samtoolsOutput = XMLParser.executeCommands(new ArrayList(Arrays.asList("/usr/local/bin/samtools quickcheck " + bamFile)),null,true);
					String samtoolsError =  samtoolsOutput.size() > 0 ? samtoolsOutput.get(0) : null;
					System.out.println("samtools Test for " + bamFile);
					if(samtoolsError == null || samtoolsError.equals("")){
						fileList.add(bamFile);
						fileList.add(bamFile+".md5");
					}else{
						System.out.print("samtools Error: " + samtoolsError);
						//moveCorruptedFile(bamFile, filterOutList);
						//moveCorruptedFile(bamFile + ".md5", filterOutList);
					}
				}else{
					fileList.add(bamFile);
					fileList.add(bamFile+".md5");
				}

			}

			strBuild = new StringBuilder();

		}

	}
	/* this approach deals with testing if the file is locked as another proccess
	 could be writing to it. If it is locked it throws an exception.
	 It would be better if Foundation had lock file when the proccess
	 was writing and delete it when it was finished
	 */
	private boolean isCompletelyWritten(File file) {
		RandomAccessFile stream = null;
		try {
			stream = new RandomAccessFile(file, "rw");
			return true;
		} catch (Exception e) {
			System.out.println("Skipping file " + file.getName() + " for this iteration due it's not completely written");
		} finally {
			if (stream != null) {
				try {
					stream.close();
				} catch (IOException e) {
					System.out.println("Exception during closing file " + file.getName());
				}
			}
		}
		return false;
	}
	// this method makes assumption you'll have folder called Corrupted one folder up
	private static boolean moveCorruptedFile(String filePath, List<String> filterOutList){
		Path fileToMove = Paths.get(filePath);
		String corruptedDirectory = fileToMove.getParent().getParent().toString() + "/Corrupted/";
		Path targetPath = Paths.get(corruptedDirectory);
		try {
			Path corruptedPath = Files.move(fileToMove,targetPath.resolve(fileToMove.getFileName()));
			filterOutList.add(corruptedPath.toString());
			return true;
		} catch (IOException e) {
			e.printStackTrace();
			return false;
		}
	}


	public void mergeLargeFileMapToFileList(List<String> fileList) {
		List<String> largeFiles = new ArrayList<>(largeFilesMap.keySet());
		fileList.addAll(largeFiles);

	}
}



