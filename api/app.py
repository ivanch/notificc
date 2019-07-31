#!/usr/bin/env python3

from flask import Flask
from flask import request, jsonify
from flask_cors import CORS
import checker
import threading
import sqlite3
import smtplib

from functions.auth import *
from functions.websites import *
from functions.config import *
from functions.email import *

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth)
app.register_blueprint(websites)
app.register_blueprint(config)
app.register_blueprint(email)

checker_thread = None
stop_checker = True


@app.route('/api/status', methods=['GET'])
def main():
    global stop_checker
    checker_status = 'error' # with error by default
    
    if(checker_thread is None): checker_status = 'error'
    elif(not checker_thread.is_alive()): checker_status = 'offline'
    elif(stop_checker): checker_status = 'stopped'
    else: checker_status = 'online'

    response = {'checker_status': checker_status}
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
                url TEXT NOT NULL,\
                threshold INTEGER NOT NULL,\
                enabled INTEGER NOT NULL);")

        cursor.execute("CREATE TABLE config (\
                id INTEGER PRIMARY KEY CHECK (id = 0),\
                auth_pass TEXT,\
                delay INTEGER);")

        cursor.execute("CREATE TABLE email (\
                id INTEGER PRIMARY KEY CHECK (id = 0),\
                user TEXT,\
                password TEXT,\
                SMTP_server TEXT,\
                SMTP_port INTEGER,\
                SMTP_ttls INTEGER);")
        
        cursor.execute("CREATE TABLE tokens (\
                token TEXT NOT NULL PRIMARY KEY);")
        
        cursor.execute("INSERT INTO config  (id, auth_pass , delay) \
                        VALUES              (0 , 'password', 120);")
        
        cursor.execute("INSERT INTO email   (id, user, password, SMTP_server , SMTP_port, SMTP_ttls) \
                        VALUES              (0 , 'example@example.com', 'password', 'SMTP.server.com', 80, 1);")
        conn.commit()
    else:
        # Reset all access tokens
        with sqlite3.connect('shared/data.db') as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM tokens;")
            conn.commit()

def setup_checker():
    global checker_thread, stop_checker
        
    checker_thread = threading.Thread(target=checker.run, args=(lambda : stop_checker,))
    checker_thread.daemon = True

    checker_thread.start()

if __name__ == "__main__":    
    app.run()