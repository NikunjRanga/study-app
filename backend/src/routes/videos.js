const express = require("express");
const { getAllVideos, getVideoById, toggleLike, getLikeStatus } = require("../controllers/videoController");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// Public
router.get("/", getAllVideos);
router.get("/:id", verifyToken, getVideoById);

// Protected Likes
router.post("/:id/like", verifyToken, toggleLike);
router.get("/:id/like", verifyToken, getLikeStatus);

module.exports = router;
