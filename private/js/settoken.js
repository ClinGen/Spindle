// This module create and return a token
var  getClientIP = require('../js/getClientIP.js');

module.exports = function(req, user) {
	var str = '';
	for (i=0; i<user.ContactInfo.length; i++) {
		str += user.ContactInfo.charCodeAt(i);
	}
	var today = new Date();
	var thisMS = today.getTime();
	//var midNumber = parseInt(str.substr(0,20))/thisMS;
	//var split = (midNumber + '').split('.');
	//var token = parseInt(split[0] + split[1]).toString(16);
	var token = thisMS.toString()
	return user.LogName.split('@')[0] + '-' + token + '-' + getClientIP(req);
/*

	console.log(function (req) {
			var ipAddress;
		    var forwardedIpsStr = req.header('x-forwarded-for');
		    if (forwardedIpsStr) {
		        var forwardedIps = forwardedIpsStr.split(',');
		        ipAddress = forwardedIps[0];
		    }
		    if (!ipAddress) {
		        ipAddress = req.connection.remoteAddress;
		    }
		    return ipAddress;
		});
		// save token as a cookie in browser;

	var cookie_life = 0.5*3600000; // 0.5 hours to expire
	res.cookie('Spindle', token, { maxAge:cookie_life, httpOnly:true, path:'/' });
	console.log('cookie saved');
	db.Curator.update({"LogName":user.LogName}, {$set:{"Token":token}}, function(err) {
		if (err) console.log(err);
		console.log("Token saved by settoken function.");
		return 'set';
	});*/
};
