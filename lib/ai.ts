import OpenAI from 'openai';
import { Difficulty, Category } from '@/components/exercise-settings';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const difficultyPrompts = {
  beginner: 'The topic should be fundamental and easy to understand, suitable for someone new to software engineering.',
  intermediate: 'The topic should be moderately complex, requiring some technical knowledge but not expert-level understanding.',
  advanced: 'The topic should be complex and challenging, suitable for experienced software engineers.'
};

const categoryPrompts = {
  frontend: 'Focus on frontend development concepts, frameworks, or best practices.',
  backend: 'Focus on backend development concepts, server-side technologies, or database systems.',
  devops: 'Focus on DevOps practices, tools, or infrastructure concepts.',
  architecture: 'Focus on software architecture patterns, design principles, or system design.',
  general: 'Focus on general software engineering concepts, practices, or methodologies.'
};

export async function generateExercise(
  difficulty: Difficulty = 'intermediate',
  category: Category = 'general'
): Promise<string> {
  const prompt = `Generate a software engineering topic for a writing exercise.
  ${difficultyPrompts[difficulty]}
  ${categoryPrompts[category]}
  The topic should be suitable for explaining in both 100 and 50 words.
  Return only the topic, nothing else.`;

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-3.5-turbo",
  });

  return completion.choices[0].message.content || "Explain the concept of microservices in simple terms";
}

export async function gradeSubmission(
  prompt: string,
  hundredWordResponse: string,
  fiftyWordResponse: string,
  difficulty: Difficulty
): Promise<{
  clarity: number;
  coherence: number;
  conciseness: number;
  comments: string;
}> {
  const difficultyContext = {
    beginner: 'Consider that this is a beginner-level submission.',
    intermediate: 'Consider that this is an intermediate-level submission.',
    advanced: 'Consider that this is an advanced-level submission.'
  };

  const gradingPrompt = `You are a writing coach grading a software engineering writing exercise.
  
  Original prompt: "${prompt}"
  ${difficultyContext[difficulty]}
  
  100-word response: "${hundredWordResponse}"
  50-word response: "${fiftyWordResponse}"
  
  Please grade the responses on a scale of 1-10 for:
  1. Clarity: How well the concepts are explained
  2. Coherence: How logically the ideas flow
  3. Conciseness: How effectively the word limit is used
  
  Also provide constructive feedback in 2-3 sentences, considering the difficulty level.
  
  Return the response in this exact JSON format:
  {
    "clarity": number,
    "coherence": number,
    "conciseness": number,
    "comments": "string"
  }`;

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: gradingPrompt }],
    model: "gpt-3.5-turbo",
    response_format: { type: "json_object" }
  });

  const response = completion.choices[0].message.content;
  return JSON.parse(response || '{"clarity":0,"coherence":0,"conciseness":0,"comments":"Error grading submission"}');
} 