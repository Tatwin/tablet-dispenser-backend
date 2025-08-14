import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const app = express();
app.use(express.json());

// Database setup
const dbFile = path.resolve("./data.db");

let db;
(async () => {
  db = await open({
    filename: dbFile,
    driver: sqlite3.Database
  });

  // Create table if not exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS dispenser (
      id INTEGER PRIMARY KEY,
      tablet_count INTEGER,
      next_time TEXT
    )
  `);

  // Check if initial row exists
  const row = await db.get("SELECT COUNT(*) as count FROM dispenser");
  if (row.count === 0) {
    await db.run(
      "INSERT INTO dispenser (tablet_count, next_time) VALUES (?, ?)",
      [10, new Date().toISOString()] // Default: 10 tablets
    );
  }

  console.log("Database ready ✅");
})();

// Get status
app.get("/status", async (req, res) => {
  const data = await db.get("SELECT * FROM dispenser WHERE id = 1");
  res.json(data);
});

// Update tablet count
app.post("/take", async (req, res) => {
  await db.run(
    "UPDATE dispenser SET tablet_count = tablet_count - 1 WHERE id = 1"
  );
  const data = await db.get("SELECT * FROM dispenser WHERE id = 1");
  res.json(data);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
