var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var token = require('../private/js/token.js');

router.get('/', function(req, res) {
	var db = req.db;
	db.bind('Curator');

	// check cookie
	db.Curator.find({"Token":req.cookies.Spindle}).toArray(function(err, items) {
		if (err) console.log(err);
		//console.dir(items);
		if (items.length == 0) {
			console.log("Not a valid user.");
			res.render('logout', { token:false });
		}
		else { // get data of all curators from db
			db.Curator.find().toArray(function(err, curators) {
				var ec = cg = exp = 0;
				for (var i=0; i<curators.length; i++) {
					if (curators[i].Title == "Expert Curator") exp++;
					else if (curators[i].Title == "ClinGen Curator") cg++;
					else if (curators[i].Title == "External Curator") ec++;
				}
				res.render('curators', {exp:exp, ec:ec, cg:cg, user:items[0], data:curators});
			});
		}
	});
});

module.exports = router;
