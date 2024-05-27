#!/bin/sh

path=`pwd`
gameId=$1
gamePath="${path}/../game_${gameId}"

echo "path: ${path}"
echo "game id: ${gameId}"

cd $gamePath
git pull origin main
cd -

cd utils
node src/update_ns_game.js $gamePath
cd -

cd $gamePath
git add game_server/Cargo.toml
git commit -m "update ns game version."
git push origin main
cd -
