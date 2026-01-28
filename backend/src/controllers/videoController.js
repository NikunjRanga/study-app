const db = require("../utils/db");

// ===== GET ALL VIDEOS =====
exports.getAllVideos = (req, res) => {
  const sql = "SELECT * FROM videos ORDER BY upload_date DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching videos:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(results);
  });
};

// ===== GET VIDEO BY ID =====
exports.getVideoById = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM videos WHERE id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching video:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.status(200).json(results[0]);
  });
};

// Toggle Like
exports.toggleLike = (req, res) => {
  const { id } = req.params; // videoId
  const userId = req.user.id; // From verifyToken

  // Check if already liked
  const checkQuery = "SELECT * FROM video_likes WHERE user_id = ? AND video_id = ?";
  db.query(checkQuery, [userId, id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });

    if (results.length > 0) {
      // Already liked -> Unlike
      db.query("DELETE FROM video_likes WHERE user_id = ? AND video_id = ?", [userId, id], (err) => {
        if (err) return res.status(500).json({ message: err.message });
        // Decrement count
        db.query("UPDATE videos SET likes = GREATEST(likes - 1, 0) WHERE id = ?", [id]);
        res.status(200).json({ liked: false });
      });
    } else {
      // Not liked -> Like
      db.query("INSERT INTO video_likes (user_id, video_id) VALUES (?, ?)", [userId, id], (err) => {
        if (err) return res.status(500).json({ message: err.message });
        // Increment count
        db.query("UPDATE videos SET likes = likes + 1 WHERE id = ?", [id]);
        res.status(200).json({ liked: true });
      });
    }
  });
};

// Check if user liked video
exports.getLikeStatus = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.query("SELECT * FROM video_likes WHERE user_id = ? AND video_id = ?", [userId, id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json({ liked: results.length > 0 });
  });
};
