var express = require('express')
var router = express.Router()
var util = require('util')
//var Q = require('q')
//var db_find = require('../private/js/db_find.js')

router.get('/Group/:groupid/Segregation/:itemid/:variant?/:addnew?', function(req, res) {
	var db = req.db
	db.collection('CaseStudy').find({"GroupID":req.params.groupid}).toArray(function(err, casegroupstudy){
		if (err) {
			throw err
			return
		}
		db.collection('Curation').find({"HGNCSymbol":casegroupstudy[0].HGNCSymbol, "ORDOID":casegroupstudy[0].ORDOID}).toArray(function(err, curationData) {
			if (err) {
				throw err
				return
			}
			db.collection('Curator').find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
				if (err) {
					throw err
					return
				}
				db.collection('Curator').find({"LogName":curationData[0].LogName}).toArray(function(err, creator) {
					if (err) {
						throw err
						return
					}
					var template
					var itemData = 'Addnew'
					//if (req.params.item == 'Segregation') {
						//template = 'segregation'
						if (req.params.itemid != 'Addnew') {
							template = 'segregation'
							for ( var i=0, j= casegroupstudy[0].Segregation.length; i<j; i++) {
								if (casegroupstudy[0].Segregation[i].SegregationID == req.params.itemid) {
									itemData = casegroupstudy[0].Segregation[i]
									if (itemData.Variant && itemData.Variant.Active == 'Yes') template = 'segregation_variant'
									break
								}
							}
							if (req.params.addnew == 'Addnew') template = 'segregation_variant_addnew'
							else if (req.params.variant == 'Variant') template = 'segregation_variant'
						}
						else template = 'segregation_addnew'
					//}
//console.log(template);
					res.render(template, { item:itemData, group:casegroupstudy[0], data:curationData[0], user:user[0], creator:creator[0] })
				})
			})
		})
	})
})

router.get('/Group/:groupid/:item', function(req, res) {
	var db = req.db
	db.collection('CaseStudy').find({"GroupID":req.params.groupid}).toArray(function(err, casegroupstudy) {
		if (err) {
			console.log(err)
			return
		}
		db.collection('Curation').find({"HGNCSymbol":casegroupstudy[0].HGNCSymbol, "ORDOID":casegroupstudy[0].ORDOID}).toArray(function(err, curationData) {
			if (err) {
					console.log(err)
					return
			}
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
					var template;
					if (req.params.item == 'Group') template = 'casegroup_group'
					else if (req.params.item == 'Method') template = 'method'
					//else if (req.params.item == 'Segregation') template = 'segregation'
					//else if (req.params.item == 'Assessment') template = 'assessment'
					//else if (req.params.item == 'Variant') template = 'variant'
					res.render(template, { group:casegroupstudy[0], data:curationData[0], user:user[0], creator:creator[0] })
				})
			})
		})
	})
})

router.get('/Addnew/:smbl/:ordo', function(req, res) {
	var db = req.db
	db.collection('CaseStudy').count({}, function(err, cnt) {
	//db.collection('CaseStudy').count({"HGNCSymbol":req.params.smbl, "ORDOID":req.params.ordo}, function(err, cnt) {
		if (err) {
			throw err
			return
		}
		db.collection('Curation').find({"HGNCSymbol":req.params.smbl, "ORDOID":req.params.ordo}).toArray(function(err, curationData) {
			if (err) {
				throw err
				return
			}
			db.collection('Curator').find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
				if (err) {
					throw err
					return
				}
				db.collection('Curator').find({"LogName":curationData[0].Curators[0].LogName}).toArray(function(err, creator) {
					if (err) {
						throw err
						return
					}
					res.render('casegroup_group', { groupid:'Addnew', data:curationData[0], user:user[0], creator:creator[0] })
					//res.render('casegroup_group', { groupid:cnt+1, data:curationData[0], user:user[0], creator:creator[0] })
				})
			})
		})
	})
})

