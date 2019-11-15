<h1 align="center">
  <p align="center">NotificC - Get notified when a website changes</p>
</h1>
<p align="center">
  <a href="https://travis-ci.com/ivanch/notificc"><img src="https://travis-ci.com/ivanch/notificc.svg?token=EiwZJLp9isLBJ89qdmD6&branch=master"/></a>
  <a href="https://hub.docker.com/r/ivanch/notificc-api"><img src="https://images.microbadger.com/badges/image/ivanch/notificc-api.svg"/></a>
  <a href="https://hub.docker.com/r/ivanch/notificc-web"><img src="https://images.microbadger.com/badges/image/ivanch/notificc-web.svg"/></a>
</p>
<p align="center">
  <a href="https://app.codacy.com/manual/joseivanchechen/notificc/dashboard"><img alt="Codacy grade" src="https://img.shields.io/codacy/grade/4ab5b78493614268a7d6aa73ea41bcb6"></a>
<a href="https://lgtm.com/projects/g/ivanch/notificc/"><img alt="LGTM Alerts" src="https://img.shields.io/lgtm/alerts/github/ivanch/notificc"></a>

</p>

## Features
* Auth Page
* Push Notifications (allows multiple devices)
* Website change logs

## Deploy (Docker)
1. Run `curl https://raw.githubusercontent.com/ivanch/notificc/master/docker-compose.yaml > docker-compose.yaml`
2. Configure the docker compose file as you need it.
3. Run `docker-compose up -d`.

## Deploy (Build Docker Image)
1. Clone this repo with `git clone https://github.com/ivanch/notificc` and either:
* Run `docker-compose up -d --build` to build and deploy it afterwards.
* Run `docker-compose build` just to build.

## Usage
Default password is *password*, you can change or disable that later in Settings.

Once at the index page, you can start/stop the checker by clicking at its status.

## Reverse Proxy Example
1. Sample **nginx** configuration:
```nginx
server {
    location /notificc/ {
        proxy_pass http://localhost:8800/;
    }
}
```
2. At `package.json`, `"homepage"` should be defined as `./notificc`

After that, you should be able to access it from [http://localhost/notificc](http://localhost/notificc).

Reverse proxying a *react-router* app isn't so easy, you'll have to [build the Web Image](#deploy-build-docker-image) again with your configuration.

## Screenshot

![Index page](assets/index.png)

## Development
1. Go to `web` folder, run `npm install` to install dependencies and `npm start` to start the development server.
2. Go to `api` folder and run `pip install docker/requirements.txt` to install all the requirements.
3. Run `python app.py` to start the API server.
