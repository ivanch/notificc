from app import app
import json

'''
###
###     Configuration tests
###
'''

valid_token = None

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

def test_get_delay():
    response = app.test_client().get(
        '/api/config'
    )
    
    assert response.status_code == 200
    data = json.loads(response.get_data(as_text=True))
    assert data != []
    assert data['delay'] >= 60

def test_update_delay():
    global valid_token

    response = app.test_client().put(
        '/api/config',
        data=json.dumps({
            'token': valid_token,
            'delay': 1000
        }),
        content_type='application/json',
    )
    
    assert response.status_code == 200
    data = json.loads(response.get_data(as_text=True))
    assert data != []
    assert data['message'] == 'Success'

def test_updated_delay():
    response = app.test_client().get(
        '/api/config'
    )
    
    assert response.status_code == 200
    data = json.loads(response.get_data(as_text=True))
    assert data != []
    assert data['delay'] == 1000