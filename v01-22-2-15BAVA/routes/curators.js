var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
//var token = require('../private/js/token.js');
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
				else { // get data of all curators from db
					// reset token and cookie
					var savetoken = settoken(req, user[0]);
					db.Curator.update({"LogName":user[0].LogName}, {$set:{"Token":savetoken}}, function(err) {
					if (err) console.log(err);
						var cookie_life = 0.5*3600000; // 0.5 hours to expire
						res.cookie('Spindle', savetoken, { maxAge:cookie_life, httpOnly:true, path:'/' });
					});

					db.Curator.find().toArray(function(err, curators) {
						var ec = cg = exp = 0;
						for (var i=0; i<curators.length; i++) {
							if (curators[i].Title == "Expert Curator") exp++;
							else if (curators[i].Title == "ClinGen Curator") cg++;
							else if (curators[i].Title == "External Curator") ec++;
						}
						res.render('curators', {exp:exp, ec:ec, cg:cg, user:user[0], data:curators});
					});
				}
			}
		});
	}
});

module.exports = router;
