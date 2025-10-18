// Quick test script to verify Hugging Face API is working
// Run with: node test-embeddings.js

import 'dotenv/config';

const API_KEY = process.env.HUGGINGFACE_API_KEY;

if (!API_KEY) {
  console.error('❌ HUGGINGFACE_API_KEY not found in .env file!');
  console.log('\n📝 Add this to your .env file:');
  console.log('HUGGINGFACE_API_KEY=hf_your_token_here');
  process.exit(1);
}

console.log('✅ API Key found:', API_KEY.substring(0, 10) + '...');
console.log('\n🧪 Testing Hugging Face API...\n');

const testText = 'This is a test sentence for embedding generation.';

fetch('https://api-inference.huggingface.co/models/BAAI/bge-small-en-v1.5', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    inputs: testText,
    options: { wait_for_model: true }
  })
})
  .then(async response => {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }
    return response.json();
  })
  .then(embeddings => {
    console.log('✅ SUCCESS! Hugging Face API is working!\n');
    console.log('📊 Response details:');
    console.log(`   - Embedding dimension: ${embeddings.length}`);
    console.log(`   - Sample values: [${embeddings.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
    console.log('\n🎉 Your server-side embeddings are ready to use!');
    console.log('   Now start your app with: npm run dev:all');
  })
  .catch(error => {
    console.error('❌ FAILED:', error.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('   1. Check your API key at: https://huggingface.co/settings/tokens');
    console.log('   2. Make sure token starts with "hf_"');
    console.log('   3. Verify token is set in .env file as: HUGGINGFACE_API_KEY=hf_...');
    console.log('   4. Try creating a new token with "Read" permissions');
  });
