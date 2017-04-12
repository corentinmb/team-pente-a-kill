var express = require('express');
var router = express.Router();
var Game = require('../models/gameModel.js');
var game = null;
var id1 = null;
var id2 = null;
var numbegin = null;
var firsttour = true;
var secondtour = null;


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET connect */
router.get('/connect/:groupName', function(req, res, next) {
  if(!game){
    game = new Game();
    //id1
    id1 = Math.floor((Math.random() * 1000) + 1);
    game.setPlayer1(id1,req.params.groupName,1, null, null);
    res.json({code : 200,
              numJoueur : game.player1.numJoueur,
              idJoueur : game.player1.idJoueur,
              nomJoueur : game.player1.nomJoueur
            })
  }
  else{
    if(game.player1.idJoueur && !game.player2.idJoueur){
      //id2
      id2=Math.floor((Math.random() * 1000) + 1);
      //Les deux ids doivent être différents
      while(id1 == id2){
        id2=Math.floor((Math.random() * 1000) + 1);
      }
      game.setPlayer2(id2,req.params.groupName,2,null,null);
      game.board.initBoard();

      //who begin ?
      numbegin = Math.floor(Math.random() * 2) + 1;
      if (numbegin == 1){
        game.setJoueurcourant(1);
      }
      else{
        game.setJoueurcourant(2);
      }

      res.json({"code" : 200,
                "numJoueur" : game.player2.numJoueur,
                "idJoueur" : game.player2.idJoueur,
                "nomJoueur" : game.player2.nomJoueur
              })
    }
    res.sendStatus(401);
  }
});

