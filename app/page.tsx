'use client';

import React, { useState, useEffect } from 'react';
import { UserPreferences } from './lib/types';
import { getCurrentUserId, clearAuthData } from './lib/supabase';
import { getUserData } from './lib/database.service';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';

export default function Home() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      const userId = getCurrentUserId();
      
      if (userId) {
        try {
          const userData = await getUserData(userId);
          
          if (userData) {
            setPreferences({
              apiKey: userData.newsApiKey,
              favoriteTopics: userData.preferredTopics,
              onboardingComplete: true,
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
    setPreferences(newPreferences);
  };

  const handleLogout = () => {
    clearAuthData();
    setPreferences(null);
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

  // Show dashboard
  return <Dashboard preferences={preferences} onLogout={handleLogout} />;
}
