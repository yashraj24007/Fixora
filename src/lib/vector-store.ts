import { pipeline, env } from '@xenova/transformers';
import { DocumentChunk } from './document-parser';

// Configure transformers to use local models
env.allowLocalModels = false;
env.allowRemoteModels = true;

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
 */
export class VectorStore {
  private embeddings: ChunkWithEmbedding[] = [];
  private embeddingPipeline: any = null;
  private isInitialized = false;

  /**
   * Initialize the embedding model with retry logic
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Loading embedding model... (attempt ${attempt}/${maxRetries})`);
        
        // Add timeout to model loading
        const modelPromise = pipeline(
          'feature-extraction',
          'Xenova/all-MiniLM-L6-v2'
        );
        
        this.embeddingPipeline = await Promise.race([
          modelPromise,
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Model loading timeout (120s) - check your internet connection')), 120000)
          )
        ]);
        
        this.isInitialized = true;
        console.log('✅ Embedding model loaded successfully');
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`Attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < maxRetries) {
          console.log(`Retrying in ${attempt * 2} seconds...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
        }
      }
    }

    throw new Error(`Failed to initialize embedding model after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Generate embedding for a text string with retry logic
   */
  async generateEmbedding(text: string, maxRetries: number = 3): Promise<number[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Add timeout to embedding generation
        const embeddingPromise = this.embeddingPipeline(text, {
          pooling: 'mean',
          normalize: true,
        });

        const output = await Promise.race([
          embeddingPromise,
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Embedding generation timeout (30s)')), 30000)
          )
        ]);

        // Convert tensor to array
        return Array.from(output.data);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`Embedding attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    throw new Error(`Failed to generate embedding after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Add chunks with embeddings to the store
   */
  async addChunks(chunks: DocumentChunk[], onProgress?: (current: number, total: number) => void): Promise<{
    embeddings: number[][];
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log(`Generating embeddings for ${chunks.length} chunks...`);
    
    const generatedEmbeddings: number[][] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        const embedding = await this.generateEmbedding(chunk.text);
        
        this.embeddings.push({
          ...chunk,
          embedding,
        });

        generatedEmbeddings.push(embedding);

        if (onProgress) {
          onProgress(i + 1, chunks.length);
        }
      } catch (error) {
        console.error(`Error processing chunk ${i}:`, error);
        // Continue with other chunks even if one fails
      }
    }

    console.log(`Successfully added ${this.embeddings.length} chunks to vector store`);
    
    return { embeddings: generatedEmbeddings };
  }

  /**
   * Load embeddings from pre-generated data (for IndexedDB restore)
   */
  async loadEmbeddings(chunks: DocumentChunk[], embeddings: number[][]): Promise<void> {
    console.log(`Loading ${chunks.length} pre-generated embeddings...`);
    
    for (let i = 0; i < chunks.length; i++) {
      this.embeddings.push({
        ...chunks[i],
        embedding: embeddings[i],
      });
    }

    console.log(`✅ Loaded ${this.embeddings.length} embeddings into vector store`);
  }

  /**
   * Search for similar chunks based on a query
   */
  async search(query: string, topK: number = 5, documentIds?: string[]): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.embeddings.length === 0) {
      return [];
    }

    try {
      // Generate embedding for the query
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
