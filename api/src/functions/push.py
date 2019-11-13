from flask import Blueprint
from flask import request, jsonify
import os
import json
import time
from pywebpush import webpush, WebPushException

from src.functions.auth import is_token_authorized

push = Blueprint('push', __name__)

# Returns the Service Worker Subscription dict object
def get_subscription():
    with open('./keys/push.json', 'r') as file:
        line = file.readline()
        line = line.replace('\n','')
        return json.loads(line)

# Returns the base URL for a valid HTTP(S) URL
# Input: https://youtube.com/watch?v=someid
# Returns: https://youtube.com
def get_base_url(url):
    url = url.split('/')
    return '/'.join(url[:3])

# Sends a push notification to the registered Service Worker
def send_notification(name, uid):
    # the existence of this file means that the user has accepted the notifications
    if not os.path.exists("./keys/push.json"):
        return
    
    message_data = {
      'title': 'NotificC',
      'body': '%s has changed.' % (name),
      'id': uid,
    }
    subscription = get_subscription()
    
    try:
        webpush(
            subscription_info = {
                'endpoint': subscription['endpoint'],
                'keys': subscription['keys']
            },
            data = json.dumps(message_data),
            vapid_private_key = './keys/private_key.pem',
            vapid_claims = {"aud": get_base_url(subscription['endpoint']),
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
#   statusCode => 200
@push.route('/api/push', methods=['GET'])
def get_app_server_key():
    with open('./keys/key', 'r') as keyfile:
        key = keyfile.readline().replace('\n','')
        return jsonify(message="Success",
                        key=key,
                        statusCode=200), 200

# POST /api/push
# Updates/sets the push subscription information
# Body:
#   token => user token
#   subscription => Service Worker Subscription json just like its provided
# Response:
#   message => 'Success'
#   statusCode => 200
@push.route('/api/push', methods=['POST'])
def config_update2():
    body = request.get_json()

    if not is_token_authorized(body['token']):
        return jsonify(message="Unauthorized",
                        statusCode=401), 401

    with open('./keys/push.json', 'w') as file:
        file.write(json.dumps(body['subscription']))

        return jsonify(message="Success",
                        statusCode=200), 200