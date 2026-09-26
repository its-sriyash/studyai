# StudyAI

AI-Powered Study Assistant — Turn any topic into interactive flashcards.

## Overview

StudyAI is a single-page React application that takes free-form text input (topics, notes, or learning requests) and generates interactive flashcard decks using an LLM (Groq API). The user can flip cards, navigate through the deck, mark cards as correct or wrong, retest incorrect cards, and restart the session.

This is **not** a chatbot. The AI response is structured JSON that is validated before rendering — raw AI output is never displayed.

## Features

- **Free-form input** — Enter any topic, paste notes, or describe what you want to study
- **AI-generated flashcards** — 8-10 study/interview-focused cards per request
- **Card flip interaction** — Click or keyboard to reveal answers
- **Navigation** — Previous / Next / Flip controls
- **Self-assessment** — Mark each card as "Got it" or "Got it wrong"
- **Session summary** — See your total, correct, and wrong counts
- **Retest wrong answers** — Study only the cards you missed
- **Restart** — Go through the full deck again
- **Stale-request protection** — Rapid successive requests won't overwrite newer results
- **Comprehensive error handling** — Visible UI states for loading, errors, empty input, malformed JSON
- **Responsive design** — Works on desktop and mobile
- **Accessibility** — Keyboard-navigable, proper ARIA labels, semantic HTML

## Tech Stack

| Layer      | Technology          |
|------------|---------------------|
| Frontend   | React 19, Vite      |
| Styling    | Vanilla CSS         |
| Backend    | Node.js, Express    |
| LLM        | Groq API (Llama 3.3 70B) |
| Language   | JavaScript (ES Modules) |

## Architecture

```
User Input
    ↓
React (PromptInput)
    ↓
api.js → POST /api/generate
    ↓
Express Backend (server/generate.js)
    ↓
Groq API (structured JSON output)
    ↓
Backend parses & returns JSON
    ↓
validateResult.js (frontend validation)
    ↓
React state (App.jsx)
    ↓
FlashcardDeck → Flashcard components
```

The API key lives **exclusively** on the server. The frontend never touches it.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example and add your Groq API key:

```bash
cp .env.example .env
```

Edit `.env`:

```
GROQ_API_KEY=gsk_your_actual_key_here
```

Get a free key at [https://console.groq.com/keys](https://console.groq.com/keys).

## Run

Start both the Express backend and the Vite dev server:

```bash
npm run dev
```

This runs:
- **Backend** → `http://localhost:3001` (Express API)
- **Frontend** → `http://localhost:5173` (Vite dev server, proxies `/api` to backend)

Open `http://localhost:5173` in your browser.

### Run separately (optional)

```bash
# Terminal 1
npm run server

# Terminal 2
npm run client
```

## Project Structure

```
├── index.html                  # Entry HTML with SEO meta tags
├── package.json                # Scripts and dependencies
├── vite.config.js              # Vite config with API proxy
├── .env                        # API key (gitignored)
├── .env.example                # Template for environment variables
├── .gitignore
│
├── server/
│   └── generate.js             # Express backend + Groq API integration
│
└── src/
    ├── main.jsx                # React entry point
    ├── App.jsx                 # Root component + state management
    ├── index.css               # Complete design system
    │
    ├── components/
    │   ├── PromptInput.jsx     # Textarea + Generate button
    │   ├── FlashcardDeck.jsx   # Deck orchestration + session logic
    │   ├── Flashcard.jsx       # Single card with flip animation
    │   ├── ProgressBar.jsx     # Card X of Y + visual bar
    │   ├── LoadingState.jsx    # Loading spinner + message
    │   ├── ErrorState.jsx      # Error display + retry
    │   └── EmptyState.jsx      # Pre-generation placeholder
    │
    └── lib/
        ├── api.js              # API client (fetch wrapper)
        └── validateResult.js   # JSON schema validation
```

## AI Usage

AI tools (LLM-assisted coding) were used during development for:
- Generating boilerplate code structure
- Writing CSS styles and animations
- Drafting the LLM system prompt
- Writing this README

All generated code was reviewed, tested, and understood by the developer.

## Known Limitations

- **Factual accuracy** — LLM-generated flashcard content may contain inaccuracies. The validation layer ensures structural correctness (valid JSON, required fields) but cannot guarantee factual correctness.
- **Rate limits** — The Groq free tier has rate limits. Excessive rapid requests may trigger 429 errors (handled gracefully in the UI).
- **No persistence** — Flashcard decks are not saved. Refreshing the page loses the current session.
- **Single deck** — Only one deck is active at a time.

## Time Spent

_[Fill in your actual time here before submission]_

## Future Improvements

- Save decks to local storage or a database
- Export flashcards as PDF or Anki format
- Spaced repetition algorithm
- Dark/light theme toggle
- Share decks via URL
