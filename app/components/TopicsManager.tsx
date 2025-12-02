'use client';

import React, { useState } from 'react';
import { DEFAULT_TOPICS } from '../lib/types';
import { XIcon, PlusIcon, CheckIcon, SparklesIcon } from './Icons';

interface TopicsManagerProps {
  topics: string[];
  onUpdateTopics: (topics: string[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function TopicsManager({
  topics,
  onUpdateTopics,
  isOpen,
  onClose,
}: TopicsManagerProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>(topics);
  const [customTopic, setCustomTopic] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const addCustomTopic = () => {
    const trimmed = customTopic.trim();
    if (trimmed && !selectedTopics.includes(trimmed)) {
      setSelectedTopics(prev => [...prev, trimmed]);
      setCustomTopic('');
    }
  };

  const removeTopic = (topic: string) => {
    setSelectedTopics(prev => prev.filter(t => t !== topic));
  };

  const handleSave = async () => {
    if (selectedTopics.length === 0) return;
    
    setIsSaving(true);
    await onUpdateTopics(selectedTopics);
    setIsSaving(false);
    onClose();
  };

  const handleClose = () => {
    setSelectedTopics(topics); // Reset to original
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-xl flex items-center justify-center">
              <SparklesIcon size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                Manage Topics
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                {selectedTopics.length} topic{selectedTopics.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] rounded-lg transition-colors"
          >
            <XIcon size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {/* Selected topics */}
          {selectedTopics.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                Your Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedTopics.map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--primary)] text-white rounded-full text-sm font-medium"
                  >
                    {topic}
                    <button
                      onClick={() => removeTopic(topic)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <XIcon size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Add custom topic */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
              Add Custom Topic
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomTopic()}
                placeholder="Type a topic..."
                className="input flex-1"
              />
              <button
                onClick={addCustomTopic}
                disabled={!customTopic.trim()}
                className="btn-primary px-4 disabled:opacity-50"
              >
                <PlusIcon size={20} />
              </button>
            </div>
          </div>

          {/* Suggested topics */}
          <div>
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
              Suggested Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_TOPICS.map((topic) => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={`tag cursor-pointer transition-all ${
                      isSelected
                        ? 'tag-active'
                        : 'hover:border-[var(--primary)]'
                    }`}
                  >
                    {isSelected && <CheckIcon size={14} />}
                    {topic}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-[var(--border)] bg-[var(--surface)]">
          <p className="text-sm text-[var(--text-muted)]">
            {selectedTopics.length === 0 && (
              <span className="text-[var(--error)]">Select at least one topic</span>
            )}
          </p>
          <div className="flex gap-3">
            <button onClick={handleClose} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={selectedTopics.length === 0 || isSaving}
              className="btn-primary disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

