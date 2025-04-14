import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateExercise(): Promise<string> {
  const prompt = `Generate a software engineering topic for a writing exercise. 
  The topic should be challenging but not too complex, suitable for explaining in both 100 and 50 words.
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
  fiftyWordResponse: string
): Promise<{
  clarity: number;
  coherence: number;
  conciseness: number;
  comments: string;
}> {
  const gradingPrompt = `You are a writing coach grading a software engineering writing exercise.
  
  Original prompt: "${prompt}"
  
  100-word response: "${hundredWordResponse}"
  50-word response: "${fiftyWordResponse}"
  
  Please grade the responses on a scale of 1-10 for:
  1. Clarity: How well the concepts are explained
  2. Coherence: How logically the ideas flow
  3. Conciseness: How effectively the word limit is used
  
  Also provide constructive feedback in 2-3 sentences.
  
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