import pytest
from app import app
import json

'''
###
###     Multiple fields tests
###
'''

valid_token = None

def test_wrong_password():
    response = app.test_client().post(
        '/api/auth/password',
        data=json.dumps({
            'auth_pass': 'a_wrong_password'
        }),
        content_type='application/json',
    )
    
    assert response.status_code == 401
    data = json.loads(response.get_data(as_text=True))
    assert data != []
    assert data['message'] == 'Unauthorized'

def test_right_password():
    global valid_token

    response = app.test_client().post(
        '/api/auth/password',
        data=json.dumps({
            'auth_pass': 'password'
        }),
        content_type='application/json',
    )
    
    assert response.status_code == 200
    data = json.loads(response.get_data(as_text=True))
    assert data != []
    assert data['message'] == 'Authorized'
    assert data['token'] is not None

    valid_token = data['token']

def test_invalid_token():
    response = app.test_client().post(
        '/api/auth/token',
        data=json.dumps({
            'token': '0000'
        }),
        content_type='application/json',
    )
    
    assert response.status_code == 401
    data = json.loads(response.get_data(as_text=True))
    assert data != []
    assert data['message'] == 'Unauthorized'

def test_valid_token():
    global valid_token
    
    response = app.test_client().post(
        '/api/auth/token',
        data=json.dumps({
            'token': valid_token
        }),
        content_type='application/json',
    )

    print(valid_token)
    
    assert response.status_code == 200
    data = json.loads(response.get_data(as_text=True))
    assert data != []
    assert data['message'] == 'Authorized'

def test_password_update_invalid_token():
    response = app.test_client().put(
        '/api/auth/password',
        data=json.dumps({
            'token': '0000',
            'auth_pass': 'password1'
        }),
        content_type='application/json',
    )
    
    assert response.status_code == 401
    data = json.loads(response.get_data(as_text=True))
    assert data != []
    assert data['message'] == 'Unauthorized'

def test_password_update_valid_token():
    global valid_token
    
    response = app.test_client().put(
        '/api/auth/password',
        data=json.dumps({
            'token': valid_token,
            'auth_pass': 'password1'
        }),
        content_type='application/json',
    )
    
    assert response.status_code == 200
    data = json.loads(response.get_data(as_text=True))
    assert data != []
    assert data['message'] == 'Success'

def test_password_updated():
    response = app.test_client().post(
        '/api/auth/password',
        data=json.dumps({
            'auth_pass': 'password1'
        }),
        content_type='application/json',
    )
    
    assert response.status_code == 200
    data = json.loads(response.get_data(as_text=True))
    assert data != []
    assert data['message'] == 'Authorized'
    assert data['token'] is not None

def test_delete_invalid_token():
    response = app.test_client().delete(
        '/api/auth/token?token=0000'
    )
    
    assert response.status_code == 200
    data = json.loads(response.get_data(as_text=True))
    assert data != []
    assert data['message'] == 'Success'

def test_delete_valid_token():
    global valid_token
    
    response = app.test_client().delete(
        '/api/auth/token?token=%s' % (valid_token)
    )
    
    assert response.status_code == 200
    data = json.loads(response.get_data(as_text=True))
    assert data != []
    assert data['message'] == 'Success'