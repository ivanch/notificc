#!/bin/bash
npm install
npm run build
docker build -t --force-rm joseivanchechen/notify-change