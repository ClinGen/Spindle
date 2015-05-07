/*
	Function to get data from db
	Input args:
		params = {
			db: req.db,
			collection: string (Curator | Curation | CaseStudy | CaseControlStudy | ...),
			Items: string ()
			Value: [string, string, ...]

		}

 */

module.exports = function(params) {
	var db = params.db.collection(params.Collection)
	//var err
	var returnData
	if (params.Item == 'HGNCSymbol+ORDOID') {
		db.find({"HGNCSymbol":params.Value[0], "ORDOID":params.Value[1]}).toArray(function(err, data) {
			if (err) return console.log(err)
				return
//console.log("db_find output:", data[0].Curators[0].LogName)
			returnData = data
		})
	}
	else if (params.Item == 'CaseStudyID') {
		db.find({"CaseStudyID":params.Value[0]}).toArray(function(err, data) {
			if (err) {
				console.log(err)
				return
			}
			returnData = data
		})
	}
	else if (params.Item == 'LogName') {
		db.find({"LogName":params.Value[0]}).toArray(function(err, data) {
			if (err) {
				console.log(err)
				return
			}
			returnData = data
		})
	}
console.log("db_find data out:", returnData.length)
	return returnData
}
