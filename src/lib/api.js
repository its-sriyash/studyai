/**
 * api.js
 *
 * Frontend API client — calls our Express backend, never the LLM directly.
 * Handles HTTP errors, network errors, timeouts, and JSON parsing errors.
 */

const API_URL = '/api/generate';
const TIMEOUT_MS = 60_000; // 60-second timeout

/**
 * Send user input to the backend and return the parsed JSON response.
 *
 * @param {string} input - The user's free-form text
 * @param {AbortSignal} [signal] - Optional AbortSignal for cancellation
 * @returns {Promise<object>} - The raw JSON body from the server
 */
export async function generateStudyDeck(input, signal) {
  // Build an AbortController that also respects an external signal
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  // If the caller passed an external signal, forward its abort
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Server-side error
    if (!res.ok) {
      let message = `Server error (${res.status})`;
      try {
        const body = await res.json();
        if (body.error) message = body.error;
      } catch {
        // ignore — we already have a fallback message
      }
      throw new Error(message);
    }

    // Parse response JSON
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error('The server returned an invalid response.');
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      throw new Error('The request timed out. Please try again.');
    }

    // Re-throw our own errors; wrap unknown ones
    if (err instanceof Error) throw err;
    throw new Error('An unexpected network error occurred.');
  }
}
