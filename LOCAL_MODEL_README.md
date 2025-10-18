# Local Model Setup Guide

## Overview
The Local Model feature allows users to get vehicle diagnosis without uploading documents. It uses a simple keyword-based system backed by the vehicle service dataset.

## How It Works

### 1. Simple Keyword Matching
- The system analyzes the user's question for keywords
- Matches keywords to common vehicle problems (brake, engine, oil, tire, etc.)
- Looks up solutions from the dataset

### 2. Dataset Lookup
- Uses `final dataset for kaggle.csv` containing 500+ vehicle service records
- Matches problems to known solutions from real service history
- Returns problem diagnosis and recommended solution

## Setup Instructions

### Prerequisites
- Python 3.x installed
- pandas library: `pip install pandas`

### Files Structure
```
Fixora/
├── final dataset  for kaggle.csv    # Training dataset
├── server/
│   ├── models/
│   │   └── simple_inference.py     # Inference script
│   └── api/
│       └── local-model.ts          # API endpoint
└── src/
    └── components/
        └── Assistant.tsx           # Frontend integration
```

### No Training Required!
The simple inference system doesn't require model training. It works directly with the dataset through keyword matching.

## API Endpoint

**POST** `/api/local-model`

### Request Body
```json
{
  "question": "my brakes are making noise"
}
```

### Response
```json
{
  "success": true,
  "problem": "Brake noise",
  "solution": "Brake pad replacement",
  "confidence": {
    "problem": 0.85,
    "solution": 0.85
  },
  "source": "dataset",
  "vehicle_company": "Honda"
}
```

## Supported Problem Categories

- **Brake Issues**: noise, squealing, soft pedal
- **Engine Problems**: overheating, misfiring, rough idle
- **Oil Issues**: leaks, consumption, contamination
- **Tire Problems**: wear, alignment, pressure
- **Transmission**: slipping, rough shifting
- **Battery**: dead, drainage, electrical
- **Exhaust**: leaks, noise, emissions
- **Cooling**: overheating, coolant leaks
- **AC**: not cooling, compressor issues
- **Headlights**: dim, cloudy, restoration

## Usage in Application

1. Navigate to AI Assistant page
2. Click "AI Assistant" dropdown in navbar
3. Select "Use Local Model"
4. Ask questions directly - no document upload needed!
5. Get instant diagnosis and solution

## Advantages

✅ **No Document Upload**: Works immediately without PDFs
✅ **Fast Response**: Keyword matching is instant
✅ **Dataset-Backed**: Uses real service history data
✅ **Simple & Reliable**: No complex ML model training
✅ **Offline-Ready**: Works without external APIs (except backend)

## Limitations

⚠️ **Keyword-Based**: May not understand complex or unusual phrasings
⚠️ **Limited Scope**: Only covers problems in the dataset
⚠️ **No Context**: Doesn't understand follow-up questions
⚠️ **Generic Solutions**: May not be specific to your exact vehicle model

## Future Improvements

- Add more sophisticated NLP for question understanding
- Train actual ML models for better accuracy
- Include vehicle-specific recommendations
- Add diagnostic code lookup
- Integrate with OBD-II data

## Troubleshooting

### "Python not found" error
- Install Python 3.x: https://www.python.org/downloads/
- Add Python to PATH during installation

### "Module 'pandas' not found"
```bash
pip install pandas
```

### Backend not responding
- Ensure backend server is running: `npm run dev:server`
- Check PORT in .env (default: 3001)
- Verify VITE_BACKEND_URL in frontend

### No results for question
- Try rephrasing with common automotive terms
- Use keywords like "brake", "engine", "oil", etc.
- Check that dataset CSV file exists

## Development

### Test the Python script directly
```bash
cd server/models
python simple_inference.py '{"question":"brake noise"}'
```

### Check API endpoint
```bash
curl -X POST http://localhost:3001/api/local-model \
  -H "Content-Type: application/json" \
  -d '{"question":"my brakes are squeaking"}'
```

## Contact
For issues or improvements, open an issue on GitHub.
