// This module create a token for each login user
//var getClientIP = require('./js/getClientIP.js');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
//router.use(cookieParser('Spindle'));
//router.use(bodyParser.json());
//router.use(bodyParser.urlencoded({ extended: false }));

module.exports = function(req, res) {
	var db = req.db;
	db.bind('Curator');
	if (req.Cookies.Spindle) {
		db.Curator.find({"Token":req.Cookies.Spindle}, function(err, user) {
			if (err) console.log(err);
			if (!user) return 'Invalud Input Data';

			// check expiration
			var today = new Date();
			var thisMS = today.getTime();
			var expired = true;
			var lastLogin = user.LoginRecord[user.LoginRecord.length - 1].split(', ')[1];
			var interval = thisMS - parseInt(lastLogin);
			if (interval < 72000000) expired = false;
			if (expired) return 'Expired';
		});
	}
	else { // Initial login
		db.Curator.find({"LogName": req.body.logname, "Password": req.body.pwd}).toArray(function(err, user) {
			if (err) console.log(err);
			else {
				// create token
				var str = '';
				for (i=0; i<user.ContactInfo.length; i++) {
				    str += user.ContactInfo.charCodeAt(i);
				}
				var midNumber = parseInt(str.substr(0,20))/thisMS;
				var split = (midNumber + '').split('.');
				var token = parseInt(split[0] + split[1]).toString(16);
				token = user.ContactInfo.split('@')[0] + '@' + token + '@'
				// + getClientIP(req);

				// save as cookie in browser
				var cookie_life = 2*3600000; // 2 hours to expire
				res.cookie('Spindle', token, { maxAge:cookie_life, httpOnly:true, path:'/' });

				// set new login record
				user.LoginRecord.push(Date().toString() + ", " + thisMS.toString());

				db.Curator.update({"LogName":user.LogName}, {$set: {"Token":token,"LoginRecord":user.LoginRecord}}, function(err) {
					if (err) console.log('Token saved error: ', err);
				});
				return user;
			}
		});
	}
/*
	if (user && user.Token !== "" && user.Token != req.cookies.Spindle) {

	}

	//if (user.ContactInfo.indexOf('@') > 0) {
	if (user.Token === '') {

		//return token;

		// set login record

		// save token and login record in db


		return 'Token(Cookie) and Login Record set';
	}
	else return 'Else';
*/
};
