var express = require('express')
var router = express.Router()
//var Q = require('q')
//var db_find = require('../private/js/db_find.js')

router.get('/:smbl/:ordo', function(req, res) {
	var db = req.db
	db.collection('Curation').find({"HGNCSymbol":req.params.smbl, "ORDOID":req.params.ordo}).toArray(function(err, curationData) {
		if (err) {
			console.log(err)
			return
		}
		db.collection('Curator').find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
			if (err) {
				console.log(err)
				return
			}
			db.collection('Curator').find({"LogName":curationData[0].Curators[0].LogName}).toArray(function(err, creator) {
				if (err) {
					console.log(err)
					return
				}
				if (curationData[0].Observations && curationData[0].Observations.CaseStudy.length > 0) {
					db.collection('CaseStudy').find({"HGNCSymbol":req.params.smbl, "ORDOID":req.params.ordo}).toArray(function(err, casegroupstudy) {
						if (err) [
							console.log(err)
							return
						}
						res.render('casegroup', {data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy})
					})
				}
				else res.render('casegroup', {data:curationData[0], user:user[0], creator:curator[0]})
			})
		})
	})
/*
	var args = {
		db:req.db,
		Collection: 'Curation',
		Item: ['HGNCSymbol+ORDOID'],
		Value: [req.params.smbl, req.params.ordo]
	}
	var get_bd_data = Q.denodeify(db_find)
	get_bd_data(args).then()

	args.Collection = 'Curator'
	args.Item = 'LogName'
	args.Value = [req.cookies.Spindle.split('-')[0]]
	var user = db_find(args)

	args.Value = [curationData[0].Curators[0].LogName]
	var curator = db_find(args)

	if (curationData[0].Observations && curationData[0].Observations.CaseStudy.length > 0) {
		args.Colelction = 'CaseStudy'
		args.Item = ['HGNCSymbol+ORDOID']
		args.Value = [req.params.smbl, req.params.ordo]
		var casegroupstudy = db_find(args)
		res.render('casegroup', {data:curationData[0], user:user[0], creator:curator[0], casegroupstudy:casegroupstudy})
	}
	else res.render('casegroup', {data:curationData[0], user:user[0], creator:curator[0]})
*/
})

router.get('/Study/:id/Group/:gid', function(req, res) {
	var db = req.db;
	db.bind('CaseStudy');
	db.CaseStudy.find({"CaseStudyID":req.params.id}).toArray(function(err, casegroupstudy) {
			if (err) {
				console.log(err);
				return;
			}

//console.log("find case name as:", thisgroup.CaseGroupName);
			db.bind("Curation");
			db.Curation.find({"HGNCSymbol":casegroupstudy[0].HGNCSymbol, "ORDOID":casegroupstudy[0].ORDOID}).toArray(function(err, curationData) {
				if (err) {
					console.log(err);
					return;
				}
				db.bind('Curator');
				db.Curator.find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
					if (err) {
						console.log(err);
						return;
					}
					db.Curator.find({"LogName":curationData[0].LogName}).toArray(function(err, creator) {
						if (err) {
							console.log(err);
							return;
						}
						if (req.params.gid == 'Addnew') {
							res.render('casegroup_group', { newgroup:true, studyid:req.params.id, data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy});
						}
						//else res.render('casegroup_group', { studyid:req.params.id, group:req.params.gp, data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy});
						else {
							var thisgroup = casegroupstudy[0].CaseGroup[parseInt(req.params.gid)-1];
							res.render('casegroup_group', { studyid:req.params.id, group:thisgroup, data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy});
						}
					});
				});
			});
	});
});

router.get('/Study/:id/Group/:gid/Method', function(req, res) {
	var db = req.db;
	db.collection('CaseStudy').find({"CaseStudyID":req.params.id}).toArray(function(err, casegroupstudy) {
			if (err) {
				console.log(err);
				return
			}
			var thisgroup = casegroupstudy[0].CaseGroup[parseInt(req.params.gid)-1];
			db.collection('Curation').find({"HGNCSymbol":casegroupstudy[0].HGNCSymbol, "ORDOID":casegroupstudy[0].ORDOID}).toArray(function(err, curationData) {
				if (err) {
					console.log(err);
					return;
				}
				db.collection('Curator').find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
					if (err) {
						console.log(err);
						return;
					}
					db.collection('Curator').find({"LogName":curationData[0].LogName}).toArray(function(err, creator) {
						if (err) {
							console.log(err);
							return;
						}
						var n = parseInt(req.params.id) - 1;
						res.render('method', { studyid:req.params.id, group:thisgroup, data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy});
					});
				});
			});
	});
});

