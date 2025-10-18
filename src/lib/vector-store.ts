import { DocumentChunk } from './document-parser';

// Cosine similarity function
export function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

export interface ChunkWithEmbedding extends DocumentChunk {
  embedding: number[];
}

export interface SearchResult {
  chunk: DocumentChunk;
  similarity: number;
}

/**
 * Vector store for managing document embeddings and similarity search
 * Now uses server-side API instead of browser-based transformers.js
 */
export class VectorStore {
  private embeddings: ChunkWithEmbedding[] = [];
  private apiEndpoint = import.meta.env.VITE_BACKEND_URL?.replace('/chat', '/embeddings') || 'http://localhost:3001/api/embeddings';

  /**
   * Generate embedding via server API
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: [text] })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Embedding API error: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      return data.embeddings[0];
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add chunks with embeddings to the store - SERVER-SIDE BATCH PROCESSING
   */
  async addChunks(chunks: DocumentChunk[], onProgress?: (current: number, total: number) => void): Promise<{
    embeddings: number[][];
  }> {
    console.log(`Generating embeddings for ${chunks.length} chunks via server...`);
    
    const generatedEmbeddings: number[][] = [];
    // REDUCED batch size from 50 to 10 to prevent overwhelming the browser
    const BATCH_SIZE = 10;
    
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batchChunks = chunks.slice(i, Math.min(i + BATCH_SIZE, chunks.length));
      const batchTexts = batchChunks.map(c => c.text);
      
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}...`);
      
      try {
        // Send batch to server with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout per batch
        
        const response = await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts: batchTexts }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(`Embedding API error: ${errorData.error || response.statusText}`);
        }

        const data = await response.json();
        
        // Store embeddings
        data.embeddings.forEach((embedding: number[], idx: number) => {
          const chunk = batchChunks[idx];
          this.embeddings.push({ ...chunk, embedding });
          generatedEmbeddings.push(embedding);
          
          if (onProgress) {
            onProgress(i + idx + 1, chunks.length);
          }
        });
        
        // INCREASED delay between batches from 500ms to 1000ms
        // This gives browser time to process and prevents freezing
        if (i + BATCH_SIZE < chunks.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Embedding generation timeout - server may be overloaded. Try uploading a smaller document.');
        }
        console.error(`Error processing batch:`, error);
        throw error;
      }
    }

    console.log(`✅ Generated ${generatedEmbeddings.length} embeddings`);
    return { embeddings: generatedEmbeddings };
  }

  /**
   * Load embeddings from pre-generated data (for IndexedDB restore)
   * This doesn't require the model to be initialized since we're just loading pre-computed embeddings
   */
  async loadEmbeddings(chunks: DocumentChunk[], embeddings: number[][]): Promise<void> {
    console.log(`Loading ${chunks.length} pre-generated embeddings...`);
    
    for (let i = 0; i < chunks.length; i++) {
      this.embeddings.push({
        ...chunks[i],
        embedding: embeddings[i],
      });
    }

    console.log(`✅ Loaded ${this.embeddings.length} embeddings into vector store (model not yet initialized)`);
  }

  /**
   * Search for similar chunks based on a query
   */
  async search(query: string, topK: number = 5, documentIds?: string[]): Promise<SearchResult[]> {
    if (this.embeddings.length === 0) {
      return [];
    }

    try {
      // Generate embedding for the query via server
      const queryEmbedding = await this.generateEmbedding(query);

      // Filter embeddings by document IDs if provided
      let filteredEmbeddings = this.embeddings;
      if (documentIds && documentIds.length > 0) {
        filteredEmbeddings = this.embeddings.filter(e => 
          documentIds.includes(e.documentId)
        );
      }

      if (filteredEmbeddings.length === 0) {
        return [];
      }

      // Calculate similarities
      const results: SearchResult[] = filteredEmbeddings.map(item => ({
        chunk: {
          text: item.text,
          pageNumber: item.pageNumber,
          chunkIndex: item.chunkIndex,
          documentId: item.documentId,
          documentName: item.documentName,
        },
        similarity: cosineSimilarity(queryEmbedding, item.embedding),
      }));

      // Sort by similarity (highest first) and return top K
      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);
    } catch (error) {
      console.error('Error searching vector store:', error);
      return [];
    }
  }

  /**
   * Remove chunks for a specific document
   */
  removeDocument(documentId: string): void {
    this.embeddings = this.embeddings.filter(e => e.documentId !== documentId);
    console.log(`Removed chunks for document ${documentId}`);
  }

  /**
   * Clear all embeddings
   */
  clear(): void {
    this.embeddings = [];
    console.log('Vector store cleared');
  }

  /**
   * Get the total number of chunks in the store
   */
  getSize(): number {
    return this.embeddings.length;
  }

  /**
   * Get all document IDs in the store
   */
  getDocumentIds(): string[] {
    return [...new Set(this.embeddings.map(e => e.documentId))];
  }
}

// Export a singleton instance
export const vectorStore = new VectorStore();