router.get('/:smbl/:ordo', function(req, res) {
	var db = req.db
	db.collection('Curation').find({"HGNCSymbol":req.params.smbl, "ORDOID":req.params.ordo}).sort({"GroupID":1}).toArray(function(err, curationData) {
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
				if (curationData[0].Observations && curationData[0].Observations.CaseStudy && curationData[0].Observations.CaseStudy.length > 0) {
					db.collection('CaseStudy').find({"HGNCSymbol":req.params.smbl, "ORDOID":req.params.ordo}).toArray(function(err, casegroupstudy) {
						if (err) {
							console.log(err)
							return
						}
						res.render('casegroup', { data:curationData[0], user:user[0], creator:creator[0], casegroupstudy:casegroupstudy })
					})
				}
				else res.render('casegroup', { data:curationData[0], user:user[0], creator:creator[0] })
			})
		})
	})
})

router.post('/Variant/Addnew', function(req, res) {
//console.log("read in studyid: ", req.body.id, req.body.symbol);
	var db = req.db;;
	var thisTime = Date().toString();

	db.collection('Variant').count(function(err, cnt) {
		if (err) {
			throw err
			return
		}
		var new_vid = (cnt+1).toString()
		var pevid = []
		if (req.body.pathevidence) {
			if (util.isArray(req.body.pathevidence)) pevid = req.body.pathevidence
			else pevid = [req.body.pathevidence]
		}
		var vrnt = {
			"VariantID": new_vid,
			"Curator": req.cookies.Spindle.split('-')[0],
			"DateTime": thisTime,
			"Active": "Yes",
			"ClinVarID":req.body.clinvarid,
			"dbSNPID":req.body.dbsnpid,
			"HGVS":req.body.varianthgvs,
			"VariantType":req.body.varianttype,
			"MolecularConsequence": req.body.mconsequence,
			"PathogenicEvidence":pevid
		}
		db.collection('Variant').save(vrnt, function(err) {
			if (err) {
				throw err
				return
			}
		})
		db.collection('CaseStudy').update({"GroupID":req.body.groupid, "Segregation.SegregationID":req.body.sid},{$set:{"Segregation.$.Variant":vrnt}}, function(err) {
			if (err) {
				throw err
				return
			}
			db.collection('CaseStudy').update({"GroupID":req.body.groupid, "Segregation.SegregationID":req.body.sid},{$push:{
					"Curators":req.cookies.Spindle.split('-')[0],
					"DateTime":thisTime,
					"Action":'Enter variant data, Variant ID: ' + new_vid
				}}, function(err) {
				if (err) {
					throw err
					return
				}
			})
			db.collection('Curation').update({"HGNCSymbol":req.body.HGNCSymbol, "ORDOID":req.body.ORDOID},{$push:{
					"Curators":{
						"LogName":req.cookies.Spindle.split('-')[0],
						"DateTime":thisTime,
						"Contributaion":'Enter variant data, Case Group Study, Group ' + req.body.groupid + ', Segregation ' + req.body.sid
					}
				}}, function(err) {
				if (err) {
						throw err
						return
				}
				db.collection('Curator').find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
					if (err) {
						throw err
						return
					}
					var newaction = user[0].LoginRecord.pop()
					newaction.Action.push('Enter variant data, Case Group Study, Group ' + req.body.groupid);
					db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]}, {$pop:{"LoginRecord":1}}, function(err) {
						if (err) {
							throw err
							return
						}
						db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]},{$push:{"LoginRecord":newaction}}, function(err) {
							if(err) {
								throw err
								return
							}
							res.redirect('/Casegroupstudy/Group/'+req.body.groupid+'/Segregation/'+req.body.sid)
						})
					})
				})
			})
		})
	})
})

