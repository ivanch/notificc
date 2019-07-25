#!/usr/bin/env python3

from flask import Flask
from flask import request, jsonify
from flask_cors import CORS
import checker
import threading
import sqlite3
import os
import glob
import smtplib
import string
import random

app = Flask(__name__)
CORS(app)
checker_thread = None
stop_checker = True

conn = None

def exists(url):
    with sqlite3.connect('data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM urls WHERE url = ?", (url,))

        if(len(cursor.fetchall()) > 0):
            return True
        return False

def register_token(token):
    with sqlite3.connect('data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO tokens (token) VALUES (?);", (token,))
        conn.commit()
  
@app.route('/api', methods=['GET'])
def main():
    global stop_checker
    checker_status = 'error' # with error by default
    if(checker_thread is None): checker_status = 'error'
    elif(not checker_thread.is_alive()): checker_status = 'offline'
    elif(stop_checker): checker_status = 'stopped'
    else: checker_status = 'online'
    response = {'checker_status': checker_status, 'urls': []}
    
    with sqlite3.connect('data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM urls")
        results = cursor.fetchall()

        for result in results:
            response['urls'].append({'id':result[0], 'url':result[1], 'enabled': True if result[4] == 1 else False})
    return jsonify(response), 200

@app.route('/api', methods=['POST'])
def register_url():
    json = request.get_json()
    url = json['url']
    threshold = json['threshold']

    if(not exists(url)):
        with sqlite3.connect('data.db') as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO urls (url , interval, threshold , enabled) \
                            VALUES           (?   , 120     , ?         , 1);", (url, threshold))
            conn.commit()

        return jsonify(isError=False,
                    message="Success",
                    statusCode=200), 200
    else:
        return jsonify(isError=True,
                    message="Exists",
                    statusCode=400), 400

@app.route('/api', methods=['DELETE'])
def delete_url():
    json = request.get_json()

    with sqlite3.connect('data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM urls WHERE id = ?", (json['id'],))
        conn.commit()

    for file in glob.iglob("screenshots/*-%d.png" % (int(json['id']))):
        os.remove(file)

    return jsonify(isError=False,
                message="Success",
                statusCode=200), 200

@app.route('/api/config', methods=['GET', 'PUT'])
def config():    
    if(request.method == 'GET'):
        with sqlite3.connect('data.db') as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM config;")
            result = cursor.fetchone()
            return jsonify( user=result[1],
                            SMTP_server=result[3],
                            SMTP_port=result[4],
                            SMTP_ttls=result[5]), 200
    elif(request.method == 'PUT'):
        json = request.get_json()
        with sqlite3.connect('data.db') as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE config SET user = ?, password = ?, SMTP_server = ?, SMTP_port = ?, SMTP_ttls = ? WHERE id = 0;",
                            (json['user'], json['password'], json['SMTP_server'], json['SMTP_port'], int(json['SMTP_ttls'])))
            conn.commit()
        return jsonify(isError=False,
                    message="Success",
                    statusCode=200), 200

@app.route('/api/turn_checker', methods=['POST'])
def turn_checker():
    global stop_checker
    if(request.method == 'POST'):
        stop_checker = False if stop_checker else True
        return jsonify(isError=False,
                    message="Success",
                    statusCode=200), 200

@app.route('/api/test', methods=['POST'])
def test_email():
    json = request.get_json()
    response_message = "Success"
    response_code = 200
    # Prepare the message
    message = """From: %s\r\nTo: %s\r\nSubject: %s\r\n\

    If you're seeing it from your email, everything is properly defined!

    Automatic Message.
    """ % (json['user'], json['user'], "Notify Change email test!")
    message = message.encode("ascii", errors="ignore")

    print(message)

    # Configure SMTP server
    try:
        server = smtplib.SMTP(json['SMTP_server'], json['SMTP_port'])
        if(json['SMTP_ttls'] == 1): server.starttls()
        server.ehlo()
        server.login(json['user'], json['password'])
        server.sendmail(json['user'], json['user'], message)
        server.close()
    except smtplib.SMTPAuthenticationError:
        response_message = "Authentication Error"
        response_code = 403
    except SMTPException:
        response_message = "Unable to send email"
        response_code = 400
    except:
        response_message = "Error (probably in the code)"
        response_code = 500

    return jsonify(message=response_message,
                statusCode=response_code), response_code

@app.route('/api/auth/token', methods=['POST'])
def token_is_valid():
    json = request.get_json()

    with sqlite3.connect('data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM tokens WHERE token = ?;", (json['token'],))
        result = cursor.fetchone()

        if(result == None):
            return jsonify(message="Unauthorized",
                    statusCode=200), 200
        else:
            return jsonify(message="Authorized",
                        statusCode=200), 200

@app.route('/api/auth/token', methods=['DELETE'])
def token_delete():
    json = request.get_json()

    with sqlite3.connect('data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM tokens WHERE token = ?;", (json['token'],))
        conn.commit()

    return jsonify(message="Success",
                statusCode=200), 200

@app.route('/api/auth/password', methods=['POST'])
def password_is_valid():
    json = request.get_json()

    with sqlite3.connect('data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM config;")
        result = cursor.fetchone()

        letters = string.ascii_lowercase
        token = ''.join(random.choice(letters) for i in range(10))

        register_token(token)

        if(result[6] == json['password']):
            return jsonify(message="Authorized",
                            token=token,
                            statusCode=200), 200
        else:
            return jsonify(message="Unauthorized",
                            statusCode=200), 200

def setup():
    global checker_thread

    # Setup databaset, if new
    if(not os.path.isfile("data.db")):
        conn = sqlite3.connect('data.db')
        cursor = conn.cursor()

        cursor.execute("CREATE TABLE urls (\
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,\
                url TEXT NOT NULL,\
                interval INTEGER NOT NULL,\
                threshold FLOAT NOT NULL,\
                enabled INTEGER NOT NULL);")

        cursor.execute("CREATE TABLE config (\
                id INTEGER PRIMARY KEY CHECK (id = 0),\
                user TEXT,\
                password TEXT,\
                SMTP_server TEXT,\
                SMTP_port INTEGER,\
                SMTP_ttls INTEGER,\
                auth_pass TEXT);")
        
        cursor.execute("CREATE TABLE tokens (\
                token TEXT NOT NULL PRIMARY KEY);")
        
        cursor.execute("INSERT INTO config  (id, user, password, SMTP_server , SMTP_port, SMTP_ttls, auth_pass) \
                        VALUES              (0 , 'example@example.com', 'password', 'SMTP.server.com', 80, 1, 'password');")
        conn.commit()
    else:
        # Reset all access tokens
        with sqlite3.connect('data.db') as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM tokens;")
            conn.commit()
    
    # Setup checker variables
    with sqlite3.connect('data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM config;")
        result = cursor.fetchone()
        
        checker_thread = threading.Thread(target=checker.run, args=(result[1], result[2], result[3], result[4], result[5], lambda : stop_checker))
        checker_thread.daemon = True

if __name__ == "__main__":
    setup()

    if(checker_thread is not None):
        checker_thread.start()
        pass
    app.run()
    
    conn.close()