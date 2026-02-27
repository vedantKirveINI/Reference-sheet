#! /bin/bash

# Load environment variables
source .env

VERSION=$(node -p "require('./package.json').version")

docker tag tc-sheet-api:$VERSION 383130051509.dkr.ecr.ap-south-1.amazonaws.com/tc-sheet-api:$VERSION
docker push 383130051509.dkr.ecr.ap-south-1.amazonaws.com/tc-sheet-api:$VERSION