router.post('/Variant/Edit', function(req, res) {
console.log("read in studyid: ", req.body.vid, req.body.groupid);
	var db = req.db;;
	var thisTime = Date().toString()
	db.collection('Variant').find({"VariantID":req.body.vid}).toArray(function(err, temp) {
		if (err) {
				throw err
				return
		}
console.log(temp.length, temp.VariantID);
		var pevid = []
		if (req.body.pathevidence) {
			if (util.isArray(req.body.pathevidence)) pevid = req.body.pathevidence
			else pevid = [req.body.pathevidence]
		}
		if(req.body.clinvarid != '') temp[0].ClinVarID = req.body.clinvarid
		if(req.body.dbsnpid != '') temp[0].dbSNPID = req.body.dbsnpid
		if(req.body.varianthgvs != '') temp[0].VariantHGVS = req.body.varianthgvs
		if(req.body.varianttype != '') temp[0].VariantType = req.body.varianttype
		if(req.body.mconsequence != '') temp[0].MolecularConsequence = req.body.mconsequence
		if(req.body.pathevidence) temp[0].PathogenicEvidence = pevid

		db.collection('Variant').save(temp[0], function(err) {
			if (err) {
				throw err
				return
			}
		})
		db.collection('CaseStudy').update({"GroupID":req.body.groupid, "Segregation.SegregationID":req.body.sid}, {$set:{"Segregation.$.Variant":temp[0]}}, function(err) {
			if (err) {
				throw err
				return
			}
			db.collection('CaseStudy').update({"GroupID":req.body.groupid}, {$push:{
					"Curators":req.cookies.Spindle.split('-')[0],
					"DateTime":thisTime,
					"Action":'Edit variant data, Segregation ' + req.body.sid
				}}, function(err) {
				if (err) {
					throw err
					return
				}
				db.collection('Curation').update({"HGNCSymbol":req.body.symbol, "ORDOID":req.body.ordoid}, {$push:{
						"Curators":{
							"LogName":req.cookies.Spindle.split('-')[0],
							"DateTime":thisTime,
							"Contributaion":'Edit variant data, Case Group Study, Group ' + req.body.groupid + ', Segregation ' + req.body.sid
						}
					}}, function(err) {
					if (err) {
							throw err
							return
					}
					db.collection('Curator').find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
						if (err) {
							throw err
							return
						}
						var newaction = user[0].LoginRecord.pop()
						newaction.Action.push('Edit variant data, Case Group Study, Group ' + req.body.groupid + ', Segregation ' + req.body.sid);
						db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]}, {$pop:{"LoginRecord":1}}, function(err) {
							if (err) {
								throw err
								return
							}
							db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]},{$push:{"LoginRecord":newaction}}, function(err) {
								if(err) {
									throw err
									return
								}
								res.redirect('/Casegroupstudy/Group/'+req.body.groupid+'/Segregation/'+req.body.sid)
							})
						})
					})
				})
			})
		})
	})
})

router.post('/Addnew', function(req, res) {
//console.log("read in:", req.body.symbol, req.body.pid)
	var db = req.db
	var thisTime = Date().toString()
	db.collection('CaseStudy').count(function(err, cnt) {
		if (err) {
			throw err
			return
		}
//console.log("cnt:" cnt)
		var newgp = {
			"GroupID": (cnt+1).toString(),
			"HGNCSymbol": req.body.symbol,
			"ORDOID": req.body.ordoid,
			"Type":"CaseGroup",
			"Active": "Yes",
			"Curators": [req.cookies.Spindle.split('-')[0]],
			"DateTime": [thisTime],
			"Action": ['Create the group.'],
			"GroupData": {
				"GroupName": req.body.groupname,
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
		}
		db.collection('CaseStudy').insert(newgp, function(err) {
			if (err) {
				throw err
				return
			}
			db.collection('Curation').update({"HGNCSymbol":req.body.symbol, 'ORDOID':req.body.ordoid},{$push:{
					"Observations.CaseStudy":(cnt+1).toString(),
					"Curators": {
						"LogName": req.cookies.Spindle.split('-')[0],
						"DateTime": thisTime,
						"Action": "Enter group data, Case Group Study, Group " + (cnt+1).toString()
					}
				}}, function(err) {
					if (err) {
						throw err
						return
					}
			})
			db.collection('Curator').find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
				if (err) {
					throw err
					return
				}
				var newaction = user[0].LoginRecord.pop();
				newaction.Action.push('Enter group data, Case Group Study, Group ' + (cnt+1).toString());
				db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]}, {$pop:{"LoginRecord":1}}, function(err) {
					if (err) {
						throw err
						return
					}
					db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]},{$push:{"LoginRecord":newaction}},
						function(err) {
							if(err) {
								throw err
								return
							}
					})
				})
				db.collection('Curation').find({"HGNCSymbol":req.body.symbol, "ORDOID":req.body.ordoid}).toArray(function(err, curationData) {
					if (err) {
						throw err
						return
					}
					db.collection('Group').save({
							"GroupID":(cnt+1).toString(),
							"Type":"Case Group",
							"Curators":[req.cookies.Spindle.split('-')[0]],
							"DateTime":[thisTime],
							"Action":['Create the group.'],
							"Active":"Yes",
							"GDPair":[
								{ "HGNCSymbol":req.body.symbol, "ORDOID":req.body.ordoid, "FullName":curationData[0].FullName }
							],
							"GroupData": newgp.GroupData
						}, function(err) {
						if (err) {
							throw err
							return
						}
					})
					db.collection('Curator').find({"LogName":curationData[0].Curators[0].LogName}).toArray(function(err, creator) {
						if (err) {
							throw err
							return
						}
						db.collection('CaseStudy').find({"GroupID":(cnt+1).toString()}).toArray(function(err, casegroupstudy) {
							if (err) {
								throw err
								return
							}
							res.render('method', { group:casegroupstudy[0], data:curationData[0], user:user[0], creator:creator[0] })
						})
					})
				})
			})
		})
	})
})

