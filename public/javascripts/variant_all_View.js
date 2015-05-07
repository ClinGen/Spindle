$(function() {

				function set_variant_box_height() {
					//alert($(window).width())
					if ($(window).width() > 1400) $("#width_buffer").css('width', $(window).width()-1300+'px')
					else $("#width_buffer").css('width', '100px')
					var h = $(window).height() - 240 + 'px'
					$("#variant_all_content_box").css('height', h)
				}
				set_variant_box_height()

				$.get('/Variants/Count', function(counts) {
					if (counts) {
						$("#clinvar_count_box").text(counts.clinvar)
						$("#dbsnp_count_box").text(counts.dbsnp)
						$("#hgvs_count_box").text(counts.hgvs)
						$("#pathogenic_count_box").text(counts.pathogenic)
					}
				})
				var data = []
				$("#id_name").on('change', function() {
					$("#id_value").val('').focus()
					$("#statistic_diagram_box").css('display', 'none')
					$("#variant_result_titles").css('display', 'none')
					$("#variant_all_content_box").css('display', 'none')
					$("#matching_all_count_box").html('&nbsp;')
					$("#filter option[value='All']").attr('selected', true)
					$("#filter_box").css('display', 'none')
					data = []
					$("#selected_id").val('')
					$("#use_selected_link").attr('title', '').css('display', 'none')
				})

				function set_htmlstr() {
					var count = 0
					var htmlstr = ''
					for (var j=0; j<data.length; j++) {
						if ($("#filter").val() == "All" || ($("#filter").val() == "Pathogenic" && data[j].ClinicalSignificance == "Pathogenic") ||
															($("#filter").val() == "NotPathogenic" && data[j].ClinicalSignificance != "Pathogenic")) {
							htmlstr += '<tr class="variant_item_lane">'
							htmlstr += '<td style="width:300px;vertical-align:top"><table style="width:100%;border-collapse:collapse">'
							htmlstr += '<tr><td colspan=2><div style="width:298px;overflow:hidden;font-weight:bold">'
							htmlstr += '<a title="' + data[j].VariantName + '" style="text-decoration:none;cursor:pointer;color:#000">'
							//var temp
							//if (data[j].VariantName.length > 43) htmlstr += data[j].VariantName.substr(0, 43) + '<br /><span style="float:right">' + data[j].VariantName.substr(43) + '</span>'
							//else
							htmlstr += data[j].VariantName
							htmlstr += '</a></div></td></tr><tr><td colspan=2></td></tr>'
							htmlstr += '<tr><td style="width:80px;text-align:right">ClinVare ID:</td><td>'
							htmlstr += '<a class="clinvarid_link" href="http://www.ncbi.nlm.nih.gov/clinvar/variation/'
							htmlstr += data[j].ClinVarSubmissionID + '" target="_blank" title="' + data[j].ClinVarID + '">' + data[j].ClinVarID + '</a></td></tr>'
							htmlstr += '<tr><td style="width:80px;text-align:right;vertical-align:top">dbSNP ID:</td><td>'
							if (data[j].dbSNPID) {
								for (var k=0; k<data[j].dbSNPID.length; k++) {
									htmlstr += '<a class="dbsnpid_link" href="http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?rs='
									htmlstr += data[j].dbSNPID[k] + '" target="_blank" title ="' + data[j].dbSNPID[k] + '">rs' + data[j].dbSNPID[k] + '</a>'
									if (k < data[j].dbSNPID.length-1) htmlstr += '<br />'
								}
							}
							htmlstr += '</td></tr>'
							htmlstr += '<tr><td style="width:80px;text-align:right;vertical-align:top">Variant Type:</td><td>' + data[j].VariantType + '</td></tr>'
							htmlstr += '<tr><td style="width:80px;text-align:right">Significance:</td><td>' + data[j].ClinicalSignificance + '</td></tr>'
							htmlstr += '<tr><td style="width:80px;text-align:right;vertical-align:top">Other Names:</td><td>'
							for (var i=0; i<data[j].OtherNames.length; i++) {
										htmlstr += data[j].OtherNames[i]
										if (i < data[j].OtherNames.length-1) htmlstr += '<br />'
							}
							htmlstr += '</td></tr>'
							htmlstr += '</table></td>'
							htmlstr += '<td style="width:350px;vertical-align:top">'
							if (data[j].VariantHGVS.length == 0) htmlstr += '&nbsp;'
							else {
								htmlstr += '<div class="overflow_box" style="width:350px;height:140px;overflow:auto">'
								for (var i=0; i<data[j].VariantHGVS.length; i++) {
									var hgvs_lower = data[j].VariantHGVS[i].toLowerCase()
									var input_lower = $("#id_value").val().toLowerCase()
									var temp = ''
									if ($("#id_name").val() == 'VariantHGVS' && hgvs_lower.indexOf(input_lower) > -1) {
										var start_index = hgvs_lower.indexOf(input_lower)
										var keyword_length = $("#id_value").val().length
										//var total_length = data[j].VariantHGVS[i].length
										temp += data[j].VariantHGVS[i].substr(0, start_index) + '<span style="color:red">'
										temp += data[j].VariantHGVS[i].substr(start_index, keyword_length) + '</span>'
										temp += data[j].VariantHGVS[i].substr(start_index+keyword_length)
									}
									else temp += data[j].VariantHGVS[i]
									htmlstr += temp
									temp = ''
									if (i < data[j].VariantHGVS.length-1) htmlstr += '<br />'
								}
								htmlstr += '</div>'
							}
							htmlstr += '</td><td style="width:200px;vertical-align:top">'
							for (var i=0; i<data[j].Conditions.length; i++) {
										htmlstr += '<span>' + data[j].Conditions[i].Term + '</span>'
										if (i < data[j].Conditions.length-1) htmlstr += '<br />'
							}
							htmlstr += '</td>'
							htmlstr += '<td style="width:250px;vertical-align:top"><table style="width:100%;border-collapse:collapse" border=0>'
							htmlstr += '<tr><td style="width:80px;text-align:right;vertical-align:top">Cytogenetic<br />Location:</td>'
							htmlstr += '<td style="vertical-align:top">' + data[j].CytogeneticLocation[0] + '</td></tr><tr><td></td></tr>'
							htmlstr += '<tr><td style="text-align:right;vertical-align:top">Genomic<br />Location:</td><td style="vertical-align:top">'
							for (var i=0; i<data[j].GenomicLocation.length; i++) {
									htmlstr += 'Chr' + data[j].GenomicLocation[i].Chr + ':' + data[j].GenomicLocation[i].Start
									htmlstr += '[' + data[j].GenomicLocation[i].Assembly + ']'
										if (i < data[j].GenomicLocation.length-1) htmlstr += '<br />'
							}
							htmlstr += '</td></tr><tr><td></td></tr>'
							htmlstr += '<tr><td style="text-align:right;vertical-align:top">Molecular<br />Consequence:</td><td style="vertical-align:top">'
							htmlstr += '<table style="margin:0;padding:0;border:none;border-collapse:collapse" cellpadding=0 cellspacing=0><tr><td style="vertical-align:top">'
							htmlstr += '<div class="overflow_box" style="width:170px;overflow-x:auto">'
							var temp_temp = ''
							for (var i=0; i<data[j].MolecularConsequence.length; i++) {
								if (i%3 == 0) {
									temp_temp += data[j].MolecularConsequence[i]
								}
								else if (i%3 == 1) {
									temp_temp += ' ' + data[j].MolecularConsequence[i].split('@')[0]
								}
								else if (i%3 == 2) {
									htmlstr += data[j].MolecularConsequence[i].split('@')[0] + ':<br />' + temp_temp
									temp_temp = ''
									if (i < data[j].MolecularConsequence.length-1) htmlstr += '<br />'
								}
							}
							htmlstr += '</td></tr></table></td></tr></table></td>'
							htmlstr += '<td style="width:120px;text-align:center;vertical-align:top">'
							if (data[j].GeneSymbols.length > 10) htmlstr += '<div class="overflow_box" style="width:100%;height:140px;overflow:auto">'
							for (var i=0; i<data[j].GeneSymbols.length; i++) {
								var gene_lower = data[j].GeneSymbols[i].Symbol.toLowerCase()
								var input_lower = $("#id_value").val().toLowerCase()
								if ($("#id_name").val() == 'Gene' && gene_lower.indexOf(input_lower) > -1) {
									var start_index = gene_lower.indexOf(input_lower)
									var keyword_length = $("#id_value").val().length
									htmlstr += data[j].GeneSymbols[i].Symbol.substr(0, start_index) + '<span style="color:red">' + data[j].GeneSymbols[i].Symbol.substr(start_index, keyword_length) + '</span>'
									htmlstr += data[j].GeneSymbols[i].Symbol.substr(start_index+keyword_length)
								}
								else htmlstr += data[j].GeneSymbols[i].Symbol
								if (i < data[j].GeneSymbols.length-1) htmlstr += '<br />'
							}
							//if (data[j].GeneSymbols.length > 10) htmlstr += '<br /><span style="font-style:italic">' + (data[j].GeneSymbols.length-10) + ' more.</span>'
							if (data[j].GeneSymbols.length > 10) htmlstr += '</div>'
							htmlstr += '</td></tr>'
							htmlstr += '<tr><td colspan=8><hr style="width:96%;height:1px;align:center;border:0 none;color:#eee;background-color:#eee" /></td></tr>'
							count += 1
						}
					}
					$("#matching_all_count_box").html('# of Matching: '+count)
					$("#variant_result_titles").css('display', 'block')
					$("#variant_all_content_box").css('background-color', '#fff')
					$("#filter_box").css('display', 'block')
					return htmlstr
				}

				$("#id_value")
				.on('focus', function() {
					$("#statistic_diagram_box").css('display', 'none')
				})
				.on('input', function() {
					if (/[^A-Za-z0-9_\.\s\-]/.test($(this).val())) {
						alert('Please enter letter, digit, . or _ only.')
						return
					}
					var search = false
					if ($("#id_name").val() == 'ClinVarID') {
						if ($(this).val() != '' && !/^[R][C]{0,1}[V]{0,1}|[r][c]{0,1}[v]{0,1}\d*$/.test($(this).val()) && !/^\d*$/.test($(this).val())) alert('Format error.')
						//else if (/^(RVC)|(rvc)\d*[1-9][0-9]{3}/.test($(this).val()) || /[1-9][0-9]{3}/.test($(this).val())) search = true
						else if (/[1-9][0-9]{3}/.test($(this).val()) || /[0]{3}[1-9]$/.test($(this).val()) || /[0]{2}[1-9][0-9]$/.test($(this).val()) || /[0][1-9][0-9]{2}/.test($(this).val())) search = true
					}
					else if ($("#id_name").val() == 'dbSNPID') {
						if ($(this).val() != '' && (/^[r][s]/.test($(this).val()) || /^\d/.test($(this).val())) && /[1-9][0-9]{3}/.test($(this).val())) search = true
						else if ($(this).val() != '' && !/^[r][s]*\d*$/.test($(this).val()) && !/^\d+$/.test($(this).val())) alert('Format error.')
					}
					else if ($("#id_name").val() == 'VariantHGVS') {
						if (/[1-9]\w{4}/.test($(this).val())) search = true
						else if (/\w+\.\w+\:\w+\.\w+/.test($(this).val())) search = true
						else if (/[a-z]\.\w{5}/.test($(this).val())) search = true
						else if (/\D{5}/.test($(this).val())) search = true
						else search = false
					}
					else if ($("#id_name").val() == 'Disease') {
						if ($(this).val().length > 3) search = true
					}
					else if ($("#id_name").val() == 'Gene') {
						if ($(this).val().length > 3) search = true
					}
					if (search) {
						var search_key
						if ($("#id_name").val() == 'dbSNPID' && /^(rs)/.test($("#id_value").val())) search_key = $("#id_value").val().replace('rs', '')
						else search_key = $("#id_value").val()
						var url = '/Variants/' + $("#id_name").val() + '/' + search_key
						var htmlstr
						$.get(url, function(vdata) {
							var max_to_present = 500
							if (vdata && vdata.length <= max_to_present) {
								data = vdata
								//htmlstr = '<table id="db_data_table" style="font-size:11px;border-collapse:collapse;width:' + $("#title_table").css('width') + '" border=0>'
								htmlstr += set_htmlstr()
							}
							else if (vdata.length > max_to_present) {
								$("#variant_result_titles").css('display', 'none')
								htmlstr = '<tr><td style="color:red;font-size:14px">Too many (' + vdata.length + ') variants to present. Enter more key words to nerrow dowm.</td></tr>'
								$("#variant_all_content_box").css('background-color', '#f0f0f0')
								$("#matching_all_count_box").html('# of Matching: '+vdata.length)
								$("#filter_box").css('display', 'none')
							}
							else {
								$("#variant_result_titles").css('display', 'none')
								htmlstr = '<tr><td style="color:red;font-size:14px">No DB data matching your input. Try again.</td></tr>'
								$("#variant_all_content_box").css('background-color', '#f0f0f0')
								$("#matching_all_count_box").html('# of Matching: 0')
								$("#filter_box").css('display', 'none')
							}
							$("#variant_all_content_box").css('display', 'block')
							$("#db_data_table").html(htmlstr)
							$("#db_data_table").css('width', $("#title_table").css('width'))

							var title_table_width = parseInt($("#title_table").css('width').replace('px', ''))
							var data_table_width = parseInt($("#db_data_table").css('width').replace('px', ''))
							if (vdata.length > 0 && vdata.length <= max_to_present && title_table_width < data_table_width) {
								$("#title_table").css('width', (data_table_width-2)+'px')
								$("#summary_table").css('width', (data_table_width-2)+'px')
								$("#variant_all_content_box").css('width', (data_table_width+20)+'px')
								//$(".overflow_box").each(function() {
								//	$(this).css('overflow', 'auto')
								//})
							}
							else if (vdata.length > 0 && vdata.length <= max_to_present) {
								$("#db_data_table").css('width', (title_table_width+2)+'px')
								$("#summary_table").css('width', (title_table_width+2)+'px')
								$("#variant_all_content_box").css('width', (title_table_width+22)+'px')
								//$(".overflow_box").each(function() {
								//	$(this).css('overflow', 'auto')
								//})
							}
							else $("#summary_table").css('width', '1000px')

						})
					}
					else {
						$("#variant_result_titles").css('display', 'none')
						$("#variant_all_content_box").css('display', 'none')
						$("#matching_all_count_box").html('&nbsp;')
						$("#filter_box").css('display', 'none')
						data = []
						$("#db_data_table").html('')
						$("#use_selected_link").css('display', 'none')
					}
				})

				$("#filter").on('change', function() {
					if (data.length > 0) {
						var htmlstr = set_htmlstr()
						$("#variant_all_content_box").css('display', 'block')
						$("#use_selected_link_box").css('display', 'none')
						$("#statistic_diagram_box").css('display', 'none')
						$("#selected_id").val('')
						$("#db_data_table").html(htmlstr)
						$("#db_data_table").css('width', $("#title_table").css('width'))
						$("#summary_table").css('width', $("#title_table").css('width'))
						var title_table_width = parseInt($("#title_table").css('width').substr(0,4))
						var data_table_width = parseInt($("#db_data_table").css('width').substr(0,4))
						if (title_table_width < data_table_width) {
							$("#title_table").css('width', (data_table_width-2)+'px')
							$("#summary_table").css('width', (data_table_width-2)+'px')
							$("#variant_all_content_box").css('width', (data_table_width+20)+'px')
						}
						else {
							$("#db_data_table").css('width', (title_table_width+2)+'px')
							$("#summary_table").css('width', (title_table_width+2)+'px')
							$("#variant_all_content_box").css('width', (title_table_width+22)+'px')
						}
						//$(".overflow_box").each(function() {
						//	$(this).css('overflow', 'auto')
						//})
					}
				})

				$("#db_data_table")
				.on('mouseover', 'tr.variant_item_lane', function() {
					if ($(this).css('background-color') == 'rgba(0, 0, 0, 0)' || $(this).css('background-color') == 'rgb(255, 255, 255)') {
						$(this).css('background-color','#cef')
					}
				})
				.on('mouseout', 'tr.variant_item_lane', function() {
					if ($(this).css('background-color') == 'rgb(204, 238, 255)') $(this).css('background-color', '#fff')
				})
				.on('click', 'tr.variant_item_lane', function(e) {
					var this_obj = $(this)
					if (this_obj.css('background-color') != 'rgb(238, 238, 153)') { //#ee9
						var multiple_selected = false
						if (!e.altKey) {
							$("tr.variant_item_lane").each(function() {
								$(this).css('background-color', '#fff')
							})
						}
						else multiple_selected = true
						this_obj.css('background-color', '#ee9')
						if ($("#selected_id").val().indexOf(this_obj.find("a.clinvarid_link").attr('title')) == -1) {
							var temp = ''
							if (multiple_selected) temp += $("#selected_id").val() + ','
							temp += this_obj.find("a.clinvarid_link").attr('title') + '/' + this_obj.find("a.dbsnpid_link").attr('title')
							$("#selected_id").val(temp)
						}
						$("#use_selected_link").attr('title', $("#selected_id").val()).css('display', 'block')
					}
					else {
						var str = $("#selected_id").val()
						var temp = this_obj.find("a.clinvarid_link").attr('title') + '/' + this_obj.find("a.dbsnpid_link").attr('title')
						//alert(temp+', '+)
						$("#selected_id").val(str.replace(temp, ''))
						if ($("#selected_id").val().indexOf(',,')) {
							str = $("#selected_id").val()
							$("#selected_id").val(str.replace(',,', ','))
						}
						if (/^\,/.test($("#selected_id").val()) || /\,$/.test($("#selected_id").val())) {
							str = $("#selected_id").val()
							$("#selected_id").val(str.replace(',', ''))
						}
						if ($("#selected_id").val() == '') $("#use_selected_link").attr('title', '').css('display', 'none')
						this_obj.css('background-color', '#cef')
					}

					if ($("#associate_box").css('display') == 'none') {
						$("#target_id").val('')
						$("#associate_submit_button").css('display', 'none')
					}
				})

				$("#use_selected_link").on('click', function() {
					//alert($("#selected_id").val())
					$("#associate_box").css('display', 'block')
					var variant_list
					if ($("#selected_id").val().indexOf(',') == -1) variant_list = $("#selected_id").val()
					else variant_list = $("#selected_id").val().split(',')[0]
					var temp = variant_list.split('/')
					var id_str = 'ClinVar ID ('+temp[0]+')<br />dbSNP ID ('
					if (temp[1] != 'undefined') id_str += 'rs' + temp[1]
					id_str += ')'
					$("#associate_id_box").html(id_str)

					$("#target_id").val('')
					$("#associate_submit_button").css('display', 'none')
				})

				$("#associate_box_close_link").on('click', function() {
					$("#associate_box").css('display', 'none')
					$("#pmid_ajax_data_box").html('').css('display', 'none')
					$("#associate_submit_button").css('display', 'none')
				})

				$("#associate_target").on('change', function() {
					$("#target_id").val('Enter PMID').css('color', 'grey')
					$("#pmid_ajax_data_box").html('').css('display', 'none')
					$("#associate_submit_button").css('display', 'none')
				})

				$("#target_id")
				.on('focus', function() {
					if ($(this).val() == 'Enter PMID') $(this).val('').css('color', '#000')
				})
				.on('blur', function() {
					if ($(this).val() == '') $(this).val('Enter PMID').css('color', 'grey')
				})
				.on('input', function() {
					if (!/^\d+$/.test($(this).val()) && $(this).val() != '') alert('Please enter digit only.')
					else if ($(this).val().length > 0) {
						var url = ''
						if ($("#associate_target").val() == 'FunctionalData') url = '/Functionaldataanalysis/PMID/' + $("#target_id").val()
						$.get(url, function(pData) {
							if (pData) {
								//alert(pData.length)
								var htmlstr = '<table style="border-collapse:collapse;border:none;font-size:11px">'
								//htmlstr += '<tr><td>' + pData.length + '</td></tr>'
								for (var i=0; i<pData.length; i++) {
									htmlstr += '<tr class="pdata_lane" style="cursor:pointer"><td>PMID: <a title="' + pData[i].PMID + '" style="color:#000">' + pData[i].PMID + '</a><br />'
									htmlstr += pData[i].HGNCSymbol + ' <span style="font-size:14px;font-weight:bold">:</span> ' + pData[i].Disease + '</td></tr>'
									htmlstr += '<tr><td>&nbsp;</td></tr>'
								}
								htmlstr += '</table>'
								$("#pmid_ajax_data_box").html(htmlstr).css('display', 'block')
							}
							else {
								$("#pmid_ajax_data_box").css('display', 'none')
							}
						})
					}
					else {
						$("#pmid_ajax_data_box").html('').css('display', 'none')
						$("#associate_submit_button").css('display', 'none')
					}
				})

				var pmid_ajax_data_box_bgcolor
				$("#pmid_ajax_data_box")
				.on('mouseover', 'tr.pdata_lane', function() {
					pmid_ajax_data_box_bgcolor = $(this).css('background-color')
					$(this).css('background-color', '#cef')
				})
				.on('mouseout', 'tr.pdata_lane', function() {
					$(this).css('background-color', pmid_ajax_data_box_bgcolor)
				})
				.on('click', 'tr.pdata_lane', function() {
					$("#target_id").val($(this).find('a').attr('title')).css('color', '#000')
					$("#pmid_ajax_data_box").css('display', 'none')
					$("#associate_submit_button").css('display', 'block')
				})

				$("#associate_submit_button").on('click', function() {
					var clinvarid
					if ($("#selected_id").val().indexOf(',') == -1) clinvarid = $("#selected_id").val().split('/')[0]
					else clinvarid = $("#selected_id").val().split(',')[0].split('/')[0]
					var url
					if ($("#associate_target").val() == 'CaseGroup') url = '/Casegroupstudy/Associate'
					else if ($("#associate_target").val() == 'CaseControl') url = '/Casecontrolstudy/Associate'
					else if ($("#associate_target").val() == 'FunctionalData') url = '/Functionaldataanalysis/Associate'
					var input_data = {
						"pmid": $("#target_id").val(),
						"clinvarid": clinvarid
					}
					$.post(url, input_data, function(status) {
						if (status) {
							$("#target_id").val('')
							$("#associate_submit_button").css('display', 'none')
							$("#associate_box").css('display', 'none')
							alert('Variant successfully associated.')
						}
						else alert('Failed to associate variant')
					})
				})

				$(window).resize(function() {
					set_variant_box_height()
					if (data.length > 0) {
						var htmlstr = set_htmlstr()
						$("#variant_all_content_box").css('display', 'block')
						$("#db_data_table").html(htmlstr)
						$("#db_data_table").css('width', $("#title_table").css('width'))
						$("#summary_table").css('width', $("#title_table").css('width'))
						var title_table_width = parseInt($("#title_table").css('width').substr(0,4))
						var data_table_width = parseInt($("#db_data_table").css('width').substr(0,4))
						if (title_table_width < data_table_width) {
							$("#title_table").css('width', (data_table_width-2)+'px')
							$("#summary_table").css('width', $("#db_data_table").css('width'))
							$("#variant_all_content_box").css('width', (title_table_width+20)+'px')
						}
						else {
							$("#db_data_table").css('width', (title_table_width+2)+'px')
							$("#variant_all_content_box").css('width', (title_table_width+22)+'px')
						}
						//$(".overflow_box").each(function() {
						//	$(this).css('overflow', 'auto')
						//})
					}
				})
})
