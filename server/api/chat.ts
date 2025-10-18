// Backend API proxy to hide API keys
import type { Request, Response } from 'express';

interface ChatRequest {
  question: string;
  documents: string[];
  documentContents?: string[];
  systemPrompt?: string; // Custom system prompt for RAG
}

export async function handleChatRequest(req: Request, res: Response) {
  const { question, documents, documentContents, systemPrompt }: ChatRequest = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    // Use custom system prompt if provided (for RAG), otherwise use default
    let finalSystemPrompt = systemPrompt;
    
    if (!finalSystemPrompt) {
      // Build context from documents (legacy approach - should not be used for RAG)
      let context = '';
      if (documentContents && documentContents.length > 0) {
        context = `\n\nAvailable technical documents:\n${documentContents.join('\n\n')}`;
      } else if (documents.length > 0) {
        context = `\n\nReferencing documents: ${documents.join(', ')}`;
      }

      finalSystemPrompt = `You are a RAG-based vehicle service assistant. You provide information STRICTLY from uploaded technical documentation.

🔒 **STRICT RULES:**
1. ONLY answer based on the provided document context
2. DO NOT use general AI knowledge or external information
3. If information is not in the context, say "I don't have this information in the uploaded documents"
4. Always cite page numbers and sources
5. Refuse to answer non-vehicle-related questions

Your responses should be:
- Based entirely on the provided documentation
- Well-structured with clear headings and bullet points
- Include specific measurements, torque specs, and step-by-step procedures when relevant
- Reference safety warnings and important notes from the documents
- Professional but easy to understand

If asked about topics not in the documents (weather, jokes, general knowledge, etc.), respond:
"I'm a specialized vehicle service assistant. I can only answer questions based on your uploaded service manuals and repair documentation."

Format your responses using markdown for better readability.${context}`;
    }

    const response = await fetch(process.env.AI_API_ENDPOINT || 'https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: finalSystemPrompt
          },
          {
            role: 'user',
            content: question
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`AI API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    res.json({
      answer: data.choices?.[0]?.message?.content || 'No response received from AI',
      sources: documents,
      model: data.model,
      usage: data.usage,
    });
  } catch (error) {
    console.error('AI API Error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
