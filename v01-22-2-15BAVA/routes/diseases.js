var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var settoken = require('../private/js/settoken.js');
router.use(cookieParser('Spindle'));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.get('/', function(req, res) {
	var db = req.db;
/*
	db.bind('Curator');
	var cookie = 'No Cookie';
    for ( var c in req.cookies ) {
            if (c == 'Spindle') { // found a Spindle cookie in browser
                cookie = req.cookies[c];
                break;
            }
    }
    if (cookie != 'No Cookie') {
        db.Curator.find({"Token":cookie}).toArray(function(err, user) {
            if (err) console.log(err);
            if (!user) res.render('logout'); // no token in db same as cookie
            else {
                    // check expiration (0.5 hours after each action)
                var temp = user[0].LoginRecord.pop();
                temp = temp.split(', ')[1];
                var today = new Date();
                var thisMS = today.getTime();
                if (thisMS - parseInt(temp) > 0.5*3600000) { // cookie expired (0.5 hours)
                	// delete cookie in browser
                	res.clearcookie('Spindle', '', { maxAge:0, httpOnly:true, path:'/' });
                    res.render('logout', {token:'expired'});
                }
                else {
                	// reset token and cookie
					var savetoken = settoken(req, user[0]);
						db.Curator.update({"LogName":user[0].LogName}, {$set:{"Token":savetoken}}, function(err) {
						if (err) console.log(err);
						var cookie_life = 0.5*3600000; // 0.5 hours to expire
						res.cookie('Spindle', savetoken, { maxAge:cookie_life, httpOnly:true, path:'/' });
					});

					db.bind('Disease');
					db.Disease.count({"Active":"Yes"}, function(err, totalNum) {
						db.Disease.count({"OMIMID":{$ne:[]}}, function(err, omimNum) {
							// reset token and cookie
							if (err) console.log(err);
							res.render('diseases', { data: [totalNum, omimNum]} );
						});
					});
				}
			}
		});
	}
*/
	db.bind('Disease');
	db.Disease.count({"Active":"Yes"}, function(err, totalNum) {
		db.Disease.count({"OMIMID":{$ne:[]}}, function(err, omimNum) {
			if (err) console.log(err);
/*				// reset token and cookie
			db.bind('Curator');
			var savetoken = settoken(req, user[0]);
			db.Curator.update({"LogName":user[0].LogName}, {$set:{"Token":savetoken}}, function(err) {
				if (err) console.log(err);
				res.cookie('Spindle', savetoken, { maxAge:0.5*3600000, httpOnly:true, path:'/' });
				res.render('diseases', { data: [totalNum, omimNum]} );
			}); */
			res.render('diseases', { data: [totalNum, omimNum]} );
		});
	});
});

