var log = require('fancy-log');
var request = require('request');

var IAconfig = {
    adresseAPI: null,
    nomEquipe: null,
    dataConnect: null,
    dataTurn: null
};

var finPartie = false;

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

function connect(callback) {
    log.info("Connexion de l'IA...")
    request(IAconfig.adresseAPI + "/connect/" + IAconfig.nomEquipe, function(error, response, body) {
        if (response && response.statusCode == 200) {
          log.info("IA connectée avec succès !")
          IAconfig.dataConnect = JSON.parse(body);
          callback(IAconfig.dataConnect);
        } else {
          process.on('exit', (code) => {
              log.error('Erreur de connexion à l\'API');
          });
        }

    });
}

function printInConsole(b){
  //console.log(b)
}

function play(x,y){
  request(IAconfig.adresseAPI + "/play/" + x + "/" + y + "/" + IAconfig.dataConnect.idJoueur);
}

function turn(callback){
  request(IAconfig.adresseAPI + "/turn/" + IAconfig.dataConnect.idJoueur, function(error, response, body) {
      if (response && response.statusCode == 200) {
        IAconfig.dataTurn = JSON.parse(body);
        callback(IAconfig.dataTurn);
      }
  });
}

function getRand(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min +1)) + min;
}

function caseDisponible(x,y){
  return IAconfig.dataTurn.tableau[x][y] == 0 ? true : false;
}

function move(b){
  if(!b.finPartie){
    if(b.status == 1){
      // C'est a moi (l'IA) de jouer
      log.info("A moi de jouer... (Tour " + b.numTour + ")")
      if(b.numTour == 0){
        // Ici on a pas le choix... On joue au centre
        log.info("Tour 1: Je joue au centre...")
        play(9,9);
      } else if (b.numTour == 1){
        var x = getRand(6,12);
        var y = getRand(6,12);
        log.info("Tour 2: Je joue dans le cadre du milieu en " + x + ";" + y + "...")
        play(x,y);
      } else if (b.numTour > 1){
        var x = getRand(0,18);
        var y = getRand(0,18);
        log.info("Tour " + b.numTour + ": Je joue en " + x + ";" + y + "...")
        play(x,y);
      }
    } else {
      log.info("Attente...")
    }
  } else {
    finPartie = true;
  }
}

//////////////////////////

if (init()) {
    connect(printInConsole);
      var intervalHolder = setInterval(function() {
        if(!finPartie){
          turn(move);
        } else {
          clearInterval(intervalHolder);
          log.info("Partie terminée:")
          log.info(IAconfig.dataTurn.detailFinPartie)
        }
      },500);
}
