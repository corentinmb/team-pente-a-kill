var express = require('express');
var router = express.Router();
var Game = require('../models/gameModel.js');
var game = null;
var id1 = null;
var id2 = null;
var numbegin = null;
var firsttour = true;
var secondtour = null;
var timepartiestart = null;
var timepartieend = null;
var timetour = null;


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
});

/* GET connect */
router.get('/connect/:groupName', function(req, res, next) {
    if (!game) {
        game = new Game();
        //id1
        id1 = Math.floor((Math.random() * 1000) + 1);
        game.setPlayer1(id1, req.params.groupName, 1, null, null);
        res.json({
            code: 200,
            numJoueur: game.player1.numJoueur,
            idJoueur: game.player1.idJoueur,
            nomJoueur: game.player1.nomJoueur
        })
    } else {
        if (game.player1.idJoueur && !game.player2.idJoueur) {
            //id2
            id2 = Math.floor((Math.random() * 1000) + 1);
            //Les deux ids doivent être différents
            while (id1 == id2) {
                id2 = Math.floor((Math.random() * 1000) + 1);
            }
            game.setPlayer2(id2, req.params.groupName, 2, null, null);
            game.board.initBoard();

            //who begin ?
            numbegin = Math.floor(Math.random() * 2) + 1;
            if (numbegin == 1) {
                game.setJoueurcourant(1);
            } else {
                game.setJoueurcourant(2);
            }

            return res.json({
                "code": 200,
                "numJoueur": game.player2.numJoueur,
                "idJoueur": game.player2.idJoueur,
                "nomJoueur": game.player2.nomJoueur
            })
        }
        return res.sendStatus(401);
    }
});

