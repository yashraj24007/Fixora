/**
 * IndexedDB Storage for Persistent PDF Documents
 * Stores uploaded PDFs, their embeddings, and metadata
 */

import { DocumentChunk } from './document-parser';

const DB_NAME = 'FixoraDB';
const DB_VERSION = 1;
const DOCUMENTS_STORE = 'documents';
const EMBEDDINGS_STORE = 'embeddings';
const CHUNKS_STORE = 'chunks';

interface StoredDocument {
  documentId: string;
  name: string;
  fileData: ArrayBuffer;
  fileType: string;
  uploadDate: string;
  totalPages: number;
  chunksCount: number;
  size: number;
}

interface StoredEmbedding {
  chunkId: string;
  documentId: string;
  embedding: number[];
}

interface StoredChunk extends DocumentChunk {
  chunkId: string;
}

/**
 * Initialize IndexedDB
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create documents store
      if (!db.objectStoreNames.contains(DOCUMENTS_STORE)) {
        const documentsStore = db.createObjectStore(DOCUMENTS_STORE, { keyPath: 'documentId' });
        documentsStore.createIndex('name', 'name', { unique: false });
        documentsStore.createIndex('uploadDate', 'uploadDate', { unique: false });
      }

      // Create embeddings store
      if (!db.objectStoreNames.contains(EMBEDDINGS_STORE)) {
        const embeddingsStore = db.createObjectStore(EMBEDDINGS_STORE, { keyPath: 'chunkId' });
        embeddingsStore.createIndex('documentId', 'documentId', { unique: false });
      }

      // Create chunks store
      if (!db.objectStoreNames.contains(CHUNKS_STORE)) {
        const chunksStore = db.createObjectStore(CHUNKS_STORE, { keyPath: 'chunkId' });
        chunksStore.createIndex('documentId', 'documentId', { unique: false });
      }
    };
  });
}

/**
 * Save document to IndexedDB
 */
export async function saveDocument(
  file: File,
  documentId: string,
  totalPages: number,
  chunksCount: number
): Promise<void> {
  const db = await openDB();
  const arrayBuffer = await file.arrayBuffer();

  const documentData: StoredDocument = {
    documentId,
    name: file.name,
    fileData: arrayBuffer,
    fileType: file.type,
    uploadDate: new Date().toISOString(),
    totalPages,
    chunksCount,
    size: file.size,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([DOCUMENTS_STORE], 'readwrite');
    const store = transaction.objectStore(DOCUMENTS_STORE);
    const request = store.put(documentData);

    request.onsuccess = () => {
      console.log(`✅ Document ${file.name} saved to IndexedDB`);
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save chunks to IndexedDB
 */
export async function saveChunks(chunks: DocumentChunk[]): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CHUNKS_STORE], 'readwrite');
    const store = transaction.objectStore(CHUNKS_STORE);

    let completed = 0;
    const total = chunks.length;

    chunks.forEach((chunk, index) => {
      const storedChunk: StoredChunk = {
        ...chunk,
        chunkId: `${chunk.documentId}-chunk-${index}`,
      };

      const request = store.put(storedChunk);
      request.onsuccess = () => {
        completed++;
        if (completed === total) {
          console.log(`✅ ${total} chunks saved to IndexedDB`);
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  });
}

/**
 * Save embeddings to IndexedDB
 */
export async function saveEmbeddings(
  chunks: DocumentChunk[],
  embeddings: number[][]
): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([EMBEDDINGS_STORE], 'readwrite');
    const store = transaction.objectStore(EMBEDDINGS_STORE);

    let completed = 0;
    const total = embeddings.length;

    embeddings.forEach((embedding, index) => {
      const storedEmbedding: StoredEmbedding = {
        chunkId: `${chunks[index].documentId}-chunk-${index}`,
        documentId: chunks[index].documentId,
        embedding,
      };

      const request = store.put(storedEmbedding);
      request.onsuccess = () => {
        completed++;
        if (completed === total) {
          console.log(`✅ ${total} embeddings saved to IndexedDB`);
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  });
}

/**
 * Load all documents from IndexedDB
 */
export async function loadDocuments(): Promise<StoredDocument[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([DOCUMENTS_STORE], 'readonly');
    const store = transaction.objectStore(DOCUMENTS_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const documents = request.result || [];
      console.log(`📂 Loaded ${documents.length} documents from IndexedDB`);
      resolve(documents);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Load chunks for a specific document
 */
export async function loadChunksForDocument(documentId: string): Promise<StoredChunk[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CHUNKS_STORE], 'readonly');
    const store = transaction.objectStore(CHUNKS_STORE);
    const index = store.index('documentId');
    const request = index.getAll(documentId);

    request.onsuccess = () => {
      resolve(request.result || []);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Load embeddings for a specific document
 */
export async function loadEmbeddingsForDocument(documentId: string): Promise<StoredEmbedding[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([EMBEDDINGS_STORE], 'readonly');
    const store = transaction.objectStore(EMBEDDINGS_STORE);
    const index = store.index('documentId');
    const request = index.getAll(documentId);

    request.onsuccess = () => {
      resolve(request.result || []);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete document and its associated data
 */
export async function deleteDocument(documentId: string): Promise<void> {
  const db = await openDB();

  // Delete from all stores
  const promises = [
    deleteFromStore(db, DOCUMENTS_STORE, documentId),
    deleteByIndex(db, CHUNKS_STORE, 'documentId', documentId),
    deleteByIndex(db, EMBEDDINGS_STORE, 'documentId', documentId),
  ];

  await Promise.all(promises);
  console.log(`🗑️ Document ${documentId} deleted from IndexedDB`);
}

function deleteFromStore(db: IDBDatabase, storeName: string, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function deleteByIndex(
  db: IDBDatabase,
  storeName: string,
  indexName: string,
  value: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.openCursor(IDBKeyRange.only(value));

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all data from IndexedDB
 */
export async function clearAllData(): Promise<void> {
  const db = await openDB();

  const promises = [
    clearStore(db, DOCUMENTS_STORE),
    clearStore(db, CHUNKS_STORE),
    clearStore(db, EMBEDDINGS_STORE),
  ];

  await Promise.all(promises);
  console.log('🗑️ All data cleared from IndexedDB');
}

function clearStore(db: IDBDatabase, storeName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get storage usage statistics
 */
export async function getStorageStats(): Promise<{
  documentsCount: number;
  chunksCount: number;
  embeddingsCount: number;
  estimatedSize: string;
}> {
  const db = await openDB();

  const [documentsCount, chunksCount, embeddingsCount] = await Promise.all([
    countRecords(db, DOCUMENTS_STORE),
    countRecords(db, CHUNKS_STORE),
    countRecords(db, EMBEDDINGS_STORE),
  ]);

  // Estimate size (very rough)
  const estimatedBytes = documentsCount * 1024 * 1024 + chunksCount * 1024 + embeddingsCount * 2048;
  const estimatedSize = formatBytes(estimatedBytes);

  return {
    documentsCount,
    chunksCount,
    embeddingsCount,
    estimatedSize,
  };
}

function countRecords(db: IDBDatabase, storeName: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.count();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}
