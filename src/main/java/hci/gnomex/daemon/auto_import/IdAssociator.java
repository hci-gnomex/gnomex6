package hci.gnomex.daemon.auto_import;

import org.opensaml.xmlsec.signature.P;

import java.io.*;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/* The goal of this script is to associate ids from one file with another 'generically' aka with regexs.
  The Flagged ID File will be added with the newly found associated IDs.
*/
public class IdAssociator {
    public static void main(String[] args) {
        Map<String,List<String>> flaggedIDsMap = new HashMap<>();
        Map<String,List<String>> allIDsMap = new HashMap<>();

        try {
            String allIDsFile = "";
            String flaggedIDsFile = ""; // th
            String regex = "";
            if (args.length == 3 ){
                allIDsFile = args[0];
                flaggedIDsFile = args[1];
                regex = args[2];
            }else {
                System.out.println("Please provide 3 paramaters allIDs, flaggedIDs and regex in that order");
                System.exit(1);
            }
            readFile(allIDsFile, allIDsMap, regex);
            readFile(flaggedIDsFile,flaggedIDsMap,regex);
            addAssociatedIDs(flaggedIDsMap,allIDsMap);

            //System.out.println(d.getFileNameList().toString());
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }

    }

    private static String transformFromFileNameToID(String fileName, Set<String> excludeDupSet){
        //remove path
        String pattern = Pattern.quote(System.getProperty("file.separator"));
        String[] pathChunks = fileName.split(pattern);
        String noPathFile = pathChunks[pathChunks.length - 1];
        String idName = noPathFile.split("\\.")[0];
        return idName;
    }
    private static void  addAssociatedIDs(Map<String,List<String>> queryMap, Map<String,List<String>> allIDMap){
        PrintWriter pw = new PrintWriter(System.out);
        Set<String> excludeDup = new HashSet<>();

        for(Map.Entry<String,List<String>> entry : queryMap.entrySet() ){
            String queryKey = entry.getKey();
            List<String> queryValueList = entry.getValue();
            List<String> targetValueList = allIDMap.get(queryKey);
            if(targetValueList == null){
                System.out.println("The flagged id "  + queryKey + "  considered to be a subset of the AllIDs but wasn't found. Something is wrong");
                System.exit(1);
            }

            if(targetValueList.size() > queryValueList.size()){
                for(String targetValue: targetValueList){
                    String id = transformFromFileNameToID(targetValue,excludeDup);
                    if (excludeDup.add(id)) {
                        pw.println(id);
                    }
                }
            }else{
                for(String queryValue: queryValueList){
                    String id = transformFromFileNameToID(queryValue,excludeDup);
                    if (excludeDup.add(id)) {
                        pw.println(id);
                    }
                }
            }
        }
        pw.close();


    }
    public static void readFile(String fileName, Map<String, List<String>> idMap, String regex) throws IOException {
        BufferedReader bf = null;

        try {
            bf = new BufferedReader(new FileReader(fileName));
            String line = "";
            Pattern p = Pattern.compile(regex);

            while((line = bf.readLine()) != null) {
                Matcher m = p.matcher(line);

                if(m.matches()) {
                    String idMatched = Differ.getNameByExistingCaptureGroup(m).toLowerCase();
                    if(idMap.get(idMatched) != null){
                        idMap.get(idMatched).add(line);
                    }else{
                        List<String> fileIDList = new ArrayList<>();
                        fileIDList.add(line);
                        idMap.put(idMatched, fileIDList);
                    }

                }else{
                    System.out.println("Warning the following ID wasn't able to be matched " + line + " by this pattern " + p.pattern() );
                }

            }

        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }catch (Exception e){
            e.printStackTrace();
        }
        finally {
            bf.close();
        }
    }



}
