/**
 * PromptInput.jsx
 *
 * Single free-form input section for StudyAI.
 * Completely removes any room/code concepts.
 *
 * Features:
 * - Free-form textarea for any topic or notes
 * - Character count limit (2000 chars)
 * - Clickable example prompt
 * - Prominent radiant orange "Generate Flashcards" button
 */

import { useState } from 'react';

const MAX_CHARS = 2000;
const EXAMPLE_PROMPT = 'Teach me DBMS normalization for an interview.';

export default function PromptInput({ onGenerate, isLoading }) {
  const [input, setInput] = useState('');

  const trimmed = input.trim();
  const canSubmit = trimmed.length > 0 && !isLoading;

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    onGenerate(trimmed);
  }

  function handleUseExample() {
    setInput(EXAMPLE_PROMPT);
  }

  return (
    <div className="prompt-card">
      <form onSubmit={handleSubmit} className="prompt-card__form">
        <div className="prompt-card__field">
          <div className="prompt-card__header-row">
            <span className="air-accent-bar" aria-hidden="true" />
            <label htmlFor="prompt-textarea" className="prompt-card__label">
              Topic or Study Notes
            </label>
          </div>

          <div className="prompt-textarea-wrapper">
            <textarea
              id="prompt-textarea"
              className="prompt-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
              placeholder="Enter a topic or paste your notes..."
              disabled={isLoading}
              aria-label="Enter a topic or paste your notes"
              rows={5}
            />
            <div className="prompt-textarea__char-count">
              {input.length} / {MAX_CHARS}
            </div>
          </div>
        </div>

        {/* Example suggestion */}
        <div className="prompt-example">
          <span className="prompt-example__label">Example:</span>
          <button
            type="button"
            className="prompt-example__btn"
            onClick={handleUseExample}
            disabled={isLoading}
            title="Click to use this example"
          >
            "{EXAMPLE_PROMPT}"
          </button>
        </div>

        {/* Generate Flashcards button */}
        <button
          type="submit"
          className="air-btn air-btn--primary"
          disabled={!canSubmit}
          id="generate-flashcards-btn"
        >
          {isLoading ? 'Generating Flashcards...' : 'Generate Flashcards'}
        </button>
      </form>
    </div>
  );
}
