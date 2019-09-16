#!/bin/bash

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
#bash  researcher-permission.sh -dbCredentials ...gnomex-creds.properties -level sampleproperty -irb 88405_HEM -vendor avatar -attributeType "Submitted Diagnosis" -attributeID "HEM" -auth
java -Xmx6000M hci.gnomex.daemon.auto_import.CollaboratorPermission $*
