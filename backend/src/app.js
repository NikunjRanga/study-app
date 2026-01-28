// src/app.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import database to test connection
const db = require("./utils/db");

// Import auth routes
// Import routes
const authRoutes = require("./routes/auth");
const videoRoutes = require("./routes/videos");
const utilsRoutes = require("./routes/utils");
const progressRoutes = require("./routes/progress");

const app = express();

// ===== Middlewares =====
app.use(cors());
app.use(express.json());

// ===== Test Route =====
app.get("/health", (req, res) => {
  res.status(200).json({ message: "API is running" });
});

// ===== Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/utils", utilsRoutes);
app.use("/api/progress", progressRoutes);

module.exports = app;
