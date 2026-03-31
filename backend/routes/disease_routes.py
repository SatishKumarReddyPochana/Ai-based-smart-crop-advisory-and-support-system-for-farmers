from flask import Blueprint, request, jsonify
from ml_models.train_disease_model import detect_disease

disease_bp = Blueprint("disease", __name__)

@disease_bp.route("/predict", methods=["POST"])
def predict_disease():
    try:
        # Check image
        if "image" not in request.files:
            return jsonify({"error": "Image file missing!"}), 400

        image_file = request.files["image"]
        crop_name = request.form.get("crop", None)

        # Call API-based disease detector
        result = detect_disease(image_file, crop_name)

        return jsonify({
            "status": "success",
            "data": result
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
