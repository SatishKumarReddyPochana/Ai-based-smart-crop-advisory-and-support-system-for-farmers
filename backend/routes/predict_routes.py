from flask import Blueprint, request, jsonify
import joblib
import numpy as np
import os

predict_bp = Blueprint('predict', __name__)

# Load the trained model using joblib
model_path = os.path.join('ml_models', 'crop_model.pkl')
crop_model = joblib.load(model_path)

# ✅ Test GET Route
@predict_bp.route('/test', methods=['GET'])
def test_predict():
    return jsonify({"message": "Predict API working fine"}), 200

# ✅ Main Prediction Route
@predict_bp.route('/crop', methods=['POST'])
def predict_crop():
    data = request.get_json()

    try:
        # Extract features from input JSON
        features = [
            float(data['nitrogen']),
            float(data['phosphorus']),
            float(data['potassium']),
            float(data['temperature']),
            float(data['humidity']),
            float(data['ph']),
            float(data['rainfall'])
        ]

        # Make prediction
        prediction = crop_model.predict([features])[0]

        return jsonify({'recommended_crop': prediction}), 200

    except KeyError as e:
        return jsonify({'error': f'Missing parameter: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

