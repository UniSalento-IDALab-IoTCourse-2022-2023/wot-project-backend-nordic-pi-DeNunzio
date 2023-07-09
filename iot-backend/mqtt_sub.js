var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://localhost');

client.on('connect', (connack) => {
  if (connack.returnCode !== 0) {
    console.error('Subscriber could not connect to MQTT broker. Return code:', connack.returnCode);
    return;
  }
  console.log('Subscriber connected to MQTT broker');

  client.subscribe('temperature', (error) => {
    if (error) {
      console.error('Error subscribing to topic:', error);
    }
  });

  client.subscribe('pressure', (error) => {
    if (error) {
      console.error('Error subscribing to topic:', error);
    }
  });

  client.subscribe('humidity', (error) => {
    if (error) {
      console.error('Error subscribing to topic:', error);
    }
  });

  client.subscribe('co2', (error) => {
    if (error) {
      console.error('Error subscribing to topic:', error);
    }
  });

  client.subscribe('light', (error) => {
    if (error) {
      console.error('Error subscribing to topic:', error);
    }
  });

  client.subscribe('horizontal', (error) => {
    if (error) {
      console.error('Error subscribing to topic:', error);
    }
  });

});

// Register the message and error event listeners outside the setInterval loop
client.on('message', (topic, message) => {
  console.log('WARNING', topic, 'value:', message.toString());
});

client.on('error', (error) => {
  console.error('Subscriber encountered an error:', error);
});

// Function to start the loop
function startLoop() {
  setInterval(() => {
    // Your loop code here
  }, 500); // Adjust the interval (in milliseconds) as needed
}

// Start the loop
startLoop();