router.post('/Group', function(req, res) {
	var db = req.db
	var newstudy = false
	var newgp
	var thisTime = Date().toString()

	db.collection('CaseStudy').find({"GroupID":req.body.groupid}).toArray(function(err, temp) { // get a particular study
		if (err) {
			throw err
			return
		}
		newgp = temp[0].GroupData
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

		db.collection('Group').update({"GroupID":req.body.groupid},{$set:{"GroupData":newgp}}, function(err) {
			if (err) {
				throw err
				return
			}
		})
		db.collection('CaseStudy').update({"GroupID":req.body.groupid},{$set:{"GroupData":newgp}},function(err) {
			if (err) {
				throw err
				return
			}
       		db.collection('CaseStudy').update({"GroupID":req.body.groupid}, {$push:{
                "Curators": req.cookies.Spindle.split('-')[0],
                "DateTime": thisTime,
                "Action": 'Enter group data, Case Group Study, Group ' + req.body.groupid
            	}}, function (err) {
                if (err) {
                    throw err
                    return
                }
		        var newjob = {
		                "LogName": req.cookies.Spindle.split('-')[0],
		                "DateTime": thisTime,
		                "Action": 'Enter group data, Case Group Study, Group ' + req.body.groupid
		        }
		        db.collection('Curation').update({"HGNCSymbol":req.body.symbol, "ORDOID": req.body.ordoid},{$push:{"Curators":newjob}}, function(err) {
		            if (err) {
		                console.log(err)
		                return
		            }
					db.collection('Curator').find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
						if (err) {
						throw err
						return
						}
						var newaction = user[0].LoginRecord.pop();
						newaction.Action.push('Enter group data, Case Group Study, Group ' + req.body.groupid);
						db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]}, {$pop:{"LoginRecord":1}}, function(err) {
							if (err) {
								throw err
								return
							}
							db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]},{$push:{"LoginRecord":newaction}},
								function(err) {
								if(err) {
										throw err
										return
								}
								res.redirect('/Casegroupstudy/Group/'+req.body.groupid+'/Group')
							})
						})
					})
				})
			})
		})
	})
})

router.post('/Method', function(req, res) {
	var db = req.db
	var thisTime = Date().toString()
	var mthd
	db.collection('CaseStudy').find({"GroupID":req.body.groupid}).toArray(function(err, temp) {
		if (err) {
			throw err
			return
		}
		if (temp[0].Method) {
			mthd = temp[0].Method;
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
				"LogName": req.cookies.Spindle.split('-')[0],
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
			}
		}
		db.collection('CaseStudy').update({"GroupID":req.body.groupid},{$set:{"Method":mthd}}, function(err) {
			if (err) {
				throw err
				return
			}
		})
		db.collection('CaseStudy').update({"GroupID":req.body.groupid},{$push:{
				"Curators":req.cookies.Spindle.split('-')[0],
				"DateTime":thisTime,
				"Action":"Enter method data, Case Group Study, Group "+req.body.groupid
			}}, function(err) {
			if (err) {
				throw err
				return
			}
		})
		db.collection('CaseStudy').find({"GroupID":req.body.groupid}).toArray(function(err, casegroupstudy) {
			if (err) {
				throw err
				return
			}
			db.collection('Curation').find({"HGNCSymbol": req.body.symbol, "ORDOID": req.body.ordoid}).toArray(function(err, curationData) {
				if (err) {
					throw err
					return
				}
				db.collection('Curator').find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
					if (err) {
						console.log(err)
						return
					}
					var newaction = user[0].LoginRecord.pop();
					newaction.Action.push('Enter method data, Case Group Study, Group ' + req.body.groupid);
					db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]}, {$pop:{"LoginRecord":1}}, function(err) {
						if (err) {
							throw err
							return
						}
						db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]},{$push:{"LoginRecord":newaction}},
							function(err) {
								if(err) {
									throw err
									return
								}
						})
					})
					var newjob = {
						"LogName": user[0].LogName,
						"DateTime": thisTime,
						"Action": "Enter method data, Case Group Study, Group " + req.body.groupid
					}
					db.collection('Curation').update({"HGNCSymbol":req.body.symbol, "ORDOID": req.body.ordoid},{$push:{"Curators":newjob}}, function(err) {
						if (err) {
							throw err
							return
						}
						db.collection('Curation').find({"HGNCSymbol":req.body.symbol, "ORDOID": req.body.ordoid}).toArray(function(err, curationData) {
							if (err) {
								throw err
								return
							}
							db.collection('Curator').find({"LogName":curationData[0].LogName}).toArray(function(err, creator) {
								if (err) {
									throw err
									return
								}
								res.render('method', { group:casegroupstudy[0], data:curationData[0], user:user[0], creator:creator[0] })
							})
						})
					})
				})
			})
		})
	})
})

