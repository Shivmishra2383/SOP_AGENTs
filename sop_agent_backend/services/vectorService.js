const connectDB = require("../config/db");

let collection;

/**
 * Get MongoDB collection (singleton)
 */
async function getCollection() {
  if (!collection) {
    const db = await connectDB();
    collection = db.collection(process.env.COLLECTION_NAME);
    console.log("Vector collection connected");
  }
  return collection;
}

/**
 * Store vectors (upsert like Pinecone)
 */
async function storeVectors(vectors) {
  try {
    const col = await getCollection();

    if (!Array.isArray(vectors) || vectors.length === 0) {
      throw new Error("No vectors to store");
    }

    // ✅ filter valid vectors only
    const operations = vectors
      .filter(v => v.values && v.values.length === 384)
      .map(v => ({
        updateOne: {
          filter: { _id: v.id },
          update: {
            $set: {
              values: v.values,
              metadata: v.metadata || {}
            }
          },
          upsert: true
        }
      }));

    if (operations.length === 0) {
      throw new Error("No valid vectors after filtering");
    }

    await col.bulkWrite(operations);

    console.log("Vectors stored:", operations.length);

  } catch (error) {
    console.error("storeVectors error:", error.message);
    throw error;
  }
}

/**
 * Search vectors (with optional SOP filtering)
 */
async function searchVector(queryVector, topK = 5, sopId = null, allowedSopIds = null) {
  try {
    const col = await getCollection();

    if (!Array.isArray(queryVector) || queryVector.length !== 384) {
      throw new Error("Invalid query vector (must be 384 length)");
    }

    const postFilter = sopId
      ? { "metadata.sopId": sopId }
      : Array.isArray(allowedSopIds) && allowedSopIds.length > 0
        ? { "metadata.sopId": { $in: allowedSopIds } }
        : null;

    const requestedTopK = Math.max(Number(topK) || 5, 1);
    const searchLimit = postFilter ? Math.max(requestedTopK * 8, 40) : requestedTopK;

    const pipeline = [
      {
        $vectorSearch: {
          index: "vector_index",
          path: "values",
          queryVector,
          numCandidates: Math.max(searchLimit * 4, 100),
          limit: searchLimit
        }
      },
      ...(postFilter ? [{ $match: postFilter }] : []),
      {
        $project: {
          _id: 1,
          metadata: 1,
          score: { $meta: "vectorSearchScore" }
        }
      },
      {
        $limit: requestedTopK
      }
    ];

    const results = await col.aggregate(pipeline).toArray();

    return results;

  } catch (error) {
    console.error("searchVector error:", error.message);
    throw error;
  }
}

module.exports = {
  storeVectors,
  searchVector,
  getCollection // ✅ exported for delete operations
};
