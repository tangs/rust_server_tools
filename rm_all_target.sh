#!/bin/sh

cd ../
ls | grep "^game_" | awk '{print "rm -rf", $0"/target"}' | sh
