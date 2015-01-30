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
                	res.clearcookie('Spindle', '', {maxAge:0, path:'/'}); // delete cookie in browser
                	user[0].LoginRecord.push(Date().toString() + ", " + thisMS.toString());
                    db.Curator.update({"Token":cookie},{$set:{"Token":"", "LoginRecord":user[0].LoginRecord}}, function() { // delete token in db and set logout time
                        if (err) console.log(err);
                    });
                    res.render('logout', {token:'expired'}); // force to logout
                }
                else {
                	// reset token and cookie
					var savetoken = settoken(req, user[0]);
						db.Curator.update({"LogName":user[0].LogName}, {$set:{"Token":savetoken}}, function(err) {
						if (err) console.log(err);
						var cookie_life = 0.5*3600000; // 0.5 hours to expire
						res.cookie('Spindle', savetoken, { maxAge:cookie_life, httpOnly:true, path:'/' });
					});

					db.bind('Gene');
					db.Gene.count({"Active":"Yes"}, function(err, totalNum) {
						db.Gene.count({"EntrezID":{$ne:""}}, function(err, entrezNum) {
							db.Gene.count({"OMIMID":{$ne:""}}, function(err, omimNum) {
								//console.log(req.query.idType);
								//console.log(req.query.idValue);
								if (req.query.idType == "HGNCSymbol+Synonyms") {
									//db.Gene.find({"SymbolLowercase":req.query.idValue.toLowerCase()}).toArray(function(err, geneData) {
									db.Gene.find({$or:[{"HGNCSymbol":{$regex:req.query.idValue, $options:"i"}},{"Synonyms":{$regex:req.query.idValue,$options:"i"}}]}).toArray(function(err, geneData) {
									//db.Gene.find({$or:[{"HGNCSymbol":{$regex:req.query.idValue, $options:"i"}}, {"Synonyms":{$regex:req.query.inValue, $options:"i"}}]}).toArray(function(err, geneData) {
										if (err) console.log(err)
										//console.log(geneData.length);
										res.render('genes', {numbers:[totalNum, entrezNum, omimNum], search:[req.query.idType,req.query.idValue], gene:geneData, data:user[0]});
										//res.render('genes', {total:totalNum, entrez:entrezNum, omim:omimNum, selected:true, gene:geneData, data:items[0]});
									});
								}
								else if  (req.query.idType == "EntrezID") {
									db.Gene.find({"EntrezID":req.query.idValue}).toArray(function(err, geneData) {
										if (err) console.log(err)
										res.render('genes', {numbers:[totalNum, entrezNum, omimNum], search:[req.query.idType,req.query.idValue], gene:geneData, data:user[0]});
									});
								}
								else if (req.query.idType == "OMIMID") {
									db.Gene.find({"OMIMID":req.query.idValue}).toArray(function(err, geneData) {
										if (err) console.log(err)
										res.render('genes', {numbers:[totalNum, entrezNum, omimNum], search:[req.query.idType,req.query.idValue], gene:geneData, data:user[0]});
									});
								}
								else {
									//console.log("No gene selected.");
									res.render('genes', {numbers:[totalNum, entrezNum, omimNum], data:user[0]});
								}
							});
						});
					});
				}
			}
		});
	}
});

module.exports = router;
