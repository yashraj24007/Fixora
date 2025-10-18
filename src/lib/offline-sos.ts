/**
 * Offline SOS Emergency Service Locator
 * Shows nearby service centers/mechanics based on GPS location
 * Works completely offline with pre-loaded data
 */

import { offlineStorage } from './offline-storage';

export interface ServiceCenter {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  services: string[];
  latitude: number;
  longitude: number;
  distance?: number; // Calculated distance from user
  isEmergency: boolean;
  rating?: number;
  hours?: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

class OfflineSOSManager {
  private serviceCenters: ServiceCenter[] = [];
  private userLocation: UserLocation | null = null;

  /**
   * Initialize with pre-loaded service centers data
   */
  async init(): Promise<void> {
    // Load service centers from IndexedDB or use default data
    await this.loadServiceCenters();
  }

  /**
   * Load service centers data (offline-first)
   */
  private async loadServiceCenters(): Promise<void> {
    try {
      // Try to load from IndexedDB first
      const cached = await this.getCachedServiceCenters();
      
      if (cached && cached.length > 0) {
        this.serviceCenters = cached;
        console.log(`✅ Loaded ${cached.length} service centers from cache`);
        return;
      }

      // Fallback to bundled default data
      this.serviceCenters = this.getDefaultServiceCenters();
      
      // Cache for future use
      await this.cacheServiceCenters(this.serviceCenters);
      console.log(`✅ Cached ${this.serviceCenters.length} default service centers`);
    } catch (error) {
      console.error('Failed to load service centers:', error);
      this.serviceCenters = this.getDefaultServiceCenters();
    }
  }

  /**
   * Get cached service centers from IndexedDB
   */
  private async getCachedServiceCenters(): Promise<ServiceCenter[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['serviceCenters'], 'readonly');
      const store = transaction.objectStore('serviceCenters');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Cache service centers to IndexedDB
   */
  private async cacheServiceCenters(centers: ServiceCenter[]): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['serviceCenters'], 'readwrite');
      const store = transaction.objectStore('serviceCenters');