router.get('/Study/:id/Group/:gid/Segregation', function(req, res) {
	var db = req.db;
	//db.bind('CaseStudy');
//console.log("read in symbol:", req.params.id);
	db.collection('CaseStudy').find({"CaseStudyID":req.params.id}).toArray(function(err, casegroupstudy) {
//console.log("study length", casegroupstudy.length);
			if (err) {
				console.log(err)
				return
			}
			//db.bind("Curation");
			db.collection('Curation').find({"HGNCSymbol":casegroupstudy[0].HGNCSymbol, "ORDOID":casegroupstudy[0].ORDOID}).toArray(function(err, curationData) {
				if (err) {
					console.log(err)
					return
				}
				//db.bind('Curator');
				db.collection('Curator').find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
					if (err) {
						console.log(err)
						return
					}
					db.collection('Curator').find({"LogName":curationData[0].LogName}).toArray(function(err, creator) {
						if (err) {
							console.log(err)
							return
						}
						var thisgroup = casegroupstudy[0].CaseGroup[parseInt(req.params.gid)-1];
						res.render('segregation', { studyid:req.params.id, group:thisgroup, data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy});
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
	db.CaseStudy.count({"CaseStudyID":{$ne:""}},function(err, cnt) {
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
						res.render('casegroup_group', { newstudy:true, studyid:cnt+1, newgroup:true, data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy});
					});
				});
			});
		});
	});
});

router.post('/Study', function(req, res) {
//console.log("read in studyid: ", req.body.id, req.body.symbol);
	var db = req.db;;
	var thisTime = Date().toString();
	var thisgroup;
	var newstudy = {
		"CaseStudyID": req.body.id,
		"HGNCSymbol": req.body.symbol,
		"ORDOID": req.body.ordoid,
		"Curators": [req.cookies.Spindle.split('-')[0]],
		"DateTime": [thisTime],
		"Contribution": ["Add the study, enter data in Group 1."],
		"CaseGroup": [
			{
				"GroupID": "1",
				"Curator": req.cookies.Spindle.split('-')[0],
				"DateTime": thisTime,
				"CaseGroupName": req.body.groupname,
				"PMID": req.body.pid,
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
			}
		]
	}
	db.collection('CaseStudy').save(newstudy, function(err) {
		if (err) {
			console.log(err);
			return;
		}
		db.collection('CaseStudy').find({"HGNCSymbol":req.body.symbol, "ORDOID":req.body.ordoid}).toArray(function(err, casegroupstudy) {
			if (err) {
				console.log(err);
				return;
			}
			for (var c in casegroupstudy) {
				for (var g in casegroupstudy[c].CaseGroup) {
					if (casegroupstudy[c].CaseGroup[g].GroupID == '1') {
						thisgroup = casegroupstudy[c].CaseGroup[g];
						break;
					}
				}
			}
			var newaction = {
					"LogName":req.cookies.Spindle.split('-')[0],
					"DateTime":thisTime,
					"Action":'Add a new study (Study ID: ' + req.body.id + ') in Case Group Study.'
			};
			db.collection("Curation").update({"HGNCSymbol":req.body.symbol, "ORDOID":req.body.ordoid},{$push:{"Observations.CaseStudy":req.body.id, "Curators":newaction}}, function(err) {
				if (err) {
					console.log(err);
					return;
				}
				db.collection("Curation").find({"HGNCSymbol":req.body.symbol, "ORDOID":req.body.ordoid}).toArray(function(err, curationData) {
					if (err) {
						console.log(err);
						return;
					}
					newaction = {

					}
					db.collection("Curator").find({"LogName": req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
						if (err) {
							console.log(err);
							return;
						}
						newaction = user[0].LoginRecord.pop();
						newaction.Action.push('Add a new study (Study ID: ' + req.body.id + ') in Case Group Study.');
						db.collection("Curator").update({"LogName": req.cookies.Spindle.split('-')[0]}, {$push:{"LoginRecord":newaction}}, function(err) {
							if (err) {
								console.log(err);
								return;
							}
							db.collection("Curator").find({"LogName": curationData[0].LogName}).toArray(function(err, creator) {
								if (err) {
									console.log(err);
									return;
								}
								res.render('casegroup_group', { group:thisgroup, studyid:req.body.id, data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy});
							});
						});
					});
				});
			});
		});
	});
});

