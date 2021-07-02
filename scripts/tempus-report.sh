#!/usr/bin/env bash
tempusPath="/Repository/tempdownloads/tempus/"
pDataPath="/home/u0566434/parser_data/"

regex="^.*TL-[0-9]{2}-([A-Za-z0-9]{6}).*$"

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

[ -e  "$pDataPath"paired-fileset.txt ] && rm  "$pDataPath"paired-fileset.txt
#creating mile to query what all fastq files assocaited json name
find "$tempusPath" -type f -name "TL-*" -print0 |
        while IFS= read -r -d '' line; do
                [[ $line =~ $regex ]] && echo "result_""${BASH_REMATCH[1]}""*" >> "$pDataPath"testero.txt
        done
echo removing duplicates
sort -o "$pDataPath"testero.txt -u "$pDataPath"testero.txt
#find the json files that pair with the fastq, this file will be fewer with its results
cat "$pDataPath"testero.txt | xargs -I {}  find "$tempusPath"Flagged -type f -iname {} > "$pDataPath"paired-fileset.txt
while read fileName; do
        regex=".*result_(.{6}).*"
        if [[ $fileName =~ $regex ]]; then
                echo "TL-*"${BASH_REMATCH[1]}"*" >> "$pDataPath"testero1.txt
        else
                echo no match $fileName
        fi
done < "$pDataPath"paired-fileset.txt
sort -o "$pDataPath"testero1.txt -u "$pDataPath"testero1.txt

cat "$pDataPath"testero1.txt | xargs -I {} find "$tempusPath""Flagged" -type f -iname {} >> "$pDataPath"paired-fileset.txt
java hci.gnomex.daemon.auto_import.TempusReport -file "$pDataPath"paired-fileset.txt -cred "$pDataPath"tempus-cred-prod.properties

cat "$pDataPath"paired-fileset.txt | xargs  mv -t "$tempusPath"
find "$tempusPath""Flagged/" -type f -mtime +150 -print > "$pDataPath"unpaired-fileset.txt
#ls /Repository/tempdownloads/tempus/Flagged/ > ./unpaired-fileset.txt
cat "$pDataPath"unpaired-fileset.txt | xargs ls -lt "$tempusPath"Flagged > "$pDataPath"unpaired-info.txt

find "$tempusPath" -type f -name "TL-*" | xargs mv -t "$tempusPath"Flagged
find "$tempusPath" -type f -name "result*" | xargs mv -t "$tempusPath"Flagged

rm "$pDataPath"testero1.txt
rm "$pDataPath"testero.txt
