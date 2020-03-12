package hci.gnomex.daemon.auto_import;

import com.github.fracpete.processoutput4j.output.CollectingProcessOutput;
import com.github.fracpete.rsync4j.RSync;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Scanner;

public class StringModder {

	public static void main(String[] args) throws Exception {
		List<String> stringList = new ArrayList<String>(Arrays.asList("C:\\Users\\u0566434\\Desktop\\ORIEN\\Foundation\\Follow Up\\corrupted_bams.txt",
				"C:\\Users\\u0566434\\Desktop\\ORIEN\\Foundation\\Follow Up\\mv_foundation_2_27-20.txt",
				"C:\\Users\\u0566434\\Downloads\\1GB.zip",
				"C:\\Users\\u0566434\\Downloads\\ideaIU-2018.1.5.exe"));



		RSync rsync = new RSync()
				.sources(stringList)
				.destination("X:\\TEMP\\tempTest")
				.recursive(true);

		CollectingProcessOutput output = rsync.execute();
		System.out.println(output.getStdOut());
		System.out.println("Exit code: " + output.getExitCode());
		if (output.getExitCode() > 0)
			System.err.println(output.getStdErr());


		Scanner scan = new Scanner(System.in);
		String str = "";
		
		while(scan.hasNextLine()) {
			str = scan.nextLine();
			String strEnd = str.substring( str.length() - 1);
			if(strEnd.equals(",")) {
				str = str.substring(0, str.length() - 1);
			}

		}
		
		
		scan.close();
		
		
		PrintWriter pw = new PrintWriter(System.out);
		pw.println(str);
		pw.close();

	}

}
