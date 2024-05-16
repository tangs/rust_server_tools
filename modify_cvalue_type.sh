#!/bin/sh

path=`pwd`
gameId=$1
gamePath="${path}/../game_${gameId}"

echo "path: ${path}"
echo "game id: ${gameId}"

cd $gamePath
git pull origin main
cd -
# sh sych_cpp_submodule.sh ${gameId}
# pwd

cd utils
node src/modify_cvalue_type.js $gamePath
cd -

cd $gamePath
git add game_server/src/database/mysql/table/game_slots_levels.rs
git add game_server/src/packer/mod.rs
git commit -m "update modity cvalue type to i64."
git push origin main
cd -
