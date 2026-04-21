const axios = require("axios");
const SOP = require("../models/SOP");
const { createEmbedding } = require("./embeddingService");
const { searchVector } = require("./vectorService");

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
  "how", "i", "in", "is", "it", "of", "on", "or", "that", "the",
  "this", "to", "was", "what", "when", "where", "which", "who",
  "why", "with", "your"
]);

function extractKeywords(question) {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function buildSnippet(text, keywords) {
  if (!text) {
    return "";
  }

  const normalizedText = text.replace(/\s+/g, " ").trim();
  if (normalizedText.length <= 500) {
    return normalizedText;
  }

  const lowerText = normalizedText.toLowerCase();
  const matchIndexes = keywords
    .map((keyword) => lowerText.indexOf(keyword))
    .filter((index) => index >= 0);

  if (matchIndexes.length === 0) {
    return normalizedText.slice(0, 500);
  }

  const start = Math.max(0, matchIndexes[0] - 180);
  const end = Math.min(normalizedText.length, matchIndexes[0] + 320);
  return normalizedText.slice(start, end);
}

function formatCitation(metadata = {}) {
  const title = metadata.title || metadata.originalFileName || "SOP";
  const page = metadata.pageNumber ? `Page ${metadata.pageNumber}` : "Page unknown";
  const section = Number.isInteger(metadata.chunkIndex)
    ? `Chunk ${metadata.chunkIndex + 1}`
    : "Chunk";

  return `${title} (${page}, ${section})`;
}

function normalizeSources(results = []) {
  return results.slice(0, 5).map((result) => ({
    sopId: result.metadata?.sopId || "",
    title: result.metadata?.title || "Untitled SOP",
    fileName: result.metadata?.originalFileName || result.metadata?.fileName || "",
    pageNumber: result.metadata?.pageNumber || null,
    chunkIndex: result.metadata?.chunkIndex ?? null,
    score: Number(result.score || 0),
    excerpt: result.metadata?.text || "",
    citation: formatCitation(result.metadata)
  }));
}

async function fallbackTextSearch(question, sopId = null, topK = 5, allowedSopIds = []) {
  const keywords = extractKeywords(question);
  const filter = sopId
    ? { _id: sopId }
    : Array.isArray(allowedSopIds) && allowedSopIds.length > 0
      ? { _id: { $in: allowedSopIds } }
      : { _id: null };

  const docs = await SOP.find(filter)
    .select("title fileName originalFileName pages textContent")
    .lean();

  return docs
    .flatMap((doc) => {
      const pages = Array.isArray(doc.pages) && doc.pages.length > 0
        ? doc.pages
        : [{ pageNumber: 1, text: doc.textContent || "" }];

      return pages.map((page, pageIndex) => {
        const haystack = `${doc.title || ""} ${page.text || ""}`.toLowerCase();
        const score = keywords.reduce(
          (total, keyword) => total + (haystack.includes(keyword) ? 1 : 0),
          0
        );

        return {
          _id: `fallback_${doc._id}_${pageIndex}`,
          score,
          metadata: {
            text: buildSnippet(page.text || "", keywords),
            sopId: String(doc._id),
            title: doc.title,
            fileName: doc.fileName,
            originalFileName: doc.originalFileName,
            pageNumber: page.pageNumber || pageIndex + 1,
            chunkIndex: pageIndex
          }
        };
      });
    })
    .filter((doc) => doc.score > 0 && doc.metadata.text)
    .sort((a, b) => b.score - a.score)
    .slice(0, Number(topK));
}

function buildPrompt(question, context) {
  return `
You are OpsMind AI, an enterprise SOP assistant.

Rules:
- Answer ONLY from the context.
- If the answer is not fully supported by the context, reply exactly: "I don't know based on the uploaded SOPs."
- Cite the supporting sources inline using the exact citation labels provided.
- Never invent policy details, page numbers, or process steps.
- Keep the answer concise and actionable.

Context:
${context}

Question:
${question}

Answer:
`;
}

function normalizeAnswer(answer) {
  const cleaned = String(answer || "").trim();

  if (!cleaned || /^i don't know$/i.test(cleaned)) {
    return "I don't know based on the uploaded SOPs.";
  }

  return cleaned;
}

async function callOllama(prompt) {
  const response = await axios.post(
    "http://localhost:11434/api/generate",
    {
      model: process.env.OLLAMA_MODEL || "phi",
      prompt,
      stream: false
    },
    {
      timeout: 60000
    }
  );

  return {
    provider: "ollama",
    answer: normalizeAnswer(response.data?.response)
  };
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await axios.post(
    url,
    {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 700
      }
    },
    {
      timeout: 60000
    }
  );

  const answer =
    response.data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("\n")
      .trim() || "";

  return {
    provider: "gemini",
    answer: normalizeAnswer(answer)
  };
}

