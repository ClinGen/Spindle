module.exports = function getClientIP(req) {
/*
	return param.headers['x-forwarded-for'] ||
        param.connection.remoteAddress ||
        param.socket.remoteAddress ||
        param.connection.socket.remoteAddress;
*/
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
};
