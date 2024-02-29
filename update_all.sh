#!/bin/sh

ls .. | grep "^game_" | awk '{print substr($1, 6)}' | xargs -n 1 sh upload_game_api.sh
