const { pipeline } = require("@xenova/transformers");

let extractorPromise; // ✅ prevent multiple loads

/**
 * Load model only once (thread-safe)
 */
const loadModel = async () => {
  if (!extractorPromise) {
    extractorPromise = pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return extractorPromise;
};

/**
 * Create embedding for a single string
 * @param {string} text
 * @returns {number[] | null}
 */
const createEmbedding = async (text) => {
  try {
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return null;
    }

    const extractor = await loadModel();

    const output = await extractor(text, {
      pooling: "mean",
      normalize: true
    });

    const vector = Array.from(output.data);

    // ✅ strict dimension check
    if (vector.length !== 384) {
      throw new Error(`Invalid embedding dimension: ${vector.length}`);
    }

    return vector;

  } catch (error) {
    console.error("Embedding error:", error.message);
    return null;
  }
};

module.exports = { createEmbedding };