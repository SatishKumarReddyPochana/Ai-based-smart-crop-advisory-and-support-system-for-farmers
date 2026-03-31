import pandas as pd
import pickle
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor

# Load dataset
df = pd.read_csv("datasets/crop_yield_data.csv")

# Encode categorical data
le_crop = LabelEncoder()
le_soil = LabelEncoder()

df["crop"] = le_crop.fit_transform(df["crop"])
df["soil_type"] = le_soil.fit_transform(df["soil_type"])

# Features
X = df.drop("yield_quintals", axis=1)
y = df["yield_quintals"]

# Split & train
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestRegressor(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# Save model + encoders
pickle.dump(model, open("ml_models/yield_model.pkl", "wb"))
pickle.dump(le_crop, open("ml_models/crop_encoder.pkl", "wb"))
pickle.dump(le_soil, open("ml_models/soil_encoder.pkl", "wb"))

print("Crop Yield Model Trained & Saved Successfully!")

