
var http = require("http");

module.exports = function(pmid) {
	var str = ''
	var url = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=PubMed&retmode=xml&id=' + pmid
	var askdata = http.request(url, function(reply) {
		reply.on('data', function(chunk) {
			str += chunk
		})
		reply.on('end', function() {
			//console.log("Download done.", str)
			return str
		})
	})
	askdata.end()
}
