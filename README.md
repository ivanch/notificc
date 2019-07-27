# Notify-Change
#### Send an email from yourself to yourself when a website changes.

## to-do:
* Improve design
* Ensure integers were put on inputs
* Handle high ping
* Handle no internet connection
* Make checker an Object Oriented Thread with Threading Module
* Handle errors on the checker thread
* Documentation
* Lower the Docker image size

## Usage (Docker)
1. Pull the docker image `docker pull joseivanchechen/notify-change:latest`
2. Create a docker volume with `docker volume create notify-api`
3. Create a container and run it with `docker run -d -p 8000:80 -p 8080:8080 -v notify-api:/opt/api/data --name notify joseivanchechen/notify-change`

Access the page at [http://localhost:8000](http://localhost:8000). Port 8080 is where the API will provide/get information.

## Usage
Default password is *password*, you can change or disable that later.

Once at the index page, you can start/stop the checker by clicking at its status.


## Reverse Proxy Example
1. Sample **nginx** configuration:
```
server {
    location /notify-change/ {
        proxy_pass http://localhost:8000/;
    }
}
```
2. At `package.json`, `"homepage"` should be defined as `./notify-change`

After that, you should be able to access it from [http://localhost/notify-change](http://localhost/notify-change). Note that you won't be able to access it using the 8000 port from your browser anymore.

Reverse proxing a react-router app isn't so easy, so you'll have to build the Docker image again and deploy it.

## Building Docker image
1. `npm run build`. This will take a while.
2. `docker build --force-rm -t joseivanchechen/notify-change:latest .`. This will take a while.
3. If you're running the container, stop it with `docker stop notify`
4. If you have created the container, remove it with `docker rm notify`
5. Create and run the container, as stated in **Usage** step 3.

## Resource usage
Nginx and API uses about 50MB RAM. CPU only grows a little when the checker compares two images.

## Warning
### It's intended to be self-hosted.
Meaning that the API may not work if you run it on a VPS. That's because there's a high probability that the email server will block the logins attempts, returning a 403 response to the login request.