# oute-processor

## To build the docker container

- Run `npm i` in server folder
- If you want to build for different platform, node version then change it in `Dockerfile` default is `linux/amd64`
- Ensure you have the `NPM_TOKEN=you_npm_token` in `.env` file
- To upgrade the version run `npm version patch|minor|major`, Note this cmd on each run bump the version so run only if you need to bump
- Before building the docker ensure you have the list of env files named as `.env.NODE_ENV` ex `.env.dev`
- Run `sh build.sh` from top folder, if you want to publish this build then make sure you upgrade the version in build.sh
- Run `sh pushImage.sh` from top folder, if you want to publish on cloud
- if some reason docker build causing unexpected behavior then add ` --no-cache` after the `docker build`
- To start the container use `docker run -p 3205:3205 -e port=3205 --rm tc-processor-api:new_version`
- To export run `docker save -o tc-processor-api.tar tc-processor-api:new_version`
- To import run `docker load -i tc-processor-api.tar`

## To deploy as the lambda

- Set the `APP_MODE` in the environment to run as serverless
- Set the `APP_PROVIDER` in the environment for serverless provider such as `aws,azure`

## To publish the container

  - Run `sh pushImage.sh`, ensure you run aws/docker login before pushing

## Security
  - Ref link for best practice `https://expressjs.com/en/advanced/best-practice-security.html`


## Abbrevation full form

- TF => transformation


### Notes
  - INTEGRATION type node will skip the HTTP types