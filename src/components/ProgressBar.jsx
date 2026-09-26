/**
 * ProgressBar.jsx
 *
 * Shows "Card X of Y" with a visual progress bar and correct/wrong stats.
 */

export default function ProgressBar({ current, total, correctCount, wrongCount }) {
  const progress = ((current + 1) / total) * 100;

  return (
    <div className="progress">
      <div className="progress__info">
        <span className="progress__label">
          Card {current + 1} of {total}
        </span>

        <div className="progress__stats">
          <span className="progress__stat progress__stat--correct">
            ✓ {correctCount}
          </span>
          <span className="progress__stat progress__stat--wrong">
            ✗ {wrongCount}
          </span>
        </div>
      </div>

      <div className="progress__track" role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={total}>
        <div
          className="progress__fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
