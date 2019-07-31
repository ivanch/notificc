#!/bin/bash
cd web
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run build
docker build -t joseivanchechen/notify-web .
cd ..

cd api
docker build -t joseivanchechen/notify-api .
cd ..