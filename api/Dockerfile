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

COPY docker/requirements.txt requirements.txt
RUN pip install -r requirements.txt && \
    python -c 'from PIL import Image; import selenium' && \
    rm requirements.txt && \
    mkdir /run/nginx

# API server
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/exec.sh /opt

# API files
COPY . /opt/api
WORKDIR /opt/api
RUN mkdir /opt/api/shared && \
    addgroup www && \
    adduser -D -H -G www www && \
    chmod -R 770 /opt/api && \
    chown -R www:www /opt/api

# Cleaning
RUN apk del .build-dependencies && \
    rm -rf /var/cache/apk/*

VOLUME /opt/api/shared

EXPOSE 8080

ENTRYPOINT ["sh", "/opt/exec.sh"]