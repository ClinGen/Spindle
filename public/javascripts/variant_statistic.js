$(function() {
				var w = $(window).width() - 140
				var h = $(window).height() - 230
				$("#diagram_control_box").attr('width', w)
				$("#statistic_diagram").attr('width', w).attr('height', h)
				var ctx = $('#statistic_diagram')[0].getContext("2d")
				var top_margin = 50
				var bottom_margin = 70
				var ori_x = 20
				var ori_y = h-top_margin
				var x_interval = Math.round((w - ori_x - 50)/24)
				var y_axis_length = h-top_margin-bottom_margin
				var dot_top_margin = 100
				var dot_bottom_margin = 50
				var dot_y_range = h - top_margin - dot_top_margin - bottom_margin
				var color = ["#ee3333", "#00aa00", "#6633ff", "#aa9933", "#cc66dd", "#00aaee"]
				var radius = 10

				//ClinVar RCV IDs (April data) grouped and counted by Chr
				var variant_count = [10564, 13366, 7815, 4253, 7160, 4782, 7894, 4560, 5020, 5261, 9336, 7031, 8825, 4178, 4060, 7243, 10584, 2153, 5177, 2192, 1536, 9316, 3456]
				var max = Math.max.apply(null, variant_count)
				//ClilnVar pathogenic RCV grouped and counted by Chr
				var pathogenic_count = [2562, 2918, 2721, 843, 1431, 867, 1845, 919, 1113, 999, 2536, 1533, 1987, 918, 1169, 1229, 2989, 612, 1170, 585, 377, 3825, 93]

				//HGNC Locus types
				var locus_type_orig = ['gene with protein product', 'RNA, long non-coding', 'withdrawn', 'pseudogene', 'virus integration site', 'readthrough', 'phenotype only', 'unknown',
						'region', 'RNA, pseudogene', 'endogenous retrovirus', 'fragile site', 'immunoglobulin gene', 'immunoglobulin pseudogene', 'transposable element', 'RNA, micro',
						'RNA, ribosomal', 'RNA, transfer', 'complex locus constituent', 'protocadherin', 'RNA, cluster', 'RNA, misc', 'RNA, small nuclear', 'RNA, small cytoplasmic',
						'RNA, small nucleolar', 'RNA, Y', 'T cell receptor gene', 'T cell receptor pseudogene', 'RNA, vault']
				//ClinVar RCV grouped and counted by HGNC Locus type
				var clinvar_gene_locustype_count_orig = [18713, 2041, 0, 	136, 0, 109, 0, 	147, 1, 47, 	9, 0, 	183, 1, 	0, 1804, 19, 421, 26, 38, 2, 	3, 59, 3, 410, 4, 191, 0, 4]
				//ClinVar pathogenic RCV grouped and counted by HGNC Locus type
				var clinvar_gene_pathogenic_locustype = [18345, 1985, 0, 	133, 0, 106, 0, 	144, 1, 46, 	9, 0, 	183, 1, 	0, 1776, 19, 417, 26, 38, 2, 	3, 59, 3, 405, 4, 191, 0, 4]
				//HGNC gene grouped and counted by Locus type
				var hgnc_gene_locustype = 				[19013, 2711, 4280, 8848, 8, 115, 598, 307, 44, 3475, 	97, 117, 228, 202, 4,	1879, 39, 637, 27, 39, 124, 3, 65, 3, 458, 4, 208, 35, 4]

				var gene_max = Math.max.apply(null, clinvar_gene_locustype_count_orig)
				var gene_y_range = 637

				function set_basic(x_axis_itme) {
					//the Title and Axies
					ctx.fillStyle = '#000000'
					ctx.font = '22px Arial'
					ctx.beginPath()
					if (x_axis_itme == 'variant_chromosom') ctx.fillText('Variant Distribution vs Chromosomes', 100, top_margin)
					/*else if (x_axis_itme == 'gene_locustype') {
						var temp = 0
						for (var  i=0; i<clinvar_gene_locustype_count.length; i++) {
							temp += clinvar_gene_locustype_count[i]
						}
						ctx.fillText('ClinVar Gene ('+temp+') Distribution vs HGNC Locus Type ('+locus_type.length+')', 100, top_margin)
					}*/
					ctx.rect(ori_x+20, h-bottom_margin, 23*x_interval+ori_x, 4)
					ctx.closePath()
					ctx.fill()

					if (x_axis_itme == 'variant_chromosom') {
						var grid_w = w - ori_x - 500
						ctx.fillStyle = "#eee"
						ctx.beginPath()
						ctx.fillRect(grid_w, 35+top_margin, 350, 50)
						ctx.closePath()
						ctx.fill()

						ctx.font = '14px Arial'
						ctx.fillStyle = "#000"
						ctx.beginPath()
						ctx.fillText('All', grid_w+40, 65+top_margin)
						ctx.fillText('Pathogenic', grid_w+110, 65+top_margin)
						ctx.fillText('% of Patho / All', grid_w+230, 65+top_margin)
						ctx.closePath()
						ctx.fill()

						ctx.fillStyle = color[0]
						ctx.beginPath()
						ctx.fillRect(grid_w+20, 50+top_margin, 10, 20)
						//ctx.arc(w-270, 60+top_margin, radius, 0, Math.PI*2, true)
						ctx.closePath()
						ctx.fill()

						ctx.strokeStyle = color[0]
						ctx.lineWidth = 3
						ctx.beginPath()
						ctx.strokeRect(grid_w+90, 50+top_margin, 10, 20)
						ctx.closePath()
						ctx.stroke()

						/*ctx.lineWidth = 1
						ctx.strokeStyle = "#999"
						ctx.beginPath()
						ctx.strokeRect(w-400, 35+top_margin, 350, 50)
						ctx.closePath()
						ctx.stroke()*/

						ctx.lineWidth = 1
						ctx.strokeStyle = "#666"
						ctx.beginPath()
						ctx.moveTo(grid_w+200, 65+top_margin)
						ctx.lineTo(grid_w+210, 55+top_margin)
						ctx.moveTo(grid_w+210, 55+top_margin)
						ctx.lineTo(grid_w+220, 65+top_margin)
						ctx.closePath()
						ctx.stroke()

						/*ctx.font = '40px Arial'
						ctx.fillStyle = '#000'
						ctx.beginPath()
						ctx.fillText('*', w-148, 83+top_margin)
						ctx.closePath()
						ctx.fill()*/

						for (var i=1; i<=23; i++) {
							var chr_str
							if (i == 22) chr_str = 'X'
							else if (i == 23) chr_str = 'Y'
							else chr_str = i + ''
							ctx.font = '18px Arial'
							ctx.fillStyle = color[(i-1)%color.length]
							ctx.beginPath()
							ctx.fillText(chr_str, ori_x+x_interval*i, h-bottom_margin+20)
							ctx.closePath()
							ctx.fill()
						}
					}
					/*else if (x_axis_itme == 'gene_locustype') {
						for (var i=0; i<clinvar_gene_locustype_count.length; i++) {

						}
					}*/
				}

				function draw_gene_locustype() {
					var bottom_margin = 100, top_margin = 30, dot_top_margin = 0
					var x_interval = Math.round((w - ori_x - 50)/(clinvar_gene_locustype_count_orig.length+1))
					var y_highdot_range = Math.round((h - top_margin - dot_top_margin - bottom_margin)/3)
					var y_most_range = h - top_margin - dot_top_margin - y_highdot_range - 50 - bottom_margin //Math.round((h - top_margin - dot_top_margin - bottom_margin - 100)*2/3)

					var gene_sum = 0
					var patho_sum = 0
					var hgnc_sum = 0
					for (var  i=0; i<clinvar_gene_locustype_count_orig.length; i++) {
							gene_sum += clinvar_gene_locustype_count_orig[i]
							patho_sum += clinvar_gene_pathogenic_locustype[i]
							hgnc_sum += hgnc_gene_locustype[i]
					}

					for (var i=0; i<clinvar_gene_locustype_count_orig.length; i++) {
						ctx.fillStyle = color[i%color.length]
						ctx.font = '12px Arial'
						ctx.beginPath()
						var dot_y_start
						if (clinvar_gene_locustype_count_orig[i] <= gene_y_range) {
							dot_y_start = top_margin + dot_top_margin + y_highdot_range + 50 + Math.round(y_most_range*(1.0-clinvar_gene_locustype_count_orig[i]/gene_y_range))
						}
						else {
							dot_y_start = top_margin + dot_top_margin + Math.round(y_highdot_range * (1 - clinvar_gene_locustype_count_orig[i]/gene_max))
						}
						ctx.fillRect(ori_x+x_interval*(i+1)-radius, dot_y_start, radius, h-dot_y_start-bottom_margin)

						var number_spance = 12
						if (clinvar_gene_locustype_count_orig[i] < 10) number_spance = 0
						ctx.fillText(clinvar_gene_locustype_count_orig[i], ori_x+x_interval*(i+1), dot_y_start-5)
						ctx.fillText(clinvar_gene_pathogenic_locustype[i], ori_x+x_interval*(i+1)+radius+1, dot_y_start+number_spance)
						ctx.closePath()
						ctx.fill()

						/*ctx.fillStyle = "#000"
						if (clinvar_gene_pathogenic_locustype[i] <= gene_y_range) {
							dot_y_start = top_margin + dot_top_margin + y_highdot_range + 50 + Math.round(y_most_range*(1.0-clinvar_gene_pathogenic_locustype[i]/gene_y_range))
						}
						else {
							dot_y_start = top_margin + dot_top_margin + Math.round(y_highdot_range * (1 - clinvar_gene_pathogenic_locustype[i]/gene_max))
						}
						ctx.beginPath()
						if (clinvar_gene_pathogenic_locustype < 100) number_spance = 2
						else number_spance = 10
						ctx.fillText(clinvar_gene_pathogenic_locustype[i], ori_x+x_interval*(i+1)+number_spance, dot_y_start-5)
						ctx.closePath()
						ctx.fill()*/

						ctx.strokeStyle = color[i%color.length]
						ctx.lineWidth = 1
						ctx.beginPath()
						if (clinvar_gene_pathogenic_locustype[i] <= gene_y_range) {
							dot_y_start = top_margin + dot_top_margin + y_highdot_range + 50 + Math.round(y_most_range*(1.0-clinvar_gene_pathogenic_locustype[i]/gene_y_range))
						}
						else {
							dot_y_start = top_margin + dot_top_margin + Math.round(y_highdot_range * (1 - clinvar_gene_pathogenic_locustype[i]/gene_max))
						}
						ctx.strokeRect(ori_x+x_interval*(i+1), dot_y_start+1, radius, h-dot_y_start-bottom_margin)
						//ctx.strokeRect(ori_x+x_interval*i+10, dot_y_start, 10, h-dot_y_start-bottom_margin)
						ctx.closePath()
						ctx.stroke()


						/*if (hgnc_gene_locustype[i] < 10) number_spance = 10
						else if (hgnc_gene_locustype[i] < 100) number_spance = 15
						else if (hgnc_gene_locustype[i] < 1000) number_spance = 20
						else if (hgnc_gene_locustype[i] < 10000) number_spance = 25
						else number_spance = 30*/
						ctx.fillStyle = "#999"
						ctx.beginPath()
						if (hgnc_gene_locustype[i] <= gene_y_range) {
							dot_y_start = top_margin + dot_top_margin + y_highdot_range + 50 + Math.round(y_most_range*(1.0-hgnc_gene_locustype[i]/gene_y_range))
						}
						else {
							dot_y_start = top_margin + dot_top_margin + Math.round(y_highdot_range * (1 - hgnc_gene_locustype[i]/gene_max))
						}
						ctx.fillRect(ori_x+x_interval*(i+1)-radius-5, dot_y_start, 5, h-dot_y_start-bottom_margin)
						//ctx.fillText(hgnc_gene_locustype[i], ori_x+x_interval*(i+1)-radius-number_spance, dot_y_start-5)
						ctx.closePath()
						ctx.fill()

					}

					ctx.lineWidth = 4
					ctx.strokeStyle = '#fff'
					ctx.beginPath()
					ctx.moveTo(ori_x, top_margin+dot_top_margin+y_highdot_range+20)
					ctx.lineTo(w-ori_x, top_margin+dot_top_margin+y_highdot_range+20)
					ctx.moveTo(ori_x, top_margin+dot_top_margin+y_highdot_range-80)
					ctx.lineTo(w-ori_x, top_margin+dot_top_margin+y_highdot_range-80)
					ctx.moveTo(ori_x, top_margin+dot_top_margin+y_highdot_range-160)
					ctx.lineTo(w-ori_x, top_margin+dot_top_margin+y_highdot_range-160)
					ctx.closePath()
					ctx.stroke()

					ctx.fillStyle = '#000000'
					ctx.font = '22px Arial'
					ctx.beginPath()
					ctx.fillText('ClinVar Gene (All '+gene_sum+' / Pathogenic '+patho_sum+') Distribution vs HGNC Locus Type ('+locus_type_orig.length+') -- HGNC Total ('+hgnc_sum+')', 250, top_margin+10)
					ctx.closePath()
					ctx.fill()

					ctx.lineWidth = 1
					ctx.strokeStyle = '#000'
					ctx.beginPath()
					ctx.moveTo(ori_x, h-bottom_margin+1)
					ctx.lineTo(ori_x+x_interval*(clinvar_gene_locustype_count_orig.length+1), h-bottom_margin+1)
					ctx.closePath()
					ctx.stroke()

					ctx.font = '10px Arial'
					for (var i=0; i<clinvar_gene_locustype_count_orig.length; i++) {
						ctx.translate(ori_x+x_interval*(i+1), h-bottom_margin+10)
						ctx.rotate(Math.PI/2)
						ctx.fillStyle = color[(i)%color.length]
						ctx.beginPath()
						ctx.fillText(locus_type_orig[i], 0, 0)
						ctx.rotate(Math.PI*3/2)
						ctx.translate(-(ori_x+x_interval*(i+1)), -(h-bottom_margin+10))
						ctx.closePath()
						ctx.fill()

						var number_spance
						var dot_y_start
						if (hgnc_gene_locustype[i] < 10) number_spance = 10
						else if (hgnc_gene_locustype[i] < 100) number_spance = 15
						else if (hgnc_gene_locustype[i] < 1000) number_spance = 20
						else if (hgnc_gene_locustype[i] < 10000) number_spance = 25
						else number_spance = 30
						if (hgnc_gene_locustype[i] <= gene_y_range) {
							dot_y_start = top_margin + dot_top_margin + y_highdot_range + 50 + Math.round(y_most_range*(1.0-hgnc_gene_locustype[i]/gene_y_range))
						}
						else {
							dot_y_start = top_margin + dot_top_margin + Math.round(y_highdot_range * (1 - hgnc_gene_locustype[i]/gene_max))
						}
						ctx.fillStyle = "#999"
						ctx.beginPath()
						ctx.fillText(hgnc_gene_locustype[i], ori_x+x_interval*(i+1)-radius-number_spance, dot_y_start-5)
						ctx.closePath()
						ctx.fill()
					}

					var grid_w = w - ori_x - 550
					ctx.fillStyle = "#eee"
					ctx.beginPath()
					ctx.fillRect(grid_w, 35+top_margin, 500, 50)
					ctx.closePath()
					ctx.fill()

					ctx.font = '14px Arial'
					ctx.fillStyle = "#000"
					ctx.beginPath()
					ctx.fillText('HGNC Gene', grid_w+30, 65+top_margin)
					ctx.fillText('ClinVar All-Type Gene', grid_w+145, 65+top_margin)
					ctx.fillText('ClinVar Pathogenic Gene', grid_w+320, 65+top_margin)
					ctx.closePath()
					ctx.fill()

					ctx.fillStyle = "#999"
					ctx.beginPath()
					ctx.fillRect(grid_w+20, 50+top_margin, 5, 20)
					ctx.closePath()
					ctx.fill()

					ctx.fillStyle = color[0]
					ctx.beginPath()
					ctx.fillRect(grid_w+130, 50+top_margin, 10, 20)
					//ctx.arc(w-270, 60+top_margin, radius, 0, Math.PI*2, true)
					ctx.closePath()
					ctx.fill()

					ctx.strokeStyle = color[0]
					ctx.lineWidth = 1
					ctx.beginPath()
					ctx.strokeRect(grid_w+305, 50+top_margin, 10, 20)
					ctx.closePath()
					ctx.stroke()


				}

				function set_pathogenic() {
						for (var i=1; i<=23; i++) {
							var dot_y_start = top_margin + dot_top_margin + Math.round(dot_y_range*(1.0-pathogenic_count[i-1]/max))
							ctx.fillStyle = "#000000"
							ctx.font = '11px Arial'
							ctx.beginPath()
							ctx.fillText(pathogenic_count[i-1], ori_x+x_interval*i+15, dot_y_start-5)
							ctx.closePath()
							ctx.fill()

							ctx.lineWidth = 3
							ctx.beginPath()
							ctx.strokeStyle = color[(i-1)%color.length]
							ctx.strokeRect(ori_x+x_interval*i+10, dot_y_start, 10, h-dot_y_start-bottom_margin)
							//ctx.arc(ori_x+radius+x_interval*i, dot_y_start, radius-1, 0, Math.PI*2, true)
							ctx.closePath()
							ctx.stroke()
						}
				}

				function set_total() {
						for (var i=1; i<=23; i++) {
							var dot_y_start = top_margin + dot_top_margin + Math.round(dot_y_range*(1.0-variant_count[i-1]/max))
							ctx.fillStyle = "#000000"
							ctx.font = '11px Arial'
							ctx.beginPath()
							ctx.fillText(variant_count[i-1], ori_x+x_interval*i+5, dot_y_start-5)
							ctx.closePath()
							ctx.fill()

							ctx.beginPath()
							ctx.fillStyle = color[(i-1)%color.length]
							ctx.fillRect(ori_x+radius+x_interval*i-10, dot_y_start, 10, h-dot_y_start-bottom_margin)
							//ctx.arc(ori_x+radius+x_interval*i, dot_y_start, radius, 0, Math.PI*2, true)
							ctx.closePath()
							ctx.fill()
						}
				}

				function draw_ratio() {
					var last_pont = []
					for (var i=1; i<=23; i++) {
						var dot_y_start = top_margin + dot_top_margin + Math.round(dot_y_range*(1-pathogenic_count[i-1]/variant_count[i-1]))
						if (i>1) {
							ctx.lineWidth = 1
							ctx.strokeStyle = '#999'
							ctx.beginPath()
							ctx.moveTo(last_point[0], last_point[1])
							ctx.lineTo(ori_x+x_interval*i+12, dot_y_start)
							ctx.closePath()
							ctx.stroke()
						}
						last_point = [ori_x+x_interval*i+12, dot_y_start]
					}

					ctx.lineWidth = 2
					ctx.strokeStyle = '#000'
					ctx.beginPath()
					ctx.moveTo(w-60, top_margin+dot_top_margin)
					ctx.lineTo(w-40, top_margin+dot_top_margin)
					ctx.moveTo(w-60, top_margin+dot_top_margin+dot_y_range)
					ctx.lineTo(w-40, top_margin+dot_top_margin+dot_y_range)
					ctx.closePath()
					ctx.stroke()

					var y_interval = dot_y_range/20
					ctx.lineWidth = 1
					ctx.beginPath()
					ctx.moveTo(w-55, top_margin+dot_top_margin+dot_y_range/2)
					ctx.lineTo(w-40, top_margin+dot_top_margin+dot_y_range/2)
					ctx.moveTo(w-55, top_margin+dot_top_margin+dot_y_range/4)
					ctx.lineTo(w-40, top_margin+dot_top_margin+dot_y_range/4)
					ctx.moveTo(w-55, top_margin+dot_top_margin+dot_y_range*3/4)
					ctx.lineTo(w-40, top_margin+dot_top_margin+dot_y_range*3/4)
					for (i=1; i<20; i++) {
						if (i%5 != 0) {
							ctx.moveTo(w-45, top_margin+dot_top_margin+y_interval*i)
							ctx.lineTo(w-40, top_margin+dot_top_margin+y_interval*i)
						}
					}
					ctx.closePath()
					ctx.stroke()

					ctx.fillStyle = "#000000"
					ctx.font = '11px Arial'
					ctx.beginPath()
					ctx.fillText('100%', w-95, top_margin+dot_top_margin+3)
					ctx.closePath()
					ctx.fill()
				}

				function filter_variant_distribution() {
					ctx.clearRect(0, 0, w, h)
					if ($("#filter_selection").val() == 'Both') {
						set_pathogenic()
						set_total()
						draw_ratio()
					}
					else if ($("#filter_selection").val() == 'Overall') set_total()
					else if ($("#filter_selection").val() == 'Pathogenic') set_pathogenic()
					set_basic('variant_chromosom')
					$("#filter_selection").css('display', 'block')
				}
				$("#statiscic_link").on('click', function() {
					$("#variant_result_titles").css('display', 'none')
					$("#variant_all_content_box").css('display', 'none')
					$("#associate_box").css('display', 'none')
					$("#statistic_diagram_box").fadeToggle()
					filter_variant_distribution()
					//$("#gene_distribution_link").css('display', 'block')
					//$("#variant_distribution").css('display', 'none')
					//$("#filter_selection").css('display', 'block')
				})

				$("#filter_selection").on('change', function() {
					filter_variant_distribution()
					/*ctx.clearRect(0, 0, w, h)
					if ($("#filter_selection").val() == 'Both') {
						set_pathogenic()
						set_total()
						draw_ratio()
					}
					else if ($("#filter_selection").val() == 'Overall') set_total()
					else if ($("#filter_selection").val() == 'Pathogenic') set_pathogenic()
					set_basic('variant_chromosom')
					$("#gene_distribution_link").css('display', 'block')
					$("#variant_distribution").css('display', 'none')
					$("#filter_selection").css('display', 'block')*/
				})

				$("#gene_distribution_link").on('click', function() {
					ctx.clearRect(0, 0, w, h)
					draw_gene_locustype()
					//set_basic('gene_locustype')
					//$(this).css('display', 'none')
					//$("#variant_distribution").css('display', 'block')
					$("#filter_selection").css('display', 'none')
				})

				$("#variant_distribution_link").on('click', function() {
					filter_variant_distribution()
				})
})
