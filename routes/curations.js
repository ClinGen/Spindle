var express = require('express')
var router = express.Router()
var token = require('../private/js/token.js')

var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))

router.get('/', function(req, res) {
	var db = req.db
	db.collection('Curation').count(function(err, cnt) {
		if (err) {
			throw err
			return
		}
		if (cnt > 0) {
			db.collection('Curation').find({"Active":"Yes"}).toArray(function(err, curationData) {
				if (err) {
					throw err
					return
				}
				var pair = [];
				for ( var c in curationData) {
					pair.push({"HGNCSymbol":curationData[c].HGNCSymbol, "FullName":curationData[c].FullName, "ORDOID":curationData[c].ORDOID})
				}
				res.render('curations_basic', { cnt:cnt, pair:pair, user:{"LogName":req.cookies.Spindle.split('-')[0]} })
			})
		}
		else res.render('curations_basic', { cnt:cnt, user:{"LogName":req.cookies.Spindle.split('-')[0]} })
	})
})
router.get('/All', function(req, res) {
	var db = req.db
	db.collection('Curation').find({"Active":"Yes"}).toArray(function(err, cData) {
		if (err) {
			throw err
			return
		}
		var pair = []
		for (var i = 0; i < cData.length; i++) {
			pair.push({"Symbol":cData[i].HGNCSymbol,"ORDOID":cData[i].ORDOID,"Disease":cData[i].FullName})
		}
		res.send(pair)
	})
})
router.get('/Symbol/:smbl', function(req, res) { // ajax for gene symbols
	var db = req.db;
	db.bind('Gene');
	var pattn = '^' + req.params.smbl;
	db.Gene.find({$or:[{"HGNCSymbol":{$regex:pattn, $options:"i"}},{"Synonyms":{$regex:pattn,$options:"i"}}], "Active":"Yes"}).sort({"HGNCSymbol":1}).toArray(function(err, geneData) {
	//db.Gene.find({"HGNCSymbol":{$regex:pattn, $options:"i"}, "Active":"Yes"}).sort({"HGNCSymbol":1}).toArray(function(err, geneData) {
		if (err) {
			throw err
			return
		}
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
		}
		res.send(symbol);
	});
});

router.get('/Term/:term', function(req, res) { // ajax for disease terms
	var db = req.db;
	db.bind('Disease');
	var pattn = req.params.term;
	db.Disease.find({$or:[{"FullName":{$regex:pattn, $options:"i"}}, {"Synonym":{$regex:pattn, $options:"i"}}],"Active":"Yes"}).sort({"FullName":1}).toArray(function(err, disData) {
		if (err) {
			throw err
			return
		}
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

router.get('/:symbol/:ordoid/:item?', function(req, res) {
	var db = req.db
	db.collection('Curation').find({"HGNCSymbol":req.params.symbol, "ORDOID":req.params.ordoid}).toArray(function(err, curationData) {
		if (err) {
			throw err
			return
		}
		db.collection('FunctionalData').find({"HGNCSymbol":req.params.symbol, "ORDOID":req.params.ordoid, "Active":"Yes"}).toArray(function(err, fData) {
			if (err) {
				throw err
				return
			}
			db.collection('CaseStudy').find({"HGNCSymbol":req.params.symbol, "ORDOID":req.params.ordoid, "Active":"Yes"}).toArray(function(err, csData) {
				if (err) {
					throw err
					return
				}
				var target_tab = 'History'
				if (req.params.item) target_tab = req.params.item
				res.render('curation_all_tab', { target_tab:target_tab, data:curationData[0], csData:csData, fData:fData, user:{"LogName":req.cookies.Spindle.split('-')[0]} })
			})
		})
	})
})

router.get('/Observations/:smbl/:trm', function(req, res) {
	var db = req.db;
	db.bind('Curation');
	db.Curation.find({"HGNCSymbol":req.params.smbl, "ORDOID":req.params.trm}).toArray(function(err, curationData) {
		if (err) console.log(err);
		db.bind('Curator');
		db.Curator.find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
			if (err) console.log(err);
			db.Curator.find({"LogName":curationData[0].LogName}).toArray(function(err, creator) {
				if (err) console.log(err);
				res.render('observation_general', {data:curationData[0], user:user[0], creator:creator[0]});
			});
		});
	});
});

router.post('/', function(req, res) { // gene:disease pair
	var db = req.db;
	var ordoid = req.body.diseaseterm.split('Orphanet ID: ')[1];
	// check if the pair exists
	db.collection('Curation').count({"HGNCSymbol":req.body.genesymbol, "ORDOID":ordoid}, function(err, cnt) {
		if (err) {
			throw err
			return
		}
		if (cnt > 0) { // exist -> present the pair
			db.collection('Curation').find({"HGNCSymbol":req.body.genesymbol, "ORDOID":ordoid}).toArray(function(err, curationData) {
				if (err) {
					throw err
					return
				}
				res.redirect('/Curations/' + req.body.genesymbol + '/' + ordoid + '/History')
			})
		}
		else { // not exist -> create a new pair
			var smbl_term = {
				"Term":req.body.diseaseterm,
				"InvalidTerm":"No",
				"Symbol":req.body.genesymbol,
				"InvalidSymbol":"No"
			}
			db.collection('Gene').find({"HGNCSymbol":req.body.genesymbol}).toArray(function(err, geneData) {
				if (err) {
					throw err
					return
				}
				if (!geneData || geneData.length == 0) {
					smbl_term.InvalidSymbol = "Yes"
					res.render('curations_basic', { input:smbl_term, user:{"LogName":req.cookies.Spindle.split('-')[0] } })
				}
				else {
					db.collection('Disease').find({"ORDOID":ordoid}).toArray(function(err, disData) {
						if (err) {
							throw err
							return
						}
						if (!disData || disData.length == 0) {
							smbl_term.InvalidTerm = "Yes"
							res.render('curations_basic', { input:smbl_term, user:{"LogName":req.cookies.Spindle.split('-')[0] }})
						}
						else {
							db.collection('Curator').find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
								if (err) {
									throw err
									return
								}
								db.collection('Curation').save({
										"Curators": [{
											//"Name": user[0].Name,
											"LogName": user[0].LogName,
											"DateTime": Date().toString(),
											"Action": "Create Gene_Disease pair"
										}],
										"HGNCSymbol": req.body.genesymbol,
										"EntrezID": geneData[0].EntrezID,
										"HGNCID": geneData[0].HGNCID,
										"FullName": disData[0].FullName,
										"ORDOID": ordoid,
										"OMIMID": disData[0].OMIMID,
										"DisorderType": disData[0].Type,
										"Ontology": "OrphaNet",
										"Status": "Creation", // Creation, Observation, summary, Provisional Assertion, Draft Assertion, Finial Assertion
										"Active": "Yes"
									}, function(err) {
									if (err) {
										throw err
										return
									}
									db.collection('Curator').find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
										if (err) {
											throw err
											return
										}
										var newaction = user[0].LoginRecord.pop();
										if (!newaction.Action) newaction.Action = []
										newaction.Action.push('Create Gene_Disease pair ' + req.body.genesymbol + ':' + ordoid)
										db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]}, {$pop:{"LoginRecord":1}}, function(err) {
											if (err) {
												throw err
												return
											}
											db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]},{$push:{"LoginRecord":newaction}},
												function(err) {
													if(err) {
														throw err
														return
													}
											})
										})
									})
									res.redirect('/Curations/' + req.body.genesymbol + '/' + ordoid + '/Literature')
									/*db.collection('Curation').find({"HGNCSymbol":req.body.genesymbol, "ORDOID":ordoid}).toArray(function(err, curationData) {
										if (err) {
											throw err
											return
										}
										db.collection('Curator').find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
											if (err) {
												throw err
												return
											}
											db.collection('Curator').find({"LogName":curationData[0].Curators[0].LogName}).toArray(function(err, creator) {
												if (err) {
													throw err
													return
												}
											})
											res.render('literature', { status:'exist', data:curationData[0], user:user[0], creator:user[0] })
										})
									})*/
								})
							})
						}
					})
				}
			})
		}
	})
})

