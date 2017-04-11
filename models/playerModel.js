// Constructor
function Player() {
  // always initialize all instance properties
  this.idJoueur = null;
  this.nomJoueur = null;
}

Player.prototype.setIdJoueur = function(id){
  this.idJoueur = id;
};

Player.prototype.setNomJoueur = function(nom){
  this.nomJoueur = nom;
};

// export the class
module.exports = Player;
