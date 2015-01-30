// This module create a token for each login user
//var  getClientIP = require('js/getClientIP.js');
var settoken = require('../js/settoken.js');

module.exports = function(req) {
		var cookie = 'No Cookie';
		for ( var c in req.cookies ) {
			if (c == 'Spindle') { // found a Spindle cookie in browser
				cookie = req.cookies[c];
				console.log("Found a Spindle cookie:", cookie);
				break;
			}
		}
		if (cookie === 'No Cookie') return 'login';
		else {
			var db = req.db;
			db.bind('Curator');
			db.Curator.find({"Token":cookie}).toArray(function(err, user) {
				if (err) console.log(err);
				if (!user) return 'cookie/token not match';
				else {
					// check expiration (0.5 hours after each action)
					var temp = user[0].LoginRecord.pop();
					temp = temp.split(', ')[1];
					var today = new Date();
					var thisMS = today.getTime();
					console.log(thisMS - parseInt(temp));
					if (thisMS - parseInt(temp) > 0.5*3600000) { // cookie expired (0.5 hours)
						return 'expired';
					}
					else {
						console.log("return reset");
						return 'reset';
					}
				}
			});
/*
			db.Curator.count({"Token":cookie}, function(err, cnt) { // compare cookie with token in db
				if (err) console.log(err);
				if (cnt == 0) return 'cookie/token not match';
				else {
					console.log("Found " + cnt + " token matching cookie.");
					db.Curator.find({"Token":cookie}).toArray(function(err, user) {
						if (user.length !== 1) return 'user undefinded'
						else { // found a token matching cookie
							console.log("Token:", user[0].Token);
							// check expiration (0.5 hours after each action)
							var temp = user[0].LoginRecord.pop();
							temp = temp.split(', ')[1];
							var today = new Date();
			                var thisMS = today.getTime();
			                console.log(thisMS - parseInt(temp));
			                if (thisMS - parseInt(temp) > 0.5*3600000) { // cookie expired (0.5 hours)
			                	//res.render('logout', {token:'expired'}); // redo login
			                	return 'expired';
			                }
							else {
								console.log("return reset");
								//return ["reset", user[0]];
								return 'reset';
							}
						}
					});
				}
			});
*/
		}
};
