#!/bin/sh

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker push ivanch/notificc-web:builder
docker push ivanch/notificc-web:latest
docker push ivanch/notificc-api:latest