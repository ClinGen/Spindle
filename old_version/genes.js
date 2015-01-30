var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var token = require('../private/js/token.js');

/*
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
			db.bind('Gene');
			db.Gene.count({"Active":"Yes"}, function(err, totalNum) {
				db.Gene.count({"EntrezID":{$ne:""}}, function(err, entrezNum) {
					db.Gene.count({"OMIMID":{$ne:""}}, function(err, omimNum) {
						console.log(req.query.idType);
						console.log(req.query.idValue);
						if (req.query.idType == "HGNCSymbol") {
							//db.Gene.find({"SymbolLowercase":req.query.idValue.toLowerCase()}).toArray(function(err, geneData) {
							db.Gene.find({"HGNCSymbol":{$regex:req.query.idValue, $options:"i"}}).toArray(function(err, geneData) {
								if (err) console.log(err)
								res.render('genes', {numbers:[totalNum, entrezNum, omimNum], search:[req.query.idType,req.query.idValue], gene:geneData, data:items[0]});
								//res.render('genes', {total:totalNum, entrez:entrezNum, omim:omimNum, selected:true, gene:geneData, data:items[0]});
							});
						}
						else if  (req.query.idType == "EntrezID") {
							db.Gene.find({"EntrezID":req.query.idValue}).toArray(function(err, geneData) {
								if (err) console.log(err)
								res.render('genes', {numbers:[totalNum, entrezNum, omimNum], search:[req.query.idType,req.query.idValue], gene:geneData, data:items[0]});
							});
						}
						else if (req.query.idType == "OMIMID") {
							db.Gene.find({"OMIMID":req.query.idValue}).toArray(function(err, geneData) {
								if (err) console.log(err)
								res.render('genes', {numbers:[totalNum, entrezNum, omimNum], search:[req.query.idType,req.query.idValue], gene:geneData, data:items[0]});
							});
						}
						else if (req.query.idType == "Synonyms") {
							db.Gene.find({"Synonyms":{$regex:req.query.idValue, $options:"i"}}).toArray(function(err, geneData) {
								if (err) console.log(err)
								res.render('genes', {numbers:[totalNum, entrezNum, omimNum], search:[req.query.idType,req.query.idValue], gene:geneData, data:items[0]});
							});
						}
						else {
							//console.log("No gene selected.");
							res.render('genes', {numbers:[totalNum, entrezNum, omimNum], data:items[0]});
						}
					});
				});
			});
		}
	});
});
*/


router.get('/', function(req, res) {
	var check = token(req, res);
	if (check === 'Invalid Input Data') {
		res.render('logout', {token:false});
	}
	else if (check === 'Expired') {
		res.render('logout', {token:'expired'});
	}

	var db = req.db;
	db.bind('Gene');
	db.Gene.count({"Active":"Yes"}, function(err, totalNum) {
		db.Gene.count({"EntrezID":{$ne:""}}, function(err, entrezNum) {
			db.Gene.count({"OMIMID":{$ne:""}}, function(err, omimNum) {
				res.render('genes', {numbers:[totalNum, entrezNum, omimNum]});
			});
		});
	});
});

router.get('/HGNCSymbol/:name_value', function(req, res) {
	var check = token(req, res);
	if (check === 'Invalid Input Data') {
		res.render('logout', {token:false});
	}
	else if (check === 'Expired') {
		res.render('logout', {token:'expired'});
	}

	var db = req.db;
	db.bind('Gene');
	db.Gene.count({"Active":"Yes"}, function(err, totalNum) {
		db.Gene.count({"EntrezID":{$ne:""}}, function(err, entrezNum) {
			db.Gene.count({"OMIMID":{$ne:""}}, function(err, omimNum) {
				db.Gene.find({"HGNCSymbol":{$regex:req.params.name_value, $options:"i"}}).toArray(function(err, geneData) {
				res.render('genes', {numbers:[totalNum, entrezNum, omimNum], search:[req.params.symbol_id,req.params.name_value], gene:geneData});
			});
		});
	});
});

/*
	var db = req.db;
	db.bind('Curator');)
	db.Curator.find({"Token":req.cookies.Spindle}, function(err, items) {
		if (err) console.console.log(err);
		if (!items) { // Invalid link
			res.render('logout', {token: false });
		}
		else {
			var lastLogin = items.LoginRecord[items.LoginRecord.length - 1].split(', ')[1];
            var interval = thisMS - parseInt(lastLogin);
            if (interval < 72000000) {
            	res.render('logout', {token:"expired"});
            }

			// get token and save it as a cookie in browser
            items.Token = token(items.ContactInfo, req);
            var cookie_life = 2*3600000; // 5 hours to expire
            // save cookie in browser
            res.cookie('Spindle', items.Token, { maxAge:cookie_life, httpOnly:true, path:'/' });
            // save token in db
            db.Curator.update({"LogName":items[0].LogName}, {$set: {"Token":items[0].Token,"LoginRecord":items[0].LoginRecord}}, function(err) {
                if (err) console.log('Token add error: ', err);
            });

            db.bind('Gene');
			db.Gene.count({"Active":"Yes"}, function(err, totalNum) {
				db.Gene.count({"EntrezID":{$ne:""}}, function(err, entrezNum) {
					db.Gene.count({"OMIMID":{$ne:""}}, function(err, omimNum) {
						//console.log(req.query.idType);
						//console.log(req.query.idValue);

						if (req.query.idType == "HGNCSymbol") {
							//db.Gene.find({"SymbolLowercase":req.query.idValue.toLowerCase()}).toArray(function(err, geneData) {
							db.Gene.find({"HGNCSymbol":{$regex:req.query.idValue, $options:"i"}}).toArray(function(err, geneData) {
								if (err) console.log(err)
								res.render('genes', {numbers:[totalNum, entrezNum, omimNum], search:[req.query.idType,req.query.idValue], gene:geneData, data:items[0]});
								//res.render('genes', {total:totalNum, entrez:entrezNum, omim:omimNum, selected:true, gene:geneData, data:items[0]});
							});
						}
						else if  (req.query.idType == "EntrezID") {
							db.Gene.find({"EntrezID":req.query.idValue}).toArray(function(err, geneData) {
								if (err) console.log(err)
								res.render('genes', {numbers:[totalNum, entrezNum, omimNum], search:[req.query.idType,req.query.idValue], gene:geneData, data:items[0]});
							});
						}
						else if (req.query.idType == "OMIMID") {
							db.Gene.find({"OMIMID":req.query.idValue}).toArray(function(err, geneData) {
								if (err) console.log(err)
								res.render('genes', {numbers:[totalNum, entrezNum, omimNum], search:[req.query.idType,req.query.idValue], gene:geneData, data:items[0]});
							});
						}
						else if (req.query.idType == "Synonyms") {
							db.Gene.find({"Synonyms":{$regex:req.query.idValue, $options:"i"}}).toArray(function(err, geneData) {
								if (err) console.log(err)
								res.render('genes', {numbers:[totalNum, entrezNum, omimNum], search:[req.query.idType,req.query.idValue], gene:geneData, data:items[0]});
							});
						}
						else {
							//console.log("No gene selected.");
							res.render('genes', {numbers:[totalNum, entrezNum, omimNum], data:items[0]});
						}
					});
				});
			});
		}
	});
*/
});

module.exports = router;
