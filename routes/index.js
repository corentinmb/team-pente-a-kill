var express = require('express');
var router = express.Router();
var socket = require('socket.io');

var io = socket.listen(8080);

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

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

var boardElement = document.querySelector(".tenuki-board");
var game = new tenuki.Game(boardElement);
game.setup();

/* GET home page. */
router.get('/', function(req, res, next) {
  var board = newBoard();
  res.render('index', { board: board });
});

module.exports = router;
