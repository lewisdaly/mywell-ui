#!/bin/bash

nonap() {
    echo "exiting"
    kill -9 $WATCH_PID
    kill -9 $NODEMON_PID
    exit
}

trap nonap INT

echo "Running gulp"
cd ./src && npm run watchify &
WATCH_PID=$!

echo "Running nodemon"
npm run production &
NODEMON_PID=$!


wait $FIND_PID
wait $NODEMON_PID



# trap "ekill $$" SIGINT

# function ctrl_c() {
#   echo "** Trapped CTRL-C"
# }
#
# trap ctrl_c TERM
#
#
# cd ./src && npm run watchify&
# # echo 'hello there!'
#
# # jobs -p
# wait
