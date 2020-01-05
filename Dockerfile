FROM node:10-alpine

WORKDIR /usr/app

COPY package*.json ./

RUN npm install --quiet

COPY ./ ./

EXPOSE 3000

ENV EXPRESS_IP=0.0.0.0

CMD [ "npm", "start" ]