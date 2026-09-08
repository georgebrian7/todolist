const fs = require('fs');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./openapi.json');


const app = express();
app.use(express.json());
const port=3000;
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
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