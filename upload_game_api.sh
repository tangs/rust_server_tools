#!/bin/sh

gameId=$1
# skip call cargo clean.
skipClean=$1
if [ ! -n "$skipClean" ]; then
	skipClean=0
fi

packageName=game_${gameId}_server
path=../game_$gameId
docPath=target/doc/game_${gameId}_server

echo "game id: ${gameId}, package name: ${packageName}, path: ${path}, doc path: ${docPath}"

cd $path
cargo doc -p $packageName
rm -rf tmp.tar
tar -cf tmp.tar $docPath/
cd -

rm -rf tmp.tar
mv ${path}/tmp.tar ./

scp ./tmp.tar tangs@192.168.1.177:~/Documents/apache-tomcat-9.0.82/webapps/rust_api
ssh tangs@192.168.1.177 "cd ~/Documents/apache-tomcat-9.0.82/webapps/rust_api;tar -xvf tmp.tar;cp -rf target/doc/game_${gameId}_server/ ./;rm -rf target;rm -rf tmp.tar"
rm -rf tmp.tar

if [ $skipClean != "1" ]; then
	cd $path
	cargo clean
	cd -
fi
