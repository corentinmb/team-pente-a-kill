var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var board = newBoard();
  res.render('board', { board: board });
});

module.exports = router;
