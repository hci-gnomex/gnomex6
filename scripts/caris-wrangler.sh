#!/usr/bin/env bash
tomcatScriptPath="/usr/share/apache-tomcat-7.0.79/webapps/gnomex/scripts/"
pDataPath="/home/u0566434/parser_data/"
downloadPath="/Repository/tempdownloads/caris/"
carisLocalDataPath="/Repository/PersonData/2017/5031R/Caris/"
#important the .* is greedy matches more than it should if you put a ? in front it gets only the first occurrence
regex=".*?(DNA|RNA)?_?(TN[0-9]{2}-[A-Za-z0-9]{6,7})(.*?)\.(.*)"
diffRegex=".*?(DNA|RNA)?_?(TN\d{2}-[A-Za-z0-9]{6,7})(.*?)\.((?:pdf|xml|fastq.gz))\.?(?:S3.txt)?"


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

set -e
idStr=""

tree "$carisLocalDataPath" --noreport > "$pDataPath"localCarisTree.out
java hci.gnomex.daemon.auto_import.PathMaker "$pDataPath"localCarisTree.out  "$pDataPath"localCarisPath.out


#  awk '$5 ~ /HCI/ { print "s3://tm-huntsman/" $5 "_" $6 "_" $7 }'
# first part of awk is to make sure column 5 matches string 'result_json and prepends string s3://tm.... before printing col 5
aws --profile caris s3 ls "s3://hci-caris" --recursive  --human-readable  |  awk '{ print "s3://hci-caris/" $5 }' >  "$pDataPath"remoteCarisPath.out
# exclude only vcf
sed -i '/\.vcf/d' "$pDataPath"remoteCarisPath.out

#comparing local file list with remote file list on name where we're only comparing segments of the filename in a consistent order (1-4 capture groups are the segments)
java hci.gnomex.daemon.auto_import.DiffParser -local "$pDataPath"localCarisPath.out -remote "$pDataPath"remoteCarisPath.out -matchByName $diffRegex -cp 1 4 > "$pDataPath"uniqueCarisFilesToDownload.out
java hci.gnomex.daemon.auto_import.DownloadMain -fileList "$pDataPath"uniqueCarisFilesToDownload.out -downloadPath "$downloadPath" -mode caris

while read fileName; do
        if [[ $fileName =~ $regex ]]; then
                nucType=${BASH_REMATCH[1]}
                id=${BASH_REMATCH[2]}
                fullMatch=$BASH_REMATCH
                echo $id


                if [ ! -z "$id" ]; then # If id variable is not empty
                        idStr+=$id","
                fi
        else
                echo cannot match $fileName with this regex $regex
        fi
done < "$pDataPath"download.log # has all new file names to import plus reattempts files
echo $idStr | java  hci.gnomex.daemon.auto_import.StringModder -strip "," > "$pDataPath"tempStr.out

:<<'END'

cat "$pDataPath"importableTempusFileList.out | java  hci.gnomex.daemon.auto_import.StringModder -sort -delimit "/" > "$pDataPath"importableTempusFileList1.out
cat "$pDataPath"importableTempusFileList1.out > "$pDataPath"importableTempusFileList.out
#rm "$pDataPath"localTempus*
#rm "$pDataPath"remoteTempus*
java -jar "./tempus-persistence.jar"  -json "$pDataPath"importableTempusFileList.out -cred "$pDataPath"tempus-cred-prod.properties -download "$downloadPath" -out "$pDataPath"tlInfo.out -log "$pDataPath""log/"tempus.log -ld "$pDataPath"localTempusPath.out
#java hci.ri.tempus.model.TempusPersistenceMain  -json "$pDataPath"importableTempusFileList.out -cred "$pDataPath"tempus-cred.properties -deidentjson "$pDataPath"hello.txt -download "$downloadPath" -out "$pDataPath"tlInfo.out -ld "$pDataPath"localTempusPath.out

java hci.gnomex.daemon.auto_import.XMLParserMain -file "$pDataPath"tlInfo.out -initXML "$pDataPath"clinRequest.xml -annotationXML "$pDataPath"clinGetPropertyList.xml -importScript import_experiment.sh -outFile "$pDataPath"tempRequest.xml -importMode tempus
java hci.gnomex.daemon.auto_import.IdAssociator -ids "$pDataPath"importableTempusFileList.out -flaggedIds "$pDataPath"flaggedIDs.out -pr 1 -regex $associateIDRegex -joinGroup  dna n-dsq dna t-dsq rna t-rsq > "$pDataPath"finalFlaggedIDs.out
java hci.gnomex.daemon.auto_import.FileMover -file "$pDataPath"importableTempusFileList.out  -root $tempusLocalDataPath -downloadPath $downloadPath -flaggedFile "$pDataPath"finalFlaggedIDs.out -mode tempus -linkFolder -regex $sampleFileNameRegex -cp 1 2

tempusRequestList=`cat "$pDataPath"tempRequestList.out`
tempusAnalysisList=`cat "$pDataPath"tempAnalysisList.out`
echo This is the sample regex $sampleIdRegex
bash register_files.sh -doNotSendMail -onlyExperiment
bash linkData.sh -dataSource 10R -regex $sampleIdRegex -linkFolder -debug  -requests $tempusRequestList
bash register_files.sh -doNotSendMail -onlyExperiment
bash linkFastqData.sh -debug -linkFolder -analysis $tempusAnalysisList
rm "$pDataPath"tempRequestList.out
rm "$pDataPath"tempAnalysisList.out
#--------------------------------------------------------------------------------------------------------------------------------------------------------------------
END
