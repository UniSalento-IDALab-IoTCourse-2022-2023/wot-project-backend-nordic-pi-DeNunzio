const socketIOClient = require('socket.io-client');
const socket = socketIOClient('http://127.0.0.1:3001');

// Questo è un prorotipo di client iscritto ai topic allo scopo di testare i messaggi web socket
// Questo codice verrà sostituito da quello nell'app dello smartphone che viene notificato quando ci sono valori anomali
socket.on('connect', () => {
  console.log('Connected to server.');

  // Effettua subscription ai topic
  socket.emit('subscribe', 'temperature');
  socket.emit('subscribe', 'pressure');
  socket.emit('subscribe', 'humidity');
  socket.emit('subscribe', 'co2');
  socket.emit('subscribe', 'horizontal');

});

socket.on('message', (data) => {
  console.log(`WARNING: Anomaly ${data.topic}: ${data.message}`);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server.');
});
