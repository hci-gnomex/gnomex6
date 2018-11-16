#!/usr/bin/env bash

remoteDataPath=$1
regex=$2
outFile=$3

echo remote data path: $remoteDataPath
echo regex: $regex
echo out file: $outFile

find $remoteDataPath"Flagged/" -regextype sed -regex $regex  -printf '%f\n' >  $outFile

flaggedCount=`cat $outFile |  wc -l`
if (( $flaggedCount > 0 )); then
        find $remoteDataPath"Flagged/" -regextype sed -regex $regex | xargs mv -t $remoteDataPath
fi
