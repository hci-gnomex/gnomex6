#!/usr/bin/env bash
tomcatScriptPath="/usr/share/apache-tomcat-7.0.79/webapps/gnomex/scripts/"
scriptsPath="/home/u0566434/Scripts/"
pDataPath="/home/u0566434/parser_data/"
downloadPath="/Repository/tempdownloads/tempus/"
tempusLocalDataPath="/Repository/PersonData/2017/10R/Tempus/"

regex=".*((TL-[0-9]{2}-[A-Za-z0-9]{6})[-_]+(D?R?NA).*gz)|.*(result.*\.[a-z]+)|.*(TL-.+[-_]+(D?R?NA).*md5)"
smallFileRegex=".*(result.*\.[a-z]+)"
fastqRegex="^.*((TL-[0-9]{2}-[A-Za-z0-9]{6})[^/](?=.*(DNA|RNA)).*gz)"
sampleIdRegex=".*TL-[0-9]{2}-([A-Za-z0-9]{6}).*|result-?_?([A-Za-z0-9]{6}).*"
filterRegex="(result.*)|(TL-[0-9]{2}-[A-Za-z0-9]{6})(?=.*(DNA|RNA)).*"

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
    CLASSPATH="./gnomex_client1.jar:./gnomex1.jar:$CLASSPATH:$JAR"
done

export CLASSPATH

#echo $CLASSPATH
tree "$tempusLocalDataPath" --noreport > "$pDataPath"localTempusTree.out
java hci.gnomex.daemon.auto_import.PathMaker "$pDataPath"localTempusTree.out  "$pDataPath"localTempusPath.out

#  awk '$5 ~ /HCI/ { print "s3://tm-huntsman/" $5 "_" $6 "_" $7 }'
# first part of awk is to make sure column 5 matches string 'result_json and prepends string s3://tm.... before printing col 5
aws --profile tempus s3 ls "s3://tm-huntsman" --recursive --human-readable | awk '$5 ~ /result_json/ { print "s3://tm-huntsman/" $5 }' |  sed -e '/[a-zA-Z]$/!d' >  "$pDataPath"tempusJson.out
aws --profile tempus s3 ls "s3://tm-huntsman" --recursive --human-readable | awk '{ print "s3://tm-huntsman/" $5 }' | sed -e '/fastq/!d' > "$pDataPath"tempusFastq.out


java hci.gnomex.daemon.auto_import.DiffParser  -local "$pDataPath"localTempusPath.out  -remote "$pDataPath"tempusFastq.out -cp 2 3 -matchByName $fastqRegex > "$pDataPath"uniqueTempusFastq.out
java hci.gnomex.daemon.auto_import.DiffParser  -local "$pDataPath"localTempusPath.out  -remote "$pDataPath"tempusJson.out -cp 1 -matchByName -l $smallFileRegex > "$pDataPath"uniqueTempusSmallFile.out
cat "$pDataPath"uniqueTempusSmallFile.out "$pDataPath"uniqueTempusFastq.out > "$pDataPath"uniqueTempusFilesToDownload.out
#cat "$pDataPath"uniqueTempusSmallFile.out  > "$pDataPath"uniqueTempusFilesToDownload.out # use line above deleteme

java hci.gnomex.daemon.auto_import.DownloadMain -fileList "$pDataPath"uniqueTempusFilesToDownload.out -downloadPath "$downloadPath" -mode tempus -filterRegex $filterRegex

# need to filter out from uniqueTempusFilesToDownload reattempt flagged files here

rm "$pDataPath"tempusJson.out
rm "$pDataPath"tempusFastq.out


echo just retrieved the json files that are unique
#cat "$pDataPath"uniqueTempusFilesToDownload.out
# parallel approach going with xargs approach as I saw it on blog of aws
#cat "$pDataPath"uniqueTempusFilesToDownload.out |  parallel -j 10 aws s3 --profile tempus cp {} $downloadPath
#cat "$pDataPath"uniqueTempusFilesToDownload.out |  xargs -P10 -I {}  aws --profile tempus s3 cp {} $downloadPath
#convert all empty object to arrays so doesn't break json parser
find "$downloadPath" -type f -name "*.json" -print0 | xargs -0 sed -i 's/{}/[]/g'