      store.clear();
      centers.forEach(center => store.put(center));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Open IndexedDB
   */
  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('FixoraOfflineDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('serviceCenters')) {
          const store = db.createObjectStore('serviceCenters', { keyPath: 'id' });
          store.createIndex('city', 'city', { unique: false });
          store.createIndex('state', 'state', { unique: false });
          store.createIndex('isEmergency', 'isEmergency', { unique: false });
        }
      };
    });
  }

  /**
   * Get user's current location (GPS)
   */
  async getUserLocation(): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          resolve(this.userLocation);
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000 // Cache for 1 minute
        }
      );
    });
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Find nearest service centers
   */
  async findNearestCenters(maxResults: number = 5): Promise<ServiceCenter[]> {
    if (!this.userLocation) {
      await this.getUserLocation();
    }

    if (!this.userLocation) {
      throw new Error('Unable to get user location');
    }

    // Calculate distances
    const centersWithDistance = this.serviceCenters.map((center) => ({
      ...center,
      distance: this.calculateDistance(
        this.userLocation!.latitude,
        this.userLocation!.longitude,
        center.latitude,
        center.longitude
      )
    }));

    // Sort by distance
    centersWithDistance.sort((a, b) => a.distance! - b.distance!);

    // Return top N results
    return centersWithDistance.slice(0, maxResults);
  }

  /**
   * Find emergency service centers only
   */
  async findEmergencyServices(maxResults: number = 3): Promise<ServiceCenter[]> {
    const nearest = await this.findNearestCenters(20);
    return nearest
      .filter(center => center.isEmergency)
      .slice(0, maxResults);
  }

  /**
   * Search service centers by city/state
   */
  searchByLocation(city?: string, state?: string): ServiceCenter[] {
    return this.serviceCenters.filter(center => {
      const matchCity = !city || center.city.toLowerCase().includes(city.toLowerCase());
      const matchState = !state || center.state.toLowerCase().includes(state.toLowerCase());
      return matchCity && matchState;
    });
  }

  /**
   * Get default service centers data (bundled with app)
   * This data will be available offline
   */
  private getDefaultServiceCenters(): ServiceCenter[] {
    return [
      // Major cities in India with service centers
      {
        id: 'sc-001',
        name: 'Maruti Suzuki Arena Service Center',
        address: 'MG Road, Sector 14',
        city: 'Bangalore',
        state: 'Karnataka',
        phone: '+91-80-2555-1234',
        services: ['Brake Service', 'Engine Repair', 'Oil Change', 'Tire Service'],
        latitude: 12.9716,
        longitude: 77.5946,
        isEmergency: true,
        rating: 4.5,
        hours: '24/7'
      },
      {
        id: 'sc-002',
        name: 'Hyundai Service Center',
        address: 'Whitefield Main Road',
        city: 'Bangalore',
        state: 'Karnataka',
        phone: '+91-80-4000-5678',
        services: ['AC Repair', 'Electrical', 'General Service'],
        latitude: 12.9698,
        longitude: 77.7499,
        isEmergency: false,
        rating: 4.2,
        hours: '9 AM - 7 PM'
      },
      {
        id: 'sc-003',
        name: 'Honda Authorized Service',
        address: 'Andheri East',
        city: 'Mumbai',
        state: 'Maharashtra',
        phone: '+91-22-6789-1234',
        services: ['Brake Service', 'Transmission', 'Suspension'],
        latitude: 19.1136,
        longitude: 72.8697,
        isEmergency: true,
        rating: 4.7,
        hours: '24/7'
      },
      {
        id: 'sc-004',
        name: 'Tata Motors Service Point',
        address: 'Connaught Place',
        city: 'Delhi',
        state: 'Delhi',
        phone: '+91-11-4567-8901',
        services: ['Engine Repair', 'Battery', 'Coolant Service'],
        latitude: 28.6139,
        longitude: 77.2090,
        isEmergency: true,
        rating: 4.3,
        hours: '24/7'
      },
      {
        id: 'sc-005',
        name: 'Mahindra Service Center',
        address: 'Park Street',
        city: 'Kolkata',
        state: 'West Bengal',
        phone: '+91-33-2222-3456',
        services: ['4x4 Service', 'Tire Service', 'Oil Change'],
        latitude: 22.5726,
        longitude: 88.3639,
        isEmergency: false,
        rating: 4.0,
        hours: '8 AM - 8 PM'
      },
      {
        id: 'sc-006',
        name: 'Ford Authorized Workshop',
        address: 'Anna Salai',
        city: 'Chennai',
        state: 'Tamil Nadu',
        phone: '+91-44-3456-7890',
        services: ['Brake Service', 'Engine', 'Electrical'],
        latitude: 13.0827,
        longitude: 80.2707,
        isEmergency: true,
        rating: 4.4,
        hours: '24/7'
      },
      {
        id: 'sc-007',
        name: 'Volkswagen Service',
        address: 'Banjara Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        phone: '+91-40-1234-5678',
        services: ['Transmission', 'AC Repair', 'General Service'],
        latitude: 17.3850,
        longitude: 78.4867,
        isEmergency: false,
        rating: 4.6,
        hours: '9 AM - 6 PM'
      },
      {
        id: 'sc-008',
        name: 'Renault Service Center',
        address: 'Satellite',
        city: 'Ahmedabad',
        state: 'Gujarat',
        phone: '+91-79-9876-5432',
        services: ['Brake Service', 'Suspension', 'Oil Change'],
        latitude: 23.0225,
        longitude: 72.5714,
        isEmergency: true,
        rating: 4.1,
        hours: '24/7'
      },
      {
        id: 'sc-009',
        name: 'Kia Motors Service',
        address: 'Koregaon Park',
        city: 'Pune',
        state: 'Maharashtra',
        phone: '+91-20-5555-6789',
        services: ['Engine Repair', 'Electrical', 'Battery'],
        latitude: 18.5204,
        longitude: 73.8567,
        isEmergency: false,
        rating: 4.5,
        hours: '9 AM - 7 PM'
      },
      {
        id: 'sc-010',
        name: 'Nissan Authorized Center',
        address: 'Civil Lines',
        city: 'Jaipur',
        state: 'Rajasthan',
        phone: '+91-141-2222-3333',
        services: ['Tire Service', 'AC Repair', 'General Service'],
        latitude: 26.9124,
        longitude: 75.7873,
        isEmergency: true,
        rating: 4.3,
        hours: '24/7'
      }
    ];
  }

  /**
   * Generate directions URL (works offline if maps app is installed)
   */
  getDirectionsUrl(center: ServiceCenter): string {
    if (!this.userLocation) {
      return `https://www.google.com/maps/search/?api=1&query=${center.latitude},${center.longitude}`;
    }

    return `https://www.google.com/maps/dir/?api=1&origin=${this.userLocation.latitude},${this.userLocation.longitude}&destination=${center.latitude},${center.longitude}`;
  }

  /**
   * Call service center (opens dialer)
   */
  callServiceCenter(phone: string): void {
    window.location.href = `tel:${phone}`;
  }
}

// Export singleton instance
export const sosManager = new OfflineSOSManager();
