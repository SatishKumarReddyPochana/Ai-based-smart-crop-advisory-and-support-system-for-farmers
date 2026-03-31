import google.generativeai as genai

genai.configure(api_key="AIzaSyA-pp1E_vasIhFUCIlidycGkw242QQPa_M")

# Use the correct model from your list
model = genai.GenerativeModel("gemini-flash-latest")

def get_market_price(crop, market, quantity_kg):
    prompt = f"""
    Respond ONLY in valid JSON:
    {{
        "price_per_kg": number,
        "trend": [7 numbers],
        "comment": "short explanation"
    }}

    Crop: {crop}
    Market: {market}
    """

    response = model.generate_content(prompt)
    text = response.text.strip()

    # Remove markdown code fences if present
    text = text.replace("```json", "").replace("```", "").strip()

    import json
    try:
        data = json.loads(text)
    except:
        return {
            "price_per_kg": 0,
            "total_price": 0,
            "trend": [],
            "comment": f"PARSE ERROR: {text}"
        }

    total_price = data["price_per_kg"] * quantity_kg

    return {
        "price_per_kg": data["price_per_kg"],
        "total_price": total_price,
        "trend": data["trend"],
        "comment": data["comment"]
    }
