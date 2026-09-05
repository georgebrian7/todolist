const fs = require('fs');
const express = require('express');
const app = express();
const port=3000;

let tasks = [
  { id: 1, title: "cleaning", done: false },
  { id: 2, title: "bathing", done: true },
  { id: 3, title: "dancing", done: false },
];
app.get('/tasks', (req,res)=>{
    res.json(tasks)
});
app.get('/tasks/:id', (req,res)=>{
    const id =Number(req.params.id);
    const task =tasks.find(t => t.id ===id);
    if(task){
        res.json(task)
    }else{
        res.status(404).json({"error":`Task ${id} not found`})
    }

});

app.get('/', (req,res)=>{
    res.json({ "name":"Task API", "version":"1.0","endpoints":["/tasks"]})
});
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