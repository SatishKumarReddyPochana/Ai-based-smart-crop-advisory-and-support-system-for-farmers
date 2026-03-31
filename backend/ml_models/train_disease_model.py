import google.generativeai as genai
import base64
import json

# ===============================
# 1. Configure Gemini API
# ===============================
genai.configure(api_key="Enter the key")

model = genai.GenerativeModel("gemini-flash-latest")


# ===============================
# 2. Convert uploaded image to base64
# ===============================
def encode_image(image_file):
    return base64.b64encode(image_file.read()).decode("utf-8")


# ===============================
# 3. Generate prediction using Gemini Vision
# ===============================
def detect_disease(image_file, crop_name=None):

    image_base64 = encode_image(image_file)

    prompt = f"""
    You are an expert agricultural disease diagnosis system.
    Analyze the crop leaf image and respond ONLY in valid JSON with this structure:

    {{
        "crop": "name of crop",
        "disease": "detected disease name",
        "confidence": number (0 to 1),
        "description": "short description",
        "symptoms": ["list of symptoms"],
        "causes": ["list of causes"],
        "treatment": ["step-by-step treatment"],
        "prevention": ["preventive measures"],
        "recommendation": "one short actionable advice"
    }}

    Extra details:
    Crop provided by user: {crop_name if crop_name else "Not provided"}  
    If crop is not provided, predict the crop yourself.
    If no disease is present, respond with disease = "Healthy Leaf".
    """

    try:
        response = model.generate_content(
            [
                {"mime_type": "image/jpeg", "data": image_base64},
                prompt
            ]
        )

        text = response.text.strip()
        text = text.replace("```json", "").replace("```", "").strip()

        data = json.loads(text)

        return data

    except Exception as e:
        return {
            "crop": crop_name or "unknown",
            "disease": "Error",
            "confidence": 0,
            "description": "Could not process image",
            "symptoms": [],
            "causes": [],
            "treatment": [],
            "prevention": [],
            "recommendation": str(e)
        }

