// Jquery
$(document).ready(function() {
	$("#curations_link").css("text-decoration", "none");
	$("#toplinks").css('display', 'block');
	//$("$userinfo").css("display", "block");
	//$("#summarydataboard").css("height", "40px");

	$("#genesymbol")
	.on('focus', function() {
		$("#diseaselist").css("display", "none");
		var obj = $(this);
		if (obj.val() == 'Gene Symbol') {
			obj.css("color", "#000000");
			obj.val('');
		}
		else if (obj.val() != '') {
			var url = '/Curations/Symbol/' + obj.val();
			$.get(url, function(data, status) {
				if (status === 'success') {
					var htmlstr = '';
					for ( var i in data ) { //<li style="height:32px;font-size;12px;list-style:none">
						htmlstr += '<a href="#" onclick="passsymbol(this)" style="text-decoration:none">' + data[i] + '</a><br /><br />';
					}
					$("#genelist").html(htmlstr);
					$("#genelist").css("display","block");
				}
			});
		}
	})
	.on('input',function() {
		$("#diseaselist").css("display", "none");
		var obj = $(this);
		if (obj.val() == '') {
			$("#genelist").css("display","none");
		}
		else {
			var url = '/Curations/Symbol/' + obj.val();
			$.get(url, function(data, status) {
				if (status === 'success') {
					var htmlstr = '';
					for ( var i in data ) {
						htmlstr += '<a href="#" onclick="passsymbol(this)" style="text-decoration:none">' + data[i] + '</a></br /><br />';
					}
					//htmlstr += ''
					if (htmlstr != '') {
						$("#genelist").html(htmlstr);
						$("#genelist").css("display","block");
					}
				}
			});
		}
/*	}).on('blur', function() {

		var obj = $(this);
		if (obj.val() == '') {
			obj.css("color", "#bbbbbb");
			obj.val('Gene Symbol');
		}*/
		//$("#genelist").css("display", "none");
	});

	$("#diseaseterm")
	.on('focus', function() {
		$("#genelist").css('display', 'none');
		var obj = $(this);
		if (obj.val() == 'Phenotype Term') {
			obj.css("color", "#000000");
			obj.val('');
		}
		else if (obj.val() != '') {
			var url = '/Curations/Term/' + obj.val().replace(/(^\')|(^\")|(\'$)|(\"$)/g, '');
			$.get(url, function(data, status) {
				if (status === 'success') {
					var htmlstr = '';
					for ( var i in data.term ) {
						//htmlstr += '<li style="height:18px;font-size;12px;list-style:none">';
						htmlstr += '<a href="#" onclick="passterm(this)" style="text-decoration:none" title="';
						htmlstr +=  data.ordoid[i] + '">' + data.term[i] + '</a><br /><br />';
					}
					if (htmlstr != ''){
						$("#diseaselist").html(htmlstr);
						$("#diseaselist").css("display","block");
					}
				}
			});
		}
	})
	.on('input',function() {
		$("#genelist").css("display", "none");
		var obj = $(this);
		if (obj.val() == '') {
			$("#diseaselist").css("display","none");
		}
		else {
			var url = '/Curations/Term/' + obj.val().replace(/(^\')|(^\")|(\'$)|(\"$)/g, '');
			$.get(url, function(data, status) {
				if (status === 'success') {
					var htmlstr = '';
					for ( var i in data.term ) {
						htmlstr += '<a href="#" onclick="passterm(this)" style="text-decoration:none">' + data.term[i] + ' -- ORDO ID: ' + data.ordoid[i] + '</a><br /><br />';
					}
					$("#diseaselist").html(htmlstr);
					$("#diseaselist").css("display","block");
				}
			});
		}
	});
/*	.on('blur', function() {

		var obj = $(this);
		if (obj.val() == '') {
			obj.css("color", "#bbbbbb");
			obj.val('Disease Term');
		}
		$("#diseaselist").css("display", "none");

	});*/
});
/*
	$("#propertyform").submit(function() {
		var str = 'Submit property data:\n';
		$.each($("#propertyform").input), function() {
			if ($(this).val() != '') str += $(this).val() + '\n';
		}
		alert( str );
	});
*/

