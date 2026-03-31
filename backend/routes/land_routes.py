from flask import Blueprint, request, jsonify
from models import db, LandProfile

land_bp = Blueprint('land_bp', __name__)

# ✅ Test Route
@land_bp.route('/test', methods=['GET'])
def test_land():
    return jsonify({"message": "Land API working fine"}), 200


# ✅ Add Land Profile
@land_bp.route('/add', methods=['POST'])
def add_land():
    data = request.get_json()
    required_fields = ['user_id', 'soil_type', 'ph', 'rainfall', 'temperature', 'location']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400
    try:
        land = LandProfile(
            user_id=data['user_id'],
            soil_type=data['soil_type'],
            ph=data['ph'],
            rainfall=data['rainfall'],
            temperature=data['temperature'],
            location=data['location']
        )
        db.session.add(land)
        db.session.commit()
        return jsonify({
            "message": "Land profile added successfully",
            "land_id": land.id
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ✅ Get all land profiles for a user
@land_bp.route('/user/<int:user_id>', methods=['GET'])
def get_land_profiles(user_id):
    lands = LandProfile.query.filter_by(user_id=user_id).all()
    results = [
        {
            "id": land.id,
            "user_id": land.user_id,
            "soil_type": land.soil_type,
            "ph": land.ph,
            "rainfall": land.rainfall,
            "temperature": land.temperature,
            "location": land.location,
        }
        for land in lands
    ]
    return jsonify(results), 200


# ✅ Update a land profile
@land_bp.route('/update/<int:land_id>', methods=['PUT'])
def update_land(land_id):
    data = request.get_json()
    land = LandProfile.query.get(land_id)
    if not land:
        return jsonify({"error": "Land profile not found"}), 404

    try:
        land.soil_type = data.get("soil_type", land.soil_type)
        land.ph = data.get("ph", land.ph)
        land.rainfall = data.get("rainfall", land.rainfall)
        land.temperature = data.get("temperature", land.temperature)
        land.location = data.get("location", land.location)
        db.session.commit()
        return jsonify({"message": "Land profile updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ✅ Delete a land profile
@land_bp.route('/delete/<int:land_id>', methods=['DELETE'])
def delete_land(land_id):
    land = LandProfile.query.get(land_id)
    if not land:
        return jsonify({"error": "Land profile not found"}), 404
    try:
        db.session.delete(land)
        db.session.commit()
        return jsonify({"message": "Land profile deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



