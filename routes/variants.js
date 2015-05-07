var express = require('express')
var router = express.Router()
var util = require('util')
//var request = require('request')
//var cheerio = require('cheerio')
var http = require("http")

router.get('/', function(req, res) {
	res.render('variant_all', {user:{LogName:req.cookies.Spindle.split('-')[0]}})
})

router.get('/Count', function(req, res) {
	var db = req.db
	db.collection('Variant').count({"Active":"Yes"}, function(err, clinvarCount) {
		if (err) {
			throw err
			return
		}
		db.collection('Variant').count({"dbSNPID":{$exists:true}, $where:"this.dbSNPID.length>0"}, function(err, dbsnpCount) {
			if (err) {
				throw err
				return
			}
			db.collection('Variant').count({"VariantHGVS":{$ne:[]}}, function(err, hgvsCount) {
				if (err) {
					throw err
					return
				}
				db.collection('Variant').count({"ClinicalSignificance":"Pathogenic"}, function(err, pathogenicCount) {
					if (err) {
						throw err
						return
					}
					res.send({clinvar:clinvarCount, dbsnp:dbsnpCount, hgvs:hgvsCount, pathogenic:pathogenicCount})
				})
			})
		})
	})
})

// get vatiants ids for ajax request
router.get('/:id_name/:id_value', function(req, res) {
	var db = req.db
	if (req.params.id_name == 'VariantID') {
		db.collection('Variant').find({"VariantID":req.params.id_value}).toArray(function(err, vData) {
			if (err) {
				throw err
				return false
			}
			if (vData.length > 0) res.send(vData[0])
			else res.send(false)
		})
	}
	else {
		//var pttn = '^' + req.params.id_value
		var pttn = req.params.id_value
		if (req.params.id_name == 'ClinVarID') {
			if (/^0+/.test(req.params.id_value)) pttn += '$'
			db.collection('Variant').find({"ClinVarID":{$regex:pttn, $options:"i"}}).toArray(function(err, vData) {
				if (err) {
					throw err
					return false
				}
				if (vData && vData.length>0) res.send(vData)
				else res.send(false)
			})
		}
		else if (req.params.id_name == 'dbSNPID') {
			db.collection('Variant').find({"dbSNPID":{$regex:pttn, $options:"i"}}).toArray(function(err, vData) {
				if (err) {
					throw err
					return false
				}
				if (vData && vData.length>0) res.send(vData)
				else res.send(false)
			})
		}
		else if (req.params.id_name == 'VariantHGVS') {
			db.collection('Variant').find({"VariantHGVS":{$regex:pttn, $options:"i"}}).toArray(function(err, vData) {
				if (err) {
					throw err
					return false
				}
				if (vData && vData.length>0) res.send(vData)
				else res.send(false)
			})
		}
		else if (req.params.id_name == 'Disease') {
			db.collection('Variant').find({"Conditions.Term":{$regex:pttn, $options:"i"}}).toArray(function(err, vData) {
				if (err) {
					throw err
					return false
				}
				if (vData && vData.length>0) res.send(vData)
				else res.send(false)
			})
		}
		else if (req.params.id_name == 'Gene') {
			db.collection('Variant').find({"GeneSymbols":{$regex:pttn, $options:"i"}}).toArray(function(err, vData) {
				if (err) {
					throw err
					return false
				}
				if (vData && vData.length>0) res.send(vData)
				else res.send(false)
			})
		}
	 }
})

router.get('/Statistics/:item?/:value?', function(req, res) {
	var db = req.db
	if (req.params.item == 'Disease') {
		db.collection('Variant').find({}, {"Conditions":1}).toArray(function(err, temp) {
			if (err) {
				throw err
				return
			}
			var multi_condition_count = 0
			var conditions = []
			for (var i=0; i<temp.length; i++) {
				if (temp[i].Conditions.length > 1) multi_condition_count += 1
				/*var not_in = true
				for (var j=0; j<conditions.length; j++) {
					if (conditions[j] == temp[i].Conditions[0].Term) {
						not_in = false
						break
					}
				}
				if (not_in) conditions.push(temp[i].)*/
			}
			res.send(multi_condition_count)
		})
	}

})
/*
router.get('/Addnew/:item/:id', function(req, res) {
	var db = req.db
	var url
	if (req.params.item == 'dbSNPID') url = 'http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?searchType=adhoc_search&type=rs&rs=' + req.params.id
	//else if (req.params.item == 'HGVS') url = ''

	request(url, function (error, resp, body) {
		if (!error && resp.statusCode == 200) {
			var new_data = {
				"dbSNPID": req.params.id,
				"VariantHGVS": [],
				"ClinicalSignificance": '',
				"VariantType": ''
			}
			var $ = cheerio.load(body)
			var td = $('td')
			var li = $('li')

			for (var i=0; i<li.length; i++) {
				new_data.VariantHGVS.push(li[i].children[0].data)
			}

			td.each(function (index, ele) {
				if ($(this).text().indexOf('Variation Class') > -1) {
console.log(index);
console.log()
				}
			})
			for (var i=0; i<td.length; i++) {
				if (td[i].children[0].data.indexOf('Variation Class') > -1) new_data.VariantHGVS = td[i+1].children[0].data
				else if (td[i].children[0].data.indexOf('Clinical Significance') > -1) new_data.ClinicalSignificance = td[i+1].children[0].data
			}

			res.send(new_data)
		}
	})
})


router.post('/Addnew', function(req, res) {
	var db = req.db
	db.Variant.count(function(err, count) {
		if (err) {
			throw err
			return
		}
		var new_data = {
			"VariantID": (count+1).toString(),
			"dbSNPID": req.body.dbsnpid,
			"VariantHGVS": req.body.hgvs,
			"VariantType": req.body.varianttype,
			"ClinicalSignificance": req.body.clinicalsignif,
			"CytogeneticLocation": req.body.cytolocatioin,
			"GenomicLocation": [
				{
					"Start":req.body.38start,
					"Chr":req.body.38chr,
					"Stop":
					"Assembly":
				}
				{
					"Start":req.bpody.37start,
					"Chr":req.body.37chr,
					"Stop":
					"Assembly":
				}
			]
			"MolecularConsequence": req.body.molecularconsqu,


		}
	})

})
*/
module.exports = router