router.post('/Group', function(req, res) {
	var db = req.db
	var newstudy = false
	var newgp
	var thisTime = Date().toString()
	var groupid

	db.collection('CaseStudy').find({"CaseStudyID":req.body.id}).toArray(function(err, temp) { // get a particular study
		if (err) {
                console.log(err)
                return
        }
		if (req.body.groupid != 'Addnew') { // edit data for an existing group
                groupid = req.body.groupid
				newgp = temp[0].CaseGroup[parseInt(req.body.groupid)-1]
				if (req.body.pid != '') newgp.PMID = req.body.pid
				if (req.body.numcase != '') newgp.NumberOfCase = req.body.numcase
				if (req.body.numaffall != '') newgp.NumberOfAffectedAlleles = req.body.numaffall
				if (req.body.numprob != '') newgp.NumberOfProbands = req.body.numprob
				if (req.body.maenage != '') newgp.MeanAgeOfCases = req.body.maenage
				if (req.body.medianage != '') newgp.MedianAgeOfCases = req.body.medianage
				if (req.body.ageonset != '') newgp.AgeOfOnset = req.body.ageonset;
				if (req.body.sexratio != '') newgp.SexRatio = req.body.sexratio
				if (req.body.countryorigin != '') newgp.CountryOfOrigin = req.body.countryorigin
				if (req.body.ethnicity != '') newgp.Ethnicity = req.body.ethnicity
				if (req.body.race != '') newgp.Race = req.body.race
				if (req.body.sporfamil != '') newgp.SporadicalFamilial = req.body.sporfamil
				if (req.body.primaryoutcome != '') newgp.PrimaryOutcome = req.body.primaryoutcome
				if (req.body.otherattr != '') newgp.OtherAttributes = req.body.otherattr

            db.collection('CaseStudy').update({"CaseStudyID":req.body.id,"CaseGroup.GroupID":req.body.groupid},{$set:{"CaseGroup.$":newgp}},function(err) {
                if (err) {
                    throw err
                    return
                }
            })
		}
		else { // add a new group
            groupid = (parseInt(temp[0].CaseGroup.length)+1).toString();
		    newgp = {
                    "GroupID": groupid,
                    "Curator": req.cookies.Spindle.split('-')[0],
                    "DateTime": thisTime,
                    "CaseGroupName": req.body.groupname,
                    "PMID": req.body.pid,
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
            }
            db.collection('CaseStudy').update({"CaseStudyID":req.body.id},{$push:{"CaseGroup":newgp}}, function (err) {
                if (err) {
                    throw err
                    return
                }
            })
		}
        db.collection('CaseStudy').update({"CaseStudyID":req.body.id}, {$push:{
                "Curators": req.cookies.Spindle.split('-')[0],
                "DateTime": thisTime,
                "Contribution": 'Enter group data in Study ' + req.body.id + ', Group ' + groupid
            }}, function (err) {
                if (err) {
                    throw err
                    return
                }
        })
        var newjob = {
                "LogName": req.cookies.Spindle.split('-')[0],
                "Contribution": 'Enter group data in Study ' + req.body.id + ', Group ' + groupid,
                "DateTime": thisTime
        }
        db.collection('Curation').update({"HGNCSymbol":req.body.symbol, "ORDOID": req.body.ordoid},{$push:{"Curators":newjob}}, function(err) {
                if (err) {
                    console.log(err)
                    return
                }
        })
    })
    db.collection('Curator').find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
        if (err) {
            throw err
            return
        }
        var newrecord = user[0].LoginRecord.pop();
        newrecord.Action.push('Enter group data in Case Group Study ' + req.body.id + ', Group ' + groupid);
        db.collection('Curator').update({"LogName":user[0].LogName},{$push:{"LoginRecord":newrecord}}, function (err) {
            if (err) {
                throw err
                return
            }
        })
        db.collection('Curation').find({"HGNCSymbol":req.body.symbol, "ORDOID":req.body.ordoid}).toArray(function(err, curationData) {
            if (err) {
                throw err
                return
            }
            db.collection('Curator').find({"LogName":curationData[0].Curators[0].LogName}).toArray(function(err, creator) {
                if (err) {
                    throw err
                    return
                }
                db.collection('CaseStudy').find({"CaseStudyID":req.body.id}).toArray(function(err, casegroupstudy) {
                    if (err) {
                        throw err
                        return
                    }
                    var thisgroup = casegroupstudy[0].CaseGroup[parseInt(groupid)-1];
                    res.render('casegroup_group', { group:thisgroup, studyid:req.body.id, data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy});

                })
            })
        })
    })
})

