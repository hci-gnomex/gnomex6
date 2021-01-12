#!/usr/bin/env bash
tomcatScriptPath="/usr/share/apache-tomcat-7.0.79/webapps/gnomex/scripts/"
scriptsPath="/home/u0566434/Scripts/"
pDataPath="/home/u0566434/parser_data/"
downloadPath="/Repository/tempdownloads/tempus/"
tempusLocalDataPath="/Repository/PersonData/2017/10R/Tempus/"

regex="^.*((TL-[0-9]{2}-[A-Za-z0-9]{6}).*(DNA|RNA|RSQ|DSQ).*gz)$|.*(result.*\.[a-z]+)|.*((TL-[0-9]{2}-[A-Za-z0-9]{6})[-_]*([DRNA]{3})*.*\.md5)"
#regex=".*((TL-[0-9]{2}-[A-Za-z0-9]{6}).*(DNA|RNA|RSQ.|DSQ.).*gz)|.*(result.*\.[a-z]+)|.*(TL-[0-9]{2}-[A-Za-z0-9]{6}[-_]*([DRNA]{3})*.*\.md5)"

#smallFileRegex=".*((TL-[0-9]{2}-[A-Za-z0-9]{6}).*(DNA|RNA|RSQ.|DSQ.).*gz)|.*(result.*\.[a-z]+)|.*(TL-[0-9]{2}-[A-Za-z0-9]{6}[-_]*([DRNA]{3})*.*\.md5)"
smallFileRegex=".*(result.*)"
fastqRegex="(?:(?:.*(DNA|RNA).*/)?|.*/?)(TL-[0-9]{2}-[A-Za-z0-9]{6})[^/](?=.*(DNA|RNA|DSQ|RSQ))?.*(md5|gz).*(?:S3.txt)?"
sampleIdRegex=".*TL-[0-9]{2}-([A-Za-z0-9]{6}).*|result-?_?([A-Za-z0-9]{6}).*"
sampleFileNameRegex=".*(TL-[0-9]{2}-[A-Za-z0-9]{6}).*|result-?_?([A-Za-z0-9]{6}).*" #get everything but the read end pair number and extension
associateIDRegex=".*(?:TL-[0-9]{2}|result)-?_?([A-Za-z0-9]{6})._?-?(T|N)?_?-?(DSQ|RSQ|RNA|DNA)?.*"

filterRegex=".*(result.*)|$fastqRegex"
echo $filterRegex

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
    CLASSPATH="$CLASSPATH:$JAR"
done

export CLASSPATH

set -e
alias="DSQ DNA RSQ RNA"

tree "$tempusLocalDataPath" --noreport > "$pDataPath"localTempusTree.out
java hci.gnomex.daemon.auto_import.PathMaker "$pDataPath"localTempusTree.out  "$pDataPath"localTempusPath.out


#  awk '$5 ~ /HCI/ { print "s3://tm-huntsman/" $5 "_" $6 "_" $7 }'
# first part of awk is to make sure column 5 matches string 'result_json and prepends string s3://tm.... before printing col 5
aws --profile tempus s3 ls "s3://tm-huntsman" --recursive --human-readable | awk '$5 ~ /result_json/ { print "s3://tm-huntsman/" $5 }' |  sed -e '/[a-zA-Z]$/!d' >  "$pDataPath"tempusJson.out
aws --profile tempus s3 ls "s3://tm-huntsman"  --recursive --human-readable | awk '{ print "s3://tm-huntsman/" $5 }'  | grep tar.gz > "$pDataPath"tempusFastq.out


echo diffing remote and local
java hci.gnomex.daemon.auto_import.DiffParser -alias $alias -local "$pDataPath"localTempusPath.out  -remote "$pDataPath"tempusFastq.out -cp 1 4 -matchByName $fastqRegex > "$pDataPath"uniqueTempusFastq.out
java hci.gnomex.daemon.auto_import.DiffParser  -local "$pDataPath"localTempusPath.out  -remote "$pDataPath"tempusJson.out -cp 1 -matchByName -l $smallFileRegex > "$pDataPath"uniqueTempusSmallFile.out

cat "$pDataPath"uniqueTempusSmallFile.out "$pDataPath"uniqueTempusFastq.out > "$pDataPath"uniqueTempusFilesToDownload.out

java hci.gnomex.daemon.auto_import.DownloadMain -fileList "$pDataPath"uniqueTempusFilesToDownload.out -downloadPath "$downloadPath" -mode tempus -filterRegex $filterRegex -alias $alias


# need to filter out from uniqueTempusFilesToDownload reattempt flagged files here

rm "$pDataPath"tempusJson.out
rm "$pDataPath"tempusFastq.out

