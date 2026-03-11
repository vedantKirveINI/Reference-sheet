#! /bin/bash

#Get run configs
node ./src/getConfigs.js &&

#Start the application for the config
node ./src/index.js