/**
 * EmptyState.jsx
 *
 * Shown before the user has generated any flashcards.
 */

export default function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">📚</div>
      <p className="empty-state__text">
        Enter a topic, notes, or concept above to generate your study deck.
      </p>
    </div>
  );
}
