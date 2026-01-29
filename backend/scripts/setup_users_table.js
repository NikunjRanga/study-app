const db = require("../src/utils/db");

const createUsersTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.query(query, (err) => {
        if (err) {
            console.error("❌ Error creating users table:", err);
            process.exit(1);
        }
        console.log("✅ Table 'users' verified/created.");
        process.exit(0);
    });
};

createUsersTable();
