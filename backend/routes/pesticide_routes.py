from flask import Blueprint, request, jsonify
import pickle

pesticide_bp = Blueprint('pesticide_bp', __name__)

# Load model and encoders
with open('ml_models/pesticide_model.pkl', 'rb') as f:
    saved_objects = pickle.load(f)

model = saved_objects['model']
le_crop = saved_objects['le_crop']
le_pest = saved_objects['le_pest']
le_symptom = saved_objects['le_symptom']
le_pesticide = saved_objects['le_pesticide']


@pesticide_bp.route('/predict', methods=['POST'])
def predict_pesticide():
    data = request.json
    crop = data.get('crop', '').lower().strip()
    pest_type = data.get('pest_type', '').lower().strip()
    symptom = data.get('symptom', '').lower().strip()

    if not crop or not pest_type or not symptom:
        return jsonify({'error': 'crop, pest_type and symptom are required'}), 400

    try:
        crop_enc = le_crop.transform([crop])[0]
        pest_enc = le_pest.transform([pest_type])[0]
        symptom_enc = le_symptom.transform([symptom])[0]

        prediction = model.predict([[crop_enc, pest_enc, symptom_enc]])[0]
        pesticide_name = le_pesticide.inverse_transform([prediction])[0]

        return jsonify({'recommended_pesticide': pesticide_name})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@pesticide_bp.route('/options', methods=['GET'])
def get_valid_options():
    return jsonify({
        'valid_crops': sorted(list(le_crop.classes_)),
        'valid_pest_types': sorted(list(le_pest.classes_)),
        'valid_symptoms': sorted(list(le_symptom.classes_))
    })
