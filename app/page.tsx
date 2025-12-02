'use client';

import React, { useState, useEffect } from 'react';
import { UserPreferences, ADMIN_API_KEY } from './lib/types';
import { getCurrentUserId, clearAuthData } from './lib/supabase';
import { getUserData } from './lib/database.service';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';

// Key for storing admin status in localStorage
const ADMIN_KEY_STORAGE = 'activeview_admin_key';

export default function Home() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      // Check for admin first
      const storedAdminKey = localStorage.getItem(ADMIN_KEY_STORAGE);
      if (storedAdminKey === ADMIN_API_KEY) {
        setPreferences({
          apiKey: ADMIN_API_KEY,
          favoriteTopics: [],
          onboardingComplete: true,
          isAdmin: true,
        });
        setIsLoading(false);
        return;
      }

      const userId = getCurrentUserId();
      
      if (userId) {
        try {
          const userData = await getUserData(userId);
          
          if (userData) {
            setPreferences({
              apiKey: userData.newsApiKey,
              favoriteTopics: userData.preferredTopics,
              onboardingComplete: true,
              isAdmin: false,
            });
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
      
      setIsLoading(false);
    };

    loadUserData();
  }, []);

  const handleOnboardingComplete = (newPreferences: UserPreferences) => {
    // If admin, store the admin key
    if (newPreferences.isAdmin) {
      localStorage.setItem(ADMIN_KEY_STORAGE, newPreferences.apiKey);
    }
    setPreferences(newPreferences);
  };

  const handleLogout = () => {
    clearAuthData();
    localStorage.removeItem(ADMIN_KEY_STORAGE);
    setPreferences(null);
  };

  const handleUpdatePreferences = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  // Show onboarding if not completed
  if (!preferences?.onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Show admin dashboard if admin
  if (preferences.isAdmin) {
    return <AdminDashboard apiKey={preferences.apiKey} onLogout={handleLogout} />;
  }

  // Show regular dashboard
  return (
    <Dashboard
      preferences={preferences}
      onLogout={handleLogout}
      onUpdatePreferences={handleUpdatePreferences}
    />
  );
}
