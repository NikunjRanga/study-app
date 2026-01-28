const db = require("../src/utils/db");

const createTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS video_progress (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            video_id INT NOT NULL,
            progress_seconds INT DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_video (user_id, video_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
        )
    `;

    db.query(query, (err) => {
        if (err) {
            console.error("Error creating video_progress table:", err);
            process.exit(1);
        }
        console.log("✅ Table 'video_progress' created/verified.");
        process.exit(0);
    });
};

createTable();
