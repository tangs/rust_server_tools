#!/bin/sh

game="game_$1"

echo $game

cd ~/Documents/slots_server_rust
git pull
git submodule update --recursive
ls | grep $game | awk '{print "cd", $0"/game_library/cpp;", "git pull origin main; git submodule update --recursive;", "cd -;", "cd", $0"/game_library", "git pull; git add cpp; git commit -m \"update cpp module.\";git push;", "cd -;"}' | sh
cd -
