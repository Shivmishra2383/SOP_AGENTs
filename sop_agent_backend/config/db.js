const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error("Missing MONGO_URI in environment variables");
}

const client = new MongoClient(mongoUri);

let db;

/**
 * Connect BOTH:
 * 1. MongoClient (for vector search)
 * 2. Mongoose (for models like SOP, User)
 */
async function connectDB() {
  try {
    // ✅ Connect MongoClient (for vectors)
    if (!db) {
      await client.connect();
      db = client.db(process.env.DB_NAME);
      console.log("MongoClient Connected");
    }

    // ✅ Connect Mongoose (for schemas)
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
      console.log("Mongoose Connected");
    }

    return db;

  } catch (error) {
    console.error("DB Connection Error:", error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
