var express = require('express');
var router = express.Router();

router.get('/:smbl/:ordo', function(req, res) {
	var db = req.db;
	db.bind('Curation');
	db.Curation.find({"HGNCSymbol":req.params.smbl, "ORDOID":req.params.ordo}).toArray(function(err, curationData) {
		if (err) console.log(err);
//console.log("get curation data from db", curationData);
			db.bind('Curator');
			db.Curator.find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
				if (err) console.log(err);
				db.Curator.find({"LogName":curationData[0].Curators[0].LogName}).toArray(function(err, curator) {
					if (err) console.log(err);
					if (curationData[0].Observations.CaseStudy.length > 0) {
						db.bind('CaseStudy');
						db.CaseStudy.find({"HGNCSymbol":req.params.smbl, "ORDOID":req.params.ordo}).toArray(function(err, casegroupstudy) {
							if (err) console.log(err);
//console.log("Case group length:", casegroupstudy[0].CaseGroup.length);
							res.render('casegroup', {data:curationData[0], user:user[0], creator:curator[0], casegroupstudy:casegroupstudy});
						});
					}
					else res.render('casegroup', {data:curationData[0], user:user[0], creator:curator[0]});
				});
			});
	});
});

router.get('/Study/:id/Group/:gp/:symbol/:ordoid', function(req, res) {
	var db = req.db;
	db.bind('CaseStudy');
//console.log("read in symbol:", req.);
	db.CaseStudy.find({"HGNCSymbol":req.params.symbol, "ORDOID":req.params.ordoid}).toArray(function(err, casegroupstudy) {
//console.log("study length", casegroupstudy.length);
			if (err) console.log(err);
			db.bind("Curation");
			db.Curation.find({"HGNCSymbol": req.params.symbol, "ORDOID": req.params.ordoid}).toArray(function(err, curationData) {
				if (err) console.log(err);
				db.bind('Curator');
				db.Curator.find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
					if (err) console.log(err);
					db.Curator.find({"LogName":curationData[0].LogName}).toArray(function(err, creator) {
						if (err) console.log(err);
						if (req.params.gp == 'Addnew') {
							res.render('casegroup_group', { addnew:true, studyid:req.params.id, group:req.params.gp, studyid:req.params.id, data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy});
						}
						else res.render('casegroup_group', { studyid:req.params.id, group:req.params.gp, studyid:req.params.id, data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy});
						//else res.render('method', { exist:false, studyid:req.params.id, data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy});
					});
				});
			});
	});
});

router.get('/Study/:id/Method/:symbol/:ordoid', function(req, res) {
	var db = req.db;
	db.bind('CaseStudy');
//console.log("read in symbol:", req.);
	db.CaseStudy.find({"HGNCSymbol":req.params.symbol, "ORDOID":req.params.ordoid}).toArray(function(err, casegroupstudy) {
//console.log("study length", casegroupstudy.length);
			if (err) console.log(err);
			db.bind("Curation");
			db.Curation.find({"HGNCSymbol": req.params.symbol, "ORDOID": req.params.ordoid}).toArray(function(err, curationData) {
				if (err) console.log(err);
				db.bind('Curator');
				db.Curator.find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
					if (err) console.log(err);
					db.Curator.find({"LogName":curationData[0].LogName}).toArray(function(err, creator) {
						if (err) console.log(err);
						var n = parseInt(req.params.id) - 1;
						if (casegroupstudy[n].Method) res.render('method', { exist:true, studyid:req.params.id, data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy});
						else res.render('method', { exist:false, studyid:req.params.id, data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy});
					});
				});
			});
	});
});

router.get('/Study/:id/Segregation/:symbol/:ordoid', function(req, res) {
	var db = req.db;
	db.bind('CaseStudy');
console.log("read in symbol:", req.params.id);
	db.CaseStudy.find({"HGNCSymbol":req.params.symbol, "ORDOID":req.params.ordoid}).toArray(function(err, casegroupstudy) {
//console.log("study length", casegroupstudy.length);
			if (err) console.log(err);
			db.bind("Curation");
			db.Curation.find({"HGNCSymbol": req.params.symbol, "ORDOID": req.params.ordoid}).toArray(function(err, curationData) {
				if (err) console.log(err);
				db.bind('Curator');
				db.Curator.find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
					if (err) console.log(err);
					db.Curator.find({"LogName":curationData[0].LogName}).toArray(function(err, creator) {
						if (err) console.log(err);
						var n = parseInt(req.params.id) - 1;
						if (casegroupstudy[n].Segregation) res.render('segregation', { exist:true, studyid:req.params.id, data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy});
						else res.render('segregation', { exist:false, studyid:req.params.id, data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy});
					});
				});
			});
	});
});

