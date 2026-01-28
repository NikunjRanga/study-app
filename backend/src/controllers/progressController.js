const db = require("../utils/db");

// Save or Update Progress
exports.saveProgress = (req, res) => {
    const { videoId, progress } = req.body;
    const userId = req.user.id; // From authMiddleware

    if (!videoId || progress === undefined) {
        return res.status(400).json({ message: "Video ID and progress are required" });
    }

    const query = `
        INSERT INTO video_progress (user_id, video_id, progress_seconds)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE progress_seconds = VALUES(progress_seconds)
    `;

    db.query(query, [userId, videoId, progress], (err, results) => {
        if (err) return res.status(500).json({ message: err.message });
        res.status(200).json({ message: "Progress saved" });
    });
};

// Get Progress for a specific video
exports.getProgress = (req, res) => {
    const { videoId } = req.params;
    const userId = req.user.id;

    const query = "SELECT progress_seconds FROM video_progress WHERE user_id = ? AND video_id = ?";

    db.query(query, [userId, videoId], (err, results) => {
        if (err) return res.status(500).json({ message: err.message });

        if (results.length === 0) {
            return res.status(200).json({ progress: 0 });
        }

        res.status(200).json({ progress: results[0].progress_seconds });
    });
};

// Get All Progress for current user (for lists)
exports.getAllUserProgress = (req, res) => {
    const userId = req.user.id;

    const query = "SELECT video_id, progress_seconds FROM video_progress WHERE user_id = ?";

    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json({ message: err.message });

        // Convert to map: { 1: 120, 2: 450 }
        const progressMap = {};
        results.forEach(row => {
            progressMap[row.video_id] = row.progress_seconds;
        });

        res.status(200).json(progressMap);
    });
};
