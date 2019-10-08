# Notify-Change
#### Send an email from yourself to yourself when a website changes.

## Deploy (Docker)
1. Configure the `docker-compose.yaml` file as you need it.
2. Simply run `docker-compose up -d`

Access the page at [http://localhost:8800](http://localhost:8800). Port 8810 is where the API will listen.

## Usage
Default password is *password*, you can change or disable that later.

Once at the index page, you can start/stop the checker by clicking at its status.


## Reverse Proxy Example
1. Sample **nginx** configuration:
```
server {
    location /notify-change/ {
        proxy_pass http://localhost:8800/;
    }
}
```
2. At `package.json`, `"homepage"` should be defined as `./notify-change`

After that, you should be able to access it from [http://localhost/notify-change](http://localhost/notify-change). Note that you won't be able to access it using the 8000 port from your browser anymore.

Reverse proxying a *react-router* app isn't so easy, you'll have to build the Docker image again and deploy it.

## Building Docker image
1. Run `./build.sh` (This will take a while)
2. Create and run the composer, as stated in **Usage** step 2.

## Develop
1. Go to `web` folder and run `npm install` and `npm start`
2. You will also need to start the API server (Python WSGI), go to `api` and run `python app.py`

## Resource usage
| Service | State | RAM Usage |
|---------|-------|-----------|
| Web server | Idle/Active | About 2 MB |
| API server | Idle | About 20 MB |
| API server | Active | About 50 MB |


## Warning
### It's intended to be self-hosted.
Meaning that the API may not work if you run it on a VPS. That's because there's a high probability that the email server will block the logins attempts, returning a 403 response to the login request.

## to-do:
* Ensure integers were put on inputs
* Handle high ping
* Handle no internet connection
* Handle errors on the checker thread
* Change to push notifications