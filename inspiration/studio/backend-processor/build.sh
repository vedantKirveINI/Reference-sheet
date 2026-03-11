#! /bin/bash

# Load environment variables
source .env

VERSION=$(node -p "require('./server/package.json').version")

docker build --build-arg NPM_TOKEN=$NPM_TOKEN -t tc-processor-api:$VERSION --platform linux/amd64 .
docker image prune -f