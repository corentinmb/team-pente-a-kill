// Constructor
function Player() {
  // always initialize all instance properties
  this.idJoueur = null;
  this.nomJoueur = null;
  this.numJoueur = null;
  this.dernierCoupX = null;
  this.dernierCoupY = null;
}

Player.prototype.setIdJoueur = function(id){
  this.idJoueur = id;
};

Player.prototype.setNomJoueur = function(nom){
  this.nomJoueur = nom;
};

Player.prototype.setNumJoueur = function(num){
  this.numJoueur = num;
};

Player.prototype.setDernierCoup = function(x,y){
  this.dernierCoupX = x;
  this.dernierCoupY = y;
};

// export the class
module.exports = Player;
