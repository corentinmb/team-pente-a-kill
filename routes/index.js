var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET connect */
router.get('/connect/:groupName', function(req, res, next) {
  res.send(JSON.stringify(req.params))
});

/* GET play */
router.get('/play/:x/:y/:idJoueur', function(req, res, next) {
  res.send(JSON.stringify(req.params))
});

/* GET turn */
router.get('/turn/:idJoueur', function(req, res, next) {
  res.send(JSON.stringify(req.params))
});

module.exports = router;
