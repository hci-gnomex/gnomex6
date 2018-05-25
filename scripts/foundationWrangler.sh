#!/usr/bin/env bash
tomcatScriptPath="/usr/share/apache-tomcat-7.0.79/webapps/gnomex/scripts/"
scriptsPath="/home/u0566434/Scripts/"
pDataPath="/home/u0566434/parser_data/"
fScriptsPath=$scriptsPath"foundation/" # where the scripts live
localDataPath="/mnt/win/Results/foundTEST/"   #"/home/u0566434/FoundationData/"
foundationPath="/Repository/PersonData/2017/2R/Foundation/"

regex="^(TRF[0-9]+)(\.|_).*"  #"^(TRF[0-9]+)_(\wNA)(.*)" # Match TRF and its type (DNA/RNA) and then the file extension

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

CLASSPATH="./gnomex1.jar:$CLASSPATH"
export CLASSPATH




echo hello out there from foundation
:<<'END'
ls $localDataPath*TRF* > "$pDataPath"tmpFileNameList.out
# Filter file order of types  params: in, out, path, out, out
java hci.gnomex.daemon.auto_import.FilterFile "$pDataPath"tmpFileNameList.out "$pDataPath"remoteChecksums.out "$pDataPath"localChecksums.out "$pDataPath"remoteFileList.out "$pDataPath"hci-creds.properties
java hci.gnomex.daemon.auto_import.DiffParser "$pDataPath"localChecksums.out  "$pDataPath"remoteChecksums.out "$pDataPath"


cat "$pDataPath"inclusion.out "$pDataPath"remoteFileList.out > "$pDataPath"remoteFPath.out

cat "$pDataPath"remoteChecksums.out
cat "$pDataPath"localChecksums.out

rm "$pDataPath"tmpFileNameList.out

rm "$pDataPath"*Checksums.out

END

 #echo  `wc -l < "$pDataPath"download.log`

idStr=""

while read fileName; do
        if [[ $fileName =~ $regex ]]; then
                id=${BASH_REMATCH[1]}
                fullMatch=$BASH_REMATCH

                echo fileName $fileName this is the id: $id
                #fileSeqType="${BASH_REMATCH[2]}"

                if [ ! -z "$id" ]; then # If id variable is not empty
                        idStr+=$id","
                fi
                                #echo $id
        fi
done < "$pDataPath"inclusion.out # reading from this file 'inclusion.out'

echo $idStr | java  hci.gnomex.daemon.auto_import.StringModder > "$pDataPath"tempStr.out
echo The temp str:
cat "$pDataPath"tempStr.out

#echo here is the list of files
#value=$(<"$pDataPath"tempStr.out)
#echo $value

#sed "s/'SL#'/$idStr/g" "$scriptsPath"sLNumberMRNQuery.sql > "$pDataPath"modSlNumberMRNQuery.sql

java  hci.gnomex.daemon.auto_import.Linker "$pDataPath"tempStr.out "$pDataPath"hci-creds.properties "$pDataPath"trfInfo.out foundation

rm "$pDataPath"tempStr.out

cd $tomcatScriptPath
java hci.gnomex.daemon.auto_import.XMLParserMain -file "$pDataPath"trfInfo.out -initXML "$pDataPath"clinRequest.xml -annotationXML "$pDataPath"clinGetPropertyList.xml -importScript import_experiment.sh -outFile "$pDataPath"tempRequest.xml -importMode foundation
cd $scriptsPath
:<<'END'


java hci.gnomex.daemon.auto_import.FileMover -file "$pDataPath"remoteFPath.out  -root $foundationPath -downloadPath $localDataPath -flaggedFile "$pDataPath"flaggedIDs.out -mode foundation

#rm "$pDataPath"tempAnalysisList.out

#else
        #echo $downloaderStatus
#fi


echo ------------------------------------------------------------------------------------------------------------
#cat matched.txt | java -jar fileNavParser.jar

#rm ../Data/matched.txt
#rm catList.txt

END
