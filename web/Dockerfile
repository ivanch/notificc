FROM node:alpine as builder

WORKDIR /web
COPY package* ./
RUN npm install
COPY . ./
RUN npm run build

FROM nginx:stable-alpine

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /web/build /var/www

EXPOSE 80

RUN addgroup www && \
    adduser -D -H -G www www

VOLUME /opt/api/shared

ENTRYPOINT ["nginx", "-g", "daemon off;"]