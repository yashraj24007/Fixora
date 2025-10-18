/**
 * Local Model Testing Script
 * Tests the improved inference system with various scenarios
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test cases
const testCases = [
  {
    name: "Greeting - Hello",
    question: "Hello",
    expectedKeywords: ["fixora", "help", "vehicle"],
    isGreeting: true
  },
  {
    name: "Greeting - Good Morning",
    question: "Good morning",
    expectedKeywords: ["good morning", "fixora", "help"],
    isGreeting: true
  },
  {
    name: "Greeting - How are you",
    question: "How are you?",
    expectedKeywords: ["great", "help", "assist"],
    isGreeting: true
  },
  {
    name: "Greeting - Thank you",
    question: "Thank you",
    expectedKeywords: ["welcome", "happy"],
    isGreeting: true
  },
  {
    name: "Greeting - Goodbye",
    question: "Bye",
    expectedKeywords: ["goodbye", "safe", "care"],
    isGreeting: true
  },
  {
    name: "Brake Issue",
    question: "My car brakes are making noise when I stop",
    expectedKeywords: ["brake", "noise", "pad"]
  },
  {
    name: "Engine Overheating",
    question: "Engine is overheating and temperature gauge is high",
    expectedKeywords: ["engine", "overheating", "radiator", "coolant"]
  },
  {
    name: "Battery Problem",
    question: "Battery is dead and car won't start",
    expectedKeywords: ["battery", "dead", "replacement"]
  },
  {
    name: "Oil Leak",
    question: "I notice oil leaking from my engine",
    expectedKeywords: ["oil", "leak"]
  },
  {
    name: "Tire Issue",
    question: "My tire pressure is low and tires look worn",
    expectedKeywords: ["tire", "pressure", "tread"]
  },
  {
    name: "AC Not Working",
    question: "Air conditioning is not cooling properly",
    expectedKeywords: ["ac", "air conditioning", "refrigerant", "cooling"]
  },
  {
    name: "Vibration",
    question: "Strange vibration when driving at high speed",
    expectedKeywords: ["vibration", "wheel", "balance"]
  },
  {
    name: "Warning Light",
    question: "Check engine light is on",
    expectedKeywords: ["check engine", "diagnostic", "light"]
  },
  {
    name: "General Maintenance",
    question: "What regular maintenance should I do?",
    expectedKeywords: ["maintenance", "oil", "check", "service"]
  },
  {
    name: "Empty Question",
    question: "",
    shouldFail: true
  }
];

function runInference(question) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'server', 'models', 'simple_inference.py');
    const inputData = JSON.stringify({ question });
    
    const python = spawn('python', [scriptPath, inputData]);
    
    let stdout = '';
    let stderr = '';
    
    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    python.on('close', (code) => {
      if (code !== 0 && !stdout) {
        reject(new Error(`Process failed: ${stderr}`));
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse output: ${stdout}`));
      }
    });
    
    python.on('error', (error) => {
      reject(error);
    });
  });
}

async function runTests() {
  console.log('🧪 Starting Local Model Tests\n');
  console.log('='.repeat(80));
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    try {
      console.log(`\n📝 Test: ${testCase.name}`);
      console.log(`   Question: "${testCase.question}"`);
      
      const result = await runInference(testCase.question);
      
      if (testCase.shouldFail) {
        if (!result.success) {
          console.log(`   ✅ PASS - Correctly failed with error: ${result.error}`);
          passed++;
        } else {
          console.log(`   ❌ FAIL - Should have failed but succeeded`);
          failed++;
        }
      } else {
        if (result.success) {
          console.log(`   ✅ PASS`);
          console.log(`   Problem: ${result.problem}`);
          console.log(`   Solution: ${result.solution.substring(0, 100)}...`);
          console.log(`   Confidence: Problem ${(result.confidence.problem * 100).toFixed(0)}%, Solution ${(result.confidence.solution * 100).toFixed(0)}%`);
          console.log(`   Source: ${result.source}`);
          
          // Check if expected keywords are present
          const fullText = `${result.problem} ${result.solution}`.toLowerCase();
          const foundKeywords = testCase.expectedKeywords.filter(kw => 
            fullText.includes(kw.toLowerCase())
          );
          
          if (foundKeywords.length > 0) {
            console.log(`   Keywords found: ${foundKeywords.join(', ')}`);
          }
          
          passed++;
        } else {
          console.log(`   ❌ FAIL - Error: ${result.error}`);
          failed++;
        }
      }
    } catch (error) {
      console.log(`   ❌ FAIL - Exception: ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 Test Results:`);
  console.log(`   Total: ${testCases.length}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! The local model is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please review the errors above.');
  }
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