/* GET play */
router.get('/play/:x/:y/:idJoueur', function(req, res, next) {
    if (game && game.finpartie == false) {
        //On regarde si c'est la prolongation
        if (timepartiestart != null && (game.prolongation == false)) {
            timepartieend = new Date().getTime();
            var calcultemps = ((parseInt(timepartieend) - parseInt(timepartiestart)));
            //console.log(calcultemps);
            if (calcultemps >= 600000) {
                if ((game.nbtenaillesj1 > game.nbtenaillesj2) || (game.nbtenaillesj2 > game.nbtenaillesj1)) {
                    game.setfinpartie();
                    if (game.nbtenaillesj1 > game.nbtenaillesj2) {
                        game.setdetailfinpartie('Victoire du joueur 1 (temps écoulé et plus de tenailles)')
                    } else {
                        game.setdetailfinpartie('Victoire du joueur 2 (temps écoulé et plus de tenailles)')
                    }
                    return res.sendStatus(200);
                } else {
                    game.setProlongation();
                }
            }
        }
        if (((req.params.idJoueur == game.player2.idJoueur) && (game.player2.numJoueur == game.joueurcourant)) || ((req.params.idJoueur == game.player1.idJoueur) && (game.player1.numJoueur == game.joueurcourant))) {
            if (parseInt(req.params.x) >= 0 && parseInt(req.params.x) < 19 && parseInt(req.params.y) >= 0 && parseInt(req.params.y) < 19) {
                if ((game.board.pionHere(parseInt(req.params.x), parseInt(req.params.y)) == false)) {
                    if (firsttour == false && secondtour == false && game.finpartie == false) {
                        var endtour = new Date().getTime();
                        if (parseInt(endtour) - parseInt(timetour) <= 12000) {

                            game.incrTour();
                            game.board.setPion(parseInt(req.params.x), parseInt(req.params.y), game.joueurcourant);
                            //On teste si c'est gagné
                            var north = 0;
                            var south = 0;
                            var east = 0;
                            var west = 0;
                            var northEast = 0;
                            var northWest = 0;
                            var southEast = 0;
                            var southWest = 0;

                            getPieceRelative = function(direction, distance) {
                                if (direction == "north") {
                                    if ((parseInt(req.params.y) - parseInt(distance) < 19) && (parseInt(req.params.y) - parseInt(distance) >= 0)) {
                                        return (game.board.getPion(parseInt(req.params.x), parseInt(req.params.y) - parseInt(distance)) == game.joueurcourant);
                                    } else {
                                        return false;
                                    }
                                }
                                if (direction == "south") {
                                    if ((parseInt(req.params.y) + parseInt(i) < 19) && (parseInt(req.params.y) + parseInt(i) >= 0)) {
                                        return (game.board.getPion(parseInt(req.params.x), parseInt(req.params.y) + parseInt(distance)) == game.joueurcourant);
                                    } else {
                                        return false;
                                    }
                                }
                                if (direction == "east") {
                                    if ((parseInt(req.params.x) + parseInt(i) < 19) && (parseInt(req.params.x) + parseInt(i) >= 0)) {
                                        return (game.board.getPion(parseInt(req.params.x) + parseInt(distance), parseInt(req.params.y)) == game.joueurcourant);
                                    } else {
                                        return false;
                                    }
                                }
                                if (direction == "west") {
                                    if ((parseInt(req.params.x) - parseInt(i) < 19) && (parseInt(req.params.x) - parseInt(i) >= 0)) {
                                        return (game.board.getPion(parseInt(req.params.x) - parseInt(distance), parseInt(req.params.y)) == game.joueurcourant);
                                    } else {
                                        return false;
                                    }
                                }
                                if (direction == "northEast") {
                                    if ((parseInt(req.params.x) + parseInt(i) < 19) && (parseInt(req.params.x) + parseInt(i) >= 0) && (parseInt(req.params.y) - parseInt(i) < 19) && (parseInt(req.params.y) - parseInt(i) >= 0)) {
                                        return (game.board.getPion(parseInt(req.params.x) + parseInt(distance), parseInt(req.params.y) - parseInt(distance)) == game.joueurcourant);
                                    } else {
                                        return false;
                                    }
                                }
                                if (direction == "southEast") {
                                    if ((parseInt(req.params.x) + parseInt(i) < 19) && (parseInt(req.params.x) + parseInt(i) >= 0) && (parseInt(req.params.y) + parseInt(i) < 19) && (parseInt(req.params.y) + parseInt(i) >= 0)) {
                                        return (game.board.getPion(parseInt(req.params.x) + parseInt(distance), parseInt(req.params.y) + parseInt(distance)) == game.joueurcourant);
                                    } else {
                                        return false;
                                    }
                                }
                                if (direction == "southWest") {
                                    if ((parseInt(req.params.x) - parseInt(i) < 19) && (parseInt(req.params.x) - parseInt(i) >= 0) && (parseInt(req.params.y) + parseInt(i) < 19) && (parseInt(req.params.y) + parseInt(i) >= 0)) {
                                        return (game.board.getPion(parseInt(req.params.x) - parseInt(distance), parseInt(req.params.y) + parseInt(distance)) == game.joueurcourant);
                                    } else {
                                        return false;
                                    }
                                }
                                if (direction == "northWest") {
                                    if ((parseInt(req.params.x) - parseInt(i) < 19) && (parseInt(req.params.x) - parseInt(i) >= 0) && (parseInt(req.params.y) - parseInt(i) < 19) && (parseInt(req.params.y) - parseInt(i) >= 0)) {
                                        return (game.board.getPion(parseInt(req.params.x) - parseInt(distance), parseInt(req.params.y) - parseInt(distance)) == game.joueurcourant);
                                    } else {
                                        return false;
                                    }
                                }
                            }

                            // Count the number of pieces in each direction
                            for (var i = 1; i < 5; i++) {
                                if (this.getPieceRelative("north", i)) {
                                    north++;
                                } else {
                                    break;
                                }
                            }
                            for (var i = 1; i < 5; i++) {
                                if (this.getPieceRelative("south", i)) {
                                    south++;
                                } else {
                                    break;
                                }
                            }
                            for (var i = 1; i < 5; i++) {
                                if (this.getPieceRelative("east", i)) {
                                    east++;
                                } else {
                                    break;
                                }
                            }
                            for (var i = 1; i < 5; i++) {
                                if (this.getPieceRelative("west", i)) {
                                    west++;
                                } else {
                                    break;
                                }
                            }
                            for (var i = 1; i < 5; i++) {
                                if (this.getPieceRelative("northWest", i)) {
                                    northWest++;
                                } else {
                                    break;
                                }
                            }
                            for (var i = 1; i < 5; i++) {
                                if (this.getPieceRelative("southWest", i)) {
                                    southWest++;
                                } else {
                                    break;
                                }
                            }
                            for (var i = 1; i < 5; i++) {
                                if (this.getPieceRelative("northEast", i)) {
                                    northEast++;
                                } else {
                                    break;
                                }
                            }
                            for (var i = 1; i < 5; i++) {
                                if (this.getPieceRelative("southEast", i)) {
                                    southEast++;
                                } else {
                                    break;
                                }
                            }

                            if (north + south >= 4 || east + west >= 4 || northEast + southWest >= 4 || northWest + southEast >= 4) { // player wins
                                game.setfinpartie()
                                game.setdetailfinpartie('Victoire du joueur' + game.joueurcourant + ' ligne de 5 pions')
                                return res.sendStatus(200);
                            }



                            getCoordStringRelative = function(direction, distance) {
                                if (direction == "north") return [parseInt(req.params.x), parseInt(req.params.y) - parseInt(distance)];
                                if (direction == "south") return [parseInt(req.params.x), parseInt(req.params.y) + parseInt(distance)];
                                if (direction == "east") return [parseInt(req.params.x) + parseInt(distance), parseInt(req.params.y)];
                                if (direction == "west") return [parseInt(req.params.x) - parseInt(distance), parseInt(req.params.y)];
                                if (direction == "northEast") return [parseInt(req.params.x) + parseInt(distance), parseInt(req.params.y) - parseInt(distance)];
                                if (direction == "southEast") return [parseInt(req.params.x) + parseInt(distance), parseInt(req.params.y) + parseInt(distance)];
                                if (direction == "southWest") return [parseInt(req.params.x) - parseInt(distance), parseInt(req.params.y) + parseInt(distance)];
                                if (direction == "northWest") return [parseInt(req.params.x) - parseInt(distance), parseInt(req.params.y) - parseInt(distance)];
                            }

                            directions = ['north', 'northEast', 'east', 'southEast', 'south', 'southWest', 'west', 'northWest'];

                            getNumPion = function(direction, distance) {
                                if (direction == "north") {
                                    if ((parseInt(req.params.y) - parseInt(distance) < 19) && (parseInt(req.params.y) - parseInt(distance) >= 0)) {
                                        return (game.board.getPion(parseInt(req.params.x), parseInt(req.params.y) - parseInt(distance)));
                                    } else {
                                        return false;
                                    }
                                }
                                if (direction == "south") {
                                    if ((parseInt(req.params.y) + parseInt(i) < 19) && (parseInt(req.params.y) + parseInt(i) >= 0)) {
                                        return (game.board.getPion(parseInt(req.params.x), parseInt(req.params.y) + parseInt(distance)));
                                    } else {
                                        return false;
                                    }
                                }
                                if (direction == "east") {
                                    if ((parseInt(req.params.x) + parseInt(i) < 19) && (parseInt(req.params.x) + parseInt(i) >= 0)) {
                                        return (game.board.getPion(parseInt(req.params.x) + parseInt(distance), parseInt(req.params.y)));
                                    } else {
                                        return false;
                                    }
                                }
                                if (direction == "west") {
                                    if ((parseInt(req.params.x) - parseInt(i) < 19) && (parseInt(req.params.x) - parseInt(i) >= 0)) {
                                        return (game.board.getPion(parseInt(req.params.x) - parseInt(distance), parseInt(req.params.y)));
                                    } else {
                                        return false;
                                    }
                                }
                                if (direction == "northEast") {
                                    if ((parseInt(req.params.x) + parseInt(i) < 19) && (parseInt(req.params.x) + parseInt(i) >= 0) && (parseInt(req.params.y) - parseInt(i) < 19) && (parseInt(req.params.y) - parseInt(i) >= 0)) {
                                        return (game.board.getPion(parseInt(req.params.x) + parseInt(distance), parseInt(req.params.y) - parseInt(distance)));
                                    } else {
                                        return false;
                                    }
                                }
                                if (direction == "southEast") {
                                    if ((parseInt(req.params.x) + parseInt(i) < 19) && (parseInt(req.params.x) + parseInt(i) >= 0) && (parseInt(req.params.y) + parseInt(i) < 19) && (parseInt(req.params.y) + parseInt(i) >= 0)) {
                                        return (game.board.getPion(parseInt(req.params.x) + parseInt(distance), parseInt(req.params.y) + parseInt(distance)));
                                    } else {
                                        return false;
                                    }
                                }
                                if (direction == "southWest") {
                                    if ((parseInt(req.params.x) - parseInt(i) < 19) && (parseInt(req.params.x) - parseInt(i) >= 0) && (parseInt(req.params.y) + parseInt(i) < 19) && (parseInt(req.params.y) + parseInt(i) >= 0)) {
                                        return (game.board.getPion(parseInt(req.params.x) - parseInt(distance), parseInt(req.params.y) + parseInt(distance)));
                                    } else {
                                        return false;
                                    }
                                }
                                if (direction == "northWest") {
                                    if ((parseInt(req.params.x) - parseInt(i) < 19) && (parseInt(req.params.x) - parseInt(i) >= 0) && (parseInt(req.params.y) - parseInt(i) < 19) && (parseInt(req.params.y) - parseInt(i) >= 0)) {
                                        return (game.board.getPion(parseInt(req.params.x) - parseInt(distance), parseInt(req.params.y) - parseInt(distance)));
                                    } else {
                                        return false;
                                    }
                                }
                            }

                            for (var i = 0; i < directions.length; i++) {
                                var a = directions[i];
                                var ennemi = null;
                                if (game.joueurcourant == 1) {
                                    ennemi = 2;
                                } else {
                                    ennemi = 1;
                                }
                                if (this.getNumPion(a, 1) == ennemi &&
                                    this.getNumPion(a, 2) == ennemi &&
                                    this.getNumPion(a, 3) == game.joueurcourant) {
                                    var firstdelete = getCoordStringRelative(a, 1);
                                    var seconddelete = getCoordStringRelative(a, 2);

                                    game.board.deletePion(firstdelete[0], firstdelete[1]);
                                    game.board.deletePion(seconddelete[0], seconddelete[1]);

                                    if (game.joueurcourant == 1) game.incrNbtenaillesj1();
                                    if (game.joueurcourant == 2) game.incrNbtenaillesj2();
                                    if (game.nbtenaillesj1 == 5 || game.nbtenaillesj2 == 5) {
                                        game.setfinpartie();
                                        game.setdetailfinpartie('Victoire du joueur ' + game.joueurcourant + ' avec 5 tenailles');
                                        break;
                                    }
                                    if (game.prolongation == true) {
                                        game.setfinpartie();
                                        game.setdetailfinpartie('Victoire du joueur ' + game.joueurcourant + ' avec 1 tenaille en prolongation');
                                        break;
                                    }
                                }
                            }

                            //Set dernier coup et à qui de jouer
                            if (game.joueurcourant == 1) {
                                game.player2.setDernierCoup(parseInt(req.params.x), parseInt(req.params.y));
                                game.setJoueurcourant(2);
                            } else {
                                game.player1.setDernierCoup(parseInt(req.params.x), parseInt(req.params.y));
                                game.setJoueurcourant(1)
                            }
                            timetour = new Date().getTime();
                            return res.sendStatus(200);
                        } else {
                            game.setfinpartie();
                            if (game.joueurcourant == 1) {
                                game.setdetailfinpartie('Victoire du joueur 2 (trop de temps à jouer)');
                            } else {
                                game.setdetailfinpartie('Victoire du joueur 1 (trop de temps à jouer)');
                            }
                            return res.sendStatus(200);
                        }
                    } else {
                        if (firsttour == true && parseInt(req.params.x) == 9 && parseInt(req.params.y) == 9) {
                            game.incrTour();
                            //On initialise le temps
                            timepartiestart = new Date().getTime();
                            game.board.setPion(parseInt(req.params.x), parseInt(req.params.y), game.joueurcourant);
                            firsttour = false;
                            secondtour = true;

                            if (game.joueurcourant == 1) {
                                game.player2.setDernierCoup(parseInt(req.params.x), parseInt(req.params.y));
                                game.setJoueurcourant(2);
                            } else {
                                game.player1.setDernierCoup(parseInt(req.params.x), parseInt(req.params.y));
                                game.setJoueurcourant(1)
                            }
                            timetour = new Date().getTime();
                            return res.sendStatus(200);
                        } else if (firsttour == false && secondtour == true && parseInt(req.params.x) > 5 && parseInt(req.params.x) < 13 && parseInt(req.params.y) > 5 && parseInt(req.params.y) < 13) {
                            var endtour = new Date().getTime();
                            if (parseInt(endtour) - parseInt(timetour) <= 12000) {
                                game.incrTour();
                                game.board.setPion(parseInt(req.params.x), parseInt(req.params.y), game.joueurcourant);
                                secondtour = false;

                                if (game.joueurcourant == 1) {
                                    game.player2.setDernierCoup(parseInt(req.params.x), parseInt(req.params.y));
                                    game.setJoueurcourant(2);
                                } else {
                                    game.player1.setDernierCoup(parseInt(req.params.x), parseInt(req.params.y));
                                    game.setJoueurcourant(1)
                                }
                                timetour = new Date().getTime();
                                return res.sendStatus(200);
                            } else {
                                game.setfinpartie();
                                if (game.joueurcourant == 1) {
                                    game.setdetailfinpartie('Victoire du joueur 2 (trop de temps à jouer)');
                                } else {
                                    game.setdetailfinpartie('Victoire du joueur 1 (trop de temps à jouer)');
                                }
                                return res.sendStatus(200);
                            }
                        } else {
                            return res.sendStatus(406);
                        }
                    }
                } else {
                    return res.sendStatus(406);
                }
            } else {
                return res.sendStatus(406);
            }
        } else {
            return res.sendStatus(401);
        }
    } else {
        return res.sendStatus(401);
    }
});

