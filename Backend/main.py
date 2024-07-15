from flask import Flask, request, jsonify
import requests
from requests.auth import HTTPDigestAuth
from flask_cors import CORS
import datetime
import configparser
from encrypt import decrypt_data

app = Flask(__name__)
CORS(app)
config = configparser.ConfigParser()
config.read('config.ini')


@app.route('/login', methods=['POST'])
def login():
    decrypted_data = decrypt_data(request.json.get('data'))
    username = decrypted_data.get('username')
    password = decrypted_data.get('password')

    arkime_url = config['ARKIME']['API_URL'] + '/api/login'
    auth = HTTPDigestAuth(username, password)

    try:
        response = requests.post(arkime_url, auth=auth)
        if response.status_code == 200:
            return jsonify({"message": "Authorized"}), 200
        else:
            return jsonify({"message": "Unauthorized"}), 401
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@app.route('/barChart', methods=['POST'])
def bar_chart():
    decrypted_data = decrypt_data(request.json.get('data'))

    username = decrypted_data.get('username')
    password = decrypted_data.get('password')

    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400

    # Получение переданных дат
    start_date_str = request.json.get('startDate')
    stop_date_str = request.json.get('stopDate')

    # Установка startTime и stopTime
    if start_date_str and stop_date_str:
        start_time = int(datetime.datetime.strptime(start_date_str, "%Y-%m-%dT%H:%M").timestamp())
        stop_time = int(datetime.datetime.strptime(stop_date_str, "%Y-%m-%dT%H:%M").timestamp())
    else:
        # Установка startTime как начало текущего дня и stopTime как конец текущего дня
        now = datetime.datetime.now()
        start_of_day = datetime.datetime(now.year, now.month, now.day)
        end_of_day = start_of_day + datetime.timedelta(days=1) - datetime.timedelta(seconds=1)

        start_time = int(start_of_day.timestamp())
        stop_time = int(end_of_day.timestamp())

    params = {
        'expression': 'suricata.signature == EXISTS!',
        'startTime': str(start_time),
        'stopTime': str(stop_time),
        'interval': "auto",
        'data': -1,
        'facets': 1,
    }

    arkime_url = config['ARKIME']['API_URL'] + '/api/sessions'
    auth = HTTPDigestAuth(username, password)

    try:
        response = requests.post(arkime_url, auth=auth, params=params)
        if response.status_code == 200:
            data = response.json()

            date = []
            count_attack = []
            for session in data['graph']['sessionsHisto']:
                date.append(str(datetime.datetime.fromtimestamp(session[0] // 1000)))
                count_attack.append(session[1])

            res = {
                'date': date,
                'count_attack': count_attack
            }
            return jsonify(res), 200
        else:
            return jsonify({"message": f"Error: {response.status_code} - {response.text}"}), response.status_code
    except Exception as e:
        return jsonify({"message": str(e)}), 500

if __name__ == '__main__':
    app.run(port=3005)
