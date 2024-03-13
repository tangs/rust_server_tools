#!/bin/sh

ls .. | grep "^game_" | awk '{idx = index($0, "/") - 6; print "sh", "add_all_room_info.sh", substr($0, 6)}' | sh
# ls .. | grep "^game_" | awk '{idx = index($0, "/") - 6; print $0}'
