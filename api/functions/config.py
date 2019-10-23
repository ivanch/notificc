from flask import Blueprint
from flask import request, jsonify
import sqlite3
import smtplib
import os
import glob

from .auth import is_token_authorized

config = Blueprint('config', __name__)

# Returns the delay
def get_delay():
    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM config;")
        result = cursor.fetchone()
        return result[2]

# Returns the config
@config.route('/api/config', methods=['GET'])
def config_get():
    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM config;")
        result = cursor.fetchone()
        return jsonify(delay=result[2]), 200

# Updates the delay
@config.route('/api/config', methods=['PUT'])
def config_update():
    json = request.get_json()

    if not is_token_authorized(json['token']):
        return jsonify(message="Unauthorized",
                        statusCode=401), 401

    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE config SET delay = ? WHERE id = 0;",
                        (json['delay'],))
        conn.commit()

        return jsonify(message="Success",
                        statusCode=200), 200