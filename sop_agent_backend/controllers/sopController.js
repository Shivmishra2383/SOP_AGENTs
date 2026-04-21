const SOP = require("../models/SOP");
const parsePDF = require("../utils/pdfParser");
const splitTextIntoChunks = require("../services/chunkService");
const { createEmbedding } = require("../services/embeddingService");
const { storeVectors, getCollection } = require("../services/vectorService");
const { getAccessibleSopFilter, isAdmin } = require("../utils/accessControl");

exports.uploadSOP = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const parsedPdf = await parsePDF(req.file.path);
    const text = parsedPdf.text;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Empty PDF content" });
    }

    const sop = await SOP.create({
      title: req.body.title || req.file.originalname,
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      textContent: text,
      totalPages: parsedPdf.totalPages,
      pages: parsedPdf.pages,
      uploadedBy: req.user?._id || null
    });

    const chunks = splitTextIntoChunks(parsedPdf.pages, 1000, 100);

    if (chunks.length === 0) {
      return res.status(400).json({ message: "No chunks generated" });
    }

    const embeddings = await Promise.all(
      chunks.map((chunk) => createEmbedding(chunk.text))
    );

    const vectors = [];

    embeddings.forEach((embedding, index) => {
      if (!embedding) {
        return;
      }

      const chunk = chunks[index];

      vectors.push({
        id: `${sop._id}_chunk_${index}`,
        values: embedding,
        metadata: {
          text: chunk.text,
          sopId: sop._id.toString(),
          chunkIndex: chunk.chunkIndex,
          pageNumber: chunk.pageNumber,
          startChar: chunk.startChar,
          endChar: chunk.endChar,
          title: sop.title,
          fileName: sop.fileName,
          originalFileName: sop.originalFileName,
          uploadedBy: req.user?._id?.toString() || null
        }
      });
    });

    if (vectors.length === 0) {
      return res.status(500).json({
        message: "No valid embeddings created"
      });
    }

    await storeVectors(vectors);

    sop.chunkCount = vectors.length;
    await sop.save();

    const responseSop = await SOP.findById(sop._id)
      .select("-textContent -pages.text")
      .populate("uploadedBy", "name email");

    res.status(200).json({
      message: "SOP uploaded successfully",
      sop: responseSop
    });
  } catch (error) {
    console.error("Upload SOP error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllSOP = async (req, res) => {
  try {
    const filter = await getAccessibleSopFilter(req.user);
    const sops = await SOP.find(filter)
      .select("-textContent -pages.text")
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(sops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSOP = async (req, res) => {
  try {
    const baseFilter = isAdmin(req.user)
      ? { _id: req.params.id }
      : { _id: req.params.id, uploadedBy: req.user._id };

    const sop = await SOP.findOne(baseFilter);

    if (!sop) {
      return res.status(404).json({ message: "SOP not found or access denied" });
    }

    const collection = await getCollection();
    await collection.deleteMany({
      "metadata.sopId": req.params.id
    });

    await sop.deleteOne();

    res.status(200).json({
      message: "SOP and related vectors deleted"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
