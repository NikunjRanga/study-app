const db = require("../src/utils/db");

const migrateUrls = () => {
    console.log("🔒 Migrating video URLs to HTTPS...");

    const query = `
        UPDATE videos 
        SET url = REPLACE(url, 'http://commondatastorage.googleapis.com', 'https://commondatastorage.googleapis.com')
        WHERE url LIKE 'http://commondatastorage.googleapis.com%';
    `;

    db.query(query, (err, result) => {
        if (err) {
            console.error("❌ Error updating URLs:", err);
            process.exit(1);
        }
        console.log(`✅ Successfully updated ${result.affectedRows} videos to HTTPS.`);
        console.log(`ℹ️  (${result.changedRows} rows actually changed)`);
        process.exit(0);
    });
};

migrateUrls();
