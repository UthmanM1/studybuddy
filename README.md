# 📚 StudyBuddy — AI-Powered Study & Revision App

> A React Native revision app that uses the OpenAI API to turn any notes or document into flashcards, quizzes, and study summaries. Built as a personal project to explore AI integration in mobile apps.

**Status:** Personal Project — v1.0 Complete  
**Platform:** iOS & Android (Expo)  
**Developer:** Uthman Mustapha

---

## 📱 What the App Does

Students paste or upload their notes, and the AI generates flashcards, multiple-choice quizzes, and a concise summary. It tracks which cards they find difficult and prioritises them in future sessions — a spaced-repetition approach backed by OpenAI.

This project was built specifically to get hands-on with OpenAI API integration in a mobile context, which is directly applicable to AI-powered features in any platform (matchmaking, content recommendations, intelligent search, etc.).

---

## ✨ Features

### 📝 Notes Input
- Paste text directly or upload a PDF via `expo-document-picker`
- PDF text extraction via a lightweight Node.js API endpoint (pdf-parse)
- Notes saved per-subject in AsyncStorage (offline-first)

### 🤖 AI Generation (OpenAI GPT-4o)
- **Flashcards** — term/definition pairs extracted from notes
- **Quiz** — 5-question multiple-choice with explanations for wrong answers
- **Summary** — concise bullet-point overview (max 200 words)
- Structured JSON responses from OpenAI using `response_format: { type: "json_object" }`
- Loading skeleton while AI generates content

### 🃏 Flashcard Mode
- Swipe right = got it, swipe left = needs more practice
- Card flip animation using React Native Animated API
- Difficulty tracking stored in AsyncStorage per card per subject
- "Hard cards only" mode — surfaces only cards marked difficult

### 📊 Quiz Mode
- Timed multiple-choice (30 seconds per question, configurable)
- Score screen with correct/incorrect breakdown
- Wrong answers shown with AI-generated explanation
- Best score per subject stored in AsyncStorage

### 📈 Progress Tracking
- Subject-level stats — total cards, mastered cards, quiz average
- Streak counter (daily study habit)
- Simple bar chart of quiz scores over time

### 🔔 Study Reminders
- Daily notification via `expo-notifications` at user-set time
- "You haven't studied [subject] in 3 days" smart reminders

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Expo SDK ~52) |
| Language | TypeScript |
| Navigation | Expo Router (file-based) |
| AI | OpenAI API (GPT-4o, structured JSON output) |
| Local Storage | AsyncStorage (offline-first) |
| Auth | Firebase Auth (Google Sign-In) |
| Backend | Node.js / Express (PDF extraction + OpenAI proxy) |
| Hosting | Vercel (serverless functions) |
| Animations | React Native Animated API |
| Notifications | expo-notifications |
| Documents | expo-document-picker |

---

## 🎨 Design

- **Palette:** Deep violet `#7C3AED` · Warm yellow `#FCD34D` · Light lavender `#F5F3FF`
- Card flip animation — smooth 3D perspective flip on tap
- Swipe gestures on flashcards using `PanResponder`
- Progress rings for subject mastery percentage

---

## 📂 Project Structure

```
studybuddy/
├── app/                            # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx               # Subject dashboard
│   │   ├── flashcards.tsx          # Flashcard session
│   │   ├── quiz.tsx                # Quiz mode
│   │   └── progress.tsx            # Stats and streaks
│   ├── subject/[id].tsx            # Subject detail screen
│   └── _layout.tsx
├── components/
│   ├── FlashCard.tsx               # Animated flip card
│   ├── QuizQuestion.tsx            # MCQ component
│   ├── ProgressRing.tsx            # SVG mastery ring
│   └── SkeletonLoader.tsx          # AI loading state
├── lib/
│   ├── openai.ts                   # OpenAI API client
│   ├── storage.ts                  # AsyncStorage helpers
│   └── prompts.ts                  # System prompts
├── api/                            # Vercel serverless functions
│   ├── generate.ts                 # OpenAI proxy endpoint
│   └── extract-pdf.ts              # PDF text extraction
├── types/
│   └── index.ts
└── package.json
```

---

## 🤖 OpenAI Integration

```typescript
// lib/openai.ts — generate flashcards from notes

export async function generateFlashcards(notes: string): Promise<Flashcard[]> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'flashcards',
      content: notes,
    }),
  });

  const { cards } = await response.json();
  return cards; // [{ term: string, definition: string, difficulty: 0 }]
}

// System prompt (lib/prompts.ts)
export const FLASHCARD_PROMPT = `
You are a study assistant. Given the notes below, extract the most important 
concepts and generate flashcards. Return ONLY valid JSON in this format:
{
  "cards": [
    { "term": "string", "definition": "string" }
  ]
}
Generate between 8 and 15 cards. Focus on testable concepts.
`;
```

---

## 🔄 Spaced Repetition Logic

```typescript
// Difficulty updates on swipe
function updateCardDifficulty(cardId: string, correct: boolean): void {
  const current = getDifficulty(cardId); // 0 = easy, 1 = medium, 2 = hard
  const next = correct
    ? Math.max(0, current - 1)  // gets easier
    : Math.min(2, current + 1); // gets harder
  setDifficulty(cardId, next);
}

// "Hard cards first" sort
const prioritised = cards.sort((a, b) =>
  getDifficulty(b.id) - getDifficulty(a.id)
);
```

---

## 🚀 Deployment

- EAS Build for iOS and Android
- API endpoints on Vercel (serverless, zero cold-start for small payloads)
- OpenAI API key stored as Vercel environment variable — never in the app bundle

---

## 📋 Key Learnings

- Structured JSON output from OpenAI (`response_format`) makes parsing reliable — no regex hacks
- Proxying OpenAI calls through a serverless function keeps the API key server-side
- `PanResponder` for swipe gestures requires careful threshold tuning to avoid accidental swipes
- AsyncStorage as offline-first storage works well for study data — no internet needed during a session

---

## 👨‍💻 Developer

**Uthman Mustapha** — React Native Developer  
[github.com/UthmanM1](https://github.com/UthmanM1)