router.post('/Segregation/Addnew', function(req, res) {
	var db = req.db
	var thisTime = Date().toString()
	var segre
	db.collection('CaseStudy').find({"GroupID":req.body.groupid}).toArray(function(err, temp) {
		if (err) {
			throw err
			return
		}
		if (!temp[0].Segregation || temp[0].Segregation.length == 0) req.body.sid = "1"
		else req.body.sid = (temp[0].Segregation.length+1).toString()
			//if (temp[0].Segregation) req.body.sid = (temp[0].Segregation.length + 1).toString()
		var pevid = []
		if (req.body.pathevidence) {
				if (util.isArray(req.body.pathevidence)) pevid = req.body.pathevidence
				else pevid = [req.body.pathevidence]
		}
		segre = {
				"LogName": req.cookies.Spindle.split('-')[0],
				"Active": "Yes",
				"SegregationID": req.body.sid,
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
				"AddSegInfo":req.body.addseginfo,
				/*
				"Variant": {
					"VariantID": v_id,
					"ClinVarID": req.body.clinvarid,
					"dbSNPID": req.body.dbsnpid,
					"VariantHGVS": req.body.varianthgvs,
					"VariantType": req.body.varianttype,
					"MolecularConsequence": req.body.mconsequence,
					"PathogenicEvidence":pevid,
				}*/
		}
		db.collection('CaseStudy').update({"GroupID":req.body.groupid},{$push:{
				"Segregation":segre,
				"Curators":req.cookies.Spindle.split('-')[0],
				"DateTime":thisTime,
				"Action":"Add segregation, Segregation " + req.body.sid
				}}, function(err) {
				if (err) {
					throw err
					return
				}
			db.collection('Curator').find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
					if (err) {
								throw err
								return
					}
					var newaction = user[0].LoginRecord.pop();
					newaction.Action.push('Add segregation, Case Group Study, Group ' + req.body.groupid + ', Segregation ' + req.body.sid);
				db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]}, {$pop:{"LoginRecord":1}}, function(err) {
						if (err) {
							throw err
							return
						}
					db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]},{$push:{"LoginRecord":newaction}}, function(err) {
							if(err) {
								throw err
								return
							}
							var newjob = {
								"LogName": user[0].LogName,
								"Action": 'Add segregation, Case Group Study, Group ' + req.body.groupid + ', Segregation ' + req.body.sid,
								"DateTime": thisTime
							}
						db.collection('Curation').update({"HGNCSymbol":req.body.symbol, "ORDOID": req.body.ordoid},{$push:{"Curators":newjob}}, function(err) {
								if (err) {
									console.log(err);
									return;
								}
								res.redirect('/Casegroupstudy/Group/'+req.body.groupid+'/Segregation/'+req.body.sid)
								//res.render('segregation', { item:casegroupstudy[0].Segregation[parseInt(req.body.sid)-1], group:casegroupstudy[0], data:curationData[0], user:user[0] })
							/*db.collection('Curation').find({"HGNCSymbol": req.body.symbol, "ORDOID": req.body.ordoid}).toArray(function(err, curationData) {
									if (err) {
										throw err
										return
									}
								db.collection('Curator').find({"LogName":curationData[0].LogName}).toArray(function(err, creator) {
										if (err) {
												console.log(err)
												return
										}
									db.collection('CaseStudy').find({"GroupID":req.body.groupid}).toArray(function(err, casegroupstudy) {
										if (err) {
												console.log(err)
												return
										}
									})
								})
							})*/
						})
					})
				})
			})
		})
	})
})

