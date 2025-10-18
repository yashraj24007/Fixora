import { Request, Response } from 'express';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

interface PredictionRequest {
  city?: string;
  state?: string;
  serviceHistory?: string;
  vehicleCompany?: string;
}

interface PredictionResponse {
  success: boolean;
  problem?: string;
  solution?: string;
  error?: string;
  confidence?: {
    problem: number;
    solution: number;
  };
}

/**
 * Handle ML model inference requests
 * This endpoint uses trained RandomForest models to predict vehicle problems and solutions
 */
export const handleModelInference = async (req: Request, res: Response) => {
  try {
    const { city, state, serviceHistory, vehicleCompany } = req.body as PredictionRequest;

    // Validate required inputs
    if (!city || !state || !serviceHistory || !vehicleCompany) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields. Please provide: city, state, serviceHistory, vehicleCompany'
      });
    }

    // Check if model files exist
    const modelsDir = path.join(__dirname, '..', 'models');
    const problemModelPath = path.join(modelsDir, 'problem_classifier.pkl');
    const solutionModelPath = path.join(modelsDir, 'solution_classifier.pkl');
    const encodersPath = path.join(modelsDir, 'model_encoders.pkl');

    if (!fs.existsSync(problemModelPath) || !fs.existsSync(solutionModelPath) || !fs.existsSync(encodersPath)) {
      return res.status(503).json({
        success: false,
        error: 'ML models not found. Please train the models first by running: python train_model.py'
      });
    }

    // Run Python inference script
    const result = await runPythonInference({
      city,
      state,
      serviceHistory,
      vehicleCompany
    });

    res.json(result);

  } catch (error) {
    console.error('Model inference error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during inference'
    });
  }
};

/**
 * Run Python inference script using trained models
 */
function runPythonInference(data: PredictionRequest): Promise<PredictionResponse> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '..', 'models', 'inference.py');
    
    // Check if inference script exists, if not create it inline
    if (!fs.existsSync(pythonScript)) {
      const scriptContent = `
import sys
import json
import pickle
import numpy as np
import warnings
warnings.filterwarnings('ignore')

try:
    # Load models and encoders
    with open('server/models/problem_classifier.pkl', 'rb') as f:
        problem_model = pickle.load(f)
    
    with open('server/models/solution_classifier.pkl', 'rb') as f:
        solution_model = pickle.load(f)
    
    with open('server/models/model_encoders.pkl', 'rb') as f:
        encoders = pickle.load(f)
    
    # Get input data from command line
    input_data = json.loads(sys.argv[1])
    
    # Encode input features
    city_encoded = encoders['city'].transform([input_data['city']])[0]
    state_encoded = encoders['state'].transform([input_data['state']])[0]
    service_encoded = encoders['service_history'].transform([input_data['serviceHistory']])[0]
    vehicle_encoded = encoders['vehicle_company'].transform([input_data['vehicleCompany']])[0]
    
    # Create feature vector
    X = np.array([[city_encoded, state_encoded, service_encoded, vehicle_encoded]])
    
    # Make predictions
    problem_pred = problem_model.predict(X)[0]
    solution_pred = solution_model.predict(X)[0]
    
    # Get confidence scores (probability of predicted class)
    problem_proba = problem_model.predict_proba(X)[0]
    solution_proba = solution_model.predict_proba(X)[0]
    
    problem_confidence = float(np.max(problem_proba))
    solution_confidence = float(np.max(solution_proba))
    
    # Decode predictions
    problem = encoders['problem'].inverse_transform([problem_pred])[0]
    solution = encoders['solution'].inverse_transform([solution_pred])[0]
    
    result = {
        "success": True,
        "problem": problem,
        "solution": solution,
        "confidence": {
            "problem": problem_confidence,
            "solution": solution_confidence
        }
    }
    
    print(json.dumps(result))

except Exception as e:
    error_result = {
        "success": False,
        "error": str(e)
    }
    print(json.dumps(error_result))
    sys.exit(1)
`;
      
      const modelsDir = path.join(__dirname, '..', 'models');
      if (!fs.existsSync(modelsDir)) {
        fs.mkdirSync(modelsDir, { recursive: true });
      }
      fs.writeFileSync(pythonScript, scriptContent.trim());
    }

    const python = spawn('python', [pythonScript, JSON.stringify(data)]);
    
    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python inference failed: ${stderr}`));
        return;
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse Python output: ${stdout}`));
      }
    });

    python.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
}
