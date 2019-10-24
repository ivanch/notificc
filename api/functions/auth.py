from flask import Blueprint
from flask import request, jsonify
import sqlite3
import string
import random

auth = Blueprint('auth', __name__)

def register_token(token):
    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO tokens (token) VALUES (?);", (token,))
        conn.commit()

def is_token_authorized(token):
    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM config;")
        result = cursor.fetchone()

        if(result[1] == '0'):
            return True
        
        cursor.execute("SELECT * FROM tokens WHERE token = ?;", (token,))
        result = cursor.fetchone()

        if result is None:
            return False
        return True

# Checks if a token is authorized
@auth.route('/api/auth/token', methods=['POST'])
def token_auth():
    json = request.get_json()

    result = is_token_authorized(json['token'])

    if result:
        return jsonify(message="Authorized",
                    statusCode=200), 200
    else:
        return jsonify(message="Unauthorized",
                statusCode=200), 200

# Deletes a token from db
@auth.route('/api/auth/token', methods=['DELETE'])
def token_delete():
    json = request.get_json()

    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM tokens WHERE token = ?;", (json['token'],))
        conn.commit()

    return jsonify(message="Success",
                statusCode=200), 200

# Checks if password is correct
@auth.route('/api/auth/password', methods=['POST'])
def password_auth():
    json = request.get_json()

    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM config;")
        result = cursor.fetchone()

        if(result[1] == json['auth_pass']):
            letters = string.ascii_lowercase
            token = ''.join(random.choice(letters) for i in range(10))

            register_token(token)
            return jsonify(message="Authorized",
                            token=token,
                            statusCode=200), 200
                            
        return jsonify(message="Unauthorized",
                        statusCode=200), 200

# Updates the Auth Password
@auth.route('/api/auth/password', methods=['PUT'])
def password_update():
    json = request.get_json()

    if not is_token_authorized(json['token']):
        return jsonify(message="Unauthorized",
                        statusCode=401), 401

    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE config SET auth_pass = ? WHERE id = 0;",
                        (json['auth_pass'],))
        conn.commit()

        return jsonify(message="Success",
                        statusCode=200), 200
