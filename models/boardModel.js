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
	this.board[x][y] = numjoueur;
}

Board.prototype.pionHere = function(x,y){
	if (this.board[x][y] == 0){
		return false;
	}
	else{
		return true;
	}
}

// export the class
module.exports = Board;
