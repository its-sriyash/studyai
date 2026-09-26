/**
 * validateResult.js
 *
 * Validates the structured JSON returned by the LLM.
 * Returns { valid: true, data } on success, or { valid: false, error } on failure.
 * Never allows malformed data to reach the UI.
 */

export function validateResult(raw) {
  // 1. Handle empty / missing response
  if (!raw || (typeof raw === 'string' && raw.trim() === '')) {
    return { valid: false, error: 'The AI returned an empty response. Please try again.' };
  }

  // 2. Parse JSON safely
  let parsed;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { valid: false, error: 'The AI returned malformed JSON. Please try again.' };
    }
  } else if (typeof raw === 'object' && raw !== null) {
    parsed = raw;
  } else {
    return { valid: false, error: 'Unexpected response type from the AI.' };
  }

  // 3. Must be a plain object (not an array)
  if (Array.isArray(parsed) || typeof parsed !== 'object') {
    return { valid: false, error: 'The AI response has the wrong structure (expected an object).' };
  }

  // 4. Title must be a non-empty string
  if (typeof parsed.title !== 'string' || parsed.title.trim() === '') {
    return { valid: false, error: 'The AI response is missing a valid title.' };
  }

  // 5. Cards must be a non-empty array
  if (!Array.isArray(parsed.cards) || parsed.cards.length === 0) {
    return { valid: false, error: 'The AI response contains no flashcards.' };
  }

  // 6. Every card must have question (string) and answer (string)
  for (let i = 0; i < parsed.cards.length; i++) {
    const card = parsed.cards[i];

    if (!card || typeof card !== 'object') {
      return { valid: false, error: `Card ${i + 1} is not a valid object.` };
    }

    if (typeof card.question !== 'string' || card.question.trim() === '') {
      return { valid: false, error: `Card ${i + 1} is missing a valid question.` };
    }

    if (typeof card.answer !== 'string' || card.answer.trim() === '') {
      return { valid: false, error: `Card ${i + 1} is missing a valid answer.` };
    }
  }

  // 7. All checks passed — return sanitized data
  return {
    valid: true,
    data: {
      title: parsed.title.trim(),
      description: typeof parsed.description === 'string' ? parsed.description.trim() : '',
      cards: parsed.cards.map((c) => ({
        question: c.question.trim(),
        answer: c.answer.trim(),
      })),
    },
  };
}
