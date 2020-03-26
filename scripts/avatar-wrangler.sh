#!/usr/bin/env bash
tomcatScriptPath="/usr/share/apache-tomcat-7.0.79/webapps/gnomex/scripts/"
scriptsPath="/home/u0566434/Scripts/"
pDataPath="/home/u0566434/parser_data/"
downloadPath="/Repository/tempdownloads/"
dnaNexusPath="/home/u0566434/dnaNexus/"
avatarLocalDataPath="/Repository/PersonData/2017/4R/Avatar/"
regex=".*/(SL[a-zA-Z0-9]+).*|.*_(SL[a-zA-Z0-9]+).*|([0-9]{2}-[A-Za-z0-9\.]+.*)\.fastq.gz" # The SL can be at the first of filename OR come after the '_'


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

tree "$avatarLocalDataPath" --noreport > "$pDataPath"localTree.out
dx tree / > "$pDataPath"remoteTree.out

java hci.gnomex.daemon.auto_import.PathMaker "$pDataPath"remoteTree.out "$pDataPath"remotePath.out
java hci.gnomex.daemon.auto_import.PathMaker "$pDataPath"localTree.out  "$pDataPath"localPath.out

if [ "$flaggedIDParam" = "normal"  ]; then
        java hci.gnomex.daemon.auto_import.DiffParser  -local "$pDataPath"localPath.out -remote "$pDataPath"remotePath.out -cp 1 2 3 -matchbyname $regex > "$pDataPath"uniqueFilesToDownload.out
        sed -i '/FASTq/!d' "$pDataPath"uniqueFilesToDownload.out


        echo I am about to download files
        java hci.gnomex.daemon.auto_import.DownloadMain -fileList "$pDataPath"uniqueFilesToDownload.out -downloadPath "$downloadPath"  #outputs download.log  reads in uniqueFilesToDownload.out

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
                if [[ $fileName =~ $regex ]]; then
                        fullMatch=$BASH_REMATCH
                        hudAlphaID="${BASH_REMATCH[1]}"
                        hudAlphaID1="${BASH_REMATCH[2]}"
                        tGenID="${BASH_REMATCH[3]}"

                        if [ ! -z "$hudAlphaID" ]; then #If var is not empty
                                idStr+=$hudAlphaID","
                        elif [ ! -z "$hudAlphaID1" ]; then
                                idStr+=$hudAlphaID1","
                        elif [ ! -z "$tGenID" ]; then
                                idStr+=$tGenID","
                        fi

                fi
        done < $fileList

        echo this is idStr: $idStr
        echo $idStr | java  hci.gnomex.daemon.auto_import.StringModder > "$pDataPath"tempStr.out

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


        #Need to import experiments then and register/link/index

else
        echo $downloaderStatus
fi
echo ------------------------------------------------------------------------------------------------------------
