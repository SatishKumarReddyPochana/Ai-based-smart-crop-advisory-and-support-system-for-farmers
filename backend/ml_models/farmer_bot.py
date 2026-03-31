import google.generativeai as genai
import json

# -----------------------------------------------------
# 1. Configure Gemini API
# -----------------------------------------------------
genai.configure(api_key="AIzaSyA-pp1E_vasIhFUCIlidycGkw242QQPa_M")

# Load Gemini Model
model = genai.GenerativeModel("gemini-flash-latest")

# -----------------------------------------------------
# 2. Chatbot Function
# -----------------------------------------------------
def get_chatbot_response(message):
    """
    This function sends user message to Gemini API
    and returns a JSON-safe response.
    """

    prompt = f"""
    You are AgriGenius AI Farmer Assistant.

    Respond ONLY in valid JSON format:
    {{
        "reply": "your response to farmer",
        "tips": ["optional tip 1", "optional tip 2"]
    }}

    Farmer question: {message}
    """

    try:
        # Ask Gemini model
        response = model.generate_content(prompt)

        # Extract text
        text = response.text.strip()

        # Remove markdown formatting if any
        text = text.replace("```json", "").replace("```", "").strip()

        # Convert to JSON
        try:
            data = json.loads(text)
        except:
            # Return fallback JSON
            return {
                "reply": "Sorry, I couldn't understand the response.",
                "tips": [],
                "raw_response": text
            }

        return {
            "reply": data.get("reply", "No reply generated."),
            "tips": data.get("tips", [])
        }

    except Exception as e:
        return {
            "reply": "Internal error from chatbot.",
            "error": str(e)
        }
