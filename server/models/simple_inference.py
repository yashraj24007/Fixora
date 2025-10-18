"""
Simple Vehicle Problem Diagnosis System
Uses dataset lookup for quick problem-solution matching
Enhanced with robust error handling and comprehensive keyword matching
"""

import pandas as pd
import json
import sys
import os
import traceback

def load_dataset():
    """Load and preprocess the vehicle service dataset with error handling"""
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        dataset_path = os.path.join(script_dir, '..', '..', 'final dataset  for kaggle.csv')
        
        if not os.path.exists(dataset_path):
            raise FileNotFoundError(f"Dataset not found at: {dataset_path}")
        
        df = pd.read_csv(dataset_path)
        
        # Validate dataset has required columns
        required_cols = ['COMMON PROBLEM', 'SOLUTION USED']
        df.columns = df.columns.str.strip().str.upper()
        
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            raise ValueError(f"Dataset missing required columns: {missing_cols}")
        
        # Clean data
        df = df.fillna('')
        for col in df.columns:
            if df[col].dtype == 'object':
                df[col] = df[col].str.strip()
        
        if len(df) == 0:
            raise ValueError("Dataset is empty")
        
        return df
    except Exception as e:
        print(f"Error loading dataset: {str(e)}", file=sys.stderr)
        raise

