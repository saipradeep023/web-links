import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function semanticSearch(query, websites) {
  if (!query.trim() || websites.length === 0) return [];

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const websiteList = websites.map(w => ({
    id: w.id,
    title: w.title || '',
    description: w.description || '',
    url: w.url || '',
    category: w.categoryName || 'Other',
  }));

  const prompt = `You are a smart personal bookmark search assistant.

The user has these saved websites (JSON):
${JSON.stringify(websiteList, null, 2)}

User's search query: "${query}"

Identify which websites are semantically relevant to the query. Match by meaning, topic, and concepts — not just exact keywords. A website about "machine learning" is relevant to a query about "AI". A website about "color theory" is relevant to "design".

Return ONLY a raw JSON array of the matching website IDs. No explanation, no markdown formatting.
If nothing matches, return: []
Example output: ["abc123", "def456"]`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();

  const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
  const match = cleaned.match(/\[[\s\S]*?\]/);
  if (!match) return [];

  const ids = JSON.parse(match[0]);
  if (!Array.isArray(ids)) return [];

  return ids.map(id => websites.find(w => w.id === id)).filter(Boolean);
}