router.get('/Study/:id/Assessment/:symbol/:ordoid', function(req, res) {
	var db = req.db;
	db.bind('CaseStudy');
//console.log("read in symbol:", req.params.id);
	db.CaseStudy.find({"HGNCSymbol": req.params.symbol, "ORDOID": req.params.ordoid}).toArray(function(err, casegroupstudy) {
//console.log("study length", casegroupstudy.length);
			if (err) console.log(err);
			db.bind("Curation");
			db.Curation.find({"HGNCSymbol": req.params.symbol, "ORDOID": req.params.ordoid}).toArray(function(err, curationData) {
				if (err) console.log(err);
				db.bind('Curator');
				db.Curator.find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
					if (err) console.log(err);
					db.Curator.find({"LogName":curationData[0].LogName}).toArray(function(err, creator) {
						if (err) console.log(err);
						//var n = parseInt(req.params.id) - 1;
						res.render('assessment', { studyid:req.params.id, data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy});
						//res.render('assessment', { studyid:req.params.id, data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy});
					});
				});
			});
	});
});

router.get('/Addnewstudy/:symbol/:ordoid', function(req, res) {
	var db = req.db;
	db.bind('CaseStudy');
	db.CaseStudy.count(function(err, cnt) {
		if (err) console.log(err);
		db.CaseStudy.find({"HGNCSymbol": req.params.symbol, "ORDOID": req.params.ordoid}).toArray(function(err, casegroupstudy) {
//console.log("study length", casegroupstudy.length);
			if (err) console.log(err);
			db.bind("Curation");
			db.Curation.find({"HGNCSymbol": req.params.symbol, "ORDOID": req.params.ordoid}).toArray(function(err, curationData) {
				if (err) console.log(err);
				db.bind('Curator');
				db.Curator.find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
					if (err) console.log(err);
					db.Curator.find({"LogName":curationData[0].LogName}).toArray(function(err, creator) {
						if (err) console.log(err);
						res.render('casegroup_group', { addnew:true, studyid:cnt+1, group:'Addnew', data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy});
					});
				});
			});
		});
	});
});