/* GET turn */
router.get('/turn/:idJoueur', function(req, res, next) {
    if (req.params.idJoueur == game.player2.idJoueur || req.params.idJoueur == game.player1.idJoueur) {
        var stat = null;
        if (req.params.idJoueur == game.player1.idJoueur) {
            if (game.player1.numJoueur == game.joueurcourant) {
                stat = 1;
            } else {
                stat = 0;
            }
            res.json({
                "status": stat,
                "tableau": game.board.board,
                "nbTenaillesJ1": game.nbtenaillesj1,
                "nbTenaillesJ2": game.nbtenaillesj2,
                "dernierCoupX": game.player1.dernierCoupX,
                "dernierCoupY": game.player1.dernierCoupY,
                "prolongation": game.prolongation,
                "finPartie": game.finpartie,
                "detailFinPartie": game.detailfinpartie,
                "numTour": game.numTour,
                "code": 200
            })
        }
        if (req.params.idJoueur == game.player2.idJoueur) {
            if (game.player2.numJoueur == game.joueurcourant) {
                stat = 1;
            } else {
                stat = 0;
            }
            res.json({
                "status": stat,
                "tableau": game.board.board,
                "nbTenaillesJ1": game.nbtenaillesj1,
                "nbTenaillesJ2": game.nbtenaillesj2,
                "dernierCoupX": game.player2.dernierCoupX,
                "dernierCoupY": game.player2.dernierCoupY,
                "prolongation": game.prolongation,
                "finPartie": game.finpartie,
                "detailFinPartie": game.detailfinpartie,
                "numTour": game.numTour,
                "code": 200
            })
        }
    } else {
        return res.sendStatus(401);
    }
});



/* GET infos */
router.get('/infos', function(req, res, next) {
  res.json({
    "player1": game.player1.nomJoueur,
    "player2": game.player2.nomJoueur,
  })
});

/* GET reset */
router.get('/reset', function(req, res, next) {
    game = null;
    id1 = null;
    id2 = null;
    numbegin = null;
    firsttour = true;
    secondtour = null;
    timepartiestart = null;
    timepartieend = null;
    timetour = null;
    res.redirect('/')
});

module.exports = router;
