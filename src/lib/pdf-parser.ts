import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker for PDF.js v5.x
// Use local worker file served from public directory for better reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

export interface PDFChunk {
  text: string;
  pageNumber: number;
  chunkIndex: number;
  documentId: string;
  documentName: string;
}

export interface ParsedPDF {
  documentId: string;
  documentName: string;
  totalPages: number;
  fullText: string;
  chunks: PDFChunk[];
}

/**
 * Extract text from a PDF file
 */
export async function extractTextFromPDF(file: File): Promise<ParsedPDF> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;
    
    let fullText = '';
    const pageTexts: { pageNum: number; text: string }[] = [];

    // Extract text from each page
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      pageTexts.push({ pageNum, text: pageText });
      fullText += pageText + '\n\n';
    }

    // Generate document ID
    const documentId = `${file.name}-${Date.now()}`;

    // Create chunks from the text
    const chunks = createChunks(fullText, pageTexts, documentId, file.name);

    return {
      documentId,
      documentName: file.name,
      totalPages,
      fullText,
      chunks,
    };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Split text into chunks for embedding
 * Uses a sliding window approach to maintain context
 */
function createChunks(
  fullText: string,
  pageTexts: { pageNum: number; text: string }[],
  documentId: string,
  documentName: string
): PDFChunk[] {
  const chunks: PDFChunk[] = [];
  const chunkSize = 500; // characters per chunk
  const overlap = 100; // overlap between chunks to maintain context

  // Process each page
  pageTexts.forEach(({ pageNum, text }) => {
    if (!text.trim()) return;

    let startIndex = 0;
    let chunkIndex = 0;

    while (startIndex < text.length) {
      const endIndex = Math.min(startIndex + chunkSize, text.length);
      const chunkText = text.substring(startIndex, endIndex).trim();

      if (chunkText.length > 50) { // Only include meaningful chunks
        chunks.push({
          text: chunkText,
          pageNumber: pageNum,
          chunkIndex,
          documentId,
          documentName,
        });
        chunkIndex++;
      }

      // Move to next chunk with overlap
      startIndex += chunkSize - overlap;
    }
  });

  return chunks;
}

/**
 * Calculate similarity between two text strings using cosine similarity
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}
