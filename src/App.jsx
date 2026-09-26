/**
 * App.jsx
 *
 * Root application component for StudyAI.
 * Supports both AirShare Dark & Light modes with persistent toggle.
 *
 * Core Flow:
 * Free-form input → React → POST /api/generate → Express backend → Groq LLM
 * → structured JSON → frontend validation → React state → interactive flashcards.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import PromptInput from './components/PromptInput';
import FlashcardDeck from './components/FlashcardDeck';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import { generateStudyDeck } from './lib/api';
import { validateResult } from './lib/validateResult';

// UI view states
const VIEW = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

export default function App() {
  const [view, setView] = useState(VIEW.IDLE);
  const [deck, setDeck] = useState(null);
  const [error, setError] = useState('');
  const [lastInput, setLastInput] = useState('');

  // Theme toggle: 'dark' (default) or 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('studyai_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('studyai_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Stale-request protection: ensures older slow responses never overwrite newer ones
  const requestIdRef = useRef(0);

  const handleGenerate = useCallback(async (input) => {
    const thisRequestId = ++requestIdRef.current;
    setLastInput(input);
    setView(VIEW.LOADING);
    setError('');
    setDeck(null);

    try {
      // 1. Call backend via fetch
      const raw = await generateStudyDeck(input);

      // 2. Stale request guard
      if (thisRequestId !== requestIdRef.current) return;

      // 3. Strict schema validation
      const result = validateResult(raw);

      if (!result.valid) {
        setError(result.error);
        setView(VIEW.ERROR);
        return;
      }

      // 4. Update React state with validated deck
      setDeck(result.data);
      setView(VIEW.SUCCESS);
    } catch (err) {
      if (thisRequestId !== requestIdRef.current) return;
      setError(err.message || 'An unexpected error occurred.');
      setView(VIEW.ERROR);
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (lastInput) handleGenerate(lastInput);
  }, [lastInput, handleGenerate]);

  const handleNewDeck = useCallback(() => {
    setView(VIEW.IDLE);
    setDeck(null);
    setError('');
  }, []);

  return (
    <div className="air-app">
      {/* Top right theme toggle (Sun / Moon) */}
      <div className="air-top-nav">
        <button
          className={`air-theme-toggle ${theme === 'light' ? 'air-theme-toggle--light' : ''}`}
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            /* Sun Icon */
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            /* Moon Icon */
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>

      {/* Hero Header */}
      <header className="air-hero">
        <div className="air-hero__branding">
          <div className="air-device-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="12" rx="2" />
              <line x1="2" y1="20" x2="22" y2="20" />
            </svg>
          </div>

          <div className="air-logo-group">
            <h1 className="air-title">
              <span className="air-title__primary">Study</span>
              <span className="air-title__accent">AI</span>
            </h1>
            <div className="air-logo-underline" aria-hidden="true" />
          </div>

          <div className="air-device-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
            </svg>
          </div>
        </div>

        <p className="air-hero__tagline">Turn any topic into interactive flashcards.</p>
        <div className="air-hero__meta">
          <span>AI-GENERATED</span>
          <span>•</span>
          <span>ACTIVE RECALL</span>
          <span>•</span>
          <span>INTERACTIVE</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="air-main">
        {view === VIEW.IDLE && (
          <PromptInput
            onGenerate={handleGenerate}
            isLoading={false}
          />
        )}

        {view === VIEW.LOADING && (
          <div className="air-deck-container">
            <LoadingState />
          </div>
        )}

        {view === VIEW.ERROR && (
          <div className="air-deck-container">
            <ErrorState message={error} onRetry={handleRetry} />
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button className="air-btn air-btn--dark" onClick={handleNewDeck}>
                ← Back to Topic Input
              </button>
            </div>
          </div>
        )}

        {view === VIEW.SUCCESS && deck && (
          <div className="air-deck-container">
            <div className="air-deck-back-bar">
              <button className="air-btn-link" onClick={handleNewDeck}>
                ← Enter New Topic
              </button>
            </div>
            <FlashcardDeck deck={deck} onNewDeck={handleNewDeck} />
          </div>
        )}
      </main>
    </div>
  );
}
