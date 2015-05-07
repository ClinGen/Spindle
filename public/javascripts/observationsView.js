// Jquery
$(document).ready(function() {
	$(".obsvtnstudy").click(function() {
		var x = $(this).offset().top;
		var y = $(this).offset().left;
		$("#obsvtnwin").offset({top:x, left:y});
		if ($(this).text() == 'Case Studies') {

		}
		else if ($(this).text() == 'Case Control Studies') {

		}
		else if ($(this).text() == 'Functional Data Analysis') {

		}
	});
});
