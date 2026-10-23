
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

// Environment configuration
if (
    !process.env.SESSION_SECRET ||
    !process.env.ADMIN_USERNAME ||
    !process.env.ADMIN_PASSWORD_HASH
) {
    console.error("Missing required environment variables in .env");
    process.exit(1);
}

// Image upload configuration
const uploadDirectory = path.join(__dirname, "uploads", "gifts");

fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedMimeTypes = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif"
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadDirectory);
    },

    filename: (req, file, callback) => {
        const extension = allowedMimeTypes[file.mimetype];

        if (!extension) {
            return callback(new Error("Unsupported image type."));
        }

        callback(null, `${crypto.randomUUID()}${extension}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    },
    fileFilter: (req, file, callback) => {
        if (!allowedMimeTypes[file.mimetype]) {
            return callback(
                new Error("Only JPG, PNG, WEBP, and GIF images are allowed.")
            );
        }

        callback(null, true);
    }
});

// Middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(
    session({
        name: "giftmate.sid",
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 30 * 60 * 1000
        }
    })
);

// Authentication middleware
function isAdmin(req, res, next) {
    if (req.session && req.session.isAdmin === true) {
        return next();
    }

    return res.status(401).json({
        success: false,
        message: "Admin login required."
    });
}

function isUser(req, res, next) {
    if (
        req.session &&
        req.session.userId &&
        req.session.isAdmin !== true
    ) {
        return next();
    }

    return res.status(401).json({
        success: false,
        message: "User login required."
    });
}

// Convert form values to SQLite-compatible values
function cleanText(value, fallback = "") {
    if (value === null || value === undefined) {
        return fallback;
    }

    if (typeof value === "string") {
        return value;
    }

    if (typeof value === "number" || typeof value === "bigint") {
        return String(value);
    }

    if (typeof value === "boolean") {
        return String(value);
    }

    if (Array.isArray(value)) {
        return value.map(item => {
            if (
                item === null ||
                typeof item === "string" ||
                typeof item === "number" ||
                typeof item === "boolean"
            ) {
                return String(item ?? "");
            }

            return JSON.stringify(item);
        }).join(", ");
    }

    return JSON.stringify(value);
}

// Validate and normalize gift information
function getGiftFields(body) {
    const { name, price, category } = body;

    if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof category !== "string" ||
        !category.trim() ||
        price === undefined ||
        price === null ||
        price === ""
    ) {
        return {
            error: "Gift name, price, and category are required."
        };
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        return {
            error: "Please provide a valid gift price."
        };
    }

    return {
        fields: {
            name: name.trim(),
            price: numericPrice,
            category: category.trim(),
            emoji: cleanText(body.emoji, "🎁"),
            description: cleanText(body.description),
            recipients: cleanText(body.recipients),
            occasions: cleanText(body.occasions),
            interests: cleanText(body.interests)
        }
    };
}

// Return the URL of an uploaded image
function getUploadedImagePath(file) {
    return file ? `/uploads/gifts/${file.filename}` : null;
}

// Delete only files inside the gift upload folder
function deleteUploadedImage(imagePath) {
    if (
        typeof imagePath !== "string" ||
        !imagePath.startsWith("/uploads/gifts/")
    ) {
        return;
    }

    const filename = imagePath.slice("/uploads/gifts/".length);

    // Only allow generated image filenames
    if (!/^[a-f0-9-]{36}\.(jpg|png|webp|gif)$/.test(filename)) {
        return;
    }

    const fullPath = path.join(uploadDirectory, filename);

    try {
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    } catch (error) {
        console.error("Image cleanup error:", error);
    }
}

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "GiftMate server is running."
    });
});

// ===============================
// ADMIN AUTHENTICATION
// ===============================

app.post("/api/auth/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (
            typeof username !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required."
            });
        }

        if (username !== process.env.ADMIN_USERNAME) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            process.env.ADMIN_PASSWORD_HASH
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        req.session.regenerate(err => {
            if (err) {
                console.error("Session error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Could not create admin session."
                });
            }

            req.session.isAdmin = true;

            req.session.save(saveError => {
                if (saveError) {
                    console.error("Session save error:", saveError);

                    return res.status(500).json({
                        success: false,
                        message: "Could not save admin session."
                    });
                }

                return res.json({
                    success: true,
                    message: "Admin login successful."
                });
            });
        });
    } catch (error) {
        console.error("Admin login error:", error);

        res.status(500).json({
            success: false,
            message: "Admin login failed."
        });
    }
});

app.get("/api/auth/status", (req, res) => {
    res.json({
        success: true,
        isAdmin: req.session?.isAdmin === true
    });
});

app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Admin logout error:", err);

            return res.status(500).json({
                success: false,
                message: "Logout failed."
            });
        }

        res.clearCookie("giftmate.sid");

        return res.json({
            success: true,
            message: "Admin logged out successfully."
        });
    });
});

// ===============================
// USER REGISTRATION AND LOGIN
// ===============================

app.post("/api/auth/user-register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof email !== "string" ||
            !email.trim() ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required."
            });
        }

        if (password.length < 8 || password.length > 72) {
            return res.status(400).json({
                success: false,
                message: "Password must contain 8 to 72 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const result = db.prepare(`
            INSERT INTO users (name, email, password_hash)
            VALUES (@name, @email, @passwordHash)
        `).run({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash
        });

        return res.status(201).json({
            success: true,
            message: "Registration successful. You can now log in.",
            user: {
                id: Number(result.lastInsertRowid),
                name: name.trim(),
                email: normalizedEmail
            }
        });
    } catch (error) {
        if (
            error.code === "SQLITE_CONSTRAINT_UNIQUE" ||
            error.code === "SQLITE_CONSTRAINT_PRIMARYKEY"
        ) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        console.error("User registration error:", error);

        res.status(500).json({
            success: false,
            message: "Registration failed."
        });
    }
});

app.post("/api/auth/user-login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const user = db.prepare(`
            SELECT id, name, email, password_hash
            FROM users
            WHERE email = ?
        `).get(email.trim().toLowerCase());

        if (
            !user ||
            !(await bcrypt.compare(password, user.password_hash))
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        req.session.regenerate(err => {
            if (err) {
                console.error("User session error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Could not create user session."
                });
            }

            req.session.userId = user.id;
            req.session.userName = user.name;
            req.session.isAdmin = false;

            req.session.save(saveError => {
                if (saveError) {
                    console.error("User session save error:", saveError);

                    return res.status(500).json({
                        success: false,
                        message: "Could not save user session."
                    });
                }

                return res.json({
                    success: true,
                    message: "User login successful.",
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    }
                });
            });
        });
    } catch (error) {
        console.error("User login error:", error);

        res.status(500).json({
            success: false,
            message: "User login failed."
        });
    }
});

app.get("/api/auth/user-status", (req, res) => {
    res.json({
        success: true,
        isLoggedIn: Boolean(req.session?.userId),
        user: req.session?.userId
            ? {
                id: req.session.userId,
                name: req.session.userName
            }
            : null
    });
});

app.post("/api/auth/user-logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("User logout error:", err);

            return res.status(500).json({
                success: false,
                message: "Logout failed."
            });
        }

        res.clearCookie("giftmate.sid");

        return res.json({
            success: true,
            message: "User logged out successfully."
        });
    });
});

// ===============================
// PUBLIC GIFT APIs
// ===============================

// Get all gifts
app.get("/api/gifts", (req, res) => {
    try {
        const gifts = db.prepare(`
            SELECT * FROM gifts
            ORDER BY id ASC
        `).all();

        return res.json({
            success: true,
            count: gifts.length,
            data: gifts
        });
    } catch (error) {
        console.error("Fetch gifts error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch gifts."
        });
    }
});

// Get gifts within a budget
app.get("/api/gifts/budget/:amount", (req, res) => {
    try {
        const budget = Number(req.params.amount);

        if (!Number.isFinite(budget) || budget < 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid budget."
            });
        }

        const gifts = db.prepare(`
            SELECT * FROM gifts
            WHERE price <= ?
            ORDER BY price ASC
        `).all(budget);

        return res.json({
            success: true,
            budget,
            count: gifts.length,
            data: gifts
        });
    } catch (error) {
        console.error("Budget gifts error:", error);

        res.status(500).json({
            success: false,
            message: "Could not filter gifts by budget."
        });
    }
});

// Get one gift by ID
app.get("/api/gifts/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid gift ID."
            });
        }

        const gift = db.prepare(`
            SELECT * FROM gifts WHERE id = ?
        `).get(id);

        if (!gift) {
            return res.status(404).json({
                success: false,
                message: "Gift not found."
            });
        }

        return res.json({
            success: true,
            gift
        });
    } catch (error) {
        console.error("Fetch gift error:", error);

        res.status(500).json({
            success: false,
            message: "Could not fetch gift."
        });
    }
});

// ===============================
// ADMIN GIFT MANAGEMENT
// ===============================

// Add a gift, optionally with an image
app.post(
    "/api/gifts",
    isAdmin,
    upload.single("image"),
    (req, res) => {
        let savedImagePath = null;

        try {
            const validation = getGiftFields(req.body || {});

            if (validation.error) {
                if (req.file) {
                    deleteUploadedImage(getUploadedImagePath(req.file));
                }

                return res.status(400).json({
                    success: false,
                    message: validation.error
                });
            }

            const fields = validation.fields;
            savedImagePath = getUploadedImagePath(req.file);

            const result = db.prepare(`
                INSERT INTO gifts (
                    name, price, category, emoji, description,
                    recipients, occasions, interests, image_path
                )
                VALUES (
                    @name, @price, @category, @emoji, @description,
                    @recipients, @occasions, @interests, @image_path
                )
            `).run({
                ...fields,
                image_path: savedImagePath
            });

            const gift = db.prepare(`
                SELECT * FROM gifts WHERE id = ?
            `).get(Number(result.lastInsertRowid));

            return res.status(201).json({
                success: true,
                message: "Gift added successfully.",
                gift
            });
        } catch (error) {
            if (savedImagePath) {
                deleteUploadedImage(savedImagePath);
            }

            console.error("Add gift error:", error);

            return res.status(500).json({
                success: false,
                message: "Could not add gift."
            });
        }
    }
);

// Update a gift, optionally replacing its image
app.put(
    "/api/gifts/:id",
    isAdmin,
    upload.single("image"),
    (req, res) => {
        let newImagePath = null;

        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id <= 0) {
                if (req.file) {
                    deleteUploadedImage(getUploadedImagePath(req.file));
                }

                return res.status(400).json({
                    success: false,
                    message: "Invalid gift ID."
                });
            }

            const existingGift = db.prepare(`
                SELECT * FROM gifts WHERE id = ?
            `).get(id);

            if (!existingGift) {
                if (req.file) {
                    deleteUploadedImage(getUploadedImagePath(req.file));
                }

                return res.status(404).json({
                    success: false,
                    message: "Gift not found."
                });
            }

            const validation = getGiftFields(req.body || {});

            if (validation.error) {
                if (req.file) {
                    deleteUploadedImage(getUploadedImagePath(req.file));
                }

                return res.status(400).json({
                    success: false,
                    message: validation.error
                });
            }

            const fields = validation.fields;
            newImagePath = getUploadedImagePath(req.file);

            // Keep the current image if no new image was uploaded.
            const imagePath = newImagePath || existingGift.image_path || null;

            db.prepare(`
                UPDATE gifts SET
                    name = @name,
                    price = @price,
                    category = @category,
                    emoji = @emoji,
                    description = @description,
                    recipients = @recipients,
                    occasions = @occasions,
                    interests = @interests,
                    image_path = @image_path
                WHERE id = @id
            `).run({
                ...fields,
                image_path: imagePath,
                id
            });

            // Remove the previous uploaded image only after the update succeeds.
            if (
                newImagePath &&
                existingGift.image_path &&
                existingGift.image_path !== newImagePath
            ) {
                deleteUploadedImage(existingGift.image_path);
            }

            const gift = db.prepare(`
                SELECT * FROM gifts WHERE id = ?
            `).get(id);

            return res.json({
                success: true,
                message: "Gift updated successfully.",
                gift
            });
        } catch (error) {
            if (newImagePath) {
                deleteUploadedImage(newImagePath);
            }

            console.error("Update gift error:", error);

            return res.status(500).json({
                success: false,
                message: "Could not update gift."
            });
        }
    }
);

// Delete a gift
app.delete("/api/gifts/:id", isAdmin, (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid gift ID."
            });
        }

        const gift = db.prepare(`
            SELECT * FROM gifts WHERE id = ?
        `).get(id);

        if (!gift) {
            return res.status(404).json({
                success: false,
                message: "Gift not found."
            });
        }

        db.prepare(`
            DELETE FROM gifts WHERE id = ?
        `).run(id);

        if (gift.image_path) {
            deleteUploadedImage(gift.image_path);
        }

        return res.json({
            success: true,
            message: "Gift deleted successfully."
        });
    } catch (error) {
        console.error("Delete gift error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not delete gift."
        });
    }
});

// ===============================
// PAGE PROTECTION AND STATIC FILES
// ===============================

// Protect the admin dashboard
app.get("/admin.html", (req, res, next) => {
    if (req.session?.isAdmin === true) {
        return next();
    }

    return res.redirect("/admin-login.html");
});

// Avoid serving server-side secrets and source files publicly
app.use((req, res, next) => {
    const blockedPaths = [
        "/server.js",
        "/server-backup.js",
        "/database.js",
        "/giftmate.db",
        "/giftmate.db-wal",
        "/giftmate.db-shm",
        "/package.json",
        "/package-lock.json"
    ];

    if (
        blockedPaths.includes(req.path) ||
        req.path.startsWith("/node_modules/")
    ) {
        return res.status(404).send("Not found.");
    }

    next();
});

// Serve frontend files and uploaded gift images
app.use(express.static(__dirname, {
    dotfiles: "ignore",
    index: "index.html"
}));

// Unknown API routes
app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found."
    });
});

// Upload and other request errors
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "Image must be 5 MB or smaller."
            });
        }

        return res.status(400).json({
            success: false,
            message: "Image upload failed: " + error.message
        });
    }

    if (error && error.message === "Unsupported image type.") {
        return res.status(400).json({
            success: false,
            message: "Only JPG, PNG, WEBP, and GIF images are allowed."
        });
    }

    if (
        error &&
        error.message ===
            "Only JPG, PNG, WEBP, and GIF images are allowed."
    ) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    console.error("Server error:", error);

    return res.status(500).json({
        success: false,
        message: "An unexpected server error occurred."
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`GiftMate server running at http://localhost:${PORT}`);
});
