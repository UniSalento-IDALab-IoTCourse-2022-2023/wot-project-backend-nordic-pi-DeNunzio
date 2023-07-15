const express = require('express');
const app = express();
const { spawn } = require('child_process');
const cors = require('cors');

app.use(cors());
app.use(cors({
    origin: '*' // Sostituisci con l'origine desiderata
}));

// Definisco dei parametri standard
app.locals.minCO2 = 300;
app.locals.maxCO2 = 500;
app.locals.minTemp = 10;
app.locals.maxTemp = 40;
app.locals.minPress = 900;
app.locals.maxPress = 1100;
app.locals.minHum = 20;
app.locals.maxHum = 80;
app.locals.hasToBeDark = 2; // 0: NON DEVE ESSERCI BUIO, 1: DEVE ESSERCI BUIO, 2: NON IMPORTA SE C'E' BUIO
app.locals.hasToBeHorizontal = 0; // 0: NON IMPORTA SE E' ORIZONTALE O NO, 1: DEVE ESSERE ORIZZONTALE

let analysisProcess; // Variabile che rappresenta il processo child che effettua analisi dell'ambiente
let analysisRunning = false; // Flag che traccia se l'analisi dell'ambiente è in corso

app.use(express.json());


// Tramite questo endpoint vengono settati i valori da rispettare durante l'analisi dell'ambiente, se si esce da questi range bisogna avvisare!
app.post('/set_params', (req, res) => {
    const {
        minCO2,
        maxCO2,
        minTemp,
        maxTemp,
        minPress,
        maxPress,
        minHum,
        maxHum,
        hasToBeDark,
        hasToBeHorizontal
    } = req.body;

    // Assign the values to the app object's properties
    app.locals.minCO2 = minCO2;
    app.locals.maxCO2 = maxCO2;
    app.locals.minTemp = minTemp;
    app.locals.maxTemp = maxTemp;
    app.locals.minPress = minPress;
    app.locals.maxPress = maxPress;
    app.locals.minHum = minHum;
    app.locals.maxHum = maxHum;
    app.locals.hasToBeDark = hasToBeDark
    app.locals.hasToBeHorizontal = hasToBeHorizontal;

    console.log('Received parameters:');
    console.log('Gas:', app.locals.minCO2, app.locals.maxCO2);
    console.log('Temperature:', app.locals.minTemp, app.locals.maxTemp);
    console.log('Pressure:', app.locals.minPress, app.locals.maxPress);
    console.log('Humidity:', app.locals.minHum, app.locals.maxHum);
    console.log('Should it be dark?: ' + app.locals.hasToBeDark);
    console.log('Does it have to be horizontal? ' + app.locals.hasToBeHorizontal)
    console.log("\n");

    res.status(200).json({ message: 'New parameters set...' });
});


// Tramite questo endpoint viene creato un child che si occuperà dell'analisi dell'ambiente.
// Se il child esce con exit code di 1 (significa che ha falito l'accoppiamento bluetooth con il raspberry), allora viene generato un altro child.
app.get('/start_analysis', (req, res) => {
    if (analysisRunning) {
        res.status(400).json({ message: 'The environment analysis is already running.' });
    } else {

        // Creo una funzione che generi il child
        const startAnalysis = () => {
            // Si genera il child, e si passano come argomenti i valori dell'ambiente che devono essere rispettati
            analysisProcess = spawn('node', ['env_analysis.js', app.locals.minCO2, app.locals.maxCO2, app.locals.minTemp, app.locals.maxTemp, app.locals.minPress, app.locals.maxPress, app.locals.minHum, app.locals.maxHum, app.locals.hasToBeDark, app.locals.hasToBeHorizontal]);

            // Si aggiunge un listener all'evento 'data'... quando ci sono dati in output dal child vengono stampati
            analysisProcess.stdout.on('data', (data) => {
                console.log(`-> ${data}`);
            });

            // Si aggiunge un listener all'evento exit, quando il child esce con exit code 1 viene richiamata questa funzione
            analysisProcess.on('exit', (code) => {
                console.log(`Analysis process exited with code ${code}`);
                if (code === 1) {
                    console.log('Relaunching analysis process...');
                    startAnalysis();
                } else {
                    analysisRunning = false;
                }
            });

            analysisRunning = true;
        };

        startAnalysis();
        res.status(200).json({ message: 'Starting environment analysis...' });
    }
});


// Tramite questo endpoint si termina l'analisi dell'ambiente dle processo child
app.get('/stop_analysis', (req, res) => {
    if (analysisRunning) {
        analysisProcess.kill();
        analysisRunning = false;
        console.log("Environment analysis stopped.")
        res.status(200).json({ message: 'Environment analysis stopped.' });
    } else {
        console.log("No environment analysis is currently running.")
        res.status(400).json({ message: 'No environment analysis is currently running.' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000\n');
});