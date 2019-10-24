FROM python:3-alpine

# Requirements
RUN apk add --no-cache pcre npm libjpeg-turbo nginx
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
            wget \
            tar

# PhantomJS
RUN set -ex && \
    wget -qO- "https://github.com/dustinblackman/phantomized/releases/download/2.1.1/dockerized-phantomjs.tar.gz" | tar xz -C / && \
    npm install -g phantomjs --unsafe-perm

COPY docker/requirements.txt requirements.txt
RUN pip install -r requirements.txt && \
    python -c 'from PIL import Image; import selenium; print("Python - SUCCESS!")' && \
    rm requirements.txt && \
    mkdir /run/nginx

# API server
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/exec.sh /opt

# API itself
COPY . /opt/api
WORKDIR /opt/api
RUN python -c "import app" && \
    mkdir /opt/api/shared && \
    addgroup www && \
    adduser -D -H -G www www && \
    chmod -R 770 /opt/api && \
    chown -R www:www /opt/api

# Cleaning
RUN apk del .build-dependencies && \
    rm -rf /var/cache/apk/* && \
    rm -rf /tmp

VOLUME /opt/api/shared

EXPOSE 8080

ENTRYPOINT ["sh", "/opt/exec.sh"]