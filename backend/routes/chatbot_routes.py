from flask import Blueprint, request, jsonify
from ml_models.farmer_bot import get_chatbot_response

chatbot_bp = Blueprint("chatbot", __name__)

@chatbot_bp.route("/ask", methods=["POST"])
def ask_chatbot():
    try:
        data = request.json
        message = data.get("message")

        if not message:
            return jsonify({"error": "Message is required"}), 400

        result = get_chatbot_response(message)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500




