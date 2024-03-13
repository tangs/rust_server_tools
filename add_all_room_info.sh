#!/bin/sh

path=`pwd`
gameId=$1
gamePath="../game_${gameId}"

echo "path: ${path}"
echo "game id: ${gameId}"

# cd $gamePath
# git pull origin main
# cd -
# sh sych_cpp_submodule.sh ${gameId}
# pwd

cd utils
node src/add_all_room_info.js /Users/tangs/Documents/slots_server_rust/game_${gameId}
cd -

cd $gamePath
git add game_server/src/game_service/mod.rs
git add game_server/src/game_service/room.rs
git add game_server/src/packer/mod.rs
git add game_server/src/peer/game_service.rs
git commit -m "add get all table players count api."
git push
cd -
