import React, { useState } from 'react';
import { X, CalendarPlus, Clock, CheckSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = ['#2D5A43', '#52B788', '#74C69D', '#40916C', '#1B4332', '#606C38'];

export const AddHabitModal: React.FC<AddHabitModalProps> = ({ isOpen, onClose }) => {
  const { addHabit } = useApp();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'check' | 'duration'>('check');
  const [targetMinutes, setTargetMinutes] = useState(20);
  const [selectedColor, setSelectedColor] = useState('#2D5A43');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addHabit(title.trim(), type, type === 'duration' ? targetMinutes : 0, 'Daily', selectedColor);
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-zen-surface border border-zen-border p-6 shadow-xl transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zen-border">
          <div className="flex items-center space-x-2">
            <CalendarPlus className="w-5 h-5 text-zen-forest" />
            <h2 className="text-lg font-bold text-zen-text tracking-tight">Create Habit</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zen-muted hover:text-zen-text hover:bg-zen-card transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zen-muted uppercase tracking-wider mb-1.5">
              Habit Name
            </label>
            <input
              type="text"
              placeholder="e.g. Daily Meditation"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-zen-card border border-zen-border text-zen-text text-sm focus:outline-none focus:ring-2 focus:ring-zen-forest/30"
              autoFocus
            />
          </div>

          {/* Habit Type Switcher */}
          <div>
            <label className="block text-xs font-semibold text-zen-muted uppercase tracking-wider mb-1.5">
              Tracking Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('check')}
                className={`py-2 px-3 rounded-2xl border text-xs font-medium flex items-center justify-center space-x-2 transition-all ${
                  type === 'check'
                    ? 'border-zen-forest bg-zen-forest/10 text-zen-forest font-semibold'
                    : 'border-zen-border bg-zen-card text-zen-muted hover:text-zen-text'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Simple Check</span>
              </button>

              <button
                type="button"
                onClick={() => setType('duration')}
                className={`py-2 px-3 rounded-2xl border text-xs font-medium flex items-center justify-center space-x-2 transition-all ${
                  type === 'duration'
                    ? 'border-zen-forest bg-zen-forest/10 text-zen-forest font-semibold'
                    : 'border-zen-border bg-zen-card text-zen-muted hover:text-zen-text'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Timed Goal</span>
              </button>
            </div>
          </div>

          {/* Duration if type === 'duration' */}
          {type === 'duration' && (
            <div>
              <label className="block text-xs font-semibold text-zen-muted uppercase tracking-wider mb-1.5">
                Target Minutes
              </label>
              <input
                type="number"
                min="1"
                max="240"
                value={targetMinutes}
                onChange={e => setTargetMinutes(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-zen-card border border-zen-border text-zen-text text-sm focus:outline-none focus:ring-2 focus:ring-zen-forest/30"
              />
            </div>
          )}

          {/* Color Selection */}
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

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!title.trim()}
              className="w-full py-3 rounded-2xl bg-zen-forest text-white font-semibold text-sm shadow-sm hover:opacity-95 disabled:opacity-40 transition-opacity"
            >
              Add Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
