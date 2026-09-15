import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Save,
} from 'lucide-react';
import { useRhythmStore } from '../store/useRhythmStore';
import { CryptoService } from '../services/cryptoService';
import { DecryptedDiaryPayload } from '../types';

const MOODS = ['🌿', '😊', '⚡', '🔥', '🌧️', '😔', '😴'];

export const DiaryScreen: React.FC = () => {
  const {
    currentUser,
    diaryUnlocked,
    activeDiaryPin,
    diaryEntries,
    setupDiaryPin,
    unlockDiary,
    lockDiary,
    saveDiaryEntry,
    deleteDiaryEntry,
    todayDate,
  } = useRhythmStore();

  const [pinInput, setPinInput] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Decrypted entries cache in memory
  const [decryptedCache, setDecryptedCache] = useState<Record<string, DecryptedDiaryPayload>>({});
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);

  // Active Editor
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editDate, setEditDate] = useState<string>(todayDate);
  const [editMood, setEditMood] = useState<string>('🌿');
  const [editTitle, setEditTitle] = useState<string>('');
  const [editBody, setEditBody] = useState<string>('');

  const hasPinConfigured = Boolean(currentUser?.diaryPinHash && currentUser?.diarySalt);

  // Handle PIN Unlock / Setup
  const handlePinSubmit = async () => {
    setErrorMsg(null);
    if (pinInput.length < 4) {
      setErrorMsg('PIN must be at least 4 digits.');
      return;
    }

    if (!hasPinConfigured) {
      // First-time setup
      if (pinInput !== confirmPin) {
        setErrorMsg('PINs do not match. Please re-enter.');
        return;
      }
      await setupDiaryPin(pinInput);
      setPinInput('');
      setConfirmPin('');
    } else {
      // Unlock
      const success = await unlockDiary(pinInput);
      if (!success) {
        setErrorMsg('Incorrect PIN. Please try again.');
        setPinInput('');
      } else {
        setPinInput('');
      }
    }
  };

  // Decrypt entries when diary unlocks
  useEffect(() => {
    if (!diaryUnlocked || !activeDiaryPin) {
      setDecryptedCache({});
      return;
    }

    const decryptAll = async () => {
      setIsDecrypting(true);
      const cache: Record<string, DecryptedDiaryPayload> = {};
      for (const entry of diaryEntries) {
        try {
          const decrypted = await CryptoService.decrypt(
            entry.encryptedPayload,
            entry.salt,
            entry.iv,
            activeDiaryPin
          );
          cache[entry.id] = decrypted;
        } catch (err) {
          console.error('Failed to decrypt entry:', err);
        }
      }
      setDecryptedCache(cache);
      setIsDecrypting(false);
    };

    decryptAll();
  }, [diaryUnlocked, activeDiaryPin, diaryEntries]);

  const handleSaveEntry = async () => {
    if (!editBody.trim()) return;
    const payload: DecryptedDiaryPayload = {
      mood: editMood,
      title: editTitle.trim() || 'Mindful Reflection',
      body: editBody.trim(),
    };
    await saveDiaryEntry(payload, editDate);
    setIsEditing(false);
    setEditBody('');
    setEditTitle('');
  };

  const startNewEntry = () => {
    setEditDate(todayDate);
    setEditMood('🌿');
    setEditTitle('');
    setEditBody('');
    setIsEditing(true);
  };

  // ---------------- LOCKED / PIN PAD VIEW ----------------
  if (!diaryUnlocked) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 space-y-6 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-16 h-16 rounded-3xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-zen-text tracking-tight">
            {hasPinConfigured ? 'Personal Encrypted Diary' : 'Set Up Your Diary Security PIN'}
          </h2>
          <p className="text-xs text-zen-muted max-w-xs mx-auto leading-relaxed">
            {hasPinConfigured
              ? 'Enter your private PIN to decrypt your personal entries on this device.'
              : 'Create a private 4-digit PIN. Your thoughts are encrypted client-side using AES-GCM (Web Crypto API).'}
          </p>
        </div>

        {/* PIN Input Form */}
        <div className="w-full max-w-xs space-y-3">
          <div>
            <label className="text-[11px] font-bold text-zen-muted uppercase tracking-wider block mb-1">
              {hasPinConfigured ? 'Enter PIN' : 'Choose 4-Digit PIN'}
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
              className="w-full text-center tracking-widest text-xl font-bold py-3 rounded-2xl bg-zen-surface border border-zen-border text-zen-text focus:outline-none focus:ring-2 focus:ring-accent-emerald/40 shadow-sm"
            />
          </div>

          {!hasPinConfigured && (
            <div>
              <label className="text-[11px] font-bold text-zen-muted uppercase tracking-wider block mb-1">
                Confirm PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="••••"
                className="w-full text-center tracking-widest text-xl font-bold py-3 rounded-2xl bg-zen-surface border border-zen-border text-zen-text focus:outline-none focus:ring-2 focus:ring-accent-emerald/40 shadow-sm"
              />
            </div>
          )}

          {errorMsg && (
            <p className="text-xs font-semibold text-accent-terracotta text-center animate-shake">
              {errorMsg}
            </p>
          )}

          <button
            onClick={handlePinSubmit}
            disabled={pinInput.length < 4}
            className="w-full py-3.5 rounded-2xl bg-accent-emerald hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>{hasPinConfigured ? 'Unlock Diary' : 'Lock & Activate'}</span>
          </button>

          <div className="flex items-center justify-center space-x-1.5 text-[10px] text-zen-muted pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-emerald" />
            <span>Zero-Knowledge · Encrypted Before Storage</span>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- UNLOCKED DIARY VIEW ----------------
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zen-text tracking-tight flex items-center space-x-2">
            <span>Personal Diary</span>
            <Unlock className="w-4 h-4 text-accent-emerald" />
          </h2>
          <span className="text-xs text-zen-muted">AES-GCM Encrypted · Private Space</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={startNewEntry}
            className="px-3.5 py-2 rounded-2xl bg-accent-emerald text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm hover:opacity-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Reflection</span>
          </button>
          <button
            onClick={lockDiary}
            className="p-2 rounded-xl bg-zen-card hover:bg-zen-border text-zen-muted hover:text-zen-text"
            title="Lock Diary"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Modal / Card */}
      {isEditing && (
        <div className="p-5 rounded-3xl bg-zen-surface border border-accent-emerald/40 shadow-lg space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-emerald flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Compose Encrypted Reflection</span>
            </span>
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="text-xs font-medium px-2.5 py-1 rounded-xl bg-zen-card border border-zen-border text-zen-text"
            />
          </div>

          {/* Mood Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-zen-muted uppercase mr-1">Mood:</span>
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setEditMood(m)}
                className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center transition-all ${
                  editMood === m ? 'bg-accent-emerald text-white scale-110 shadow-sm' : 'bg-zen-card'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Title / Key Theme (e.g. Cleared Physics Mock Test)"
            className="w-full px-3.5 py-2.5 rounded-xl bg-zen-card border border-zen-border text-xs font-bold text-zen-text focus:outline-none focus:ring-2 focus:ring-accent-emerald/40"
          />

          <textarea
            rows={5}
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            placeholder="Write your honest, unedited thoughts here. Encrypted locally with your PIN..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-zen-card border border-zen-border text-xs text-zen-text leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent-emerald/40"
          />

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl bg-zen-card text-xs font-semibold text-zen-muted hover:text-zen-text"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEntry}
              className="px-5 py-2 rounded-xl bg-accent-emerald text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm hover:opacity-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Encrypt & Save</span>
            </button>
          </div>
        </div>
      )}

      {/* Entries List */}
      <div className="space-y-3">
        {diaryEntries.length === 0 && !isEditing ? (
          <div className="p-8 rounded-3xl bg-zen-surface border border-dashed border-zen-border text-center space-y-2">
            <span className="text-3xl block">📖</span>
            <h4 className="text-sm font-bold text-zen-text">Your diary is waiting</h4>
            <p className="text-xs text-zen-muted max-w-xs mx-auto">
              Write your first mindful reflection. Only you hold the decryption key.
            </p>
            <button
              onClick={startNewEntry}
              className="mt-2 px-4 py-2 rounded-xl bg-accent-emerald text-white text-xs font-bold inline-flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Begin Reflection</span>
            </button>
          </div>
        ) : (
          diaryEntries.map((entry) => {
            const decrypted = decryptedCache[entry.id];
            return (
              <div
                key={entry.id}
                className="p-5 rounded-3xl bg-zen-surface border border-zen-border shadow-sm space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{decrypted?.mood || '🌿'}</span>
                    <div>
                      <h4 className="text-sm font-bold text-zen-text">
                        {decrypted?.title || 'Encrypted Entry'}
                      </h4>
                      <div className="flex items-center space-x-1 text-[10px] text-zen-muted">
                        <Calendar className="w-3 h-3" />
                        <span>{entry.dateIso}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteDiaryEntry(entry.id)}
                    className="p-1.5 rounded-lg text-zen-muted hover:text-accent-terracotta hover:bg-zen-card"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {isDecrypting ? (
                  <p className="text-xs text-zen-muted italic">Decrypting...</p>
                ) : (
                  <p className="text-xs text-zen-muted leading-relaxed whitespace-pre-line pt-1 border-t border-zen-border/40">
                    {decrypted?.body || 'Unable to decrypt.'}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
