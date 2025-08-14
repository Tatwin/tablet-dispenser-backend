// server.js
import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// Create SQLite database
const db = new sqlite3.Database("tablets.db");

// Create table if not exists
db.run(`
CREATE TABLE IF NOT EXISTS dispenser (
  id INTEGER PRIMARY KEY,
  tabletCount INTEGER,
  nextTabletTime TEXT
)
`);

// Initialize data if empty
db.get("SELECT COUNT(*) as count FROM dispenser", (err, row) => {
  if (row.count === 0) {
    db.run("INSERT INTO dispenser (tabletCount, nextTabletTime) VALUES (?, ?)", [30, new Date().toISOString()]);
  }
});

// Update data from ESP32
app.post("/update", (req, res) => {
  const { tabletCount, nextTabletTime } = req.body;
  db.run(
    "UPDATE dispenser SET tabletCount=?, nextTabletTime=? WHERE id=1",
    [tabletCount, nextTabletTime],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ status: "updated" });
    }
  );
});

// Get status for website
app.get("/status", (req, res) => {
  db.get("SELECT tabletCount, nextTabletTime FROM dispenser WHERE id=1", (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