router.post('/Segregation/Edit', function(req, res) {
	var db = req.db
	var thisTime = Date().toString()
	var segre
	db.collection('CaseStudy').find({"GroupID":req.body.groupid}).toArray(function(err,temp) {
		if (err) {
			throw err
			return
		}
		segre = temp[0].Segregation[parseInt(req.body.sid)-1]
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
		db.collection('CaseStudy').update({"GroupID":req.body.groupid,"Segregation.SegregationID":req.body.sid},{$set:{"Segregation.$":segre}}, function(err) {
			if (err) {
					throw err
					return;
			}
			db.collection('CaseStudy').update({"GroupID":req.body.groupid},{$push:{
					"Segregation":segre,
					"Curators":req.cookies.Spindle.split('-')[0],
					"DateTime":thisTime,
					"Action":"Edit segregation, Segregation " + req.body.sid
					}}, function(err) {
				if (err) {
					throw err
					return
				}
				db.collection('Curator').find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
					if (err) {
						throw err
						return
					}
					var newaction = user[0].LoginRecord.pop();
					newaction.Action.push('Edit segregation, Case Group Study, Group ' + req.body.groupid + ', Segregation ' + req.body.sid);
					db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]}, {$pop:{"LoginRecord":1}}, function(err) {
						if (err) {
							throw err
							return
						}
						db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]},{$push:{"LoginRecord":newaction}}, function(err) {
							if(err) {
								throw err
								return
							}
							var newjob = {
								"LogName": user[0].LogName,
								"DateTime": thisTime,
								"Action": 'Edit segregation, Case Group Study, Group ' + req.body.groupid + ', Segregation ' + req.body.sid
							}
							db.collection('Curation').update({"HGNCSymbol":req.body.symbol, "ORDOID": req.body.ordoid},{$push:{"Curators":newjob}}, function(err) {
								if (err) {
										console.log(err);
										return;
								}
								res.redirect('/Casegroupstudy/Group/'+req.body.groupid+'/Segregation/'+req.body.sid)
							})
						})
					})
				})
			})
		})
	})
})

router.post('/Assessment', function(req, res) {
	var db = req.db;
	var thisTime = Date().toString()
	var contribution = ''
	if (req.body.item == 'segregation') {
		db.collection('CaseStudy').update({"GroupID":req.body.groupid, "Segregation.SegregationID":req.body.sid},
			{$push:{"Segregation.$.Assessment":{
				"LogName":req.cookies.Spindle.split('-')[0],
				"Level":req.body.assessment,
				"DateTime":thisTime
			}}}, function(err) {
			if (err) {
				throw err
				return
			}
		})
		contribution = "Add assessment, Case Group Study, Group " + req.body.groupid + ", Segregation " + req.body.sid
	}
	else if (req.body.item == 'variant') {
		db.collection('CaseStudy').update({"GroupID":req.body.groupid, "Segregation.SegregationID":req.body.sid},
			{$push:{"Segregation.$.Variant.Assessment":{
				"LogName":req.cookies.Spindle.split('-')[0],
				"Level":req.body.assessment,
				"DateTime":thisTime
			}}}, function(err) {
			if (err) {
				throw err
				return
			}
		})
		contribution = "Add variant assessment, Case Group Study, Group " + req.body.groupid + ", Segregation " + req.body.sid
	}
	db.collection('CaseStudy').update({"GroupID":req.body.groupid}, {$push:{
				"Curators":req.cookies.Spindle.split('-')[0],
				"DateTime":thisTime,
				"Action":contribution
			}}, function(err) {
			if (err) {
				throw err
				return
			}
	})
	db.collection('Curation').update({"HGNCSymbol":req.body.symbol, "ORDOID":req.body.ordoid}, {$push:{"Curators":{
				"LogName":req.cookies.Spindle.split('-')[0],
				"DateTime": thisTime,
				"Action": contribution
			}
		}}, function(err) {
		if (err) {
			throw err
			return
		}
		db.collection('Curator').find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
			if (err) {
				throw err
				return
			}
			var newaction = user[0].LoginRecord.pop();
			newaction.Action.push(contribution)
			db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]}, {$pop:{"LoginRecord":1}}, function(err) {
				if (err) {
					throw err
					return
				}
				db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]},{$push:{"LoginRecord":newaction}},
					function(err) {
					if(err) {
						throw err
						return
					}
					res.send(true)
				})
			})
		})
	})
})

