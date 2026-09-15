import React, { useState } from 'react';
import { X, Sparkles, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AddTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESETS = [
  { label: 'Pomodoro', minutes: 25, category: 'Study', color: '#2D5A43' },
  { label: 'Deep Work', minutes: 45, category: 'Code', color: '#52B788' },
  { label: 'Short Break', minutes: 5, category: 'Break', color: '#74C69D' },
  { label: 'Long Break', minutes: 15, category: 'Break', color: '#40916C' },
  { label: 'Quick Sprint', minutes: 10, category: 'Focus', color: '#2D5A43' },
];

const CATEGORIES = ['Study', 'Code', 'Reading', 'Work', 'Break', 'Creative'];
const COLORS = ['#2D5A43', '#52B788', '#74C69D', '#40916C', '#1B4332', '#606C38'];

export const AddTimerModal: React.FC<AddTimerModalProps> = ({ isOpen, onClose }) => {
  const { addTimer } = useApp();

  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(25);
  const [category, setCategory] = useState('Study');
  const [selectedColor, setSelectedColor] = useState('#2D5A43');

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setTitle(preset.label);
    setDuration(preset.minutes);
    setCategory(preset.category);
    setSelectedColor(preset.color);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (duration <= 0) return;
    addTimer(title.trim() || `${duration}m Focus`, duration, category, selectedColor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-zen-surface border border-zen-border p-6 shadow-xl transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zen-border">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-zen-forest" />
            <h2 className="text-lg font-bold text-zen-text tracking-tight">New Focus Timer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zen-muted hover:text-zen-text hover:bg-zen-card transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Quick Presets */}
          <div>
            <span className="text-xs font-semibold text-zen-muted uppercase tracking-wider flex items-center gap-1 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-zen-accent" /> Quick Presets
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-zen-card hover:bg-zen-forest hover:text-white border border-zen-border transition-all"
                >
                  {preset.label} ({preset.minutes}m)
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-zen-muted uppercase tracking-wider mb-1.5">
              Timer Name
            </label>
            <input
              type="text"
              placeholder="e.g. System Design Study"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-zen-card border border-zen-border text-zen-text text-sm focus:outline-none focus:ring-2 focus:ring-zen-forest/30"
            />
          </div>

          {/* Duration Input */}
          <div>
            <label className="block text-xs font-semibold text-zen-muted uppercase tracking-wider mb-1.5">
              Duration (Minutes)
            </label>
            <input
              type="number"
              min="1"
              max="240"
              value={duration}
              onChange={e => setDuration(parseInt(e.target.value) || 1)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-zen-card border border-zen-border text-zen-text text-sm focus:outline-none focus:ring-2 focus:ring-zen-forest/30"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-zen-muted uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    category === cat
                      ? 'bg-zen-forest text-white shadow-sm'
                      : 'bg-zen-card text-zen-muted hover:text-zen-text'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Color Tag */}
          <div>
            <label className="block text-xs font-semibold text-zen-muted uppercase tracking-wider mb-1.5">
              Accent Color
            </label>
            <div className="flex items-center space-x-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    selectedColor === c ? 'scale-110 ring-2 ring-offset-2 ring-zen-forest' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-zen-forest text-white font-semibold text-sm shadow-sm hover:opacity-95 transition-opacity"
            >
              Create Timer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
