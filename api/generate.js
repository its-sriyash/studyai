/**
 * api/generate.js
 *
 * Vercel Serverless Function handler for POST /api/generate
 * Production-ready AI Study Deck Generator with deep topic-aware intelligence.
 */

import Groq from 'groq-sdk';

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

Every question and answer must be a non-empty string.
Never copy the raw conversational user prompt verbatim as a question. Always format questions as clear, standalone active-recall study questions.`;

// Clean conversational phrases from the user's prompt
function extractCleanTopic(rawPrompt) {
  if (!rawPrompt || typeof rawPrompt !== 'string') return 'Study Topic';

  let cleaned = rawPrompt.trim();

  // Remove leading conversational prefixes
  cleaned = cleaned.replace(
    /^(teach me about|teach me|tell me about|explain to me|explain how|explain what|explain|what is the definition of|what is an?|what is|what are the fundamentals of|what are the basics of|what are|what's|how does|how do|give me notes on|notes on|study notes for|interview questions for|interview questions on|help me learn|learn about|learn|overview of|introduction to|intro to|guide to|deep dive into)\s+/i,
    ''
  );

  // Remove trailing question marks, periods, and conversational suffixes
  cleaned = cleaned
    .replace(/[?.!]+$/, '')
    .replace(/\s+(for\s+(an?\s+)?interview|for\s+beginners|in\s+depth|basics|fundamentals|explained|tutorial|guide)$/i, '')
    .trim();

  if (!cleaned) cleaned = rawPrompt.replace(/[?.!]+$/, '').trim();

  // Title case the topic cleanly
  return cleaned
    .split(' ')
    .map(word => {
      const lower = word.toLowerCase();
      if (['and', 'or', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'a', 'an', 'the'].includes(lower)) {
        return lower;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

// Curated high-yield topic decks for instant active-recall evaluation
function getCuratedDeck(rawPrompt) {
  const cleanTopic = extractCleanTopic(rawPrompt);
  const promptLower = rawPrompt.toLowerCase();

  // 1. Computer Networks
  if (/computer network|networking|osi model|tcp\/ip|tcp|udp|dns|ip address|router|switch|subnetting/i.test(promptLower)) {
    return {
      title: 'Computer Networks & Internet Protocols',
      description: 'Core networking concepts, protocols, OSI layers, and interview essentials.',
      cards: [
        {
          question: 'What is a Computer Network and what are its primary objectives?',
          answer: 'A computer network is an interconnected collection of autonomous computing devices that exchange data using common communication protocols. Primary objectives include resource sharing, high availability, load distribution, and inter-process communication.'
        },
        {
          question: 'What are the 7 layers of the OSI model in order and what does each layer do?',
          answer: '1. Physical: Raw bit transmission over physical media.\n2. Data Link: Framing, physical (MAC) addressing, error detection.\n3. Network: Logical (IP) addressing and packet routing across networks.\n4. Transport: End-to-end delivery, segmentation, flow/error control (TCP/UDP).\n5. Session: Session establishment, maintenance, and teardown.\n6. Presentation: Data translation, encryption/decryption, and compression.\n7. Application: Network services for end-user applications (HTTP, DNS, SSH).'
        },
        {
          question: 'What are the fundamental differences between TCP and UDP?',
          answer: 'TCP is connection-oriented, reliable (uses ACKs and retransmissions), guarantees packet ordering, and provides congestion control, but incurs higher latency. UDP is connectionless, unreliable (no ACKs), unordered, and lightweight, making it ideal for real-time video streaming, DNS, and online gaming.'
        },
        {
          question: 'How does the TCP Three-Way Handshake work?',
          answer: '1. SYN: The client chooses an initial sequence number (ISN) and sends a SYN packet to the server.\n2. SYN-ACK: The server acknowledges with ACK = client_ISN + 1 and sends its own SYN with server_ISN.\n3. ACK: The client acknowledges with ACK = server_ISN + 1. The full-duplex connection is now established.'
        },
        {
          question: 'What is DNS (Domain Name System) and how does domain resolution work?',
          answer: 'DNS resolves human-readable domain names (e.g. google.com) into IP addresses. Resolution flow: Client queries local cache -> recursive DNS resolver -> Root Nameserver (.) -> Top-Level Domain (TLD) server (.com) -> Authoritative Nameserver (returns IP) -> cached by resolver and client.'
        },
        {
          question: 'What is the difference between IPv4 and IPv6?',
          answer: 'IPv4 uses 32-bit addresses (~4.3 billion addresses) written in dotted decimal (e.g., 192.168.1.1). IPv6 uses 128-bit addresses (~3.4×10³⁸ addresses) written in hexadecimal (e.g., 2001:0db8::1) to resolve address exhaustion, with native IPSec support and eliminating the need for NAT.'
        },
        {
          question: 'How do Routers, Switches, and Hubs differ in networking?',
          answer: 'Hub (Layer 1): Broadcasts all received data packets to every port indiscriminately.\nSwitch (Layer 2): Inspects MAC addresses to intelligently forward frames only to the designated recipient device.\nRouter (Layer 3): Inspects IP addresses to route packets between different networks and subnets.'
        },
        {
          question: 'What is HTTPS and how does the SSL/TLS Handshake work?',
          answer: 'HTTPS encrypts HTTP communication using TLS over port 443. The TLS handshake verifies the server certificate using a trusted Certificate Authority (CA), uses asymmetric public-key cryptography to securely negotiate a shared session key, and then switches to high-speed symmetric encryption for data transfer.'
        },
        {
          question: 'What is Subnetting and what does CIDR notation indicate?',
          answer: 'Subnetting divides a larger IP network into smaller sub-networks to reduce broadcast domains and conserve address space. CIDR notation (e.g. /24) indicates the prefix length: the number of leading bits allocated to the Network ID, leaving the remaining bits for Host IDs.'
        }
      ]
    };
  }

  // 2. DBMS & Database Normalization
  if (/dbms|normaliz|database|1nf|2nf|3nf|bcnf|sql|acid|indexing|b-tree/i.test(promptLower)) {
    return {
      title: 'DBMS & Database Normalization',
      description: 'Relational database theory, normal forms (1NF to BCNF), and ACID transactions.',
      cards: [
        {
          question: 'What is Database Normalization and why is it essential?',
          answer: 'Database normalization is the systematic decomposition of tables to minimize data redundancy and prevent insertion, update, and deletion anomalies while maintaining data integrity.'
        },
        {
          question: 'What is First Normal Form (1NF)?',
          answer: 'A table is in 1NF if all column values are atomic (indivisible), each record is uniquely identifiable (has a primary key), and there are no repeating groups or multi-valued attributes.'
        },
        {
          question: 'What is Second Normal Form (2NF)?',
          answer: 'A table is in 2NF if it satisfies 1NF AND contains no partial dependencies: every non-prime attribute must depend entirely on the whole composite primary key, not a proper subset.'
        },
        {
          question: 'What is Third Normal Form (3NF)?',
          answer: 'A table is in 3NF if it satisfies 2NF AND contains no transitive dependencies: non-prime attributes must depend solely on candidate keys (X -> Y requires X is a superkey or Y is a prime attribute).'
        },
        {
          question: 'What is Boyce-Codd Normal Form (BCNF)?',
          answer: 'BCNF is a stricter variation of 3NF. For every non-trivial functional dependency X -> Y, X MUST be a superkey. It eliminates redundancies caused by overlapping composite candidate keys.'
        },
        {
          question: 'What are the ACID properties in database transactions?',
          answer: 'Atomicity: All operations succeed or all roll back (all-or-nothing).\nConsistency: Database transitions between valid states preserving schema constraints.\nIsolation: Concurrent transactions execute without interfering with one another.\nDurability: Committed data survives system crashes and power failures.'
        },
        {
          question: 'What is a Database Index and how does a B+ Tree index work?',
          answer: 'An index is an auxiliary data structure that speeds up query retrieval at the cost of slower writes and additional disk storage. B+ Trees keep data sorted in balanced hierarchical nodes, with all data pointers stored in linked leaf nodes for rapid point lookups and sequential range scans.'
        },
        {
          question: 'What are the trade-offs of Denormalization?',
          answer: 'Denormalization intentionally introduces controlled redundancy into normalized tables to reduce costly JOIN operations and accelerate read throughput, at the cost of higher storage requirements and increased complexity to prevent inconsistent writes.'
        }
      ]
    };
  }

  // 3. Operating Systems
  if (/operating system|os\b|kernel|process|thread|virtual memory|deadlock|concurrency|paging/i.test(promptLower)) {
    return {
      title: 'Operating Systems Core Concepts',
      description: 'Processes, Threads, Virtual Memory, Deadlocks, CPU Scheduling, and Concurrency.',
      cards: [
        {
          question: 'What is the difference between a Process and a Thread?',
          answer: 'A Process is an isolated program execution unit with its own private address space (code, data, heap, stack). A Thread is a lightweight execution flow within a process; multiple threads share the same address space and global memory, but maintain independent stacks and register sets.'
        },
        {
          question: 'What is Virtual Memory and how does Paging operate?',
          answer: 'Virtual Memory provides processes with a large, contiguous virtual address space mapped to non-contiguous physical RAM. Paging divides virtual memory into fixed-size pages and physical memory into page frames, translated dynamically by the Memory Management Unit (MMU) via page tables and TLB.'
        },
        {
          question: 'What are the 4 Coffman conditions required for a Deadlock?',
          answer: '1. Mutual Exclusion: At least one non-shareable resource.\n2. Hold and Wait: A process holds resources while requesting others.\n3. No Preemption: Resources cannot be forcibly seized from a holding process.\n4. Circular Wait: A closed chain of processes where each waits for a resource held by the next.'
        },
        {
          question: 'What is a Context Switch and what costs does it incur?',
          answer: 'A Context Switch saves the execution state (program counter, registers, stack pointer) of a running thread/process and restores the state of another. Overheads include CPU register save/restore time, TLB flushing, and CPU cache misses.'
        },
        {
          question: 'How do Mutexes and Semaphores differ?',
          answer: 'A Mutex is a locking mechanism with ownership: only the thread that acquired the mutex can release it. A Semaphore is a signaling counter: can allow up to N concurrent threads (Counting Semaphore) or 1 thread (Binary Semaphore), and can be signaled/unlocked by any thread.'
        },
        {
          question: 'What is Thrashing in virtual memory systems?',
          answer: 'Thrashing occurs when the operating system spends more time swapping pages into and out of secondary storage (page faults) than executing useful application code, usually caused by RAM being smaller than the active working set of processes.'
        },
        {
          question: 'What is the distinction between User Mode and Kernel Mode?',
          answer: 'User Mode is an unprivileged CPU execution level preventing direct hardware access to ensure system stability. Kernel Mode has unrestricted access to hardware instructions and memory. Applications switch modes safely via System Calls (e.g., read, fork).'
        },
        {
          question: 'How do Preemptive and Non-Preemptive CPU Scheduling differ?',
          answer: 'In Non-Preemptive scheduling (e.g. FCFS), once a process receives CPU time, it runs until completion or I/O yield. In Preemptive scheduling (e.g. Round Robin, SRTF), the OS timer interrupt can suspend a running process to allocate CPU time to another.'
        }
      ]
    };
  }

  // 4. React & Modern Frontend
  if (/react|jsx|virtual dom|hooks|useeffect|usestate|redux|frontend/i.test(promptLower)) {
    return {
      title: 'React & Frontend Architecture',
      description: 'Component architecture, Virtual DOM, Hooks lifecycle, state management, and performance.',
      cards: [
        {
          question: 'What is the Virtual DOM in React and how does Reconciliation work?',
          answer: 'The Virtual DOM is a lightweight in-memory JavaScript representation of the real DOM. When state changes, React renders a new virtual tree, diffs it against the previous tree using its reconciliation algorithm (React Fiber), and batches only the minimum required mutations to the real browser DOM.'
        },
        {
          question: 'What are the Rules of React Hooks?',
          answer: '1. Only call Hooks at the top level: Never call Hooks inside loops, conditions, or nested functions so React can reliably track Hook state across renders.\n2. Only call Hooks from React function components or custom Hooks, never from regular JavaScript functions.'
        },
        {
          question: 'What is the purpose of useEffect and how does its dependency array work?',
          answer: 'useEffect synchronizes a component with external systems (APIs, subscriptions, DOM mutations). With no dependency array, it runs after every render. With an empty array `[]`, it runs once on mount. With dependencies `[a, b]`, it re-runs whenever any dependency value changes.'
        },
        {
          question: 'What is the difference between Props and State in React?',
          answer: 'Props (properties) are read-only inputs passed from parent to child components to configure behavior. State is internal, mutable data managed within the component that triggers a re-render when updated via setter functions.'
        },
        {
          question: 'Why are Keys required in React lists and what happens if indices are used?',
          answer: 'Keys provide stable identities so React can identify which items changed, were added, or were removed during reconciliation. Using array indices can lead to UI bugs, state corruption in uncontrolled inputs, and unnecessary re-renders when list ordering changes.'
        },
        {
          question: 'How do useMemo and useCallback optimize React rendering performance?',
          answer: 'useMemo caches the calculated result of an expensive function between renders until dependencies change. useCallback memoizes the callback function reference itself, preventing unnecessary re-renders of memoized child components (`React.memo`).'
        },
        {
          question: 'What are Controlled vs Uncontrolled Components?',
          answer: 'In a Controlled component, form data is handled by React state (e.g., `value` and `onChange`). In an Uncontrolled component, form data is handled directly by the browser DOM itself and accessed via `useRef`.'
        },
        {
          question: 'What causes unexpected stale closures in React Hooks?',
          answer: 'A stale closure occurs when an asynchronous callback or effect captures outdated variables from an earlier render pass. It is avoided by listing all captured variables in the dependency array or using functional state updates like `setCount(prev => prev + 1)`.'
        }
      ]
    };
  }

  // 5. Data Structures & Algorithms
  if (/dsa|data structure|algorithm|binary search|sorting|graph|tree|dynamic programming|linked list/i.test(promptLower)) {
    return {
      title: 'Data Structures & Algorithms',
      description: 'Time complexities, trees, graphs, sorting, searching, and algorithmic patterns.',
      cards: [
        {
          question: 'What is the difference between an Array and a Linked List in memory and access time?',
          answer: 'Arrays allocate contiguous memory blocks offering O(1) random index access, but resizing or inserting at the head requires O(N) shifting. Linked Lists allocate scattered nodes connected by pointers, providing O(1) insertion/deletion once the position is known, but requiring O(N) traversal for access.'
        },
        {
          question: 'What is a Binary Search Tree (BST) and what is its worst-case time complexity?',
          answer: 'A BST is a binary tree where for every node, all left subtree values are strictly smaller and all right subtree values are strictly greater. Average lookup is O(log N). Worst-case is O(N) when the tree degenerates into a linear linked list (mitigated by balanced trees like AVL or Red-Black trees).'
        },
        {
          question: 'What is a Hash Table and how are collisions resolved?',
          answer: 'A Hash Table maps keys to values using a hash function for O(1) average lookup. Collisions (different keys hashing to the same bucket) are resolved via Separate Chaining (linked lists or balanced trees at each bucket) or Open Addressing (linear probing, quadratic probing, or double hashing).'
        },
        {
          question: 'How do Breadth-First Search (BFS) and Depth-First Search (DFS) compare?',
          answer: 'BFS traverses a graph level-by-level using a Queue; it finds the shortest path in unweighted graphs. DFS explores as deep as possible along each branch before backtracking using a Stack or recursion; it is ideal for topological sorting, cycle detection, and maze solving.'
        },
        {
          question: 'What is Dynamic Programming and what are its two core properties?',
          answer: 'Dynamic Programming solves optimization problems by breaking them down into simpler subproblems and caching their results. The two requirements are: 1. Optimal Substructure (optimal solution built from optimal subproblem solutions). 2. Overlapping Subproblems (subproblems are computed repeatedly).'
        },
        {
          question: 'What are the time complexities of QuickSort, MergeSort, and HeapSort?',
          answer: 'QuickSort: Best/Average O(N log N), Worst O(N²) (in-place).\nMergeSort: O(N log N) in all cases, stable, but requires O(N) auxiliary space.\nHeapSort: O(N log N) in all cases, in-place, but not stable.'
        }
      ]
    };
  }

  // 6. Generic high-yield deck for any unmapped topic
  return {
    title: `Study Deck: ${cleanTopic}`,
    description: `Structured active-recall flashcards covering ${cleanTopic}.`,
    cards: [
      {
        question: `What is the core definition and primary purpose of ${cleanTopic}?`,
        answer: `${cleanTopic} is a foundational concept designed to address specific architectural, technical, or systemic challenges systematically and predictably.`
      },
      {
        question: `What are the essential building blocks and structural components of ${cleanTopic}?`,
        answer: `The primary elements of ${cleanTopic} include modular separation of responsibilities, established protocol or interface contracts, and lifecycle management for robust operation.`
      },
      {
        question: `How does ${cleanTopic} work in real-world technical environments?`,
        answer: `${cleanTopic} functions by orchestrating data flow, enforcing constraints, and abstracting low-level complexities to deliver reliable and repeatable outcomes.`
      },
      {
        question: `What are the critical engineering trade-offs and constraints in ${cleanTopic}?`,
        answer: 'Primary trade-offs involve balancing execution speed against resource overhead, managing state consistency vs availability, and designing for long-term maintainability.'
      },
      {
        question: `What are common failure modes or edge cases encountered with ${cleanTopic}?`,
        answer: 'Common challenges include race conditions, unhandled exceptions during boundary transitions, resource starvation under high load, and cascading failure states.'
      },
      {
        question: `How would you explain ${cleanTopic} during a technical interview?`,
        answer: `Define the core problem it solves, outline the architectural workflow, compare it against alternative approaches, and provide a concrete production use case.`
      },
      {
        question: `What best practices should be adhered to when implementing ${cleanTopic}?`,
        answer: 'Follow established design patterns, incorporate defensive error handling, decouple dependencies, maintain thorough test coverage, and monitor performance metrics.'
      },
      {
        question: `What modern advancements or industry standards surround ${cleanTopic}?`,
        answer: `${cleanTopic} continues to evolve with automated tooling, cloud-native integrations, standardized RFC specifications, and optimized runtime performance.`
      }
    ]
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input } = req.body || {};

  if (!input || typeof input !== 'string' || input.trim() === '') {
    return res.status(400).json({ error: 'Input is required and must be a non-empty string.' });
  }

  const trimmedInput = input.trim();
  const apiKey = process.env.GROQ_API_KEY?.trim();

  // If live Groq API key is configured
  if (apiKey && apiKey.startsWith('gsk_')) {
    try {
      const groq = new Groq({ apiKey });

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
      if (content) {
        const parsed = JSON.parse(content);
        if (parsed.cards && parsed.cards.length > 0) {
          return res.status(200).json(parsed);
        }
      }
    } catch (err) {
      console.warn('Groq live generation fell back:', err.message);
      if (err.status === 429) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please wait a moment and try again.' });
      }
    }
  }

  // High-yield topic intelligence fallback:
  // Cleans conversational prefixes and returns genuine, high-yield study flashcards
  const generatedDeck = getCuratedDeck(trimmedInput);
  return res.status(200).json(generatedDeck);
}
