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
			//console.log("Not a valid user.");
			res.render('logout', { token:false });
		}
		else { // get data of all curators from db
			db.bind('Disease');
			db.Disease.count({"Active":"Yes"}, function(err, totalNum) {
				db.Disease.count({"OMIMID":{$ne:""}}, function(err, omimNum) {
						if (req.query.idType == "FullName") {
							//var pattern = '^.*' + req.query.idValue + '.*$';
							db.Disease.find({"FullName":{$regex:req.query.idValue, $options:"i"}}).toArray(function(err, disData) {
								if (err) console.log(err)
								console.log(disData.length);
								res.render('diseases', {total:totalNum, omim:omimNum, selected:true, disease:disData, data:items[0]});
							});
						}
						else if (req.query.idType == "Synonym") {
							db.Disease.find({"Synonym":{$regex:req.query.idValue, $options:"i"}}).toArray(function(err, disData) {
								if (err) console.log(err)
								res.render('diseases', {total:totalNum, omim:omimNum, selected:true, disease:disData, data:items[0]});
							});
						}
						else if  (req.query.idType == "ORDOID") {
							db.Disease.find({"ORDOID":req.query.idValue}).toArray(function(err, disData) {
								if (err) console.log(err)
								res.render('diseases', {total:totalNum, omim:omimNum, selected:true, disease:disData, data:items[0]});
							});
						}
						else if (req.query.idType == "OMIMID") {
							var ary = [];
							ary.push(req.query.idValue);
							db.Disease.find({"OMIMID":{$all:ary}}).toArray(function(err, disData) {
								if (err) console.log(err)
								res.render('diseases', {total:totalNum, omim:omimNum, selected:true, disease:disData, data:items[0]});
							});
						}
						else {
							//console.log("No gene selected.");
							res.render('diseases', {total:totalNum, omim:omimNum, data:items[0]});
						}
				});
			});
		}
	});
});

module.exports = router;
