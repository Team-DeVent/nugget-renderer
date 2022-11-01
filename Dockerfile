FROM ubuntu:18.04

RUN apt-get -qq update
RUN apt-get -qq upgrade --yes 
RUN apt-get -qq install curl --yes
RUN curl -sL https://deb.nodesource.com/setup_17.x | bash -
RUN apt-get -qq install nodejs --yes


WORKDIR /app 
COPY package*.json /app/ 

RUN apt-get install -y ffmpeg
RUN npm install 


COPY . /app 
CMD ["npm", "run", "start"]

EXPOSE 3030