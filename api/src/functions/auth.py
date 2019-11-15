from flask import Blueprint
from flask import request, jsonify
import sqlite3
import string
import random

auth = Blueprint('auth', __name__)

# Registers a token on database
def register_token(token):
    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO tokens (token) VALUES (?);", (token,))
        conn.commit()

# Returns True if the token is authorized
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

# POST /api/auth/token
# Checks if a token is authorized
# Body:
#   token => token to be checked
@auth.route('/api/auth/token', methods=['POST'])
def token_auth():
    json = request.get_json()

    result = is_token_authorized(json['token'])

    if result:
        return jsonify(message="Authorized",
                    statusCode=200), 200
    else:
        return jsonify(message="Unauthorized",
                statusCode=401), 401

# DELETE /api/auth/token?token=<token_string>
# Deletes a token from database
# Uses URL parameters
@auth.route('/api/auth/token', methods=['DELETE'])
def token_delete():
    token = request.args.get('token')

    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM tokens WHERE token = ?;", (token,))
        conn.commit()

    return jsonify(message="Success",
                statusCode=200), 200

# GET /api/auth/password/disabled
# Checks if the password is disabled
# Body:
#   token => token to be checked
@auth.route('/api/auth/password/disabled', methods=['GET'])
def is_password_disabled():
    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM config;")
        result = cursor.fetchone()

        if(result[1] == '0'):
            return jsonify(message="Authorized",
                    statusCode=200), 200
        else:
            return jsonify(message="Unauthorized",
                statusCode=401), 401

# POST /api/auth/password
# Checks if the auth password is right
# Body:
#   auth_pass => password string
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
                        statusCode=401), 401

# PUT /api/auth/password
# Updates the auth password
# Body:
#   token => user token
#   auth_pass => new password string
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