/* GET play */
router.get('/play/:x/:y/:idJoueur', function(req, res, next) {
  if (game.finpartie == false){
  	if(((req.params.idJoueur == game.player2.idJoueur) && (game.player2.numJoueur == game.joueurcourant))||((req.params.idJoueur == game.player1.idJoueur) && (game.player1.numJoueur == game.joueurcourant))){
      if (parseInt(req.params.x)>=0 && parseInt(req.params.x)<19 && parseInt(req.params.y)>=0 && parseInt(req.params.y)<19){
    		if ((game.board.pionHere(parseInt(req.params.x),parseInt(req.params.y)) == false)){
          if(firsttour == false && secondtour == false){
            game.incrTour();
      		  game.board.setPion(parseInt(req.params.x),parseInt(req.params.y),game.joueurcourant);
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
              if (direction == "north") return (game.board.getPion(parseInt(req.params.x),parseInt(req.params.y)-parseInt(distance)) == game.joueurcourant);
              if (direction == "south") return (game.board.getPion(parseInt(req.params.x),parseInt(req.params.y)+parseInt(distance)) == game.joueurcourant);
              if (direction == "east") return (game.board.getPion(parseInt(req.params.x)+parseInt(distance),parseInt(req.params.y)) == game.joueurcourant);
              if (direction == "west") return (game.board.getPion(parseInt(req.params.x)-parseInt(distance),parseInt(req.params.y)) == game.joueurcourant);
              if (direction == "northEast") return (game.board.getPion(parseInt(req.params.x)+parseInt(distance),parseInt(req.params.y)-parseInt(distance)) == game.joueurcourant);
              if (direction == "southEast") return (game.board.getPion(parseInt(req.params.x)+parseInt(distance),parseInt(req.params.y)+parseInt(distance)) == game.joueurcourant);
              if (direction == "southWest") return (game.board.getPion(parseInt(req.params.x)-parseInt(distance),parseInt(req.params.y)+parseInt(distance)) == game.joueurcourant);
              if (direction == "northWest") return (game.board.getPion(parseInt(req.params.x)-parseInt(distance),parseInt(req.params.y)-parseInt(distance)) == game.joueurcourant);
            }

            // Count the number of pieces in each direction
            for (var i = 1; i < 5; i ++) {
              if (this.getPieceRelative("north",i) == game.joueurcourant) {
                north++;
              } else {
                break;
              }
            }
            for (var i = 1; i < 5; i ++) {
              if (this.getPieceRelative("south",i) == game.joueurcourant) {
                south++;
              } else {
                break;
              }
            }
            for (var i = 1; i < 5; i ++) {
              if (this.getPieceRelative("east",i) == game.joueurcourant) {
                east++;
              } else {
                break;
              }
            }
            for (var i = 1; i < 5; i ++) {
              if (this.getPieceRelative("west",i) == game.joueurcourant) {
                west++;
              } else {
                break;
              }
            }
            for (var i = 1; i < 5; i ++) {
              if (this.getPieceRelative("northWest",i) == game.joueurcourant) {
                northWest++;
              } else {
                break;
              }
            }
            for (var i = 1; i < 5; i ++) {
              if (this.getPieceRelative("southWest",i) == game.joueurcourant) {
                southWest++;
              } else {
                break;
              }
            }
            for (var i = 1; i < 5; i ++) {
              if (this.getPieceRelative("northEast",i) == game.joueurcourant) {
                northEast++;
              } else {
                break;
              }
            }
            for (var i = 1; i < 5; i ++) {
              if (this.getPieceRelative("southEast",i) == game.joueurcourant) {
                southEast++;
              } else {
                break;
              }
            }

            if (north + south >= 4 || east + west >= 4 || northEast + southWest >= 4 || northWest + southEast >= 4) { // player wins
              game.setfinpartie()
              game.setdetailfinpartie('Victoire du joueur'+game.joueurcourant+' ligne de 5 pions')
            }



             getCoordStringRelative = function(direction, distance) {
              if (direction == "north") return [parseInt(req.params.x),parseInt(req.params.y)-parseInt(distance)];
              if (direction == "south") return [parseInt(req.params.x),parseInt(req.params.y)+parseInt(distance)];
              if (direction == "east") return [parseInt(req.params.x)+parseInt(distance),parseInt(req.params.y)];
              if (direction == "west") return [parseInt(req.params.x)-parseInt(distance),parseInt(req.params.y)];
              if (direction == "northEast") return [parseInt(req.params.x)+parseInt(distance),parseInt(req.params.y)-parseInt(distance)];
              if (direction == "southEast") return [parseInt(req.params.x)+parseInt(distance),parseInt(req.params.y)+parseInt(distance)];
              if (direction == "southWest") return [parseInt(req.params.x)-parseInt(distance),parseInt(req.params.y)+parseInt(distance)];
              if (direction == "northWest") return [parseInt(req.params.x)-parseInt(distance),parseInt(req.params.y)-parseInt(distance)];
            }

            directions = ['north', 'northEast', 'east', 'southEast', 'south', 'southWest', 'west', 'northWest'];
            for (var i = 0; i < directions.length; i ++) {
              var a = directions[i];

               if (this.getPieceRelative(a, 1) == false &&
                  this.getPieceRelative(a, 2) == false &&
                  this.getPieceRelative(a, 3) == true) {
                var firstdelete = getCoordStringRelative(a, 1);
                var seconddelete = getCoordStringRelative(a, 2);

                game.board.deletePion(firstdelete[0],firstdelete[1]);
                game.board.deletePion(seconddelete[0],seconddelete[1]);

                if (game.joueurcourant == 1) game.incrNbtenaillesj1();
                if (game.joueurcourant == 2) game.incrNbtenaillesj2;
                if (game.nbtenaillesj1 == 5 || game.nbtenaillesj2 == 5) {
                  game.setfinpartie()
                  game.setdetailfinpartie('Victoire du joueur'+game.joueurcourant+' avec 5 tenailles')
                  break;
                }
              }
            }

            //Set dernier coup et à qui de jouer
            if(game.joueurcourant == 1){
              game.player2.setDernierCoup(parseInt(req.params.x),parseInt(req.params.y));
              game.setJoueurcourant(2);
            }
            else{
              game.player1.setDernierCoup(parseInt(req.params.x),parseInt(req.params.y));
              game.setJoueurcourant(1)
            }

      		  res.sendStatus(200);
          }
          else{
            if (firsttour == true && parseInt(req.params.x) == 9 && parseInt(req.params.y) == 9){
              game.incrTour();
              game.board.setPion(parseInt(req.params.x),parseInt(req.params.y),game.joueurcourant);
              firsttour = false;
              secondtour = true;

              if(game.joueurcourant == 1){
                game.player2.setDernierCoup(parseInt(req.params.x),parseInt(req.params.y));
                game.setJoueurcourant(2);
              }
              else{
                game.player1.setDernierCoup(parseInt(req.params.x),parseInt(req.params.y));
                game.setJoueurcourant(1)
              }
              res.sendStatus(200);
            }
            else if (firsttour == false && secondtour == true && parseInt(req.params.x) > 7 && parseInt(req.params.x) < 11 && parseInt(req.params.y) > 7 && parseInt(req.params.y) < 11){
              game.incrTour();
              game.board.setPion(parseInt(req.params.x),parseInt(req.params.y),game.joueurcourant);
              secondtour = false;

              if(game.joueurcourant == 1){
                game.player2.setDernierCoup(parseInt(req.params.x),parseInt(req.params.y));
                game.setJoueurcourant(2);
              }
              else{
                game.player1.setDernierCoup(parseInt(req.params.x),parseInt(req.params.y));
                game.setJoueurcourant(1)
              }
              res.sendStatus(200);
            }
            else {
              res.sendStatus(406);
            }
          }
    		}
    		else{
    			res.sendStatus(406);
    		}
      }
      else{
        res.sendStatus(406);
      }
  	}
  	else{
  		res.sendStatus(401);
  	}
  }
  else{
    res.sendStatus(401);
  }
});

/* GET turn */
router.get('/turn/:idJoueur', function(req, res, next) {
  if(req.params.idJoueur == game.player2.idJoueur || req.params.idJoueur == game.player1.idJoueur){
    if(req.params.idJoueur == game.player1.idJoueur){
     res.json({"status" : (game.player1.numJoueur == game.joueurcourant),
          "tableau" : game.board,
          "nbTenaillesJ1" : game.nbtenaillesj1,
          "nbTenaillesJ2" : game.nbtenaillesj2,
          "dernierCoupX" : game.player1.dernierCoupX,
          "dernierCoupY" : game.player1.dernierCoupY,
          "prolongation" : game.prolongation,
          "finPartie" : game.finpartie,
          "detailFinPartie" : game.detailfinpartie,
          "numTour" : game.numtour,
          "code" : 200
            })
      }
    if(req.params.idJoueur == game.player2.idJoueur){
       res.json({"status" : (game.player2.numJoueur == game.joueurcourant),
          "tableau" : game.board,
          "nbTenaillesJ1" : game.nbtenaillesj1,
          "nbTenaillesJ2" : game.nbtenaillesj2,
          "dernierCoupX" : game.player2.dernierCoupX,
          "dernierCoupY" : game.player2.dernierCoupY,
          "prolongation" : game.prolongation,
          "finPartie" : game.finpartie,
          "detailFinPartie" : game.detailFinPartie,
          "numTour" : game.numTour,
          "code" : 200
            })
      }
    }
  else{
  	res.sendStatus(401);
  }
});

module.exports = router;
