var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/:id', function(req, res, next) {
  res.render('board', {id: req.params.id}, {name: game.player1.nomJoueur});
});

module.exports = router;
