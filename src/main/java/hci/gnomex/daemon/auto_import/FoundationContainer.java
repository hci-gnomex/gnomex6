package hci.gnomex.daemon.auto_import;

import java.io.*;
import java.lang.reflect.Array;
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



	private String executeCommands(String command) {

		File tempScript = null;
		StringBuilder strBuild = new StringBuilder();
		ProcessBuilder pb = new ProcessBuilder();
		pb.redirectErrorStream(true);
		pb.command("bash", "-c", command);
		try {
			System.out.println("started executing command");
			//tempScript = createTempScript(commands);

			Process process	= pb.start();

			InputStreamReader inputSR = new InputStreamReader(process.getInputStream());
			BufferedReader br = new BufferedReader(inputSR);
			String lineRead;
			while ((lineRead = br.readLine()) != null) {
				strBuild.append(lineRead);
			}

			process.waitFor();
			process.destroy();
			System.out.println("finished executing command");
		}

		catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
		finally{
			//tempScript.delete();
		}
		return strBuild.toString();
	}

	public void makeLocalCheckSums( List<String> filterOutList, List<String> fileList) {
		StringBuilder strBuild = new StringBuilder();
		int count = 0;
		System.out.println("Building local checksum files list");


		for (Map.Entry<String, String> entry : largeFilesMap.entrySet()) {
			String bamFile = entry.getKey();
			String fileChecksum = entry.getValue();
			if(!isCompletelyWritten(new File(bamFile))){
				filterOutList.add(bamFile);
				continue;
			}


			strBuild.append("md5sum ");
			strBuild.append(bamFile);
			strBuild.append(";");
			System.out.println(strBuild.toString());

			String localChecksumWithBam = this.executeCommands(strBuild.toString());
			String localChecksum = localChecksumWithBam.split(" ")[0];

			// file is corrupt need to filter it out and move it
			if(!localChecksum.equals(fileChecksum)){
				System.out.println(bamFile);
				System.out.println("no match: " + localChecksum + "  " + fileChecksum );
				filterOutList.add(bamFile);
				filterOutList.add(bamFile+".md5");
				moveCorruptedFile(bamFile);
				moveCorruptedFile(bamFile + ".md5");
			}else{
				// we finally know its safe to add md5 and its bam
				fileList.add(bamFile);
				fileList.add(bamFile+".md5");
			}

			strBuild = new StringBuilder();

			break;

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
	private static boolean moveCorruptedFile(String filePath ){
		Path fileToMove = Paths.get(filePath);
		Path targetPath = Paths.get(fileToMove.getParent().getParent().toString() + "/Corrupted/");
		try {
			Files.move(fileToMove,targetPath.resolve(fileToMove.getFileName()));
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



