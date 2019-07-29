#!/bin/bash
npm install
npm run build
docker build --force-rm -t joseivanchechen/notify-change .