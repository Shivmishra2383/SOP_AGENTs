function normalizeText(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function splitPageIntoChunks(pageText, pageNumber, chunkSize, overlap) {
  const cleanedText = normalizeText(pageText);
  const chunks = [];

  if (!cleanedText) {
    return chunks;
  }

  let start = 0;
  let localChunkIndex = 0;

  while (start < cleanedText.length) {
    const end = Math.min(cleanedText.length, start + chunkSize);
    const text = cleanedText.slice(start, end).trim();

    if (text) {
      chunks.push({
        text,
        pageNumber,
        localChunkIndex,
        startChar: start,
        endChar: end
      });
      localChunkIndex += 1;
    }

    if (end >= cleanedText.length) {
      break;
    }

    start += Math.max(chunkSize - overlap, 1);
  }

  return chunks;
}

/**
 * Split text into chunks with overlap and page-level metadata.
 * @param {string | Array<{ pageNumber: number, text: string }>} input
 * @param {number} chunkSize
 * @param {number} overlap
 * @returns {Array<{ text: string, pageNumber: number, chunkIndex: number, startChar: number, endChar: number }>}
 */
function splitTextIntoChunks(input, chunkSize = 1000, overlap = 100) {
  try {
    const chunks = [];

    if (Array.isArray(input)) {
      input.forEach((page, pageIndex) => {
        const pageChunks = splitPageIntoChunks(
          page?.text || "",
          page?.pageNumber || pageIndex + 1,
          chunkSize,
          overlap
        );

        pageChunks.forEach((chunk) => {
          chunks.push({
            ...chunk,
            chunkIndex: chunks.length
          });
        });
      });

      return chunks;
    }

    if (!input || typeof input !== "string") {
      return [];
    }

    return splitPageIntoChunks(input, 1, chunkSize, overlap).map((chunk, index) => ({
      ...chunk,
      chunkIndex: index
    }));
  } catch (error) {
    console.error("Chunking error:", error.message);
    return [];
  }
}

module.exports = splitTextIntoChunks;
