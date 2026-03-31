import pandas as pd
import pickle
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier

# Load dataset
df = pd.read_csv('datasets/pesticide_dataset.csv')

# Drop missing values
df.dropna(inplace=True)

# Normalize text columns
for col in ['crop', 'pest_type', 'symptom', 'pesticide']:
    df[col] = df[col].str.lower().str.strip()

# Label encoders
le_crop = LabelEncoder()
le_pest = LabelEncoder()
le_symptom = LabelEncoder()
le_pesticide = LabelEncoder()

# Encode categorical columns
df['crop_enc'] = le_crop.fit_transform(df['crop'])
df['pest_enc'] = le_pest.fit_transform(df['pest_type'])
df['symptom_enc'] = le_symptom.fit_transform(df['symptom'])
df['pesticide_enc'] = le_pesticide.fit_transform(df['pesticide'])

# Features and target
X = df[['crop_enc', 'pest_enc', 'symptom_enc']]
y = df['pesticide_enc']

# Train model
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X, y)

# Save everything together
save_dict = {
    'model': model,
    'le_crop': le_crop,
    'le_pest': le_pest,
    'le_symptom': le_symptom,
    'le_pesticide': le_pesticide
}

with open('ml_models/pesticide_model.pkl', 'wb') as f:
    pickle.dump(save_dict, f)

print("✅ Pesticide model trained and saved successfully")
print("Available crops:", list(le_crop.classes_))
