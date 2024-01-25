#!/usr/bin/env bash
tomcatScriptPath="/usr/share/apache-tomcat-7.0.79/webapps/gnomex/scripts/"
scriptsPath="/home/u0566434/Scripts/"
downloadPath="/Repository/tempdownloads/foundation/"
pDataPath="/home/u0566434/parser_data/"
remoteDataPath="/mnt/win/Results/"
foundationPath="/Repository/PersonData/2017/2R/Foundation/"
stagePath="/Repository/tempdownloads/foundation/Stage/"
syncPath="/mnt/win-fs-10/Foundation/"
#The ? after the parens means it can optionally have the pattern
regex=".*([TCQ]RF[0-9]+|ORD-[0-9]+-[0-9]{2})(.|_).*"
diffRegex=".*((?:[TCQ]RF|ORD)-?[0-9]{6,7}-?(?:\d\d)?)_?(DNA|RNA)?\.(.*(?:pdf|xml|md5|bam|bai))\.?(?:S3.txt)?"
filterRegex="(.*)([TCQ]RF[0-9]+|ORD-[0-9]+-[0-9]{2})([^\.]*)\.(.*)"


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
    #CLASSPATH="./processoutput4j-0.0.7.jar:./argparse4j-0.6.0.jar:./rsync4j-core-3.1.2-17.jar:./rsync4j-all-3.1.2-17.jar:./gnomex1.jar:$CLASSPATH:$JAR"
    CLASSPATH="$CLASSPATH:$JAR"
done

export CLASSPATH


set -e
flaggedIDParam=${1:-normal}
idColumn=${2:-1}
fileList=""
verifiedTrfInfo=""
idStr=""
#java hci.gnomex.daemon.auto_import.FileMover -accountFilesMoved $foundationPath -remotePath $remoteDataPath
find "$foundationPath" -type f \( -name '*.bam*' -or -name '*.xml' -or -name '*.pdf' \)  > "$pDataPath"localFoundationPath.out

# first part of awk is to make sure column 5 matches string 'result_json and prepends string s3://tm.... before printing col 5
aws --profile foundation s3 ls "s3://integration-prod-huntsmancancer-ae1" --recursive  --human-readable  |  awk '{ print "s3://integration-prod-huntsmancancer-ae1/" $5 }' >  "$pDataPath"remoteFoundationPath.out
aws --profile foundation s3 sync "s3://integration-prod-huntsmancancer-ae1" "$syncPath" --exclude "*" --include "*.xml"
sed -i '/sorted/d' "$pDataPath"remoteFoundationPath.out

# exclude directory or file named Flagged only print out files
#find $remoteDataPath -name "Flagged" -prune -o -type f -print  > "$pDataPath"remoteFoundationPath.out

java hci.gnomex.daemon.auto_import.DiffParser -local "$pDataPath"localFoundationPath.out -remote "$pDataPath"remoteFoundationPath.out -matchByName $diffRegex -cp 1 3 > "$pDataPath"uniqueFoundationFilesToDownload.out
java hci.gnomex.daemon.auto_import.DownloadMain -fileList "$pDataPath"uniqueFoundationFilesToDownload.out -downloadPath "$downloadPath" -mode foundation -filterRegex $diffRegex
#java hci.gnomex.daemon.auto_import.FilterFile "$pDataPath"uniqueFilesToMove.out "$pDataPath"fileList.out "$pDataPath"hci-creds.properties "$pDataPath"filteredOutList.out $filterRegex $remoteDataPath
# notice remotePath is using the local foundation disk this is intentional in this case
#java hci.gnomex.daemon.auto_import.FileMover -accountFilesMoved "$pDataPath"fileList.out -remotePath $foundationPath  -accountOutFile "$pDataPath"accountedUniqueFiles.out -accountFilesFlag

if [ "$flaggedIDParam" = "normal"  ]; then

    #bash "$scriptsPath"makeReattemptList.sh $remoteDataPath $regex  "$pDataPath"reattemptFileList.out
    # Filter file order of types  params: in, out, in, out,in
    #cat "$pDataPath"reattemptFileList.out "$pDataPath"accountedUniqueFiles.out > "$pDataPath"importableFileList.out
    fileList="$pDataPath"importableFileList.out

else
    # occur when user has verified the data and wants to intervene by supplying a file to use over database query
    find $remoteDataPath"Flagged/" -regextype sed -regex ".*RF.*"  -printf '%f\n' > $remoteDataPath"Flagged/"tempFilesToVerify.out
    cat "$pDataPath"uniqueFilesToVerify.out
    bash "$scriptsPath"makeVerifiedList.sh $flaggedIDParam  $remoteDataPath"Flagged/"tempFilesToVerify.out "$pDataPath"verifiedFoundList.out $idColumn
    fileList="$pDataPath"verifiedFoundList.out
    echo else
fi

while read fileName; do
        if [[ $fileName =~ $regex ]]; then
                id=${BASH_REMATCH[1]}
                fullMatch=$BASH_REMATCH

                fileSeqType="${BASH_REMATCH[2]}"
                echo $id


                if [ ! -z "$id" ]; then # If id variable is not empty
                        idStr+=$id","
                fi
        fi
done < "$pDataPath"download.log # has all new file names to import plus reattempts files
echo $idStr | java  hci.gnomex.daemon.auto_import.StringModder -strip "," > "$pDataPath"tempStr.out

echo The temp str:
cat "$pDataPath"tempStr.out

if [ "$flaggedIDParam" = "normal"  ]; then
    java  hci.gnomex.daemon.auto_import.Linker "$pDataPath"tempStr.out "$pDataPath"hci-creds.properties "$pDataPath"trfInfo.out foundation
    verifiedTrfInfo="$pDataPath"trfInfo.out
else
    verifiedTrfInfo=$flaggedIDParam
fi

rm "$pDataPath"tempStr.out

java hci.gnomex.daemon.auto_import.XMLParserMain -file $verifiedTrfInfo -initXML "$pDataPath"clinRequest.xml -annotationXML "$pDataPath"clinGetPropertyList.xml -importScript import_experiment.sh -outFile "$pDataPath"tempRequest.xml -importMode foundation
java hci.gnomex.daemon.auto_import.FileMover -file "$pDataPath"download.log  -root $foundationPath -downloadPath $downloadPath -flaggedFile "$pDataPath"flaggedIDs.out -mode foundation  -log "$pDataPath""log" -linkFolder -skipFirst


requestList=`cat "$pDataPath"tempRequestList.out`
analysisList=`cat "$pDataPath"tempAnalysisList.out`
echo This is the sample regex $sampleIdRegex
bash register_files.sh -doNotSendMail -onlyExperiment
bash linkData.sh -dataSource 2R -linkFolder -debug  -requests $requestList
bash register_files.sh -doNotSendMail -onlyExperiment
bash linkFastqData.sh -debug -linkFolder -analysis $analysisList
bash index_gnomex.sh
rm "$pDataPath"tempRequestList.out
rm "$pDataPath"tempAnalysisList.out
echo ------------------------------------------------------------------------------------------------------------
#cat matched.txt | java -jar fileNavParser.jar
#rm ../Data/matched.txt
#rm catList.txt
#java hci.gnomex.daemon.auto_import.DiffParser "$pDataPath"localChecksums.out  "$pDataPath"remoteChecksums.out "$pDataPath"
