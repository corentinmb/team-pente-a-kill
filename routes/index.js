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
    game.setPlayer1(Math.floor((Math.random() * 1000) + 1),req.params.groupName);
    res.json(game)
  }
  else{
    if(game.player1.idJoueur && !game.player2.idJoueur){
      game.setPlayer2(Math.floor((Math.random() * 1000) + 1),req.params.groupName);
      res.json(game)
    }
    res.send(401);
  }
});

/* GET play */
router.get('/play/:x/:y/:idJoueur', function(req, res, next) {
  res.send(JSON.stringify(req.params))
});

/* GET turn */
router.get('/turn/:idJoueur', function(req, res, next) {
  res.send(JSON.stringify(req.params))
});

module.exports = router;
