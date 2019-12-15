#!/usr/bin/env python3

from flask import Flask
from flask import jsonify
from flask_cors import CORS
import threading

from src import checker
from src.database import setup_db
from src.functions.auth import auth
from src.functions.websites import websites
from src.functions.config import config, get_autostart
from src.functions.push import push

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth)
app.register_blueprint(websites)
app.register_blueprint(config)
app.register_blueprint(push)

checker_thread = None
stop_checker = True

@app.route('/api/status', methods=['GET'])
def main():
    global stop_checker
    checker_status = 'error' # with error by default
    
    if checker_thread is not None: # if the thread exists
        if not checker_thread.is_alive():
            checker_status = 'offline' # thread died
        elif stop_checker:
            checker_status = 'stopped' # thread stopped
        else:
            checker_status = 'online' # all good

    response = {'checker_status': checker_status}
    
    return jsonify(response), 200

@app.route('/api/checker', methods=['POST'])
def turn_checker():
    global stop_checker, checker_thread

    if not checker_thread.is_alive():
        setup_checker()
        stop_checker = False
    else:
        stop_checker = False if stop_checker else True

    return jsonify(message="Success"), 200

def setup_checker():
    global stop_checker, checker_thread

    stop_checker = not get_autostart()

    checker_thread = threading.Thread(target=checker.run, args=(lambda : stop_checker, ))
    checker_thread.daemon = True

    checker_thread.start()

if __name__ == 'app' or __name__ == '__main__':
    setup_db()
    setup_checker()

if __name__ == '__main__':
    app.run()