router.post('/Group', function(req, res) {
	var db = req.db;
	db.bind('CaseStudy');
	var newstudy = false;
	var newgp = [];
	db.CaseStudy.count(function(err, cnt) {
		if (err) console.log(err);
		db.CaseStudy.find({"CaseStudyID":req.body.id}).toArray(function(err, temp) {
			if (err) console.log(err);
			if (req.body.group != 'Addnew') { // edit existing group
				for (var i=0; i<newgp.length; i++) {
					if (newgp[i].CaseGroupName == req.body.group) {
						newgp[i] = {
							"Curator": req.cookies.Spindle.split('-')[0],
							"DateTime": Date().toString(),
							"PMID": req.body.pid,
							"CaseGroupName": req.body.gname,
							"NumberOfCase":req.body.numcase,
							"NumberOfAffectedAlleles":req.body.numaffall,
							"NumberOfProbands":req.body.numprob,
							"MeanAgeOfCases":req.body.maenage,
							"MedianAgeOfCases":req.body.medianage,
							"AgeOfOnset":req.body.ageonset,
							"SexRatio":req.body.sexratio,
							"CountryOfOrigin":req.body.countryorigin,
							"Ethnicity":req.body.ethnicity,
							"Race":req.body.race,
							"SporadicalFamilial":req.body.sporfamil,
							"PrimaryOutcome":req.body.primaryoutcome,
							"OtherAttributes":req.body.otherattr
						};
						break;
					}
				}
			}
			else {
				if (cnt >= parseInt(req.body.id)) { // add a new group to an existing study
					newgp = temp[0].CaseGroup;
				}
				else { // add a new study
					newstudy = true;
					db.CaseStudy.save({
						"CaseStudyID": req.body.id,
						"HGNCSymbol": req.body.symbol,
						"ORDOID": req.body.ordoid,
						"Curators": [ req.cookies.Spindle.split('-')[0]],
						"DateTime": [ Date().toString()],
					}, function(err) {
						if (err) console.log(err);
					});
				}
				newgp[newgp.length] = {
					"Curator": req.cookies.Spindle.split('-')[0],
					"DateTime": Date().toString(),
					"PMID": req.body.pid,
					"CaseGroupName": req.body.gname,
					"NumberOfCase":req.body.numcase,
					"NumberOfAffectedAlleles":req.body.numaffall,
					"NumberOfProbands":req.body.numprob,
					"MeanAgeOfCases":req.body.maenage,
					"MedianAgeOfCases":req.body.medianage,
					"AgeOfOnset":req.body.ageonset,
					"SexRatio":req.body.sexratio,
					"CountryOfOrigin":req.body.countryorigin,
					"Ethnicity":req.body.ethnicity,
					"Race":req.body.race,
					"SporadicalFamilial":req.body.sporfamil,
					"PrimaryOutcome":req.body.primaryoutcome,
					"OtherAttributes":req.body.otherattr
				};
			}
			db.CaseStudy.update({"CaseStudyID":req.body.id}, {$set:{"CaseGroup":newgp}}, function(err) {
				if (err) console.log(err);
				db.CaseStudy.find({"CaseStudyID":req.body.id}).toArray(function(err, casegroupstudy) {
					if (err) console.log(err);
					db.bind("Curation");
					db.Curation.find({"HGNCSymbol": req.body.symbol, "ORDOID": req.body.ordoid}).toArray(function(err, curationData) {
						if (err) console.log(err);
						var obs = curationData[0].Observations.CaseStudy;
						obs[obs.length] = {
							"CaseStudyID": req.body.id,
							"LogName": req.cookies.Spindle.split('-')[0],
							"DateTime": Date().toString()
						};
						var status = curationData[0].Status;
						if (status == 'Creation') status = "Observation";
						db.Curation.update({"HGNCSymbol":req.body.symbol, "ORDOID": req.body.ordoid}, {$set:{"Observations.CaseStudy":obs, "Status":status}}, function(err) {
							if (err) console.log(err);
							db.bind('Curator');
							db.Curator.find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
								if (err) console.log(err);
								db.Curator.find({"LogName":curationData[0].LogName}).toArray(function(err, creator) {
									if (err) console.log(err);
									db.bind('Curation');
									var newjob = curationData[0].Curators;
									newjob[newjob.length] = {
											"Name": user[0].Name,
											"LogName": user[0].LogName,
											"Contribution": "curation @ Case Study ID: " + req.body.id,
											"DateTime": Date().toString()
									};
									db.Curation.update({"HGNCSymbol":req.body.symbol, "ORDOID": req.body.ordoid},{$set:{"Curators":newjob}}, function(err) {
										if (err) console.log(err);
										//if (newstudy) res.render('casegroup', { data:curationData[0], user:user[0], creator:creator[0] });
										//else
										res.render('casegroup_group', { group:req.body.group, studyid:req.body.id, data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy});
									});
								});
							});
						});
					});
				});
			});
		});
	});
});

router.post('/Method', function(req, res) {
	var db = req.db;
	db.bind('CaseStudy');
	var mthd = {
		"GroupName": req.body.gname,
		"PrevTest": req.body.ptext,
		"PrevTestDescription": req.body.ptestdesc,
		"GenomeWideStudy": req.body.gwstudy,
		"GenotypingMethod": req.body.gmethod,
		"EntireGeneSequencing": req.body.gsequenced,
		"CopyNumberAssessed": req.body.copynum,
		"SpecMutationsGenotyped": req.body.mutategenotype,
		"SpecMutationsGenotypedMethod": req.body.mutatemethod,
		"GermlineData": req.body.germline,
		"TumorData": req.body.tumor,
		"FamilyHistory": req.body.familyhistory,
	}
	db.CaseStudy.update({"CaseStudyID":req.body.id},{$set:{"Method":mthd}}, function(err) {
		if (err) console.log(err);
		//db.CaseStudy.find({"CaseStutyID":req.body.id}).toArray(function(err, casegroupstudy) {
		db.CaseStudy.find({"HGNCSymbol":req.body.symbol,"ORDOID":req.body.ordoid}).toArray(function(err, casegroupstudy) {
//console.log("Case study method info: ", casegroupstudy[0].Method.GroupName);
			if (err) console.log(err);
			db.bind("Curation");
			db.Curation.find({"HGNCSymbol": req.body.symbol, "ORDOID": req.body.ordoid}).toArray(function(err, curationData) {
				if (err) console.log(err);
				db.bind('Curator');
				db.Curator.find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
					if (err) console.log(err);
					db.Curator.find({"LogName":curationData[0].LogName}).toArray(function(err, creator) {
						if (err) console.log(err);
						db.bind('Curation');
						var newjob = {
								"Name": user[0].Name,
								"LogName": user[0].LogName,
								"Contribution": "update method @ Case Study ID: " + req.body.id,
								"DateTime": Date().toString()
						};
						db.Curation.update({"HGNCSymbol":req.body.symbol, "ORDOID": req.body.ordoid},{$set:{"Curator":newjob}}, function(err) {
							if (err) console.log(err);
							res.render('method', { exist:true, studyid:req.body.id, data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy});
						});
					});
				});
			});
		});
	});
});

