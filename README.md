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

## Configuring .env
The only variable that needs to be set is `REACT_APP_API_HOST`.

## Configure Flask with uWSGI
#### Test before running it
1. Run `uwsgi --socket localhost:8000 --protocol=http -w wsgi` inside the `api` folder.
2. Set API URL variable as `http://localhost:8000` in `.env`.
3. Run a development server with `npm start` inside the project root folder.
4. Check if everything is running.

#### Configuring Nginx
As I said before, check other tutorials if you're using something else other than **nginx**.
1. Edit the default nginx file, or the one that you're using, with the following:
```
server {
    location / {
        include uwsgi_params;
        uwsgi_pass unix:/absolute/path/to/api/socket.sock;
    }
}
```
1. You'll need to add yourself to the *nginx* group, run `sudo usermod -a -G $USER name_of_the_nginx_group`
2. Check the configurations with `sudo nginx -t`
3. Restart **nginx** with `sudo systemctl restart nginx`


#### Creating the systemd service file
This helps if you want the API running and making it easy to manage. Check other tutorials if you're using something else other than **systemd**. Also, it's intended to be used with **nginx**.
1. Create a file at `/etc/systemd/system/notify-change.service`.
2. Edit the file with the following:
```
[Unit]
Description=uWSGI instance of Notify-Change
After=network.target

[Service]
User=your_user_goes_here
Group=name_of_the_nginx_group
WorkingDirectory=/absolute/path/to/api
ExecStart=/absolute/path/to/uwsgi/binary --ini wsgi.ini

[Install]
WantedBy=multi-user.target
```
3. You should be able to start it with `sudo systemctl start notify-change`.

#### Build the website
1. Go to the root directory
2. Configure `homepage` at `package.json` (the URL in which the website will be located)
3. Run `npm run build`
4. Copy the content of `build/` to the web server folder, usually its `/var/www/html`.
5. Try to access it going to localhost URL.

## Warning
### It's intended to be self-hosted.
Meaning that the API may not work if you run it on a VPS. That's because there's a high probability that the email server will block the logins attempts, returning a 403 response to the request.