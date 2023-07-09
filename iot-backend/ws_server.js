const express = require('express');
const app = express();
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);

// Questo è il Web socket server
// Quando qualcuno si connette, in base all'azione che viene svolta (subscribe, publish, disconnect), gestisce diverse operazioni
// Si mette in ascolto sulla porta 6000
io.on('connection', (socket) => {

    const clientIpAddress = socket.request.connection.remoteAddress;
    const clientPort = socket.request.connection.remotePort;
    console.log(`-> A client connected from IP: ${clientIpAddress}, Port: ${clientPort}`);

    socket.on('subscribe', (topic) => {
        console.log(`Client subscribed to topic: ${topic}`);
        socket.join(topic);
    });

    socket.on('publish', (data) => {
        console.log(`Received message on topic ${data.topic}: ${data.message}`);
        io.to(data.topic).emit('message', { topic: data.topic, message: data.message });

    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: IP: ${clientIpAddress}, Port: ${clientPort}`);
    });
});

httpServer.listen(6000, () => {
    console.log('Server started on port 6000.');
});