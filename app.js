require('dotenv').config();
const fs = require('fs');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./openapi.json');
const app = express();
app.use(express.json());
const port=3000;
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function setupDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN NOT NULL DEFAULT false
    )
  `);

  const result = await pool.query('SELECT COUNT(*) FROM tasks');
  const count = parseInt(result.rows[0].count);

  if (count === 0) {
    await pool.query('INSERT INTO tasks (title, done) VALUES ($1, $2)', ['cleaning', false]);
    await pool.query('INSERT INTO tasks (title, done) VALUES ($1, $2)', ['bathing', true]);
    await pool.query('INSERT INTO tasks (title, done) VALUES ($1, $2)', ['dancing', false]);
  }
}

setupDatabase();
app.get('/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});
app.get('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/', (req,res)=>{
    res.json({ "name":"Task API", "version":"1.0","endpoints":["/tasks"]})


});
app.post('/tasks', async (req, res) => {
  try {
    const { title, done = false } = req.body;

    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, done)
       VALUES ($1, $2)
       RETURNING *`,
      [title.trim(), done]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});
app.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, done } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET title = $1, done = $2
       WHERE id = $3
       RETURNING *`,
      [title.trim(), done, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});
app.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});
// .findIndex() instead of .find() — gives you the position in the array, or -1 if not found
// .splice(index, 1) — removes one element at that position
// res.status(204).send() — success, empty body, no .json()
app.get('/health',(req,res)=>{
    res.json({"status":"ok"})
});

app.listen(port,()=>{
    console.log('listening on port 3000')
});

// const http =require('http');
// const server = http.createServer((req, res)=>{
//     if (req.url ==='/'){
//         res.write('Hello World');
//         res.end();
//     }
// });

// server.on('connection', (socket)=>{
//     console.log('new connection');
// });
// server.listen(3000);

// console.log('Listening on port 3000')