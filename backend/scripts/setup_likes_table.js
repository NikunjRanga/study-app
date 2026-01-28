const db = require("../src/utils/db");

const createLikesTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS video_likes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            video_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_video_like (user_id, video_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
        )
    `;

    db.query(query, (err) => {
        if (err) {
            console.error("Error creating video_likes table:", err);
            process.exit(1);
        }
        console.log("✅ Table 'video_likes' created/verified.");

        // Also ensure 'likes' column exists in videos table for easy counting
        const alterQuery = "ALTER TABLE videos ADD COLUMN likes INT DEFAULT 0";
        db.query(alterQuery, (err) => {
            if (err && err.code !== 'ER_DUP_FIELDNAME') {
                console.error("Error adding likes column:", err);
            } else {
                console.log("✅ Column 'likes' in 'videos' verified.");
            }
            process.exit(0);
        });
    });
};

createLikesTable();
