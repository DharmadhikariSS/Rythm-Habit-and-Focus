import React, { useState } from 'react';
import { X, CheckSquare, Clock, Hash } from 'lucide-react';
import { HabitType } from '../types';
import { useRhythmStore } from '../store/useRhythmStore';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICONS = ['🌿', '💧', '📚', '🧘', '💪', '⚡', '🏃', '☕', '🎨'];

const SOOTHING_COLORS = [
  { name: 'Emerald', hex: '#437A55' },
  { name: 'Ocean', hex: '#386B80' },
  { name: 'Terracotta', hex: '#B55D46' },
  { name: 'Lavender', hex: '#6B5F8C' },
  { name: 'Ochre', hex: '#A67B34' },
  { name: 'Rose', hex: '#9E4E68' },
  { name: 'Sky', hex: '#3A7D99' },
  { name: 'Sage', hex: '#5D8464' },
];

export const AddHabitModal: React.FC<AddHabitModalProps> = ({ isOpen, onClose }) => {
  const { addHabit } = useRhythmStore();

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🌿');
  const [type, setType] = useState<HabitType>('CHECK');
  const [targetMinutes, setTargetMinutes] = useState(30);
  const [targetCount, setTargetCount] = useState(8);
  const [targetUnit, setTargetUnit] = useState('cups');
  const [selectedColor, setSelectedColor] = useState(SOOTHING_COLORS[0].hex);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addHabit({
      name: name.trim(),
      icon: selectedIcon,
      type,
      color: selectedColor,
      targetDurationMinutes: type === 'TIMED' ? targetMinutes : 0,
      targetCount: type === 'COUNTER' ? targetCount : 0,
      targetUnit: type === 'COUNTER' ? targetUnit.trim() || 'units' : '',
    });

    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-zen-surface border border-zen-border p-6 shadow-xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zen-border">
          <h2 className="text-lg font-bold text-zen-text-primary tracking-tight">
            Create New Habit
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-zen-text-secondary hover:text-zen-text-primary hover:bg-zen-surface-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Habit Name */}
          <div>
            <label className="block text-xs font-semibold text-zen-text-secondary uppercase tracking-wider mb-1.5">
              Habit Name
            </label>
            <input
              type="text"
              placeholder="e.g. Morning Meditation, Reading"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zen-surface-subtle border border-zen-border text-zen-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-emerald/40"
              autoFocus
            />
          </div>

          {/* Emoji Icon Picker */}
          <div>
            <label className="block text-[11px] font-semibold text-zen-text-secondary uppercase tracking-wider mb-1.5">
              Select Icon
            </label>
            <div className="flex items-center justify-between bg-zen-surface-subtle p-2 rounded-2xl border border-zen-border">
              {ICONS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedIcon(emoji)}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-base transition-all ${
                    selectedIcon === emoji
                      ? 'bg-zen-surface shadow-xs scale-110 border border-zen-border'
                      : 'hover:bg-zen-border/50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Habit Type Switcher */}
          <div>
            <label className="block text-[11px] font-semibold text-zen-text-secondary uppercase tracking-wider mb-1.5">
              Habit Type
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setType('CHECK')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                  type === 'CHECK'
                    ? 'bg-accent-emerald text-white shadow-xs'
                    : 'bg-zen-surface-subtle text-zen-text-secondary hover:bg-zen-border'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Check-in</span>
              </button>

              <button
                type="button"
                onClick={() => setType('TIMED')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                  type === 'TIMED'
                    ? 'bg-accent-emerald text-white shadow-xs'
                    : 'bg-zen-surface-subtle text-zen-text-secondary hover:bg-zen-border'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Timed</span>
              </button>

              <button
                type="button"
                onClick={() => setType('COUNTER')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                  type === 'COUNTER'
                    ? 'bg-accent-emerald text-white shadow-xs'
                    : 'bg-zen-surface-subtle text-zen-text-secondary hover:bg-zen-border'
                }`}
              >
                <Hash className="w-4 h-4" />
                <span>Counter</span>
              </button>
            </div>
          </div>

          {/* Conditional Fields based on Type */}
          {type === 'TIMED' && (
            <div>
              <label className="block text-[11px] font-semibold text-zen-text-secondary uppercase tracking-wider mb-1.5">
                Target Minutes
              </label>
              <input
                type="number"
                min="1"
                max="240"
                value={targetMinutes}
                onChange={e => setTargetMinutes(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zen-surface-subtle border border-zen-border text-zen-text-primary text-sm focus:outline-none"
              />
            </div>
          )}

          {type === 'COUNTER' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-zen-text-secondary uppercase tracking-wider mb-1.5">
                  Target Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={targetCount}
                  onChange={e => setTargetCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zen-surface-subtle border border-zen-border text-zen-text-primary text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zen-text-secondary uppercase tracking-wider mb-1.5">
                  Unit Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. cups, pages"
                  value={targetUnit}
                  onChange={e => setTargetUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zen-surface-subtle border border-zen-border text-zen-text-primary text-sm focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Soothing Color Selection */}
          <div>
            <label className="block text-[11px] font-semibold text-zen-text-secondary uppercase tracking-wider mb-2">
              Color Palette
            </label>
            <div className="flex items-center justify-between">
              {SOOTHING_COLORS.map(c => {
                const isSelected = selectedColor === c.hex;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      isSelected
                        ? 'ring-3 ring-offset-2 ring-zen-text-primary scale-110'
                        : 'hover:scale-105 opacity-90'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-zen-border text-xs font-semibold text-zen-text-secondary hover:bg-zen-surface-subtle transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              style={{ backgroundColor: selectedColor }}
              className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs hover:opacity-95 disabled:opacity-40 transition-opacity"
            >
              Save Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
