FROM node:16.13-slim

RUN echo "America/Montreal" > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata

RUN mkdir -p /le-taxi-api-node
WORKDIR /le-taxi-api-node

COPY . /le-taxi-api-node

# RUN npm update npm
RUN npm install

RUN npm run tsc

EXPOSE 8099
CMD [ "node", "/le-taxi-api-node/src/index.js" ]