router.get('/:idType/:idValue', function(req, res) {
	var db = req.db;
/*	db.bind('Curator');

	var cookie = 'No Cookie';
    for ( var c in req.cookies ) {
            if (c == 'Spindle') { // found a Spindle cookie in browser
                cookie = req.cookies[c];
                break;
            }
    }
    if (cookie != 'No Cookie') {
        db.Curator.find({"Token":cookie}).toArray(function(err, user) {
            if (err) console.log(err);
            if (!user) res.render('logout'); // no token in db same as cookie
            else {
                    // check expiration (0.5 hours after each action)
                var temp = user[0].LoginRecord.pop();
                temp = temp.split(', ')[1];
                var today = new Date();
                var thisMS = today.getTime();
                if (thisMS - parseInt(temp) > 0.5*3600000) { // cookie expired (0.5 hours)
                	res.clearcookie('Spindle', '', {maxAge:0, path:'/'}); // delete cookie in browser
                	user[0].LoginRecord.push(Date().toString() + ", " + thisMS.toString());
                    db.Curator.update({"Token":cookie},{$set:{"Token":"", "LoginRecord":user[0].LoginRecord}}, function() { // delete token in db and set logout time
                        if (err) console.log(err);
                    });
                    res.render('logout', {token:'expired'});
                }
				else {
					// reset token and cookie
					var savetoken = settoken(req, user[0]);
					db.Curator.update({"LogName":user[0].LogName}, {$set:{"Token":savetoken}}, function(err) {
						if (err) console.log(err);
						var cookie_life = 0.5*3600000; // 0.5 hours to expire
						res.cookie('Spindle', savetoken, { maxAge:cookie_life, httpOnly:true, path:'/' });
					});

					db.bind('Disease');
					if (req.params.idType == "FullName+Synonym") {
						db.Disease.find({$or:[{"FullName":{$regex:req.params.idValue, $options:"i"}},{"Synonym":{$regex:req.params.idValue, $options:"i"}}]}).toArray(function(err, disData) {
							if (err) console.log(err);
							res.send({ disData: disData, idValue:req.params.idValue });
						});
					}
					else if  (req.params.idType == "ORDOID") {
						//req.params.idValue = req.params.idValue.replace(/(^\s*)|(\s*$)/g, '');
						var ordo = '';
						if (req.params.idValue.indexOf('ORPHA') !== -1)  ordo = req.params.idValue.split('ORPHA')[1];
						else ordo = req.params.idValue;
						db.Disease.find({"ORDOID":ordo}).toArray(function(err, disData) {
							if (err) console.log(err);
							res.send({ disData: disData, idValue:req.params.idValue });
						});
					}
					else if (req.params.idType == "OMIMID") {
						//req.params.idValue = req.params.idValue.replace(/(^\s*)|(\s*$)/g, '');
						var ary = [];
						ary.push(req.params.idValue);
						db.Disease.find({"OMIMID":{$all:ary}}).toArray(function(err, disData) {
							if (err) console.log(err);
							res.send({ disData: disData, idValue:req.params.idValue });
						});
					}
					else {
						//console.log("No gene selected.");
						res.json({data:["Failed search"]});
					}
				}
			}
		});
	}

	// renew token and cookie
	var savetoken = settoken(req, user[0]);
	db.Curator.update({"LogName":user[0].LogName}, {$set:{"Token":savetoken}}, function(err, next) {
		if (err) console.log(err);
		res.cookie('Spindle', savetoken, { maxAge:0.5*3600000, httpOnly:true, path:'/' });
		next();
	});
*/
	db.bind('Disease');
					if (req.params.idType == "FullName+Synonym") {
						db.Disease.find({$or:[{"FullName":{$regex:req.params.idValue, $options:"i"}},{"Synonym":{$regex:req.params.idValue, $options:"i"}}]}).toArray(function(err, disData) {
							if (err) console.log(err);
							res.send({ disData: disData, idValue:req.params.idValue });
						});
					}
					else if  (req.params.idType == "ORDOID") {
						//req.params.idValue = req.params.idValue.replace(/(^\s*)|(\s*$)/g, '');
						var ordo = '';
						if (req.params.idValue.indexOf('ORPHA') !== -1)  ordo = req.params.idValue.split('ORPHA')[1];
						else ordo = req.params.idValue;
						db.Disease.find({"ORDOID":ordo}).toArray(function(err, disData) {
							if (err) console.log(err);
							res.send({ disData: disData, idValue:req.params.idValue });
						});
					}
					else if (req.params.idType == "OMIMID") {
						//req.params.idValue = req.params.idValue.replace(/(^\s*)|(\s*$)/g, '');
						var ary = [];
						ary.push(req.params.idValue);
						db.Disease.find({"OMIMID":{$all:ary}}).toArray(function(err, disData) {
							if (err) console.log(err);
							res.send({ disData: disData, idValue:req.params.idValue });
						});
					}
					else {
						//console.log("No gene selected.");
						res.json({data:["Failed search"]});
					}
});

module.exports = router;
