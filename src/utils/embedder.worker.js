import { pipeline, env } from '@xenova/transformers';

// 1. Configure to run locally in the extension
// This stops it from trying to load from a remote server dynamically which extensions hate.
env.allowLocalModels = false; // We will fetch from HuggingFace CDN for now to keep the bundle small
env.useBrowserCache = true;   // Cache the model so we don't download 30MB every time

let embedder = null;

// 2. The Singleton Loader
// We only want to load the model ONCE.
async function getEmbedder() {
  if (!embedder) {
    console.log("👻 Worker: Loading AI Model... (This happens only once)");
    
    // We use 'feature-extraction' to turn text into vectors
    // 'Xenova/all-MiniLM-L6-v2' is the industry standard for fast, small embeddings.
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      quantized: true, // Uses less memory
    });
    
    console.log("👻 Worker: AI Model Loaded.");
  }
  return embedder;
}

// 3. Listen for messages from React
self.onmessage = async (event) => {
  const { text, type } = event.data;

  if (type === 'embed') {
    try {
      const extractor = await getEmbedder();
      
      // Generate the vector
      const output = await extractor(text, { pooling: 'mean', normalize: true });
      
      // Convert Float32Array to a normal Array to send back
      const embedding = Array.from(output.data);
      
      // Send answer back to React
      self.postMessage({ status: 'complete', embedding });
      
    } catch (error) {
      console.error("Worker Error:", error);
      self.postMessage({ status: 'error', error: error.message });
    }
  }
};