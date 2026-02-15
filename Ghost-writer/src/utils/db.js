import Dexie from 'dexie';

export const db = new Dexie('GhostWriterDB');

// Define tables and indexes
db.version(1).stores({
  // &id = Primary Key (unique)
  // url = Index for fast searching by URL
  // timestamp = Index for sorting by date
  snippets: '++id, title, url, timestamp, siteName'
});


export async function getSnippetCount() {
  return await db.snippets.count();
}

export async function getRecentSnippets() {
  return await db.snippets
    .orderBy('timestamp')
    .reverse() // Newest first
    .toArray();
}

export async function deleteSnippet(id) {
  await db.snippets.delete(id);
}

export function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Update the saveSnippet function to accept an embedding
export async function saveSnippet(data, embedding = null) {
  try {
    const existing = await db.snippets.where('url').equals(window.location.href).first();
    if (existing) return existing.id;

    const id = await db.snippets.add({
      ...data,
      url: window.location.href,
      timestamp: Date.now(),
      embedding: embedding, // <--- SAVING THE VECTOR
    });

    console.log(`Saved snippet with ID: ${id}`);
    return id;
  } catch (error) {
    console.error("Failed to save:", error);
  }
}

// Function to find similar notes
export async function findSimilarSnippets(currentEmbedding) {
  if (!currentEmbedding) return [];

  // Get all snippets that HAVE an embedding
  const allSnippets = await db.snippets.filter(s => !!s.embedding).toArray();

  // Calculate score for every snippet
  const scored = allSnippets.map(snippet => {
    return {
      ...snippet,
      score: cosineSimilarity(currentEmbedding, snippet.embedding)
    };
  });

  // Return top 3 matches (score > 0.5 means reasonably related)
  return scored
    .filter(s => s.score > 0.4)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}