#! /bin/bash

# Load environment variables
source .env

VERSION=$(node -p "require('./server/package.json').version")

docker tag tc-processor-api:$VERSION 383130051509.dkr.ecr.ap-south-1.amazonaws.com/tc-processor-api:$VERSION
docker push 383130051509.dkr.ecr.ap-south-1.amazonaws.com/tc-processor-api:$VERSION