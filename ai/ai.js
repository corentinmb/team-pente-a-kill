var log = require('fancy-log');
var request = require('request');

var IAconfig = {
    adresseAPI: '',
    nomEquipe: '',
    data: ''
};


function init() {
    if (process.argv[2] && process.argv[3]) {
        IAconfig.adresseAPI = process.argv[2];
        IAconfig.nomEquipe = process.argv[3];
        return true;
    } else {
        process.on('exit', (code) => {
            console.log('Usage: node ai.js <AdresseAPI> <NomEquipe>');
            console.log('Exemple: node ai.js http://localhost:3000 Bordeaux');
        });

    }

}

function connect() {
    log.info("Connexion de l'IA...")
    reqConnexion(success);
}

function success(b){
  log.info("IA connectée avec succès !")
  IAconfig.data = b;
}

function reqConnexion(callback) {
    request(IAconfig.adresseAPI + "/connect/" + IAconfig.nomEquipe, function(error, response, body) {
        if (response && response.statusCode == 200) {
            callback(body);
        } else {
            process.on('exit', (code) => {
                log.error('Erreur de connexion à l\'API');
            });
        }

    });
}

//////////////////////////

if (init()) {
    connect();
    console.log(IAconfig.data);
    //play();
}
