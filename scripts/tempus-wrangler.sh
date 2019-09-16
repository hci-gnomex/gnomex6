#!/usr/bin/env bash
tomcatScriptPath="/usr/share/apache-tomcat-7.0.79/webapps/gnomex/scripts/"
scriptsPath="/home/u0566434/Scripts/"
pDataPath="/home/u0566434/parser_data/"
downloadPath="/Repository/tempdownloads/tempus/"
tempusLocalDataPath="/Repository/PersonData/2017/10R/Tempus/"
regex="^.*(result.*\.[a-z]+)|.*(TL.*md5)$" #regex="^.*(result.*\.[a-z]+)|^.*((TL-[0-9]{2}-[A-Za-z0-9]{6})[^/].*gz)|^.*(TL.*md5)$"
regex=".*((TL-[0-9]{2}-[A-Za-z0-9]{6})[-_]+(D?R?NA).*gz)|.*(result.*\.[a-z]+)|.*(TL.*md5)"
smallFileRegex=".*(result.*\.[a-z]+)"
fastqRegex="^.*((TL-[0-9]{2}-[A-Za-z0-9]{6})[^/](?=.*(DNA|RNA)).*gz)"
#.*(result.*\.[a-z]+)|^.*(TL-[0-9]{2}-[A-Za-z0-9]{6})[^/].*gz|^

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


#echo $CLASSPATH


#tree "$tempusLocalDataPath" --noreport > "$pDataPath"localTempusTree.out
#java hci.gnomex.daemon.auto_import.PathMaker "$pDataPath"localTempusTree.out  "$pDataPath"localTempusPath.out

#  awk '$5 ~ /HCI/ { print "s3://tm-huntsman/" $5 "_" $6 "_" $7 }'

# first part of awk is to make sure column 5 matches string 'result_json and prepends string s3://tm.... before printing col 5
#aws s3 ls "s3://tm-huntsman" --recursive --human-readable | awk '$5 ~ /result_json/ { print "s3://tm-huntsman/" $5 }' |  sed -e '/[a-zA-Z]$/!d' >  "$pDataPath"tempusJson.out
#aws s3 ls "s3://tm-huntsman" --recursive --human-readable | awk '{ print "s3://tm-huntsman/" $5 }' | sed -e '/fastq/!d' > "$pDataPath"tempusFastq.out



java hci.gnomex.daemon.auto_import.DiffParser  -local "$pDataPath"localTempusPath.out  -remote "$pDataPath"tempusFastq.out -cp 2 3 -matchByName $fastqRegex > "$pDataPath"uniqueTempusFastq.out
java hci.gnomex.daemon.auto_import.DiffParser  -local "$pDataPath"localTempusPath.out  -remote "$pDataPath"tempusJson.out -cp 1 -matchByName -l $smallFileRegex > "$pDataPath"uniqueTempusSmallFile.out
cat "$pDataPath"uniqueTempusSmallFile.out "$pDataPath"uniqueTempusFastq.out > "$pDataPath"uniqueTempusFilesToDownload.out
#rm "$pDataPath"tempusJson.out
#rm "$pDataPath"tempusFastq.out


echo just retrieved the json files that are unique
cat "$pDataPath"uniqueTempusFilesToDownload.out
# parallel approach going with xargs approach as I saw it on blog of aws
#cat "$pDataPath"uniqueTempusFilesToDownload.out |  parallel -j 10 aws s3 cp {} $downloadPath
#cat "$pDataPath"uniqueTempusFilesToDownload.out |  xargs -P10 -I {}  aws s3 cp {} $downloadPath


#convert all empty object to arrays so doesn't break json parser
find "$downloadPath" -type f -name "*.json" -print0 | xargs -0 sed -i 's/{}/[]/g'


fileArray=()
while read fileName; do
        #echo show everytime $fileName
        if [[ $fileName =~ $regex ]] ; then
                matchFastqFile=${BASH_REMATCH[1]}
                matchFastqID=${BASH_REMATCH[2]}
                matchNucType=${BASH_REMATCH[3]}
                matchJsonFile=${BASH_REMATCH[4]}
                matchChecksum=${BASH_REMATCH[5]}

                echo json $matchJsonFile
                echo fastq file $matchFastqFile
                echo fastq id  $matchFastqID
                echo nuc type $matchNucType
                echo fastq checksum $matchChecksum


                echo --------------------------------------------------------------------
                if [ ! -z "$matchFastqFile" ]; then  #If var is not empty
                        echo this is the id: $matchFastqID
                        echo this is the fastq: $matchFastqFile

                        joinedFastqStr="$(ls "$downloadPath""$matchFastqID"*"$matchNucType"*"gz")"
                        echo joinedFastq $joinedFastqStr
                        if [ ! -d "$DIRECTORY" ]; then
                                mkdir "$downloadPath""$matchNucType"
                        fi

                        # print the archived content of matchFastqFile and then grabbing the 6th column where in the row it says fastq
                        tar -ztvf $joinedFastqStr |  awk '$6 ~ /fastq/ { print $6 }' > "$pDataPath"tempTarFile.out
                        tar xvfz $joinedFastqStr -C "$downloadPath"

                        while read seqLine; do
                                IFS='/' read -ra delimitArray <<< "$seqLine" # read file in and put each line in array of 2
                                fileArray+=("${delimitArray[0]}""/""$matchFastqID""_"${delimitArray[1]})
                                mv  "$downloadPath""${delimitArray[0]}""/"${delimitArray[1]} "$downloadPath""${delimitArray[0]}""/""$matchFastqID""_"${delimitArray[1]}

                        done < "$pDataPath"tempTarFile.out

                        rm "$pDataPath"tempTarFile.out


                elif [ ! -z "$matchJsonFile" ]; then
                        echo this is the json or pdf matched : $matchJsonFile
                        fileArray+=($matchJsonFile)
                elif [ ! -z "$matchChecksum" ]; then
                        echo this is the fastq checksum matched: $matchChecksumFile
                        fileArray+=($matchChecksum)

                fi

        else
                echo no match $fileName
        fi
done < "$pDataPath"uniqueTempusFilesToDownload.out

#echo printing out array fileArray to a file with new line characters
printf "%s\n" "${fileArray[@]}" > "$pDataPath"uniqueTempusFilesToDownload.out

#rm "$pDataPath"localTempus*
#rm "$pDataPath"remoteTempus*
java -jar "./tempus-persistence.jar"  -json "$pDataPath"uniqueTempusFilesToDownload.out -cred "$pDataPath"tempus-cred.properties -deidentjson "$pDataPath"hello.txt -download "$downloadPath" -out "$pDataPath"tlInfo.out

java hci.gnomex.daemon.auto_import.XMLParserMain -file $verifiedTrfInfo -initXML "$pDataPath"clinRequest.xml -annotationXML "$pDataPath"clinGetPropertyList.xml -importScript import_experiment.sh -outFile "$pDataPath"tempRequest.xml -importMode tempus
java hci.gnomex.daemon.auto_import.FileMover -file "$pDataPath"uniqueTempusFilesToDownload.out  -root $tempusLocalDataPath -downloadPath $downloadPath -flaggedFile "$pDataPath"flaggedIDs.out -mode tempus
