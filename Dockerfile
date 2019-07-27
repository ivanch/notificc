FROM nginx:stable-alpine

# Dependencies
RUN apk add --no-cache python3 pcre npm
RUN apk add --virtual .build-dependencies \
            --no-cache \
            python3-dev \
            build-base \
            linux-headers \
            zlib-dev \
            libjpeg-turbo-dev \
            pcre-dev

# Application itself
COPY ./api /opt/api
COPY ./build /var/www
COPY nginx.conf /etc/nginx/nginx.conf

WORKDIR /opt/api

## Python
RUN pip3 install -r requirements.txt
RUN python3 -c 'from PIL import Image; import selenium; print("Python - SUCCESS!")'

## PhantomJS
RUN set -ex && \
    apk add --no-cache --virtual .build-deps ca-certificates openssl wget tar && \
    wget -qO- "https://github.com/dustinblackman/phantomized/releases/download/2.1.1/dockerized-phantomjs.tar.gz" | tar xz -C / && \
    npm install -g phantomjs --unsafe-perm && \
    apk del .build-deps

# Clearing
RUN apk del .build-dependencies && \
    rm -rf /var/cache/apk/* && \
    rm -rf /tmp
RUN addgroup www && \
    adduser -D -H -G www www && \
    chmod -R 770 /opt/api && \
    chown -R www:www /opt/api


# Connection to the outside world
VOLUME /opt/api/data
EXPOSE 8080
EXPOSE 80

# Running
COPY exec.sh /opt
CMD sh /opt/exec.sh