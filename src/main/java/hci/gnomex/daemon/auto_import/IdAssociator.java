package hci.gnomex.daemon.auto_import;

import org.opensaml.xmlsec.signature.P;

import java.io.*;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/* The goal of this script is to associate ids from one file with another 'generically' aka with regexs.
  The Flagged ID File will be added with the newly found associated IDs.
  If more than one group is used in regex we assume the first group to be the primary group (the unique id)
  all else will be considered sub groups(not unique) of the primary group giving further distinction of the id.
  Order matters
*/
public class IdAssociator {

    public static void main(String[] args) {
        int primaryIndex = 1;
        Map<String,List<String>> flaggedIDsMap = new TreeMap<>();
        Map<String,List<String>> allIDsMap = new TreeMap<>();
        Set<String> subGroups = new HashSet<String>();
        Map<String,List<String>> joinGroups = new TreeMap<>();
        List<String> groupKeys = new ArrayList<>();
        IdAssociator idAssociator = new IdAssociator();
        String allIDsFile = "";
        String flaggedIDsFile = ""; // th
        String regex = "";
        //System.out.println("before the for loop");

        try {

            for (int i = 0; i < args.length; i++) {
                args[i] =  args[i].toLowerCase();

                if(args[i].equals("-pr")) // primary index aka the unique part of the id. This index finds specific group in the regex
                    primaryIndex = Integer.parseInt(args[++i]);
                else if (args[i].equals("-ids")) {
                    allIDsFile = args[++i];
                    //System.out.println("ids: " + allIDsFile);
                } else if (args[i].equals("-flaggedids")) {
                    flaggedIDsFile = args[++i];
                    //System.out.println("flagged ids: " + flaggedIDsFile);
                } else if (args[i].equals("-regex")) {
                    regex = args[++i];
                    //System.out.println("regex : " + regex);
                } else if(args[i].equals("-joingroup")){
                    //System.out.println(" join group: ");
                    // key value pairs:
                    // example rna -> t-rsq groups:  'RNA/TL-19-39499B-RNA' with 'RNA/TL-19-39499B_T_RSQ1_1,  RNA/TL-19-39499B_T_RSQ1_2'
                    // rational, data vendors can vary in their file-naming convention between files that need to be associated with each other
                    // for example fastq.gz.md5 should be kept with their fastq counterparts however the naming convention could vary.
                    // another example could be the meta-data file typically .xml or .json could have variation need to be able pair it with up its bam or fastq files
                    // as long is there is a unique part of the id so we can group all the files in the set. Then we can pair up the sub groups that aren't unique. using this
                    // -joingroup parameter
                    i++;
                    while(i  < args.length && args[i].charAt(0) != '-'){
                        //captureGroupIndexes.add(Integer.parseInt(args[i]));
                        String key = args[i].toLowerCase();
                        String val = args[i+1].toLowerCase();

                        if(joinGroups.get(key) != null){
                            joinGroups.get(key).add(val);
                        }else {
                            joinGroups.put(key, new ArrayList(Arrays.asList(val)));
                        }

                        i = i + 2 ;
                    }
//                    for(Map.Entry<String, List<String>> entry : joinGroups.entrySet()){
//                        System.out.print(entry.getKey() + " -> " );
//                        for(String val : entry.getValue()){
//                            System.out.print(val + " ");
//                        }
//                        System.out.println();
//                    }
                }
            }
            //System.out.println("after the for loop");
            //System.out.println("all ids");
            idAssociator.readFile(allIDsFile, allIDsMap, regex, subGroups, primaryIndex, groupKeys, joinGroups );
            //System.out.println("flagged ids");
            idAssociator.readFile(flaggedIDsFile,flaggedIDsMap,regex, subGroups, primaryIndex, groupKeys, joinGroups);
            //System.out.println("all ids size: " + allIDsMap.size() + " flagged ids size: " + flaggedIDsMap.size());
            idAssociator.addAssociatedIDs(flaggedIDsMap,allIDsMap);

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
    private void  addAssociatedIDs(Map<String,List<String>> queryMap, Map<String,List<String>> allIDMap){
        PrintWriter pw = new PrintWriter(System.out);
        Set<String> excludeDup = new HashSet<>();

        for(Map.Entry<String,List<String>> entry : queryMap.entrySet() ){
            String queryKey = entry.getKey();
            List<String> queryValueList = entry.getValue();
            List<String> targetValueList = allIDMap.get(queryKey);
            if(targetValueList == null){
//                System.out.println("The flagged id "  + queryKey + "  considered to be a subset of the AllIDs but wasn't found. Something is wrong");
//                System.exit(1);
                continue;
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
    public void readFile(String fileName, Map<String, List<String>> idMap, String regex,
                         Set<String> subGroups, int primaryIndex,
                         List<String> groupKeys,Map<String, List<String>> joinGroupMap) throws IOException {
        BufferedReader bf = null;


        try {
            bf = new BufferedReader(new FileReader(fileName));
            String line = "";
            Pattern p = Pattern.compile(regex);
            boolean allIdsExecution = groupKeys.size() == 0;

            while((line = bf.readLine()) != null) {
                Matcher m = p.matcher(line);

                if(m.matches()) {
                    List<Integer> range = IntStream.range(1, m.groupCount() + 1).boxed().collect(Collectors.toList());
                    String idMatched = Differ.constructIDbySubGrouping(range,m,subGroups,primaryIndex).toLowerCase();
                    //here we find all ids that will be joined into another id group
                    if(allIdsExecution){
                        String primaryGroup = idMatched.split("-")[primaryIndex - 1]; // primary group in regex starts at 1 here it start at 0
                        for(String key : joinGroupMap.keySet()){
                            String groupConstruct = primaryGroup + "-" + key;
                            if(groupConstruct.equals(idMatched)) {
                                groupKeys.add(groupConstruct);
                            }
                        }
                    }

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

            if(allIdsExecution && joinGroupMap.size() > 0){
                joinGroups(idMap,joinGroupMap,groupKeys, primaryIndex);
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

    private void joinGroups(Map<String, List<String>> idMap, Map<String, List<String>> joinGroupMap, List<String> groupKeys, int primaryIndex) {
        for(String groupKey : groupKeys) {
            StringBuilder strBuild = new StringBuilder();
            String[] groupKeySplit = groupKey.split("-");
            String primaryGroup = "";
            for(int i = 0; i < groupKeySplit.length; i++){
                if(primaryIndex - 1 == i){
                    primaryGroup = groupKeySplit[i];
                    continue;
                }
                strBuild.append( groupKeySplit[i] );
                strBuild.append(i < groupKeySplit.length - 1 ? "-" : "");
            }
            List<String> fromJoinGroupIds = idMap.get(groupKey);
            List<String> toJoinGroup = joinGroupMap.get(strBuild.toString());
            String toKey = null;
            // only need to find one of the toGroup to join with
            for(String toJoin : toJoinGroup){
                strBuild = new StringBuilder();
                strBuild.append(primaryGroup);
                strBuild.append("-");
                strBuild.append(toJoin);

                if(idMap.get(strBuild.toString() ) != null ){
                    toKey = strBuild.toString();
                    break;
                }
            }
            if(toKey != null){
                idMap.get(toKey).addAll(fromJoinGroupIds);
            }
        }
    }


}
