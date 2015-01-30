// This module create and return a new token
var getClientIP = require('./getClientIP.js');

module.exports = function(req, user) {

	console.log("Read in token(), ContactInfo:", user.ContactInfo);

	var str = '';
	for (i=0; i<user.ContactInfo.length; i++) {
		str += user.ContactInfo.charCodeAt(i);
	}
	var today = new Date();
	var thisMS = today.getTime();
	var midNumber = parseInt(str.substr(0,20))/thisMS;
	var split = (midNumber + '').split('.');
	var token = parseInt(split[0] + split[1]).toString(16);
	return user.LogName.split('@')[0] + '-' + token + '-' + getClientIP(req);
};

