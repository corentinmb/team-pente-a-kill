var express = require('express');
var router = express.Router();

function newBoard(){
  var SIZE = 19;
  var b = new Array();
  for (var i = 0; i < SIZE; i++) {
    b[i] = new Array();
    for (var j = 0; j < SIZE; j++) {
      b[i][j] = {stone : null};
    }
  }
  return b;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  var board = newBoard();
  res.render('board', { board: board });
});

module.exports = router;
