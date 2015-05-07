var express = require('express');
var router = express.Router();
var util = require('util')

router.get('/PMID/:pmid', function(req, res) {
	var db = req.db
	db.collection('FunctionalData').find({"PMID":{$regex:req.params.pmid, $options:"i"}, "Active":"Yes", "Variant.Active":{$ne:"Yes"}}).toArray(function(err, fData) {
		if (err) {
			throw err
			return
		}
console.log(fData.length);
		if (fData && fData.length > 0) res.send(fData)
		else res.send(false)
	})
})

router.get('/Analysis/:fid/:purpose?', function(req, res) {
	var db = req.db
	db.collection('FunctionalData').find({"AnalysisID":req.params.fid}).toArray(function(err, functionalData) {
		if (err) {
			throw err
			return
		}
		if (req.params.purpose == 'Edit') res.send(functionalData[0])
		else res.redirect('/Curations/' + functionalData[0].HGNCSymbol + '/' + functionalData[0].ORDOID + '/Functional')
	})
})

router.get('/:addnew?/:symbol/:ordoid', function(req, res) {
	var db = req.db
	db.collection('FunctionalData').find({"HGNCSymbol":req.params.symbol, "ORDOID":req.params.ordoid, "Active":"Yes"}).toArray(function(err, functionalData) {
		if (err) {
			throw err
			return
		}
		db.collection('Curation').find({"HGNCSymbol":req.params.symbol, "ORDOID":req.params.ordoid, "Active":"Yes"}).toArray(function(err, curationData) {
			if (err) {
				throw err
				return
			}
			if (functionalData && functionalData.length > 0) res.send(functionalData)
			else res.send(false)
			/*
			if (req.params.addnew == 'Addnew') res.render('functionaldata_addnew', { data:curationData[0], user:{"LogName":req.cookies.Spindle.split('-')[0] } })
			else if (functionalData && functionalData.length > 0) res.render('functionaldata', { fdata:functionalData, data:curationData[0], user:{"LogName":req.cookies.Spindle.split('-')[0] } })
			else res.render('functionaldata', { fdata:false, data:curationData[0], user:{"LogName":req.cookies.Spindle.split('-')[0] } })
			*/
		})
	})
})

router.get('/Analysis/:fid/Variant/:vid', function(req, res) {
	var db = req.db
	db.collection('FunctionalData').find({"AnalysisID":req.params.fid}).toArray(function(err, functionalData) {
		if (err) {
			throw err
			return
		}
		var the_variant
		for (var i=0; i<functionalData[0].Variant.length; i++) {
			if (functionalData[0].Variant[i].VariantID == req.params.vid) the_variant = functionalData[0].Variant[i]
		}
		res.send(the_variant)
	})
})

