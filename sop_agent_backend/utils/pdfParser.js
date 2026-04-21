const fs = require("fs");
const pdfParse = require("pdf-parse");

function normalizeText(text = "") {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function renderPage(pageData) {
  const textContent = await pageData.getTextContent({
    normalizeWhitespace: true,
    disableCombineTextItems: false
  });

  const lines = [];
  let buffer = [];
  let lastY = null;

  for (const item of textContent.items) {
    const currentY = item.transform[5];

    if (lastY === null || Math.abs(currentY - lastY) <= 2) {
      buffer.push(item.str);
    } else {
      lines.push(buffer.join(" ").trim());
      buffer = [item.str];
    }

    lastY = currentY;
  }

  if (buffer.length > 0) {
    lines.push(buffer.join(" ").trim());
  }

  return normalizeText(lines.filter(Boolean).join("\n"));
}

/**
 * Parse a PDF and preserve page-level text for source citations.
 * @param {string} filePath
 * @returns {Promise<{ text: string, pages: Array<{ pageNumber: number, text: string }>, totalPages: number }>}
 */
const parsePDF = async (filePath) => {
  try {
    if (!filePath) {
      throw new Error("File path is required");
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`PDF file does not exist at path: ${filePath}`);
    }

    const buffer = await fs.promises.readFile(filePath);
    const pages = [];

    const data = await pdfParse(buffer, {
      pagerender: async (pageData) => {
        const text = await renderPage(pageData);
        pages.push({
          pageNumber: pages.length + 1,
          text
        });
        return text;
      }
    });

    try {
      await fs.promises.unlink(filePath);
    } catch (cleanupError) {
      console.warn("File cleanup failed:", cleanupError.message);
    }

    return {
      text: normalizeText(data.text || ""),
      pages: pages.filter((page) => page.text),
      totalPages: data.numpages || pages.length
    };
  } catch (error) {
    console.error("PDF parsing error:", error.message);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};

module.exports = parsePDF;
