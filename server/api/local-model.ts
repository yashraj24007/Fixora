import { Request, Response } from 'express';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface QuestionRequest {
  question: string;
}

interface DiagnosisResponse {
  success: boolean;
  problem?: string;
  solution?: string;
  error?: string;
  confidence?: {
    problem: number;
    solution: number;
  };
  source?: string;
  vehicle_company?: string;
}

/**
 * Handle local model inference for vehicle diagnosis
 * Uses simple keyword-based lookup with dataset
 */
export const handleLocalModelInference = async (req: Request, res: Response) => {
  try {
    const { question } = req.body as QuestionRequest;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a question about your vehicle issue'
      });
    }

    // Run Python inference script
    const result = await runSimpleInference(question);

    res.json(result);

  } catch (error) {
    console.error('Local model inference error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during diagnosis'
    });
  }
};

/**
 * Run simple Python inference script
 */
function runSimpleInference(question: string): Promise<DiagnosisResponse> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '..', 'models', 'simple_inference.py');
    
    if (!fs.existsSync(pythonScript)) {
      reject(new Error('Inference script not found'));
      return;
    }

    const inputData = JSON.stringify({ question });
    const python = spawn('python', [pythonScript, inputData]);
    
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