// Last edited at 3/26/2015 for all_tab_curation
router.post('/Addnew', function(req, res) {
	var db = req.db
	var thisTime = Date().toString()
	db.collection('FunctionalData').count(function(err, cnt) {
		if (err) {
			throw err
			return
		}
		db.collection('Disease').find({"ORDOID":req.body.ordoid}).toArray(function(err, temp) {
			if (err) {
				throw err
				return
			}
			var new_id = (parseInt(cnt)+1).toString()
			var new_data = {
				"AnalysisID": new_id,
				"HGNCSymbol": req.body.symbol,
				"ORDOID": req.body.ordoid,
				"Disease": temp[0].FullName,
				"Active": "Yes",
				"Curators": [ req.cookies.Spindle.split('-')[0] ],
				"DateTime": [ thisTime ],
				"Action": [ "Create the analysis" ],
				"PMID": req.body.pmid,
				"Type": req.body.evid_type,
				"Evidence": {},
				"Variant": []
			}
			if (new_data.Type == 'Biochemical Function') {
				new_data.Evidence.IdentifiedFunction = req.body.identifiedfunction
				new_data.Evidence.EvidenceFunction = req.body.evidencefunction
				if (req.body.geneHGNC != '') new_data.Evidence.GeneSymbol = req.body.geneHGNC
				if (req.body.shareddisease != '') new_data.Evidence.SharedDisease = req.body.shareddisease
				if (req.body.phenotype_text != '' && req.body.phenotype_text != 'free text') new_data.Evidence.Phenotype_Text = req.body.phenotype_text
				if (req.body.phenotype_hpo != '' && req.body.phenotype_hpo != 'HPO Term') {
					if (req.body.phenotype_hpo.indexOf('\r\n') > 0) new_data.Evidence.Phenotype_HPO = req.body.phenotype_hpo.split('\r\n')
					else new_data.Evidence.Phenotype_HPO = [req.body.phenotype_hpo]
				}
				if (req.body.explanation != '') new_data.Evidence.Explanation = req.body.explanation
			}
			else if (new_data.Type == 'Protein Interactions') {
				new_data.Evidence.InteractingGene = req.body.interactinggene
				new_data.Evidence.InteractionType = req.body.interactiontype
				new_data.Evidence.SimilarDisease = req.body.similardisease
				new_data.Evidence.CommentInteractingProtein = req.body.comment_interact_protein
			}
			else if (new_data.Type == 'Expression') {
				new_data.Evidence.DiseaseTissue = req.body.diseasetissue
				if (req.body.uniqueExpressed != '') new_data.Evidence.UniqueExpression = req.body.uniqueExpressed
				if (req.body.comment_normalexpression != '') new_data.Evidence.CommentNormalExpression = req.body.comment_normalexpression
				if (req.body.alteredexpression) new_data.Evidence.AlteredExpression = req.body.alteredexpression
				if (req.body.comment_alteredexpression != '') new_data.Evidence.CommentAlteredExpression = req.body.comment_alteredexpression
			}
			else if (new_data.Type == 'Gene Disruption') {
				if (req.body.experiment_patientcell) new_data.Evidence.ExperimentPatientCell = req.body.experiment_patientcell
				if (req.body.description_patientcell) new_data.Evidence.DescriptionPatientCell = req.body.description_patientcell
				if (req.body.normalfunction_geneprotein) new_data.Evidence.NormalFunctionGeneProtein = req.body.normalfunction_geneprotein
				if (req.body.evidence_altertedfunction) new_data.Evidence.EvidenceAlteredFunction = req.body.evidence_altertedfunction
			}
			db.collection('FunctionalData').save(new_data, function(err) {
				if (err) {
					throw err
					return
				}
				db.collection('Curation').update({"HGNCSymbol":req.body.symbol, "ORDOID":req.body.ordoid},{$push:{
						"Observations.FunctionalData": new_id,
						"Curators": {
							"LogName": req.cookies.Spindle.split('-')[0],
							"DateTime": thisTime,
							"Action": "Create Functional Analysis, Analysis ID " + new_id
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
						newaction.Action.push('Create Functional Analysis, Analysis ' + new_id)
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
								res.redirect('/Curations/'+req.body.symbol+'/'+req.body.ordoid+'/Functional')
							})
						})
					})
				})
			})
		})
	})
})

