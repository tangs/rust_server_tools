#!/bin/sh

path=`pwd`
gameId=$1
gamePath="${path}/../game_${gameId}"

echo "path: ${path}"
echo "game id: ${gameId}"

cd $gamePath
git pull origin main
cd -
sh sych_cpp_submodule.sh ${gameId}
pwd

cd utils
node src/add_lottery_mode.js $gamePath
cd -

cd $gamePath
git add .
git commit -m "add lottery control mode refresh."
git push
cd -
