FROM node:alpine

WORKDIR /src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3002

CMD ["node", "server.js"]