router.post('/Segregation', function(req, res) {
	var db = req.db;
	db.bind('CaseStudy');
	var seg = {
		"Curator":req.cookies.Spindle.split('-')[0],
		"DateTime":Date().toString(),
		"PedigreeName": req.body.pname,
		"PedigreeSize": req.body.psize,
		"PedigreePopulation":req.body.ppopulation,
		"PedigreeDescription":req.body.pdescription,
		"SegregationPattern":req.body.spattern,
		"PhPGenP":req.body.ppgp,
		"PhPGenN":req.body.ppgn,
		"PhPGenU":req.body.ppgu,
		"PhNGenP":req.body.pngp,
		"PhNGenN":req.body.pngn,
		"PhNGenU":req.body.pngu,
		"PhUGenP":req.body.pugp,
		"PhUGenN":req.body.pugn,
		"PhUGenU":req.body.pugu,
		"AddSegInfo":req.body.addseginfo
	};
	db.CaseStudy.update({"CaseStudyID":req.body.id},{$set:{"Segregation":seg}}, function(err) {
		if (err) console.log(err);
		db.CaseStudy.find({"CaseStutyID":req.body.id}).toArray(function(err, casegroupstudy) {
			if (err) console.log(err);
			db.bind('Curator');
			db.Curator.find({"LogName": req.cookies.Spindle}).toArray(function(err, user) {
				if (err) console.log(err);
				db.bind('Curation');
				var job = {
					"Name": user[0].Name,
					"LogName": user[0].LogName,
					"Contribution": "Enter segregation data for Case Group Study @ CaseStudy ID: " + req.body.id,
					"DateTime": Date().toString()
				};
//console.log("user info:", user[0].Name, user[0].LogName);
//console.log("read in symbol, ordoid:", req.body.symbol, req.body.ordoid);
				db.Curation.update({"HGNCSymbol":req.body.symbol, "ORDOID":req.body.ordoid}, {$push:{"Curators":job}}, function(err) {
					if (err) console.log(err);
					db.Curation.find({"HGNCSymbol":req.body.symbol, "ORDOID":req.body.ordoid}).toArray(function(err, curationData) {
						if (err) console.log(err);
						db.bind('Curator');
						db.Curator.find({"LogName":curationData[0].LogName}).toArray(function(err, creator) {
							if (err) console.log(err);
							res.render('segregation', { exist:true, studyid:req.body.id, data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy});
						});
					});
				});
			});
		});
	});
});

router.post('/Assessment', function(req, res) {
	var db = req.db;
	db.bind('Curator');
	db.Curator.find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
		if (err) console.log(err);
//console.log("get current user");
		var job = {
			"Name": user[0].Name,
			"LogName": user[0].LogName,
			"Contribution": "Add assessment",
			"DateTime": Date().toString()
		};

		var assmnt = {
			"Level": req.body.lvl,
			"Reason": req.body.reason,
			"LogName": req.cookies.Spindle.split('-')[0],
			"DateTime": Date().toString()
		};
//console.log("read in id:", req.body.id);
		db.bind('CaseStudy');
		db.CaseStudy.find({"CaseStudyID":req.body.id}).toArray(function(err, temp) {
			if (err) console.log(err);
			var arr = [];
			if (temp[0].Assessments) arr = temp[0].Assessments;
			arr[arr.length] = assmnt;
//console.log("in assessment");
			//db.CaseStudy.update({"CaseStutyID":req.body.id}, {$push:{"Assessments":assmnt}}, function(err) {
			db.CaseStudy.update({"CaseStudyID":req.body.id}, {$set:{"Assessments":arr}}, function(err) {
				if (err) console.log(err);
				db.CaseStudy.find({"HGNCSymbol": req.body.symbol, "ORDOID": req.body.ordoid}).toArray(function(err, casegroupstudy) {
					if (err) console.log(err);
					db.bind('Curator');
					db.Curator.find({"LogName": req.cookies.Spindle}).toArray(function(err, user) {
						if (err) console.log(err);
						db.bind('Curation');
						db.Curation.find({"HGNCSymbol":req.body.symbol, "ORDOID":req.body.ordoid}).toArray(function(err, curationData) {
							if (err) console.log(err);
							db.bind('Curator');
							db.Curator.find({"LogName":curationData[0].Curators[0].LogName}).toArray(function(err, creator) {
								if (err) console.log(err);
								res.render('assessment', { studyid:req.body.id, data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy })
							});
						});
					});
				});
			});
		});
	});
});

module.exports = router;
