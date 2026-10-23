
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const db = new Database(path.join(__dirname, "giftmate.db"));

db.pragma("journal_mode = WAL");

// Create gifts table
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

// Add image_path if it does not exist
const giftColumns = db.prepare("PRAGMA table_info(gifts)").all();

if (!giftColumns.some(column => column.name === "image_path")) {
    db.exec("ALTER TABLE gifts ADD COLUMN image_path TEXT");
}

// Create users table
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
`);

// Restore gifts if the database is empty
const seedFile = path.join(__dirname, "gifts-seed.json");

const giftCount = db.prepare(
    "SELECT COUNT(*) AS count FROM gifts"
).get().count;

if (giftCount === 0 && fs.existsSync(seedFile)) {
    const gifts = JSON.parse(
        fs.readFileSync(seedFile, "utf8")
    );

    const insertGift = db.prepare(`
        INSERT OR IGNORE INTO gifts (
            id, name, price, category, emoji, description,
            recipients, occasions, interests, image_path
        )
        VALUES (
            @id, @name, @price, @category, @emoji, @description,
            @recipients, @occasions, @interests, @image_path
        )
    `);

    const seedGifts = db.transaction((rows) => {
        for (const gift of rows) {
            insertGift.run({
                id: gift.id,
                name: gift.name,
                price: gift.price,
                category: gift.category ?? null,
                emoji: gift.emoji ?? null,
                description: gift.description ?? null,
                recipients: gift.recipients ?? null,
                occasions: gift.occasions ?? null,
                interests: gift.interests ?? null,
                image_path: gift.image_path ?? null
            });
        }
    });

    seedGifts(gifts);
    console.log(`Restored ${gifts.length} gifts from seed file.`);
} else if (giftCount === 0) {
    console.log("No gifts restored: gifts-seed.json was not found.");
}

module.exports = db;
