import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for localStorage with automatic sync
 * @param {string} key - localStorage key
 * @param {any} initialValue - default value if key doesn't exist
 */
export function useLocalStorage(key, initialValue) {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Save to localStorage whenever value changes
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Update state if localStorage changes in another tab
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}

/**
 * Hook for kid profile management
 */
export function useKidProfile() {
  const [profile, setProfile] = useLocalStorage('kidProfile', {
    name: '',
    avatar: 'panda',
    createdAt: null
  });

  const updateProfile = useCallback((updates) => {
    setProfile(prev => ({
      ...prev,
      ...updates,
      createdAt: prev.createdAt || new Date().toISOString()
    }));
  }, [setProfile]);

  const isProfileComplete = profile.name && profile.avatar;

  return { profile, updateProfile, isProfileComplete };
}

/**
 * Hook for user preferences (autosave)
 */
export function usePreferences() {
  const [preferences, setPreferences] = useLocalStorage('userPreferences', {
    lastSubject: '',
    lastUnits: [],
    lastQuestionCount: 10,
    lastGame: 'quiz'
  });

  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, [setPreferences]);

  return { preferences, updatePreference, setPreferences };
}

/**
 * Hook for game statistics
 */
export function useGameStats() {
  const [stats, setStats] = useLocalStorage('gameStats', {
    quiz: { played: 0, bestScore: 0 },
    wordSearch: { played: 0, bestScore: 0 },
    swipe: { played: 0, bestScore: 0 },
    bubble: { played: 0, bestScore: 0 }
  });

  const recordGameResult = useCallback((gameId, score) => {
    setStats(prev => ({
      ...prev,
      [gameId]: {
        played: (prev[gameId]?.played || 0) + 1,
        bestScore: Math.max(prev[gameId]?.bestScore || 0, score)
      }
    }));
  }, [setStats]);

  return { stats, recordGameResult };
}

/**
 * Generate a simple unique ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Hook for managing multiple kid profiles
 */
export function useProfiles() {
  const [profiles, setProfiles] = useLocalStorage('kidProfiles', []);
  const [activeId, setActiveId] = useLocalStorage('activeProfileId', null);

  // Create a new profile
  const createProfile = useCallback((name, avatar) => {
    const newProfile = {
      id: generateId(),
      name,
      avatar,
      createdAt: new Date().toISOString()
    };
    setProfiles(prev => [...prev, newProfile]);
    setActiveId(newProfile.id);
    return newProfile;
  }, [setProfiles, setActiveId]);

  // Update an existing profile
  const updateProfile = useCallback((id, updates) => {
    setProfiles(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  }, [setProfiles]);

  // Delete a profile
  const deleteProfile = useCallback((id) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    // Clear profile-specific data
    try {
      window.localStorage.removeItem(`kidData_${id}`);
    } catch (e) {
      console.warn('Error clearing profile data:', e);
    }
    // Switch to another profile if deleting active
    if (activeId === id) {
      setProfiles(prev => {
        const remaining = prev.filter(p => p.id !== id);
        if (remaining.length > 0) {
          setActiveId(remaining[0].id);
        } else {
          setActiveId(null);
        }
        return remaining;
      });
    }
  }, [setProfiles, activeId, setActiveId]);

  // Switch active profile
  const switchProfile = useCallback((id) => {
    setActiveId(id);
  }, [setActiveId]);

  // Get the active profile object
  const activeProfile = profiles.find(p => p.id === activeId) || null;

  return {
    profiles,
    activeProfile,
    activeId,
    createProfile,
    updateProfile,
    deleteProfile,
    switchProfile
  };
}

/**
 * Hook for profile-scoped data storage
 * Stores data in kidData_{profileId} namespace
 */
export function useProfileData(profileId, defaultData = {}) {
  const storageKey = profileId ? `kidData_${profileId}` : 'kidData_guest';
  const [data, setData] = useLocalStorage(storageKey, defaultData);

  const updateData = useCallback((updates) => {
    setData(prev => ({ ...prev, ...updates }));
  }, [setData]);

  return { data, updateData, setData };
}
