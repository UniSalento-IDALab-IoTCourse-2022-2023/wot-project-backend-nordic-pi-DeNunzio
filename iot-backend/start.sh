#!/bin/bash

sudo nvm use 8.9.0
nvm use 8.9.0
npm install
sudo node app.js &

nvm use 10.2.0
node ws_server.js &