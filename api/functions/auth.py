from flask import Blueprint
from flask import request, jsonify
import sqlite3
import string
import random

auth = Blueprint('auth', __name__)

def register_token(token):
    with sqlite3.connect('data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO tokens (token) VALUES (?);", (token,))
        conn.commit()

@auth.route('/api/auth/token', methods=['POST'])
def token_auth():
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

@auth.route('/api/auth/token', methods=['DELETE'])
def token_delete():
    json = request.get_json()

    with sqlite3.connect('data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM tokens WHERE token = ?;", (json['token'],))
        conn.commit()

    return jsonify(message="Success",
                statusCode=200), 200

@auth.route('/api/auth/password', methods=['POST'])
def password_auth():
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