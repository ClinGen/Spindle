// This module create and return a token

var token = require('./token.js');
var cookie_life = require('./cookie_life.js');

module.exports = function(req, res, user) {
	var db = req.db;
	db.bind('Curator');
	var thisUser;
	if (user) thisUser = user;
	else {
		db.Curator.find({"Token":req.cookies.Spindle}).toArray(function(err, data, next) {
			if (err) console.log(err);
			thisUser = data[0];
			next();
		});
	}

	console.log("send from settoken, ContactInfo:", thisUser.ContactInfo);

	var newToken = token(req, thisUser);
	var cookieLife = cookie_life();
	res.cookie('Spindle', newToken, { maxAge:cookieLife.CookieLife, httpOnly:true, path:'/' });
	db.Curator.update({"LogName":thisUser.LogName},{$set:{"Token":newToken}}, function(err) {
		if (err) console.log(err);
	});
};
