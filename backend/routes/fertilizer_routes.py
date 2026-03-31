from flask import Blueprint, request, jsonify
import pandas as pd
import os

fertilizer_bp = Blueprint('fertilizer', __name__)

# Load fertilizer dataset
fertilizer_df = pd.read_csv(os.path.join('datasets', 'fertilizer_data.csv'))

# ✅ GET Test Route
@fertilizer_bp.route('/test', methods=['GET'])
def test_fertilizer_api():
    return jsonify({"message": "Fertilizer Advisor API is working fine"}), 200

# POST Route to get fertilizer recommendation
@fertilizer_bp.route('/recommend', methods=['POST'])
def recommend_fertilizer():
    data = request.get_json()

    try:
        crop = data['crop'].lower()
        N = float(data['N'])
        P = float(data['P'])
        K = float(data['K'])

        crop_row = fertilizer_df[fertilizer_df['crop'].str.lower() == crop]

        if crop_row.empty:
            return jsonify({'error': 'Crop not found in dataset'}), 404

        ideal_n = crop_row.iloc[0]['ideal_n']
        ideal_p = crop_row.iloc[0]['ideal_p']
        ideal_k = crop_row.iloc[0]['ideal_k']

        result = []

        if N < ideal_n:
            result.append(f"Increase nitrogen using {crop_row.iloc[0]['n_fertilizer']}")
        elif N > ideal_n:
            result.append(f"Reduce nitrogen application")

        if P < ideal_p:
            result.append(f"Increase phosphorus using {crop_row.iloc[0]['p_fertilizer']}")
        elif P > ideal_p:
            result.append(f"Reduce phosphorus application")

        if K < ideal_k:
            result.append(f"Increase potassium using {crop_row.iloc[0]['k_fertilizer']}")
        elif K > ideal_k:
            result.append(f"Reduce potassium application")

        if not result:
            result.append("Your NPK levels are optimal for this crop.")

        return jsonify({'recommendation': result}), 200

    except KeyError as e:
        return jsonify({'error': f'Missing parameter: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
