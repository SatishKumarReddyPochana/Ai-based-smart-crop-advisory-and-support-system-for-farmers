import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.multioutput import MultiOutputRegressor
from sklearn.ensemble import RandomForestRegressor

# Sample data
data = pd.DataFrame([
    
    ['wheat', 'loamy', 25, 60, 10, 35, 'Rabi', 45, 500],
    ['rice', 'clay', 30, 80, 120, 50, 'Kharif', 60, 800],
    ['cotton', 'sandy', 33, 40, 5, 20, 'Summer', 30, 300],
    ['maize', 'loamy', 28, 55, 25, 38, 'Kharif', 40, 450],
    ['sugarcane', 'clay', 32, 75, 90, 55, 'Spring', 65, 900],
    ['millet', 'sandy', 35, 35, 2, 18, 'Summer', 25, 250],
    ['barley', 'loamy', 20, 65, 12, 40, 'Rabi', 50, 550],
    ['soybean', 'clay', 29, 70, 60, 45, 'Kharif', 55, 700],
    ['sorghum', 'sandy', 34, 30, 3, 15, 'Summer', 20, 200],
    ['groundnut', 'loamy', 27, 50, 15, 32, 'Rabi', 35, 400],
    ['rice', 'clay', 30, 80, 300, 50, 'Kharif', 60, 800],
    ['maize', 'loamy', 28, 55, 250, 38, 'Kharif', 40, 450],
    ['sorghum', 'sandy', 33, 40, 180, 20, 'Kharif', 30, 300],
    ['millet', 'sandy', 34, 35, 150, 18, 'Kharif', 25, 250],
    ['cotton', 'sandy', 32, 42, 200, 22, 'Kharif', 30, 350],
    ['groundnut', 'loamy', 27, 50, 180, 32, 'Kharif', 35, 400],
    ['soybean', 'clay', 29, 70, 260, 45, 'Kharif', 55, 700],
    ['sunflower', 'loamy', 30, 65, 200, 28, 'Kharif', 40, 450],
    ['jute', 'clay', 29, 75, 350, 48, 'Kharif', 60, 820],
    ['turmeric', 'clay', 27, 82, 320, 50, 'Kharif', 55, 750],
    ['ginger', 'clay', 26, 80, 300, 45, 'Kharif', 50, 700],
    ['tomato', 'loamy', 26, 70, 150, 40, 'Kharif', 35, 420],
    ['brinjal', 'loamy', 27, 72, 160, 42, 'Kharif', 38, 430],
    ['okra', 'sandy', 28, 68, 140, 30, 'Kharif', 30, 350],
    ['chilli', 'sandy', 29, 65, 130, 25, 'Kharif', 28, 300],
    ['banana', 'clay', 31, 77, 280, 52, 'Kharif', 60, 850],
    ['mango', 'loamy', 32, 68, 200, 40, 'Kharif', 45, 600],
    ['papaya', 'loamy', 31, 70, 220, 42, 'Kharif', 40, 580],
    ['grapes', 'loamy', 28, 72, 210, 38, 'Kharif', 35, 500],
    ['bajra', 'sandy', 34, 60, 180, 20, 'Kharif', 30, 300],
    ['ragi', 'loamy', 30, 62, 190, 28, 'Kharif', 32, 360],
    ['foxtail millet', 'sandy', 31, 64, 170, 22, 'Kharif', 28, 290],
    ['kodo millet', 'sandy', 30, 66, 160, 20, 'Kharif', 25, 260],
    ['blackgram', 'loamy', 29, 72, 210, 35, 'Kharif', 40, 480],
    ['greengram', 'loamy', 28, 70, 200, 33, 'Kharif', 38, 450],
    ['arhar', 'sandy', 30, 68, 190, 28, 'Kharif', 35, 420],
    ['horsegram', 'sandy', 29, 70, 180, 27, 'Kharif', 32, 400],
    ['sesame', 'sandy', 30, 65, 160, 24, 'Kharif', 28, 300],
    ['castor', 'sandy', 31, 62, 170, 26, 'Kharif', 30, 350],
    ['tobacco', 'loamy', 32, 70, 200, 30, 'Kharif', 40, 550],
    ['cluster beans', 'sandy', 29, 68, 150, 25, 'Kharif', 28, 300],
    ['ridge gourd', 'loamy', 28, 72, 140, 32, 'Kharif', 30, 360],
    ['bitter gourd', 'loamy', 29, 74, 150, 34, 'Kharif', 32, 380],
    ['watermelon', 'sandy', 32, 70, 200, 28, 'Kharif', 35, 500],
    ['muskmelon', 'sandy', 33, 69, 180, 26, 'Kharif', 30, 450],
    ['cucumber', 'loamy', 31, 72, 160, 30, 'Kharif', 32, 420],
    ['sweet potato', 'loamy', 27, 75, 210, 38, 'Kharif', 35, 470],
    ['yam', 'clay', 28, 72, 220, 42, 'Kharif', 40, 550],
    ['colocasia', 'clay', 29, 73, 230, 44, 'Kharif', 45, 600],
    ['wheat', 'loamy', 20, 60, 120, 35, 'Rabi', 50, 550],
    ['barley', 'loamy', 19, 62, 110, 32, 'Rabi', 45, 500],
    ['mustard', 'loamy', 18, 65, 100, 30, 'Rabi', 40, 480],
    ['chickpea', 'loamy', 17, 68, 120, 28, 'Rabi', 35, 450],
    ['lentil', 'loamy', 18, 70, 130, 30, 'Rabi', 38, 460],
    ['potato', 'loamy', 19, 68, 140, 35, 'Rabi', 40, 500],
    ['onion', 'clay', 20, 66, 130, 33, 'Rabi', 38, 480],
    ['cabbage', 'loamy', 18, 68, 140, 36, 'Rabi', 35, 450],
    ['cauliflower', 'loamy', 17, 70, 150, 38, 'Rabi', 40, 470],
    ['pomegranate', 'sandy', 16, 75, 160, 30, 'Rabi', 35, 420],
    ['blackgram', 'loamy', 18, 72, 130, 30, 'Rabi', 38, 450],
    ['greengram', 'loamy', 19, 70, 135, 32, 'Rabi', 40, 460],
    ['oats', 'loamy', 18, 63, 120, 33, 'Rabi', 42, 480],
    ['linseed', 'loamy', 17, 64, 110, 30, 'Rabi', 40, 450],
    ['peas', 'loamy', 19, 66, 140, 36, 'Rabi', 40, 500],
    ['garlic', 'loamy', 18, 70, 130, 35, 'Rabi', 40, 480],
    ['carrot', 'loamy', 17, 69, 125, 32, 'Rabi', 35, 450],
    ['radish', 'loamy', 18, 68, 135, 34, 'Rabi', 38, 460],
    ['beetroot', 'loamy', 19, 72, 150, 36, 'Rabi', 40, 470],
    ['spinach', 'loamy', 18, 74, 160, 38, 'Rabi', 35, 430],
    ['fenugreek', 'loamy', 18, 70, 130, 33, 'Rabi', 35, 440],
    ['knol khol', 'loamy', 17, 72, 140, 34, 'Rabi', 38, 460],
    ['turnip', 'loamy', 18, 70, 125, 33, 'Rabi', 35, 430],
    ['tomato (winter)', 'loamy', 17, 68, 140, 36, 'Rabi', 40, 480],
    ['capsicum', 'loamy', 18, 67, 135, 35, 'Rabi', 38, 470],
    ['broccoli', 'loamy', 17, 69, 130, 34, 'Rabi', 38, 460],
    ['strawberry', 'loamy', 16, 70, 150, 40, 'Rabi', 45, 500],
    ['apple', 'clay', 15, 68, 140, 38, 'Rabi', 50, 600],
    ['pear', 'clay', 14, 70, 130, 36, 'Rabi', 48, 580],
    ['watermelon', 'sandy', 36, 63, 120, 20, 'Zaid', 25, 300],
    ['muskmelon', 'sandy', 35, 64, 130, 22, 'Zaid', 28, 320],
    ['cucumber', 'loamy', 34, 65, 140, 25, 'Zaid', 30, 350],
    ['pumpkin', 'loamy', 35, 68, 160, 28, 'Zaid', 32, 400],
    ['bottle gourd', 'loamy', 34, 69, 170, 30, 'Zaid', 35, 420],
    ['ridge gourd', 'loamy', 36, 67, 160, 26, 'Zaid', 30, 380],
    ['bitter gourd', 'loamy', 36, 70, 165, 28, 'Zaid', 32, 390],
    ['ash gourd', 'loamy', 37, 64, 180, 30, 'Zaid', 35, 450],
    ['groundnut (summer)', 'loamy', 34, 62, 150, 25, 'Zaid', 30, 350],
    ['moong (summer)', 'loamy', 35, 63, 140, 23, 'Zaid', 28, 330],
    ['urad (summer)', 'loamy', 36, 64, 130, 22, 'Zaid', 28, 320],
    ['cowpea', 'sandy', 35, 66, 135, 24, 'Zaid', 30, 350],
    ['sesame (summer)', 'sandy', 34, 63, 120, 22, 'Zaid', 25, 300],
    ['sunflower', 'loamy', 36, 65, 150, 26, 'Zaid', 32, 380],
    ['fodder maize', 'loamy', 35, 62, 140, 24, 'Zaid', 30, 360],
    ['fodder sorghum', 'loamy', 36, 61, 150, 25, 'Zaid', 35, 400],
    ['amaranthus', 'loamy', 36, 63, 130, 23, 'Zaid', 28, 330],
    ['cluster beans', 'sandy', 35, 65, 140, 25, 'Zaid', 30, 350],
    ['sweet corn', 'loamy', 36, 64, 160, 28, 'Zaid', 35, 420],
    ['tinda', 'loamy', 34, 68, 150, 30, 'Zaid', 32, 400],
    ['okra (summer)', 'sandy', 35, 67, 140, 26, 'Zaid', 28, 360],
    ['brinjal (summer)', 'loamy', 36, 66, 145, 27, 'Zaid', 30, 380],

], columns=[
    'crop_type', 'soil_type', 'temperature', 'humidity', 'rainfall',
    'soil_moisture', 'season', 'irrigation_duration', 'water_required'
])

# Features & Targets
X = data.drop(['irrigation_duration', 'water_required'], axis=1)
y = data[['irrigation_duration', 'water_required']]

# Categorical and numeric features
categorical_features = ['crop_type', 'soil_type', 'season']
numeric_features = ['temperature', 'humidity', 'rainfall', 'soil_moisture']

# Preprocessing
preprocessor = ColumnTransformer([
    ('cat', OneHotEncoder(), categorical_features),
    ('num', StandardScaler(), numeric_features)
])

# Model pipeline
pipeline = Pipeline([
    ('preprocessing', preprocessor),
    ('regressor', MultiOutputRegressor(RandomForestRegressor(n_estimators=100, random_state=42)))
])

# Split data (optional for now, or use all for training)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Fit model
pipeline.fit(X_train, y_train)

# Save model
with open('ml_models/irrigation_model.pkl', 'wb') as f:
    pickle.dump(pipeline, f)

print("✅ Model trained and saved as irrigation_model.pkl")
