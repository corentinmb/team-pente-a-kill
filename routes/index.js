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
    game.setPlayer1(Math.floor((Math.random() * 1000) + 1),req.params.groupName);
    res.json({code : 200,
              numJoueur : 1,
              idJoueur : game.player1.idJoueur,
              nomJoueur : game.player1.nomJoueur
            })
  }
  else{
    if(game.player1.idJoueur && !game.player2.idJoueur){
      game.setPlayer2(Math.floor((Math.random() * 1000) + 1),req.params.groupName);
      game.board.initBoard();
      res.json({"code" : 200,
                "numJoueur" : 2,
                "idJoueur" : game.player2.idJoueur,
                "nomJoueur" : game.player2.nomJoueur
              })
    }
    res.sendStatus(401);
  }
});

/* GET play */
router.get('/play/:x/:y/:idJoueur', function(req, res, next) {
	if(req.params.idJoueur == game.player2.idJoueur || req.params.idJoueur == game.player1.idJoueur){
		if (game.board.Pionhere(x,y) == false){
		  game.board.setPion(req.params.x,req.params.y,1);
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
