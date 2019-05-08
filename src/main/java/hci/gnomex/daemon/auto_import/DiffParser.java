package hci.gnomex.daemon.auto_import;



import hci.gnomex.utility.MailUtilHelper;

import java.io.FileNotFoundException;
import java.util.List;



public class DiffParser {

	public static void main(String[] args) throws FileNotFoundException {

		MailUtilHelper mailUtilHelper;
		// TODO Auto-generated method stub
		Differ d = new Differ(args);
		d.findDifference();
		//d.writeDiffToFile(dList);	

	}


}
