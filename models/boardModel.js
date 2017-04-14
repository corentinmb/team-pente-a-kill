// Constructor
function Board() {
// always initialize all instance properties
	this.board = null;
}

Board.prototype.initBoard = function(){
  var SIZE = 19;
  this.board = new Array();
  for (var i = 0; i < SIZE; i++) {
    this.board[i] = new Array();
    for (var j = 0; j < SIZE; j++) {
      this.board[i][j] = 0;
    }
  }
}

Board.prototype.setPion = function(x,y,numjoueur){
	this.board[y][x] = numjoueur;
}

Board.prototype.pionHere = function(x,y){
	if (this.board[y][x] == 0){
		return false;
	}
	else{
		return true;
	}
}

Board.prototype.getPion = function(x,y){
	return this.board[parseInt(y)][parseInt(x)];
}

Board.prototype.deletePion = function(x,y){
	this.board[y][x] = 0;
}

// export the class
module.exports = Board;