def find_solution(question):
    """
    Find solution based on user's question
    Uses enhanced keyword matching and dataset lookup with fallbacks
    """
    try:
        if not question or not question.strip():
            return {
                "success": False,
                "error": "Please provide a question about your vehicle issue"
            }
        
        question_lower = question.lower().strip()
        
        # Check for greetings first
        greetings = {
            'hello': ['hello', 'hi', 'hey', 'hii', 'hiii', 'helo', 'helo there'],
            'good_morning': ['good morning', 'morning', 'good morn'],
            'good_afternoon': ['good afternoon', 'afternoon'],
            'good_evening': ['good evening', 'evening'],
            'good_night': ['good night', 'goodnight', 'night'],
            'how_are_you': ['how are you', 'how r u', 'how are u', 'how r you', 'whats up', "what's up", 'sup'],
            'thanks': ['thank you', 'thanks', 'thank u', 'thankyou', 'thnx', 'thx', 'appreciate'],
            'bye': ['bye', 'goodbye', 'good bye', 'see you', 'see ya', 'later', 'cya']
        }
        
        # Check for off-topic questions (non-vehicle related)
        off_topic_keywords = {
            'weather': ['weather', 'rain', 'sunny', 'temperature outside', 'forecast', 'climate', 'hot outside', 'cold outside'],
            'food': ['recipe', 'cooking', 'food', 'restaurant', 'eat', 'hungry', 'dinner', 'lunch', 'breakfast'],
            'sports': ['football', 'cricket', 'basketball', 'match', 'game score', 'player', 'team'],
            'entertainment': ['movie', 'song', 'music', 'actor', 'actress', 'film', 'tv show', 'series'],
            'personal': ['age', 'who are you', 'where do you live', 'your name', 'are you real', 'are you human'],
            'general_info': ['capital of', 'president', 'prime minister', 'history', 'geography', 'math', 'science']
        }
        
        # Check if message is a greeting
        for greeting_type, phrases in greetings.items():
            if any(phrase in question_lower for phrase in phrases):
                responses = {
                    'hello': {
                        'problem': 'Greeting Detected',
                        'solution': "Hello! 👋 I'm Fixora, your AI vehicle service assistant. I'm here to help diagnose your vehicle problems and recommend solutions.\n\nYou can ask me about:\n• Brake issues (noise, soft pedal, etc.)\n• Engine problems (overheating, noise, power loss)\n• Battery and electrical issues\n• Oil leaks or pressure problems\n• Tire and wheel concerns\n• AC/cooling system issues\n• And much more!\n\nHow can I help you with your vehicle today?"
                    },
                    'good_morning': {
                        'problem': 'Greeting Detected',
                        'solution': "Good morning! ☀️ I'm Fixora, your vehicle service assistant. Ready to help you diagnose any vehicle issues you're experiencing. What can I help you with today?"
                    },
                    'good_afternoon': {
                        'problem': 'Greeting Detected',
                        'solution': "Good afternoon! 🌤️ I'm Fixora, your AI vehicle assistant. How can I assist you with your vehicle today?"
                    },
                    'good_evening': {
                        'problem': 'Greeting Detected',
                        'solution': "Good evening! 🌆 I'm Fixora, here to help with your vehicle concerns. What would you like to know?"
                    },
                    'good_night': {
                        'problem': 'Greeting Detected',
                        'solution': "Good night! 🌙 If you have any vehicle concerns, I'm here to help. What can I assist you with?"
                    },
                    'how_are_you': {
                        'problem': 'Greeting Detected',
                        'solution': "I'm doing great, thank you for asking! 😊 I'm here and ready to help you with any vehicle problems. How can I assist you today?"
                    },
                    'thanks': {
                        'problem': 'Appreciation Detected',
                        'solution': "You're very welcome! 😊 I'm always happy to help. If you have any other vehicle questions or need further assistance, feel free to ask anytime!"
                    },
                    'bye': {
                        'problem': 'Farewell Detected',
                        'solution': "Goodbye! 👋 Take care and drive safe! If you need any vehicle assistance in the future, I'll be here to help. Have a great day!"
                    }
                }
                
                response = responses.get(greeting_type, responses['hello'])
                return {
                    "success": True,
                    "problem": response['problem'],
                    "solution": response['solution'],
                    "confidence": {"problem": 1.0, "solution": 1.0},
                    "source": "greeting"
                }
        
        # Check for off-topic questions
        for topic_type, phrases in off_topic_keywords.items():
            if any(phrase in question_lower for phrase in phrases):
                topic_responses = {
                    'weather': "I'm Fixora, a vehicle service assistant, so I don't have weather information. However, I can help with weather-related vehicle concerns like:\n\n• Rain damage and water leaks\n• AC/heating system issues\n• Windshield wiper problems\n• Cold weather starting issues\n• Hot weather overheating\n\nDo you have any vehicle-related questions I can help with?",
                    'food': "I'm specialized in vehicle diagnostics and maintenance, not food recommendations! 😊\n\nBut I can help with vehicle-related questions like:\n• Engine problems\n• Brake issues\n• Tire maintenance\n• Battery concerns\n• And much more!\n\nWhat vehicle issue can I help you diagnose today?",
                    'sports': "I'm a vehicle service assistant, not a sports expert! 🚗\n\nBut if your vehicle needs service, I'm here to help! I can assist with:\n• Brake problems\n• Engine diagnostics\n• Tire issues\n• Oil changes\n• Battery problems\n\nDo you have any vehicle concerns?",
                    'entertainment': "I'm focused on vehicle diagnostics, not entertainment! 🎬➡️🚗\n\nBut I can definitely help with your vehicle needs:\n• Engine issues\n• Brake problems\n• AC/heating concerns\n• Electrical problems\n• And more!\n\nWhat can I help you with regarding your vehicle?",
                    'personal': "I'm Fixora, an AI vehicle service assistant created to help diagnose vehicle problems and recommend solutions. I specialize in automotive issues! 🚗\n\nI can help you with:\n• Vehicle diagnostics\n• Maintenance advice\n• Problem identification\n• Solution recommendations\n\nWhat vehicle issue would you like help with?",
                    'general_info': "I'm specialized in vehicle service and maintenance, not general knowledge! 🚗\n\nI'm here to help with automotive problems like:\n• Engine issues\n• Brake concerns\n• Electrical problems\n• Tire maintenance\n• Oil and fluid issues\n\nDo you have a vehicle-related question?"
                }
                
                response_text = topic_responses.get(topic_type, 
                    "I'm a vehicle service assistant, so I can only help with automotive-related questions. Ask me about brake issues, engine problems, battery concerns, tire maintenance, or any other vehicle-related topics!")
                
                return {
                    "success": True,
                    "problem": "Off-Topic Question Detected",
                    "solution": response_text,
                    "confidence": {"problem": 1.0, "solution": 1.0},
                    "source": "off-topic-redirect"
                }
        
        df = load_dataset()
        
        # Enhanced keyword mapping with more comprehensive coverage
        keywords = {
            'brake': ['brake', 'braking', 'stop', 'stopping', 'brake pad', 'brake disc', 'brake noise', 'brake pedal'],
            'engine': ['engine', 'motor', 'power', 'acceleration', 'rpm', 'engine noise', 'engine light', 'check engine', 'misfire', 'stalling'],
            'oil': ['oil', 'lubricant', 'oil leak', 'oil change', 'oil level', 'oil pressure'],
            'tire': ['tire', 'wheel', 'tyre', 'puncture', 'flat tire', 'tire pressure', 'tire wear', 'alignment'],
            'transmission': ['transmission', 'gear', 'shifting', 'clutch', 'gearbox', 'automatic', 'manual'],
            'battery': ['battery', 'electrical', 'start', 'starting', 'dead battery', 'jump start', 'alternator', 'charging'],
            'exhaust': ['exhaust', 'smoke', 'emission', 'muffler', 'catalytic', 'white smoke', 'black smoke', 'blue smoke'],
            'coolant': ['coolant', 'overheat', 'radiator', 'cooling', 'temperature', 'thermostat', 'water pump'],
            'ac': ['ac', 'air conditioning', 'cooling', 'aircon', 'a/c', 'cold air', 'ac not working'],
            'headlight': ['headlight', 'light', 'lamp', 'bulb', 'headlamp', 'fog light', 'tail light'],
            'suspension': ['suspension', 'shock', 'spring', 'ride', 'bumpy', 'rough ride', 'strut'],
            'steering': ['steering', 'wheel', 'turn', 'power steering', 'hard to turn', 'steering wheel'],
            'fuel': ['fuel', 'gas', 'petrol', 'diesel', 'fuel pump', 'fuel leak', 'mileage', 'consumption'],
            'noise': ['noise', 'sound', 'knocking', 'rattling', 'squeaking', 'grinding', 'clunking'],
            'vibration': ['vibration', 'vibrating', 'shaking', 'wobbling'],
            'leak': ['leak', 'leaking', 'dripping', 'fluid'],
            'warning': ['warning', 'light', 'indicator', 'dashboard', 'warning light']
        }
        
        # Find matching problem category
        matched_category = None
        match_score = 0
        
        for category, words in keywords.items():
            category_matches = sum(1 for word in words if word in question_lower)
            if category_matches > match_score:
                match_score = category_matches
                matched_category = category
        
        # Search dataset for similar problems
        if matched_category:
            # Try exact keyword match first
            problem_matches = df[df['COMMON PROBLEM'].str.lower().str.contains(matched_category, case=False, na=False)]
            
            if len(problem_matches) > 0:
                # Get most common solution for this problem
                top_match = problem_matches.iloc[0]
                
                return {
                    "success": True,
                    "problem": str(top_match['COMMON PROBLEM']),
                    "solution": str(top_match['SOLUTION USED']),
                    "confidence": {
                        "problem": min(0.85 + (match_score * 0.05), 0.95),
                        "solution": min(0.85 + (match_score * 0.05), 0.95)
                    },
                    "source": "dataset",
                    "vehicle_company": str(top_match['VEHICAL COMPANY']) if 'VEHICAL COMPANY' in top_match else None
                }
        
        # Fallback: Try to find any related problem by searching through all problems
        for idx, row in df.iterrows():
            problem_text = str(row['COMMON PROBLEM']).lower()
            # Check if any word from question appears in problem
            if any(word in problem_text for word in question_lower.split() if len(word) > 3):
                return {
                    "success": True,
                    "problem": str(row['COMMON PROBLEM']),
                    "solution": str(row['SOLUTION USED']),
                    "confidence": {
                        "problem": 0.75,
                        "solution": 0.75
                    },
                    "source": "dataset-partial-match",
                    "vehicle_company": str(row['VEHICAL COMPANY']) if 'VEHICAL COMPANY' in row else None
                }
        
        # Generic solutions based on category
        if matched_category:
            generic_solutions = {
                'brake': {
                    'problem': 'Brake System Issue',
                    'solution': 'Inspect brake pads and rotors for wear. Check brake fluid level and condition. Replace worn components. Test brake performance. Recommended: Visit service center for professional brake inspection.'
                },
                'engine': {
                    'problem': 'Engine Performance Issue',
                    'solution': 'Check engine diagnostics with OBD scanner. Inspect spark plugs, air filter, and oil level. Check fuel system. Run compression test if needed. Recommended: Professional diagnostic scan required.'
                },
                'oil': {
                    'problem': 'Oil System Issue',
                    'solution': 'Check oil level and condition. Change engine oil and oil filter if due. Inspect for oil leaks around engine. Ensure proper oil viscosity. Recommended: Regular oil changes every 5000-7500 km.'
                },
                'tire': {
                    'problem': 'Tire or Wheel Issue',
                    'solution': 'Check tire pressure (recommended: 32-35 PSI). Inspect tread depth (minimum 2mm). Rotate tires if needed. Check for damage or punctures. Balance and align wheels if vibration present.'
                },
                'transmission': {
                    'problem': 'Transmission Issue',
                    'solution': 'Check transmission fluid level and condition. Inspect for leaks. Consider transmission service if shifting issues persist. Recommended: Professional transmission diagnostic required.'
                },
                'battery': {
                    'problem': 'Battery or Electrical Issue',
                    'solution': 'Test battery voltage (should be 12.4-12.7V). Clean battery terminals and connections. Check alternator output. Replace battery if older than 3-4 years or weak. Check for parasitic drain.'
                },
                'exhaust': {
                    'problem': 'Exhaust System Issue',
                    'solution': 'Inspect exhaust system for leaks and damage. Check catalytic converter function. Address emission issues. Look for rust or holes. Recommended: Emission test if check engine light is on.'
                },
                'coolant': {
                    'problem': 'Cooling System Issue',
                    'solution': 'Check coolant level and condition. Inspect radiator, hoses, and water pump. Check thermostat operation. Flush cooling system if contaminated. Look for leaks. Never open radiator when hot.'
                },
                'ac': {
                    'problem': 'Air Conditioning Issue',
                    'solution': 'Check AC refrigerant level. Inspect AC compressor operation and drive belt. Clean or replace cabin air filter. Check AC controls. Recommended: Professional AC service and recharge.'
                },
                'headlight': {
                    'problem': 'Lighting System Issue',
                    'solution': 'Replace faulty bulbs with correct type. Clean or restore cloudy headlight lenses. Check electrical connections and fuses. Adjust headlight aim if needed. Upgrade to LED/HID if compatible.'
                },
                'suspension': {
                    'problem': 'Suspension System Issue',
                    'solution': 'Inspect shock absorbers and springs for wear. Check suspension bushings. Test ride quality. Replace worn components. Get wheel alignment after suspension work.'
                },
                'steering': {
                    'problem': 'Steering System Issue',
                    'solution': 'Check power steering fluid level. Inspect steering components for wear. Check tire pressure and alignment. Test for play in steering wheel. Recommended: Professional steering inspection.'
                },
                'fuel': {
                    'problem': 'Fuel System Issue',
                    'solution': 'Check fuel level and quality. Inspect fuel filter and replace if clogged. Test fuel pump pressure. Check for fuel leaks. Clean fuel injectors. Use quality fuel from reputable stations.'
                },
                'noise': {
                    'problem': 'Unusual Noise',
                    'solution': 'Identify noise source (engine, brakes, suspension, exhaust). Check for loose components. Inspect belt condition. Test drive to replicate. Recommended: Professional diagnosis for accurate location.'
                },
                'vibration': {
                    'problem': 'Vehicle Vibration',
                    'solution': 'Balance and align wheels. Check tire condition and pressure. Inspect suspension components. Check engine mounts. Test drive at different speeds to identify pattern.'
                },
                'leak': {
                    'problem': 'Fluid Leak',
                    'solution': 'Identify fluid type (oil, coolant, brake fluid, transmission fluid). Locate leak source. Check fluid levels. Repair or replace leaking component. Clean area to monitor for new leaks.'
                },
                'warning': {
                    'problem': 'Warning Light Active',
                    'solution': 'Use OBD scanner to read diagnostic codes. Check related systems based on warning light. Refer to owner\'s manual. Address underlying issue. Clear codes after repair and retest.'
                }
            }
            
            solution_data = generic_solutions.get(matched_category, {
                'problem': 'Vehicle Service Required',
                'solution': 'Please visit an authorized service center for professional diagnosis and repair.'
            })
            
            return {
                "success": True,
                "problem": solution_data['problem'],
                "solution": solution_data['solution'],
                "confidence": {"problem": 0.70, "solution": 0.70},
                "source": "generic-knowledge-base"
            }
        
        # Final fallback - Question not relevant to vehicle service
        return {
            "success": True,
            "problem": "Unrelevant Question",
            "solution": "⚠️ This question is not related to vehicle service or maintenance. Please ask about car problems, repairs, or vehicle care for the best help!",
            "confidence": {"problem": 0.50, "solution": 0.50},
            "source": "not-relevant"
        }
            
    except Exception as e:
        error_msg = str(e)
        stack_trace = traceback.format_exc()
        print(f"Error in find_solution: {error_msg}", file=sys.stderr)
        print(f"Stack trace: {stack_trace}", file=sys.stderr)
        
        return {
            "success": False,
            "error": f"Diagnosis error: {error_msg}. Please try rephrasing your question or contact support."
        }

if __name__ == "__main__":
    try:
        # Set UTF-8 encoding for stdout
        if sys.platform == 'win32':
            import codecs
            sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
        
        if len(sys.argv) < 2:
            result = {
                "success": False,
                "error": "No question provided. Usage: python simple_inference.py '{\"question\": \"your question\"}'"
            }
            print(json.dumps(result, ensure_ascii=False))
            sys.exit(1)
        
        input_data = json.loads(sys.argv[1])
        question = input_data.get('question', '').strip()
        
        if not question:
            result = {
                "success": False,
                "error": "Question cannot be empty"
            }
            print(json.dumps(result, ensure_ascii=False))
            sys.exit(1)
        
        result = find_solution(question)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
    except json.JSONDecodeError as e:
        result = {
            "success": False,
            "error": f"Invalid JSON input: {str(e)}"
        }
        print(json.dumps(result, ensure_ascii=False))
        sys.exit(1)
    except Exception as e:
        result = {
            "success": False,
            "error": f"Unexpected error: {str(e)}"
        }
        print(json.dumps(result, ensure_ascii=False))
        sys.exit(1)
