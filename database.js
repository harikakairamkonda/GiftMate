
const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "giftmate.db"));

db.pragma("journal_mode = WAL");

// Gifts table
db.exec(`
    CREATE TABLE IF NOT EXISTS gifts (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        category TEXT,
        emoji TEXT,
        description TEXT,
        recipients TEXT,
        occasions TEXT,
        interests TEXT
    )
`);

// Add image_path to the existing gifts table if it doesn't exist.
// This preserves all existing gifts and their data.
const giftColumns = db.prepare("PRAGMA table_info(gifts)").all();

const hasImagePath = giftColumns.some(
    column => column.name === "image_path"
);

if (!hasImagePath) {
    db.exec("ALTER TABLE gifts ADD COLUMN image_path TEXT");
}

// Users table
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
`);

module.exports = db;
