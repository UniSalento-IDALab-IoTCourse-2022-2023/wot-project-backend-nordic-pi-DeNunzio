var Thingy = require('./index');

/*
var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://localhost');
*/

// Vengono prelevati i valori d'ambiente ideali dagli argomenti
const minCO2 = parseInt(process.argv[2]);
const maxC02 = parseInt(process.argv[3]);
const minTemp = parseInt(process.argv[4]);
const maxTemp = parseInt(process.argv[5]);
const minPress =parseInt(process.argv[6]);
const maxPress = parseInt(process.argv[7]);
const minHum = parseInt(process.argv[8]);
const maxHum = parseInt(process.argv[9]);
const hasToBeDark = parseInt(process.argv[10]);
const hasToBeHorizontal = parseInt(process.argv[11])

const horizontal_threshold = 0.1;
const light_threshold = 300;

// Variabili temporanee con i valori d'ambiente
var tempCO2;
var tempTemp;
var tempPress;
var tempHum;
var tempClear; // valore che indica la luce
var quaternionW; // questo valore è compreso tra 0 e 0.1 se l'oggetto è orizzontale

// Segue una funzione chiamata ogni TOT secondi che controlla se i valori d'ambiente sono in linea con quelli richiesti
// Se i valori sono anomali, il codice è pronto per:
// 1) Inviare in mqtt informazione sul valore anomalo
// 2) Inviare tramite Web Socket informazione su valore anomalo

function checkEnv() {

    console.log("--------------------------------------------------")

        if (tempTemp > maxTemp || tempTemp < minTemp){
            console.log('WARNING, Temperature sensor: ' + tempTemp);
            socket.emit('publish', { topic: 'temperature', message: tempTemp.toString() }); // Invia tramite Web Socket il valore anomalo
            /*
            client.publish('temperature', tempTemp.toString(), function(error) { // Invia tramite MQTT il valore anomalo
                if (error) {
                    console.error('Error publishing temperature value:', error);
                }
            });
            */
        } else{
            console.log('Temperature sensor: ' + tempTemp);
        }


        if (tempPress > maxPress || tempPress < minPress){
            console.log('WARNING, Pressure sensor: ' + tempPress);
            socket.emit('publish', { topic: 'pressure', message: tempPress.toString() }); // Invia tramite Web Socket il valore anomalo
            /*
            client.publish('pressure', tempPress.toString(), function(error) { // Invia tramite MQTT il valore anomalo
                if (error) {
                    console.error('Error publishing pressure value:', error);
                }
            });
            */

        } else {
            console.log('Pressure sensor: ' + tempPress);
        }


        if (tempHum > maxHum || tempHum < minHum){
            console.log('WARNING, Humidity sensor: ' + tempHum);
            socket.emit('publish', { topic: 'humidity', message: tempHum.toString() }); // Invia tramite Web Socket il valore anomalo
            /*
            client.publish('humidity', tempHum.toString(), function(error) { // Invia tramite MQTT il valore anomalo
                if (error) {
                    console.error('Error publishing humidity value:', error);
                }
            });
            */

        } else{
            console.log('Humidity sensor: ' + tempHum);
        }


        if (tempCO2 > maxC02 || tempCO2 < minCO2){
            console.log('WARNING, CO2 sensor: ' + tempCO2);
            socket.emit('publish', { topic: 'co2', message: tempCO2.toString() }); // Invia tramite Web Socket il valore anomalo
            /*
            client.publish('co2', tempCO2.toString(), function(error) { // Invia tramite MQTT il valore anomalo
                if (error) {
                    console.error('Error publishing co2 value:', error);
                }
            });
            */
        } else{
            console.log('CO2 sensor: ' + tempCO2);
        }


        if (hasToBeDark === 1 && tempClear > light_threshold){
            console.log("WARNING: Too much light " + tempClear )
            socket.emit('publish', { topic: 'light', message: "1" }); // Invia tramite Web Socket il valore anomalo
            /*
            client.publish('light', tempClear.toString(), function(error) { // Invia tramite MQTT il valore anomalo
                if (error) {
                    console.error('Error publishing light value:', error);
                }
            });
            */
        } else if (hasToBeDark === 0 && tempClear < light_threshold){
            console.log("WARNING: Too much dark " + tempClear)
            socket.emit('publish', { topic: 'light', message: "0" }); // Invia tramite Web Socket il valore anomalo
            /*
            client.publish('light', tempClear.toString(), function(error) { // Invia tramite MQTT il valore anomalo
                if (error) {
                    console.error('Error publishing light value:', error);
                }
            });
            */
        } else {
            console.log("Light " + tempClear)
        }


        if ( hasToBeHorizontal === 1 && Math.abs(quaternionW) >= horizontal_threshold){
            console.log("Warning: object is not horizontal")
            socket.emit('publish', { topic: 'horizontal', message: "0".toString() }); // Invia tramite Web Socket il valore anomalo
            /*
                client.publish('horizontal', "0".toString(), function(error) { // Invia tramite MQTT il valore anomalo
                    if (error) {
                        console.error('Error publishing horizontal value:', error);
                    }
                });
            */
        } else {
            console.log("Object orientation is ok")
        }

}


