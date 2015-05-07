var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
//var settoken = require('../private/js/settoken.js');
//router.use(cookieParser('Spindle'));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.get('/', function(req, res) {
	var db = req.db;
	db.collection('Disease').count({"Active":"Yes"}, function(err, totalNum) {
		if (err) {
			throw err
			return
		}
		db.collection('Disease').count({"Active":"Yes","OMIMID":{$ne:[]}}, function(err, omimNum) {
			if (err) {
				throw err
				return
			}
			//res.render('diseases', { numbers: [totalNum, omimNum], user:{"LogName":req.cookies.Spindle.split('-')[0]}} )
			if (!req.query.idType || req.query.idType == '') res.render('diseases', { numbers: [totalNum, omimNum], user:{"LogName":req.cookies.Spindle.split('-')[0]}} )
			else if (req.query.idType == "FullName+Synonym") {
				db.collection('Disease').find({$or:[{"FullName":{$regex:req.query.idValue, $options:"i"}},
					{"Synonym":{$regex:req.query.idValue, $options:"i"}}]}).toArray(function(err, disData) {
					if (err) {
						throw err
						return
					}
					if (disData.length > 0) res.render('diseases', {
							user:{
								"LogName":req.cookies.Spindle.split('-')[0]
							},
							numbers: [totalNum, omimNum],
							data:disData,
							idType:req.query.idType,
							idValue:req.query.idValue
						})
					else res.render('diseases', {
							user:{
								"LogName":req.cookies.Spindle.split('-')[0]
							},
							numbers: [totalNum, omimNum],
							error: true,
							idType:req.query.idType,
							idValue:req.query.idValue
						})
				})
			}
			else if  (req.query.idType == "ORDOID") {
				req.query.idValue = req.query.idValue.replace(/(^\s*)|(\s*$)/g, '');
				var ordo = '';
				if (req.query.idValue.indexOf('ORPHA') !== -1)  ordo = req.query.idValue.split('ORPHA')[1];
				else ordo = req.query.idValue;
				db.collection('Disease').find({"ORDOID":ordo}).toArray(function(err, disData) {
					if (err) {
						throw err
						return
					}
					if (disData.length > 0) res.render('diseases', {
							user:{
								"LogName":req.cookies.Spindle.split('-')[0]
							},
							numbers: [totalNum, omimNum],
							data:disData,
							idType:req.query.idType,
							idValue:req.query.idValue
					})
					else res.render('diseases', {
							user:{
								"LogName":req.cookies.Spindle.split('-')[0]
							},
							numbers: [totalNum, omimNum],
							error: true,
							idType:req.query.idType,
							idValue:req.query.idValue
					})
				})
			}
			else if (req.query.idType == "OMIMID") {
				req.query.idValue = req.query.idValue.replace(/(^\s*)|(\s*$)/g, '')
				var collect = 'Disease'
				var search_json = {
					"OMIMID": req.query.idValue
				}
				db.collection('Disease').find(search_json).toArray(function(err, disData) {
				//db.collection(collect).find({"OMIMID":req.query.idValue}).toArray(function(err, disData) {
					if (err) {
						throw err
						return
					}
					if (disData.length > 0) res.render('diseases', {
							user:{
								"LogName":req.cookies.Spindle.split('-')[0]
							},
							numbers: [totalNum, omimNum],
							data:disData,
							idType:req.query.idType,
							idValue:req.query.idValue
					})
					else res.render('diseases', {
							user:{
								"LogName":req.cookies.Spindle.split('-')[0]
							},
							numbers: [totalNum, omimNum],
							error: true,
							idType:req.query.idType,
							idValue:req.query.idValue
					})
				})
			}
		})
	})
})

router.get('/:idType/:idValue', function(req, res) {
	var db = req.db;
	db.bind('Disease');
		if (req.params.idType == "FullName+Synonym") {
						//db.Disease.find({$or:[{"FullName":{$regex:req.params.idValue, $options:"i"}},{"Synonym":{$regex:req.params.idValue, $options:"i"}}]}).toArray(function(err, disData) {
			db.Disease.find({$or:[{"FullName":{$regex:req.params.idValue, $options:"i"}},{"Synonym":{$regex:req.params.idValue, $options:"i"}}]}).toArray(function(err, disData) {

				if (err) { throw err; return }
				res.send({ disData:disData, idType:req.params.idType, idValue:req.params.idValue });
			})
		}
		else if  (req.params.idType == "ORDOID") {
						//req.params.idValue = req.params.idValue.replace(/(^\s*)|(\s*$)/g, '');
						var ordo = '';
						if (req.params.idValue.indexOf('ORPHA') !== -1)  ordo = req.params.idValue.split('ORPHA')[1];
						else ordo = req.params.idValue;
						db.Disease.find({"ORDOID":ordo}).toArray(function(err, disData) {
							if (err) console.log(err);
							res.send({ disData: disData, idType:req.params.idType, idValue:req.params.idValue });
						});
		}
		else if (req.params.idType == "OMIMID") {
						//req.params.idValue = req.params.idValue.replace(/(^\s*)|(\s*$)/g, '');
						var ary = [];
						ary.push(req.params.idValue);
						db.Disease.find({"OMIMID":{$all:ary}}).toArray(function(err, disData) {
							if (err) console.log(err);
							res.send({ disData: disData, idType:req.params.idType, idValue:req.params.idValue });
						});
		}
		else {
						//console.log("No gene selected.");
						res.json({data:["Failed search"]});
		}
				//}
			//}
		//});
	//}
});

module.exports = router;
