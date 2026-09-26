/**
 * ErrorState.jsx
 *
 * Displays a user-friendly error message with an optional Retry button.
 */

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="error" role="alert">
      <div className="error__icon">⚠️</div>
      <h2 className="error__title">Something went wrong</h2>
      <p className="error__message">{message}</p>
      {onRetry && (
        <button className="btn btn--primary" onClick={onRetry} aria-label="Try again">
          🔄 Try Again
        </button>
      )}
    </div>
  );
}
