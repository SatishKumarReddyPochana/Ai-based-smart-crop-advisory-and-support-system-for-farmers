from flask import Blueprint, request, jsonify
from ml_models.train_market_price_model import get_market_price

market_price_bp = Blueprint("market_price", __name__)

@market_price_bp.route("/predict", methods=["POST"])
def predict_market_price():
    try:
        data = request.json

        crop = data["crop"]
        market = data["market"]
        quantity = float(data["quantity_kg"])

        result = get_market_price(crop, market, quantity)

        return jsonify({
            "status": "success",
            "price_per_kg": result["price_per_kg"],
            "total_price": result["total_price"],
            "trend": result["trend"],
            "comment": result["comment"]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@market_price_bp.route("/test", methods=["GET"])
def test():
    return jsonify({"status": "Market Price Route Working!"})
