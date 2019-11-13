from flask import Blueprint
from flask import request, jsonify
import sqlite3
import os
import glob

from src.functions.auth import is_token_authorized

websites = Blueprint('websites', __name__)

# Checks if a URL exists in the database
def exists(url):
    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM urls WHERE url = ?", (url,))

        if(len(cursor.fetchall()) > 0):
            return True
        return False

# GET /api/websites
# Returns the registered websites
# Response:
#   {
#       id => website id in database
#       name => registered name
#       url => website url
#       enabled => true if website is enabled, false if it's not
#   }, {...}
@websites.route('/api/websites', methods=['GET'])
def websites_get():
    response = []
    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM urls")
        results = cursor.fetchall()

        for result in results:
            response.append({'id':result[0], 'name': result[1], 'url':result[2], 'enabled': True if result[4] == 1 else False})
    return jsonify(response), 200

# POST /api/websites
# Registers a website
# Body:
#   token => user token
#   name => website name
#   url => website url
#   threshold => change threshold to trigger a notification
# Response:
#   message => "Unauthorized", "Success" or "Exists"
#   statusCode => 401, 200 or 400
@websites.route('/api/websites', methods=['POST'])
def websites_register():
    json = request.get_json()

    if not is_token_authorized(json['token']):
        return jsonify(message="Unauthorized",
                        statusCode=401), 401
    
    name = json['name']
    url = json['url']
    threshold = json['threshold']

    if not exists(url):
        with sqlite3.connect('shared/data.db') as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO urls (name, url , threshold , enabled) \
                            VALUES           (?   , ?   , ?         , 1);", (name, url, threshold))
            conn.commit()

        return jsonify(message="Success",
                    statusCode=200), 200
    
    return jsonify(message="Exists",
                statusCode=400), 400

# PUT /api/websites
# Sets the checks enabled status of the website
# Body:
#   token => user token
#   id => website id
# Response:
#   message => "Unauthorized", "Not found" or "Success"
#   statusCode => 401, 404, 200
@websites.route('/api/websites', methods=['PUT'])
def websites_update():
    json = request.get_json()
    
    if not is_token_authorized(json['token']):
        return jsonify(message="Unauthorized",
                        statusCode=401), 401
    
    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT enabled FROM urls WHERE id = ?", (json['id'], ))
        result = cursor.fetchone()
        
        if result is None:
            return jsonify(message="Not found",
                        statusCode=404), 404
        
        enabled = result[0]
        value = 1 if enabled == 0 else 0

        cursor.execute("UPDATE urls SET enabled = ? WHERE id = ?", (value, json['id']))
        conn.commit()

        if(value == 0):
            for file in glob.iglob("screenshots/*-%d.png" % (int(json['id']))):
                os.remove(file)

    return jsonify(message="Success",
                statusCode=200), 200

# DELETE /api/websites
# Deletes a website from the database
# Body:
#   token => user token
#   id => website id
# Response:
#   message => "Unauthorized" or "Success"
#   statusCode => 401, 200
@websites.route('/api/websites', methods=['DELETE'])
def websites_delete():
    json = request.get_json()

    if not is_token_authorized(json['token']):
        return jsonify(message="Unauthorized",
                        statusCode=401), 401

    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM urls WHERE id = ?", (json['id'],))
        conn.commit()

    for file in glob.iglob("screenshots/*-%d.png" % (int(json['id']))):
        os.remove(file)

    return jsonify(message="Success",
                statusCode=200), 200

# GET /api/websites/logs
# Returns the change logs from the database
# Response:
#   {
#       id => website id in database
#       name => registered name
#       url => website url
#       title => website title at the check moment
#       read => if the user has marked it as read
#       time => time that it was logged
#   }, {...}
@websites.route('/api/websites/logs', methods=['GET'])
def websitesLogs_get():
    response = []
    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM logs")
        results = cursor.fetchall()

        for result in results:
            response.append({'id': result[0], 'name': result[1], 'url': result[2], 'title': result[3], 'read': result[4], 'time': result[5]})
    
    return jsonify(response), 200

# PUT /api/websites/logs
# Sets the read status of a log
# Body:
#   token => user token
#   id => website id or "all" to update all
# Response:
#   message => "Unauthorized" or "Success"
#   statusCode => 401, 200
@websites.route('/api/websites/logs', methods=['PUT'])
def websitesLogs_update():
    json = request.get_json()

    if not is_token_authorized(json['token']):
        return jsonify(message="Unauthorized",
                        statusCode=401), 401
    
    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()

        if json['id'] == 'all':
            cursor.execute("UPDATE logs SET read = 1")
        else:
            cursor.execute("UPDATE logs SET read = ? WHERE id = ?", (json['read'], json['id']))

        conn.commit()

    return jsonify(message="Success",
                statusCode=200), 200

# DELETE /api/websites/logs
# Removes a log from the database
# Body:
#   token => user token
#   id => website id or "all" to delete all
# Response:
#   message => "Unauthorized" or "Success"
#   statusCode => 401, 200
@websites.route('/api/websites/logs', methods=['DELETE'])
def websitesLogs_delete():
    json = request.get_json()

    if not is_token_authorized(json['token']):
        return jsonify(message="Unauthorized",
                        statusCode=401), 401

    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()

        if json['id'] == 'all':
            cursor.execute("DELETE FROM logs")
        else:
            cursor.execute("DELETE FROM logs WHERE id = ?", (json['id'],))
        conn.commit()

    return jsonify(message="Success",
                statusCode=200), 200