// Seguono le funzioni di callback chiamate ogni volta che c'è un nuovo valore
// Inizialmente l'analisi dei dati era qui, ma volendo farla una volta ogni TOT secondi è stata spostata nella funzione checkEnv(), perche queste funzioni sono chiamate ogni volta che c'è una misura.
function onTemperatureData(temperature) {
    tempTemp = temperature;
}
function onPressureData(pressure) {
    tempPress = pressure;
}
function onHumidityData(humidity) {
    tempHum = humidity;
}
function onGasData(gas) {
    tempCO2 = gas.eco2;
    //console.log('Gas sensor: eCO2 ' + gas.eco2 + ' - TVOC ' + gas.tvoc ); //NOTA CHE QUI PUOI MISURARE ANCHE TVOC
}
function onColorData(color) {
    //console.log('Color sensor: r ' + color.red + ' g ' + color.green + ' b ' + color.blue + ' c ' + color.clear );
    tempClear = color.clear;
}
function onQuaternionData(quaternion) {
    //console.log('Quaternion data: w: %d, x: %d, y: %d, z: %d', quaternion.w, quaternion.x, quaternion.y, quaternion.z);
    quaternionW = quaternion.w;
}

// Segue funzione che accoppia il raspberry con il thingy
// Successivamente associa le funzioni di callback agli eventi relativi all'esistenza di un nuovo dato
function onDiscover(thingy) {
    console.log('Discovered: ' + thingy);

    thingy.on('disconnect', function() { // Se il thingy si disconnette
        console.log('Thingy disconnected!');
        socket.disconnect(); // Disconnettiti dal web socket
        process.exit(1); //esci, questo processo child muore
    });

    thingy.connectAndSetUp(function(error) {
        console.log('Connected! ' + (error ? error : ''));

        thingy.on('temperatureNotif', onTemperatureData, 4);
        thingy.on('pressureNotif', onPressureData);
        thingy.on('humidityNotif', onHumidityData);
        thingy.on('gasNotif', onGasData);
        thingy.on('colorNotif', onColorData);
        thingy.on('quaternionNotif', onQuaternionData);

        thingy.temperature_interval_set(1000, function(error) {
            if (error) {
                console.log('Temperature sensor configure! ' + error);
            }
        });
        thingy.pressure_interval_set(1000, function(error) {
            if (error) {
                console.log('Pressure sensor configure! ' + error);
            }
        });
        thingy.humidity_interval_set(1000, function(error) {
            if (error) {
                console.log('Humidity sensor configure! ' + error);
            }
        });
        thingy.color_interval_set(1000, function(error) {
            if (error) {
                console.log('Color sensor configure! ' + error);
            }
        });
        thingy.gas_mode_set(1, function(error) {
            if (error) {
                console.log('Gas sensor configure! ' + error);
            }
        });

        thingy.temperature_enable(function(error) {
            console.log('Temperature sensor started! ' + ((error) ? error : ''));
        });
        thingy.pressure_enable(function(error) {
            console.log('Pressure sensor started! ' + ((error) ? error : ''));
        });
        thingy.humidity_enable(function(error) {
            console.log('Humidity sensor started! ' + ((error) ? error : ''));
        });
        thingy.color_enable(function(error) {
            console.log('Color sensor started! ' + ((error) ? error : ''));
        });
        thingy.gas_enable(function(error) {
            console.log('Gas sensor started! ' + ((error) ? error : ''));
        });
        thingy.quaternion_enable(function (error) {
            console.log('Quaternion sensor started! ' + ((error) ? error : ''));
        });

        setInterval(checkEnv, 5000);
    });
}



const socketIOClient = require('socket.io-client');
const socket = socketIOClient('http://127.0.0.1:3001');

console.log("Waiting for Web Socket connection...")

socket.on('connect', () => { // Dopo che ci si collega al server Web Socket, si cerca il dispositivo thingy
    console.log('Connected to Web Socket server...');
    console.log('Looking for Thingy device...');
    Thingy.discover(onDiscover);
});


// quando ci si disconette dal websocket
socket.on('disconnect', () => {
    console.log('Disconnected from web socket.');
});