router.post('/Assessment/Delete', function(req, res) {
	var db = req.db;
	var thisTime = Date().toString()
	var new_assess
	//if (req.body.item == 'segregation') {
	db.collection('CaseStudy').find({"GroupID":req.body.groupid, "Segregation.SegregationID":req.body.sid},{"Segregation.$.Assessment":1}).toArray(function(err, temp) {
			if (err) {
				throw err
				return
			}
			new_assess = temp[0].Segregation[0].Assessment
			for (var i=0; i<new_assess.length; i++) {
				if (new_assess[i] && new_assess[i].LogName == req.cookies.Spindle.split('-')[0]) {
					new_assess.splice(i, 1)
					break
				}
			}
		db.collection('CaseStudy').update({"GroupID":req.body.groupid, "Segregation.SegregationID":req.body.sid},{$set:{"Segregation.$.Assessment":new_assess}}, function(err) {
				if (err) {
					throw err
					return
				}
			db.collection('CaseStudy').update({"GroupID":req.body.groupid, "Segregation.SegregationID":req.body.sid},{$push:{
					"Curators":req.cookies.Spindle.split('-')[0],
					"DateTime": thisTime,
					"Action": "Delete assessment, Case Group Study, Group " + req.body.groupid + ", Segregation " + req.body.sid
				}}, function(err) {
					if (err) {
						throw err
						return
					}
				db.collection('Curation').update({"HGNCSymbol":req.body.symbol,"ORDOID":req.body.ordoid},{$push:{"Curators":{
						"LogName":req.cookies.Spindle.split('-')[0],
						"DateTime":thisTime,
						"Action":"Delete assessment, Case Group Study, Group " + req.body.groupid + ", Segregation " + req.body.sid
					}}},function(err) {
					if (err) {
						throw err
						return
					}
					db.collection('Curator').find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
						if (err) {
							throw err
							return
						}
						var newaction = user[0].LoginRecord.pop();
						newaction.Action.push("Delete assessment, Case Group Study, Group " + req.body.groupid + ", Segregation " + req.body.sid)
						db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]}, {$pop:{"LoginRecord":1}}, function(err) {
							if (err) {
								throw err
								return
							}
							db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]},{$push:{"LoginRecord":newaction}},
								function(err) {
								if(err) {
									throw err
									return
								}
								res.send(true)
							})
						})
					})
				})
			})
		})
	})
})

router.post('/Variantassessment/Delete', function(req, res) {
	var db = req.db;
	var thisTime = Date().toString()
	var new_assess

	db.collection('CaseStudy').find({"GroupID":req.body.groupid, "Segregation.SegregationID":req.body.sid},{"Segregation.$.Variant.Assessment":1}).toArray(function(err, temp) {
		if (err) {
				throw err
				return
		}
		contribution = "Delete variant assessment, Case Group Study, Group " + req.body.groupid + ", Segregation " + req.body.sid
		new_assess = temp[0].Segregation[0].Variant.Assessment
		for (var i=0; i<new_assess.length; i++) {
				if (new_assess[i] && new_assess[i].LogName == req.cookies.Spindle.split('-')[0]) {
					new_assess.splice(i, 1)
					break
				}
		}
		db.collection('CaseStudy').update({"GroupID":req.body.groupid, "Segregation.SegregationID":req.body.sid},{$set:{"Segregation.$.Variant.Assessment":new_assess}}, function(err) {
			if (err) {
					throw err
					return
			}
			db.collection('CaseStudy').update({"GroupID":req.body.groupid, "Segregation.SegregationID":req.body.sid},{$push:{
					"Curators":req.cookies.Spindle.split('-')[0],
					"DateTime": thisTime,
					"Action": "Delete assessment, Case Group Study, Group " + req.body.groupid + ", Segregation " + req.body.sid
				}}, function(err) {
					if (err) {
						throw err
						return
					}
				db.collection('Curation').update({"HGNCSymbol":req.body.symbol,"ORDOID":req.body.ordoid},{$push:{"Curators":{
						"LogName":req.cookies.Spindle.split('-')[0],
						"DateTime":thisTime,
						"Action":"Delete assessment, Case Group Study, Group " + req.body.groupid + ", Segregation " + req.body.sid
					}}},function(err) {
					if (err) {
						throw err
						return
					}
					db.collection('Curator').find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
						if (err) {
							throw err
							return
						}
						var newaction = user[0].LoginRecord.pop();
						newaction.Action.push("Delete assessment, Case Group Study, Group " + req.body.groupid + ", Segregation " + req.body.sid)
						db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]}, {$pop:{"LoginRecord":1}}, function(err) {
							if (err) {
								throw err
								return
							}
							db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]},{$push:{"LoginRecord":newaction}},
								function(err) {
								if(err) {
									throw err
									return
								}
								res.send(true)
							})
						})
					})
				})
			})
		})
	})
})

