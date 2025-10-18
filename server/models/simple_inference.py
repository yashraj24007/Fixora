"""
Simple Vehicle Problem Diagnosis System
Uses dataset lookup for quick problem-solution matching
"""

import pandas as pd
import json
import sys
import os

def load_dataset():
    """Load and preprocess the vehicle service dataset"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(script_dir, '..', '..', 'final dataset  for kaggle.csv')
    
    df = pd.read_csv(dataset_path)
    df.columns = df.columns.str.strip().str.upper()
    
    # Clean data
    df = df.fillna('')
    for col in df.columns:
        if df[col].dtype == 'object':
            df[col] = df[col].str.strip()
    
    return df

def find_solution(question):
    """
    Find solution based on user's question
    Uses keyword matching and dataset lookup
    """
    try:
        df = load_dataset()
        question_lower = question.lower()
        
        # Extract keywords from question
        keywords = {
            'brake': ['brake', 'braking', 'stop'],
            'engine': ['engine', 'motor', 'power'],
            'oil': ['oil', 'lubricant'],
            'tire': ['tire', 'wheel', 'tyre'],
            'transmission': ['transmission', 'gear', 'shifting'],
            'battery': ['battery', 'electrical', 'start'],
            'exhaust': ['exhaust', 'smoke', 'emission'],
            'coolant': ['coolant', 'overheat', 'radiator'],
            'ac': ['ac', 'air conditioning', 'cooling'],
            'headlight': ['headlight', 'light', 'lamp']
        }
        
        # Find matching problem category
        matched_category = None
        for category, words in keywords.items():
            if any(word in question_lower for word in words):
                matched_category = category
                break
        
        if not matched_category:
            # Return general maintenance advice
            return {
                "success": True,
                "problem": "General Maintenance Required",
                "solution": "Please visit a service center for professional diagnosis. Common checks include: oil level, brake fluid, tire pressure, and battery voltage.",
                "confidence": {"problem": 0.7, "solution": 0.7},
                "source": "general"
            }
        
        # Search dataset for similar problems
        problem_matches = df[df['COMMON PROBLEM'].str.lower().str.contains(matched_category, na=False)]
        
        if len(problem_matches) > 0:
            # Get most common solution for this problem
            top_match = problem_matches.iloc[0]
            
            return {
                "success": True,
                "problem": str(top_match['COMMON PROBLEM']),
                "solution": str(top_match['SOLUTION USED']),
                "confidence": {
                    "problem": 0.85,
                    "solution": 0.85
                },
                "source": "dataset",
                "vehicle_company": str(top_match['VEHICAL COMPANY']) if 'VEHICAL COMPANY' in top_match else None
            }
        else:
            # Fallback to keyword-based generic solution
            generic_solutions = {
                'brake': 'Inspect brake pads and rotors for wear. Check brake fluid level. Replace worn components.',
                'engine': 'Check engine diagnostics. Inspect spark plugs, air filter, and oil level. Run diagnostic scan.',
                'oil': 'Change engine oil and oil filter. Check for oil leaks. Ensure proper oil level.',
                'tire': 'Check tire pressure and tread depth. Rotate tires if needed. Inspect for damage.',
                'transmission': 'Check transmission fluid level and condition. Consider transmission service.',
                'battery': 'Test battery voltage. Clean battery terminals. Replace if weak or old.',
                'exhaust': 'Inspect exhaust system for leaks. Check catalytic converter. Address emission issues.',
                'coolant': 'Check coolant level and condition. Inspect radiator and hoses. Flush if needed.',
                'ac': 'Check AC refrigerant level. Inspect AC compressor and belts. Clean AC filters.',
                'headlight': 'Replace bulbs if needed. Clean or restore headlight lenses. Check electrical connections.'
            }
            
            return {
                "success": True,
                "problem": f"{matched_category.capitalize()} issue detected",
                "solution": generic_solutions.get(matched_category, "Visit service center for inspection"),
                "confidence": {"problem": 0.75, "solution": 0.75},
                "source": "generic"
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No question provided"}))
        sys.exit(1)
    
    input_data = json.loads(sys.argv[1])
    question = input_data.get('question', '')
    
    result = find_solution(question)
    print(json.dumps(result))
