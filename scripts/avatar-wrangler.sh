#!/usr/bin/env bash
tomcatScriptPath="/usr/share/apache-tomcat-7.0.79/webapps/gnomex/scripts/"
scriptsPath="/home/u0566434/Scripts/"
pDataPath="/home/u0566434/parser_data/"
downloadPath="/Repository/tempdownloads/avatar/"
dnaNexusPath="/home/u0566434/dnaNexus/"
avatarLocalDataPath="/Repository/PersonData/2017/4R/Avatar/"
regex=".*/(SL[a-zA-Z0-9]+).*fastq\.(?:md5|gz).*(?:S3.txt)?|.*(FT-[A-Za-z0-9]+).*fastq\.(?:md5|gz).*(?:S3.txt)?"
regex1=".*/(SL[a-zA-Z0-9]+).*|.*(FT-[A-Za-z0-9]+)_R.\.fastq.gz" #this one is for the bash regex doesn't support non-capturing groups

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
   #CLASSPATH="commons-codec-1.15.jar:./httpcore-4.4.13.jar:./ion-java-1.0.2.jar:./jackson-annotations-2.12.3.jar:./jackson-core-2.12.3.jar:./jackson-databind-2.12.3.jar:./jackson-dataformat-cbor-2.12.3.jar:./jmespath-java-1.12.132.jar:./aws-java-sdk-core-1.12.132.jar:./aws-java-sdk-kms-1.12.132.jar:./aws-java-sdk-s3-1.12.132.jar:./httpclient-4.5.13.jar:./gnomex1.jar:$CLASSPATH:$JAR"
   CLASSPATH="$CLASSPATH:$JAR"
done

export CLASSPATH


#java -Xmx6000M hci.gnomex.daemon.auto_import.CollaboratorPermission $*
#java -Xmx6000M hci.gnomex.daemon.LinkData $*
#java hci.gnomex.daemon.auto_import.XMLParserMain $*

set -e
flaggedIDParam=${1:-normal}
idColumn=${2:-1}

echo optional param  $optParam
downloadCode=0
fileList=""
verifiedSlInfo=""
tokenVal=`cat "$pDataPath"token.properties`
echo This is the start: $startPath
echo This is the path : $scriptsPath
source "$dnaNexusPath"dx-toolkit/environment
dx login --token $tokenVal
dx cd /
dx select HCI_Molecular_Data
#dx tree / > "$pDataPath"remoteTree.out
#tree "$avatarLocalDataPath" --noreport > "$pDataPath"localTree.out
#java hci.gnomex.daemon.auto_import.PathMaker "$pDataPath"localTree.out  "$pDataPath"localPath.out
dx  find data --name "*fastq*" |  awk '{print $6 }' > "$pDataPath"remotePath.out
find "$avatarLocalDataPath" -name "*.fastq*" -type f > "$pDataPath"localPath.out
#java hci.gnomex.daemon.auto_import.PathMaker "$pDataPath"remoteTree.out "$pDataPath"remotePath.out

if [ "$flaggedIDParam" = "normal"  ]; then
        #echo doing the diff
        java hci.gnomex.daemon.auto_import.DiffParser  -local "$pDataPath"localPath.out -remote "$pDataPath"remotePath.out -cp 1 2  -matchbyname $regex > "$pDataPath"uniqueFilesToDownload.out
        #sed -i '/FASTq/!d' "$pDataPath"uniqueFilesToDownload.out  # tgen files have been archived so it brakes the script when trying to download them. filtering out for the moment

        echo I am about to download files
        java hci.gnomex.daemon.auto_import.DownloadMain -fileList "$pDataPath"uniqueFilesToDownload.out -downloadPath "$downloadPath" -remotePath  #outputs download.log  reads in uniqueFilesToDownload.out

        #$? # Saves the exit status of the last script
        downloadCode=0
        fileList="$pDataPath"download.log
else
        java hci.gnomex.daemon.auto_import.DiffParser  -local "$pDataPath"localPath.out  -remote "$pDataPath"remotePath.out > "$pDataPath"uniqueFilesToVerify.out
        sed -i '/FASTq/!d' "$pDataPath"uniqueFilesToVerify.out

        bash "$scriptsPath"makeVerifiedList.sh $flaggedIDParam  "$pDataPath"uniqueFilesToVerify.out "$pDataPath"verifiedAvatarList.out $idColumn $downloadPath"/Flagged/"
        fileList="$pDataPath"verifiedAvatarList.out

        #echo this is the verfied file list name $fileList
        #cat $fileList

fi


echo the fileListName : $fileList
echo download Status: $downloadCode
#downloadCode=0


echo download Status: $downloadCode
if [ $downloadCode -eq 0 ]; then
        idStr=""
        while read fileName; do
                if [[ $fileName =~ $regex1 ]]; then
                        fullMatch=$BASH_REMATCH
                        hudAlphaID="${BASH_REMATCH[1]}"
                        fulgentID="${BASH_REMATCH[2]}"

                        if [ ! -z "$hudAlphaID" ]; then #If var is not empty
                                idStr+=$hudAlphaID","
                        elif [ ! -z "$fulgentID" ]; then
                                idStr+=$fulgentID","
                        fi

                fi
        done < $fileList

        echo this is idStr: $idStr
        echo $idStr | java  hci.gnomex.daemon.auto_import.StringModder -strip "," > "$pDataPath"tempStr.out
        if [ "$flaggedIDParam" = "normal"  ]; then
              java  hci.gnomex.daemon.auto_import.Linker  "$pDataPath"tempStr.out "$pDataPath"hci-creds.properties  "$pDataPath"slInfo.out avatar
              verifiedSlInfo="$pDataPath"slInfo.out
        else
              verifiedSlInfo=$flaggedIDParam
              echo $verifiedSlInfo
        fi
        rm  "$pDataPath"tempStr.out
        echo `pwd`

        # Note avatarImporter outputs two implicit files
        java hci.gnomex.daemon.auto_import.XMLParserMain -file $verifiedSlInfo -initXML "$pDataPath"clinRequest.xml -annotationXML "$pDataPath"clinGetPropertyList.xml -importScript import_experiment.sh -outFile "$pDataPath"tempRequest.xml -importMode avatar
        # checking last script ran(XMLParserMain) has an exit status of 0
        if [ $? -eq 0 ]; then
            java hci.gnomex.daemon.auto_import.FileMover -file $fileList -skipfirst  -root $avatarLocalDataPath -downloadPath $downloadPath -flaggedFile "$pDataPath"flaggedIDs.out -mode avatar -linkFolder
        fi

else
        echo $downloaderStatus
fi

avatarRequestList=`cat "$pDataPath"tempRequestList.out`
avatarAnalysisList=`cat "$pDataPath"tempAnalysisList.out`

bash register_files.sh -doNotSendMail -onlyExperiment
bash linkData.sh -dataSource 4R -linkFolder -debug  -requests $avatarRequestList
bash register_files.sh -doNotSendMail -onlyExperiment
bash linkFastqData.sh -debug -linkFolder -analysis $avatarAnalysisList
bash index_gnomex.sh

rm "$pDataPath"tempRequestList.out
rm "$pDataPath"tempAnalysisList.out
echo ------------------------------------------------------------------------------------------------------------
