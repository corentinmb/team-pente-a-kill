// Constructor
function Player() {
  // always initialize all instance properties
  this.idJoueur = null;
  this.nomJoueur = null;
  this.numJoueur = null;
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

// export the class
module.exports = Player;
