"""
Vehicle Problem & Solution Prediction
Uses trained ML models to predict vehicle problems and recommend solutions
"""

import sys
import json
import pickle
import numpy as np
import warnings
import os

warnings.filterwarnings('ignore')

def predict(input_data):
    try:
        # Get the script directory
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Load models and encoders
        with open(os.path.join(script_dir, 'problem_classifier.pkl'), 'rb') as f:
            problem_model = pickle.load(f)
        
        with open(os.path.join(script_dir, 'solution_classifier.pkl'), 'rb') as f:
            solution_model = pickle.load(f)
        
        with open(os.path.join(script_dir, 'model_encoders.pkl'), 'rb') as f:
            encoders = pickle.load(f)
        
        # Encode input features
        city_encoded = encoders['CITY'].transform([input_data['city']])[0]
        state_encoded = encoders['STATE'].transform([input_data['state']])[0]
        service_encoded = encoders['SERVICE HISTORY'].transform([input_data['serviceHistory']])[0]
        vehicle_encoded = encoders['VEHICAL COMPANY'].transform([input_data['vehicleCompany']])[0]
        
        # Create feature vector
        X = np.array([[city_encoded, state_encoded, service_encoded, vehicle_encoded]])
        
        # Make predictions
        problem_pred = problem_model.predict(X)[0]
        solution_pred = solution_model.predict(X)[0]
        
        # Get confidence scores
        problem_proba = problem_model.predict_proba(X)[0]
        solution_proba = solution_model.predict_proba(X)[0]
        
        problem_confidence = float(np.max(problem_proba))
        solution_confidence = float(np.max(solution_proba))
        
        # Decode predictions
        problem = encoders['COMMON PROBLEM'].inverse_transform([problem_pred])[0]
        solution = encoders['SOLUTION USED'].inverse_transform([solution_pred])[0]
        
        result = {
            "success": True,
            "problem": problem,
            "solution": solution,
            "confidence": {
                "problem": problem_confidence,
                "solution": solution_confidence
            }
        }
        
        return result

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    # Get input from command line argument
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No input data provided"}))
        sys.exit(1)
    
    input_json = sys.argv[1]
    input_data = json.loads(input_json)
    
    result = predict(input_data)
    print(json.dumps(result))
