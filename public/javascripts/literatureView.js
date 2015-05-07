// Jquery
$(function() {
	$("#litdataform").submit(function() {
				//alert('On submit.');
				var no_err = true
				$("input..numeric").each(function() {
					if ($(this).val() != '' && !$.isNumeric($(this).val())) {
						alert('Please enter positive intiger.')
						$(this).focus()
						no_err = false
					}
				})

				var pttn = /^\d+\d\/\d\d\/\d\d\d\d$/
				if ($("input.date").val() != '' && !pttn.test($("input.date").val())) {
					alert('Plese enter a date with format DD/MM/YYYY')
					$("input.date").focus()
					no_err = false
				}
				return no_err
				/*var noempty = false
				$("#litdataform").("input:text").each(function() {
					if ($(this).val != '') {
						noempty = true
						alert('Find a data.')
					}
				})
				if (!noempty && $("#completetime").val() != '') {
					noempty = true
					alert('one selected.')
				}
				return false
				*/
/*
				var dateReg = /^\d\d\/\d\d\/\d\d\d\d$/;
				var paramReg = /'^\w+$/;
				var numberReg = /'^\d+$/;

				if ($("#dateliterature").val() != '' && dateReg.test($("#dateliterature").val()) == false) {
					alert('Date must match format DD/MM/YYYY.');
					$("#dateliterature").focus();
					condition =  false;
				}
				else if ($("#searchparamters").val() != '' && !paramReg.test($("#searchparamters").val())) {
					alert('Please enter a HGNC gene symbol without quotation mark.');
					$("#searchparamters").focus();
					condition =  false;
				}
				else if ($("#returnnumber").val() != '' && !numberReg.test($("#returnnumber").val())) {
					alert('Must enter a positive integer.');
					$("#returnnumber").focus();
					condition =  false;
				}
				else if ($("#releventnumber").val() != '' && !numberReg.test($("#releventnumber").val())) {
					alert('Must enter a positive integer.');
					$("#releventnumber").focus();
					condition =  false;
				}
				else if ($("#clinicalreportnumber").val() != '' && !numberReg.test($("#clinicalreportnumber").val())) {
					alert('Must enter a positive integer.');
					$("#clinicalreportnumber").focus();
					condition =  false;
				}
				else if () {
					alert('Must enter data for editing.')
					condition = false;
				}
				return condition;
*/
	})
})
