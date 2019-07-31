FROM nginx:stable-alpine

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY ./build /var/www

EXPOSE 80

RUN addgroup www && \
    adduser -D -H -G www www && \
    mkdir /opt/api && \
    mkdir /opt/api/shared && \
    chmod -R 770 /opt/api && \
    chown -R www:www /opt/api

VOLUME /opt/api/shared

ENTRYPOINT ["nginx", "-g", "daemon off;"]