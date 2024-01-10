# Use an official Node runtime as a parent image
FROM node:21

LABEL owner="VoxifyDevelopment"
LABEL hoster="contact@voxify.dev"

# Install dumb-init
RUN apt-get update && \
    apt-get install -y dumb-init && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory to the app
WORKDIR /usr/src/app

RUN mkdir ./dist/
COPY --chown=node:node . .
COPY --chown=node:node .env ./dist/.env

RUN npm --prefix . install

RUN npm --prefix . run build:min

USER node

EXPOSE 8801

WORKDIR /usr/src/app/dist

# RUN ls -la
# RUN cat .env

# Run your app using ts-node
CMD ["dumb-init", "node", ".", "NODE_ENV=production"]
