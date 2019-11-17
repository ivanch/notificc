from app import app
import json

###
###     Websites registry tests
###

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

def test_get_websites_start():
    response = app.test_client().get(
        '/api/websites'
    )
    
    assert response.status_code == 200
    data = json.loads(response.get_data(as_text=True))
    assert data == []

def test_register_website_invalid_token():
    response = app.test_client().post(
        '/api/websites',
        data=json.dumps({
            'token': '0',
            'name': 'test name',
            'url': 'test url',
            'threshold': 50,
        }),
        content_type='application/json',
    )
    
    assert response.status_code == 401
    data = json.loads(response.get_data(as_text=True))
    assert data != []
    assert data['message'] == 'Unauthorized'

def test_register_website():
    global valid_token

    response = app.test_client().post(
        '/api/websites',
        data=json.dumps({
            'token': valid_token,
            'name': 'test name',
            'url': 'test url',
            'threshold': 50,
        }),
        content_type='application/json',
    )
    
    assert response.status_code == 200
    data = json.loads(response.get_data(as_text=True))
    assert data != []
    assert data['message'] == 'Success'

def test_register_existing_website():
    global valid_token

    response = app.test_client().post(
        '/api/websites',
        data=json.dumps({
            'token': valid_token,
            'name': 'test name',
            'url': 'test url',
            'threshold': 50,
        }),
        content_type='application/json',
    )
    
    assert response.status_code == 400
    data = json.loads(response.get_data(as_text=True))
    assert data != []
    assert data['message'] == 'Exists'

def test_register_existing_website_2():
    global valid_token

    response = app.test_client().post(
        '/api/websites',
        data=json.dumps({
            'token': valid_token,
            'name': 'test name second',
            'url': 'test url',
            'threshold': 50,
        }),
        content_type='application/json',
    )
    
    assert response.status_code == 400
    data = json.loads(response.get_data(as_text=True))
    assert data != []
    assert data['message'] == 'Exists'

def test_get_websites_one_registered():
    response = app.test_client().get(
        '/api/websites'
    )
    
    assert response.status_code == 200
    data = json.loads(response.get_data(as_text=True))
    assert data != []
    print(data)
    assert len(data) == 1
    assert data[0]['id'] == 1
    assert data[0]['name'] == 'test name'
    assert data[0]['url'] == 'test url'
    assert data[0]['enabled'] is True

def test_register_second_website():
    global valid_token

    response = app.test_client().post(
        '/api/websites',
        data=json.dumps({
            'token': valid_token,
            'name': 'test name second',
            'url': 'test url second',
            'threshold': 100,
        }),
        content_type='application/json',
    )
    
    assert response.status_code == 200
    data = json.loads(response.get_data(as_text=True))
    assert data != []
    assert data['message'] == 'Success'

def test_get_websites_second_registered():
    response = app.test_client().get(
        '/api/websites'
    )
    
    assert response.status_code == 200
    data = json.loads(response.get_data(as_text=True))
    assert data != []
    print(data)
    assert len(data) == 2
    assert data[1]['id'] == 2
    assert data[1]['name'] == 'test name second'
    assert data[1]['url'] == 'test url second'
    assert data[1]['enabled'] is True

def test_update_second_website():
    global valid_token

    response = app.test_client().put(
        '/api/websites',
        data=json.dumps({
            'token': valid_token,
            'id': 2
        }),
        content_type='application/json',
    )
    
    assert response.status_code == 200
    data = json.loads(response.get_data(as_text=True))
    assert data != []
    assert data['message'] == 'Success'

def test_get_websites_second_updated():
    response = app.test_client().get(
        '/api/websites'
    )
    
    assert response.status_code == 200
    data = json.loads(response.get_data(as_text=True))
    assert data != []
    print(data)
    assert len(data) == 2
    assert data[1]['id'] == 2
    assert data[1]['name'] == 'test name second'
    assert data[1]['url'] == 'test url second'
    assert data[1]['enabled'] is False