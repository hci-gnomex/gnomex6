#!/usr/bin/env bash
tomcatScriptPath="/usr/share/apache-tomcat-7.0.79/webapps/gnomex/scripts/"
scriptsPath="/home/u0566434/Scripts/"
pDataPath="/home/u0566434/parser_data/"
downloadPath="/Repository/tempdownloads/tempus/"
tempusLocalDataPath="/Repository/PersonData/2017/10R/Tempus/"
regex=".*(TL[-_0-9a-zA-Z]+R?D?NA.*)|.*(result.*\.[a-z]+)" # The SL can be at the first of filename OR come after the '_'
differRegex="^.*(TL[-_0-9a-zA-Z]+fastq).+gz$"



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


#echo $CLASSPATH



tree "$tempusLocalDataPath" --noreport > "$pDataPath"localTempusTree.out
java hci.gnomex.daemon.auto_import.PathMaker "$pDataPath"localTempusTree.out  "$pDataPath"localTempusPath.out

#  awk '$5 ~ /HCI/ { print "s3://tm-huntsman/" $5 "_" $6 "_" $7 }'

# first part of awk is to make sure column 5 matches string 'result_json and prepends string s3://tm.... before printing col 5
aws s3 ls "s3://tm-huntsman" --recursive --human-readable | awk '$5 ~ /result_json/ { print "s3://tm-huntsman/" $5 }' |  sed -e '/[a-zA-Z]$/!d' >  "$pDataPath"tempusJson.out
aws s3 ls "s3://tm-huntsman" --recursive --human-readable | awk '{ print "s3://tm-huntsman/" $5 }' | sed -e '/fastq/!d' > "$pDataPath"tempusFastq.out

cat "$pDataPath"tempusJson.out "$pDataPath"tempusFastq.out > "$pDataPath"remoteTempusPath.out
java hci.gnomex.daemon.auto_import.DiffParser  -local "$pDataPath"localTempusPath.out  -remote "$pDataPath"remoteTempusPath.out -matchByName $differRegex > "$pDataPath"uniqueTempusFilesToDownload.out

#cat "$pDataPath"uniqueTempusFilesToDownload.out |  parallel -j 10 aws s3 cp {} $downloadPath



while read fileName; do
	echo show everytime $fileName
	if [[ $fileName =~ $regex ]] ; then
		matchFastqFile=${BASH_REMATCH[1]}
		matchJsonFile=${BASH_REMATCH[2]}
		
		if [ ! -z "$matchFastqFile" ]; then  #If var is not empty
			echo   $matchFastqFile
			
		else
			echo  $matchJsonFile
                fi
		
	else
		echo no match $fileName
        fi

done < "$pDataPath"uniqueTempusFilesToDownload.out


#rm "$pDataPath"localTempus*
#rm "$pDataPath"remoteTempus*


#java -cp "./tempus-persistence.jar" hci.ri.tempus.model.TempusPersistenceMain "/home/u0566434/realData/"tempus-file.json

#java -jar "./tempus-persistence.jar"  "/home/u0566434/realData/"tempus-file.json


