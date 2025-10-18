"""
Vehicle Service Dataset Preprocessing and Model Training
This script processes the vehicle service dataset and trains a classification model
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import pickle
import json
import os

# Load the dataset
print("📊 Loading dataset...")
df = pd.read_csv('final dataset  for kaggle.csv')

print(f"Dataset shape: {df.shape}")
print(f"\nColumns: {df.columns.tolist()}")
print(f"\nFirst few rows:")
print(df.head())

# Data preprocessing
print("\n🧹 Preprocessing data...")

# 1. Clean column names (remove spaces and standardize)
df.columns = df.columns.str.strip().str.upper()

# 2. Handle missing values
print(f"\nMissing values before cleaning:")
print(df.isnull().sum())

# Fill missing values
df = df.fillna({
    'SERVICE HISTORY': 'Unknown',
    'COMMON PROBLEM': 'Unknown',
    'SOLUTION USED': 'Unknown',
    'VEHICAL COMPANY': 'Unknown'
})

# 3. Clean text data
df['SERVICE HISTORY'] = df['SERVICE HISTORY'].str.strip()
df['COMMON PROBLEM'] = df['COMMON PROBLEM'].str.strip()
df['SOLUTION USED'] = df['SOLUTION USED'].str.strip()
df['VEHICAL COMPANY'] = df['VEHICAL COMPANY'].str.strip()

print(f"\nUnique values:")
print(f"Cities: {df['CITY'].nunique()}")
print(f"States: {df['STATE'].nunique()}")
print(f"Problems: {df['COMMON PROBLEM'].nunique()}")
print(f"Solutions: {df['SOLUTION USED'].nunique()}")
print(f"Companies: {df['VEHICAL COMPANY'].nunique()}")

# 4. Encode categorical variables
print("\n🔢 Encoding categorical variables...")

encoders = {}
categorical_columns = ['CITY', 'STATE', 'SERVICE HISTORY', 'VEHICAL COMPANY']

for col in categorical_columns:
    le = LabelEncoder()
    df[f'{col}_ENCODED'] = le.fit_transform(df[col])
    encoders[col] = le

# Encode target variables
problem_encoder = LabelEncoder()
solution_encoder = LabelEncoder()

df['PROBLEM_ENCODED'] = problem_encoder.fit_transform(df['COMMON PROBLEM'])
df['SOLUTION_ENCODED'] = solution_encoder.fit_transform(df['SOLUTION USED'])

encoders['COMMON PROBLEM'] = problem_encoder
encoders['SOLUTION USED'] = solution_encoder

# Create models directory
os.makedirs('server/models', exist_ok=True)

# Save encoders
print("\n💾 Saving encoders...")
with open('server/models/model_encoders.pkl', 'wb') as f:
    pickle.dump(encoders, f)

# Create mapping files for reference
problem_mapping = dict(zip(problem_encoder.classes_, problem_encoder.transform(problem_encoder.classes_)))
solution_mapping = dict(zip(solution_encoder.classes_, solution_encoder.transform(solution_encoder.classes_)))

mappings = {
    'problems': problem_mapping,
    'solutions': solution_mapping,
    'num_problems': len(problem_mapping),
    'num_solutions': len(solution_mapping)
}

with open('server/models/model_mappings.json', 'w') as f:
    json.dump(mappings, f, indent=2)

print(f"✅ Saved {len(problem_mapping)} problem types")
print(f"✅ Saved {len(solution_mapping)} solution types")

# 5. Prepare features and target
print("\n🎯 Preparing features and target...")

# Features: encoded categorical variables
feature_columns = ['CITY_ENCODED', 'STATE_ENCODED', 'SERVICE HISTORY_ENCODED', 'VEHICAL COMPANY_ENCODED']
X = df[feature_columns]

# Target: predict both problem and solution
y_problem = df['PROBLEM_ENCODED']
y_solution = df['SOLUTION_ENCODED']

# 6. Split data
print("\n✂️ Splitting data (80% train, 20% test)...")
X_train, X_test, y_problem_train, y_problem_test, y_solution_train, y_solution_test = train_test_split(
    X, y_problem, y_solution, test_size=0.2, random_state=42, stratify=y_problem
)

print(f"Training set size: {X_train.shape[0]}")
print(f"Test set size: {X_test.shape[0]}")

# 7. Train Problem Classifier
print("\n🤖 Training Problem Classifier...")
problem_model = RandomForestClassifier(
    n_estimators=100,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)

problem_model.fit(X_train, y_problem_train)

# Evaluate
y_problem_pred = problem_model.predict(X_test)
problem_accuracy = accuracy_score(y_problem_test, y_problem_pred)
print(f"\n📊 Problem Classifier Accuracy: {problem_accuracy:.2%}")

# 8. Train Solution Classifier
print("\n🤖 Training Solution Classifier...")
solution_model = RandomForestClassifier(
    n_estimators=100,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)

solution_model.fit(X_train, y_solution_train)

# Evaluate
y_solution_pred = solution_model.predict(X_test)
solution_accuracy = accuracy_score(y_solution_test, y_solution_pred)
print(f"📊 Solution Classifier Accuracy: {solution_accuracy:.2%}")

# 9. Save models
print("\n💾 Saving trained models...")
with open('server/models/problem_classifier.pkl', 'wb') as f:
    pickle.dump(problem_model, f)

with open('server/models/solution_classifier.pkl', 'wb') as f:
    pickle.dump(solution_model, f)

# 10. Create model metadata
metadata = {
    'problem_accuracy': float(problem_accuracy),
    'solution_accuracy': float(solution_accuracy),
    'training_samples': int(X_train.shape[0]),
    'test_samples': int(X_test.shape[0]),
    'features': feature_columns,
    'num_problems': int(df['COMMON PROBLEM'].nunique()),
    'num_solutions': int(df['SOLUTION USED'].nunique()),
    'model_type': 'RandomForestClassifier',
    'model_params': {
        'n_estimators': 100,
        'max_depth': 15
    }
}

with open('server/models/model_metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print("\n✅ Model training complete!")
print(f"📁 Files created in server/models/:")
print(f"   - problem_classifier.pkl")
print(f"   - solution_classifier.pkl")
print(f"   - model_encoders.pkl")
print(f"   - model_mappings.json")
print(f"   - model_metadata.json")

# 11. Test prediction function
print("\n🧪 Testing prediction function...")
test_input = X_test.iloc[0:1]
predicted_problem = problem_model.predict(test_input)[0]
predicted_solution = solution_model.predict(test_input)[0]

problem_name = problem_encoder.inverse_transform([predicted_problem])[0]
solution_name = solution_encoder.inverse_transform([predicted_solution])[0]

print(f"\n Example Prediction:")
print(f"   Input features: {test_input.values[0]}")
print(f"   Predicted Problem: {problem_name}")
print(f"   Predicted Solution: {solution_name}")

print("\n🎉 All done! Models are ready for deployment.")
