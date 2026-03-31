

# routes/crop_routes.py

from flask import Blueprint, request, jsonify
from models import db, Crop

crop_bp = Blueprint('crop_bp', __name__)

@crop_bp.route('/add', methods=['POST'])
def add_crop():
    data = request.get_json()
    try:
        new_crop = Crop(
            crop_name=data['crop_name'],
            soil_type=data['soil_type'],
            season=data['season'],
            temperature_range=data['temperature_range'],
            rainfall_requirement=data['rainfall_requirement'],
            suitable_regions=data['suitable_regions']
        )
        db.session.add(new_crop)
        db.session.commit()
        return jsonify({'message': 'Crop added successfully!'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@crop_bp.route('/test', methods=['GET'])
def test_crop():
    return jsonify({'message': 'Crop API working!'})