fileArray=()
while read fileName; do
        #echo show everytime $fileName
        if [[ $fileName =~ $regex ]] ; then
                match=${BASH_REMATCH[0]}
                matchFastqFile=${BASH_REMATCH[1]}
                matchFastqID=${BASH_REMATCH[2]}
                matchNucType=${BASH_REMATCH[3]}
                matchJsonFile=${BASH_REMATCH[4]}
                matchChecksum=${BASH_REMATCH[5]}
                matchNucChecksum=${BASH_REMATCH[6]}

                echo --------------------------------------------------------------------
                #echo json $matchJsonFile
                #echo fastq file $matchFastqFile
                #echo fastq id  $matchFastqIDu          #echo nuc type $matchNucType
                #echo nuc type $matchNucType
                #echo fastq checksum $matchChecksum
                #echo fastq checksum nuc $matchNucChecksum


                if [ ! -z "$matchFastqFile" ]; then  #If var is not empty
                        echo this is the id: $matchFastqID
                        echo this is the fastq: $matchFastqFile

                        joinedFastqStr="$downloadPath""$(basename -- $match)" #need actual name of file since tempus has lots of errors
                        echo joinedFastq $joinedFastqStr
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
                        tar -ztvf $joinedFastqStr |  awk '$6 ~ /fastq/ { print $6 }' > "$pDataPath"tempTarFile.out
                        tar xvfz $joinedFastqStr -C "$downloadPath""/""$matchNucType" && rm "${joinedFastqStr}"

                        while read seqLine; do
                                IFS='/' read -ra delimitArray <<< "$seqLine" # read file in and put each line in array of 2

                                dest="$matchNucType""/""${delimitArray[0]}""/""$matchFastqID""-""$matchNucType""_"${delimitArray[1]}

                                fileArray+=($dest)

                                #fileArray+=("$matchNucType""/""$matchFastqID""-""$matchNucType""_"${delimitArray[1]})
                                #mv  "$downloadPath""${delimitArray[0]}""/"${delimitArray[1]} "$downloadPath""$matchNucType""/""$matchFastqID""-""$matchNucType""_"${delimitArray[1]}
                                mv  "$downloadPath""$matchNucType""/""${delimitArray[0]}""/"${delimitArray[1]} "$downloadPath"$dest


                        done < "$pDataPath"tempTarFile.out

                        rm "$pDataPath"tempTarFile.out


                elif [ ! -z "$matchJsonFile" ]; then
                        echo this is the json or pdf matched : $matchJsonFile
                        fileArray+=($matchJsonFile)
                elif [ ! -z "$matchChecksum" ]; then
                        startChecksum="$(basename -- $match)"
                        echo this is the fastq checksum matched: $startChecksum
                        fileArray+=($matchNucChecksum"/"$matchChecksum)
                        mv $downloadPath"$startChecksum" "$downloadPath""$matchNucChecksum""/""$matchChecksum"

                        #mv $downloadPath"$matchChecksum" "$downloadPath""$matchNucChecksum""/""$matchChecksum"

                fi

        else
                echo no match $fileName
        fi
done < "$pDataPath"download.log

echo printing out array fileArray to a file with new line characters
printf "%s\n" "${fileArray[@]}" > "$pDataPath"importableTempusFileList.out

#rm "$pDataPath"localTempus*
#rm "$pDataPath"remoteTempus*
java -jar "./tempus-persistence.jar"  -json "$pDataPath"importableTempusFileList.out -cred "$pDataPath"tempus-cred.properties -deidentjson "$pDataPath"hello.txt -download "$downloadPath" -out "$pDataPath"tlInfo.out

#java hci.ri.tempus.model.TempusPersistenceMain  -json "$pDataPath"importableTempusFileList.out -cred "$pDataPath"tempus-cred.properties -deidentjson "$pDataPath"hello.txt -download "$downloadPath" -out "$pDataPath"tlInfo.out

#java hci.gnomex.daemon.auto_import.XMLParserMain -file "$pDataPath"tlInfo.out -initXML "$pDataPath"clinRequest.xml -annotationXML "$pDataPath"clinGetPropertyList.xml -importScript import_experiment.sh -outFile "$pDataPath"tempRequest.xml -importMode tempus
#java hci.gnomex.daemon.auto_import.IdAssociator "$pDataPath"importableTempusFileList.out  "$pDataPath"flaggedIDs.out $sampleIdRegex > "$pDataPath"finalFlaggedIDs.out
#java hci.gnomex.daemon.auto_import.FileMover -file "$pDataPath"importableTempusFileList.out  -root $tempusLocalDataPath -downloadPath $downloadPath -flaggedFile "$pDataPath"finalFlaggedIDs.out -mode tempus -linkFolder -regex $sampleIdRegex -cp 1 2

tempusRequestList=`cat "$pDataPath"tempRequestList.out`
tempusAnalysisList=`cat "$pDataPath"tempAnalysisList.out`

#echo This is the sample regex $sampleIdRegex
#bash register_files.sh -doNotSendMail -onlyExperiment
#bash linkData.sh -dataSource 10R -regex $sampleIdRegex -linkFolder -debug  -requests $tempusRequestList
#--------------------------------------------------------------------------------------------------------------------------------------------------------------------
