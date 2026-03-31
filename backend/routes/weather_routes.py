# routes/weather_routes.py

from flask import Blueprint, request, jsonify
import requests

weather_bp = Blueprint('weather_bp', __name__)

API_KEY = "Enter the key"
BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

def generate_advice(temp, humidity, rainfall, wind_speed, cloud):
    advice = []

    if temp > 35:
        advice.append("Avoid irrigation during peak heat hours.")
    elif temp < 15:
        advice.append("Monitor for frost, especially during early mornings.")
    else:
        advice.append("Normal temperature. Proceed with regular farming operations.")

    if humidity > 80:
        advice.append("High humidity. Watch for fungal diseases.")
    elif humidity < 30:
        advice.append("Low humidity. Consider mulching to conserve moisture.")

    if rainfall > 10:
        advice.append("Rain expected. Avoid irrigation today.")
    else:
        advice.append("No significant rainfall. Irrigation may be needed.")

    if wind_speed > 20:
        advice.append("High wind speed. Secure plants and structures.")
    
    if cloud > 70:
        advice.append("Cloudy conditions. Consider adjusting irrigation based on sunlight.")

    return advice

@weather_bp.route('/test', methods=['GET'])
def get_weather_advice():
    city = request.args.get('city')
    if not city:
        return jsonify({'error': 'City parameter is required'}), 400
    return fetch_weather_data(city)


@weather_bp.route('/update', methods=['POST'])
def post_weather_advice():
    data = request.get_json()
    city = data.get('city')
    if not city:
        return jsonify({'error': 'City field is required in JSON body'}), 400
    return fetch_weather_data(city)


def fetch_weather_data(city):
    params = {
        'q': city,
        'appid': API_KEY,
        'units': 'metric'
    }

    try:
        response = requests.get(BASE_URL, params=params)
        data = response.json()

        if response.status_code != 200:
            return jsonify({'error': data.get('message', 'Failed to fetch weather data')}), response.status_code

        temp = data['main']['temp']
        humidity = data['main']['humidity']
        rainfall = data.get('rain', {}).get('1h', 0)
        wind_speed = data['wind']['speed']
        cloud = data['clouds']['all']

        advice = generate_advice(temp, humidity, rainfall, wind_speed, cloud)

        return jsonify({
            'temperature': temp,
            'humidity': humidity,
            'rainfall': rainfall,
            'wind_speed': wind_speed,
            'cloud_coverage': cloud,
            'farming_advice': advice
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
