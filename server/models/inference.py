"""
Vehicle Problem & Solution Prediction
Uses trained ML models to predict vehicle problems and recommend solutions
Enhanced with error handling and fallback mechanisms
"""

import sys
import json
import pickle
import numpy as np
import warnings
import os
import traceback

warnings.filterwarnings('ignore')

def load_models():
    """Load ML models with error handling"""
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        models = {}
        files = {
            'problem_model': 'problem_classifier.pkl',
            'solution_model': 'solution_classifier.pkl',
            'encoders': 'model_encoders.pkl'
        }
        
        for key, filename in files.items():
            filepath = os.path.join(script_dir, filename)
            if not os.path.exists(filepath):
                raise FileNotFoundError(f"Model file not found: {filename}. Please train the model first using train_model.py")
            
            with open(filepath, 'rb') as f:
                models[key] = pickle.load(f)
        
        return models['problem_model'], models['solution_model'], models['encoders']
    
    except Exception as e:
        print(f"Error loading models: {str(e)}", file=sys.stderr)
        raise

def validate_input(input_data, encoders):
    """Validate and encode input data with error handling"""
    try:
        required_fields = ['city', 'state', 'serviceHistory', 'vehicleCompany']
        missing_fields = [field for field in required_fields if field not in input_data]
        
        if missing_fields:
            raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")
        
        # Try to encode each field, provide helpful error messages
        encoded_values = {}
        
        # City
        try:
            city = str(input_data['city']).strip()
            if city not in encoders['CITY'].classes_:
                # Use first city as fallback
                city = encoders['CITY'].classes_[0]
                print(f"Warning: City not in training data, using fallback: {city}", file=sys.stderr)
            encoded_values['city'] = encoders['CITY'].transform([city])[0]
        except Exception as e:
            raise ValueError(f"Invalid city value: {str(e)}")
        
        # State
        try:
            state = str(input_data['state']).strip()
            if state not in encoders['STATE'].classes_:
                state = encoders['STATE'].classes_[0]
                print(f"Warning: State not in training data, using fallback: {state}", file=sys.stderr)
            encoded_values['state'] = encoders['STATE'].transform([state])[0]
        except Exception as e:
            raise ValueError(f"Invalid state value: {str(e)}")
        
        # Service History
        try:
            service = str(input_data['serviceHistory']).strip()
            if service not in encoders['SERVICE HISTORY'].classes_:
                service = encoders['SERVICE HISTORY'].classes_[0]
                print(f"Warning: Service history not in training data, using fallback: {service}", file=sys.stderr)
            encoded_values['service'] = encoders['SERVICE HISTORY'].transform([service])[0]
        except Exception as e:
            raise ValueError(f"Invalid service history value: {str(e)}")
        
        # Vehicle Company
        try:
            vehicle = str(input_data['vehicleCompany']).strip()
            if vehicle not in encoders['VEHICAL COMPANY'].classes_:
                vehicle = encoders['VEHICAL COMPANY'].classes_[0]
                print(f"Warning: Vehicle company not in training data, using fallback: {vehicle}", file=sys.stderr)
            encoded_values['vehicle'] = encoders['VEHICAL COMPANY'].transform([vehicle])[0]
        except Exception as e:
            raise ValueError(f"Invalid vehicle company value: {str(e)}")
        
        return encoded_values
    
    except Exception as e:
        print(f"Validation error: {str(e)}", file=sys.stderr)
        raise

def predict(input_data):
    try:
        # Load models and encoders
        problem_model, solution_model, encoders = load_models()
        
        # Validate and encode input
        encoded = validate_input(input_data, encoders)
        
        # Create feature vector
        X = np.array([[encoded['city'], encoded['state'], encoded['service'], encoded['vehicle']]])
        
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
            "problem": str(problem),
            "solution": str(solution),
            "confidence": {
                "problem": round(problem_confidence, 3),
                "solution": round(solution_confidence, 3)
            },
            "source": "ml-model"
        }
        
        return result

    except FileNotFoundError as e:
        return {
            "success": False,
            "error": str(e),
            "suggestion": "Please run 'python train_model.py' first to train the ML models"
        }
    except ValueError as e:
        return {
            "success": False,
            "error": str(e)
        }
    except Exception as e:
        error_msg = str(e)
        stack_trace = traceback.format_exc()
        print(f"Prediction error: {error_msg}", file=sys.stderr)
        print(f"Stack trace: {stack_trace}", file=sys.stderr)
        
        return {
            "success": False,
            "error": f"Prediction failed: {error_msg}"
        }

if __name__ == "__main__":
    try:
        # Get input from command line argument
        if len(sys.argv) < 2:
            result = {
                "success": False,
                "error": "No input data provided",
                "usage": "python inference.py '{\"city\": \"...\", \"state\": \"...\", \"serviceHistory\": \"...\", \"vehicleCompany\": \"...\"}'"
            }
            print(json.dumps(result))
            sys.exit(1)
        
        input_json = sys.argv[1]
        input_data = json.loads(input_json)
        
        result = predict(input_data)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
    except json.JSONDecodeError as e:
        result = {
            "success": False,
            "error": f"Invalid JSON input: {str(e)}"
        }
        print(json.dumps(result))
        sys.exit(1)
    except Exception as e:
        result = {
            "success": False,
            "error": f"Unexpected error: {str(e)}"
        }
        print(json.dumps(result))
        sys.exit(1)
