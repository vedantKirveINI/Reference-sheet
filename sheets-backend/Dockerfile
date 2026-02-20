FROM --platform=linux/amd64 node:22.13.1-alpine

#set the working directory
WORKDIR /app
# Copy project for build
COPY . /app
RUN apk add --no-cache openssl
#npm setup
# Set npm registry + token dynamically
ARG NPM_TOKEN
RUN npm set registry https://npm.gofo.app && \
    npm set //npm.gofo.app/:_authToken=$NPM_TOKEN && \
    npm i --omit dev
#Start the application
CMD ["sh", "./start.sh"]