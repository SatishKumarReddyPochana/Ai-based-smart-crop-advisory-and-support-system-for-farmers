import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load dataset
df = pd.read_csv('datasets/crop_recommendation.csv')

# Features and target
X = df.drop('label', axis=1)
y = df['label']

# Split into train and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Create and train the model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Save the model to a file
joblib.dump(model, 'ml_models/crop_model.pkl')

print("✅ Crop recommendation model trained and saved as 'crop_model.pkl'")
