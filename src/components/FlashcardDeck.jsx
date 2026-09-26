/**
 * FlashcardDeck.jsx
 *
 * Orchestrates the full flashcard study session:
 * - Navigation (previous / next / flip)
 * - Marking correct / wrong
 * - Session completion summary
 * - Retest wrong answers
 * - Restart
 */

import { useState, useCallback } from 'react';
import Flashcard from './Flashcard';
import ProgressBar from './ProgressBar';

export default function FlashcardDeck({ deck, onNewDeck }) {
  const [cards, setCards] = useState(deck.cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [wrongIndexes, setWrongIndexes] = useState(new Set());
  const [answeredIndexes, setAnsweredIndexes] = useState(new Set());
  const [sessionDone, setSessionDone] = useState(false);

  const currentCard = cards[currentIndex];
  const totalCards = cards.length;
  const correctCount = answeredIndexes.size - wrongIndexes.size;
  const wrongCount = wrongIndexes.size;

  // ---------- Navigation ----------
  const goToCard = useCallback((index) => {
    setCurrentIndex(index);
    setIsFlipped(false);
  }, []);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) goToCard(currentIndex - 1);
  }, [currentIndex, goToCard]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalCards - 1) {
      goToCard(currentIndex + 1);
    }
  }, [currentIndex, totalCards, goToCard]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // ---------- Correct / Wrong ----------
  const handleCorrect = useCallback(() => {
    setAnsweredIndexes((prev) => new Set(prev).add(currentIndex));
    // Remove from wrong if previously marked wrong
    setWrongIndexes((prev) => {
      const next = new Set(prev);
      next.delete(currentIndex);
      return next;
    });

    // Advance to next card or finish
    if (currentIndex < totalCards - 1) {
      goToCard(currentIndex + 1);
    } else {
      setSessionDone(true);
    }
  }, [currentIndex, totalCards, goToCard]);

  const handleWrong = useCallback(() => {
    setAnsweredIndexes((prev) => new Set(prev).add(currentIndex));
    setWrongIndexes((prev) => new Set(prev).add(currentIndex));

    if (currentIndex < totalCards - 1) {
      goToCard(currentIndex + 1);
    } else {
      setSessionDone(true);
    }
  }, [currentIndex, totalCards, goToCard]);

  // ---------- Retest / Restart ----------
  const handleRetest = useCallback(() => {
    const wrongCards = cards.filter((_, i) => wrongIndexes.has(i));
    setCards(wrongCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setWrongIndexes(new Set());
    setAnsweredIndexes(new Set());
    setSessionDone(false);
  }, [cards, wrongIndexes]);

  const handleRestart = useCallback(() => {
    setCards(deck.cards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setWrongIndexes(new Set());
    setAnsweredIndexes(new Set());
    setSessionDone(false);
  }, [deck.cards]);

  // ---------- Session Complete ----------
  if (sessionDone) {
    const allCorrect = wrongIndexes.size === 0;

    return (
      <div className="deck">
        <div className="session-complete">
          <div className="session-complete__icon">{allCorrect ? '🎉' : '📊'}</div>
          <h2 className="session-complete__title">Study Session Complete!</h2>

          {allCorrect ? (
            <p className="session-complete__perfect">
              Perfect! You got every card right. 🌟
            </p>
          ) : (
            <>
              <p className="session-complete__subtitle">Here's how you did:</p>
              <div className="session-complete__stats">
                <div className="session-complete__stat">
                  <span className="session-complete__stat-value session-complete__stat-value--total">
                    {totalCards}
                  </span>
                  <span className="session-complete__stat-label">Total</span>
                </div>
                <div className="session-complete__stat">
                  <span className="session-complete__stat-value session-complete__stat-value--correct">
                    {correctCount}
                  </span>
                  <span className="session-complete__stat-label">Correct</span>
                </div>
                <div className="session-complete__stat">
                  <span className="session-complete__stat-value session-complete__stat-value--wrong">
                    {wrongCount}
                  </span>
                  <span className="session-complete__stat-label">Wrong</span>
                </div>
              </div>
            </>
          )}

          <div className="session-complete__actions">
            {wrongIndexes.size > 0 && (
              <button className="btn btn--primary" onClick={handleRetest}>
                🔁 Retest Wrong Answers ({wrongIndexes.size})
              </button>
            )}
            <button className="btn btn--secondary" onClick={handleRestart}>
              🔄 Study Again
            </button>
            {onNewDeck && (
              <button className="btn btn--ghost" onClick={onNewDeck}>
                ✨ New Topic
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- Active Study View ----------
  return (
    <div className="deck">
      <div className="deck__header">
        <h2 className="deck__title">{deck.title}</h2>
        {deck.description && (
          <p className="deck__description">{deck.description}</p>
        )}
      </div>

      <ProgressBar
        current={currentIndex}
        total={totalCards}
        correctCount={correctCount}
        wrongCount={wrongCount}
      />

      <Flashcard
        card={currentCard}
        isFlipped={isFlipped}
        onFlip={handleFlip}
      />

      <div className="controls">
        {/* Navigation */}
        <div className="controls__nav">
          <button
            className="btn btn--secondary"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            aria-label="Previous card"
          >
            ← Previous
          </button>

          <button className="btn btn--ghost" onClick={handleFlip} aria-label="Flip card">
            🔄 Flip
          </button>

          <button
            className="btn btn--secondary"
            onClick={handleNext}
            disabled={currentIndex === totalCards - 1}
            aria-label="Next card"
          >
            Next →
          </button>
        </div>

        {/* Correct / Wrong */}
        <div className="controls__feedback">
          <button className="btn btn--success" onClick={handleCorrect} aria-label="I got it right">
            ✓ Got it
          </button>
          <button className="btn btn--danger" onClick={handleWrong} aria-label="I got it wrong">
            ✗ Got it wrong
          </button>
        </div>
      </div>
    </div>
  );
}
