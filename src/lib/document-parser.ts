import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up the worker for PDF.js v5.x
// Use local worker file served from public directory for better reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

export interface DocumentChunk {
  text: string;
  pageNumber: number;
  chunkIndex: number;
  documentId: string;
  documentName: string;
}

export interface ParsedDocument {
  documentId: string;
  documentName: string;
  totalPages: number;
  fullText: string;
  chunks: DocumentChunk[];
  fileType: 'pdf' | 'docx' | 'doc' | 'txt';
}

/**
 * Extract text from a TXT file
 */
async function extractTextFromTXT(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text);
    };
    reader.onerror = () => reject(new Error('Failed to read TXT file'));
    reader.readAsText(file);
  });
}

/**
 * Extract text from a DOCX file
 */
async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    throw new Error(`Failed to extract text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text from a PDF file with timeout handling
 */
async function extractTextFromPDF(file: File): Promise<{ text: string; pages: number }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Add timeout wrapper for PDF loading (extended to 3 minutes for large files)
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await Promise.race([
      loadingTask.promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => {
          loadingTask.destroy();
          reject(new Error('PDF loading timeout (3 minutes) - file may be too large or corrupted'));
        }, 180000) // 3 minutes
      )
    ]);
    
    const totalPages = pdf.numPages;
    let fullText = '';

    // Extract text from each page with timeout per page
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        const page = await Promise.race([
          pdf.getPage(pageNum),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error(`Timeout extracting page ${pageNum}`)), 30000)
          )
        ]);
        
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += pageText + '\n\n';

        // CRITICAL: Yield to main thread every page with a longer delay
        // This prevents "Page Unresponsive" and "Out of Memory" errors
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Force garbage collection opportunity every 10 pages
        if (pageNum % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      } catch (pageError) {
        console.warn(`Warning: Could not extract page ${pageNum}:`, pageError);
        fullText += `[Page ${pageNum} extraction failed]\n\n`;
      }
    }

    if (fullText.trim().length === 0) {
      throw new Error('No text extracted from PDF - file may be scanned images or encrypted');
    }

    return { text: fullText, pages: totalPages };
  } catch (error) {
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Detect file type from file extension
 */
function getFileType(fileName: string): 'pdf' | 'docx' | 'doc' | 'txt' | 'unknown' {
  const extension = fileName.toLowerCase().split('.').pop();
  switch (extension) {
    case 'pdf':
      return 'pdf';
    case 'docx':
      return 'docx';
    case 'doc':
      return 'doc';
    case 'txt':
      return 'txt';
    default:
      return 'unknown';
  }
}

/**
 * Create chunks from text
 */
function createChunks(
  fullText: string,
  documentId: string,
  documentName: string,
  totalPages: number
): DocumentChunk[] {
  // REDUCED chunk size from 500 to 250 to process smaller pieces
  // This helps prevent memory issues and makes processing more manageable
  // Smaller chunks = more chunks but each is processed faster
  const CHUNK_SIZE = 250;
  const OVERLAP = 40; // Reduced overlap as well
  const chunks: DocumentChunk[] = [];
  
  // LIMIT: Maximum 500 chunks to prevent overwhelming the system
  const MAX_CHUNKS = 500;
  
  let chunkIndex = 0;
  let startIdx = 0;
  
  while (startIdx < fullText.length && chunkIndex < MAX_CHUNKS) {
    const endIdx = Math.min(startIdx + CHUNK_SIZE, fullText.length);
    const chunkText = fullText.substring(startIdx, endIdx);
    
    // Skip very short chunks (less than 50 characters)
    if (chunkText.trim().length < 50 && startIdx + CHUNK_SIZE < fullText.length) {
      startIdx = endIdx - OVERLAP;
      continue;
    }
    
    // Estimate page number based on position in document
    const pageNumber = Math.ceil((startIdx / fullText.length) * totalPages) || 1;
    
    chunks.push({
      text: chunkText.trim(),
      pageNumber,
      chunkIndex,
      documentId,
      documentName,
    });
    
    chunkIndex++;
    startIdx = endIdx - OVERLAP;
  }
  
  // Warn if we hit the max limit
  if (chunkIndex >= MAX_CHUNKS && startIdx < fullText.length) {
    console.warn(`⚠️ Document truncated: Only first ${MAX_CHUNKS} chunks processed. Consider uploading a smaller document.`);
  }
  
  return chunks;
}

/**
 * Main function to extract text from any supported document type
 */
export async function extractTextFromDocument(file: File): Promise<ParsedDocument> {
  const fileType = getFileType(file.name);
  
  if (fileType === 'unknown') {
    throw new Error(`Unsupported file type. Please upload PDF, DOCX, DOC, or TXT files.`);
  }

  let fullText = '';
  let totalPages = 1;

  try {
    switch (fileType) {
      case 'pdf': {
        const pdfResult = await extractTextFromPDF(file);
        fullText = pdfResult.text;
        totalPages = pdfResult.pages;
        break;
      }
      
      case 'docx':
      case 'doc': {
        fullText = await extractTextFromDOCX(file);
        // Estimate pages based on character count (avg 2000 chars per page)
        totalPages = Math.ceil(fullText.length / 2000) || 1;
        break;
      }
      
      case 'txt': {
        fullText = await extractTextFromTXT(file);
        // Estimate pages based on character count
        totalPages = Math.ceil(fullText.length / 2000) || 1;
        break;
      }
    }

    if (!fullText || fullText.trim().length === 0) {
      throw new Error('No text could be extracted from the document. The file might be empty or corrupted.');
    }

    // Generate document ID
    const documentId = `${file.name}-${Date.now()}`;

    // Create chunks from the text
    const chunks = createChunks(fullText, documentId, file.name, totalPages);

    return {
      documentId,
      documentName: file.name,
      totalPages,
      fullText,
      chunks,
      fileType,
    };
  } catch (error) {
    throw new Error(`Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Get supported file extensions
 */
export function getSupportedExtensions(): string[] {
  return ['pdf', 'docx', 'doc', 'txt'];
}

/**
 * Check if file type is supported
 */
export function isSupportedFileType(fileName: string): boolean {
  const fileType = getFileType(fileName);
  return fileType !== 'unknown';
}
