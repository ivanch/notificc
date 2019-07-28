from flask import Blueprint
from flask import request, jsonify
import sqlite3
import os
import glob

websites = Blueprint('websites', __name__)

def exists(url):
    with sqlite3.connect('data/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM urls WHERE url = ?", (url,))

        if(len(cursor.fetchall()) > 0):
            return True
        return False

@websites.route('/api/websites', methods=['GET'])
def websites_get():
    response = []
    with sqlite3.connect('data/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM urls")
        results = cursor.fetchall()

        for result in results:
            response.append({'id':result[0], 'url':result[1], 'enabled': True if result[3] == 1 else False})
    return jsonify(response), 200

@websites.route('/api/websites', methods=['POST'])
def websites_register():
    json = request.get_json()
    url = json['url']
    threshold = json['threshold']

    if(not exists(url)):
        with sqlite3.connect('data/data.db') as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO urls (url , threshold , enabled) \
                            VALUES           (?   , ?         , 1);", (url, threshold))
            conn.commit()

        return jsonify(message="Success",
                    statusCode=200), 200
    else:
        return jsonify(message="Exists",
                    statusCode=400), 400

@websites.route('/api/websites', methods=['PUT'])
def websites_update():
    json = request.get_json()
    with sqlite3.connect('data/data.db') as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT enabled FROM urls WHERE id = ?", (json['id'], ))
        result = cursor.fetchone()
        enabled = result[0]
        value = 1 if enabled == 0 else 0

        cursor.execute("UPDATE urls SET enabled = ? WHERE id = ?", (value, json['id']))
        conn.commit()

        if(value == 0):
            for file in glob.iglob("screenshots/*-%d.png" % (int(json['id']))):
                os.remove(file)

    return jsonify(message="Success",
                statusCode=200), 200

@websites.route('/api/websites', methods=['DELETE'])
def websites_delete():
    json = request.get_json()

    with sqlite3.connect('data/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM urls WHERE id = ?", (json['id'],))
        conn.commit()

    for file in glob.iglob("screenshots/*-%d.png" % (int(json['id']))):
        os.remove(file)

    return jsonify(message="Success",
                statusCode=200), 200