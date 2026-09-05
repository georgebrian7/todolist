const fs = require('fs');
const express = require('express');
const app = express();
const port=3000;

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