router.post('/Method', function(req, res) {
	var db = req.db;
    var thisTime = Date().toString();
	var mthd;
	db.collection('CaseStudy').find({"CaseStudyID":req.body.id}).toArray(function(err, temp) {
		if (err) {
			console.log(err);
			return;
		}
		if (temp[0].CaseGroup[parseInt(req.body.gid)-1].Method) {
			mthd = temp[0].CaseGroup[parseInt(req.body.gid)-1].Method;
			//if (req.body.gname != '') mthd.GroupName = req.body.gname;
			if (req.body.ptext != '') mthd.PrevTest = req.body.ptext;
			if (req.body.ptestdesc != '') mthd.PrevTestDescription = req.body.ptestdesc;
			if (req.body.gwstudy != '') mthd.GenomeWideStudy = req.body.gwstudy;
			if (req.body.gmethod != '') mthd.GenotypingMethod = req.body.gmethod;
			if (req.body.gsequenced != '') mthd.EntireGeneSequencing = req.body.gsequenced;
			if (req.body.copynum != '') mthd.CopyNumberAssessed = req.body.copynum;
			if (req.body.mutategenotype != '') mthd.SpecMutationsGenotyped = req.body.mutategenotype;
			if (req.body.mutatemethod != '') mthd.SpecMutationsGenotypedMethod = req.body.mutatemethod;
			if (req.body.germline != '') mthd.GermlineData = req.body.germline;
			if (req.body.tumor != '') mthd.TumorData = req.body.tumor;
			if (req.body.familyhistory != '') mthd.FamilyHistory = req.body.familyhistory;
		}
		else {
			mthd = {
				//"GroupName": req.body.gname,
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
				"FamilyHistory": req.body.familyhistory
			};
		}
		db.collection('CaseStudy').update({"CaseStudyID":req.body.id,"CaseGroup.GroupID":req.body.gid},{$set:{"CaseGroup.$.Method":mthd}}, function(err) {
			if (err) {
				console.log(err);
				return;
			}
		});
		db.collection('CaseStudy').update({"CaseStudyID":req.body.id},{$push:{"Curators":req.cookies.Spindle.split('-')[0],"DateTime":thisTime,"Contribution":"Enter method data @ Group "+req.body.gid}}, function(err) {
			if (err) {
				throw err;
				return;
			}
		});
		db.collection('CaseStudy').find({"CaseStudyID":req.body.id}).toArray(function(err, casegroupstudy) {
			if (err) {
				console.log(err);
				return;
			}
			var thisgroup = casegroupstudy[0].CaseGroup[parseInt(req.body.gid)-1];
			db.collection('Curation').find({"HGNCSymbol": req.body.symbol, "ORDOID": req.body.ordoid}).toArray(function(err, curationData) {
				if (err) {
					console.log(err);
					return;
				}
				db.collection('Curator').find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
					if (err) {
						console.log(err);
						return;
					}
					var newaction = user[0].LoginRecord.pop();
					newaction.Action.push('Enter method data in Case Gruop Study, Case Study ID: ' + req.body.id + ', Group ID: ' + req.body.gid);
					db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]}, {$pop:{"LoginRecord":1}}, function(err) {
						if (err) {
							throw err;
							return;
						}
					})
					db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]},{$push:{"LoginRecord":newaction}},
						function(err) {
							if(err) {
								console.log(err);
								return;
							}
					})
					var newjob = {
						"LogName": user[0].LogName,
						"Contribution": "update method @ Case Study ID: " + req.body.id + ', Group ' + req.body.gid,
						"DateTime": thisTime
					};
					db.collection('Curation').update({"HGNCSymbol":req.body.symbol, "ORDOID": req.body.ordoid},{$push:{"Curators":newjob}}, function(err) {
						if (err) {
							console.log(err);
							return;
						}
					});
					db.collection('Curator').find({"LogName":curationData[0].LogName}).toArray(function(err, creator) {
						if (err) {
							console.log(err);
							return;
						}
						res.render('method', { exist:true, studyid:req.body.id, group:thisgroup, data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy});
					});
				});
			});
		});
	});
});

