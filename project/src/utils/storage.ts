import { CallEntry, AppSettings } from '../types';

const STORAGE_KEYS = {
  CALL_ENTRIES: 'doctor-invoicing-entries',
  APP_SETTINGS: 'doctor-invoicing-settings',
} as const;

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  hourlyRate: 55.55,
  doctorInfo: {
    name: 'Dr. [Your Name]',
    address: '[Your Address]',
    phone: '[Your Phone]',
    email: '[Your Email]',
  },
};

export class StorageService {
  static saveCallEntries(entries: CallEntry[]): void {
    try {
      // Check if storage is available
      if (!this.isStorageAvailable()) {
        console.warn('Storage not available, data will not persist');
        return;
      }
      
      localStorage.setItem(STORAGE_KEYS.CALL_ENTRIES, JSON.stringify(entries));
    } catch (error) {
      console.error('Failed to save call entries:', error);
      // Try to free up space and retry
      this.cleanupOldData();
      try {
        localStorage.setItem(STORAGE_KEYS.CALL_ENTRIES, JSON.stringify(entries));
      } catch (retryError) {
        alert('Unable to save data. Storage may be full. Please clear browser data or export your entries.');
      }
    }
  }

  static loadCallEntries(): CallEntry[] {
    try {
      if (!this.isStorageAvailable()) {
        return [];
      }
      const stored = localStorage.getItem(STORAGE_KEYS.CALL_ENTRIES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load call entries:', error);
      return [];
    }
  }

  static saveSettings(settings: AppSettings): void {
    try {
      if (!this.isStorageAvailable()) {
        console.warn('Storage not available, settings will not persist');
        return;
      }
      localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Unable to save settings. Please check browser storage.');
    }
  }

  static loadSettings(): AppSettings {
    try {
      if (!this.isStorageAvailable()) {
        return DEFAULT_SETTINGS;
      }
      const stored = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  static exportData(): string {
    const entries = this.loadCallEntries();
    const settings = this.loadSettings();
    
    return JSON.stringify({
      entries,
      settings,
      exportDate: new Date().toISOString(),
    }, null, 2);
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.entries && Array.isArray(data.entries)) {
        this.saveCallEntries(data.entries);
      }
      
      if (data.settings) {
        this.saveSettings(data.settings);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  static clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CALL_ENTRIES);
      localStorage.removeItem(STORAGE_KEYS.APP_SETTINGS);
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }

  // Check if localStorage is available and working
  static isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Clean up old data to free space
  static cleanupOldData(): void {
    try {
      // Remove any old cache or temporary data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !Object.values(STORAGE_KEYS).includes(key as any)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
    }
  }
}