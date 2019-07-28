from flask import Blueprint
from flask import request, jsonify
import sqlite3
import smtplib
import os
import glob

config = Blueprint('config', __name__)

# Returns the delay
@config.route('/api/config', methods=['GET'])
def config_get():
    with sqlite3.connect('data/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM config;")
        result = cursor.fetchone()
        return jsonify(delay=result[2]), 200

# Updates the delay
@config.route('/api/config', methods=['PUT'])
def config_update():
    json = request.get_json()

    with sqlite3.connect('data/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE config SET delay = ? WHERE id = 0;",
                        (json['delay'],))
        conn.commit()

        return jsonify(message="Success",
                        statusCode=200), 200