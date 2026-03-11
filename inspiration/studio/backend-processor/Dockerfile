FROM --platform=linux/amd64 node:22.13.1-alpine

#set the working directory
WORKDIR /app
# Copy project for build
COPY ./server /app
# Update apk index and install latest CA certificates
RUN apk update && apk add --no-cache ca-certificates && update-ca-certificates
#npm setup
# Set npm registry + token dynamically
ARG NPM_TOKEN
RUN npm set registry https://npm.gofo.app && \
    npm set //npm.gofo.app/:_authToken=$NPM_TOKEN && \
    npm i --omit dev
#Define the env variable for port(default is 3205)
ENV port 3205
ENV token ""
ENV enable_activity true
#Expose application port
EXPOSE ${port}
#Print variables
#RUN echo "port=${port}, token=${token}, enable_activity=${enable_activity}"
#Start the application
CMD ["sh", "./src/start.sh"]