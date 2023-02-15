package hci.gnomex.daemon.auto_import;

public class DownloadMain {

	public static void main(String[] args) {
		
		try {
			
			Downloader d = new Downloader(args);
			d.loadFileNames();
			if(d.getMode().equals("avatar")){
				d.executeAvatarDownload();
			}else if(d.getMode().contains("tempus") || d.getMode().contains("caris") ||
					d.getMode().contains("foundation")) {
				d.executeAWSS3Download();
			}

			//System.out.println(d.getFileNameList().toString());
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		

	}

}
