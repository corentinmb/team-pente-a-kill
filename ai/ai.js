var log = require('fancy-log');
var request = require('request');

var IAconfig = {
    adresseAPI: null,
    nomEquipe: null,
    dataConnect: null,
    dataTurn: null,
    currentPlayer: null,
    pieces: {},
    difficulty: "Hard",
    getPiece: function(x, y, direction, distance) {
                if (direction == "north") return this.pieces[this.coordString(x, y - distance)];
        if (direction == "south") return this.pieces[this.coordString(x, y + distance)];
        if (direction == "east") return this.pieces[this.coordString(x + distance, y)];
        if (direction == "west") return this.pieces[this.coordString(x - distance, y)];
        if (direction == "northEast") return this.pieces[this.coordString(x + distance, y - distance)];
        if (direction == "southEast") return this.pieces[this.coordString(x + distance, y + distance)];
        if (direction == "southWest") return this.pieces[this.coordString(x - distance, y + distance)];
        if (direction == "northWest") return this.pieces[this.coordString(x - distance, y - distance)];
    },
    getCoordString: function(x, y, direction, distance) {
        if (direction == "north") return this.coordString(x, y - distance);
        if (direction == "south") return this.coordString(x, y + distance);
        if (direction == "east") return this.coordString(x + distance, y);
        if (direction == "west") return this.coordString(x - distance, y);
        if (direction == "northEast") return this.coordString(x + distance, y - distance);
        if (direction == "southEast") return this.coordString(x + distance, y + distance);
        if (direction == "southWest") return this.coordString(x - distance, y + distance);
        if (direction == "northWest") return this.coordString(x - distance, y - distance);
    },
    coordinates: function(spot) {                         return [Number(spot.substring(0, 2)), Number(spot.substring(2))];
    },
    coordString: function(x, y) {                 var column = x.toString();
        var roww = y.toString();
        if (column.length < 2) {
            column = "0" + column;
        }
        if (roww.length < 2) {
            roww = "0" + roww;
        }
                return column + roww;
    },
    currentOpponent: function() {
        if (this.dataConnect.numJoueur == 1) {
            return 2;
        } else {
            return 1;
        }
    },
    copyAndParsePiecesArray: function() {
        var SIZE = 19;
        for (var i = 0; i < SIZE; i++) {
            for (var j = 0; j < SIZE; j++) {
                this.pieces[this.coordString(i, j)] = this.dataTurn.tableau[i][j];
            }
        }
            }
};

var finPartie = false;
directions = ['north', 'northEast', 'east', 'southEast', 'south', 'southWest', 'west', 'northWest'];

function oppositeDirection(direction) {
    if (direction == "north") return "south";
    if (direction == "northEast") return "southWest";
    if (direction == "east") return "west";
    if (direction == "southEast") return "northWest";
    if (direction == "south") return "north";
    if (direction == "southWest") return "northEast";
    if (direction == "west") return "east";
    if (direction == "northWest") return "southEast";
}

function perpendicularDirections(direction) {
    var d = directions.indexOf(direction);
    if (d < 4) {
        return [directions[d + 1], directions[d + 2], directions[d + 3]];
    } else {
        return [directions[d - 1], directions[d - 2], directions[d - 3]];
    }
}

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
            IAconfig.currentPlayer = IAconfig.dataConnect.numJoueur;
                        callback(IAconfig.dataConnect);
        } else {
            process.on('exit', (code) => {
                log.error('Erreur de connexion à l\'API');
            });
        }

    });
}

function printInConsole(b) {
    }

function play(x, y) {
    request(IAconfig.adresseAPI + "/play/" + x + "/" + y + "/" + IAconfig.dataConnect.idJoueur);
}

function turn(callback) {
    request(IAconfig.adresseAPI + "/turn/" + IAconfig.dataConnect.idJoueur, function(error, response, body) {
        if (response && response.statusCode == 200) {
            IAconfig.dataTurn = JSON.parse(body);
            if (IAconfig.dataTurn.tableau)
                IAconfig.copyAndParsePiecesArray();
            callback(IAconfig.dataTurn);
        }
    });
}

function getRand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function parseCoord(d) {
    var coord = {
        x: null,
        y: null
    }
    coord.x = parseInt(d.substring(0, 2));
    coord.y = parseInt(d.substring(2));

    return coord;
}

function move(b) {
    if (!b.finPartie) {
        if (b.status == 1) {
                        log.info("A moi de jouer... (Tour " + b.numTour + ")")
            if (b.numTour == 0) {
                                log.info("Tour 1: Je joue au centre...")
                play(9, 9);
            } else if (b.numTour == 2) {
                var x = getRand(0, 5);
                var y = getRand(0, 5);
                log.info("Tour 2: Je joue dans le cadre du milieu en " + x + ";" + y + "...")
                play(x, y);
            } else if (b.numTour > 1 || b.numTour == 1) {
                                                                var move = brain();
                IAconfig.pieces[move] = IAconfig.currentPlayer;
                move = parseCoord(move);
                log.info("Tour " + b.numTour + ": Je joue en " + move.x + ";" + move.y + "...")
                play(move.x, move.y);
            }
        } else {
            log.info("Attente...")
        }
    } else {
        finPartie = true;
    }
}

