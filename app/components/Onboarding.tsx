'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { UserPreferences, DEFAULT_TOPICS } from '../lib/types';
import { validateApiKey } from '../lib/api';
import { setCurrentUserId } from '../lib/supabase';
import { createOrLoginUser, updatePreferredTopics, getUserData } from '../lib/database.service';
import { KeyIcon, SparklesIcon, ArrowRightIcon, CheckIcon, LoaderIcon } from './Icons';

interface OnboardingProps {
  onComplete: (preferences: UserPreferences) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [apiKey, setApiKey] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleApiKeySubmit = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your API key');
      return;
    }

    setIsValidating(true);
    setError('');

    const isValid = await validateApiKey(apiKey.trim());

    if (!isValid) {
      setError('Invalid API key. Please check and try again.');
      setIsValidating(false);
      return;
    }

    // Try to create or login user
    const { userId, isNewUser } = await createOrLoginUser(apiKey.trim());

    if (!userId) {
      setError('Failed to connect. Please try again.');
      setIsValidating(false);
      return;
    }

    // Save user ID locally
    setCurrentUserId(userId);

    if (isNewUser) {
      // New user - go to topics selection
      setIsValidating(false);
      setStep(2);
    } else {
      // Existing user - get their data and complete login
      const userData = await getUserData(userId);
      
      if (userData && userData.preferredTopics.length > 0) {
        // User has topics, complete login immediately
        onComplete({
          apiKey: apiKey.trim(),
          favoriteTopics: userData.preferredTopics,
          onboardingComplete: true,
        });
      } else {
        // User exists but no topics, show topics step
        setIsValidating(false);
        setStep(2);
      }
    }
  };

  const handleComplete = async () => {
    if (selectedTopics.length === 0) {
      setError('Please select at least one topic');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      // Get the user ID we saved earlier
      const storedUserId = localStorage.getItem('activeview_user_id');
      
      if (!storedUserId) {
        setError('Session expired. Please try again.');
        setStep(1);
        setIsValidating(false);
        return;
      }

      // Update preferred topics
      await updatePreferredTopics(storedUserId, selectedTopics);

      // Complete onboarding
      onComplete({
        apiKey: apiKey.trim(),
        favoriteTopics: selectedTopics,
        onboardingComplete: true,
      });
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary)] opacity-10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[var(--primary)] to-[var(--primary-gradient-end)] opacity-10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="ActiveView News"
            width={140}
            height={35}
            className="h-10 w-auto"
          />
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-[var(--primary)] scale-110' : 'bg-[var(--border)]'}`} />
            <div className={`w-12 h-0.5 transition-all duration-300 ${step >= 2 ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`} />
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-[var(--primary)] scale-110' : 'bg-[var(--border)]'}`} />
          </div>

          {/* Step 1: API Key */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] mb-6 shadow-lg shadow-[var(--primary)]/30">
                  <KeyIcon className="text-white" size={28} />
                </div>
                <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">
                  Welcome to ActiveView News
                </h1>
                <p className="text-[var(--text-muted)] text-lg">
                  Enter your News API key to get started
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    API Key
                  </label>
                  <input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleApiKeySubmit()}
                    placeholder="Enter your News API key"
                    className="input"
                  />
                </div>

                {error && (
                  <p className="text-[var(--error)] text-sm animate-fade-in">{error}</p>
                )}

                <button
                  onClick={handleApiKeySubmit}
                  disabled={isValidating}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isValidating ? (
                    <>
                      <LoaderIcon size={20} />
                      Connecting...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRightIcon size={20} />
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-[var(--text-muted)]">
                  Don&apos;t have an API key?{' '}
                  <a
                    href="https://newsapi.org/register"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--primary)] hover:underline font-medium"
                  >
                    Get one free at NewsAPI.org
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Topics */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] mb-6 shadow-lg shadow-[var(--primary)]/30">
                  <SparklesIcon className="text-white" size={28} />
                </div>
                <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">
                  Choose Your Interests
                </h1>
                <p className="text-[var(--text-muted)] text-lg">
                  Select topics you want to follow
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex flex-wrap gap-3 justify-center">
                  {DEFAULT_TOPICS.map((topic, index) => (
                    <button
                      key={topic}
                      onClick={() => toggleTopic(topic)}
                      className={`tag cursor-pointer transition-all duration-200 animate-fade-in ${
                        selectedTopics.includes(topic)
                          ? 'tag-active shadow-md shadow-[var(--primary)]/20'
                          : 'hover:border-[var(--primary)]'
                      }`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {selectedTopics.includes(topic) && (
                        <CheckIcon size={16} className="animate-fade-in" />
                      )}
                      {topic}
                    </button>
                  ))}
                </div>

                {error && (
                  <p className="text-[var(--error)] text-sm text-center animate-fade-in">{error}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="btn-secondary flex-1"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={isValidating}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isValidating ? (
                      <>
                        <LoaderIcon size={20} />
                        Setting up...
                      </>
                    ) : (
                      <>
                        Get Started
                        <ArrowRightIcon size={20} />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center text-sm text-[var(--text-muted)]">
                  {selectedTopics.length} topic{selectedTopics.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center text-sm text-[var(--text-muted)]">
        Powered by{' '}
        <a
          href="https://www.activeview.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--primary)] hover:underline font-medium"
        >
          ActiveView
        </a>
      </footer>
    </div>
  );
}
