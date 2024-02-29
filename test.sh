#!/bin/sh

skipClean=$1
if [ ! -n "$skipClean" ]; then
	skipClean=0
fi

echo "skip clean: ${skipClean}"

if [ $skipClean != "1" ]; then
	echo "true"
else
	echo "false"
fi
