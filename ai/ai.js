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
        ////console.log(this.pieces);
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
    coordinates: function(spot) { // takes 4-digit string, returns array with [x, y]
        // //console.log('[coordinates] input: ' + spot);
        // //console.log('[coordinates] output: ' + [Number(spot.substring(0,2)), Number(spot.substring(2))]);
        return [Number(spot.substring(0, 2)), Number(spot.substring(2))];
    },
    coordString: function(x, y) { // takes two coordinates, returns 4-digit string
        ////console.log('[coordString] incoming: ' + x + ', ' + y);
        var column = x.toString();
        var roww = y.toString();
        if (column.length < 2) {
            column = "0" + column;
        }
        if (roww.length < 2) {
            roww = "0" + roww;
        }
        ////console.log ('[coordString] returning: ' + column + roww);
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
        ////console.log(this.pieces)
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
            ////console.log(IAconfig.currentPlayer);
            callback(IAconfig.dataConnect);
        } else {
            process.on('exit', (code) => {
                log.error('Erreur de connexion à l\'API');
            });
        }

    });
}

function printInConsole(b) {
    ////console.log(b)
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
            // C'est a moi (l'IA) de jouer
            log.info("A moi de jouer... (Tour " + b.numTour + ")")
            if (b.numTour == 0) {
                // Ici on a pas le choix... On joue au centre
                log.info("Tour 1: Je joue au centre...")
                play(9, 9);
            } else if (b.numTour == 1) {
                var x = getRand(6, 12);
                var y = getRand(6, 12);
                log.info("Tour 2: Je joue dans le cadre du milieu en " + x + ";" + y + "...")
                play(x, y);
            } else if (b.numTour > 1) {
                // IA teubée
                //var x = getRand(0,18);
                //var y = getRand(0,18);
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
    var possibilities = []; // set of all the spots on the board we're considering

    if (finPartie) {
        return null;
    }

    for (var i = 0; i < 19; i++) {
        for (var j = 0; j < 19; j++) {
            var possibility = IAconfig.coordString(i, j); // spot we're considering right now
            if (IAconfig.pieces[possibility] != 0) {
                // //console.log('[brain] just skipped considering spot ' + possibility + ' that already has a piece');
                continue;
            }
            var strength = 0;
            for (var k = 0; k < 8; k++) {
                var a = directions[k];

                // adjacent piece of either color
                if (IAconfig.getPiece(i, j, a, 1)) {
                    strength += 1;
                }

                if (strength == 0) continue;

                // pair that can be stolen (b1)
                if (IAconfig.getPiece(i, j, a, 1) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, a, 2) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, a, 3) == IAconfig.currentPlayer) {
                    strength += 10;
                    //console.log('[brain] found pair to steal ' + IAconfig.coordString(i, j));

                    for (var m = 1; m < 3; m++) { // once for each of the pieces in the pair to consider stealing...
                        var x = IAconfig.coordinates(IAconfig.getCoordString(i, j, a, m))[0];
                        var y = IAconfig.coordinates(IAconfig.getCoordString(i, j, a, m))[1];
                        //console.log('[brain, pair subroutine] looking at piece ' + IAconfig.coordString(i, j));
                        var subDirections = perpendicularDirections(a);
                        for (var l = 0; l < 3; l++) { // once for each of three possible directions...
                            if (
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
                                //console.log('[brain, pair subroutine] boosting pair based on disrupting 3-in-row');
                            }
                        }
                    }
                }

                // defend vulnerable pair (b2)
                if (IAconfig.getPiece(i, j, a, 1) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 2) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 3) == IAconfig.currentOpponent()) {
                    strength += 10;
                    //console.log('[brain] found vulnerable pair ' + IAconfig.coordString(i, j));
                }

                // block 3-in-row (b3)
                if (IAconfig.getPiece(i, j, a, 1) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, a, 2) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, a, 3) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, a, 4) != IAconfig.currentPlayer) {
                    strength += 15;
                    //console.log('[brain] blocking 3-in-row ' + IAconfig.coordString(i, j));
                }

                // try to make a 3-in-row if pair exists (merge with b1?) (b4.a)
                if (IAconfig.getPiece(i, j, a, 1) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 2) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 3) != 0) {
                    strength += 4;
                    //console.log('[brain] making 3-in-row ' + IAconfig.coordString(i, j));
                }

                // try to make a 3-in-row if two orphans exist (b4.b)
                if (IAconfig.getPiece(i, j, a, 1) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 2) != IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, oppositeDirection(a), 1) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, oppositeDirection(a), 2) != IAconfig.currentOpponent()
                ) {
                    strength += 4;
                    //console.log('[brain] making 3-in-row with orphans (this should execute twice if at all (b4.b)');
                }

                // attack opponent's undefended pair (b5)
                if (IAconfig.getPiece(i, j, a, 1) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, a, 2) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, a, 3) != 0) {
                    strength += 1;
                    //console.log('[brain] attacking undefended pair');
                }

                // don't set up a vulnerable pair (b6.a)
                if (IAconfig.getPiece(i, j, a, 1) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 2) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, oppositeDirection(a), 1) != 0) {
                    strength -= 8;
                    //console.log('[brain] preventing setting up vulnerable pair (b6.a)');
                }

                // don't set up a vulnerable pair (b6.b)
                if (IAconfig.getPiece(i, j, a, 1) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, oppositeDirection(a), 1) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, a, 2) != 0) {
                    strength -= 8;
                    //console.log('[brain] preventing setting up vulnerable pair (b6.b)');
                }

                // prevent 4-in-a-row (b7.a)
                if (
                    IAconfig.getPiece(i, j, a, 1) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, a, 2) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, oppositeDirection(a), 1) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, oppositeDirection(a), 2) != IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 3) != IAconfig.currentPlayer
                ) {
                    strength += 10;
                    //console.log('[brain] preventing 4-in-a-row (b7.a)');
                }

                // prevent 4-in-a-row (b7.a)
                if (
                    IAconfig.getPiece(i, j, a, 1) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, a, 2) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, a, 3) == IAconfig.currentOpponent() &&
                    IAconfig.getPiece(i, j, a, 4) != IAconfig.currentPlayer
                ) {
                    strength += 10;
                    //console.log('[brain] preventing 4-in-a-row (b7.b)');
                }

                // win (b8.a)
                if (
                    IAconfig.getPiece(i, j, a, 1) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 2) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, oppositeDirection(a), 1) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, oppositeDirection(a), 2) == IAconfig.currentPlayer
                ) {
                    strength += 15;
                    //console.log('[brain] found 5-in-a-row (b8.a)');
                }

                // win (b8.b)
                if (
                    IAconfig.getPiece(i, j, a, 1) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 2) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 3) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, oppositeDirection(a), 1) == IAconfig.currentPlayer
                ) {
                    strength += 15;
                    //console.log('[brain] found 5-in-a-row (b8.b)');
                }

                // win (b8.c)
                if (
                    IAconfig.getPiece(i, j, a, 1) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 2) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 3) == IAconfig.currentPlayer &&
                    IAconfig.getPiece(i, j, a, 4) == IAconfig.currentPlayer
                ) {
                    strength += 15;
                    //console.log('[brain] found 5-in-a-row (b8.c)');
                }
            }

            if (strength > 3) { // for promising spots, we're going to do a little extra work
                for (var l = 1; l < 4; l++) {
                    if (IAconfig.getPiece(i, j, a, l) == IAconfig.currentPlayer) {
                        strength += 4 - l; // adjacent pieces add 3,
                    }
                    ////console.log('[brain] adding score for possible nearby pieces ' + IAconfig.coordString(i, j));
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
                    //console.log("ERROR: difficulty not set correctly!");
            }

            if (strength >= highestStrength - 10 && strength > 1) {
                possibilities[Number(possibility)] = strength;
            }
            if (strength > highestStrength) {
                highestStrength = strength;
            }
        }
    }
    ////console.log('[brain] highestStrength: ' + highestStrength);
    ////console.log('[brain] possibilities: ');
    ////console.log(possibilities);

    // // for those that are left,
    // // add points for nearby pieces of the same color

    // possibilities.forEach(function(e, i) {

    // });

    var move = possibilities.indexOf(highestStrength).toString();
    while (move.length < 4) {
        move = "0" + move;
    }

    ////console.log('[brain] move: ' + move + '-----------------------------------');
    return move;
}

//////////////////////////

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
