import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Initialize Turso Client
// Delay creating it so we don't crash if env vars aren't present yet,
// but warn if they are used.
let turso: ReturnType<typeof createClient> | null = null;
const initTurso = () => {
    if (!turso) {
        if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
            throw new Error("Missing Turso configuration in environment variables.");
        }
        turso = createClient({
            url: process.env.TURSO_DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN,
        });
    }
    return turso;
}

// Database schema setup
const setupDb = async () => {
    try {
        const db = initTurso();
        await db.executeMultiple(`
            CREATE TABLE IF NOT EXISTS templates (
                id TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                category TEXT,
                name TEXT,
                content TEXT,
                createdAt INTEGER
            );
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                photoURL TEXT
            );
            CREATE TABLE IF NOT EXISTS reports (
                id TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                createdAt INTEGER,
                updatedAt INTEGER,
                patientName TEXT,
                patientId TEXT,
                age TEXT,
                gender TEXT,
                referredBy TEXT,
                visitNo TEXT,
                visitDate TEXT,
                lmpDate TEXT,
                lmpEdd TEXT,
                details TEXT
            );
        `);
        console.log("Database schema initialized.");
    } catch (err) {
        console.warn("Failed to initialize database schema, check credentials:", err);
    }
};

app.post('/api/setup-db', async (req, res) => {
    try {
        await setupDb();
        res.json({ success: true, message: "Database schema verified" });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// API Routes for Templates
app.get('/api/users/:userId/templates', async (req, res) => {
    try {
        const db = initTurso();
        const { rows } = await db.execute({
            sql: "SELECT * FROM templates WHERE userId = ?",
            args: [req.params.userId]
        });
        res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/users/:userId/templates', async (req, res) => {
    try {
        const db = initTurso();
        const { id, category, name, content, createdAt } = req.body;
        const userId = req.params.userId;
        await db.execute({
            sql: "INSERT INTO templates (id, userId, category, name, content, createdAt) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET category=excluded.category, name=excluded.name, content=excluded.content, createdAt=excluded.createdAt",
            args: [id, userId, category, name, content, createdAt]
        });
        res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/users/:userId/templates/:id', async (req, res) => {
    try {
        const db = initTurso();
        await db.execute({
            sql: "DELETE FROM templates WHERE id = ? AND userId = ?",
            args: [req.params.id, req.params.userId]
        });
        res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// API Routes for User Profile
app.get('/api/users/:userId', async (req, res) => {
    try {
        const db = initTurso();
        const { rows } = await db.execute({
            sql: "SELECT * FROM users WHERE id = ?",
            args: [req.params.userId]
        });
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.json(null);
        }
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/users/:userId', async (req, res) => {
    try {
        const db = initTurso();
        const { photoURL } = req.body;
        await db.execute({
            sql: "INSERT INTO users (id, photoURL) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET photoURL=excluded.photoURL",
            args: [req.params.userId, photoURL]
        });
        res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/users/:userId', async (req, res) => {
    try {
        const db = initTurso();
        const userId = req.params.userId;
        // Delete from all tables
        await db.executeMultiple(`
            DELETE FROM templates WHERE userId = '${userId}';
            DELETE FROM reports WHERE userId = '${userId}';
            DELETE FROM users WHERE id = '${userId}';
        `);
        res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// API Routes for Reports
app.get('/api/users/:userId/reports', async (req, res) => {
    try {
        const db = initTurso();
        const { rows } = await db.execute({
            sql: "SELECT * FROM reports WHERE userId = ?",
            args: [req.params.userId]
        });
        res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/users/:userId/reports/:id', async (req, res) => {
    try {
        const db = initTurso();
        const { rows } = await db.execute({
            sql: "SELECT * FROM reports WHERE id = ? AND userId = ?",
            args: [req.params.id, req.params.userId]
        });
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: "Not found" });
        }
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/users/:userId/reports', async (req, res) => {
    try {
        const db = initTurso();
        const { id, createdAt, updatedAt, patientName, patientId, age, gender, referredBy, visitNo, visitDate, lmpDate, lmpEdd, details } = req.body;
        const userId = req.params.userId;
        await db.execute({
            sql: `INSERT INTO reports (id, userId, createdAt, updatedAt, patientName, patientId, age, gender, referredBy, visitNo, visitDate, lmpDate, lmpEdd, details)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(id) DO UPDATE SET
                 updatedAt=excluded.updatedAt, patientName=excluded.patientName, patientId=excluded.patientId, age=excluded.age, gender=excluded.gender, referredBy=excluded.referredBy, visitNo=excluded.visitNo, visitDate=excluded.visitDate, lmpDate=excluded.lmpDate, lmpEdd=excluded.lmpEdd, details=excluded.details`,
            args: [id, userId, createdAt, updatedAt, patientName, patientId, age, gender, referredBy, visitNo, visitDate, lmpDate, lmpEdd, details]
        });
        res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/users/:userId/reports/:id', async (req, res) => {
    try {
        const db = initTurso();
        await db.execute({
            sql: "DELETE FROM reports WHERE id = ? AND userId = ?",
            args: [req.params.id, req.params.userId]
        });
        res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});


async function startServer() {
    // Attempt DB setup at startup, but don't block if credentials missing
    setupDb();

    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: "spa",
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get(/^(?!\/api).*/, (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    }
}

startServer();

export default app;
