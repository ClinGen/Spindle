// Jquery
$(document).ready(function() {

	$("#pairbox").css('display', 'block')
	$("#userinfo").css('display', 'block')
	$("#toplinks").css('display', 'none')

	function set_diseaseinput_width() {
		var w = $(window).width()
		var diseaseinput_width
		if (w > 1250) {
			diseaseinput_width = 650
			$("#ClinGen_Logo").css("display", "block")
		}
		else {
			diseaseinput_width = w - $("#loglink").width() - $("#genesymbol").width() - $("#enterbutton").width() - $("#userinfo").width() - 280
			$("#ClinGen_Logo").css("display", "none")
			//$("#ClinGen-Logo").css("opacity", "0.3")
		}
		$("#diseaseterm").css('width', diseaseinput_width+'px')
	}
	set_diseaseinput_width()
	$(window).resize(function() {
		set_diseaseinput_width()
	})

	$("#alltoplinks").click(function() {
								$("#toplinks").fadeToggle()
								$("#pwdwin").css("display","none")
								var t
								$("#toplinks").mouseenter(function() {
									clearTimeout(t)
									$(this).css('display','block')
									//$(this).css('background-color','#eee')
									$(this).css('opacity','1')
								})
								function gone() {
									$("#toplinks").css('display','none')
								}
								$("#toplinks").mouseleave(function() {
									//$(this).css("background-color","#ddd")
									$(this).css('opacity','1')
									t = setTimeout(gone, 750)
								})
	})

	$("#genesymbol")
	.on('focus', function() {
		$("#mainboard").css('position', 'fixed')
		$("#diseaselist").css("display", "none")
		var obj = $(this)
		if (obj.val() == 'Gene Symbol') {
			obj.css("color", "#000000")
			obj.val('')
		}
		else if (obj.val() != '') {
			var url = '/Curations/Symbol/' + obj.val()
			$.get(url, function(data, status) {
				if (status === 'success') {
					var htmlstr = ''
					for ( var i in data ) { //<li style="height:32px;font-size;12px;list-style:none">
						htmlstr += '<a href="#" onclick="passsymbol(this)" style="text-decoration:none">' + data[i] + '</a><br /><br />'
					}
					$("#genelist").html(htmlstr)
					$("#genelist").css("display","block")
					$("#maincontent").css('position','fixed')
				}
			})
		}
	})
	.on('input',function() {
		$("#diseaselist").css("display", "none")
		var obj = $(this)
		if (obj.val() == '') {
			$("#genelist").css("display","none")
			//$("#genesymbol").css('color', '#bbb').val('Gene Symbol')
		}
		else {
			var url = '/Curations/Symbol/' + obj.val()
			$.get(url, function(data, status) {
				if (status === 'success') {
					var htmlstr = ''
					for ( var i in data ) {
						htmlstr += '<a href="#" onclick="passsymbol(this)" style="text-decoration:none">' + data[i] + '</a></br /><br />'
					}
					//htmlstr += ''
					if (htmlstr != '') {
						$("#genelist").html(htmlstr)
						$("#genelist").css("display","block")
						$("#maincontent").css('position','fixed')
					}
				}
			});
		}
	})
	.on('blur', function() {
		if ($(this).val() == '') $(this).val('Gene Symbol').css('color', '#bbb')
	});

	$("#diseaseterm")
	.on('focus', function() {
		$("#mainboard").css('position', 'fixed')
		$("#genelist").css('display', 'none')
		var obj = $(this)
		if (obj.val() == 'Disease Keyword') {
			obj.css("color", "#000000")
			obj.val('')
		}
		else if (obj.val() != '') {
			var url = '/Curations/Term/' + obj.val().replace(/(^\')|(^\")|(\'$)|(\"$)/g, '')
			$.get(url, function(data, status) {
				if (status === 'success') {
					var htmlstr = ''
					for ( var i in data.term ) {
						//htmlstr += '<li style="height:18px;font-size;12px;list-style:none">';
						htmlstr += '<a href="#" onclick="passterm(this)" style="text-decoration:none" title="'
						htmlstr +=  data.ordoid[i] + '">' + data.term[i] + '</a><br /><br />'
					}
					if (htmlstr != ''){
						$("#diseaselist").html(htmlstr)
						$("#diseaselist").css("display","block")
						$("#maincontent").css('position','fixed')
					}
				}
			})
		}
	})
	.on('input', function() {
		$("#genelist").css("display", "none")
		var obj = $(this)
		if (obj.val() == '') {
			$("#diseaselist").css("display","none")
		}
		else {
			var url = '/Curations/Term/' + obj.val().replace(/(^\')|(^\")|(\'$)|(\"$)/g, '')
			$.get(url, function(data, status) {
				if (status === 'success') {
					var htmlstr = ''
					for ( var i in data.term ) {
						htmlstr += '<a href="#" onclick="passterm(this)" style="text-decoration:none">' + data.term[i] + ' -- Orphanet ID: ' + data.ordoid[i] + '</a><br /><br />'
					}
					$("#diseaselist").html(htmlstr)
					$("#diseaselist").css("display","block")
					$("#maincontent").css('position','fixed')
				}
			})
		}
	})
	.on('blur', function() {
		if ($(this).val() == '') $(this).val('Disease Term').css('color', '#bbb')
	});

	var g, d
	function gone() {
		$("#genelist").css('display','none')
	}
	$("#genelist").mouseenter(function() {
		clearTimeout(g)
	})
	$("#genelist").mouseleave(function() {
		g = setTimeout(gone, 1000)
		$("#maincontent").css('position','absolute')
	})
	function done() {
		$("#diseaselist").css('display','none')
	}
	$("#diseaselist").mouseenter(function() {
		clearTimeout(d)
	})
	$("#diseaselist").mouseleave(function() {
		d = setTimeout(done, 1000)
		$("#maincontent").css('position','absolute')
	})
})
