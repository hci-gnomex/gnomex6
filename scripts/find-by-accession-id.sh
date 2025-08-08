#!/bin/bash

TOMCAT_HOME=../../../
COMMON_LIB=$TOMCAT_HOME/lib

GNOMEX_LIB=../WEB-INF/lib
GNOMEX_CLASSES=../WEB-INF/classes

CLASSPATH=".:$GNOMEX_CLASSES:"

for JAR in $COMMON_LIB/*.jar
do
    CLASSPATH="$CLASSPATH:$JAR"
done

for JAR in $GNOMEX_LIB/*.jar
do
   CLASSPATH="./gnomex1.jar:$CLASSPATH:$JAR"
done

export CLASSPATH


pDataPath="/home/u0566434/parser_data/"
accessionListFile=$1
vendor=$2
stageFolder=$3
analysisPath="/Repository/AnalysisData/2021/A5681/LinkedDatasets/"


#tempus
if [ "$vendor" = "Tempus" ]; then
  tempusLocalDataPath="/Repository/PersonData/2017/10R/Tempus/"
  accessionIDRegex="TL-..-[0-9A-Za-z]*"
  aws --profile tempus s3 sync  s3://tm-huntsman/result_json/ "$stageFolder" --exclude "*" --include "*.json" #make sure stage folder is up to date with json
  echo synced all json files
  cat  $accessionListFile | xargs -I {} grep -l -r --include=*.json {} "$stageFolder"  | sed 's!.*/!!' | awk '{ print "s3://tm-huntsman/result_json/" $1 }' > "$pDataPath"tempusJson.out # grep all accession ids find jsons where they are
  #cat "$pDataPath"localTempusJson.out | xargs -I % sh -c 'python -m json.tool % > /tmp/pretty.json && mv /tmp/pretty.json %;' # beautify json so we can grep it
  grep -F -f "$accessionListFile" "$pDataPath"tempusFastq.out > "$pDataPath"tempusFastq1.out # do a lookup for the pattern in accessionListFile in tempusFastq.out print them out as found. Essentially filter to the accession ids
  mv "$pDataPath"tempusFastq1.out "$pDataPath"tempusFastq.out

  linkPath=" ""$analysisPath""Kidney/""$vendor""/"



  cat "$accessionListFile" | xargs -I {} find "$tempusLocalDataPath" -name "{}"*fastq.gz | xargs -I {} dirname {} | sort -u | awk -v lVar="$linkPath" '$1 ~ "/DNA/" { print "ln -s " $1 lVar "DNA"  }'
  cat "$accessionListFile" | xargs -I {} find "$tempusLocalDataPath" -name "{}"*fastq.gz | xargs -I {} dirname {} | sort -u | awk -v lVar="$linkPath" '$1 ~ "/RNA/" { print "ln -s " $1 lVar "RNA"  }'
  # this section tries to look at every json file to discover all accession ids assocaited with them and then groups them by disease in seperate files
  #  sed gets just base filename awk appends correct path to filename
  #cat "$pDataPath"tempusJson.out |  sed 's!.*/!!' | awk -v sVar=$stageFolder '{ print sVar $1 }' > "$pDataPath"localTempusJson.out

  #cat  "$pDataPath"localTempusJson.out | xargs -I {} # use this if you have accession ids input
  #grep -ilr -m1  '"diagnosis": .*prostat' "$stageFolder" | head -1 | xargs -I {} grep -iHo "$accessionIDRegex" {} > "$pDataPath"tempusProstateGroup.txt
  #grep -il '"diagnosis": .*kidney' {}  | xargs -I {} grep -iHo "$accessionIDRegex" {} > "$pDataPath"tempusKidneyGroup.txt
  #grep -il '"diagnosis": .*bladder' {} | xargs -I {} grep -iHo "$accessionIDRegex" {} > "$pDataPath"tempusBladderGroup.txt



elif [ "$vendor" = "caris" ]; then
  accessionIDRegex="TN..-[0-9A-Za-z]*"
  #this command assumes you will use the mfa script to authenticate first before calling it
  aws --profile caris_mfa s3 sync  s3://hci-caris/ "$stageFolder" --exclude "*" --include "*.xml" #make sure stage folder is up to date with json
  echo synced all json files
  #temporary approach get all xml files and their fileIDs group into cancer type
  #first grep filter to cancer type with xml name as output second looks for the accession id and outputs filename and accession id delimited by a colon. finally awk removes duplicate lines
  find "$stageFolder" -name "*.xml" | xargs -I {} grep -il '<lineage>.*prostat' {} | xargs -I {} grep -iHo "$accessionIDRegex" {} | awk '!seen[$0]++' > "$pDataPath"carisProstateGroup.txt
  find "$stageFolder" -name "*.xml" | xargs -I {} grep -il '<lineage>.*kidney' {} | xargs -I {} grep -iHo "$accessionIDRegex" {} | awk '!seen[$0]++' > "$pDataPath"carisKidneyGroup.txt
  find "$stageFolder" -name "*.xml" | xargs -I {} grep -il '<lineage>.*bladder' {} | xargs -I {} grep -iHo "$accessionIDRegex" {} | awk '!seen[$0]++' > "$pDataPath"carisBladderGroup.txt

  # tr replaces new line with colon (in the shortterm consider do each of these one by one to maintain grouping by disease)
  #tr '\n' ':' < "$pDataPath"carisProstateGroup.txt | xargs -d ":" -n2 sh -c 'grep "RNA_""$2".*"gz" /home/u0566434/parser_data/remoteCarisPath.out' sh > "$pDataPath"remoteCarisPath1.out
  #tr '\n' ':' < "$pDataPath"carisKidneyGroup.txt   | xargs -d ":" -n2 sh -c 'grep "RNA_""$2".*"gz" /home/u0566434/parser_data/remoteCarisPath.out' sh > "$pDataPath"remoteCarisPath1.out
  tr '\n' ':' < "$pDataPath"carisBladderGroup.txt  | xargs -d ":" -n2 sh -c 'grep "RNA_""$2".*"gz" /home/u0566434/parser_data/remoteCarisPath.out' sh > "$pDataPath"remoteCarisPath1.out
  mv "$pDataPath"remoteCarisPath1.out "$pDataPath"remoteCarisPath.out

  #cat tempCarist.txt | xargs -I {} find /Repository/tempdownloads/caris/ -name {} | xargs -I {} echo ln -s {} /Repository/AnalysisData/2021/A5681/LinkedDatasets/Prostate/Caris/RNAFastq02Dec2021


fi