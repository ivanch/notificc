#!/usr/bin/env python3

from flask import Flask
from flask import jsonify
from flask_cors import CORS
import checker
import threading
import sqlite3

from functions.auth import *
from functions.websites import *
from functions.config import *

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth)
app.register_blueprint(websites)
app.register_blueprint(config)

checker_thread = None
stop_checker = True
changed_websites = []

@app.route('/api/status', methods=['GET'])
def main():
    global stop_checker, changed_websites
    checker_status = 'error' # with error by default
    
    if not checker_thread is None: # if it exists
        if not checker_thread.is_alive():
            checker_status = 'offline' # thread died
        elif stop_checker:
            checker_status = 'stopped' # thread stopped
        else:
            checker_status = 'online' # all online

    response = {'checker_status': checker_status}
    if len(changed_websites) > 0:
        response['changed_websites'] = changed_websites
        changed_websites = []
    
    return jsonify(response), 200

@app.route('/api/checker', methods=['POST'])
def turn_checker():
    global stop_checker, checker_thread

    if(not checker_thread.is_alive()):
        setup_checker()
        stop_checker = False
    else:
        stop_checker = False if stop_checker else True
    return jsonify(message="Success",
                statusCode=200), 200

@app.before_first_request
def setup():
    setup_db()
    setup_checker()

def setup_db():
    # Setup databaset, if new
    if(not os.path.isfile("shared/data.db")):
        conn = sqlite3.connect('shared/data.db')
        cursor = conn.cursor()

        cursor.execute("CREATE TABLE urls (\
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,\
                name TEXT NOT NULL, \
                url TEXT NOT NULL, \
                threshold INTEGER NOT NULL, \
                enabled INTEGER NOT NULL);")

        cursor.execute("CREATE TABLE config (\
                id INTEGER PRIMARY KEY CHECK (id = 0),\
                auth_pass TEXT, \
                delay INTEGER);")

        cursor.execute("CREATE TABLE logs ( \
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \
                name TEXT NOT NULL, \
                url TEXT NOT NULL, \
                title TEXT NOT NULL, \
                read INTEGER NOT NULL, \
                time timestamp);")
        
        cursor.execute("CREATE TABLE tokens (\
                token TEXT NOT NULL PRIMARY KEY);")
        
        cursor.execute("INSERT INTO config  (id, auth_pass , delay) \
                        VALUES              (0 , 'password', 120);")
        
        conn.commit()
    else:
        # Reset all access tokens
        with sqlite3.connect('shared/data.db') as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM tokens;")
            conn.commit()

def setup_checker():
    global checker_thread, stop_checker, changed_websites

    checker_thread = threading.Thread(target=checker.run, args=(lambda : stop_checker, changed_websites))
    checker_thread.daemon = True

    checker_thread.start()

if __name__ == "__main__":
    app.run()
