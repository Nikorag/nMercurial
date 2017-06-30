FROM node

MAINTAINER Jamie Bartlett <nikorag@gmail.com>

RUN git clone https://github.com/Nikorag/nMercurial.git

RUN cd nMercurial && npm install
RUN npm install

ENTRYPOINT ["npm", "start", "--prefix", "/nMercurial"]

EXPOSE 3000
