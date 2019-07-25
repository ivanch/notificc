# Notify-Change
#### Send an email from yourself to yourself when a website changes.

## Commands
### `npm start`
Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

## Running the API
There's an API made with Flask which uses Python to check the websites.
Simply go to the `api` folder and run `python api.py`.

## to-do:
* Improve design
* Ensure integers were put on inputs
* Handle high ping
* Handle no internet connection
* Make checker an Object Oriented Thread with Threading Module
* Handle errors on the checker thread
* Documentation

## Running
1. Clone this repo and go to its folder
2. Run `npm run build` to build the website
3. Go to the `api` folder, run `python -r requirements.txt`
4. Run `python api.py` to run the API server. Note that this is required to keep the server running.
5. Login with `password`.
6. Once in the index page, go to *Checker Settings* and set everything properly.
7. Add websites in the *Register a website* form.
8. Wait until something changes :^)

###### It's intended to be self-hosted.