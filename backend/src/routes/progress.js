const express = require("express");
const { saveProgress, getProgress, getAllUserProgress } = require("../controllers/progressController");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// All routes here require authentication
router.post("/", verifyToken, saveProgress);
router.get("/", verifyToken, getAllUserProgress); // Get all progress
router.get("/:videoId", verifyToken, getProgress);

module.exports = router;
