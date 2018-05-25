#!/bin/bash
tomcatScriptPath="/usr/share/apache-tomcat-7.0.79/webapps/gnomex/scripts/"
scriptsPath="/home/u0566434/Scripts/"
pDataPath="/home/u0566434/parser_data/"
downloadPath="/Repository/tempdownloads/"
dnaNexusPath="/home/u0566434/dnaNexus/"
avatarLocalDataPath="/Repository/PersonData/2017/4R/Avatar/"
regex=".*/(SL[a-zA-Z0-9]+).*|.*_(SL[a-zA-Z0-9]+).*" # The SL can be at the first of filename OR come after the '_'


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

CLASSPATH="./gnomex1.jar:$CLASSPATH"
export CLASSPATH

#java -Xmx6000M hci.gnomex.daemon.LinkData $*
#java hci.gnomex.daemon.auto_import.XMLParserMain $*



flaggedIDParam=${1:-normal}
idColumn=${2:-1}



echo optional param  $optParam
downloadCode=0
fileList=""
verifiedSlInfo=""





echo This is the start: $startPath
echo This is the path : $scriptsPath


if [ "$flaggedIDParam" = "normal"  ]; then

        source "$dnaNexusPath"dx-toolkit/environment
        dx login --token 0qFo3v0VLcWuqFzsuWXjkMKogFfVM89x
        dx cd /

        tree "$avatarLocalDataPath" --noreport > "$pDataPath"localTree.out
        dx tree . > "$pDataPath"remoteTree.out

        java hci.gnomex.daemon.auto_import.PathMaker "$pDataPath"remoteTree.out "$pDataPath"remotePath.out
        java hci.gnomex.daemon.auto_import.PathMaker "$pDataPath"localTree.out  "$pDataPath"localPath.out

        java hci.gnomex.daemon.auto_import.DiffParser  "$pDataPath"localPath.out  "$pDataPath"remotePath.out >> "$pDataPath"uniqueFilesToDownload.out
        sed -i '/FASTq/!d' "$pDataPath"uniqueFilesToDownload.out


        echo I am about to download files

        #downloaderStatus=$(java hci.gnomex.daemon.auto_import.DownloadMain "$pDataPath" "$downloadPath") #outputs download.log  reads in uniqueFilesToDownload.out
        # the line above executes
        downloadCode=$? # Saves the exit status of the last script

        fileList="$pDataPath"download.log
else
        bash "$scriptsPath"makeVerifiedList.sh $flaggedIDParam "$pDataPath"download.log "$pDataPath"verifiedAvatarList.out $idColumn $downloadPath"/Flagged/"
        fileList="$pDataPath"verifiedAvatarList.out

        echo this is the verfied file list name $fileList
        cat $fileList


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
                        id="${BASH_REMATCH[1]}"
                        id1="${BASH_REMATCH[2]}"

                        if [ ! -z "$id" ]; then #If var is not empty
                                idStr+=$id$","
                        else
                                idStr+=$id1$","
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
        cd $tomcatScriptPath
        java hci.gnomex.daemon.auto_import.XMLParserMain -file $verifiedSlInfo -initXML "$pDataPath"clinRequest.xml -annotationXML "$pDataPath"clinGetPropertyList.xml -importScript import_experiment.sh -outFile "$pDataPath"tempRequest.xml -importMode avatar


        # checking last script ran(XMLParserMain) has an exit status of 0
        if [ $? -eq 0 ]; then
            java hci.gnomex.daemon.auto_import.FileMover -file $fileList  -root $avatarLocalDataPath -downloadPath $downloadPath -flaggedFile "$pDataPath"flaggedIDs.out -mode avatar
        fi


        #requestList=$(<"$pDataPath"tempRequestList.out)
        #bash linkData.sh -dataSource "4R" -requests $requestList

        #rm "$pDataPath"tempRequestList.out





        #Need to import experiments then and register/link/index






else
        echo $downloaderStatus
fi


echo ------------------------------------------------------------------------------------------------------------

:<<'END'

END
#bash "$scriptsPath"foundation/automateFoundation.sh $scriptsPath $pDataPath $foundationLocalDataPath
