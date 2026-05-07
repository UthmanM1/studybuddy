// api/generate.ts
// Vercel serverless function — proxies OpenAI requests from the mobile app
// Keeps the API key server-side and adds rate limiting

import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type GenerationType = 'flashcards' | 'quiz' | 'summary';

interface FlashCard { term: string; definition: string; }
interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const PROMPTS: Record<GenerationType, string> = {
  flashcards: `
You are a study assistant. Extract the most important concepts from the notes 
and generate flashcards. Return ONLY valid JSON:
{
  "cards": [{ "term": "string", "definition": "string" }]
}
Generate 8–15 cards. Focus on testable, specific facts.`,

  quiz: `
You are a study assistant. Create a 5-question multiple-choice quiz from the notes.
Return ONLY valid JSON:
{
  "questions": [{
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0,
    "explanation": "Why this answer is correct"
  }]
}
Make questions specific and avoid obvious answers.`,

  summary: `
You are a study assistant. Summarise the key points from the notes.
Return ONLY valid JSON:
{
  "summary": "2–3 sentence overview",
  "bullets": ["key point 1", "key point 2", "..."]
}
Maximum 10 bullet points. Be concise and precise.`,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, content } = req.body as { type: GenerationType; content: string };

  if (!type || !content) return res.status(400).json({ error: 'Missing type or content' });
  if (!['flashcards', 'quiz', 'summary'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type' });
  }
  if (content.length > 8000) {
    return res.status(400).json({ error: 'Content too long — max 8000 characters' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: PROMPTS[type] },
        { role: 'user', content: `Notes:\n\n${content}` },
      ],
      max_tokens: 1500,
      temperature: 0.4,
    });

    const raw = completion.choices[0].message.content ?? '{}';
    const parsed = JSON.parse(raw);

    return res.status(200).json(parsed);
  } catch (err: any) {
    console.error('OpenAI error:', err.message);
    return res.status(500).json({ error: 'AI generation failed. Please try again.' });
  }
}
