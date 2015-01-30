var express = require('express');
var router = express.Router();
var token = require('../private/js/token.js');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

router.use(cookieParser('Spindle'));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.get('/', function(req, res) {
	//var db = req.db;
	//db.bind('Curation');

	res.render('curations');
});

module.exports = router;
