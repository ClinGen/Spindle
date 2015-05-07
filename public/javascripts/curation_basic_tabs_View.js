//$(document).ready(function() {
$(window).load(function() {
	var h = $(window).height() - 140 - $("#curation_basic_data").height()
	var w = $(window).width() - 60
	$("#curation_content_box").css('height', h)
	$("#curation_content_box").css('width', w)
	$("#tab_table").css('width', w+2)

	$(window).resize(function() {
						var h = $(window).height() - 150 - $("#curation_basic_data").height()
						var w = $(window).width() - 60
						$("#curation_content_box").css('height', h)
						$("#curation_content_box").css('width', w)
						$("#tab_table").css('width', w+4)
	})

	function tab_clicked(the_tab) {
						$("td.tab").each(function() {
							if ($(this).text() == 'Case Group' || $(this).text() == 'Case Control' || $(this).text() == 'Summary' || $(this).text() == 'Assertions')
								$(this).css({'color':'#efefef', 'background':'#666', 'border-bottom':'solid #666 1px'})
							else $(this).css({'color':'#efefef', 'background':'#048', 'border-bottom':'solid #408 1px'})
							$(this).css({'font-size':'10px', 'font-weight':'normal'})
						})
						$("div.tab_content").each(function() {
							$(this).css('display', 'none')
							if (the_tab.text() == 'History') $("#history_box").css('display', 'block')
							else if (the_tab.text() == 'Literature') $("#literature_box").css('display', 'block')
							//else if (the_tab.text() == 'Case Group') $("#casegroup_box").css('display', 'block')
							else if (the_tab.text() == 'Functional') $("#functionaldata_box").css('display', 'block')
							else $("#on_construction_box").css('display', 'block')
						})
						the_tab.css({'color':'#000', 'background':'#efefef', 'border-top':'solid #048 1px', 'border-bottom':'solid #efefef 1px'})
						the_tab.css({'border-left':'solid #048 1px', 'border-right':'solid #048 1px','font-size':'12px', 'font-weight':'bold'})
	}

					var target_tab = $("#target_tab").val()
					if (target_tab == 'History') tab_clicked($("#history_tab"))
					else if (target_tab == 'Literature') tab_clicked($("#literature_tab"))
					else if (target_tab == 'Casegroup') tab_clicked($("#casegroup_tab"))
					else if (target_tab == 'Functional') tab_clicked($("#functional_tab"))

					$("td.tab").on('click', function() {
						tab_clicked($(this))
					})
					$("#history_link").click(function() {
						tab_clicked($("#history_tab"))
					})
					$("#literature_link").click(function() {
						tab_clicked($("#literature_tab"))
					})

					$("a.link_to_tab").on('click', function() {
						if ($(this).text().indexOf('Literature') > -1) tab_clicked($("#literature_tab"))
						else if ($(this).text().indexOf('Functional') > -1) tab_clicked($("#functional_tab"))
					})
	$("a.links_in_history").on('click', function() {
		//alert($(this).text())
		if ($(this).text().indexOf('Literature') > -1) tab_clicked($("#literature_tab"))
		else if ($(this).text().indexOf('Functional') > -1) tab_clicked($("#functional_tab"))
	})
})
/*
$(document).ready(function() {
					var h = $(window).height() - 140 - $("#curation_basic_data").height()
					var w = $(window).width() - 60
					$("#curation_content_box").css('height', h)
					$("#curation_content_box").css('width', w)
					$("#tab_table").css('width', w+2)

					$(window).resize(function() {
						var h = $(window).height() - 150 - $("#curation_basic_data").height()
						var w = $(window).width() - 60
						$("#curation_content_box").css('height', h)
						$("#curation_content_box").css('width', w)
						$("#tab_table").css('width', w+4)
					})

					function tab_clicked(the_tab) {
						$("td.tab").each(function() {
							if ($(this).text() == 'Case Control' || $(this).text() == 'Summary' || $(this).text() == 'Assertions')
								$(this).css({'color':'#efefef', 'background':'#666', 'border-bottom':'solid #666 1px'})
							else $(this).css({'color':'#efefef', 'background':'#048', 'border-bottom':'solid #408 1px'})
							$(this).css({'font-size':'10px', 'font-weight':'normal'})
						})
						$("div.tab_content").each(function() {
							$(this).css('display', 'none')
							if (the_tab.text() == 'History') $("#history_box").css('display', 'block')
							else if (the_tab.text() == 'Literature') $("#literature_box").css('display', 'block')
							else if (the_tab.text() == 'Case Group') $("#casegroup_box").css('display', 'block')
							else if (the_tab.text() == 'Functional') $("#functionaldata_box").css('display', 'block')
							else $("#on_construction_box").css('display', 'block')
						})
						the_tab.css({'color':'#000', 'background':'#efefef', 'border-top':'solid #048 1px', 'border-bottom':'solid #efefef 1px'})
						the_tab.css({'border-left':'solid #048 1px', 'border-right':'solid #048 1px','font-size':'12px', 'font-weight':'bold'})
					}

					var target_tab = $("#target_tab").val()
					if (target_tab == 'History') tab_clicked($("#history_tab"))
					else if (target_tab == 'Literature') tab_clicked($("#literature_tab"))
					else if (target_tab == 'Casegroup') tab_clicked($("#casegroup_tab"))
					else if (target_tab == 'Functional') tab_clicked($("#functional_tab"))

					$("td.tab").on('click', function() {
						tab_clicked($(this))
					})
					$("#history_link").click(function() {
						tab_clicked($("#history_tab"))
					})
					$("#literature_link").click(function() {
						tab_clicked($("#literature_tab"))
					})

					$("a.link_to_tab").on('click', function() {
						if ($(this).text().indexOf('Literature') > -1) tab_clicked($("#literature_tab"))
						else if ($(this).text().indexOf('Functional') > -1) tab_clicked($("#functional_tab"))
					})
	$("a.links_in_history").on('click', function() {
		//alert($(this).text())
		if ($(this).text().indexOf('Literature') > -1) tab_clicked($("#literature_tab"))
		else if ($(this).text().indexOf('Functional') > -1) tab_clicked($("#functional_tab"))
	})
})*/
