from flask import Blueprint, request, jsonify
import numpy as np
import pickle

yield_bp = Blueprint("yield", __name__)

# Load model + encoders
model = pickle.load(open("ml_models/yield_model.pkl", "rb"))
crop_encoder = pickle.load(open("ml_models/crop_encoder.pkl", "rb"))
soil_encoder = pickle.load(open("ml_models/soil_encoder.pkl", "rb"))

# --------------------------
# 🔹 POST: Predict Crop Yield
# --------------------------
@yield_bp.route("/predict", methods=["POST"])
def predict_yield():
    try:
        data = request.json

        # Encode categorical features
        crop = crop_encoder.transform([data["crop"]])[0]
        soil = soil_encoder.transform([data["soil_type"]])[0]

        # Convert numeric inputs to float
        try:
            temperature = float(data["temperature_c"])
            rainfall = float(data["rainfall_mm"])
            fertilizer = float(data["fertilizer_kg"])
            pesticide = float(data["pesticide_ml"])
            area = float(data["area_acres"])
        except ValueError:
            return jsonify({"error": "Numeric fields must be valid numbers"}), 400

        # Prepare features for prediction
        features = np.array([[crop, soil, temperature, rainfall, fertilizer, pesticide]])

        # Predict yield
        yield_per_acre = model.predict(features)[0]
        total_yield = yield_per_acre * area

        return jsonify({
            "status": "success",
            "yield_per_acre_quintals": round(yield_per_acre, 2),
            "total_yield_quintals": round(total_yield, 2)
        })

    except KeyError as e:
        return jsonify({"error": f"Missing field: {e}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --------------------------
# 🔹 GET: To Verify Route Works
# --------------------------
@yield_bp.route("/test", methods=["GET"])
def test_route():
    return jsonify({"status": "Crop Yield Route Working!"})










