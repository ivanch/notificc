from flask import Blueprint
from flask import request, jsonify
import sqlite3
import smtplib
import os
import glob

email = Blueprint('email', __name__)

@email.route('/api/email', methods=['GET'])
def email_get():
    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM email;")
        result = cursor.fetchone()
        return jsonify( user=result[1],
                        SMTP_server=result[3],
                        SMTP_port=result[4],
                        SMTP_ttls=result[5]), 200

@email.route('/api/email', methods=['PUT'])
def email_update():
    json = request.get_json()
    with sqlite3.connect('shared/data.db') as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE email SET user = ?, password = ?, SMTP_server = ?, SMTP_port = ?, SMTP_ttls = ? WHERE id = 0;",
                        (json['user'], json['password'], json['SMTP_server'], json['SMTP_port'], int(json['SMTP_ttls'])))
        conn.commit()
    return jsonify(message="Success",
                statusCode=200), 200

@email.route('/api/email/test', methods=['POST'])
def email_test():
    json = request.get_json()
    response_message = "Success"
    response_code = 200

    # Prepare the message
    message = """From: %s\r\nTo: %s\r\nSubject: %s\r\n\

    If you're seeing this from your email, everything is properly defined!

    Automatic Message.
    """ % (json['user'], json['user'], "Notify Change email test!")
    message = message.encode("ascii", errors="ignore")

    # Configure SMTP server
    try:
        server = smtplib.SMTP(json['SMTP_server'], json['SMTP_port'])
        if(json['SMTP_ttls'] == 1): server.starttls()
        server.ehlo()
        server.login(json['user'], json['password'])
        server.sendmail(json['user'], json['user'], message)
        server.close()
    except smtplib.SMTPAuthenticationError:
        response_message = "Authentication Error"
        response_code = 403
    except SMTPException:
        response_message = "Unable to send email"
        response_code = 400
    except:
        response_message = "Error (probably in the code)"
        response_code = 500

    return jsonify(message=response_message,
                statusCode=response_code), response_code