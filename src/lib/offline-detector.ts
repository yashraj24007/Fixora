/**
 * Offline Detection and Network Status Manager
 */

type NetworkStatus = 'online' | 'offline' | 'slow';

interface NetworkInfo {
  status: NetworkStatus;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

class OfflineDetector {
  private listeners: Array<(status: NetworkStatus) => void> = [];
  private currentStatus: NetworkStatus = 'online';

  constructor() {
    this.init();
  }

  /**
   * Initialize network detection
   */
  private init() {
    // Initial check
    this.updateStatus();

    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Monitor connection quality if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        connection.addEventListener('change', () => this.updateStatus());
      }
    }

    // Periodic health check (every 30 seconds)
    setInterval(() => this.checkConnectivity(), 30000);
  }

  /**
   * Update current network status
   */
  private updateStatus() {
    const wasOffline = this.currentStatus === 'offline';
    
    if (!navigator.onLine) {
      this.currentStatus = 'offline';
    } else {
      // Check connection quality
      const connection = (navigator as any).connection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          this.currentStatus = 'slow';
        } else {
          this.currentStatus = 'online';
        }
      } else {
        this.currentStatus = 'online';
      }
    }

    // Notify listeners if status changed
    if (wasOffline && this.currentStatus !== 'offline') {
      this.notifyListeners();
      this.handleBackOnline();
    } else if (!wasOffline && this.currentStatus === 'offline') {
      this.notifyListeners();
    }
  }

  /**
   * Handle when connection comes back online
   */
  private handleOnline() {
    console.log('✅ Network connection restored');
    this.updateStatus();
  }

  /**
   * Handle when connection goes offline
   */
  private handleOffline() {
    console.log('❌ Network connection lost - switching to offline mode');
    this.updateStatus();
  }

  /**
   * Handle back online (sync data)
   */
  private async handleBackOnline() {
    console.log('🔄 Back online - syncing offline data...');
    
    try {
      // Sync any offline messages/data
      const { offlineStorage } = await import('./offline-storage');
      const unsyncedMessages = await offlineStorage.getUnsyncedMessages();
      
      if (unsyncedMessages.length > 0) {
        console.log(`📤 Syncing ${unsyncedMessages.length} offline messages...`);
        // Implement sync logic here
      }
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  }

  /**
   * Check actual connectivity with backend
   */
  private async checkConnectivity(): Promise<boolean> {
    if (!navigator.onLine) {
      this.currentStatus = 'offline';
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL?.replace('/api/chat', '') || 'http://localhost:3001'}/health`,
        {
          method: 'HEAD',
          signal: controller.signal,
          cache: 'no-store'
        }
      );

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      // Backend not reachable, but might still have internet
      return false;
    }
  }

  /**
   * Get current network status
   */
  getStatus(): NetworkStatus {
    return this.currentStatus;
  }

  /**
   * Check if currently offline
   */
  isOffline(): boolean {
    return this.currentStatus === 'offline';
  }

  /**
   * Check if connection is slow
   */
  isSlow(): boolean {
    return this.currentStatus === 'slow';
  }

  /**
   * Get detailed network information
   */
  getNetworkInfo(): NetworkInfo {
    const connection = (navigator as any).connection;
    
    return {
      status: this.currentStatus,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      saveData: connection?.saveData
    };
  }

  /**
   * Subscribe to network status changes
   */
  subscribe(callback: (status: NetworkStatus) => void) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentStatus));
  }

  /**
   * Show offline indicator
   */
  showOfflineIndicator() {
    // Create or update offline banner
    let banner = document.getElementById('offline-banner');
    
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'offline-banner';
      banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #f59e0b;
        color: white;
        padding: 8px 16px;
        text-align: center;
        z-index: 9999;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      `;
      document.body.prepend(banner);
    }

    if (this.currentStatus === 'offline') {
      banner.innerHTML = '🔌 You are offline - Using local data only';
      banner.style.background = '#ef4444';
    } else if (this.currentStatus === 'slow') {
      banner.innerHTML = '🐌 Slow connection detected - Limited functionality';
      banner.style.background = '#f59e0b';
    } else {
      banner.innerHTML = '✅ Back online - All features available';
      banner.style.background = '#10b981';
      setTimeout(() => banner?.remove(), 3000);
    }
  }

  /**
   * Hide offline indicator
   */
  hideOfflineIndicator() {
    const banner = document.getElementById('offline-banner');
    if (banner) {
      banner.remove();
    }
  }
}

// Export singleton instance
export const offlineDetector = new OfflineDetector();

// Auto-show indicators
offlineDetector.subscribe((status) => {
  if (status === 'offline' || status === 'slow') {
    offlineDetector.showOfflineIndicator();
  }
});
