package hci.gnomex.daemon.auto_import;

import java.io.PrintWriter;
import java.util.*;

public class StringModder {

	public static void main(String[] args) {
		boolean sort = false;
		String delimiter = "";
		String strip = "";

		for (int i = 0; i < args.length; i++) {
			args[i] =  args[i].toLowerCase();

			if(args[i].equals("-sort"))
				sort = true;
			if (args[i].equals("-delimit")) {
				delimiter = args[++i];
			}
			if (args[i].equals("-strip")) {
				strip = args[++i];
			}
		}

		List<String> stringList = new ArrayList<String>();

		Scanner scan = new Scanner(System.in);

		String str = "";
		if(!strip.equals("")){
			while(scan.hasNextLine()) {
				str = scan.nextLine();
				String strEnd = str.substring( str.length() - 1);
				if(strEnd.equals(strip)) {
					str = str.substring(0, str.length() - 1);
				}

			}
		}

		Map<String, String> sortMap = new TreeMap<>();
		if(sort){
			while(scan.hasNextLine()) {
				String line = scan.nextLine();
				String[] lineArray = line.split(delimiter);
				sortMap.put(lineArray[lineArray.length - 1], line);
			}
			for(Map.Entry<String,String> entry : sortMap.entrySet()){
				str += entry.getValue() + "\n";
			}
		}
		
		scan.close();

		PrintWriter pw = new PrintWriter(System.out);
		pw.println(str);
		pw.close();

	}

}
