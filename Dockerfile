FROM node:10-alpine

RUN apk add git && \
  mkdir /app

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm install
