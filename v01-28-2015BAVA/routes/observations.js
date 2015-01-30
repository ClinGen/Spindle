var express = require('express');
var router = express.Router();

router.get('/:smbl/:ordo', function(req, res) {
	var db = req.db;
	db.bind('Curation');
	db.Curation.find({"HGNCSymbol":req.params.smbl, "ORDOID":req.params.ordo}).toArray(function(err, curationData) {
		if (err) console.log(err);
		db.bind('Curator');
		db.Curator.find({"LogName":req.cookies.Spindel}).toArray(function(err, user) {
			if (err) console.log(err);
			db.Curator.find({"LogName":curationData[0].LogName}).toArray(function(err, creator) {
				if (err) console.log(err);
				res.render('observations', { data:curationData[0], user:user[0], creator:creator[0]});
			});
		});
	});
});
/*
router.get('/Casestudy/:smbl/:ordo', function(req, res) {
	var db = req.db;
	db.bind('Curation');
	db.Curation.find({"HGNCSymbol":req.params.smbl, "ORDOID":req.params.ordo}).toArray(function(err, curationData) {
		if (err) console.log(err);

		db.bind('Curator');
		db.Curator.find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
			if (err) console.log(err);
			db.Curator.find({"LogName":curationData[0].Curators[0].LogName}).toArray(function(err, curator) {
				if (err) console.log(err);
				if (curationData[0].Observations.CaseStudy.length > 0) {
					db.bind('CaseStudy');
					db.CaseStudy.find({"HGNCSymbol":req.params.smbl, "ORDOID":req.params.ordo}).toArray(function(err, casestudy) {
						if (err) console.log(err);
console.log("Case group length:", casestudy[0].CaseGroup.length);
						res.render('casegroup', {data:curationData[0], user:user[0], creator:curator[0], casestudy:casestudy});
					});
				}
				else res.render('casegroup', {data:curationData[0], user:user[0], creator:curator[0]});
			});
		});
	});
});
*/
/*
router.get('/:study', function(req, res) {
	var db = req.db;
	db.bind('Curation');
	if (req.params.study == 'Casestudy') {
		db.Curation.find({})
	}
	else if (req.params.study == 'Casecontrol') {

	}
	else if (req.params.study == 'Functionaldata') {

	}
});

router.get('/:study/:id', function(req, res) {

});
*/

module.exports = router;
