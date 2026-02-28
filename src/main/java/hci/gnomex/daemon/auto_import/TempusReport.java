package hci.gnomex.daemon.auto_import;

//import org.apache.poi.ss.formula.functions.T;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


public class TempusReport {
    public String fileName;
    public List<File> filesList;
    public Map<String, List<File>> fileMap;
    public String credFile;

    TempusReport(String[] args){
        filesList = new ArrayList<>();
        fileMap = new HashMap<>();
        for (int i = 0; i < args.length; i++) {
            args[i] =  args[i].toLowerCase();

            if (args[i].equals("-file")) {
                fileName = args[++i];
            }else if(args[i].equals("-cred")){
                credFile = args[++i];
            }
            else if (args[i].equals("-help")) {
                //printUsage();
                System.exit(0);
            }
        }

    }

    public void readFile() throws IOException {
        PeekableScanner scan = null;

        try {
            //bf = new BufferedReader(new FileReader(fileName));
            scan = new PeekableScanner(new File(fileName));
            String line = "";


            while(scan.hasNext() ) {//(line= bf.readLine()) != null){
                line= scan.next();
                File f = new File(line);
//                if(!f.exists()){
//                    throw new FileNotFoundException(line + " is missing ");
//                }
                filesList.add(f);
                String fileInListName = f.getName();
                Pattern r = Pattern.compile("^(TL-[0-9]{2}-[A-Za-z0-9]{6}).*");
                Matcher m = r.matcher(fileInListName);
                String id ="";
                if(m.matches()) {
                    id = m.group(1);
                    if(fileMap.get(id) != null){
                        fileMap.get(id).add(f);
                    }else {
                        fileMap.put(id, new ArrayList(Arrays.asList(f)));
                    }
                }

            }
            System.out.println("File size map after reading files: "  + fileMap.size());

        } catch (FileNotFoundException e) {
            e.printStackTrace();
            scan.close();
            System.exit(1); //
        }
        finally {
            scan.close();
        }

    }
    public String getCredFile(){
        return credFile;
    }
    private Map<String,List<File>> getFileMap() {
        return fileMap;
    }

    String generateQueryIDStr() {
        StringBuilder strBuild = new StringBuilder("( ");
        int count = 0;
        for(Map.Entry<String,List<File>> idEntry : fileMap.entrySet()){
            String idKey = idEntry.getKey();
            strBuild.append("\'");
            strBuild.append(idKey);
            if(count < fileMap.size() - 1) {
                strBuild.append("\', ");
            }else {
                strBuild.append("\' ");
            }
            count++;
        }
        strBuild.append(")");
        return strBuild.toString();
    }


    public static void main(String[] args)  {

        TempusReport report = new TempusReport(args);
        try {
            Set<String> allAccessionIDsFromQuery = new HashSet<>();
            List<File> jfhFlaggedList = new ArrayList<>();
            List<File> dbJsonMissingList = new ArrayList<>();

            report.readFile();
            Query q = new Query(report.getCredFile());
            String queryIDStr = report.generateQueryIDStr();
            List<String> idsWithPersonID =  q.tempusWithPersonID(queryIDStr, allAccessionIDsFromQuery);
            Map<String, List<File>> fm =  report.getFileMap();
            for(String id: idsWithPersonID){
                jfhFlaggedList.addAll(fm.get(id));
            }

            for(String fmKey : fm.keySet()){
                if(!allAccessionIDsFromQuery.contains(fmKey)){
                    dbJsonMissingList.addAll(fm.get(fmKey));
                }
            }
            StringBuilder strBuild = new StringBuilder("Showing accession ids of patients that have hci person ID assigned in database yet are flagged \n");
            File[] jfhFlaggedArray = jfhFlaggedList.toArray(new File[0]);
            Arrays.sort(jfhFlaggedArray, Comparator.comparingLong(File::lastModified).reversed());
            for(File jfhFile :jfhFlaggedArray){
                strBuild.append(jfhFile.getName() );
                strBuild.append("\t");
                strBuild.append(new SimpleDateFormat("MM-dd-yyyy HH:mm:ss")
                        .format(new Date(jfhFile.lastModified())));
                strBuild.append("\n");
            }
            strBuild.append("Showing accession ids of patients that we have the files but jsons are not imported into the database\n");
            File[] dbJsonMissingArray = dbJsonMissingList.toArray(new File[0]);
            //lamda function short had for f -> getLaModified
            Arrays.sort(dbJsonMissingArray, Comparator.comparingLong(File::lastModified).reversed());
            for(File dbJsonFile :dbJsonMissingArray){
                strBuild.append(dbJsonFile.getName() );
                strBuild.append("\t");
                strBuild.append(new SimpleDateFormat("dd-MM-yyyy HH-mm-ss")
                        .format(new Date(dbJsonFile.lastModified())));
                strBuild.append("\n");
            }
            System.out.println(strBuild.toString());

        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
            System.exit(1);
        }

    }




}
