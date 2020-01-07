#####
## Build stage
#####
FROM node:alpine as builder

WORKDIR /web
COPY ./web/package* ./
RUN npm install
COPY ./web ./

ARG PUBLIC_URL=./
ENV PUBLIC_URL ${PUBLIC_URL}

RUN npm run build

#####
## Server
#####
FROM python:3-alpine

# Requirements
RUN apk add --no-cache nginx \
    chromium chromium-chromedriver

RUN apk add --virtual .build-dependencies \
            --no-cache \
            python3-dev \
            build-base \
            linux-headers \
            zlib-dev \
            libjpeg-turbo-dev \
            pcre-dev \
            ca-certificates \
            openssl \
            openssl-dev \
            libffi-dev

# Python Requirements
COPY api/requirements.txt requirements.txt
RUN pip install -r requirements.txt && \
    mkdir /run/nginx

# Config
COPY assets/docker/nginx* /etc/nginx/
COPY assets/docker/exec.sh /exec.sh

# API files
WORKDIR /api
COPY ./api ./

RUN make tests && \
    make clean

RUN make setup && \
    addgroup www && \
    adduser -D -H -G www www && \
    chmod -R 770 ./ && \
    chown -R www:www ./

# Web server
COPY --from=builder /web/build /var/www

# Cleaning
RUN apk del .build-dependencies && \
    rm -rf /var/cache/apk/*

# Web port
EXPOSE 80
EXPOSE 443

# API volume
VOLUME /api/shared

VOLUME /etc/nginx/certs

ENTRYPOINT ["sh", "/exec.sh"]