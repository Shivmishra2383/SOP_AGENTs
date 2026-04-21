require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const sopRoutes = require("./routes/sopRoutes");
const chatRoutes = require("./routes/chatRoutes");

connectDB();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SOP Agent API Running...");
});

/* Routes */

app.use("/api/auth", authRoutes);
app.use("/api/sop", sopRoutes);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});