package hci.gnomex.daemon.auto_import;

//import java.util.List;

public class FileMover {

	public static void main(String[] args) {
		
		
		//USAGE:                           inFile, root, skip?
		DirectoryBuilder db = null;
		
		db = new DirectoryBuilder(args);
		if(db.isAccountedMode()){
			db.makeAccountingForFiles();
		}else {

			db.preparePath();
			db.reportWorkSummary();
		}

	}

}
