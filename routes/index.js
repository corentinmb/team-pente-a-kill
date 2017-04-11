var express = require('express');
var router = express.Router();
var Game = require('../models/gameModel.js');
var game = null;
var numTour = 0;


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET connect */
router.get('/connect/:groupName', function(req, res, next) {
  if(!game){
    game = new Game();
    game.setPlayer1(Math.floor((Math.random() * 1000) + 1),req.params.groupName,1);
    res.json({code : 200,
              numJoueur : game.player1.numJoueur,
              idJoueur : game.player1.idJoueur,
              nomJoueur : game.player1.nomJoueur
            })
  }
  else{
    if(game.player1.idJoueur && !game.player2.idJoueur){
      game.setPlayer2(Math.floor((Math.random() * 1000) + 1),req.params.groupName,2);
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
		if (game.board.Pionhere(req.params.x,req.params.y) == false){
		  game.board.setPion(req.params.x,req.params.y,game.joueurcourant);
		  if (game.joueurcourant == 1) {game.setJoueurcourant(2);}
      else{game.setJoueurcourant(1)}
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
  numTour = numTour + 1;
  res.json({"status" : 0,
  			"tableau" : game.board,
  			"nbTenaillesJ1" : 0,
  			"nbTenaillesJ2" : 0,
  			"dernierCoupX" : 0,
  			"dernierCoupY" : 0,
  			"prolongation" : false,
  			"finPartie" : false,
  			"detailFinPartie" : 'Fin partie',
  			"numTour" : numTour,
  			"code" : 200
           })
  }
  else{
  	res.sendStatus(401);
  }
});

module.exports = router;
