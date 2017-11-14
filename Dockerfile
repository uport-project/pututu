FROM node:wheezy

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Bundle app source
COPY . /usr/src/app
RUN rm -rf /usr/src/app/node_modules && \
    npm install

EXPOSE 3000
ENV PORT 3000
CMD [ "npm", "start" ]