router.post('/Literature', function(req, res) {
	var db = req.db
	var thisTime = Date().toString()
	db.collection('Curation').find({"HGNCSymbol":req.body.symbol, "ORDOID":req.body.ordoid}).toArray(function(err, temp) {
		if (err) {
			throw err
			return
		}
		var obj
		if (temp[0].LiteratureSearch) {
			obj = temp[0].LiteratureSearch
			if (req.body.dateliterature != '') obj["Date"] = req.body.dateliterature
			if (req.body.searchparamters != '') obj["Parameters"] = req.body.searchparamters
			if (req.body.returnnumber != '') obj["ReturnedNumber"] = req.body.returnnumber
			if (req.body.releventnumber != '') obj["RelevantNumber"] = req.body.releventnumber
			if (req.body.clinicalreportnumber != '') obj["ClinicalReportNumber"] = req.body.clinicalreportnumber
			if (req.body.completetime != '') obj["TimeComplete"] = req.body.completetime
		}
		else {
			obj = {
				"LogName": req.cookies.Spindle.split('-')[0],
				"Date":req.body.dateliterature,
				"Parameters": req.body.searchparamters,
				"ReturnedNumber": req.body.returnnumber,
				"RelevantNumber": req.body.releventnumber,
				"ClinicalReportNumber": req.body.clinicalreportnumber,
				"TimeComplete": req.body.completetime
			}
		}
		db.collection('Curation').update({"HGNCSymbol":req.body.symbol, "ORDOID":req.body.ordoid},{$set:{"LiteratureSearch":obj}}, function(err) {
			if (err) {
				throw err
				return
			}
			db.collection('Curation').update({"HGNCSymbol":req.body.symbol, "ORDOID":req.body.ordoid},{$push:{"Curators":{
						"LogName": req.cookies.Spindle.split('-')[0],
						"DateTime": thisTime,
						"Action": "Enter Literature Search data"
					}
				}}, function(err) {
				if (err) {
					throw err
					return
				}
				db.collection('Curator').find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
					if (err) {
						throw err
						return
					}
					var newaction = user[0].LoginRecord.pop();
					newaction.Action.push('Enter Literature Search data in Gene_Disease pair ' + req.body.symbol + ':' + req.body.ordoid);
					db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]}, {$pop:{"LoginRecord":1}}, function(err) {
						if (err) {
							throw err
							return
						}
						db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]},{$push:{"LoginRecord":newaction}},
							function(err) {
							if(err) {
								throw err
								return
							}
							res.redirect('/Curations/'+req.body.symbol+'/'+req.body.ordoid+'/Literature')
						})
					})
				})
			})
		})
	})
})

module.exports = router;
