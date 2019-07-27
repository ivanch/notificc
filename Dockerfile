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
            pcre-dev \
            ca-certificates \
            openssl \
            wget \
            tar

# Application itself
COPY config/nginx.conf /etc/nginx/nginx.conf
COPY config/requirements.txt requirements.txt

## Python
RUN pip3 install -r requirements.txt && \
    python3 -c 'from PIL import Image; import selenium; print("Python - SUCCESS!")' && \
    rm requirements.txt

## PhantomJS
RUN set -ex && \
    wget -qO- "https://github.com/dustinblackman/phantomized/releases/download/2.1.1/dockerized-phantomjs.tar.gz" | tar xz -C / && \
    npm install -g phantomjs --unsafe-perm

# Clearing
RUN apk del .build-dependencies && \
    rm -rf /var/cache/apk/* && \
    rm -rf /tmp

# Application itself
COPY ./build /var/www
COPY ./api /opt/api
WORKDIR /opt/api
RUN addgroup www && \
    adduser -D -H -G www www && \
    chmod -R 770 /opt/api && \
    chown -R www:www /opt/api

# Connection to the outside world
VOLUME /opt/api/data
EXPOSE 8080
EXPOSE 80

# Running
COPY config/exec.sh /opt
CMD sh /opt/exec.sh