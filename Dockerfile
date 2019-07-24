FROM node:10

# Create app directory
WORKDIR /var/app

COPY package*.json ./

RUN npm install