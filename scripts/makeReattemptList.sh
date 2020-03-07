#!/usr/bin/env bash

remoteDataPath=$1
regex=$2
outFile=$3


echo remote data path: $remoteDataPath
echo regex: $regex
echo out file: $outFile

find $remoteDataPath"Flagged/" -regextype posix-extended -regex $regex  -printf '%f\n' > $outFile
flaggedCount=`cat $outFile |  wc -l`
echo The number of flagged Samples to be reattempted: $flaggedCount


if (( $flaggedCount > 0 )); then
        find $remoteDataPath"Flagged/" -regextype posix-extended -regex $regex | xargs mv -t $remoteDataPath
fi
