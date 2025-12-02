'use client';

import React, { useState, useEffect } from 'react';
import { UserPreferences } from './lib/types';
import { getPreferences, savePreferences } from './lib/storage';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';

export default function Home() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences on mount
  useEffect(() => {
    const stored = getPreferences();
    if (stored.onboardingComplete) {
      setPreferences(stored);
    }
    setIsLoading(false);
  }, []);

  const handleOnboardingComplete = (newPreferences: UserPreferences) => {
    savePreferences(newPreferences);
    setPreferences(newPreferences);
  };

  const handleLogout = () => {
    setPreferences(null);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse">
          <div className="w-32 h-8 bg-[var(--surface)] rounded-lg" />
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
