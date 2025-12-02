import { UserPreferences, Collection, STORAGE_KEYS } from './types';

// Default preferences
const defaultPreferences: UserPreferences = {
  apiKey: '',
  favoriteTopics: [],
  onboardingComplete: false,
};

// Helper to check if we're on the client
const isClient = typeof window !== 'undefined';

// Get preferences from localStorage
export function getPreferences(): UserPreferences {
  if (!isClient) return defaultPreferences;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading preferences:', error);
  }
  return defaultPreferences;
}

// Save preferences to localStorage
export function savePreferences(preferences: UserPreferences): void {
  if (!isClient) return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
}

// Get collections from localStorage
export function getCollections(): Collection[] {
  if (!isClient) return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading collections:', error);
  }
  return [];
}

// Save collections to localStorage
export function saveCollections(collections: Collection[]): void {
  if (!isClient) return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
  } catch (error) {
    console.error('Error saving collections:', error);
  }
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Clear all data (for logout/reset)
export function clearAllData(): void {
  if (!isClient) return;
  
  try {
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    localStorage.removeItem(STORAGE_KEYS.COLLECTIONS);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}

