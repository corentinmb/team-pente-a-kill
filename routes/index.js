var express = require('express');
var router = express.Router();
var Game = require('../models/gameModel.js');
var game = null;


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET connect */
router.get('/connect/:groupName', function(req, res, next) {
  if(!game){
    game = new Game();
    game.setPlayer1(Math.floor((Math.random() * 1000) + 1),req.params.groupName,1, null, null);
    res.json({code : 200,
              numJoueur : game.player1.numJoueur,
              idJoueur : game.player1.idJoueur,
              nomJoueur : game.player1.nomJoueur
            })
  }
  else{
    if(game.player1.idJoueur && !game.player2.idJoueur){
      game.setPlayer2(Math.floor((Math.random() * 1000) + 1),req.params.groupName,2,null,null);
      game.board.initBoard();
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
	if(((req.params.idJoueur == game.player2.idJoueur) && (game.player2.numJoueur == game.joueurcourant))||((req.params.idJoueur == game.player1.idJoueur) && (game.player1.numJoueur == game.joueurcourant))){
		if (game.board.pionHere(req.params.x,req.params.y) == false){
      game.incrTour();
		  game.board.setPion(req.params.x,req.params.y,game.joueurcourant);
      //Set dernier coup et à qui de jouer
      if(game.joueurcourant == 1){
        game.player2.setDernierCoup(req.params.x,req.params.y);
        game.setJoueurcourant(2);
      }
      else{
        game.player1.setDernierCoup(req.params.x,req.params.y);
        game.setJoueurcourant(1)
      }

		  res.send('Pion bien placé');
		}
		else{
			res.sendStatus(406);
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
