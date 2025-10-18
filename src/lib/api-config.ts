// API Configuration for AI Assistant with Backend Proxy
// Backend handles API keys securely

export const API_CONFIG = {
  // Backend API endpoint
  endpoint: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api/chat',
  
  // Maximum tokens for response
  maxTokens: 2000,
  
  // Temperature for response creativity (0-1)
  temperature: 0.7,
};

// Function to call AI API through backend proxy
export async function callAI(
  question: string, 
  documents: string[], 
  systemPrompt?: string,
  documentContents?: string[]
) {
  try {
    const response = await fetch(API_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        documents,
        documentContents,
        systemPrompt, // Pass custom system prompt for RAG
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      answer: data.answer || 'No response received from AI',
      sources: data.sources || documents,
      model: data.model,
      usage: data.usage,
    };
  } catch (error) {
    console.error('AI API Error:', error);
    throw error;
  }
}

// Helper function to process PDF documents
export async function processPDFForAI(file: File) {
  // TODO: Implement PDF text extraction
  // You can use libraries like pdf.js or pdf-parse
  // This will extract text from PDFs to send to the AI
  
  return {
    filename: file.name,
    content: 'PDF content will be extracted here',
    pages: 0,
  };
}
