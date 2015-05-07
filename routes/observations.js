var express = require('express');
var router = express.Router();
//var getxml = require('./literature.js');
var http = require("http");
var xpath = require('xpath.js')
var xmldom = require('xmldom').DOMParser

router.get('/pmid/:pid', function(req, res) {
	var str = ''
	var url = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=PubMed&retmode=xml&id=' + req.params.pid
	var askdata = http.request(url, function(reply) {
		reply.on('data', function(chunk) {
			str += chunk
		})
		reply.on('end', function() {
//console.log(str);
			var jsonfile = {}
			if (str.indexOf('<ERROR>')== -1) {
				var xmlfile = new xmldom().parseFromString(str)
					jsonfile = {
						"Pmid":"",
						"Title":"",
						"Journal":{
							"Title":"",
							"ISSNType":"",
							"ISSN":"",
							"Volume":"",
							"Issue":"",
							"PubDate":{
								"Year":"",
								"Month":""
							}
						},
						"FirstAuthor":{
							"LastName":"",
							"ForeName":"",
							"Initials":""
						},
						"Abstract":""
					}
					if (xpath(xmlfile, '//PMID').length > 0)
						jsonfile.Pmid = xpath(xmlfile, '//PMID')[0].firstChild.data
					if (xpath(xmlfile, '//ArticleTitle').length > 0)
						jsonfile.Title = xpath(xmlfile, '//ArticleTitle')[0].firstChild.data
					if (xpath(xmlfile, '//Journal/Title').length > 0)
						jsonfile.Journal.Title = xpath(xmlfile, '//Journal/Title')[0].firstChild.data
					if (xpath(xmlfile, '//ISSN/@IssnType').length > 0)
						jsonfile.Journal.ISSNType = xpath(xmlfile, '//ISSN/@IssnType')[0].value
					if (xpath(xmlfile, '//ISSN/@IssnType').length > 0)
						jsonfile.Journal.ISSN = xpath(xmlfile, '//ISSN')[0].firstChild.data
					if (xpath(xmlfile, '//JournalIssue/Volume').length > 0)
						jsonfile.Journal.Volume = xpath(xmlfile, '//JournalIssue/Volume')[0].firstChild.data
					if (xpath(xmlfile, '//JournalIssue/Issue').length > 0)
						jsonfile.Journal.Issue = xpath(xmlfile, '//JournalIssue/Issue')[0].firstChild.data
					if (xpath(xmlfile, '//PubDate/Year').length > 0)
						jsonfile.Journal.PubDate.Year = xpath(xmlfile, '//PubDate/Year')[0].firstChild.data
					if (xpath(xmlfile, '//PubDate/Month').length > 0)
						jsonfile.Journal.PubDate.Month = xpath(xmlfile, '//PubDate/Month')[0].firstChild.data
					if (xpath(xmlfile, '//Author[1]/LastName').length > 0)
						jsonfile.FirstAuthor.LastName = xpath(xmlfile, '//Author[1]/LastName')[0].firstChild.data
					if (xpath(xmlfile, '//Author[1]/ForeName').length > 0)
						jsonfile.FirstAuthor.ForeName = xpath(xmlfile, '//Author[1]/ForeName')[0].firstChild.data
					if (xpath(xmlfile, '//Author[1]/Initials').length > 0)
						jsonfile.FirstAuthor.Initials = xpath(xmlfile, '//Author[1]/Initials')[0].firstChild.data
					if (xpath(xmlfile, '//Abstract/AbstractText').length > 0)
						jsonfile.Abstract = xpath(xmlfile, '//Abstract/AbstractText')[0].firstChild.data
			}
			else {
				jsonfile.Error = str.match(/<ERROR>.+<\/ERROR>/)[0].replace('<ERROR>','').replace('</ERROR>','')
				jsonfile.Pmid = req.params.pid
			}
//console.log(jsonfile)
			res.send(jsonfile)
		})
	})
	askdata.end()
})

router.get('/Groupsearch', function(req, res) {
	var db = req.db
	db.collection('Group').count({"Type":"CaseGroup"}, function(err, cntCase) {
		if (err) {
			throw err
			return
		}
		db.collection('Group').count({"Type":"ControlGroup"}, function(err, cntControl) {
			if (err) {
				throw err
				return
			}
			res.render('groupsearch', { numbers:[cntCase, cntControl] })
		})
	})
})

router.get('/Groupsearch/:idType/:idValue', function(req, res) {
	var db = req.db
	var pattn = req.params.idValue
	if (req.params.idType == 'GroupName') {
		db.collection('Group').find({"GroupData.GroupName":{$regex:pattn, $options:"i"}, "Active":"Yes"}).toArray(function(err, data) {
			if (err) {
				throw err
				return
			}
console.log(data);
			if (!data || data.length == 0) data = ["Error", req.params.idType, req.params.idValue]
			res.send(data)
		})
	}
	else if (req.params.idType == 'PMID') {
		pattn = "^" + req.params.idValue
		db.collection('Group').find({"GroupData.PMID":{$regex:pattn, $options:"i"}}).toArray(function(err, data) {
			if (err) {
				throw err
				return
			}
//console.log(data)
			if (!data || data.length == 0) data = ["Error", req.params.idType, req.params.idValue]
			res.send(data)
		})
	}
	else if (req.params.idType == 'LogName') {
		pattn = "^" + req.params.idValue
		db.collection('Group').find({"Curators.0":{$regex:pattn, $options:"i"}}).toArray(function(err, data) {
			if (err) {
				throw err
				return
			}
			if (!data || data.length == 0) data = ["Error", req.params.idType, req.params.idValue]
			res.send(data)
		})
	}
})

router.get('/:smbl/:ordo', function(req, res) {
	var db = req.db;
	db.bind('Curation');
	db.Curation.find({"HGNCSymbol":req.params.smbl, "ORDOID":req.params.ordo}).toArray(function(err, curationData) {
		if (err) console.log(err);
		db.bind('Curator');
		db.Curator.find({"LogName":req.cookies.Spindel}).toArray(function(err, user) {
			if (err) console.log(err);
			db.Curator.find({"LogName":curationData[0].LogName}).toArray(function(err, creator) {
				if (err) console.log(err);
				res.render('observations', { data:curationData[0], user:user[0], creator:creator[0]});
			});
		});
	});
});
/*
router.get('/Casestudy/:smbl/:ordo', function(req, res) {
	var db = req.db;
	db.bind('Curation');
	db.Curation.find({"HGNCSymbol":req.params.smbl, "ORDOID":req.params.ordo}).toArray(function(err, curationData) {
		if (err) console.log(err);

		db.bind('Curator');
		db.Curator.find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
			if (err) console.log(err);
			db.Curator.find({"LogName":curationData[0].Curators[0].LogName}).toArray(function(err, curator) {
				if (err) console.log(err);
				if (curationData[0].Observations.CaseStudy.length > 0) {
					db.bind('CaseStudy');
					db.CaseStudy.find({"HGNCSymbol":req.params.smbl, "ORDOID":req.params.ordo}).toArray(function(err, casestudy) {
						if (err) console.log(err);
console.log("Case group length:", casestudy[0].CaseGroup.length);
						res.render('casegroup', {data:curationData[0], user:user[0], creator:curator[0], casestudy:casestudy});
					});
				}
				else res.render('casegroup', {data:curationData[0], user:user[0], creator:curator[0]});
			});
		});
	});
});
*/



module.exports = router;
