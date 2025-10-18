import type { Request, Response } from 'express';

interface EmbeddingRequest {
  texts: string[];
}

export async function handleEmbeddingRequest(req: Request, res: Response) {
  const { texts }: EmbeddingRequest = req.body;

  if (!texts || !Array.isArray(texts)) {
    return res.status(400).json({ error: 'texts array is required' });
  }

  if (texts.length === 0) {
    return res.json({ embeddings: [] });
  }

  try {
    const API_URL = 'https://api-inference.huggingface.co/models/BAAI/bge-small-en-v1.5';
    
    // Process ONE at a time to ensure compatibility
    const allEmbeddings: number[][] = [];
    
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      
      console.log(`Processing embedding ${i + 1}/${texts.length}...`);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: text,
          options: { wait_for_model: true }
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Hugging Face API Error:', response.status, errorText);
        throw new Error(`Hugging Face API Error: ${response.status} - ${errorText}`);
      }

      const embedding = await response.json();
      allEmbeddings.push(embedding);
      
      // Small delay to avoid rate limits
      if (i < texts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    console.log(`✅ Successfully generated ${allEmbeddings.length} embeddings`);
    res.json({ embeddings: allEmbeddings });
  } catch (error) {
    console.error('Embedding API Error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