# parallel approach going with xargs approach as I saw it on blog of aws
#cat "$pDataPath"uniqueTempusFilesToDownload.out |  parallel -j 10 aws s3 --profile tempus cp {} $downloadPath
#cat "$pDataPath"uniqueTempusFilesToDownload.out |  xargs -P10 -I {}  aws --profile tempus s3 cp {} $downloadPath
#convert all empty object to arrays so doesn't break json parser
find "$downloadPath" -type f -name "*.json" -print0 | xargs -0 sed -i 's/{}/[]/g'
fileArray=()
while read line; do
        #echo show everytime $line
        if [[ $line =~ $regex ]] ; then

                match=${BASH_REMATCH[0]}
                matchFastqFile=${BASH_REMATCH[1]}
                matchFastqID=${BASH_REMATCH[2]}
                matchNucType=${BASH_REMATCH[3]}
                matchJsonFile=${BASH_REMATCH[4]}
                matchChecksum=${BASH_REMATCH[5]}
                matchChecksumID=${BASH_REMATCH[6]}
                matchNucChecksum=${BASH_REMATCH[7]}


                echo --------------------------------------------------------------------
                echo full match: $match
                echo fastqFile match: $matchFastqFile
                echo checkumFile name: $matchChecksum
                echo checksumFileID: $matchChecksumID


                path=$(dirname -- "$line")
                pathNucType=$([[ $path =~ ^.*(DNA|RNA)?.*$ ]] && echo "${BASH_REMATCH[1]}") #get from path, is DNA or RNA or neither

                #ternary like
                #only doing this for fastq not checksum because we don't untar checksum
                echo nuc type before and path correction $matchNucType


                if [[ "$matchNucType" = "DSQ" ]]; then
                        matchNucType="DNA"
                elif [[ "$matchNucType" = "RSQ" ]]; then
                        matchNucType="RNA"
                fi


                matchNucType=$([ ! -z "$pathNucType" ] && echo $pathNucType || echo $matchNucType)
                matchNucChecksum=$([ ! -z "$pathNucType" ] && echo $pathNucType || echo $matchNucChecksum)


                echo nuc type: $matchNucType
                echo nuc checksum type: $matchNucChecksum

                if [ ! -z "$matchFastqFile" ]; then  #If var is not empty
                        echo this is the id: $matchFastqID
                        echo this is the fastq: $matchFastqFile
                        baseFileName="$(basename -- $match)"

                        joinedFastqStr="$downloadPath"$baseFileName #need actual name of file since tempus has lots of errors
                        echo joinedFastq $joinedFastqStr

                        joinedFastqStr=$([[ -f $joinedFastqStr ]] && echo $joinedFastqStr || echo "$downloadPath""$matchNucType""/""$baseFileName" )
                        echo check if file found, if not assume it is in sub DNA or RNA folder
                        echo $joinedFastqStr

                        if [ ! -d "$downloadPath""$matchNucType" ]; then
                                mkdir "$downloadPath""$matchNucType"
                        fi


                        if ! [[ $joinedFastqStr == *"tar"* ]]; then
                                echo    $joinedFastqStr IS NOT A tar
                                fileArray+=("$matchNucType""/""$matchFastqFile")
                                mv "$joinedFastqStr" "$downloadPath""$matchNucType""/""$matchFastqFile"
                                continue
                        fi


                        # print the archived content of matchFastqFile and then grabbing the 6th column where in the row it says fastq
                        tar -ztvf "$joinedFastqStr" |  awk '$6 ~ /fastq/ { print $6 }' > "$pDataPath"tempTarFile.out
                        tar xvfz $joinedFastqStr -C "$downloadPath""/""$matchNucType" && rm "${joinedFastqStr}"

                        while read seqLine; do

                                pathname="$(dirname -- "$seqLine")" #dirname command returns a '.' if no path
                                filename="$(basename -- "$seqLine")"
                                dest=""
                                if [ $pathname = '.' ]; then
                                        dest="$matchNucType""/""$filename" # no rename needed
                                        echo no rename needed since in correct format

                                else
                                        dest="$matchNucType""/"$pathname"/""$matchFastqID""-""$matchNucType""_"$filename
                                        mv  "$downloadPath""$matchNucType""/"$seqLine "$downloadPath"$dest # this is a rename not a move, the move happened when using tar
                                fi

                                fileArray+=($dest)

                                echo renaming echo mv "$downloadPath""$matchNucType""/"$seqLine "$downloadPath"$dest


                        done < "$pDataPath"tempTarFile.out

                        rm "$pDataPath"tempTarFile.out

                elif [ ! -z "$matchJsonFile" ]; then
                        echo this is the json or pdf matched : $matchJsonFile
                        fileArray+=($matchJsonFile)
                elif [ ! -z "$matchChecksum" ]; then
                        startChecksum="$(basename -- $match)"
                        joinedChecksumStr="$downloadPath""$startChecksum"
                        joinedChecksumStr=$([[ -f $joinedChecksumStr ]] && echo $joinedChecksumStr || echo "$downloadPath""$matchNucChecksum""/""$startChecksum" )

                        echo this is the fastq checksum matched: $startChecksum
                        fileArray+=($matchNucChecksum"/"$matchChecksumID"-""$matchNucChecksum"".tar.gz.md5")
                        mv $joinedChecksumStr "$downloadPath"$matchNucChecksum"/"$matchChecksumID"-""$matchNucChecksum"".tar.gz.md5"
                fi

        else
                echo no match $line
        fi
done < "$pDataPath"download.log

echo printing out array fileArray to a file with new line characters
printf "%s\n" "${fileArray[@]}" > "$pDataPath"importableTempusFileList.out

cat "$pDataPath"importableTempusFileList.out | java  hci.gnomex.daemon.auto_import.StringModder -sort -delimit "/" > "$pDataPath"importableTempusFileList1.out
cat "$pDataPath"importableTempusFileList1.out > "$pDataPath"importableTempusFileList.out

#rm "$pDataPath"localTempus*
#rm "$pDataPath"remoteTempus*
java -jar "./tempus-persistence.jar"  -json "$pDataPath"importableTempusFileList.out -cred "$pDataPath"tempus-cred-prod.properties -deidentjson "$pDataPath"hello.txt -download "$downloadPath" -out "$pDataPath"tlInfo.out -log "$pDataPath""log/"tempus.log
#java hci.ri.tempus.model.TempusPersistenceMain  -json "$pDataPath"importableTempusFileList.out -cred "$pDataPath"tempus-cred.properties -deidentjson "$pDataPath"hello.txt -download "$downloadPath" -out "$pDataPath"tlInfo.out

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