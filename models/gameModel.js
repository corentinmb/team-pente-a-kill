var Player = require('../models/playerModel.js');
var Board = require('../models/boardModel.js');


// Constructor
function Game() {
  // always initialize all instance properties
  this.player1 = new Player();
  this.player2 = new Player();
  this.board = new Board();
  this.nbtenaillesj1 = 0;
  this.nbtenaillesj2 = 0;
  this.prolongation = false;
  this.finpartie = false;
  this.detailfinpartie = '';
  this.numtour = 1;
  this.joueurcourant = 1;
}

Game.prototype.setPlayer1 = function(id,nom,num){
  this.player1.setIdJoueur(id);
  this.player1.setNomJoueur(nom);
  this.player1.setNumJoueur(num);
};

Game.prototype.setPlayer2 = function(id,nom,num){
  this.player2.setIdJoueur(id);
  this.player2.setNomJoueur(nom);
  this.player2.setNumJoueur(num);
};

Game.prototype.playersOK = function(){
  (this.player1.idJoueur && this.player2.idJoueur) ? true : false;
};

Game.prototype.setJoueurcourant = function(num){
  this.joueurcourant = num;
}

Game.prototype.incrTour = function(){
  this.numtour += 1;
}

// export the class
module.exports = Game;
