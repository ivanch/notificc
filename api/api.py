from flask import Flask
from flask import request, jsonify
from flask_cors import CORS
import checker
import threading

app = Flask(__name__)
CORS(app)
checker_thread = None

def exists(url):
    with open("links","r") as file:
        lines = file.readlines()
        for link in lines:
            link = link.replace('\n','')
            if(link.startswith("#")): continue
            print(link, url)
            if(link == url): return True
    return False

def register(url):
    with open("links","a+") as file:
        file.write(url + '\n')

@app.route('/')
def index():
    return 'everything running good, trust me'
  
@app.route('/api', methods=['GET'])
def status():
    response = {'checker_status': checker_thread.is_alive(), 'urls': []}
    
    with open("links","r") as file:
        lines = file.readlines()
        for link in lines:
            if(link.startswith("#")): continue
            response['urls'].append({'url':link})
    return jsonify(response)

@app.route('/api', methods=['POST'])
def register_url():
    json = request.get_json()
    url = json['url']

    if(not exists(url)):
        register(url)
        return jsonify( isError=False,
                    message="Success",
                    statusCode=200), 200
    else:
        return jsonify( isError=True,
                    message="Exists",
                    statusCode=400), 400



if __name__ == "__main__":
    checker_thread = threading.Thread(target=checker.run, args=())
    checker_thread.start()
    app.run()