function brain() {
    var highestStrength = 0;
    var possibilities = [];
    if (finPartie) {
        return null;
    }

    for (var i = 0; i < 19; i++) {
        for (var j = 0; j < 19; j++) {
            var possibility = IAconfig.coordString(i, j);             if (IAconfig.pieces[possibility] != 0) {
                                continue;
            }
            var strength = 0;
            for (var k = 0; k < 8; k++) {
                var a = directions[k];

                                if (IAconfig.getPiece(i, j, a, 1)) {
                    strength += 1;
                }

                if (strength == 0) continue;

                                if (IAconfig.getPiece(i, j, a, 1) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, a, 2) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, a, 3) == IAconfig.currentPlayer) {
                    strength += 10;

                    for (var m = 1; m < 3; m++) {                         var x = IAconfig.coordinates(IAconfig.getCoordString(i, j, a, m))[0];
                        var y = IAconfig.coordinates(IAconfig.getCoordString(i, j, a, m))[1];
                                                var subDirections = perpendicularDirections(a);
                        for (var l = 0; l < 3; l++) {                             if (
                                (IAconfig.getPiece(x, y, subDirections[l], 1) == IAconfig.currentOpponent() &&
                                    IAconfig.getPiece(x, y, oppositeDirection(subDirections[l]), 1) == IAconfig.currentOpponent()
                                ) || (
                                    (
                                        IAconfig.getPiece(x, y, subDirections[l], 1) == IAconfig.currentOpponent() &&
                                        IAconfig.getPiece(x, y, subDirections[l], 2) == IAconfig.currentOpponent()
                                    ) || (
                                        IAconfig.getPiece(x, y, oppositeDirection(subDirections[l]), 1) == IAconfig.currentOpponent() &&
                                        IAconfig.getPiece(x, y, oppositeDirection(subDirections[l]), 2) == IAconfig.currentOpponent()
                                    )
                                )
                            ) {
                                strength += 16;
                                                            }
                        }
                    }
                }

                                if (IAconfig.getPiece(i, j, a, 1) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 2) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 3) == IAconfig.currentOpponent()) {
                    strength += 10;
                                    }

                                if (IAconfig.getPiece(i, j, a, 1) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, a, 2) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, a, 3) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, a, 4) != IAconfig.currentPlayer) {
                    strength += 15;
                                    }

                                if (IAconfig.getPiece(i, j, a, 1) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 2) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 3) != 0) {
                    strength += 4;
                                    }

                                if (IAconfig.getPiece(i, j, a, 1) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 2) != IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, oppositeDirection(a), 1) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, oppositeDirection(a), 2) != IAconfig.currentOpponent()
                ) {
                    strength += 4;
                                    }

                                if (IAconfig.getPiece(i, j, a, 1) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, a, 2) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, a, 3) != 0) {
                    strength += 1;
                                    }

                                if (IAconfig.getPiece(i, j, a, 1) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 2) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, oppositeDirection(a), 1) != 0) {
                    strength -= 8;
                                    }

                                if (IAconfig.getPiece(i, j, a, 1) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, oppositeDirection(a), 1) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, a, 2) != 0) {
                    strength -= 8;
                                    }

                                if (
                    IAconfig.getPiece(i, j, a, 1) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, a, 2) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, oppositeDirection(a), 1) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, oppositeDirection(a), 2) != IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 3) != IAconfig.currentPlayer
                ) {
                    strength += 10;
                                    }

                                if (
                    IAconfig.getPiece(i, j, a, 1) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, a, 2) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, a, 3) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, a, 4) != IAconfig.currentPlayer
                ) {
                    strength += 10;
                                    }

                                if (
                    IAconfig.getPiece(i, j, a, 1) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 2) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, oppositeDirection(a), 1) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, oppositeDirection(a), 2) == IAconfig.currentPlayer
                ) {
                    strength += 15;
                                    }

                                if (
                    IAconfig.getPiece(i, j, a, 1) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 2) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 3) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, oppositeDirection(a), 1) == IAconfig.currentPlayer
                ) {
                    strength += 15;
                                    }

                                if (
                    IAconfig.getPiece(i, j, a, 1) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 2) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 3) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 4) == IAconfig.currentPlayer
                ) {
                    strength += 15;
                                    }
            }

            if (strength > 3) {                 for (var l = 1; l < 4; l++) {
                    if (IAconfig.getPiece(i, j, a, l) == IAconfig.currentPlayer) {
                        strength += 4 - l;                     }
                                        if (IAconfig.getPiece(i, j, a, l) == IAconfig.currentOpponent()) break;
                }
            }

            switch (IAconfig.difficulty) {
                case "Easy":
                    if (Object.keys(IAconfig.pieces).length < 5) {
                        strength += Math.random() * 10;
                    } else {
                        strength += Math.random() * 20;
                    }
                    break;
                case "Medium":
                    strength += Math.random() * 7;
                    break;
                case "Hard":
                    strength += Math.random();
                    break;
                default:
                                }

            if (strength >= highestStrength - 10 && strength > 1) {
                possibilities[Number(possibility)] = strength;
            }
            if (strength > highestStrength) {
                highestStrength = strength;
            }
        }
    }




    var move = possibilities.indexOf(highestStrength).toString();
    while (move.length < 4) {
        move = "0" + move;
    }

        return move;
}


if (init()) {
    connect(printInConsole);
    var intervalHolder = setInterval(function() {
        if (!finPartie) {
            turn(move);
        } else {
            clearInterval(intervalHolder);
            log.info("Partie terminée:")
            log.info(IAconfig.dataTurn.detailFinPartie)
        }
    }, 500);
}
