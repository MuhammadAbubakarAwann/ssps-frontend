interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  duration?: number; // in milliseconds
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
}

class CacheManager {
  private memoryCache = new Map<string, CacheItem<any>>();
  private defaultDuration = 5 * 60 * 1000; // 5 minutes

  private getStorage(type: 'localStorage' | 'sessionStorage'): Storage | null {
    if (typeof window === 'undefined') return null;
    return type === 'localStorage' ? window.localStorage : window.sessionStorage;
  }

  set<T>(key: string, data: T, config: CacheConfig = {}): void {
    const duration = config.duration || this.defaultDuration;
    const storage = config.storage || 'memory';
    const now = Date.now();
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt: now + duration
    };

    if (storage === 'memory') 
      this.memoryCache.set(key, cacheItem);
     else {
      const storageObj = this.getStorage(storage);
      if (storageObj) 
        try {
          storageObj.setItem(`cache_${key}`, JSON.stringify(cacheItem));
        } catch (error) {
          console.warn('Failed to store in', storage, error);
          // Fallback to memory
          this.memoryCache.set(key, cacheItem);
        }
      
    }
  }

  get<T>(key: string, config: CacheConfig = {}): T | null {
    const storage = config.storage || 'memory';
    let cacheItem: CacheItem<T> | null = null;

    if (storage === 'memory') 
      cacheItem = this.memoryCache.get(key) || null;
     else {
      const storageObj = this.getStorage(storage);
      if (storageObj) 
        try {
          const stored = storageObj.getItem(`cache_${key}`);
          if (stored) 
            cacheItem = JSON.parse(stored);
          
        } catch (error) {
          console.warn('Failed to read from', storage, error);
        }
      
    }

    if (!cacheItem) return null;

    const now = Date.now();
    if (now > cacheItem.expiresAt) {
      // Cache expired
      this.remove(key, config);
      return null;
    }

    return cacheItem.data;
  }

  remove(key: string, config: CacheConfig = {}): void {
    const storage = config.storage || 'memory';

    if (storage === 'memory') 
      this.memoryCache.delete(key);
     else {
      const storageObj = this.getStorage(storage);
      if (storageObj) 
        storageObj.removeItem(`cache_${key}`);
      
    }
  }

  clear(config: CacheConfig = {}): void {
    const storage = config.storage || 'memory';

    if (storage === 'memory') 
      this.memoryCache.clear();
     else {
      const storageObj = this.getStorage(storage);
      if (storageObj) {
        const keys = Object.keys(storageObj);
        keys.forEach(key => {
          if (key.startsWith('cache_')) 
            storageObj.removeItem(key);
          
        });
      }
    }
  }

  isExpired(key: string, config: CacheConfig = {}): boolean {
    const storage = config.storage || 'memory';
    let cacheItem: CacheItem<any> | null = null;

    if (storage === 'memory') 
      cacheItem = this.memoryCache.get(key) || null;
     else {
      const storageObj = this.getStorage(storage);
      if (storageObj) 
        try {
          const stored = storageObj.getItem(`cache_${key}`);
          if (stored) 
            cacheItem = JSON.parse(stored);
          
        } catch (error) {
          return true; // Consider as expired if can't read
        }
      
    }

    if (!cacheItem) return true;

    return Date.now() > cacheItem.expiresAt;
  }
}

// Export a singleton instance
export const cacheManager = new CacheManager();

// Helper functions for specific use cases
export const restaurantCache = {
  setData: (key: string, data: any) => 
    cacheManager.set(`restaurants_${key}`, data, { storage: 'sessionStorage' }),
  getData: <T>(key: string): T | null => 
    cacheManager.get<T>(`restaurants_${key}`, { storage: 'sessionStorage' }),
  setStats: (stats: any) => 
    cacheManager.set('restaurants_stats', stats, { storage: 'sessionStorage' }),
  getStats: () => 
    cacheManager.get('restaurants_stats', { storage: 'sessionStorage' }),
  clear: () => 
    cacheManager.clear({ storage: 'sessionStorage' }),
  clearTabData: (tab: string) => {
    // Clear all cached data for a specific tab
    if (typeof window !== 'undefined') {
      const storage = window.sessionStorage;
      const keys = Object.keys(storage);
      keys.forEach(key => {
        if (key.startsWith('cache_restaurants_') && key.includes(`_${tab}_`)) {
          storage.removeItem(key);
        }
      });
    }
  }
};

export const orderCache = {
  setData: (key: string, data: any) => 
    cacheManager.set(`orders_${key}`, data, { storage: 'sessionStorage' }),
  getData: <T>(key: string): T | null => 
    cacheManager.get<T>(`orders_${key}`, { storage: 'sessionStorage' }),
  setStats: (stats: any) => 
    cacheManager.set('orders_stats', stats, { storage: 'sessionStorage' }),
  getStats: () => 
    cacheManager.get('orders_stats', { storage: 'sessionStorage' }),
  clear: () => 
    cacheManager.clear({ storage: 'sessionStorage' })
};

export const riderCache = {
  setData: (key: string, data: any) => 
    cacheManager.set(`riders_${key}`, data, { storage: 'sessionStorage' }),
  getData: <T>(key: string): T | null => 
    cacheManager.get<T>(`riders_${key}`, { storage: 'sessionStorage' }),
  setStats: (stats: any) => 
    cacheManager.set('riders_stats', stats, { storage: 'sessionStorage' }),
  getStats: () => 
    cacheManager.get('riders_stats', { storage: 'sessionStorage' }),
  clear: () => 
    cacheManager.clear({ storage: 'sessionStorage' }),
  clearTabData: (tab: string) => {
    // Clear all cached data for a specific tab
    if (typeof window !== 'undefined') {
      const storage = window.sessionStorage;
      const keys = Object.keys(storage);
      keys.forEach(key => {
        if (key.startsWith('cache_riders_') && key.includes(`_${tab}_`)) {
          storage.removeItem(key);
        }
      });
    }
  }
};