async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY");
  }

  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model,
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    },
    {
      timeout: 60000,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    }
  );

  return {
    provider: "groq",
    answer: normalizeAnswer(response.data?.choices?.[0]?.message?.content)
  };
}

async function generateAnswer(prompt) {
  const errors = [];

  try {
    return await callOllama(prompt);
  } catch (error) {
    console.error("Ollama error:", error.message);
    errors.push(`Ollama: ${error.message}`);
  }

  try {
    return await callGemini(prompt);
  } catch (error) {
    console.error("Gemini fallback error:", error.message);
    errors.push(`Gemini: ${error.message}`);
  }

  try {
    return await callGroq(prompt);
  } catch (error) {
    console.error("Groq fallback error:", error.message);
    errors.push(`Groq: ${error.message}`);
  }

  return {
    provider: null,
    answer: null,
    errors
  };
}

const askAI = async ({ question, sopId = null, topK = 5, allowedSopIds = [] }) => {
  try {
    if (!question || typeof question !== "string" || question.trim() === "") {
      throw new Error("Question is required");
    }

    if (!sopId && (!Array.isArray(allowedSopIds) || allowedSopIds.length === 0)) {
      return {
        answer: "No SOP documents are available for your account yet.",
        sources: [],
        modelAvailable: true,
        provider: null
      };
    }

    const queryVector = await createEmbedding(question);
    let results = [];

    if (queryVector) {
      try {
        results = await searchVector(queryVector, topK, sopId, allowedSopIds);
      } catch (searchError) {
        console.error("Vector search unavailable:", searchError.message);
      }
    }

    if (!results || results.length === 0) {
      results = await fallbackTextSearch(question, sopId, topK, allowedSopIds);
    }

    if (sopId) {
      results = results.filter((result) => result.metadata?.sopId === sopId);
    } else if (Array.isArray(allowedSopIds) && allowedSopIds.length > 0) {
      const allowedSet = new Set(allowedSopIds);
      results = results.filter((result) => allowedSet.has(result.metadata?.sopId));
    }

    const strongResults = results.filter((result) => Number(result.score) > 0.6);
    if (strongResults.length > 0) {
      results = strongResults;
    }

    if (results.length === 0) {
      return {
        answer: "I don't know based on the uploaded SOPs.",
        sources: [],
        modelAvailable: true,
        provider: null
      };
    }

    results.sort((a, b) => Number(b.score) - Number(a.score));
    const sources = normalizeSources(results);

    const context = sources
      .map((source, index) => `${index + 1}. ${source.citation}\n${source.excerpt}`)
      .join("\n\n")
      .slice(0, 3000);

    const prompt = buildPrompt(question, context);
    const generated = await generateAnswer(prompt);

    if (generated.answer) {
      return {
        answer: generated.answer,
        sources,
        modelAvailable: true,
        provider: generated.provider
      };
    }

    return {
      answer: "All configured AI providers are currently unavailable. Please start Ollama or add a Gemini/Groq API key.",
      sources: [],
      modelAvailable: false,
      provider: null
    };
  } catch (error) {
    console.error("askAI error:", error.message);

    return {
      answer: "I couldn't process that request right now. Please verify the backend database connection and local AI model service.",
      sources: [],
      modelAvailable: false,
      provider: null
    };
  }
};

module.exports = askAI;
