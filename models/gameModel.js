var Player = require('../models/playerModel.js');
var Board = require('../models/boardModel.js');

// Constructor
function Game() {
  // always initialize all instance properties
  this.player1 = new Player();
  this.player2 = new Player();
  this.board = new Board();
}

Game.prototype.setPlayer1 = function(id,nom){
  this.player1.setIdJoueur(id);
  this.player1.setNomJoueur(nom);
};

Game.prototype.setPlayer2 = function(id,nom){
  this.player2.setIdJoueur(id);
  this.player2.setNomJoueur(nom);
};

Game.prototype.playersOK = function(){
  (this.player1.idJoueur && this.player2.idJoueur) ? true : false;
};

// export the class
module.exports = Game;
