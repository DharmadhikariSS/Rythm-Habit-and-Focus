import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AddTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

const WEEKLY_GOAL_OPTIONS = [3, 5, 8, 10, 15, 20];

export const AddTimerModal: React.FC<AddTimerModalProps> = ({ isOpen, onClose }) => {
  const { addSubject } = useApp();

  const [name, setName] = useState('');
  const [selectedWeeklyHours, setSelectedWeeklyHours] = useState(5);
  const [selectedColor, setSelectedColor] = useState(SOOTHING_COLORS[0].hex);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addSubject(name.trim(), selectedColor, selectedWeeklyHours);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-zen-surface border border-zen-border p-6 shadow-xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zen-border">
          <h2 className="text-lg font-bold text-zen-text-primary tracking-tight">
            Add Focus Subject
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-zen-text-secondary hover:text-zen-text-primary hover:bg-zen-surface-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Subject Name Input */}
          <div>
            <label className="block text-xs font-semibold text-zen-text-secondary uppercase tracking-wider mb-1.5">
              Subject Name
            </label>
            <input
              type="text"
              placeholder="e.g. Study, Gym, Reading"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zen-surface-subtle border border-zen-border text-zen-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-emerald/40"
              autoFocus
            />
          </div>

          {/* Weekly Target Hours */}
          <div>
            <label className="block text-[11px] font-semibold text-zen-text-secondary uppercase tracking-wider mb-1.5">
              Weekly Target Hours
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {WEEKLY_GOAL_OPTIONS.map(hours => {
                const isSelected = selectedWeeklyHours === hours;
                return (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => setSelectedWeeklyHours(hours)}
                    style={{
                      backgroundColor: isSelected ? selectedColor : 'var(--zen-surface-subtle)',
                      color: isSelected ? '#FFFFFF' : 'var(--zen-text-primary)',
                    }}
                    className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                      isSelected ? 'shadow-xs font-bold' : 'hover:bg-zen-border'
                    }`}
                  >
                    {hours}h
                  </button>
                );
              })}
            </div>
          </div>

          {/* Soothing Colors Swatches */}
          <div>
            <label className="block text-[11px] font-semibold text-zen-text-secondary uppercase tracking-wider mb-2">
              Select Color
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
                    className={`w-8 h-8 rounded-full transition-transform duration-150 ${
                      isSelected
                        ? 'ring-3 ring-offset-2 ring-zen-text-primary scale-110'
                        : 'hover:scale-105 opacity-90'
                    }`}
                    title={c.name}
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
              Add Subject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
