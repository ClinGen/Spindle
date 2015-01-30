// Jquery
		$(document).ready(function() {
			$("#diseases_link").css("text-decoration", "none");
			$("#summarydataboard").css('display','block');
			$("#toplinks").css('display', 'block');
			$("#searchbutton").click(function() {
				if ($("#idValue").val() === "") {
					alert('Enter a search parameter');
					$("#idValue").focus();
				}
				else {
					//$('#idValue').valu() = req.params.idValue.replace(/(^\s*)|(\s*$)/g, '');
					var url = "/diseases/" + $("#idType").val() + "/" + $("#idValue").val().replace(/(^\s*)|(\s*$)/g, '');
					$.get(url, function(data, status) {
						if (status === 'success') {
							//alert(data.disData[0].FullName.toLowerCase());
							$("#reporttitle").html('<span> ORDO records matched: ' + data.disData.length + '</span>');
							$("#reporttitle").css("display", "block");

							//if (data.idType == 'FullName+Synonym') {
								var lowerIdValue = data.idValue.toLowerCase();
								var htmlstr = '';
								for (var i=0; i<data.disData.length; i++) {
									var n = i+ 1;
									htmlstr += '<tr class="odd" style="height:25px"><td rowspan="5" width="30px" align="center">' + n + '</td><td style="font-weight:bold">Disease Name</td><td style="font-weight:bold">';
									var lowerItem = data.disData[i].FullName.toLowerCase();
									var tempstr = '';
									if (data.idType == 'FullName+Synonym' && lowerItem.indexOf(lowerIdValue) == 0) {
										tempstr = lowerIdValue.substring(0,1).toUpperCase() + lowerIdValue.substring(1);
										tempstr = '<span style="color:red">'+ tempstr + '</span>' + lowerItem.substring(lowerIdValue.length, lowerItem.length);
									}
									else if (data.idType == 'FullName+Synonym' && lowerItem.indexOf(lowerIdValue) > 0) {
										tempstr = data.disData[i].FullName.replace(lowerIdValue, '<span style="color:red">'+lowerIdValue+'</span>');
										tempstr = tempstr.substring(0,1).toUpperCase() + tempstr.substring(1,tempstr.length);
									}
									else {
										tempstr = data.disData[i].FullName;
									}
									htmlstr += tempstr + '</td></tr><tr class="followcontent"><td style="margin-Right:20px">Synonym(s)</td><td>';
									tempstr = '';
									for (var k=0; k<data.disData[i].Synonym.length; k++) {
										var temptempstr = '';
										lowerItem = data.disData[i].Synonym[k].toLowerCase();
										if (data.idType == 'FullName+Synonym' && lowerItem.indexOf(lowerIdValue) == 0) { // match at the 1st letter
											temptempstr = lowerIdValue.substring(0,1).toUpperCase() + lowerIdValue.substring(1);
											temptempstr = '<span style="color:red">'+ temptempstr + '</span>' + lowerItem.substring(lowerIdValue.length, lowerItem.length);
										}
										else if (data.idType == 'FullName+Synonym' && lowerItem.indexOf(lowerIdValue) > 0) {
											temptempstr = data.disData[i].Synonym[k].replace(lowerIdValue, '<span style="color:red">'+lowerIdValue+'</span>');
											temptempstr = temptempstr.substring(0,1).toUpperCase() + temptempstr.substring(1,temptempstr.length);
										}
										else {
											temptempstr = data.disData[i].Synonym[k];
										}
										tempstr += temptempstr;
										if (k < data.disData[i].Synonym.length) tempstr += '<br />'; // separate multiple synonyms
										//tempstr += ", " + data.disData[i].Synonym.length;
									}
									/*
									lowerItem = data.disData[i].Synonym.toLowerCase();
									if (lowerItem.indexOf(lowerIdValue) == 0) {
										tempstr = lowerIdValue.substring(0,1).toUpperCase() + lowerIdValue.substring(1);
										tempstr = '<span style="color:red">'+ tempstr + '</span>' + lowerItem.substring(lowerIdValue.length, lowerItem.length);
									}
									else if (lowerItem.indexOf(lowerIdValue) > 0) {
										tempstr = data.disData[i].Synonym.replace(lowerIdValue, '<span style="color:red">'+lowerIdValue+'</span>');
										tempstr = tempstr.substring(0,1).toUpperCase() + tempstr.substring(1,tempstr.length);
									}
									else {
										tempstr = data.disData[i].Synonym;
									}
									*/
									htmlstr += tempstr + '</td></tr>';
									htmlstr += '<tr class="followcontent"><td>ORDO ID</td><td><a style="display:block" target="_blank" href="http://www.orpha.net/consor/cgi-bin/OC_Exp.php?lng=EN&Expert=' + data.disData[i].ORDOID + '">' + data.disData[i].ORDOID + '</a></td></tr>';
									htmlstr += '<tr class="followcontent"><td>OMIM ID</td><td>';

									for (var j=0; j < data.disData[i].OMIMID.length; j++) {
										htmlstr += '<a target="_blank" href="http://omim.org/entry/"' + data.disData[i].OMIMID[j] + '>' + data.disData[i].OMIMID[j] + '</a>';
										if (j < data.disData[i].OMIMID.length-1) htmlstr += ';  ';
									}
									htmlstr += '</td></tr>';
									htmlstr += '<tr class="followcontent"><td>Type</td><td>' + data.disData[i].Type + '</td></tr>';
									htmlstr += '<tr><td colspan="2">&nbsp;</td></tr>';
								}
							//}
							//else {

							//}
							$("#databoard").html(htmlstr);
							$("#idValue").val(data.idValue);
						}
						else $("#databoard").html('<tr><td style="font-size:125%; color:red">Failed to get data from db.</td></tr>');
					});
				}
			});
		});