router.post('/Edit', function(req, res) {
	var db = req.db
	var thisTime = Date().toString()
	db.collection('FunctionalData').find({"AnalysisID":req.body.fid}).toArray(function(err, temp) {
		if (req.body.pmid != '') temp[0].PMID = req.body.pmid
		if (req.body.type != '') temp[0].Type = req.body.evid_type
		if (req.body.evid_type == 'Biochemical Function') {
			temp[0].Evidence.IdentifiedFunction = req.body.identifiedfunction
			temp[0].Evidence.EvidenceFunction = req.body.evidencefunction
			if (req.body.geneHGNC != '') temp[0].Evidence.GeneSymbol = req.body.geneHGNC
			if (req.body.shareddisease != '') temp[0].Evidence.SharedDisease = req.body.shareddisease
			if (req.body.phenotype_text != '' && req.body.phenotype_text != 'free text') temp[0].Evidence.Phenotype_Text = req.body.phenotype_text
			if (req.body.phenotype_hpo != '' && req.body.phenotype_hpo != 'HPO Term') {
				if (req.body.phenotype_hpo.indexOf('\r\n') > 0) temp[0].Evidence.Phenotype_HPO = req.body.phenotype_hpo.split('\r\n')
				else temp[0].Evidence.Phenotype_HPO = [req.body.phenotype_hpo]
			}
			if (req.body.explanation != '') temp[0].Evidence.Explanation = req.body.explanation
		}
		else if (req.body.evid_type == 'BProtein Interactions') {
			temp[0].Evidence.InteractingGene = req.body.interactinggene
			temp[0].Evidence.InteractionType = req.body.interactiontype
			temp[0].Evidence.SimilarDisease = req.body.similardisease
			temp[0].Evidence.CommentInteractingProtein = req.body.comment_interact_protein
		}
		else if (req.body.evid_type == 'Expression') {
			temp[0].Evidence.DiseaseTissue = req.body.diseasetissue
			if (req.body.uniqueExpressed != '') temp[0].Evidence.UniqueExpression = req.body.uniqueExpressed
			if (req.body.comment_normalexpression != '') temp[0].Evidence.CommentNormalExpression = req.body.comment_normalexpression
			if (req.body.alteredexpression) temp[0].Evidence.AlteredExpression = req.body.alteredexpression
			if (req.body.comment_alteredexpression != '') temp[0].Evidence.CommentAlteredExpression = req.body.comment_alteredexpression
		}
		else if (req.body.evid_type == 'Gene Disruption') {
			if (req.body.experiment_patientcell) temp[0].Evidence.ExperimentPatientCell = req.body.experiment_patientcell
			if (req.body.description_patientcell) temp[0].Evidence.DescriptionPatientCell = req.body.description_patientcell
			if (req.body.normalfunction_geneprotein) temp[0].Evidence.NormalFunctionGeneProtein = req.body.normalfunction_geneprotein
			if (req.body.evidence_altertedfunction) temp[0].Evidence.EvidenceAlteredFunction = req.body.evidence_altertedfunction
		}
		temp[0].Curators.push(req.cookies.Spindle.split('-')[0])
		temp[0].DateTime.push(thisTime)
		temp[0].Action.push("Edit the analysis")
		db.collection('FunctionalData').save(temp[0], function(err) {
			if (err) {
				throw err
				return
			}
			db.collection('Curation').update({"HGNCSymbol":req.body.symbol, "ORDOID":req.body.ordoid},{$push:{
					//"Observations.FunctionalData": req.body.fid,
					"Curators": {
						"LogName": req.cookies.Spindle.split('-')[0],
						"DateTime": thisTime,
						"Action": "Edit Functional Analysis data, Analysis " + req.body.fid
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
					newaction.Action.push('Edit Functional Analysis data, Analysis ' + req.body.fid)
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
							res.redirect('/Curations/'+req.body.symbol+'/'+req.body.ordoid+'/Functional')
							//res.redirect('/Functionaldataanalysis/Analysis/'+req.body.fid)
						})
					})
				})
			})
		})
	})
})

router.post('/Delete', function(req, res) {
	var db = req.db
	var thisTime = Date().toString()
	db.collection('FunctionalData').update({"AnalysisID":req.body.fid},{$set:{"Active":"No"}},function(err) {
		if (err) {
			throw err
			return
		}
		db.collection('FunctionalData').update({"AnalysisID":req.body.fid},{$push:{
				"Curators":req.cookies.Spindle.split('-')[0],
				"DateTime":thisTime,
				"Action":"Set Inactive at the analysis"
			}},function(err) {
			if (err) {
				throw err
				return
			}
			db.collection('Curation').find({"HGNCSymbol":req.body.symbol, "ORDOID":req.body.ordoid}).toArray(function(err, temp) {
				if (err) {
					throw err
					return
				}
				temp[0].Curators.push({
					"LogName": req.cookies.Spindle.split('-')[0],
					"DateTime": thisTime,
					"Action": "Set Inactive, Functional Data Analysis, Analysis " + req.body.fid
				})
				for (var i=0; i<temp[0].Observations.FunctionalData.length; i++) {
					if (temp[0].Observations.FunctionalData[i] == req.body.fid) {
						temp[0].Observations.FunctionalData.splice(i, 1)
						break
					}
				}
				db.collection('Curation').update({"HGNCSymbol":req.body.symbol, "ORDOID":req.body.ordoid},{$set:{
						"Curators":temp[0].Curators,
						"Observations.FunctionalData":temp[0].Observations.FunctionalData
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
						newaction.Action.push("Set Inactive, Functional Data Analysis, Analysis " + req.body.fid)
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
								res.send(true)
							})
						})
					})
				})
			})
		})
	})
})

