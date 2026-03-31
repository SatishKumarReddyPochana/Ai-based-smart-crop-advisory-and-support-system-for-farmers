

from models import (
    SessionLocal, CropRecommendation, DiseasePrediction, WeatherForecast,
    CropAdvisory, LandProfile, ProfitAnalysis, IrrigationData, ChatHistory,
    FertilizerRecommendation, GovtScheme, Notification
)
from datetime import datetime

db = SessionLocal()

# 1. Crop Recommendation
crop = CropRecommendation(
    nitrogen=90, phosphorus=40, potassium=50, temperature=26.5,
    humidity=75, ph=6.8, rainfall=150, recommended_crop="Rice"
)
db.add(crop)

# 2. Disease Prediction
disease = DiseasePrediction(
    crop="Tomato", image_path="uploads/tomato_leaf.jpg",
    predicted_disease="Leaf Spot", confidence=0.93
)
db.add(disease)

# 3. Weather Forecast
weather = WeatherForecast(
    location="Hyderabad", date="2025-07-26",
    temperature=33.0, humidity=70.5, wind_speed=10.2,
    forecast="Sunny with mild wind"
)
db.add(weather)

# Crop Advisory
advice = CropAdvisory(
    crop="Wheat", condition="High Temperature",
    advice="Increase irrigation frequency to reduce heat stress."
)
db.add(advice)

# 4. Land Profile
land = LandProfile(
    location="Guntur", soil_type="Alluvial",
    ph=6.5, organic_carbon=0.75, moisture=22.0
)
db.add(land)

# 5. Profit Analysis
profit = ProfitAnalysis(
    crop="Cotton", cost=18000, expected_yield=12.5,
    market_price=6000, profit_margin=57000
)
db.add(profit)

# 6. Irrigation Data
irrigation = IrrigationData(
    crop="Sugarcane", soil_moisture=18.0,
    irrigation_type="Drip", water_required=45.0
)
db.add(irrigation)

# 7. Chat History
chat = ChatHistory(
    user_query="How to protect rice from pests?",
    bot_response="Use neem-based organic pesticides every 7 days.",
    timestamp=datetime.now()
)
db.add(chat)

# 8. Fertilizer Recommendation
fertilizer = FertilizerRecommendation(
    crop="Maize", soil_type="Loamy", deficiency="Nitrogen",
    recommended_fertilizer="Urea"
)
db.add(fertilizer)

# 9. Govt Scheme
scheme = GovtScheme(
    scheme_name="PM Kisan Yojana", applicable_state="All India",
    crop="General", description="₹6,000 annual support for small farmers.",
    link="https://pmkisan.gov.in"
)
db.add(scheme)

# 10. Notification
notification = Notification(
    message="Next watering for wheat crop due tomorrow.",
    timestamp=datetime.now(), target_crop="Wheat"
)
db.add(notification)

# Commit all
db.commit()
db.close()
print("✅ Sample data inserted successfully.")