router.post('/Delete', function(req, res) {
	var db = req.db;
	var thisTime = Date().toString()
	if (req.body.item == 'segregation') {
		db.collection('CaseStudy').update({"GroupID":req.body.groupid, "Segregation.SegregationID":req.body.sid},{$set:{"Segregation.$.Active":"No"}},function(err) {
			if (err) {
					throw err
					return
			}
			db.collection('CaseStudy').update({"GroupID":req.body.groupid},{$push:{
						"Curators": req.cookies.Spindle.split('-')[0],
						"DateTime": thisTime,
						"Action": "Set Inactive at Segregation " + req.body.sid
					}
				}, function(err) {
				if (err) {
					throw err
					return
				}
				db.collection("Curation").update({"HGNCSymbol":req.body.symbol,"ORDOID":req.body.ordoid},{$push:{"Curators":{
						"LogName": req.cookies.Spindle.split('-')[0],
						"DateTime": thisTime,
						"Action": "Set Inactive at Segregation " + req.body.sid + ", Group " + req.body.groupid + ", Case Group Study"
					}}}, function(err) {
					if  (err) {
						throw err
						return
					}
					db.collection('Curator').find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
						if (err) {
							throw err
							return
						}
						var newaction = user[0].LoginRecord.pop();
						newaction.Action.push("Set Inactive at Segregation " + req.body.sid + ", Group " + req.body.groupid + ", Case Group Study")
						db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]}, {$pop:{"LoginRecord":1}}, function(err) {
							if (err) {
								throw err
								return
							}
							db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]},{$push:{"LoginRecord":newaction}},
								function(err) {
								if(err) {
									throw err
									return
								}
								res.send(true)
							})
						})
					})
				})
			})

		})
	}
	else if (req.body.item == 'variant') {
		db.collection('CaseStudy').update({"GroupID":req.body.groupid, "Segregation.SegregationID":req.body.sid}, {$set:{"Segregation.$.Variant.Active":"No"}}, function(err) {
			if (err) {
				throw err
				return
			}
			db.collection('CaseStudy').update({"GroupID":req.body.groupid}, {$push:{
					"Curators": req.cookies.Spindle.split('-')[0],
					"DateTime": thisTime,
					"Action": "Set variant Inactive at Segregation " + req.body.sid
				}}, function(err) {
				if (err) {
					throw err
					return
				}
				db.collection("Curation").update({"HGNCSymbol":req.body.symbol,"ORDOID":req.body.ordoid},{$push:{"Curators":{
						"LogName": req.cookies.Spindle.split('-')[0],
						"DateTime": thisTime,
						"Action": "Set variant Inactive at Segregation " + req.body.sid + ", Group " + req.body.groupid + ", Case Group Study"
					}}}, function(err) {
					if  (err) {
						throw err
						return
					}
					db.collection('Curator').find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
						if (err) {
							throw err
							return
						}
						var newaction = user[0].LoginRecord.pop();
						newaction.Action.push("Set variant Inactive at Segregation " + req.body.sid + ", Group " + req.body.groupid + ", Case Group Study")
						db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]}, {$pop:{"LoginRecord":1}}, function(err) {
							if (err) {
								throw err
								return
							}
							db.collection('Curator').update({"LogName":req.cookies.Spindle.split('-')[0]},{$push:{"LoginRecord":newaction}},
								function(err) {
								if(err) {
									throw err
									return
								}
								res.send(true)
							})
						})
					})
				})
			})
		})
	}
})

module.exports = router
