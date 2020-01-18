from flask import Blueprint
from flask import request, jsonify
import json
import time
import sqlite3
from pywebpush import webpush, WebPushException

from src.functions.auth import is_token_authorized

push = Blueprint('push', __name__)

# Checks if a push manager subscription exists on the database
# by checking its keys
def pms_exists(keys):
    with sqlite3.connect('shared/data.db') as conn:
        conn.row_factory = sqlite3.Row

        cursor = conn.cursor()
        cursor.execute("SELECT * FROM pms WHERE p256dh=? AND auth=? LIMIT 1", (keys['p256dh'], keys['auth']))
        results = cursor.fetchall()

        return len(results) > 0

# Registers the push subscription information
# Returns -1 if it already exists, 1 if success
def create_push_subscription(info):
    if pms_exists(info['keys']):
        return -1

    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO pms (endpoint, base_endpoint, p256dh, auth) \
                        VALUES          (?       , ?            , ?     , ?);",
                        (info['endpoint'], get_base_url(info['endpoint']),
                         info['keys']['p256dh'], info['keys']['auth']))
        conn.commit()
    
    return 1

# Returns the base URL for a valid HTTP(S) URL
# Input: https://youtube.com/watch?v=someid
# Returns: https://youtube.com
def get_base_url(url):
    url = url.split('/')
    return '/'.join(url[:3])

# Sends a push notification to the registered Service(s) Worker(s)
def send_notification(name, uid):
    message_data = {
      'title': 'NotificC',
      'body': '%s has changed.' % (name)
    }

    with sqlite3.connect('shared/data.db') as conn:
        conn.row_factory = sqlite3.Row

        cursor = conn.cursor()
        cursor.execute("SELECT * FROM pms")
        results = cursor.fetchall()

        for result in results:
            result = dict(result)

            try:
                webpush(
                    subscription_info = {
                        'endpoint': result['endpoint'],
                        'keys': {
                            'p256dh': result['p256dh'],
                            'auth': result['auth']
                        }
                    },
                    data = json.dumps(message_data),
                    vapid_private_key = './keys/private_key.pem',
                    vapid_claims = {"aud": result['base_endpoint'],
                        "exp": int(time.time()) + 86400,
                        "sub": "mailto:email@email.com" # dummy email
                    }
                )
            except WebPushException as exception:
                print(exception.message)


# GET /api/push
# Returns the application server key
# Response:
#   message => 'Success'
#   key => registered application server key

@push.route('/api/push', methods=['GET'])
def get_app_server_key():
    with open('./keys/key', 'r') as keyfile:
        key = keyfile.readline().replace('\n','')
        return jsonify(message="Success",
                        key=key), 200


# POST /api/push
# Creates a push subscription information
# Body:
#   token => user token
#   subscription => Service Worker Subscription json just like its provided
# Response:
#   message => 'Success'

@push.route('/api/push', methods=['POST'])
def config_update2():
    body = request.get_json()

    if not is_token_authorized(body['token']):
        return jsonify(message="Unauthorized"), 401

    status = create_push_subscription(body['subscription'])

    if status == -1:
        return jsonify(message="Exists"), 200

    return jsonify(message="Success"), 200