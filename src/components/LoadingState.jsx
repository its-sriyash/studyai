/**
 * LoadingState.jsx
 *
 * Shown while waiting for the AI response.
 * Animated spinner + descriptive text.
 */

export default function LoadingState() {
  return (
    <div className="loading" role="status" aria-live="polite">
      <div className="loading__spinner" />
      <p className="loading__text">Creating your study deck...</p>
      <p className="loading__subtext">
        This usually takes a few seconds.
      </p>
    </div>
  );
}
