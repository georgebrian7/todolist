const fs = require('fs');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./openapi.json');
const Database = require('better-sqlite3');
const db = new Database('tasks.db');

const app = express();
app.use(express.json());
const port=3000;
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`);
const countRow = db.prepare('SELECT COUNT(*) AS count FROM tasks').get();
if (countRow.count === 0) {
  const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  insert.run('cleaning', 0);
  insert.run('bathing', 1);
  insert.run('dancing', 0);
};

app.get('/tasks', (req,res)=>{
    const tasks =db.prepare('SELECT * FROM tasks').all();
    res.json(tasks.map(t => ({ ...t, done: !!t.done })))
});
app.get('/tasks/:id', (req,res)=>{
    const id =Number(req.params.id);
    const task =db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!task) {
    res.status(404).json({ "error": `Task ${id} not found` });
  } else {
    res.json({ ...task, done: !!task.done });
  }

});

app.get('/', (req,res)=>{
    res.json({ "name":"Task API", "version":"1.0","endpoints":["/tasks"]})


});
app.post('/tasks', (req,res)=>{
     const title=req.body.title
     
    if(!title){
        res.status(400).json({"error":"Bad Request"})
    }else{
        const nextId = Math.max(...tasks.map(t => t.id)) + 1;
        const newTask = { id: nextId, title: title, done: false };
        tasks.push(newTask);
        res.status(201).json(newTask);
    }
});
app.put('/tasks/:id', (req,res)=>{
    const id =Number(req.params.id);
    const task =tasks.find(t => t.id ===id);
    if(!task){
        res.status(404).json({"error":`Task ${id} not found`})
        
    }else{
        if (req.body.title === undefined && req.body.done === undefined) {
        res.status(400).json({"error": "title or done is required"});
        } 
        else {
        if (req.body.title !== undefined) task.title = req.body.title;
        if (req.body.done !== undefined) task.done = req.body.done;
        res.status(200).json(task);
    }
    }

});
app.delete('/tasks/:id', (req,res)=>{
    const id =Number(req.params.id);
    const index =tasks.findIndex(t => t.id ===id);
    if(index === -1){
        res.status(404).json({"error":`Task ${id} not found`})
    }else{
        tasks.splice(index,1)
        res.status(204).send()

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