router.post('/Associate', function(req, res) {
	var db = req.db
	var thisTime = Date().toString()

	db.collection('Variant').find({"ClinVarID":req.body.clinvarid}).toArray(function(err, vData) {
		if (err) {
			throw err
			return
		}
		db.collection('FunctionalData').update({"PMID":req.body.pmid}, {$push:{
			"Variant":{
				"VariantID":vData[0].VariantID,
				"ClinVarID":req.body.clinvarid,
				"dbSNPID":vData[0].dbSNPID,
				"VariantHGVS":vData[0].VariantHGVS,
				"Active":"Yes",
				"DateTime":thisTime
			},
			"Curators":req.cookies.Spindle.split('-')[0],
			"DateTime":thisTime,
			"Action":"Associate variant, Variant ID: " + vData[0].VariantID
			}}, function(err) {
			if (err) {
					throw err
					return
			}
			db.collection('FunctionalData').find({"PMID":req.body.pmid}).toArray(function(err, fData) {
				if (err) {
					throw err
					return
				}
				db.collection('Variant').update({"VariantID":vData[0].VariantID}, {$push:{"Association.FunctionalData":fData[0].AnalysisID}}, function(err) {
					if (err) {
						throw err
						return
					}
					db.collection('Curation').update({"HGNCSymbol":fData[0].HGNCSymbol, "ORDOID":fData[0].ORDOID},{$push:{"Curators":{
								"LogName": req.cookies.Spindle.split('-')[0],
								"DateTime": thisTime,
								"Action": "Associate variant, Variant ID: " + vData[0].VariantID + ", Functional Data Analysis: " + fData[0].AnalysisID
						}}}, function(err) {
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
							newaction.Action.push("Associate variant, Variant ID: " + vData[0].VariantID + ", Functional Data Analysis: " + fData[0].AnalysisID)
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
									res.send(true)
									//res.redirect('/Curations/'+fData[0].HGNCSymbol+'/'+fData[0].ORDOID+'/Functional')
								})
							})
						})
					})
				})
			})
		})
	})
})
router.post('/Remove', function(req, res) {
	var db = req.db
	var thisTime = Date().toString()
console.log(req.body.fid, req.body.vid)
	var vid = req.body.vid
	db.collection('FunctionalData').update({"AnalysisID":req.body.fid, "Variant.VariantID":vid}, {$set:{"Variant.$.Active":"No"}}, function(err) {
		if (err) {
			throw err
			return
		}
		db.collection('FunctionalData').update({"AnalysisID":req.body.fid}, {$push:{
				"Curators":req.cookies.Spindle.split('-')[0],
				"DateTime":thisTime,
				"Action":"Remove variant association at Variant ID " + req.body.vid
			}}, function(err) {
			if (err) {
				throw err
				return
			}
			db.collection('Variant').find({"VariantID":vid}).toArray(function(err, temp) {
				if (err) {
					throw err
					return
				}
				var functionalList = []
				for (var i = 0; i < functionalList.length; i++) {
					if (temp[0].Association.FunctionalData[i] == req.body.fid) {
						functionalList.push(temp[0].Association.FunctionalData[i])
					}
				}
				db.collection('Variant').update({"VariantID":vid}, {$set:{"Association.FunctionalData":functionalList}}, function(err) {
					if (err) {
						throw err
						return
					}
					db.collection('FunctionalData').find({"AnalysisID":req.body.fid}).toArray(function(err, fData) {
						if (err) {
							throw err
							return
						}
						db.collection('Curation').update({"HGNCSymbol":fData[0].HGNCSymbol, "ORDOID":fData[0].ORDOID},{$push:{"Curators":{
									"LogName": req.cookies.Spindle.split('-')[0],
									"DateTime": thisTime,
									"Action": "Remove variant association at Variant ID: " + req.body.vid + ", Functional Data Analysis: " + req.body.fid
							}}}, function(err) {
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
								newaction.Action.push("Remove variant association at Variant ID: " + req.body.vid + ", Functional Data Analysis: " + req.body.fid)
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
										res.send(true)
										//res.redirect('/Curations/'+fData[0].HGNCSymbol+'/'+fData[0].ORDOID+'/Functional')
									})
								})
							})
						})
					})
				})
			})
		})
	})
})

module.exports = router;
