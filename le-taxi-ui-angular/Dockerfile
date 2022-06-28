FROM node:14.19-slim
MAINTAINER VdMtl
ARG ENV=dev

# Create app directory
RUN mkdir -p /usr/src/app
RUN echo "America/Montreal" > /etc/timezone && dpkg-reconfigure -f noninteractive tzdata

WORKDIR /usr/src/app
COPY . /usr/src/app

# Bundle app source
ENV NODE_ENV=${ENV}
RUN test -n "$ENV" && npm install && npm run build:${ENV} || :

# Lanch server
EXPOSE 8070
CMD [ "node", "server.js" ]
