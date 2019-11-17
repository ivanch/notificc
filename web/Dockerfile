FROM node:alpine as builder

WORKDIR /web
COPY package* ./
RUN npm install
COPY . ./

ARG PUBLIC_URL
ARG API_URL

ENV PUBLIC_URL ${PUBLIC_URL}
ENV API_URL ${API_URL}

RUN npm run build

FROM nginx:stable-alpine as stage

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /web/build /var/www

EXPOSE 80

RUN addgroup www && \
    adduser -D -H -G www www

VOLUME /opt/api/shared

ENTRYPOINT ["nginx", "-g", "daemon off;"]