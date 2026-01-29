const db = require("../src/utils/db");

const SEED_DATA = [
    {
        title: "Introduction to React",
        description: "Master the fundamentals of component-based architecture.",
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        type: "mp4",
        duration: "10:32",
        views: 12402
    },
    {
        title: "Modern ES6+ Features",
        description: "Elevate your code with advanced JavaScript syntax patterns.",
        thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        type: "mp4",
        duration: "08:45",
        views: 8300
    },
    {
        title: "HLS Streaming Protocol",
        description: "Deep dive into adaptive bitrate streaming technologies.",
        thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        type: "hls",
        duration: "12:15",
        views: 5600
    },
    {
        title: "Node.js Architecture",
        description: "Building scalable backend services with Express.",
        thumbnail: "https://images.unsplash.com/photo-1627398242450-270171b0e7b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        type: "mp4",
        duration: "15:20",
        views: 15200
    },
    {
        title: "JWT Security Patterns",
        description: "Implementing stateless authentication systems.",
        thumbnail: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        type: "mp4",
        duration: "09:50",
        views: 9100
    }
];

const seedDatabase = async () => {
    console.log("🌱 Starting Database Seed...");

    // 1. Create Table
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS videos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            thumbnail VARCHAR(500),
            url VARCHAR(500) NOT NULL,
            type VARCHAR(50) DEFAULT 'mp4',
            duration VARCHAR(50),
            views INT DEFAULT 0,
            upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            author VARCHAR(255) DEFAULT 'Study App Official'
        )
    `;

    db.query(createTableQuery, (err) => {
        if (err) {
            console.error("❌ Error creating table:", err);
            process.exit(1);
        }
        console.log("✅ Table 'videos' verified/created.");

        // 2. Check if data exists
        db.query("SELECT COUNT(*) as count FROM videos", (err, results) => {
            if (err) {
                console.error("❌ Error querying data:", err);
                process.exit(1);
            }

            if (results[0].count > 0) {
                console.log("⚠️  Data already exists. Skipping insertion.");
                process.exit(0);
            }

            // 3. Insert Data
            console.log("📥 Inserting seed data...");

            const values = SEED_DATA.map(v => [v.title, v.description, v.thumbnail, v.url, v.type, v.duration, v.views]);

            const insertQuery = "INSERT INTO videos (title, description, thumbnail, url, type, duration, views) VALUES ?";

            db.query(insertQuery, [values], (err, res) => {
                if (err) {
                    console.error("❌ Error inserting data:", err);
                    process.exit(1);
                }
                console.log(`✅ Successfully inserted ${res.affectedRows} videos.`);
                process.exit(0);
            });
        });
    });
};

seedDatabase();
