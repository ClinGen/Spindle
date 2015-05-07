$(document).ready(function() {
			var w = $(window).width() - 100
			var h = $(window).height() - 220
			$("#summary_table").css('width', w+'px')
			$("#gene_data_box").css({'width': w+'px', 'height': h+'px'})

			$.get('/Genes/Count', function(counts) {
				if (counts) {
					var temp = counts.total + ' ' + $("#total_gene_count_box").text()
					$("#total_gene_count_box").text(temp)
					$("#overall_count_box").html(counts.approved)
					$("#seudo_count_box").html(counts.seudo)
					$("#protein_product_count_box").html(counts.protein)
					$("#rna_count_box").html(counts.rna)
				}
			})

			var data
			function set_htmlstr() {
				var htmlstr = ''
				var match_count = 0
				for (var i=0; i<data.length; i++) {
					var set_it = false
					if ($("#status_filter").val() == 'All' && $("#locusgroup_filter").val() == 'All') set_it = true
					else if ($("#status_filter").val() == 'All') {
						if ($("#locusgroup_filter").val() == 'protein-coding gene' && data[i].LocusGroup == 'protein-coding gene') set_it = true
						else if ($("#locusgroup_filter").val() == 'non-coding RNA' && data[i].LocusGroup == 'non-coding RNA') set_it = true
						else if ($("#locusgroup_filter").val() == 'pseudogene' && data[i].LocusGroup == 'pseudogene') set_it = true
						else if ($("#locusgroup_filter").val() == 'others' && data[i].LocusGroup != 'protein-coding gene'
									 && data[i].LocusGroup != 'non-coding RNA' && data[i].LocusGroup != 'pseudogene') set_it = true
					}
					else if ($("#locusgroup_filter").val() == 'All') {
						if ($("#status_filter").val() == 'Approved' && data[i].HGNCStatus == 'Approved') set_it = true
						else if ($("#status_filter").val() == 'others' && data[i].HGNCStatus != 'Approved') set_it = true
					}
					else if ($("#locusgroup_filter").val() == 'others' && $("#status_filter").val() == 'others') {
						if (data[i].LocusGroup != 'protein-coding gene' && data[i].LocusGroup != 'non-coding RNA' && data[i].LocusGroup != 'pseudogene'
							 && data[i].HGNCStatus != 'Approved') set_it = true
					}
					else if ($("#locusgroup_filter").val() == 'others' && data[i].LocusGroup != 'protein-coding gene' && data[i].LocusGroup != 'non-coding RNA'
							 && data[i].LocusGroup != 'pseudogene' && $("#status_filter").val() == data[i].HGNCStatus) set_it = true
					else if ($("#status_filter").val() == 'others' && data[i].HGNCStatus != 'Approved' && $("#locusgroup_filter").val() == data[i].LocusGroup) set_it = true
					else if ($("#status_filter").val() == data[i].HGNCStatus && $("#locusgroup_filter").val() == data[i].LocusGroup) set_it = true
					if (set_it) {
						htmlstr += '<tr class="gene_lane"><td style="width:300px;vertical-align:top"><table>'
						htmlstr += '<tr><td>Gene Symbol:</td><td><a class="symbol_td" href="http://www.genenames.org/cgi-bin/gene_symbol_report?hgnc_id=' + data[i].HGNCID
						htmlstr += '" target="_blank">' + data[i].HGNCSymbol + '</a></td></tr>'
						htmlstr += '<tr><td style="vertical-align:top">Synonyms:</td><td>'
						for (var j=0; j<data[i].Synonyms.length; j++) {
							htmlstr += data[i].Synonyms[j]
							if (j<data[i].Synonyms.length-1) htmlstr += '<br />'
						}
						htmlstr += '</td></tr>'
						htmlstr += '<tr><td style="vertical-align:top">HGNC Status:</td><td>' + data[i].HGNCStatus + '</td></tr>'
						htmlstr += '<tr><td>Locus Group:</td><td>' + data[i].LocusGroup + '</td></tr>'
						htmlstr += '<tr><td>Chromosome:</td><td>' + data[i].Chromosome + '</td></tr>'
						htmlstr += '</table></td><td style="vertical-align:top"><table style="font-size:11px">'
						htmlstr += '<tr><td style="text-align:right">Gene Name:</td><td>' + data[i].HGNCName + '</td></tr>'
						htmlstr += '<tr><td style="text-align:right">Name Synonyms:</td><td>' + data[i].NameSynonyms + '</td></tr>'
						htmlstr += '<tr><td style="text-align:right">EntrezID:</td><td>'
						var temp = data[i].EntrezID.split(', ')
						for (var j=0; j<temp.length; j++) {
							htmlstr += '<a href="http://www.ncbi.nlm.nih.gov/gene/?term=' + temp[j] + '" target="_blank">' + temp[j] + '</a>'
							if (j < temp.length-1) htmlstr += ', '
						}
						htmlstr += '</td></tr>'
						htmlstr += '<tr><td style="text-align:right">OMIMID:</td><td>'
						var temp = data[i].OMIMID.split(', ')
						for (var j=0; j<temp.length; j++) {
							htmlstr += '<a href="http://www.omim.org/entry/' + temp[j] + '" target="_blank">' + temp[j] + '</a>'
							if (j < temp.length-1) htmlstr += ', '
						}
						htmlstr += '</td></tr>'
						htmlstr += '<tr><td style="text-align:right">PMID:</td><td>'
						var temp = data[i].PMID.split(', ')
						for (var j=0; j<temp.length; j++) {
							htmlstr += '<a href="http://www.ncbi.nlm.nih.gov/pubmed/?term=' + temp[j] + '" target="_blank">' + temp[j] + '</a>'
							if (j < temp.length-1) htmlstr += ', '
						}
						htmlstr += '</td></tr>'
						htmlstr += '</table></td></tr>'
						htmlstr += '<tr><td colspan=2><hr style="width:96%;height:1px;align:center;border:0 none;color:#eee;background-color:#eee" /></td></tr>'

						match_count++
					}
				}
				$("#matching_number_box").html('# of Matching: '+match_count)
				return htmlstr
			}
			$("#idValue").on('input', function() {
				//if ($(this).val() != '') {
					var url = '/Genes/'
					if ($("#idType").val() == 'HGNCSymbol+Synonyms' && /^\w{3}/.test($(this).val())) url += 'Hgncsymbol/' + $(this).val()
					if (url != '/Genes/') {
						var htmlstr = ''
						$.get(url, function(gdata) {
							if (gdata) {
								data = gdata
								htmlstr = set_htmlstr()
								$("#status_filter").css('display', 'block')
								$("#locusgroup_filter").css('display', 'block')
							}
							else htmlstr += '<tr><td>No db data matching.</td></tr>'
							$("#gene_data_box").css({'display':'block', 'overflow':'auto'})
							$("#gene_data_table").html(htmlstr).css('width', '99%')

						})
					}
					else {
						$("#gene_data_table").html('')
						$("#gene_data_box").css('display', 'none')
					}
			})

			$(".data_filter").on('change', function() {
				var htmlstr = set_htmlstr()
				$("#gene_data_box").css({'display':'block', 'overflow':'auto'})
				$("#gene_data_table").html(htmlstr).css('width', '99%')
			})

			var orig_color
			$("#gene_data_table")
			.on('mouseover', 'tr.gene_lane', function() {
				orig_color = $(this).css('background-color')
				$(this).css('background-color', '#cef')
			})
			.on('mouseout', 'tr.gene_lane', function() {
				$(this).css('background-color', orig_color)
			})
			.on('click', 'tr.gene_lane', function() {
				var obj = $(this)
				$("tr.gene_lane").each(function() {
					$(this).css('background-color', '#fff')
				})
				obj.css('background-color', '#ffa')
				orig_color = obj.css('background-color')

				$("#genesymbol").val($(this).find('a.symbol_td').text()).css('color', '#000')
				$.cookie('genesymbol', $(this).find('a.symbol_td').text(), { path: '/' })
			})
})

