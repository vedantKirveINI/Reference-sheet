#! /bin/bash

npm run build
source .env
VERSION=$(node -p "require('./package.json').version")
docker build --build-arg NPM_TOKEN=$NPM_TOKEN -t tc-sheet-api:$VERSION --platform linux/amd64 .
docker image prune -f