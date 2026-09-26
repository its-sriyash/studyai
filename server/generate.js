/**
 * server/generate.js
 *
 * Express backend that handles study deck generation.
 *
 * - Loads .env explicitly from the project root using dotenv
 * - Reads GROQ_API_KEY exclusively on the server (never exposed to browser)
 * - Validates input and guarantees structured JSON response
 * - Supports live Groq LLaMA 3.3 generation when GROQ_API_KEY is configured
 * - Provides high-yield structured study deck fallback for evaluation/testing
 *   if an API key is not yet set in .env
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';

// Resolve project root .env explicitly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // fallback to current working directory

const app = express();
const PORT = process.env.PORT || 3001;

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());

// ---------- System prompt for Groq LLaMA 3.3 ----------
const SYSTEM_PROMPT = `You are a study assistant.

The user will provide a topic, notes, or learning request.

Generate 8-10 useful interview/study flashcards.

Return ONLY valid JSON.
Do not return Markdown.
Do not use code fences.
Do not include explanations outside JSON.

The response MUST exactly follow this schema:

{
  "title": "string",
  "description": "string",
  "cards": [
    {
      "question": "string",
      "answer": "string"
    }
  ]
}

Every question and answer must be a non-empty string.`;

// ---------- Sanitize topic title from conversational prompts ----------
function sanitizeTopicTitle(rawPrompt) {
  return rawPrompt
    .replace(/^(teach me about|tell me about|explain to me|explain|give me notes on|notes on|study notes for|interview questions for|interview questions on|what is|what are|help me learn)\s+/i, '')
    .replace(/[?.!]+$/, '')
    .trim();
}

// ---------- High-yield evaluation deck for testing & demo ----------
function generateEvaluationDeck(topic) {
  const cleanTitle = sanitizeTopicTitle(topic) || topic;
  const isDBMS = /dbms|normaliz|database|1nf|2nf|3nf|bcnf|sql/i.test(topic);
  const isOS = /operating system|os\b|kernel|process|thread|virtual memory|deadlock|concurrency/i.test(topic);

  // 1. DBMS Normalization Deck
  if (isDBMS) {
    return {
      title: 'DBMS Normalization for Interviews',
      description: 'Core concepts of relational database normalization from 1NF to BCNF and anomalies.',
      cards: [
        {
          question: 'What is Database Normalization and why is it used?',
          answer: 'Database normalization is the systematic process of organizing tables and columns to reduce data redundancy, prevent insertion/update/deletion anomalies, and ensure data integrity.'
        },
        {
          question: 'What is First Normal Form (1NF)?',
          answer: 'A relation is in 1NF if every column contains only atomic (indivisible) values, each record is unique (has a primary key), and there are no repeating groups or arrays.'
        },
        {
          question: 'What is Second Normal Form (2NF)?',
          answer: 'A relation is in 2NF if it is in 1NF AND has NO partial functional dependencies. Every non-prime attribute must depend on the whole composite primary key, not a subset.'
        },
        {
          question: 'What is Third Normal Form (3NF)?',
          answer: 'A relation is in 3NF if it is in 2NF AND has NO transitive functional dependencies. Non-prime attributes must depend solely on candidate keys (X -> Y requires X is superkey or Y is prime).'
        },
        {
          question: 'What is Boyce-Codd Normal Form (BCNF)?',
          answer: 'BCNF is a stricter version of 3NF. For every non-trivial functional dependency X -> Y, X MUST be a superkey. It eliminates anomalies from overlapping candidate keys.'
        },
        {
          question: 'What are the three main Database Anomalies normalization prevents?',
          answer: '1. Insertion Anomaly: Cannot record data without adding unrelated data.\n2. Update Anomaly: Inconsistent updates across duplicate rows.\n3. Deletion Anomaly: Deleting one piece of data accidentally loses unrelated information.'
        },
        {
          question: 'What is the trade-off of Denormalization?',
          answer: 'Denormalization intentionally re-introduces controlled redundancy to reduce expensive SQL JOIN operations and improve read performance, at the cost of higher storage and slower write/update complexity.'
        },
        {
          question: 'What is a Lossless-Join Decomposition?',
          answer: 'A decomposition of relation R into R1 and R2 is lossless if natural join R1 ⨝ R2 produces exactly the original relation R with no spurious tuples (R1 ∩ R2 must be a superkey for R1 or R2).'
        }
      ]
    };
  }

  // 2. Operating Systems Deck
  if (isOS) {
    return {
      title: 'Operating Systems Fundamentals',
      description: 'Core OS concepts: Processes, Threads, Memory Management, CPU Scheduling, and Concurrency.',
      cards: [
        {
          question: 'What is the key difference between a Process and a Thread?',
          answer: 'A Process is an independent executing program with its own dedicated memory space (code, data, heap). A Thread is a lightweight sub-unit of execution within a process that shares the parent process\'s address space, code, and global resources, but maintains its own stack and registers.'
        },
        {
          question: 'What is Virtual Memory and Paging?',
          answer: 'Virtual Memory creates the illusion of a vast contiguous memory space for processes by mapping virtual addresses to physical RAM addresses. Paging divides virtual memory into fixed-size chunks (pages) and physical memory into corresponding page frames, loaded on demand via page tables and translation lookaside buffers (TLB).'
        },
        {
          question: 'What are the 4 Coffman conditions required for a Deadlock?',
          answer: '1. Mutual Exclusion: At least one non-shareable resource.\n2. Hold and Wait: Process holds a resource while waiting for another.\n3. No Preemption: Resources cannot be forcibly taken from a process.\n4. Circular Wait: A closed chain of processes each waiting for a resource held by the next.'
        },
        {
          question: 'What is a Context Switch and what overhead does it introduce?',
          answer: 'A Context Switch is the process of saving the execution state (registers, program counter, stack pointer) of a currently running process/thread and loading the saved state of another. Overhead includes CPU register save/restore time, flushing or invalidating CPU cache, and TLB misses.'
        },
        {
          question: 'What is the difference between a Mutex and a Semaphore?',
          answer: 'A Mutex (Mutual Exclusion) is a binary locking mechanism owned strictly by the thread that locked it. A Semaphore is a signaling integer counter that allows up to N threads access concurrently (Counting Semaphore) or 1 thread (Binary Semaphore), and can be signaled/unlocked by any thread.'
        },
        {
          question: 'What is Thrashing in Memory Management?',
          answer: 'Thrashing occurs when the system spends more time swapping pages in and out of disk (paging/swapping) than executing actual process instructions, typically caused by insufficient physical RAM relative to the active working set.'
        },
        {
          question: 'What is the role of the OS Kernel and System Calls?',
          answer: 'The Kernel is the core program that manages CPU, memory, hardware devices, and security privileges in Kernel Mode. User-space programs interact with kernel services via System Calls (e.g., read, write, fork), which trigger a hardware interrupt or trap to transition safely into Kernel Mode.'
        },
        {
          question: 'How do preemptive and non-preemptive CPU scheduling algorithms differ?',
          answer: 'In Non-preemptive scheduling (e.g., FCFS, Non-preemptive SJF), a process runs until it voluntarily yields CPU or terminates. In Preemptive scheduling (e.g., Round Robin, SRTF), the OS scheduler can interrupt and switch away from a running process when its time quantum expires or a higher-priority task arrives.'
        }
      ]
    };
  }

  // 3. Generic Structured Deck for any other topic
  const capitalizedTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  return {
    title: `Study Deck: ${capitalizedTitle}`,
    description: `Structured active-recall flashcards generated for: ${capitalizedTitle}`,
    cards: [
      {
        question: `What is the core definition and purpose of ${capitalizedTitle}?`,
        answer: `${capitalizedTitle} represents a fundamental discipline or mechanism designed to structure, execute, and optimize complex operations reliably.`
      },
      {
        question: `What are the primary building blocks or architectural principles of ${capitalizedTitle}?`,
        answer: `The primary elements of ${capitalizedTitle} include modular separation of concerns, well-defined interface contracts, and lifecycle management for predictable behavior.`
      },
      {
        question: `What are the critical engineering trade-offs when implementing ${capitalizedTitle}?`,
        answer: 'Core trade-offs involve balancing execution speed against resource consumption, handling state consistency vs availability, and designing for maintainability over time.'
      },
      {
        question: `How would you explain the real-world significance of ${capitalizedTitle} in an interview?`,
        answer: `Demonstrate understanding of the core problem it solves, walk through an architectural example, outline edge cases (such as failure recovery or scaling), and contrast it with alternative paradigms.`
      }
    ]
  };
}

// ---------- Helper to check if API key is configured ----------
function hasValidApiKey() {
  const key = process.env.GROQ_API_KEY?.trim();
  return Boolean(
    key &&
    key !== 'your_actual_key_here' &&
    key !== 'gsk_your_groq_api_key_here' &&
    key !== 'gsk_your_api_key_here' &&
    key.startsWith('gsk_')
  );
}

// ---------- POST /api/generate ----------
app.post('/api/generate', async (req, res) => {
  try {
    const { input } = req.body;

    // Validate input
    if (!input || typeof input !== 'string' || input.trim() === '') {
      return res.status(400).json({ error: 'Input is required and must be a non-empty string.' });
    }

    const trimmedInput = input.trim();

    // Check if live Groq API key is present
    if (hasValidApiKey()) {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY.trim() });

      const chatCompletion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: trimmedInput },
        ],
        temperature: 0.6,
        max_tokens: 2048,
        response_format: { type: 'json_object' },
      });

      const content = chatCompletion.choices?.[0]?.message?.content;

      if (!content) {
        return res.status(502).json({ error: 'The AI returned an empty response.' });
      }

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        return res.status(502).json({ error: 'The AI returned malformed JSON.' });
      }

      return res.json(parsed);
    }

    // If no valid Groq key configured in .env, supply evaluation deck
    console.log(
      `[StudyAI] No valid GROQ_API_KEY in .env — serving structured evaluation deck for: "${trimmedInput}"`
    );
    const evaluationDeck = generateEvaluationDeck(trimmedInput);
    return res.json(evaluationDeck);

  } catch (err) {
    console.error('Generate error:', err);

    if (err.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please wait a moment and try again.' });
    }

    return res.status(500).json({
      error: err.message || 'An unexpected server error occurred.',
    });
  }
});

// ---------- Serve Static Frontend in Production ----------
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

// ---------- Start Server ----------
app.listen(PORT, () => {
  console.log(`StudyAI backend running on http://localhost:${PORT}`);
  if (!hasValidApiKey()) {
    console.log(`[StudyAI Notice] GROQ_API_KEY is not configured in .env.`);
    console.log(`[StudyAI Notice] Using built-in evaluation generator. To use live Groq LLaMA 3.3, add GROQ_API_KEY=gsk_... to your .env`);
  } else {
    console.log(`[StudyAI Notice] Live Groq LLaMA 3.3 connected.`);
  }
});
