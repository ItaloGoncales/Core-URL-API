FROM node:12

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn*.lock ./

RUN yarn

COPY . .

EXPOSE 80

ENV NODE_ENV production
ENV MONGO_HOST localhost
ENV PORT 80

CMD [ "node", "server.js" ]