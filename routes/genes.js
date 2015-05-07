var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var settoken = require('../private/js/settoken.js');
router.use(cookieParser('Spindle'));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.get('/', function(req, res) {
	/*var db = req.db
		var user_login_name = req.cookies.Spindle.split('-')[0]
		db.collection('Gene').count({"Active":"Yes"}, function(err, totalNum) {
			if (err) {
				throw err
				return
			}
			db.collection('Gene').count({"EntrezID":{$ne:""}}, function(err, entrezNum) {
				if (err) {
					throw err
					return
				}
				db.collection('Gene').count({"OMIMID":{$ne:""}}, function(err, omimNum) {
					if (err) {
						throw err
						return
					}
								//console.log(req.query.idType);
								//console.log(req.query.idValue);
					if (req.query.idType == "HGNCSymbol+Synonyms") {
									//db.Gene.find({"SymbolLowercase":req.query.idValue.toLowerCase()}).toArray(function(err, geneData) {
						db.collection('Gene').find({$or:[{"HGNCSymbol":{$regex:req.query.idValue, $options:"i"}},{"Synonyms":{$regex:req.query.idValue,$options:"i"}}], "Active":"Yes"}).toArray(function(err, geneData) {
									//db.Gene.find({$or:[{"HGNCSymbol":{$regex:req.query.idValue, $options:"i"}}, {"Synonyms":{$regex:req.query.inValue, $options:"i"}}]}).toArray(function(err, geneData) {
							if (err) {
								throw err
								return
							}
										//console.log(geneData.length);
							res.render('genes', {numbers:[totalNum, entrezNum, omimNum], search:[req.query.idType,req.query.idValue], gene:geneData, user:{LogName:user_login_name}})
										//res.render('genes', {total:totalNum, entrez:entrezNum, omim:omimNum, selected:true, gene:geneData, data:items[0]});
						})
					}
					else if (req.query.idType == "EntrezID") {
						db.collection('Gene').find({"EntrezID":req.query.idValue, "Active":"Yes"}).toArray(function(err, geneData) {
							if (err) {
								throw err
								return
							}
							res.render('genes', {numbers:[totalNum, entrezNum, omimNum], search:[req.query.idType,req.query.idValue], gene:geneData, user:{LogName:user_login_name}})
						})
					}
					else if (req.query.idType == "OMIMID") {
						db.collection('Gene').find({"OMIMID":req.query.idValue, "Active":"Yes"}).toArray(function(err, geneData) {
							if (err) {
								throw err
								return
							}
							res.render('genes', {numbers:[totalNum, entrezNum, omimNum], search:[req.query.idType,req.query.idValue], gene:geneData, user:{LogName:user_login_name}})
						})
					}
					else {
									//console.log("No gene selected.");
						res.render('genes', {numbers:[totalNum, entrezNum, omimNum], user:{LogName:user_login_name}})
					}
				})
			})
		})
	*/
	res.render('genes', {user:{LogName:req.cookies.Spindle.split('-')[0]}})
})

router.get('/Count', function(req, res) {
	var db = req.db
	db.collection("Gene").count(function(err, total_gene) {
		if (err) {
			throw err
			return
		}
		db.collection("Gene").count({"Active":"Yes"}, function(err, approved_gene) {
			if (err) {
				throw err
				return
			}
			db.collection("Gene").count({"LocusGroup":"pseudogene"}, function(err, seudo_gene) {
				if (err) {
					throw err
					return
				}
				db.collection("Gene").count({"LocusGroup":"protein-coding gene"}, function(err, protein_gene) {
					if (err) {
						throw err
						return
					}
					db.collection("Gene").count({"LocusGroup":"non-coding RNA"}, function(err, rna_gene) {
						if (err) {
							throw err
							return
						}
						res.send({total:total_gene, approved:approved_gene, seudo:seudo_gene, protein:protein_gene, rna:rna_gene})
					})
				})
			})
		})
	})
})

router.get('/Hgncsymbol/:symbol', function(req, res) {
	var db = req.db
	db.collection('Gene').find({$or:[{"HGNCSymbol":{$regex:req.params.symbol, $options:"i"}},{"Synonyms":{$regex:req.params.symbol,$options:"i"}}]}).toArray(function(err, gData) {
		if (err) {
			throw err
			return
		}
console.log(gData.length);
		res.send(gData)
	})
})

module.exports = router;
