/**
 * Flashcard.jsx
 *
 * Single flashcard with flip interaction.
 * Front = question, Back = answer.
 * Accessible — uses a button element, keyboard-accessible, has aria-labels.
 */

export default function Flashcard({ card, isFlipped, onFlip }) {
  return (
    <div className="flashcard-wrapper">
      <button
        className={`flashcard ${isFlipped ? 'flashcard--flipped' : ''}`}
        onClick={onFlip}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onFlip();
          }
        }}
        aria-label={
          isFlipped
            ? `Answer: ${card.answer}. Press to flip back to question.`
            : `Question: ${card.question}. Press to reveal answer.`
        }
      >
        {/* Front — Question */}
        <div className="flashcard__face flashcard__front">
          <span className="flashcard__label">Question</span>
          <p className="flashcard__text">{card.question}</p>
          <span className="flashcard__hint">Click or press Enter to flip</span>
        </div>

        {/* Back — Answer */}
        <div className="flashcard__face flashcard__back">
          <span className="flashcard__label">Answer</span>
          <p className="flashcard__text">{card.answer}</p>
          <span className="flashcard__hint">Click or press Enter to flip back</span>
        </div>
      </button>
    </div>
  );
}
