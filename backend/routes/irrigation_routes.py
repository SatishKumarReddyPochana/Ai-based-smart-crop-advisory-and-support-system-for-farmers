

# backend/routes/irrigation_routes.py

from flask import Blueprint, request, jsonify, current_app
import requests
from utils.irrigation_logic import calculate_irrigation_details

irrigation_bp = Blueprint("irrigation_bp", __name__)

# Dropdown options for frontend (expanded)

SEASON_CROPS = {
    "kharif": [
        "rice", "maize", "sorghum", "millet", "cotton", "groundnut",
        "soybean", "sunflower", "jute", "turmeric", "ginger",
        "tomato", "brinjal", "okra", "chilli",
        "banana", "mango", "papaya", "grapes",

        # Additional Kharif Crops
        "bajra", "ragi", "foxtail millet", "kodo millet",
        "blackgram", "greengram", "arhar", "horsegram",
        "sesame", "castor", "tobacco",
        "cluster beans", "ridge gourd", "bitter gourd",
        "watermelon", "muskmelon", "cucumber",
        "sweet potato", "yam", "colocasia"
    ],

    "rabi": [
        "wheat", "barley", "mustard", "chickpea", "lentil", "potato",
        "onion", "cabbage", "cauliflower", "pomegranate", "blackgram","greengram",

        # Additional Rabi Crops
        "oats", "linseed", "peas", "garlic",
        "carrot", "radish", "beetroot", "spinach",
        "fenugreek", "knol khol", "turnip",
        "tomato (winter)", "capsicum", "broccoli",
        "strawberry", "apple", "pear"
    ],

    "zaid": [
        # Zaid (Summer) Crops
        "watermelon", "muskmelon", "cucumber", "pumpkin", "bottle gourd",
        "ridge gourd", "bitter gourd", "ash gourd",
        "groundnut (summer)", "moong (summer)", "urad (summer)",
        "cowpea", "sesame (summer)",
        "sunflower", "fodder maize", "fodder sorghum",
        "amaranthus", "cluster beans",
        "sweet corn", "tinda", "okra (summer)", "brinjal (summer)"
    ]
}


# ---------------------- GET OPTIONS ----------------------
@irrigation_bp.route("/options", methods=["GET"])
def irrigation_options():
    """Returns seasons and season-wise crop list."""
    return jsonify({
        "seasons": list(SEASON_CROPS.keys()),
        "season_crops": SEASON_CROPS
    })


# ---------------------- INTERNAL WEATHER FETCH ----------------------
def _fetch_weather_from_local_service(location: str):
    """
    Fetch weather from your existing Weather module.
    """
    try:
        if not location:
            return None

        url = f"http://127.0.0.1:5000/api/weather/current?location={location}"
        response = requests.get(url, timeout=4)

        if response.status_code == 200:
            data = response.json()
            return {
                "temperature": data.get("temperature") or data.get("temp"),
                "humidity": data.get("humidity"),
                "wind": data.get("wind_speed") or 1.5
            }
    except Exception:
        return None

    return None


# ---------------------- POST: IRRIGATION SCHEDULE ----------------------
@irrigation_bp.route("/schedule", methods=["POST"])
def irrigation_schedule():
    """
    Calculate irrigation for given crop, season, weather, rainfall, etc.
    """
    payload = request.json or {}

    season = payload.get("season")
    crop = payload.get("crop")
    soil_moisture = payload.get("soil_moisture")
    rainfall = payload.get("recent_rainfall") or payload.get("rainfall")
    acres = payload.get("acres")
    location = payload.get("location")  # optional
    weather_override = payload.get("weather")  # optional override dict

    # required check
    if not all([season, crop, soil_moisture is not None, rainfall is not None, acres is not None]):
        return jsonify({
            "error": "season, crop, soil_moisture, recent_rainfall and acres are required"
        }), 400

    # weather logic
    weather = None
    if weather_override:
        weather = {
            "temperature": weather_override.get("temperature", 28.0),
            "humidity": weather_override.get("humidity", 50.0),
            "wind": weather_override.get("wind", 1.5)
        }
    elif location:
        weather = _fetch_weather_from_local_service(location)

    # fallback
    if weather is None:
        weather = {"temperature": 28.0, "humidity": 50.0, "wind": 1.5}

    try:
        result = calculate_irrigation_details(
            season=season,
            crop=crop,
            soil_moisture_pct=float(soil_moisture),
            recent_rainfall_mm=float(rainfall),
            acres=float(acres),
            weather=weather
        )
        return jsonify({"status": "success", "data": result})

    except Exception as e:
        current_app.logger.error(f"Irrigation schedule error: {e}")
        return jsonify({"error": str(e)}), 500


# ---------------------- GET (TESTING PURPOSE) ----------------------
@irrigation_bp.route("/test", methods=["GET"])
def irrigation_test():
    """Quick GET testing endpoint."""
    sample = {
        "season": "kharif",
        "crop": "rice",
        "soil_moisture_pct": 35,
        "recent_rainfall_mm": 8,
        "acres": 1,
        "weather": {"temperature": 30, "humidity": 60, "wind": 1.2}
    }
    result = calculate_irrigation_details(
        season=sample["season"],
        crop=sample["crop"],
        soil_moisture_pct=sample["soil_moisture_pct"],
        recent_rainfall_mm=sample["recent_rainfall_mm"],
        acres=sample["acres"],
        weather=sample["weather"]
    )
    return jsonify(result)
