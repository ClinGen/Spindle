var express = require('express');
var router = express.Router();
var token = require('../private/js/token.js');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

//router.use(cookieParser('Spindle'));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.get('/', function(req, res) {
	var db = req.db;
	db.bind('Curation');
	db.Curation.count(function(err, cnt) {
		if (err) console.log(err);
		res.render('curations_basic', { cnt:cnt });
	});

});

router.get('/Symbol/:smbl', function(req, res) { // ajax for gene symbols
	var db = req.db;
	db.bind('Gene');

	var pattn = '^' + req.params.smbl;
	db.Gene.find({$or:[{"HGNCSymbol":{$regex:pattn, $options:"i"}},{"Synonyms":{$regex:pattn,$options:"i"}}], "Active":"Yes"}).sort({"HGNCSymbol":1}).toArray(function(err, geneData) {
	//db.Gene.find({"HGNCSymbol":{$regex:pattn, $options:"i"}, "Active":"Yes"}).sort({"HGNCSymbol":1}).toArray(function(err, geneData) {
		if (err) err;
//console.log("Symbol:", req.params.smbl);
//console.log("# find in db:", geneData.length);
		var symbol = [];
		for (var i=0; i<geneData.length; i++) {
			if (geneData[i].HGNCSymbol.toLowerCase().indexOf(req.params.smbl.toLowerCase()) > -1) symbol.push(geneData[i].HGNCSymbol);
			else {
				for ( var j=0; j<geneData[i].Synonyms.length; j++)
				if (geneData[i].Synonyms[j].toLowerCase().indexOf(req.params.smbl.toLowerCase()) > -1) {
					symbol.push(geneData[i].Synonyms[j]);
					break;
				}
			}
			//symbol.push(geneData[i].HGNCSymbol);
		}
//console.log("Number of send out:", symbol.length);
		res.send(symbol);
	});
});

router.get('/Term/:term', function(req, res) { // ajax for disease terms
	var db = req.db;
	db.bind('Disease');
	var pattn = req.params.term;
	db.Disease.find({$or:[{"FullName":{$regex:pattn, $options:"i"}}, {"Synonym":{$regex:pattn, $options:"i"}}],"Active":"Yes"}).sort({"FullName":1}).toArray(function(err, disData) {
		if (err) err;
		var trm = [];
		var ordo = [];
		for (var i in disData) {
			if (disData[i].FullName.indexOf(pattn) > -1) {
				trm.push(disData[i].FullName);
				ordo.push(disData[i].ORDOID);
			}
			else {
				for ( var k in disData[i].Synonym) {
					if (disData[i].Synonym[k].indexOf(pattn) > -1) {
						trm.push(disData[i].Synonym[k]);
						ordo.push(disData[i].ORDOID);
						break;
					}
				}
			}

		}
		res.send({term:trm, ordoid:ordo});
	});
});

router.get('/Literaturesearch/:smbl/:trm', function(req, res) {
	var db = req.db;
	db.bind('Curation');
	db.Curation.find({"HGNCSymbol":req.params.smbl, "ORDOID":req.params.trm}).toArray(function(err, curationData) {
		if (err) console.log(err);
		db.bind('Curator');
		db.Curator.find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
			if (err) console.log(err);
			db.Curator.find({"LogName":curationData[0].LogName}).toArray(function(err, creator) {
				if (err) console.log(err);
				res.render('literature', {data:curationData[0], user:user[0], creator:creator[0]});
			});
		});
	});
});

