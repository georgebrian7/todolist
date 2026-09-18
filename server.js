const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, "tasks.db");

app.use(express.json());

// The database is created automatically when it does not exist.
// This means a new person cloning/copying the project can simply run npm install
// and npm start; tasks.db will be generated locally for them.
const db = new sqlite3.Database(DB_FILE);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0 CHECK (done IN (0, 1))
    )
  `);
});

function normalizeTask(row) {
  if (!row) return row;
  return {
    id: row.id,
    title: row.title,
    done: Boolean(row.done)
  };
}

// GET /api/tasks - return all tasks
app.get("/api/tasks", (req, res) => {
  db.all("SELECT id, title, done FROM tasks ORDER BY id", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(normalizeTask));
  });
});

// GET /api/tasks/:id - return one task
app.get("/api/tasks/:id", (req, res) => {
  db.get(
    "SELECT id, title, done FROM tasks WHERE id = ?",
    [req.params.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "Task not found" });
      res.json(normalizeTask(row));
    }
  );
});

// POST /api/tasks - create a task
app.post("/api/tasks", (req, res) => {
  const { title, done = false } = req.body;

  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "title is required" });
  }

  if (typeof done !== "boolean") {
    return res.status(400).json({ error: "done must be a boolean" });
  }

  db.run(
    "INSERT INTO tasks (title, done) VALUES (?, ?)",
    [title.trim(), done ? 1 : 0],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      db.get(
        "SELECT id, title, done FROM tasks WHERE id = ?",
        [this.lastID],
        (getErr, row) => {
          if (getErr) return res.status(500).json({ error: getErr.message });
          res.status(201).json(normalizeTask(row));
        }
      );
    }
  );
});

// PUT /api/tasks/:id - replace/update a task
app.put("/api/tasks/:id", (req, res) => {
  const { title, done } = req.body;

  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "title is required" });
  }

  if (typeof done !== "boolean") {
    return res.status(400).json({ error: "done must be a boolean" });
  }

  db.run(
    "UPDATE tasks SET title = ?, done = ? WHERE id = ?",
    [title.trim(), done ? 1 : 0, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) {
        return res.status(404).json({ error: "Task not found" });
      }

      db.get(
        "SELECT id, title, done FROM tasks WHERE id = ?",
        [req.params.id],
        (getErr, row) => {
          if (getErr) return res.status(500).json({ error: getErr.message });
          res.json(normalizeTask(row));
        }
      );
    }
  );
});

// PATCH /api/tasks/:id - partially update a task
app.patch("/api/tasks/:id", (req, res) => {
  const { title, done } = req.body;

  if (title === undefined && done === undefined) {
    return res.status(400).json({ error: "Provide title and/or done" });
  }

  if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
    return res.status(400).json({ error: "title must be a non-empty string" });
  }

  if (done !== undefined && typeof done !== "boolean") {
    return res.status(400).json({ error: "done must be a boolean" });
  }

  db.get(
    "SELECT id, title, done FROM tasks WHERE id = ?",
    [req.params.id],
    (findErr, existing) => {
      if (findErr) return res.status(500).json({ error: findErr.message });
      if (!existing) return res.status(404).json({ error: "Task not found" });

      const newTitle = title === undefined ? existing.title : title.trim();
      const newDone = done === undefined ? Boolean(existing.done) : done;

      db.run(
        "UPDATE tasks SET title = ?, done = ? WHERE id = ?",
        [newTitle, newDone ? 1 : 0, req.params.id],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });

          db.get(
            "SELECT id, title, done FROM tasks WHERE id = ?",
            [req.params.id],
            (getErr, row) => {
              if (getErr) return res.status(500).json({ error: getErr.message });
              res.json(normalizeTask(row));
            }
          );
        }
      );
    }
  );
});

// DELETE /api/tasks/:id - delete a task
app.delete("/api/tasks/:id", (req, res) => {
  db.run(
    "DELETE FROM tasks WHERE id = ?",
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.status(204).send();
    }
  );
});

// Simple health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Tasks API running at http://localhost:${PORT}`);
    console.log(`SQLite database: ${DB_FILE}`);
  });
}

module.exports = { app, db, DB_FILE };