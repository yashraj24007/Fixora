/**
 * Offline Storage Manager - IndexedDB wrapper for offline data
 */

const DB_NAME = 'FixoraOfflineDB';
const DB_VERSION = 1;

export interface OfflineMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  mode: 'local-model' | 'api';
  synced: boolean;
}

export interface OfflineDataset {
  id: string;
  problem: string;
  solution: string;
  vehicleCompany: string;
  category: string;
  lastUpdated: number;
}

class OfflineStorageManager {
  private db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Messages store
        if (!db.objectStoreNames.contains('messages')) {
          const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
          messageStore.createIndex('conversationId', 'conversationId', { unique: false });
          messageStore.createIndex('timestamp', 'timestamp', { unique: false });
          messageStore.createIndex('synced', 'synced', { unique: false });
        }

        // Dataset cache store
        if (!db.objectStoreNames.contains('dataset')) {
          const datasetStore = db.createObjectStore('dataset', { keyPath: 'id' });
          datasetStore.createIndex('category', 'category', { unique: false });
          datasetStore.createIndex('problem', 'problem', { unique: false });
        }

        // App settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Save message for offline use
   */
  async saveMessage(message: OfflineMessage): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['messages'], 'readwrite');
      const store = transaction.objectStore('messages');
      const request = store.put(message);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all messages for a conversation
   */
  async getMessages(conversationId: string): Promise<OfflineMessage[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['messages'], 'readonly');
      const store = transaction.objectStore('messages');
      const index = store.index('conversationId');
      const request = index.getAll(conversationId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Cache dataset locally
   */
  async cacheDataset(data: OfflineDataset[]): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['dataset'], 'readwrite');
      const store = transaction.objectStore('dataset');

      // Clear existing data
      store.clear();

      // Add new data
      data.forEach((item) => store.put(item));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Search dataset offline
   */
  async searchDataset(keyword: string): Promise<OfflineDataset[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['dataset'], 'readonly');
      const store = transaction.objectStore('dataset');
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result.filter((item: OfflineDataset) =>
          item.problem.toLowerCase().includes(keyword.toLowerCase()) ||
          item.solution.toLowerCase().includes(keyword.toLowerCase())
        );
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get unsynced messages
   */
  async getUnsyncedMessages(): Promise<OfflineMessage[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['messages'], 'readonly');
      const store = transaction.objectStore('messages');
      const request = store.getAll();

      request.onsuccess = () => {
        const unsynced = request.result.filter((msg: OfflineMessage) => !msg.synced);
        resolve(unsynced);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Mark message as synced
   */
  async markSynced(messageId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['messages'], 'readwrite');
      const store = transaction.objectStore('messages');
      const getRequest = store.get(messageId);

      getRequest.onsuccess = () => {
        const message = getRequest.result;
        if (message) {
          message.synced = true;
          const putRequest = store.put(message);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Clear all offline data
   */
  async clearAll(): Promise<void> {
    if (!this.db) await this.init();

    const stores = ['messages', 'dataset', 'settings'];
    const promises = stores.map((storeName) => {
      return new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });

    await Promise.all(promises);
  }

  /**
   * Get database size (approximate)
   */
  async getStorageSize(): Promise<number> {
    if (!this.db) await this.init();

    let totalSize = 0;
    const stores = ['messages', 'dataset', 'settings'];

    for (const storeName of stores) {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      const data = await new Promise<any[]>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      // Rough estimation: JSON.stringify size
      totalSize += JSON.stringify(data).length;
    }

    return totalSize;
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorageManager();