router.post('/Segregation', function(req, res) {
	var db = req.db;
	var thisTime = Date().toString();
	var segre;
	db.collection('CaseStudy').find({"CaseStudyID":req.body.id}).toArray(function(err,temp) {
		if (err) {
			throw err
			return
		}
		if (temp[0].CaseGroup[parseInt(req.body.gid)-1].Segregation) {
			segre = temp[0].CaseGroup[parseInt(req.body.gid)-1].Segregation
			if (req.body.pname != '') segre.PedigreeName = req.body.pname
			if (req.body.psize != '') segre.PedigreeSize = req.body.psize
			if (req.body.ppopulation != '') segre.PedigreePopulation = req.body.ppopulation
			if (req.body.pdescription != '') segre.PedigreeDescription = req.body.pdescription
			if (req.body.spattern != '') segre.SegregationPattern = req.body.spattern
			if (req.body.ppgp != '') segre.PhPGenP = req.body.ppgp
			if (req.body.ppgn != '') segre.PhPGenN = req.body.ppgn
			if (req.body.ppgu != '') segre.PhPGenU = req.body.ppgu
			if (req.body.pngp != '') segre.PhNGenP = req.body.pngp
			if (req.body.pngn != '') segre.PhNGenN = req.body.pngn
			if (req.body.pngu != '') segre.PhNGenU = req.body.pngu
			if (req.body.pugp != '') segre.PhUGenP = req.body.pugp
			if (req.body.pugn != '') segre.PhUGenN = req.body.pugn
			if (req.body.pugu != '') segre.PhUGenU = req.body.pugu
			if (req.body.addseginfo != '') segre.AddSegInfo = req.body.addseginfo
		}
		else {
			segre = {
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
			}
		}
		db.collection('CaseStudy').update({"CaseStudyID":req.body.id,"CaseGroup.GroupID":req.body.gid},{$set:{"CaseGroup.$.Segregation":segre}}, function(err) {
			if (err) {
				console.log(err);
				return;
			}
		})
		db.collection('CaseStudy').update({"CaseStudyID":req.body.id},{$push:{
			"Curators":req.cookies.Spindle.split('-')[0],
			"DateTime":thisTime,
			"Contribution":"Enter segregation data @ Group "+req.body.gid
		}}, function(err) {
			if (err) {
				throw err;
				return;
			}
		})
	})
	db.collection('CaseStudy').find({"CaseStudyID":req.body.id}).toArray(function(err, casegroupstudy) {
		if (err) {
			console.log(err)
			return
		}
		var thisgroup = casegroupstudy[0].CaseGroup[parseInt(req.body.gid)-1];
		db.collection('Curation').find({"HGNCSymbol": req.body.symbol, "ORDOID": req.body.ordoid}).toArray(function(err, curationData) {
			if (err) {
				console.log(err)
				return
			}
			db.collection('Curator').find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
				if (err) {
					console.log(err)
					return
				}
				var newaction = user[0].LoginRecord.pop();
				newaction.Action.push('Enter segregation data in Case Gruop Study, Case Study ID: ' + req.body.id + ', Group ID: ' + req.body.gid)
				db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]}, {$pop:{"LoginRecord":1}}, function(err) {
					if (err) {
						throw err
						return
					}
				})
				db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]},{$push:{"LoginRecord":newaction}},
					function(err) {
						if(err) {
							console.log(err)
							return
						}
					})
				var newjob = {
					"LogName": user[0].LogName,
					"Contribution": "update segregation @ Case Study ID: " + req.body.id + ', Group ' + req.body.gid,
					"DateTime": thisTime
				};
				db.collection('Curation').update({"HGNCSymbol":req.body.symbol, "ORDOID": req.body.ordoid},{$push:{"Curators":newjob}}, function(err) {
					if (err) {
						console.log(err);
						return;
					}
				});
				db.collection('Curator').find({"LogName":curationData[0].LogName}).toArray(function(err, creator) {
					if (err) {
						console.log(err)
						return
					}
					res.render('segregation', { studyid:req.body.id, group:thisgroup, data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy})
				})
			})
		})
	})
})

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

module.exports = router