router.post('/', function(req, res) { // gene:disease pair
	var db = req.db;
	db.bind('Curation');

	var ordoid = req.body.diseaseterm.split('ORDO ID: ')[1];
	// check if the pair exists
	db.Curation.count({"HGNCSymbol":req.body.genesymbol, "ORDOID":ordoid}, function(err, cnt) {
		if (err) console.log(err);
		if (cnt > 0) { // exist -> present the pair
			db.Curation.find({"HGNCSymbol":req.body.genesymbol, "ORDOID":ordoid}).toArray(function(err, curationData) {
				if (err) console.log(err);
				db.bind('Curator');
				db.Curator.find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
					if (err) console.log(err);
					db.Curator.find({"LogName":curationData[0].LogName}).toArray(function(err, creator) {
						if (err) console.log(err);
						if (curationData[0].FinalAssertion) res.render('finalassertion', { data:curationData[0], user:user[0], creator:creator[0]});
						else if (curationData[0].DraftAssertion) res.render('draftassertion', { data:curationData[0], user:user[0], creator:creator[0]});
						else if (curationData[0].ProvAssertion) res.render('provassertion', { data:curationData[0], user:user[0], creator:creator[0]});
						else if (curationData[0].Summary) res.render('summary', { data:curationData[0], user:user[0], creator:creator[0]});
						else if (curationData[0].Observations) res.render('observations', { data:curationData[0], user:user[0], creator:creator[0]});
						else res.render('literature', { data:curationData[0], user:user[0], creator:creator[0]});
						//else res.render('curations_basic', { status:'exist', data:curationData[0], user:user[0], creator:creator[0] });
					});
				});
			});
/*
			db.Curation.find({"HGNCSymbol":req.body.genesymbol, "ORDOID":ordoid}).toArray(function(err, curationData) {
				if (err) console.log(err);
				db.bind('Curator');
				db.Curator.find({"Token":req.cookies.Spindle}).toArray(function(err, user) { // current login user info
					if (err) console.log(err);
					db.Curator.find({"LogName":curationData[0].Curators[0].LogName}).toArray(function(err, curator) {
						if (err) console.log(err);
						if (curationData[0].Status == 'Creation') {
							res.render('curations', { status:'exist', data:curationData[0], user:user[0], creator:curator[0] });
						}
						else if (curationData[0].Status == 'Observation') {
console.log("Go to Observations");
							res.render('observations', {data:curationData[0], user:user[0], creator:curator[0] });
						}
					})

				});
			});
*/
		}
		else { // not exist -> create a new pair
			db.bind("Gene");
			db.Gene.find({"HGNCSymbol":req.body.genesymbol}).toArray(function(err, geneData) {
				if (err) console.log(err);
				db.bind('Disease');
				db.Disease.find({"ORDOID":ordoid}).toArray(function(err, disData) {
					if (err) console.log(err);
					db.bind('Curator');
					db.Curator.find({"Token":req.cookies.Spindle}).toArray(function(err, user) {
						if (err) console.log(err);
						db.bind('Curation');
						db.Curation.save({
								"Curators": [{
									"Name": user[0].Name,
									"LogName": user[0].LogName,
									"Contribution": "Creation",
									"DateTime": Date().toString(),
								}],
								"HGNCSymbol": req.body.genesymbol,
								"EntrezID": geneData[0].EntrezID,
								"HGNCID": geneData[0].HGNCID,
								"FullName": disData[0].FullName,
								"ORDOID": ordoid,
								"OMIMID": disData[0].OMIMID,
								"DisorderType": disData[0].Type,
								"Ontology": "OrphaNet",
								"DateTime": Date().toString(),
								"Status": "Creation", // Creation, Observation, summary, Provisional Assertion, Draft Assertion, Finial Assertion
								"Active": "Yes",
								"LiteratureSearch": {
									"Date":"",
									"Parameters": "",
									"ReturnedNumber": "",
									"RelevantNumber": "",
									"ClinicalReportNumber": "",
									"TimeComplete": ""
								},
							}, function(err) {
							if (err) console.log(err);
							db.Curation.find({"HGNCSymbol":req.body.genesymbol, "ORDOID":ordoid}).toArray(function(err, curationData) {
								if (err) console.log(err);
								db.bind('Curator');
								res.render('literature', { status:'exist', data:curationData[0], user:user[0], creator:user[0] });
								//res.render('curations_basic', { status:'exist', data:curationData[0], user:user[0], creator:user[0] });
							});
						});
					});
				});
			});
		}
	});
});

router.post('/Literature', function(req, res) { // gene:disease pair
//console.log("read in symbol", req.body.symbol);
//console.log("read in ordoid:", req.body.ordoid);
	var db = req.db;
	db.bind('Curation');
	var obj = {
		"Date":req.body.dateliterature,
		"Parameters": req.body.searchparamters,
		"ReturnedNumber":req.body.returnnumber,
		"RelevantNumber":req.body.releventnumber,
		"ClinicalReportNumber":req.body.clinicalreportnumber,
		"TimeComplete":req.body.completetime
	};
	var obsv = {
		"CaseStudy":[],
		"CaseControlStudy": [],
		"FunctionalDataAnalysis":[]
	}
/*
	if (req.body.dateliterature != '') obj["Date"] = req.body.dateliterature;
	if (req.body.searchparamters != '') obj["Parameters"] = req.body.searchparamters;
	if (req.body.returnnumber != '') obj["ReturnedNumber"] = req.body.returnnumber;
	if (req.body.releventnumber != '') obj["RelevantNumber"] = req.body.releventnumber;
	if (req.body.clinicalreportnumber != '') obj["ClinicalReportNumber"] = req.body.clinicalreportnumber;
	if (req.body.completetime != '') obj["TimeComplete"] = req.body.completetime;
*/
	db.Curation.update({"HGNCSymbol":req.body.symbol, "ORDOID":req.body.ordoid}, {$set:{"LiteratureSearch":obj, "Observations":obsv}}, function(err) {
		if (err) console.log(err);
		db.Curation.find({"HGNCSymbol":req.body.symbol, "ORDOID":req.body.ordoid}).toArray(function(err, curationData) {
			if (err) console.log(err);
			db.bind('Curator');
			db.Curator.find({"Token":req.cookies.Spindle}).toArray(function(err, user) {
				if (err) console.log(err);
				db.Curator.find({"LogName":curationData[0].LogName}).toArray(function(err, creator) {
					if (err) console.log(err);
					res.render('literature', {data:curationData[0], user:user[0], creator:creator[0]});
				});
			});
		});
	});
});

module.exports = router;
