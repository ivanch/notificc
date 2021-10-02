<h1 align="center">
  <p align="center">NotificC - Get notified when a website changes</p>
</h1>
<p align="center">
  <a href="https://github.com/ivanch/notificc/actions/workflows/main.yml"><img src="https://github.com/ivanch/notificc/actions/workflows/main.yml/badge.svg"/></a>
  <a href="https://hub.docker.com/r/ivanch/notificc"><img src="https://img.shields.io/docker/image-size/ivanch/notificc"/></a>
  <a href="https://www.codacy.com/gh/ivanch/notificc/dashboard"><img alt="Codacy grade" src="https://app.codacy.com/project/badge/Grade/4ab5b78493614268a7d6aa73ea41bcb6"></a>
  <a href="https://lgtm.com/projects/g/ivanch/notificc/"><img alt="LGTM Alerts" src="https://img.shields.io/lgtm/alerts/github/ivanch/notificc"></a>
</p>

## Features
* Auth Page
* Push Notifications (allows multiple devices)
* Website change logs

## Deploy (Docker)
```shell
docker run --name notificc -d \
    -m 150m \
    -p 8800:80 \
    -v $PWD/data:/api/shared \
    ivanch/notificc:latest
```

With SSL:
```shell
docker run --name notificc -d \
    -m 150m \
    -p 8800:80 \
    -v $PWD/data:/api/shared \
    -v /path/to/certs:/etc/nginx/certs \
    --env SSL_CERT=example.com.crt \
    --env SSL_KEY=example.com.key \
    ivanch/notificc:latest
```

## Build Docker Image
**You'll have to build the image again if you don't want to use default http://example.domain as the service URL.**
1. Clone this repo with `git clone https://github.com/ivanch/notificc`
2. Run `docker build -t ivanch/notificc:latest --build-arg PUBLIC_URL=http://DOMAIN/PATH .`
3. [Deploy](#deploy-docker)

## Usage
Default password is *password*, you can change or disable that later in Settings.

Once at the index page, you can start/stop the checker by clicking at its status badge.

## Screenshot

![Index page](assets/index.png)

## Development
1. Run `pip install -r api/requirements.txt` to install all the requirements.
2. Go to `web` folder, run `npm install` to install dependencies and `npm start` to start the development server.
3. Go to `api` folder and run `python app.py` to start the API server.
