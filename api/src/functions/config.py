from flask import Blueprint
from flask import request, jsonify
import sqlite3

from src.functions.auth import is_token_authorized

config = Blueprint('config', __name__)

# Returns the checks delay from database
def get_delay():
    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT delay FROM config;")
        result = cursor.fetchone()
        return result[0]

# Returns the autostart option
def get_autostart():
    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT autostart FROM config;")
        result = cursor.fetchone()
        return result[0]

# GET /api/config
# Returns the delay between checks
# Response:
#   delay => current delay in seconds
#   autostart => checker thread autostart
@config.route('/api/config', methods=['GET'])
def config_get():
    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM config;")
        result = cursor.fetchone()
        return jsonify(autostart=result[2],
                       delay=result[3]), 200

# PUT /api/config
# Updates config
# Body:
#   token => user token
#   delay => new delay between checks
#   autostart => checker thread autostart
@config.route('/api/config', methods=['PUT'])
def config_update():
    json = request.get_json()

    if not is_token_authorized(json['token']):
        return jsonify(message="Unauthorized",
                        statusCode=401), 401

    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE config SET delay = ?, autostart = ? WHERE id = 0;",
                        (json['delay'], json['autostart']))
        conn.commit()

        return jsonify(message="Success",
                        statusCode=200), 200